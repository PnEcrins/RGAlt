from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from rest_framework.generics import GenericAPIView, get_object_or_404
from rest_framework.mixins import (
    DestroyModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
)
from rest_framework.renderers import JSONRenderer
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet
from rest_framework_gis.filters import InBBoxFilter
from rest_framework_gis.pagination import GeoJsonPagination

from project.accounts.models import User
from project.api.filters import ObservationFilterSet
from project.api.pagination import PageNumberPagination
from project.api.renderers import GeoJSONRenderer
from project.api.serializers import override_serializer
from project.api.serializers.accounts import AccountSerializer
from project.api.serializers.common import (
    EndpointsSerializer,
    SettingsSerializer,
    StatsSerializer,
)
from project.api.serializers.observations import (
    MediaSerializer,
    ObservationDetailSerializer,
    ObservationListSerializer,
)
from project.observations.models import Area, Media, Observation, ObservationCategory


class SettingsApiView(GenericAPIView):
    serializer_class = SettingsSerializer

    def get(self, request):
        serializer = self.get_serializer(
            {
                "areas": Area.objects.all(),
                "endpoints": EndpointsSerializer(
                    context=self.get_serializer_context()
                ).data,
                "categories": ObservationCategory.objects.filter(depth=1),
            }
        )
        return Response(serializer.data)


class ObservationViewsSetMixin:
    queryset = (
        Observation.objects.all()
        .select_related("source", "category", "observer")
        .prefetch_related("medias")
    )
    filter_backends = (DjangoFilterBackend, InBBoxFilter, OrderingFilter)
    filterset_class = ObservationFilterSet
    lookup_field = "uuid"
    ordering_fields = ["event_date", "created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return ObservationListSerializer
        elif self.action in ("add_media", "update_media"):
            return MediaSerializer
        return ObservationDetailSerializer


class ObservationViewSet(ObservationViewsSetMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    pagination_class = PageNumberPagination
    renderer_classes = [JSONRenderer, GeoJSONRenderer]

    @property
    def paginator(self):
        """Dynamic override paginator according format required and page size specified (None is no pagination)"""
        if self.request.query_params.get("page_size"):
            renderer, media_type = self.perform_content_negotiation(self.request)
            if getattr(renderer, "format") == "geojson":
                self.pagination_class = GeoJsonPagination
            paginator = super().paginator
        else:
            paginator = None

        return paginator

    def get_serializer_class(self):
        """Dynamic override json serializer by geojson serializer according format required"""
        base_serializer_class = super().get_serializer_class()
        renderer, media_type = self.perform_content_negotiation(self.request)
        format_output = getattr(renderer, "format", "json")
        return override_serializer(format_output, base_serializer_class)


class AccountViewSet(
    UpdateModelMixin,
    RetrieveModelMixin,
    DestroyModelMixin,
    GenericViewSet,
):
    queryset = User.objects.all()
    serializer_class = AccountSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class SignUpView(GenericAPIView):
    serializer_class = AccountSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AccountObservationViewset(ObservationViewsSetMixin, viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            self.request.user.observations.all()
            .select_related("source", "category", "observer")
            .prefetch_related("medias")
        )

    def perform_create(self, serializer):
        serializer.save(observer=self.request.user)

    @action(
        detail=True,
        methods=["post"],
        serializer_class=MediaSerializer,
        url_name="medias",
        url_path="medias",
    )
    def add_media(self, request, *args, **kwargs):
        observation = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(observation=observation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(
        detail=True,
        serializer_class=MediaSerializer,
        methods=["delete", "patch"],
        url_path=r"medias/(?P<uuid_media>[^/.]+)",
    )
    def update_media(self, request, uuid_media, *args, **kwargs):
        observation = self.get_object()
        media = get_object_or_404(Media, uuid=uuid_media, observation=observation)
        if request.method == "DELETE":
            media.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        elif request.method == "PATCH":
            serializer = self.get_serializer(media, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)


class StatsAPIView(GenericAPIView):
    """Provide some stats on application usage"""

    serializer_class = StatsSerializer

    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            {
                "observations": Observation.objects.count(),
                "active_contributors": User.objects.filter(observations__isnull=False)
                .distinct()
                .count(),
            }
        )
        return Response(serializer.data)
