from django.utils.translation import gettext as _
from drf_dynamic_fields import DynamicFieldsMixin
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from rest_framework_gis import serializers as gis_serializers
from sorl.thumbnail import get_thumbnail

from project.observations.models import (
    Area,
    Media,
    MediaType,
    Observation,
    ObservationCategory,
)


class ObservationCategorySerializer(serializers.ModelSerializer):

    class Meta:
        model = ObservationCategory
        fields = (
            "id",
            "label",
            "description",
            "pictogram",
            "children",
        )

    def get_fields(self):
        fields = super().get_fields()
        fields["children"] = ObservationCategorySerializer(many=True)
        return fields


class ThumbnailSerializer(serializers.Serializer):
    small = serializers.SerializerMethodField()
    medium = serializers.SerializerMethodField()
    large = serializers.SerializerMethodField()

    def get_thumbnail_by_size(
        self, obj, height=100, width=100, format="JPEG", quality=70
    ):
        if obj.media_type == MediaType.IMAGE:
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
    thumbnails = ThumbnailSerializer(source="*", read_only=True)

    class Meta:
        model = Media
        fields = ("uuid", "legend", "media_file", "media_type", "thumbnails")


class ObservationMixin(DynamicFieldsMixin, gis_serializers.GeoFeatureModelSerializer):
    source = serializers.SerializerMethodField()
    name = serializers.CharField(source="public_name", required=False, allow_blank=True)
    observer = serializers.SlugRelatedField("nickname", read_only=True)

    def get_source(self, obj):
        return obj.source.label if obj.source else _("Regard d'altitude")

    class Meta:
        model = Observation
        geo_field = "location"
        id_field = "uuid"
        fields = (
            "uuid",
            "name",
            "comments",
            "event_date",
            "source",
            "category",
            "observer",
        )
        write_only_fields = ("category__id",)


class ObservationListSerializer(ObservationMixin):
    main_picture = MediaSerializer(read_only=True)

    class Meta(ObservationMixin.Meta):
        fields = ObservationMixin.Meta.fields + ("main_picture",)


class ObservationDetailSerializer(ObservationMixin):
    medias = MediaSerializer(many=True, read_only=True)

    class Meta(ObservationMixin.Meta):
        fields = ObservationMixin.Meta.fields + ("medias",)


class AreaSerializer(serializers.ModelSerializer):
    bbox = serializers.SerializerMethodField()

    def get_bbox(self, obj):
        return [obj.north_west.coords, obj.south_east.coords]

    class Meta:
        model = Area
        fields = ("id", "name", "description", "bbox", "min_zoom", "max_zoom")
