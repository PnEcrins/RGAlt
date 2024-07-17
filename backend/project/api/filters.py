from django_filters import rest_framework as filters

from project.observations.models import Observation, ObservationCategory


class ObservationFilterSet(filters.FilterSet):
    event_date = filters.DateFromToRangeFilter()
    fields = filters.CharFilter(
        method="filter_fields", help_text="filter fields you want to get"
    )
    categories = filters.ModelMultipleChoiceFilter(
        queryset=ObservationCategory.objects.all(),
        field_name="category",
    )

    def filter_fields(self, qs, *args, **kwargs):
        return qs

    class Meta:
        model = Observation
        fields = ["event_date", "categories", "fields"]
