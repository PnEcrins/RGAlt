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


class ObservationType(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    pictogram = models.ImageField(
        upload_to="observation_types", verbose_name=_("Pictogram")
    )

    def __str__(self):
        return self.label

    class Meta:
        verbose_name = _("Observation type")
        verbose_name_plural = _("Observation types")
        ordering = ["label"]


class ObservationSubType(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    observation_type = models.ForeignKey(
        ObservationType, on_delete=models.PROTECT, related_name="sub_types"
    )
    pictogram = models.ImageField(
        upload_to="observation_types", verbose_name=_("Pictogram")
    )

    def __str__(self):
        return f"{self.label} ({self.observation_type})"

    class Meta:
        verbose_name = _("Observation sub-type")
        verbose_name_plural = _("Observation sub-types")
        ordering = ["observation_type__label", "label"]


class Observation(TimeStampMixin):
    uuid = models.UUIDField(unique=True, default=uuid4, editable=False)
    observer = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    comments = models.TextField()
    event_date = models.DateField(default=timezone_today, db_index=True)
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, blank=True, null=True)
    observation_subtype = models.ForeignKey(
        ObservationSubType, on_delete=models.PROTECT
    )
    location = models.PointField(srid=4326, verbose_name=_("Location"))

    @property
    def first_photo(self):
        return self.medias.first()

    def __str__(self):
        return str(self.uuid)

    class Meta:
        verbose_name = _("Observation")
        verbose_name_plural = _("Observations")
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
    observation = models.ForeignKey(
        Observation,
        on_delete=models.CASCADE,
        related_name="medias",
        verbose_name=_("Observation"),
    )

    class Meta:
        verbose_name = _("Media")
        verbose_name_plural = _("Medias")
        ordering = ["created_at"]
