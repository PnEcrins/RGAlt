from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.db.models import Q
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from sorl.thumbnail import get_thumbnail
from treebeard.admin import TreeAdmin
from treebeard.forms import movenodeform_factory

from project.observations.models import (
    Area,
    Media,
    Observation,
    ObservationCategory,
    Source,
)


class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    fields = ("legend", "media_type", "media_file", "media_preview")
    readonly_fields = ("media_preview", "uuid")

    @admin.display(description=_("Preview"))
    def media_preview(self, obj):
        # ex. the name of column is "image"
        if obj.media_file:
            if obj.media_type == "image":
                return mark_safe(
                    '<img src="{0}" style="object-fit:contain" />'.format(
                        get_thumbnail(obj.media_file, "150x150", format="PNG").url
                    )
                )
            elif obj.media_type == "video":
                return mark_safe(
                    f"""
                    <video controls width="250">
                      <source src="{obj.media_file.url}" />
                      Download
                      <a href="{obj.media_file.url}">Video</a>
                      video.
                    </video>
                    """
                )
        return "-"


@admin.register(ObservationCategory)
class ObservationCategoryAdmin(TreeAdmin):
    form = movenodeform_factory(ObservationCategory)
    list_display = ("label", "description", "picto_preview")
    search_fields = ("label", "description")
    ordering = ("label",)
    readonly_fields = ("picto_preview",)

    @admin.display(description=_("Preview"))
    def picto_preview(self, obj):
        # ex. the name of column is "image"
        if obj.pictogram:
            return mark_safe(
                '<img src="{0}" width="150" height="150" style="object-fit:contain" alt="picto"/>'.format(
                    obj.pictogram.url
                )
            )


@admin.register(Observation)
class ObservationAdmin(GISModelAdmin):
    list_display = ("uuid", "name", "category", "event_date", "observer")
    list_filter = ("category", "event_date")
    ordering = ("-event_date",)
    date_hierarchy = "event_date"
    readonly_fields = ("uuid",)
    inlines = [MediaInline]
    fieldsets = (
        (
            None,
            {
                "fields": (
                    ("category", "name"),
                    ("event_date", "observer"),
                    "comments",
                    "location",
                )
            },
        ),
        (
            _("Other"),
            {
                "fields": (("source", "uuid"),),
            },
        ),
    )

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("category", "source", "observer")
        )

    def get_form(self, request, obj=None, **kwargs):
        # filter to only select categories with no children
        form = super().get_form(request, obj, **kwargs)
        filters = Q()
        if obj and obj.pk:
            # special case when category move, allow to keep current category
            filters = Q(pk=obj.pk)
        filters |= Q(numchild=0)
        form.base_fields["category"].queryset = ObservationCategory.objects.filter(
            filters
        )
        return form


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("label", "description")
    search_fields = ("label", "description")
    ordering = ("label",)


@admin.register(Area)
class AreaAdmin(GISModelAdmin):
    list_display = ("id", "name")
