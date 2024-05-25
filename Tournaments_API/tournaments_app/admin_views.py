from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.urls import resolve
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.request import Request
from django.contrib.auth.models import User, Group
from datetime import datetime, timedelta
from tournaments_app.game_type import GAME_TYPES
from django.db.models import Avg, Count
from django.contrib.auth.decorators import user_passes_test
from tournaments_app.utils import is_tournament_admin, is_tournament_organizer, is_user_tournament_admin, \
    is_user_organization_organizer
from tournaments_app.models import *
from tournaments_app.serializers import *
from enum import Enum
from pathlib import Path


# @user_passes_test(is_tournament_admin) TODO fix this

@api_view(['POST'])
def delete_participant(request: Request, tournament_id):
    name = request.data['name']
    Participants.objects.filter(tournament_id=tournament_id, name=name).delete()
    return JsonResponse(data={"message": "Participant has been removed"})


class IsAdminAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is staff (admin)
        # check
        return request.user.is_staff


class IsTournamentAdminAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is staff (admin)
        # check
        # Access the URL path
        url_path = request.get_full_path()
        match = resolve(url_path)
        tournament_id = match.kwargs.get('tournament_id', None)

        return is_user_tournament_admin(request.user, tournament_id)


class IsOrganizationOrganizer(permissions.BasePermission):
    def has_permission(self, request, view):
        # Check if the user is staff (admin)
        # check
        # Access the URL path
        url_path = request.get_full_path()
        match = resolve(url_path)
        organization_id = match.kwargs.get('organization_id', None)

        if request.user.is_staff:
            return True
        return is_user_organization_organizer(request.user, organization_id)


@api_view(['POST'])
@permission_classes([IsOrganizationOrganizer])
def create_organization_admin(request: Request, organization_id: int):
    user_id = request.data["user_id"]
    user_name = request.data["user_name"]
    organization = Organization.objects.get(id=organization_id)
    OrganizationAdmin.objects.create(
        user_id=user_id,
        is_active=True,
        organization_id=organization
    )
    return Response(data=f"Assigned {user_name} as admin for {organization.organization_name} successfully")


@api_view(['POST'])
@permission_classes([IsOrganizationOrganizer])
def create_tournament_admin(request: Request, organization_id: int, tournament_id: UUID):
    user_id = request.data["user_id"]
    user_name = request.data["user_name"]
    if not OrganizationAdmin.objects.filter(
            user_id=user_id,
            organization_id=organization_id
    ).exists():
        return Response(
            data=f"Could not assign {user_name} as admin for {tournament_id}, user is not part of the organization")

    TournamentAdmin.objects.create(user_id=user_id, tournament_id=tournament_id)
    return Response(data=f"Assigned {user_name} as admin for {tournament_id} successfully")


@api_view(['GET'])
def list_tournament_staff(request: Request, tournament_id: UUID):
    admins = TournamentAdmin.objects.filter(tournament_id=tournament_id)
    admins_list = []
    for admin in admins:
        admins_list.append(TournamentAdminSerializer(admin).data)
    for admin in admins_list:
        admin["user"] = UserSerializer(User.objects.get(id=admin["user"])).data

    return JsonResponse(data=admins_list, safe=False)


@api_view(['GET'])
def list_organization_staff(request: Request, organization_id: UUID):
    admins = OrganizationAdmin.objects.filter(organization_id=organization_id)
    admins_list = []
    for admin in admins:
        admins_list.append(OrganizationAdminSerializer(admin).data)
    for admin in admins_list:
        admin["user"] = UserSerializer(User.objects.get(id=admin["user"])).data

    organization = Organization.objects.get(id=organization_id)
    organizer = UserSerializer(organization.organizer_id)

    return JsonResponse(data={
        "admins": admins_list,
        "organizer": organizer.data
    }, safe=False)


@api_view(['GET'])
@permission_classes([IsTournamentAdminAuthenticated])
def list_tournament_conflicts(request: Request, tournament_id: UUID):
    conflicts = Conflict.objects.filter(match__rounds__tournament=tournament_id)
    if len(conflicts) > 0:
        conflicts = NakedConflictSerializer(conflicts, many=True)
        return JsonResponse(data=conflicts.data, status=status.HTTP_200_OK,safe=False)
    else:
        return JsonResponse(data=[], status=status.HTTP_200_OK,safe=False)


@api_view(['POST'])
@permission_classes([IsTournamentAdminAuthenticated])
def unregister_participants(request: Request, tournament_id: UUID):
    tournament = Tournaments.objects.get(id=tournament_id)
    if tournament.is_ongoing:
        return JsonResponse(data={"message": "Tournament already started"}, status=status.HTTP_400_BAD_REQUEST)
    if tournament.end_time is not None:
        return JsonResponse(data={"message": "Tournament already ended"}, status=status.HTTP_400_BAD_REQUEST)
    participants_ids = request.data["participants_ids"]
    print(participants_ids)
    filtered_participants = Participants.objects.filter(tournament_id=tournament_id, id__in=participants_ids)
    for p in filtered_participants:
        p.delete_related()
    filtered_participants.delete()
    return JsonResponse(data={"message": f"You successfully unregistered {len(participants_ids)} participants"})


@api_view(['POST'])
def mass_register(request: Request, tournament_id: UUID):
    try:
        for user in request.data['users']:
            participant = ParticipantsSerializer(data={
                'username': user['username'],
                'user': user['id'],
                'tournament': tournament_id,
                'game_username': user['game_username']
            })

            participant.is_valid(raise_exception=True)
            participant.save()

            stats_default = PlayerStatisticsSerializer(data={
                'participant': participant.data["id"],
                'score': 0,
                'omw': 0,
            })

            stats_default.is_valid(raise_exception=True)
            stats_default.save()
        return JsonResponse(data={"status": "successfully registered", "data": participant.data})
    except Exception as e:
        print(str(e))
        return Response(data=str(e))


@api_view(['PUT'])
def mass_check_in(request: Request, tournament_id):
    participants = Participants.objects.filter(tournament_id=tournament_id)
    for p in participants:
        p.checked_in = True
        p.save()
    return JsonResponse(data={"message": "Tournament mass Check in successfully"})


@api_view(['POST'])
@permission_classes([IsTournamentAdminAuthenticated])
def set_match_result(request: Request, tournament_id: UUID, match_id: UUID):
    try:
        match = Match.objects.get(pk=match_id)
        winner = request.data["winner"]
        tie = request.data["tie"]
        match.tie = tie
        match.status = Match.MatchStatus.FINISHED
        conflicts = Conflict.objects.filter(match=match)
        if conflicts.exists():
            conflicts.delete()
        if match.match_type == Match.MatchType.SWISS_BO1 or match.match_type == Match.MatchType.SINGLE_ELIMINATION_BO1:
            match.match_result = json.dumps({"game_one": winner})
        else:
            match.match_result = json.dumps({"game_one": winner, "game_two": winner, "game_three": winner})
        match.save()
        return JsonResponse(data={"message": "Match results updated successfully"})
    except Match.DoesNotExist as e:
        return JsonResponse(data={"message": "Match does not exist"})
