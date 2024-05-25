import datetime
import json
from collections import defaultdict
from random import shuffle
from typing import List, Self, Any
from uuid import uuid4, UUID

import django.core.exceptions
from django.conf import settings
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q, F

from tournaments_app import constants
from tournaments_app.constants import BYE


class Organization(models.Model):
    organizer_id = models.ForeignKey(User, on_delete=models.RESTRICT, blank=False, null=False)
    organization_name = models.CharField(max_length=256, null=False, default="")

    # TODO: add logo and description to model

    def __str__(self):
        return f"{self.organization_name}"

    class Meta:
        db_table = 'organization'


class TournamentAdmin(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User who is an admin
    tournament = models.ForeignKey("tournaments_app.Tournaments",
                                   on_delete=models.CASCADE)  # Tournament associated with the admin

    class Meta:
        unique_together = ['user', 'tournament']


class Tournaments(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False, unique=True)
    name = models.CharField(max_length=256, null=True)
    winner = models.CharField(max_length=256, null=True)
    created_at = models.DateTimeField(blank=False, null=True)
    start_time = models.DateTimeField(blank=False, null=True)
    end_time = models.DateTimeField(blank=False, null=True, default=None)
    is_ongoing = models.BooleanField(blank=False, null=False, default=False)
    type = models.IntegerField(blank=False, null=False)
    details = models.TextField(default="", blank=True)
    organization = models.ForeignKey(
        Organization, on_delete=models.RESTRICT, blank=False, null=True)
    published = models.BooleanField(blank=False, null=False, default=False)
    admins = models.ManyToManyField(User, through=TournamentAdmin, related_name='administered_tournaments')
    round_num = models.IntegerField(default=0, blank=False, null=False)
    round_time_estimate = models.CharField(default="00:00:00", blank=False, null=False)

    class Meta:
        db_table = 'tournaments'

    def get_participants(self):
        return Participants.objects.filter(tournament=self.id)

    @staticmethod
    def get_max_rounds(tournament_id: UUID):
        participants = Participants.objects.filter(tournament_id=tournament_id).exclude(username=constants.BYE)
        p_len = len(participants)

        def get_swiss_rounds(num_players):
            if 4 <= num_players <= 8:
                return 3
            elif 9 <= num_players <= 12:
                return 4
            elif 13 <= num_players <= 20:
                return 5
            elif 21 <= num_players <= 32:
                return 5
            elif 33 <= num_players <= 64:
                return 6
            elif 65 <= num_players <= 128:
                return 7
            elif 129 <= num_players <= 226:
                return 8
            elif 227 <= num_players <= 409:
                return 9
            else:
                return 10  # For 410+ players

        return get_swiss_rounds(p_len)


class OrganizationAdmin(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.RESTRICT, blank=True, null=True)
    organization_id = models.ForeignKey(
        Organization, on_delete=models.RESTRICT, blank=False, null=True)
    is_active = models.BooleanField(blank=False, null=False)

    class Meta:
        db_table = 'organization_admins'
        unique_together = ["organization_id", "user"]


class Participants(models.Model):
    id = models.BigAutoField(primary_key=True)
    participant_id = models.UUIDField(blank=False, null=False, default=uuid4, max_length=256)
    tournament = models.ForeignKey(
        Tournaments, on_delete=models.RESTRICT, blank=False, null=False, related_name='participants')
    user = models.ForeignKey(
        User, on_delete=models.RESTRICT, blank=True, null=True)
    checked_in = models.BooleanField(default=False, null=False)
    game_username = models.CharField(max_length=256, default="")
    username = models.CharField(max_length=256, null=False, default="")
    active = models.BooleanField(default=True, null=False)

    @classmethod
    def get_participants_by_tournament(cls, tournament_id: UUID) -> List[Self]:
        return list(cls.objects.filter(tournament=tournament_id))

    @classmethod
    def get_participant_by_user_and_tournament(cls, user_id: int, tournament_id: UUID) -> Self:
        return cls.objects.get(tournament=tournament_id, user=user_id)

    def get_matches(self):
        return Match.objects.filter(participant_one=self.participant_id, participant_two=self.participant_id)

    def delete_related(self):
        try:
            pool = Pool.objects.get(tournament_id=self.tournament_id)
            pool.remove_participant(self)
        except django.core.exceptions.ObjectDoesNotExist:
            pass

        try:
            stats = PlayerStats.objects.get(participant_id=self.id)
            stats.delete()
        except django.core.exceptions.ObjectDoesNotExist:
            pass

    def __str__(self):
        return self.game_username

    class Meta:
        db_table = 'participants'


class PlayerStats(models.Model):
    participant = models.ForeignKey(Participants, on_delete=models.RESTRICT, blank=False, null=False,
                                    related_name='participant')
    score = models.IntegerField(blank=False, null=False, default=0)
    omw = models.FloatField(blank=False, null=True)

    # optimize this to be a class-method that is only used in pairings page
    @property
    def match_balance(self):
        match_history = Match.get_match_history(self.participant)

        wins_upcoming = 0
        ties_upcoming = 0
        loses_upcoming = 0
        wins_current = 0
        ties_current = 0
        loses_current = 0

        for match in match_history:
            if match.status == 2:
                continue
            # not efficient
            is_current_round_match = False
            try:
                is_current_round_match = self.participant.tournament.round_num == match.rounds.round_num
            except Exception as e:
                print(e)

            if match.winner == self.participant.username or match.participant_one.username == constants.BYE \
                    or match.participant_two.username == constants.BYE:
                if is_current_round_match:
                    wins_upcoming += 1
                else:
                    wins_current += 1
                    wins_upcoming += 1
            elif match.tie:
                if is_current_round_match:
                    ties_upcoming += 1
                else:
                    ties_current += 1
                    ties_upcoming += 1
            elif match.winner is not None and match.winner != self.participant.username:
                if is_current_round_match:
                    loses_upcoming += 1
                else:
                    loses_current += 1
                    loses_upcoming += 1

        if not self.participant.tournament.is_ongoing:
            wins_current, ties_current, loses_current = wins_upcoming, ties_upcoming, loses_upcoming

        result = {"upcoming": {"wins": wins_upcoming, "loses": loses_upcoming, "ties": ties_upcoming},
                  "current": {"wins": wins_current, "loses": loses_current, "ties": ties_current}}
        return result

    class Meta:
        db_table = 'statistics'


class Pool(models.Model):
    tournament = models.ForeignKey(Tournaments, on_delete=models.RESTRICT, unique=True)
    participants = models.ManyToManyField(Participants)

    @property
    def initial_round_exists(self) -> bool:
        return Rounds.objects.filter(round_num=1, tournament=self.tournament).exists()

    def remove_participant(self, participant: Participants):
        self.participants.remove(participant)

    # views.py -> Pool.generate_matches()
    def create_initial_round(self) -> list:
        matches = []
        first_round = Rounds(tournament=self.tournament,
                             start_at=datetime.datetime.now() - datetime.timedelta(hours=2),
                             end_at=None,
                             round_num=1,
                             participant_pool=self)
        first_round.save()
        participants = list(self.participants.all())

        shuffle(participants)
        pool1, pool2 = participants[int(len(participants) / 2):], participants[:int(len(participants) / 2)]
        for p1, p2 in zip(pool1, pool2):
            match = Match(participant_one=p1, participant_two=p2, rounds=first_round,
                          match_type=first_round.tournament.type)
            if p1.username == constants.BYE or p2.username == constants.BYE:
                match.status = 1
            match.save()
            matches.append(match)
        return matches

    def get_all_participants(self) -> List[Participants]:
        return list(self.participants.all())

    @staticmethod
    def get_omw(participant: Participants):
        opponents = Match.get_match_opponents(participant=participant)
        current_omw = defaultdict()
        for opponent_set in opponents:
            for opponent in opponent_set:
                opponent_statistics = PlayerStats.objects.get(participant=opponent.participant_id)
                opponent_score = opponent_statistics.score
                opponent_games_played = Match.get_number_of_games_played(opponent)
                current_omw[opponent.username] = opponent_score / opponent_games_played

        return current_omw

    def get_participants_by_score(self):
        return PlayerStats.objects.filter(tournament=self.tournament.id).order_by("score", "omw").values("participant")

    def get_player_stats(self, participant: Participants):
        return PlayerStats.objects.get(participant=participant.participant_id)

    def pair_round_matches(self, curr_round):
        matches = []
        participants = list(self.participants.all().order_by('participant__score'))
        opponent_match_history = {
            participant.username: Match.get_history_match_opponents(participant, curr_round.tournament_id) for
            participant in participants}
        paired_participants = set()
        bye_participant = None

        for i in range(len(participants) - 1, -1, -1):
            if participants[i].username in paired_participants:
                continue
            if participants[i].username == BYE:
                bye_participant = participants[i]
                continue
            for j in range(i - 1, -1, -1):
                if participants[j].username not in paired_participants and participants[
                    i].username not in paired_participants:
                    if participants[j].username == BYE:
                        bye_participant = participants[j]
                    elif participants[j].username not in opponent_match_history[participants[i].username]:
                        paired_participants.add(participants[i].username)
                        paired_participants.add(participants[j].username)
                        match = Match(participant_one=participants[i],
                                      participant_two=participants[j],
                                      match_type=curr_round.tournament.type,
                                      rounds=curr_round)
                        match.save()
                        matches.append(match)

        for participant in participants:
            if participant.username != BYE and participant.username not in paired_participants:
                if bye_participant is not None:
                    match = Match(participant_one=participant, participant_two=bye_participant, rounds=curr_round)
                    match.status = 1
                    match.save()
                    matches.append(match)

        return matches

    def create_round(self) -> list:
        print(datetime.datetime.now() - datetime.timedelta(hours=2))
        current_round = Rounds(tournament=self.tournament,
                               start_at=datetime.datetime.now() - datetime.timedelta(hours=2),
                               round_num=self.tournament.round_num + 1,
                               end_at=None,
                               participant_pool=self)
        current_round.save()
        return self.pair_round_matches(curr_round=current_round)
        # 1. pair the players with the highest points
        # 2. two players cant play each other more than once

    def create_rounds(self) -> List:
        # self.participants = self.participants.filter(lambda p: p is not None)
        participant_count = self.participants.count()
        created_round = None
        if participant_count % 2 != 0:
            self.participants = self.participants.filter(user__isnull=False)
        if not self.initial_round_exists:
            created_round = self.create_initial_round()
        else:
            created_round = self.create_round()

        self.tournament.round_num += 1
        self.tournament.save()

        return created_round
        # check if Round(round_number=1) exists
        # add player shuffle (initial pairings)
        # calculate next rounds pairings
        # create new pairings after R1


class Rounds(models.Model):
    tournament = models.ForeignKey(
        Tournaments, on_delete=models.RESTRICT, blank=False, null=False)
    start_at = models.DateTimeField(null=False, blank=False)
    end_at = models.DateTimeField(null=True, blank=True)
    round_num = models.IntegerField(null=False, blank=False)
    participant_pool = models.ForeignKey(Pool, on_delete=models.RESTRICT, blank=True, null=True)

    @classmethod
    def get_rounds(cls, tournament_id: UUID):
        return cls.objects.filter(tournament=tournament_id)

    class Meta:
        db_table = 'rounds'


class Match(models.Model):
    class MatchType(models.IntegerChoices):
        SWISS_BO1 = 1
        SINGLE_ELIMINATION_BO1 = 2
        SWISS_BO3 = 3
        SINGLE_ELIMINATION_BO3 = 4

    class MatchStatus(models.IntegerChoices):
        FINISHED = 1
        ONGOING = 2
        CONFLICT = 3

    match_id = models.UUIDField(primary_key=True, default=uuid4, max_length=256)
    match_type = models.IntegerField(choices=MatchType.choices, default=MatchType.SWISS_BO1)
    participant_one = models.ForeignKey(Participants, on_delete=models.RESTRICT, related_name='first_participant')
    participant_two = models.ForeignKey(Participants, on_delete=models.RESTRICT, related_name='second_participant')
    participant_one_submitted = models.BooleanField(default=False)
    participant_two_submitted = models.BooleanField(default=False)
    tie = models.BooleanField(default=False)
    match_result = models.JSONField(null=True, blank=True)
    status = models.IntegerField(choices=MatchType.choices, default=MatchStatus.ONGOING)
    rounds = models.ForeignKey(Rounds, on_delete=models.RESTRICT, blank=False, null=False, related_name='matches')

    @property
    def tournament_id(self):
        # Assuming you have a ForeignKey to Round model
        if self.rounds:
            return self.rounds.tournament_id
        return None  # Handle the case where there's no related round

    @property
    def tournament(self):
        # Assuming you have a ForeignKey to Round model
        if self.rounds:
            return self.rounds.tournament
        return None  # Handle the case where there's no related round

    @classmethod
    def get_participant_by_user_id(cls, user_id: int) -> Self:
        return Participants.objects.get(tournament=cls.rounds.tournament, user=user_id)

    def is_bye_match(self):
        return self.participant_one.username == constants.BYE or self.participant_two.username == constants.BYE

    def is_user_allowed_to_submit(self, user: User) -> bool:
        is_user_participant = self.is_user_match_participant(user)
        match_status = self.status
        return is_user_participant and not self.has_user_submitted(user) and match_status != 1

    def has_user_submitted(self, user: User) -> bool:
        if self.participant_one.user == user:
            return self.participant_one_submitted
        return self.participant_two_submitted

    def is_user_match_participant(self, user: User) -> bool:
        return self.participant_one.user == user or self.participant_two.user == user

    def get_match_result(self) -> None:
        if self.match_result is None:
            return None
        elif isinstance(self.match_result, dict):
            return self.match_result
        else:
            return json.loads(self.match_result)

    @classmethod
    def get_by_id(cls, match_id: UUID) -> Self:
        return cls.objects.get(match_id=match_id)

    @property
    def winner(self):
        if self.status == 2:
            return None
        if self.participant_one.username == constants.BYE:
            return self.participant_two.username
        elif self.participant_two.username == constants.BYE:
            return self.participant_one.username

        match_result = self.get_match_result()
        if match_result is None:
            return None
        if self.match_type == Match.MatchType.SWISS_BO1:  # swiss 1
            return match_result["game_one"]
        else:  # out of 3
            if match_result["game_one"] == match_result["game_three"]:
                return match_result["game_one"]
            elif match_result["game_one"] == match_result["game_two"]:
                return match_result["game_one"]
            elif match_result["game_two"] == match_result["game_three"]:
                return match_result["game_two"]

    def result(self):
        if self.tie:
            player_one_stats = PlayerStats.objects.get(participant=self.participant_one)
            player_two_stats = PlayerStats.objects.get(participant=self.participant_two)
            player_one_stats.score += 1
            player_two_stats.score += 1
            player_one_stats.save()
            player_two_stats.save()
        else:
            winner_stats = PlayerStats.objects.get(participant=self.winner)
            winner_stats.score += 3
            winner_stats.save()

    @staticmethod
    def get_match_history(participant: Participants):
        return Match.objects.filter(
            Q(participant_one=participant) | Q(participant_two=participant))

    @staticmethod
    def get_match_history_by_tournament(participant: Participants, tournament_id: UUID):
        participant_matches = Match.objects.filter(Q(participant_one=participant) | Q(participant_two=participant))
        tournament_matches = participant_matches.filter(rounds__tournament_id=tournament_id)
        return tournament_matches

    @staticmethod
    def get_history_match_opponents(participant: Participants, tournament_id: UUID) -> set[str]:
        match_history = Match.get_match_history_by_tournament(participant, tournament_id)
        opponents = set()
        for match in match_history:
            if match.participant_one.username == participant.username and match.participant_two.username != BYE:
                opponents.add(match.participant_two.username)
            elif match.participant_two.username == participant.username and match.participant_one.username != BYE:
                opponents.add(match.participant_one.username)
        return opponents

    @staticmethod
    def get_number_of_games_played(participant: Participants) -> int:
        return Match.get_match_history(participant).count()

    @staticmethod
    def get_match_opponents(participant: Participants):
        opponents = [Match.objects.filter(participant_one=participant.participant_id).values("participant_two"),
                     Match.objects.filter(participant_two=participant.participant_id).values("participant_one")]
        return opponents

    @staticmethod
    def get_match_opponents_by_id(participant_id: UUID):
        opponents = Match.objects.filter(participant_one=participant_id).values("participant_two").get()
        opponents.update(
            Match.objects.filter(participant_two=participant_id).values("participant_one").get()
        )
        return opponents

    class Meta:
        db_table = 'matches'


class Conflict(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, blank=False, null=False)

    class Meta:
        db_table = 'match_conflicts'

    @property
    def organization(self):
        return self.tournament.organization

    @property
    def tournament(self):
        return self.match.participant_one.tournament


class Notes(models.Model):
    tournament = models.ForeignKey(
        Tournaments, on_delete=models.RESTRICT, blank=False, null=True)
    note = models.CharField(null=False, blank=False)
    warning_type = models.CharField(null=False, blank=False)

    def __str__(self):
        return f"{self.note}"

    class Meta:
        db_table = 'notes'
