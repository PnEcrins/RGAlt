from django_filters import rest_framework as filters
from django_filters.fields import DateRangeField

from project.observations.models import Observation


class ObservationFilterSet(filters.FilterSet):
    event_date = DateRangeField()
    fields = filters.CharFilter(
        method="filter_fields", help_text="filter fields you want to get"
    )

    def filter_fields(self, qs):
        return qs

    class Meta:
        model = Observation
        fields = ["event_date", "category", "fields"]
