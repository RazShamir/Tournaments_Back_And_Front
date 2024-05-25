from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.db.models import F, Max, Sum
from rest_framework import serializers
from rest_framework.validators import UniqueTogetherValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from tournaments_app.game_type import GAME_TYPES
from tournaments_app.models import *


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = User.objects.filter(pk=self.user.id).first()
        if user:
            data['username'] = user.username

        return data


class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=128, validators=[validate_password])

    username = serializers.CharField(max_length=128)

    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'username']
        extra_kwargs = {
            'email': {'required': True},

        }
        validators = [UniqueTogetherValidator(User.objects.all(), ['email'])]

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''))
        user.set_password(validated_data['password'])
        user.save()
        return user


class TournamentAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentAdmin
        fields = "__all__"

    def create(self, validated_data):
        return TournamentAdmin.objects.create(user_id=validated_data['user_id'],
                                              organizer_id=validated_data['organizer_id'])


class OrganizationAdminSerializer(serializers.ModelSerializer):
    organization = serializers.SerializerMethodField()
    managing_tournaments = serializers.SerializerMethodField()

    class Meta:
        model = OrganizationAdmin
        fields = ["organization", "organization_id", "user", "managing_tournaments"]

    def get_organization(self, obj):
        print(obj)
        organization = Organization.objects.get(id=obj.organization_id.id)
        return OrganizationSerializer(organization).data

    def get_managing_tournaments(self, obj):
        managing_tournaments = TournamentAdmin.objects.filter(user__username=obj.user)
        return [{
            "tournament_id": managing_tournament.tournament.id
        } for managing_tournament in managing_tournaments]


class PlayerStatisticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlayerStats
        fields = ['participant', 'score', 'omw', 'match_balance']
        validators = [
            UniqueTogetherValidator(
                queryset=PlayerStats.objects.all(),
                fields=['participant']
            )
        ]

    def create(self, validated_data):
        return PlayerStats.objects.create(
            score=validated_data['score'],
            omw=validated_data['omw'],
            participant=validated_data['participant']
        )

    def update(self, instance, validated_data):
        instance.omw = validated_data.get('omw', instance.omw)
        instance.score += validated_data.get('score', 0)
        instance.save()
        return instance


class ParticipantsSerializer(serializers.ModelSerializer):
    player_stats = serializers.SerializerMethodField()

    class Meta:
        model = Participants
        fields = ['id', 'participant_id', 'game_username', 'username', 'user', 'tournament', 'checked_in',
                  'player_stats']
        validators = [
            UniqueTogetherValidator(
                queryset=Participants.objects.all(),
                fields=['tournament', 'user']
            )
        ]

    def update(self, instance, validated_data):
        instance.username = validated_data.get('username', instance.username)
        instance.game_username = validated_data.get('game_username', instance.game_username)
        instance.checked_in = validated_data.get('checked_in', instance.checked_in)
        instance.save()
        return instance

    # InEfficient
    def get_player_stats(self, obj):
        try:
            stats = PlayerStats.objects.get(participant=obj)
            return PlayerStatisticsSerializer(stats).data
        except PlayerStats.DoesNotExist:
            return None

    def can_register(self, tournament: Tournaments) -> None:
        if tournament.is_ongoing or tournament.end_time != None:  # TODO: add capacity check
            raise serializers.ValidationError("Cant register to tournament.")

    def create(self, validated_data):
        if 'tournament' in validated_data:
            self.can_register(validated_data['tournament'])

        if 'game_username' not in validated_data:
            raise serializers.ValidationError("Cant register without game username.")

        return Participants.objects.create(
            tournament=validated_data['tournament'],
            username=validated_data['username'], game_username=validated_data['game_username'],
            user=validated_data['user']
        )


class NakedRoundsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rounds
        fields = ['start_at', 'end_at']
        validators = []


class MatchSerializer(serializers.ModelSerializer):
    participant_one = ParticipantsSerializer(read_only=True)
    participant_two = ParticipantsSerializer(read_only=True)
    rounds = NakedRoundsSerializer(read_only=True)

    class Meta:
        model = Match
        fields = ['match_id', 'match_result', 'match_type', 'status', 'participant_one', 'participant_two',
                  'participant_one_submitted', 'participant_two_submitted', 'winner', 'tournament_id', 'tie', 'rounds']

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        instance.match_result = validated_data.get('match_result', instance.match_result)
        instance.save()

        return instance


class TournamentSerializer(serializers.ModelSerializer):
    participants = ParticipantsSerializer(many=True, read_only=True)
    organization_name = serializers.SerializerMethodField()

    class Meta:
        model = Tournaments
        fields = ['id', 'published', 'participants', 'name', 'created_at', 'start_time', 'end_time', 'is_ongoing',
                  'type', 'details',
                  'organization', 'round_num', 'round_time_estimate', 'winner', 'organization_name']
        validators = [
            UniqueTogetherValidator(
                queryset=Tournaments.objects.all(),
                fields=['name']
            )
        ]

    def get_organization_name(self, obj):
        return obj.organization.organization_name

    def validate(self, data):
        if not GAME_TYPES.has_value(data.get('type')):
            raise serializers.ValidationError('type is invalid')

        if timezone.now() > data.get('start_time'):
            raise serializers.ValidationError('you cant start a tournament in the past!')

        if len(data.get('name')) >= 36:
            raise serializers.ValidationError('name is too long')

        return data

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.start_time = validated_data.get('start_time', instance.start_time)
        instance.is_ongoing = validated_data.get('is_ongoing', instance.is_ongoing)
        instance.save()
        return instance

    def create(self, validated_data):
        created_at = timezone.now()

        tournament = Tournaments.objects.create(
            name=validated_data['name'],
            created_at=created_at,
            start_time=validated_data['start_time'],
            type=validated_data['type'],
            organization=validated_data['organization']
        )

        return tournament


class RoundsSerializer(serializers.ModelSerializer):
    matches = MatchSerializer(many=True, read_only=True)

    class Meta:
        model = Rounds
        fields = '__all__'
        validators = []

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['matches'] = MatchSerializer(self.order_matches(instance), many=True).data
        return data

    def order_matches(self, instance):
        # Annotate the matches with the participants' scores
        matches_queryset = instance.matches.all()

        # Define a custom sorting function
        def custom_sort(match):
            if str(match.participant_one) == BYE or str(match.participant_two) == BYE:
                return -1
            return match.participant_one.participant.get().score + match.participant_two.participant.get().score

        # Sort the matches based on the custom sorting function
        sorted_matches = sorted(matches_queryset, key=custom_sort, reverse=True)
        return sorted_matches


class OrganizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization
        fields = ['organization_name', 'organizer_id', 'id']
        validators = [
            UniqueTogetherValidator(
                queryset=Organization.objects.all(),
                fields=['organization_name']
            )
        ]

    def create(self, validated_data):
        if not 'organization_name' in validated_data:
            raise ValueError("Missing organization name")
        return Organization.objects.create(organization_name=validated_data['organization_name'],
                                           organizer_id=validated_data['organizer_id'])


class ConflictSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conflict
        fields = ["organization", "tournament", "match"]


class NakedConflictSerializer(serializers.ModelSerializer):
    match = MatchSerializer()
    class Meta:
        model = Conflict
        fields = ["match"]


class UserSerializer(serializers.ModelSerializer):
    organization = OrganizationSerializer(source='organization_set.first', read_only=True)
    administration = serializers.SerializerMethodField()

    class Meta:
        model = User
        exclude = ['password', 'groups', 'last_login', 'user_permissions']

    def get_administration(self, obj):
        orgs = OrganizationAdmin.objects.filter(user_id=obj.id)
        if not orgs.exists():
            return []

        serialize = OrganizationAdminSerializer(orgs, many=True)
        return serialize.data
