from django.contrib.gis.db import models
from django.contrib.postgres.functions import RandomUUID
from django.db.models import Func
from django.utils.translation import gettext_lazy as _
from django.views.generic.dates import timezone_today
from treebeard.mp_tree import MP_Node

from project.utils.db.fields import SVGFileField
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


class ObservationCategory(TimeStampMixin, MP_Node):
    label = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    pictogram = SVGFileField(
        upload_to="observation_categories", verbose_name=_("Pictogram"), blank=True
    )
    node_order_by = ["label"]

    def __str__(self):
        parent = self.get_parent()
        if parent:
            return f"{self.label} ({parent})"
        return f"{self.label}"

    @property
    def children(self):
        return self.get_children()

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ["-numchild", "path"]


class MediaType(models.TextChoices):
    IMAGE = "image", _("Image")
    VIDEO = "video", _("Video")


class Observation(TimeStampMixin):
    uuid = models.UUIDField(
        editable=False, unique=True, db_index=True, db_default=RandomUUID()
    )
    name = models.CharField(
        max_length=250, verbose_name=_("Name"), blank=True, null=False, default=""
    )
    observer = models.ForeignKey(
        "accounts.User", on_delete=models.SET_NULL, null=True, blank=True
    )
    comments = models.TextField(blank=True, default="")
    event_date = models.DateField(default=timezone_today, db_index=True)
    source = models.ForeignKey(Source, on_delete=models.SET_NULL, blank=True, null=True)
    category = models.ForeignKey(ObservationCategory, on_delete=models.PROTECT)
    location = models.PointField(srid=4326, verbose_name=_("Location"))

    @property
    def main_picture(self):
        return self.medias.filter(media_type=MediaType.IMAGE).first()

    def __str__(self):
        return str(self.uuid)

    class Meta:
        verbose_name = _("Observation")
        verbose_name_plural = _("Observations")
        ordering = ["-created_at"]


class Media(TimeStampMixin):
    media_file = models.FileField(upload_to="media")
    uuid = models.UUIDField(
        editable=False, unique=True, db_index=True, db_default=RandomUUID()
    )
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


class Area(TimeStampMixin):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    min_zoom = models.PositiveSmallIntegerField(default=7)
    max_zoom = models.PositiveSmallIntegerField(default=15)
    geom = models.PolygonField(srid=4326, verbose_name=_("Geometry"))
    north_west = models.GeneratedField(
        expression=Func(
            Func(
                "geom",
                function="ST_XMIN",
            ),
            Func(
                "geom",
                function="ST_YMAX",
            ),
            function="ST_MAKEPOINT",
        ),
        output_field=models.PointField(srid=4326),
        db_persist=True,
    )
    south_east = models.GeneratedField(
        expression=Func(
            Func(
                "geom",
                function="ST_XMAX",
            ),
            Func(
                "geom",
                function="ST_YMIN",
            ),
            function="ST_MAKEPOINT",
        ),
        output_field=models.PointField(srid=4326),
        db_persist=True,
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _("Area")
        verbose_name_plural = _("Areas")
        ordering = ["name"]
