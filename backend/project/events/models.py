from uuid import uuid4

from django.contrib.gis.db import models
from django.utils.translation import gettext_lazy as _
from django.views.generic.dates import timezone_today

from project.utils.db.mixins import TimeStampMixin


class Source(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.label

    class Meta:
        verbose_name = _("Source")
        verbose_name_plural = _("Sources")
        ordering = ["label"]


class EventType(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    pictogram = models.ImageField(upload_to="event_types", verbose_name=_("Pictogram"))

    def __str__(self):
        return self.label

    class Meta:
        verbose_name = _("Event type")
        verbose_name_plural = _("Event types")
        ordering = ["label"]


class EventSubType(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    event_type = models.ForeignKey(
        EventType, on_delete=models.PROTECT, related_name="sub_types"
    )
    pictogram = models.ImageField(upload_to="event_types", verbose_name=_("Pictogram"))

    def __str__(self):
        return f"{self.label} ({self.event_type})"

    class Meta:
        verbose_name = _("Event sub-type")
        verbose_name_plural = _("Event sub-types")
        ordering = ["event_type__label", "label"]


class Event(TimeStampMixin):
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)
    observer = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    comments = models.TextField()
    event_date = models.DateField(default=timezone_today, db_index=True)
    source = models.ForeignKey(Source, on_delete=models.PROTECT)
    event_subtype = models.ForeignKey(EventSubType, on_delete=models.PROTECT)
    location = models.PointField(srid=4326, verbose_name=_("Location"))

    def __str__(self):
        return str(self.uuid)

    class Meta:
        verbose_name = _("Event")
        verbose_name_plural = _("Events")
        ordering = ["-created_at"]


class Media(TimeStampMixin):
    class MediaType(models.TextChoices):
        IMAGE = "image", _("Image")
        VIDEO = "video", _("Video")

    media_file = models.FileField(upload_to="media")
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)
    media_type = models.CharField(
        max_length=10, choices=MediaType.choices, default=MediaType.IMAGE, db_index=True
    )
    legend = models.CharField(max_length=100, blank=True, default="")
    event = models.ForeignKey(
        Event, on_delete=models.CASCADE, related_name="medias", verbose_name=_("Event")
    )

    class Meta:
        verbose_name = _("Media")
        verbose_name_plural = _("Medias")
        ordering = ["created_at"]
