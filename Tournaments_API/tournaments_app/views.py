from django.http import JsonResponse
from django.contrib.auth.models import Group
from django.http import JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.utils.serializer_helpers import ReturnDict

from tournaments_app.serializers import *


# Create your views here.

@api_view(['POST'])
def create_organization(request: Request):
    user: User = request.user
    organization_group, created = Group.objects.get_or_create(name=request.data['organization_name'])
    org = {}
    if created:
        print("Created")
        user.groups.add(organization_group)
        organization_serializer = OrganizationSerializer(data={
            'organization_name': request.data['organization_name'],
            'organizer_id': user.id,
        })
        organization_serializer.is_valid(raise_exception=True)
        org = organization_serializer.save()
        org.save()
    else:
        return Response(data={"message": "user already has organization"}, status=status.HTTP_400_BAD_REQUEST)

    return Response(data={"message": "organization created", "extra": organization_serializer.data},
                    status=status.HTTP_201_CREATED)




@api_view(['POST'])  # TODO: fix second time registration working
def register_participant(request: Request, tournament_id):
    try:
        participant = ParticipantsSerializer(data={
            'username': request.user.username,
            'user': request.user.id,
            'tournament': tournament_id,
            'game_username': request.data['game_username']
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


@api_view(['POST'])
def unregister_participant(request: Request, tournament_id):
    participant = Participants.objects.filter(tournament_id=tournament_id, user=request.user.id)
    if participant.exists():
        participant = participant.get()
        participant.delete_related()
        participant.delete()
        return JsonResponse(data={"message": "You successfully unregistered"},status=status.HTTP_200_OK)
    return JsonResponse(data={"message": "Participant does not exist"},status=status.HTTP_400_BAD_REQUEST)






def sorted_participants(participant):
    player_stats = participant.participant.all()  # Access related PlayerStats
    return player_stats.get().score, Pool.get_omw(participant)


@api_view(['GET'])
def get_registered_participants(request: Request, tournament_id: UUID):
    try:
        participants = Participants.objects.filter(tournament_id=tournament_id, user__isnull=False)
        participants = sorted(participants, key=sorted_participants, reverse=True)
        participants = ParticipantsSerializer(instance=participants, many=True)
        return Response(data=participants.data)
    except Exception as e:
        print(e)
        return Response(data=str(e),status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def is_registered(request: Request, tournament_id: UUID):
    participant = Participants.objects.filter(tournament_id=tournament_id, user=request.user.id)
    if not participant.exists():
        return Response(data={"registered": False, "checked_in": False})
    return Response(data={"registered": True, "checked_in": participant.first().checked_in})


@api_view(['GET'])
def get_registered_tournaments_for_user(request: Request):
    participant = Participants.objects.filter(user=request.user.id)
    participant = ParticipantsSerializer(instance=participant, many=True)
    return Response(data=participant.data)


@api_view(['PUT'])
def check_in_participant(request: Request, tournament_id):
    participant = Participants.objects.filter(tournament_id=tournament_id, user=request.user.id).first()
    s = ParticipantsSerializer(instance=participant,
                               data={'checked_in': True, 'tournament': tournament_id, 'user': request.user.id
                                     })
    if s.is_valid(raise_exception=True):
        s.save()

    return JsonResponse(data={"message": "Checked in successfully"})

