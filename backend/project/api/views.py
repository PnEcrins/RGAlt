from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import (
    DestroyModelMixin,
    RetrieveModelMixin,
    UpdateModelMixin,
)
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.viewsets import GenericViewSet

from project.accounts.models import User
from project.api.filters import ObservationFilterSet
from project.api.serializers.accounts import AccountSerializer
from project.api.serializers.common import SettingsSerializer
from project.api.serializers.observations import (
    ObservationDetailSerializer,
    ObservationListSerializer,
    ObservationTypeSerializer,
)
from project.observations.models import Observation, ObservationType


class SettingsApiView(GenericAPIView):
    serializer_class = SettingsSerializer

    def get(self, request):
        data = {}
        observation_types = ObservationType.objects.prefetch_related("sub_types").all()
        observation_types_serialized = ObservationTypeSerializer(
            observation_types, many=True, context={"request": request}
        )
        data["observation_types"] = observation_types_serialized.data
        data["observation_public_url"] = reverse(
            "api:observations-list", request=request
        )
        return Response(data)


class ObservationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Observation.objects.all()
        .select_related("source", "observation_subtype__observation_type")
        .prefetch_related("medias")
    )
    filter_backends = (DjangoFilterBackend,)
    filterset_class = ObservationFilterSet

    def get_serializer_class(self):
        if self.action == "list":
            return ObservationListSerializer
        return ObservationDetailSerializer


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

    @action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
    def signup(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AccountObservationViewset(viewsets.ModelViewSet):
    filter_backends = (DjangoFilterBackend,)
    filterset_class = ObservationFilterSet
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return (
            self.request.user.observations.all()
            .select_related("source", "observation_subtype__observation_type")
            .prefetch_related("medias")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ObservationListSerializer
        return ObservationDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
