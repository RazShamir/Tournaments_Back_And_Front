import uuid

from django.contrib.auth.models import Group
from django.contrib.auth.models import User
from tournaments_app.models import Tournaments, Participants, TournamentAdmin, Organization, OrganizationAdmin
from tournaments_app.serializers import TournamentSerializer
from tournaments_app.config import MINIMUM_NUMBER_OF_PLAYERS


def is_tournament_admin(user: User) -> bool:
    return user.groups.filter(name="tournament_admin").exists()


def assign_tournament_admin(user, tournament_uuid):
    try:
        # Find the tournament using the provided UUID
        tournament = Tournaments.objects.get(pk=tournament_uuid)

        # Create a new TournamentAdmin object to associate the user with the tournament
        TournamentAdmin.objects.create(user=user, tournament=tournament)

        return True  # Success
    except Tournaments.DoesNotExist:
        # Handle the case where the tournament with the provided UUID does not exist
        return False


def is_user_organization_organizer(user: User, organization_id: int):
    try:
        organization = Organization.objects.get(id=organization_id)
        return organization.organizer_id == user.id
    except Exception as e:
        return False


def is_user_tournament_admin(user: User, tournament_uuid: uuid.UUID):
    try:
        if user.is_superuser:
            return True  # superusers are admins for all tournaments

        # First, find the tournament object using the provided UUID
        tournament = Tournaments.objects.get(pk=tournament_uuid)
        # check if the user is the organizer of the organization
        if tournament.organization.organizer_id == user.id:
            return True

        if OrganizationAdmin.objects.filter(user=user).exists():
            return True

        # Then if not, check if the user is associated with the tournament as an admin
        is_admin = TournamentAdmin.objects.filter(user=user, tournament=tournament).exists()

        return is_admin
    except Exception:
        # Handle the case where the tournament with the provided UUID does not exist
        return False


def is_tournament_organizer(user: User) -> bool:
    return user.groups.filter(name="tournament_organizer").exists()


def tournament_has_enough_participants(tournament_id) -> bool:
    return Participants.objects.filter(tournament_id=tournament_id,
                                       checked_in=True).count() >= MINIMUM_NUMBER_OF_PLAYERS


def delete_players_not_checked_in(tournament_id):
    Participants.objects.filter(tournament_id=tournament_id,
                                checked_in=False).delete()


def does_tournament_need_bye(tournament_id) -> bool:
    return Participants.objects.filter(tournament_id=tournament_id, checked_in=True).count() % 2 == 1


def pair_players(tournament_id):
    pass


def update_tournament_state(tournament: Tournaments):
    tournament_serializer = TournamentSerializer(instance=tournament, data={"is_ongoing": True})
    if tournament_serializer.is_valid():
        tournament_serializer.save()
