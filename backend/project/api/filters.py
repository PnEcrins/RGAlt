from django_filters.fields import DateRangeField
from django_filters.rest_framework import FilterSet, filters

from project.events.models import Event


class EventFilterSet(FilterSet):
    event_date = DateRangeField()
    fields = filters.CharFilter(
        method="filter_fields", help_text="filter fields you want to get"
    )

    def filter_fields(self, qs):
        return qs

    class Meta:
        model = Event
        fields = ["event_date", "event_subtype", "fields"]
