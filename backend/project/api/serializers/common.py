from rest_framework import serializers

from project.api.serializers.observations import ObservationTypeSerializer


class SettingsSerializer(serializers.Serializer):
    observation_types = ObservationTypeSerializer(many=True, read_only=True)
    observation_public_url = serializers.HyperlinkedIdentityField(
        view_name="api:observations-list"
    )
