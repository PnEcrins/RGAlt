from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import GenericAPIView
from rest_framework.mixins import CreateModelMixin
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework.viewsets import GenericViewSet

from project.accounts.models import User
from project.api.filters import EventFilterSet
from project.api.serializers import (
    AccountSerializer,
    EventDetailSerializer,
    EventListSerializer,
    EventTypeSerializer,
    SettingsSerializer,
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


class EventViewSet(viewsets.ModelViewSet):
    filter_backends = (DjangoFilterBackend,)
    filterset_class = EventFilterSet

    def get_serializer_class(self):
        if self.action == "list":
            return EventListSerializer
        return EventDetailSerializer

    def get_queryset(self):
        qs = Event.objects.all().select_related("source", "event_subtype__event_type")
        if self.action not in ["list", "retrieve"] or self.request.user.is_anonymous:
            # list and retrieve are public
            if self.request.user.is_anonymous:
                # anonymous can't change anything
                qs = qs.none()
            elif not self.request.user.is_staff and not self.request.user.is_superuser:
                # nor anonymous, nor admin
                qs = self.request.user.events.all()
        return qs

    def perform_create(self, serializer):
        observer = self.request.user if self.request.user.is_authenticated else None
        serializer.save(observer=observer)


class AccountViewSet(CreateModelMixin, GenericViewSet):
    queryset = User.objects.all()
    serializer_class = AccountSerializer

    @action(detail=False, methods=["get"])
    def mine(self, request, *args, **kwargs):
        if self.request.user.is_anonymous:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
