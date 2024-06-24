from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from django.utils.safestring import mark_safe
from sorl.thumbnail import get_thumbnail

from project.events.models import Event, EventSubType, EventType, Media, Source


class SubTypeInline(admin.TabularInline):
    model = EventSubType
    extra = 0
    fields = ("label", "description", "pictogram", "picto_preview")
    readonly_fields = ("picto_preview",)

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


@admin.register(EventType)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ("label", "description", "picto_preview")
    search_fields = ("label", "description")
    ordering = ("label",)
    inlines = [SubTypeInline]

    def picto_preview(self, obj):
        # ex. the name of column is "image"
        return mark_safe(
            '<img src="{0}" width="150" height="150" style="object-fit:contain" />'.format(
                obj.pictogram.url
            )
        )


@admin.register(EventSubType)
class EventSubTypeAdmin(admin.ModelAdmin):
    list_display = ("label", "event_type", "description", "picto_preview")
    search_fields = ("label", "description")
    list_filter = ("event_type",)
    ordering = ("label",)

    def picto_preview(self, obj):
        # ex. the name of column is "image"
        return mark_safe(
            '<img src="{0}" width="150" height="150" style="object-fit:contain" />'.format(
                obj.pictogram.url
            )
        )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("event_type")


@admin.register(Event)
class EventAdmin(GISModelAdmin):
    list_display = ("event_subtype", "event_date", "observer")
    list_filter = ("event_subtype", "event_date")
    ordering = ("-event_date",)
    date_hierarchy = "event_date"
    readonly_fields = ("uuid",)
    inlines = [MediaInline]

    def get_queryset(self, request):
        return (
            super()
            .get_queryset(request)
            .select_related("event_subtype__event_type", "source", "observer")
        )


@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("label", "description")
    search_fields = ("label", "description")
    ordering = ("label",)
