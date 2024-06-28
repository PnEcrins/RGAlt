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
from project.api.filters import EventFilterSet
from project.api.serializers.accounts import AccountSerializer
from project.api.serializers.common import SettingsSerializer
from project.api.serializers.events import (
    EventDetailSerializer,
    EventListSerializer,
    EventTypeSerializer,
)
from project.events.models import Event, EventType


class SettingsApiView(GenericAPIView):
    serializer_class = SettingsSerializer

    def get(self, request):
        data = {}
        event_types = EventType.objects.prefetch_related("sub_types").all()
        event_types_serialized = EventTypeSerializer(
            event_types, many=True, context={"request": request}
        )
        data["event_types"] = event_types_serialized.data
        data["event_url"] = reverse("api:events-list", request=request)
        return Response(data)


class EventViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Event.objects.all().select_related("source", "event_subtype__event_type")
    filter_backends = (DjangoFilterBackend,)
    filterset_class = EventFilterSet

    def get_serializer_class(self):
        if self.action == "list":
            return EventListSerializer
        return EventDetailSerializer


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


class AccountEventViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.events.all()

    def get_serializer_class(self):
        if self.action == "list":
            return EventListSerializer
        return EventDetailSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)
