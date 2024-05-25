import json
from collections import Counter
from datetime import timedelta, datetime
from enum import Enum
from uuid import UUID

from django.db.models import QuerySet
from django.http import JsonResponse
from django.urls import resolve
from notifications.signals import notify
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.request import Request
from rest_framework.response import Response

from tournaments_app import constants
from tournaments_app.models import Tournaments, User, Match, Pool, Rounds, PlayerStats, Participants, TournamentAdmin
from tournaments_app.serializers import MatchSerializer, TournamentSerializer, PlayerStatisticsSerializer, \
    ParticipantsSerializer, RoundsSerializer, ConflictSerializer
from tournaments_app.utils import tournament_has_enough_participants


@api_view(['GET'])
def get_tournament_pool(request: Request, tournament_id: UUID) -> JsonResponse:
    participants = Participants.get_participants_by_tournament(tournament_id)
    serializer = ParticipantsSerializer(instance=participants, many=True)
    participants_json = serializer.data
    return JsonResponse(data=participants_json, safe=False)


@api_view(['POST'])
def create_tournament(request: Request):
    user: User = request.user
    if user.is_staff:
        # @TODOL: include organization id in the tournament, currently doesn't work
        serializer = TournamentSerializer(
            data={'name': request.data['name'],
                  'type': request.data['type'],
                  'start_time': request.data['start_time'],
                  'organization': request.data['organization_id']})

        serializer.is_valid(raise_exception=True)
        tur: Tournaments = serializer.save()
        tur.save()

        TournamentAdmin.objects.create(user=user, tournament=tur)

        bye = ParticipantsSerializer(data={
            'username': constants.BYE,
            'user': None,
            'checked_in': True,
            'tournament': tur.id,
            'game_username': constants.BYE
        })
        # does this save/send participant id?
        bye.is_valid(raise_exception=True)
        bye.save()

        return Response(data=serializer.data, status=status.HTTP_201_CREATED)
    else:
        return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(['PUT'])
def update_tournament(request: Request, tournament_id: UUID):
    user: User = request.user
    print("update_tournament")
    if user.is_staff:
        tournament = Tournaments.objects.get(id=tournament_id)

        # TODO: check if the user requesting update is an admin of the tournament
        # or the organizer of the organization the tournament belongs to
        # currently we only check if the user is an organizer of some organization
        # or admin of some tournament
        if "start_time" in request.data:
            tournament.start_time = request.data["start_time"]
        if "end_time" in request.data:
            tournament.end_time = request.data["end_time"]
        if "name" in request.data:
            tournament.name = request.data["name"]
        if "type" in request.data:
            tournament.type = request.data["type"]
        if "details" in request.data:
            tournament.details = request.data["details"]
        if "published" in request.data:
            tournament.published = request.data["published"]
        if "round_time_estimate" in request.data:
            tournament.round_time_estimate = request.data["round_time_estimate"]

        tournament.save()
        return Response(data=request.data, status=status.HTTP_200_OK)
    else:
        return Response(data={"message": "Request unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)


def change_tournament_state(tournament: Tournaments):
    tournament.is_ongoing = True
    tournament.start_time = datetime.now() - timedelta(hours=2)
    tournament.save()


@api_view(['POST'])
def start_round(request: Request, tournament_id: UUID):
    # End current round, then create a new round
    try:
        end_current_round(tournament_id)
        player_pool = Pool.objects.get(tournament=tournament_id)
        matches = player_pool.create_rounds()
        return Response(data={"message": f"{len(matches)} matches scheduled for the next round"})
    except Exception as e:
        print(e)
        return Response(data={"error": ""})


def validate_round_exists(tournament_id: UUID, round_num: int) -> bool:
    return Rounds.objects.get(tournament_id=tournament_id, round_num=round_num).exists()


def validate_matches_are_over(tournament: Tournaments, round_num: int) -> bool:
    matches = Match.objects.filter(rounds__round_num=round_num, rounds__tournament_id=tournament.id).values(
        "status", "participant_two__username", "participant_one__username")
    for match in matches:
        if match["status"] != Match.MatchStatus.FINISHED \
                and match["participant_two__username"] != constants.BYE \
                and match["participant_one__username"] != constants.BYE:
            return False
    return True


def has_conflict(results_one, results_two):
    results_one_parsed = json.loads(results_one)
    results_two_parsed = json.loads(results_two)

    is_single_match = "game_two" not in results_two_parsed
    if is_single_match:
        return results_one_parsed["game_one"] != results_two_parsed["game_one"]
    return results_one_parsed["game_one"] != results_two_parsed["game_one"] \
        or results_one_parsed["game_two"] != results_two_parsed["game_two"] \
        or results_one_parsed["game_three"] != results_two_parsed["game_three"]


@api_view(['POST'])
def report_match_result(request: Request, match_id: UUID) -> JsonResponse:
    """
    This is where we get the games result in a single match.
    we trust the user will submit the correct result for now and
    for the future a submitting mechanism
    should be added
    we get in the POST param `match_result` a JSON dict with each game numbered.
    and a value of p1 name or p2 if the game was won by the user or not.
    eg:
    match_result: {
        "game_one": raz
        "game_two": guy
        game_three": raz
    }
    TODO in react:
    to implement this you have to get both participant names in the state of the app

    """
    match = Match.get_by_id(match_id)
    is_user_allowed_to_submit = match.is_user_allowed_to_submit(request.user)

    if is_user_allowed_to_submit:
        user_match_result = request.data.get('match_result', {})
        match_status = match.status
        conflict = False
        if match.match_result:
            if has_conflict(match.match_result, user_match_result):
                match_status = 3  # Conflict, send notification
                conflict_serializer = ConflictSerializer(data={
                    "match": match.match_id
                })
                if conflict_serializer.is_valid():
                    conflict_serializer.save()
                else:
                    print("Conflict serialization failed")
                conflict = True
            else:
                match_status = 1  # Finished, resubmit not allowed.

        data = {'status': match_status}
        if request.user.username == match.participant_one.username:
            match.participant_one_submitted = True
        if request.user.username == match.participant_two.username:
            match.participant_two_submitted = True
        if not conflict:
            data.update({'match_result': user_match_result})
        else:
            data.update({'match_result': None})

        serializer = MatchSerializer(instance=match,
                                     data=data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            if conflict:
                return JsonResponse(data={"message": "submitted match result", "result": "conflict"})
            return JsonResponse(data={"message": "submitted match result", "result": user_match_result})
        return JsonResponse(data={"message": "Error while inserting match_result"})

    return JsonResponse(data={"message": "You are not allowed to submit."})


#
# Got AttributeError when attempting to get a value for field
# `round_num` on serializer `RoundsSerializer`.
# The serializer field might be named incorrectly and not match any attribute
# or key on the `QuerySet` instance.
# Original exception text was: 'QuerySet' object has no attribute 'round_num'.
@api_view(['GET'])
def get_rounds(request: Request, tournament_id: UUID):
    rounds = Rounds.get_rounds(tournament_id)
    if not Rounds or len(rounds) < 1:
        return Response(data={"error": f"Rounds not found for tournament {tournament_id}"})
    try:
        rounds = RoundsSerializer(instance=rounds, many=True)
        return Response(data=rounds.data)
    except Exception as e:
        return Response(data={"error": str(e)})


@api_view(['GET'])
def get_match(request: Request, match_id: UUID):
    match = Match.get_by_id(match_id)
    if match.is_bye_match():
        return Response(data={"message": "This is a bye match"})
    try:
        match = MatchSerializer(instance=match)
        return Response(data=match.data)
    except Exception as e:
        return Response(data={"message": "Match not found"})


@api_view(['GET'])
def get_max_rounds(request: Request, tournament_id: UUID):
    max_rounds = Tournaments.get_max_rounds(tournament_id)
    return Response(data=max_rounds)


@api_view(['GET'])
def get_match_result(request: Request, match_id: UUID) -> JsonResponse:
    """
    Returns the winner and loser of the match.
    """

    match = Match.get_by_id(match_id)
    match_result = match.get_match_result()
    return JsonResponse(
        data={'winner': max(Counter(match_result.values())), 'loser': min(Counter(match_result.values())),
              'result': Counter(match_result.values())})


def update_participant_score(participant: Participants, score: int) -> None:
    player_stats, created = PlayerStats.objects.update_or_create(participant=participant)
    player_stats.score += score
    player_stats.save()


def update_round_participants_score(round: Rounds):
    matches = Match.objects.filter(rounds=round)
    for match in matches:

        if match.participant_two.username == constants.BYE:
            update_participant_score(match.participant_one, 3)
        elif match.participant_one.username == constants.BYE:
            update_participant_score(match.participant_two, 3)
        elif match.winner:
            print(f"{match.participant_one.username} vs {match.participant_two.username} Winner: {match.winner}")
            if match.winner == match.participant_one.username:
                update_participant_score(match.participant_one, 3)
            else:
                update_participant_score(match.participant_two, 3)
        else:
            update_participant_score(match.participant_one, 1)
            update_participant_score(match.participant_two, 1)


def end_current_round(tournament_id: UUID, save=True):
    tournament = Tournaments.objects.filter(id=tournament_id).first()
    curr_round_num = tournament.round_num
    if validate_matches_are_over(tournament, curr_round_num):  # If all the matches have finished status
        current_round = Rounds.objects.filter(round_num=curr_round_num, tournament_id=tournament.id).first()
        update_round_participants_score(current_round)
        current_round.end_at = datetime.now() - timedelta(hours=2)
        current_round.save()
        if save:
            tournament.save()
        return tournament
    else:
        raise Exception("There are still ongoing matches")
        return None


# Validate all the matches are over.
# Update participant scoring and standings


@api_view(['POST'])
def start_tournament(request: Request, tournament_id):
    if tournament_has_enough_participants(tournament_id):
        tournament = Tournaments.objects.get(id=tournament_id)

        started = True
        change_tournament_state(tournament)  # Now users cant register
        # delete_players_not_checked_in(tournament_id)  # Now you have the real participant pool
        participants = tournament.get_participants()
        player_pool, created = Pool.objects.get_or_create(tournament=tournament)
        for participant in participants:
            player_pool.participants.add(participant)

        matches = player_pool.create_rounds()

        serializer = MatchSerializer(instance=matches, many=True)

        return JsonResponse(data={"data": serializer.data, "started": started}, safe=False)
    else:
        return JsonResponse(data={"data": "not enough participants"}, safe=False)


@api_view(['POST'])
def end_tournament(request: Request, tournament_id):
    def sorted_participants(participant):
        player_stats = participant.participant.all()  # Access related PlayerStats
        return player_stats.get().score, Pool.get_omw(participant)

    try:
        tournament = end_current_round(tournament_id, save=False)
        participants = Participants.objects.filter(tournament_id=tournament_id, user__isnull=False)
        participants = sorted(participants, key=sorted_participants, reverse=True)
        if len(participants) > 0:
            tournament.winner = participants[0].username
        if tournament:
            tournament.is_ongoing = False
            tournament.end_time = datetime.now() - timedelta(hours=2)
            tournament.save()
            return Response(data="Tournament ended successfully", status=status.HTTP_200_OK)
        else:
            return Response(data="Could not end tournament", status=status.HTTP_304_NOT_MODIFIED)
    except Exception as e:
        return Response(data=str(e), status=status.HTTP_400_BAD_REQUEST)


class TournamentType(str, Enum):
    upcoming = 'upcoming'
    ongoing = 'ongoing'
    completed = 'completed'
    other = 'other'

    @classmethod
    def has_value(cls, value):
        return value in cls._value2member_map_


def get_tournament_by_type(tournament_type: str) -> QuerySet:
    match tournament_type:
        case TournamentType.upcoming:
            return Tournaments.objects.filter(start_time__gt=datetime.now() - timedelta(hours=2), published=True,
                                              end_time__isnull=True)
        case TournamentType.ongoing:
            return Tournaments.objects.filter(start_time__lt=datetime.now() - timedelta(hours=2), is_ongoing=True)

        case TournamentType.completed:
            return Tournaments.objects.filter(end_time__isnull=False)

        case _:
            return Tournaments.objects.filter(
                start_time__range=[datetime.now() - timedelta(hours=2) - timedelta(days=7),
                                   datetime.now() - timedelta(hours=2) + timedelta(days=7)])


def get_tournament_by_type_for_organization(tournament_type: str, organization: int) -> QuerySet:
    return get_tournament_by_type(tournament_type).filter(organization=organization)


def is_user_registered_to_tournament(user: User, tournament_id: UUID) -> bool:
    return Participants.objects.filter(user_id=user.id, tournament_id=tournament_id).exists()


@api_view(['GET'])
def get_tournaments_by_organization(request: Request, organization: int, tournament_type: str = ''):
    print(organization)
    tournaments = get_tournament_by_type_for_organization(tournament_type, organization)
    serializer = TournamentSerializer(instance=tournaments, many=True)
    for tournament in serializer.data:
        tournament.update({"is_registered": is_user_registered_to_tournament(request.user, tournament['id'])})

    return JsonResponse(data=serializer.data, safe=False)


@api_view(['GET'])
def get_tournaments(request: Request, tournament_type: str = ''):
    tournaments = get_tournament_by_type(tournament_type)
    serializer = TournamentSerializer(instance=tournaments, many=True)
    for tournament in serializer.data:
        tournament.update({"is_registered": is_user_registered_to_tournament(request.user, tournament['id'])})

    return JsonResponse(data=serializer.data, safe=False)


@api_view(['GET'])
def get_tournament(request: Request, tournament_id: UUID):
    tournament = Tournaments.objects.get(id=tournament_id)
    serializer = TournamentSerializer(instance=tournament, many=False)
    return JsonResponse(serializer.data, safe=False)
