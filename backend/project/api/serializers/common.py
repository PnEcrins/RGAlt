from rest_framework import serializers

from project.api.serializers.events import EventTypeSerializer


class SettingsSerializer(serializers.Serializer):
    event_types = EventTypeSerializer(many=True, read_only=True)
    event_url = serializers.HyperlinkedIdentityField(view_name="api:events-list")
