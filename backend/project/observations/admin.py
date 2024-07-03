from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.utils.safestring import mark_safe
from django.utils.translation import gettext_lazy as _
from sorl.thumbnail import get_thumbnail

from project.observations.models import (
    Media,
    Observation,
    ObservationSubType,
    ObservationType,
    Source,
)


class SubTypeInline(admin.TabularInline):
    model = ObservationSubType
    extra = 0
    fields = ("label", "description", "pictogram", "picto_preview")
    readonly_fields = ("picto_preview",)

    @admin.display(description=_("Preview"))
    def picto_preview(self, obj):
        # ex. the name of column is "image"
        if obj.pictogram:
            return mark_safe(
                '<img src="{0}" width="150" height="150" style="object-fit:contain; background-color: gray;" />'.format(
                    obj.pictogram.url
                )
            )
        return "-"


class MediaInline(admin.TabularInline):
    model = Media
    extra = 0
    fields = ("legend", "media_type", "media_file", "media_preview")
    readonly_fields = ("media_preview", "uuid")

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


@admin.register(ObservationType)
class ObservationTypeAdmin(admin.ModelAdmin):
    list_display = ("label", "description", "picto_preview")
    search_fields = ("label", "description")
    ordering = ("label",)
    inlines = [SubTypeInline]
    readonly_fields = ("picto_preview",)
    fieldsets = (
        (
            None,
            {
                "fields": (
                    (
                        "label",
                        "description",
                    ),
                )
            },
        ),
        (
            _("Pictogram"),
            {
                "fields": (
                    (
                        "picto_preview",
                        "pictogram",
                    ),
                )
            },
        ),
    )

    @admin.display(description=_("Preview"))
    def picto_preview(self, obj):
        # ex. the name of column is "image"
        return mark_safe(
            '<img src="{0}" width="150" height="150" style="object-fit:contain" />'.format(
                obj.pictogram.url
            )
        )


@admin.register(ObservationSubType)
class ObservationSubTypeAdmin(admin.ModelAdmin):
    list_display = ("label", "observation_type", "description", "picto_preview")
    search_fields = ("label", "description")
    list_filter = ("observation_type",)
    ordering = ("label",)

    @admin.display(description=_("Preview"))
    def picto_preview(self, obj):
        # ex. the name of column is "image"
        return mark_safe(
            '<img src="{0}" width="150" height="150" style="object-fit:contain" alt="picto"/>'.format(
                obj.pictogram.url
            )
        )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("observation_type")


@admin.register(Observation)
class ObservationAdmin(GISModelAdmin):
    list_display = ("observation_subtype", "event_date", "observer")
    list_filter = ("observation_subtype", "event_date")
    ordering = ("-event_date",)
    date_hierarchy = "event_date"
    readonly_fields = ("uuid",)
    inlines = [MediaInline]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related(
                "observation_subtype__observation_type", "source", "observer"
            )
        )


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("label", "description")
    search_fields = ("label", "description")
    ordering = ("label",)
