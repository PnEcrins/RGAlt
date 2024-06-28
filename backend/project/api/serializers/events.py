from drf_dynamic_fields import DynamicFieldsMixin
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from sorl.thumbnail import get_thumbnail

from project.events.models import Event, EventSubType, EventType, Media


class EventSubTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventSubType
        fields = (
            "id",
            "label",
            "description",
            "pictogram",
        )


class EventTypeSerializer(serializers.ModelSerializer):
    sub_types = EventSubTypeSerializer(many=True)

    class Meta:
        model = EventType
        fields = ("id", "label", "description", "pictogram", "sub_types")


class ThumbnailSerializer(serializers.Serializer):
    small = serializers.SerializerMethodField()
    medium = serializers.SerializerMethodField()
    large = serializers.SerializerMethodField()

    def get_thumbnail_by_size(self, obj, height=100, width=100, format="PNG"):
        if obj.media_type == Media.MediaType.IMAGE:
            return self.context["request"].build_absolute_uri(
                get_thumbnail(obj.media_file, f"{height}x{width}", format="PNG").url
            )
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_small(self, obj):
        return self.get_thumbnail_by_size(obj, 100, 100)

    @extend_schema_field(OpenApiTypes.URI)
    def get_medium(self, obj):
        return self.get_thumbnail_by_size(obj, 300, 300)

    @extend_schema_field(OpenApiTypes.URI)
    def get_large(self, obj):
        return self.get_thumbnail_by_size(obj, 600, 600)


class MediaSerializer(serializers.ModelSerializer):
    thumbnails = ThumbnailSerializer(source="*")

    class Meta:
        model = Media
        fields = ("id", "uuid", "legend", "media_file", "media_type", "thumbnails")


class EventListSerializer(
    DynamicFieldsMixin, gis_serializers.GeoFeatureModelSerializer
):
    source = serializers.SlugRelatedField("label", read_only=True)
    subtype = serializers.SlugRelatedField("label", read_only=True)
    # event_type = serializers.SlugRelatedField("event_subtype.event_type.label", read_only=True)

    class Meta:
        model = Event
        geo_field = "location"
        fields = (
            "id",
            "uuid",
            "comments",
            "event_date",
            "source",
            "subtype",
            "event_subtype",
            "location",
        )
        write_only_fields = ("event_subtype__id",)


class EventDetailSerializer(EventListSerializer):
    medias = MediaSerializer(many=True, read_only=True)

    class Meta(EventListSerializer.Meta):
        fields = EventListSerializer.Meta.fields + ("medias",)
