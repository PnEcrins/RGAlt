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
from rest_framework.viewsets import GenericViewSet

from project.accounts.models import User
from project.api.filters import ObservationFilterSet
from project.api.serializers.accounts import AccountSerializer
from project.api.serializers.common import EndpointsSerializer, SettingsSerializer
from project.api.serializers.observations import (
    ObservationDetailSerializer,
    ObservationListSerializer,
)
from project.observations.models import Area, Observation, ObservationCategory


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


class ObservationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = (
        Observation.objects.all()
        .select_related("source", "category")
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

    def get_object(self):
        return self.request.user

    def get_permissions(self):
        if self.action == "signup":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @action(detail=False, methods=["post"])
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
            .select_related("source", "category")
            .prefetch_related("medias")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return ObservationListSerializer
        return ObservationDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
