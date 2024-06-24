from django_filters.fields import DateRangeField
from django_filters.rest_framework import FilterSet

from project.events.models import Event


class EventFilterSet(FilterSet):
    event_date = DateRangeField()

    class Meta:
        model = Event
        fields = ["event_date", "event_subtype"]
