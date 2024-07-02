from drf_dynamic_fields import DynamicFieldsMixin
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from sorl.thumbnail import get_thumbnail

from project.observations.models import (
    Media,
    Observation,
    ObservationSubType,
    ObservationType,
)


class ObservationSubTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObservationSubType
        fields = (
            "id",
            "label",
            "description",
            "pictogram",
        )


class ObservationTypeSerializer(serializers.ModelSerializer):
    sub_types = ObservationSubTypeSerializer(many=True)

    class Meta:
        model = ObservationType
        fields = ("id", "label", "description", "pictogram", "sub_types")


class ThumbnailSerializer(serializers.Serializer):
    small = serializers.SerializerMethodField()
    medium = serializers.SerializerMethodField()
    large = serializers.SerializerMethodField()

    def get_thumbnail_by_size(
        self, obj, height=100, width=100, format="JPEG", quality=70
    ):
        if obj.media_type == Media.MediaType.IMAGE:
            return self.context["request"].build_absolute_uri(
                get_thumbnail(
                    obj.media_file, f"{width}x{height}", format=format, quality=quality
                ).url
            )
        return None

    @extend_schema_field(OpenApiTypes.URI)
    def get_small(self, obj):
        return self.get_thumbnail_by_size(obj, 449, 599)

    @extend_schema_field(OpenApiTypes.URI)
    def get_medium(self, obj):
        return self.get_thumbnail_by_size(obj, 720, 1280)

    @extend_schema_field(OpenApiTypes.URI)
    def get_large(self, obj):
        return self.get_thumbnail_by_size(obj, 1080, 1920)


class MediaSerializer(serializers.ModelSerializer):
    thumbnails = ThumbnailSerializer(source="*")

    class Meta:
        model = Media
        fields = ("id", "uuid", "legend", "media_file", "media_type", "thumbnails")


class ObservationMixin(DynamicFieldsMixin, gis_serializers.GeoFeatureModelSerializer):
    source = serializers.SlugRelatedField("label", read_only=True)
    subtype = serializers.SlugRelatedField(
        "label", source="observation_subtype", read_only=True
    )

    class Meta:
        model = Observation
        geo_field = "location"
        fields = (
            "id",
            "uuid",
            "comments",
            "event_date",
            "source",
            "subtype",
        )
        write_only_fields = ("observation_subtype__id",)


class ObservationListSerializer(ObservationMixin):
    first_photo = MediaSerializer(read_only=True)

    class Meta(ObservationMixin.Meta):
        fields = ObservationMixin.Meta.fields + ("first_photo",)


class ObservationDetailSerializer(ObservationMixin):
    medias = MediaSerializer(many=True, read_only=True)

    class Meta(ObservationMixin.Meta):
        fields = ObservationMixin.Meta.fields + ("medias",)
