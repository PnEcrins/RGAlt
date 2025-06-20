from constance import config
from rest_framework import serializers
from rest_framework.reverse import reverse

from project.api.serializers.observations import (
    AreaSerializer,
    ObservationCategorySerializer,
)


class TokenEndpointsSerializer(serializers.Serializer):
    token = serializers.SerializerMethodField()
    token_refresh = serializers.SerializerMethodField()
    token_verify = serializers.SerializerMethodField()

    def get_token(self, obj):
        return self.context["request"].build_absolute_uri(
            reverse("api:token_obtain_pair")
        )

    def get_token_refresh(self, obj):
        return self.context["request"].build_absolute_uri(reverse("api:token_refresh"))

    def get_token_verify(self, obj):
        return self.context["request"].build_absolute_uri(reverse("api:token_verify"))


class UserEndpointsSerializer(serializers.Serializer):
    me = serializers.SerializerMethodField()
    observations = serializers.SerializerMethodField()

    def get_me(self, obj):
        return self.context["request"].build_absolute_uri(reverse("api:me"))

    def get_observations(self, obj):
        return self.context["request"].build_absolute_uri(
            reverse("api:account-observations-list")
        )


class EndpointsSerializer(serializers.Serializer):
    signup = serializers.SerializerMethodField()
    observations = serializers.SerializerMethodField()
    user = UserEndpointsSerializer()
    token = TokenEndpointsSerializer()

    def get_signup(self, obj):
        return self.context["request"].build_absolute_uri(reverse("api:signup"))

    def get_observations(self, obj):
        return self.context["request"].build_absolute_uri(
            reverse("api:observations-list")
        )


class SettingsSerializer(serializers.Serializer):
    categories = ObservationCategorySerializer(many=True)
    areas = AreaSerializer(many=True)
    endpoints = EndpointsSerializer()
    base_maps = serializers.SerializerMethodField()

    def get_base_maps(self, obj):
        return {
            "main_map": {
                "url": config.MAIN_BASE_MAP_URL,
                "attribution": config.MAIN_BASE_MAP_ATTRIBUTION,
            },
            "satellite_map": {
                "url": config.SATELLITE_BASE_MAP_URL,
                "attribution": config.SATELLITE_BASE_MAP_ATTRIBUTION,
            },
        }


class StatsSerializer(serializers.Serializer):
    observations = serializers.IntegerField(help_text="Total contributions")
    active_contributors = serializers.IntegerField(
        help_text="Contributor with at least one contribution"
    )
