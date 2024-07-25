from django.contrib.gis.db import models
from django.contrib.postgres.functions import RandomUUID
from django.db.models import Func
from django.utils.translation import gettext_lazy as _
from django.views.generic.dates import timezone_today
from sorl.thumbnail import delete
from treebeard.mp_tree import MP_Node

from project.utils.db.fields import SVGFileField
from project.utils.db.mixins import TimeStampMixin


class Source(TimeStampMixin):
    label = models.CharField(max_length=100, unique=True, verbose_name=_("Label"))
    description = models.TextField(blank=True, verbose_name=_("Description"))

    def __str__(self):
        return self.label

    class Meta:
        verbose_name = _("Source")
        verbose_name_plural = _("Sources")
        ordering = ["label"]


class ObservationCategory(TimeStampMixin, MP_Node):
    label = models.CharField(max_length=100, unique=True, verbose_name=_("Label"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    pictogram = SVGFileField(
        upload_to="observation_categories", verbose_name=_("Pictogram"), blank=True
    )

    def __str__(self):
        parent = self.get_parent()
        if parent:
            return f"{self.label} ({parent})"
        return f"{self.label}"

    @property
    def children(self):
        return self.get_children()

    @property
    def inherited_pictogram(self):
        """Return parent pictogram if current pictogram is empty."""
        if not self.pictogram:
            parent = self.get_ancestors().filter(pictogram__isnull=False).last()
            return parent.pictogram if parent else None
        return self.pictogram

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")


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
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="observations",
        verbose_name=_("Observer"),
    )
    comments = models.TextField(blank=True, default="", verbose_name=_("Comments"))
    event_date = models.DateField(
        default=timezone_today, db_index=True, verbose_name=_("Event date")
    )
    source = models.ForeignKey(
        Source,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name=_("Source"),
    )
    category = models.ForeignKey(
        ObservationCategory, on_delete=models.PROTECT, verbose_name=_("Category")
    )
    location = models.PointField(srid=4326, verbose_name=_("Location"))

    @property
    def main_picture(self):
        return self.medias.filter(media_type=MediaType.IMAGE).first()

    @property
    def public_name(self):
        """Return category label if name is empty."""
        return self.name or self.category.label

    @public_name.setter
    def public_name(self, value):
        self.name = value

    def __str__(self):
        return str(self.uuid)

    class Meta:
        verbose_name = _("Observation")
        verbose_name_plural = _("Observations")
        ordering = ["-created_at"]


class Media(TimeStampMixin):
    media_file = models.FileField(upload_to="media", verbose_name=_("File"))
    uuid = models.UUIDField(
        editable=False, unique=True, db_index=True, db_default=RandomUUID()
    )
    media_type = models.CharField(
        max_length=10,
        choices=MediaType.choices,
        default=MediaType.IMAGE,
        db_index=True,
        verbose_name=_("Type"),
    )
    legend = models.CharField(
        max_length=100, blank=True, default="", verbose_name=_("Legend")
    )
    observation = models.ForeignKey(
        Observation,
        on_delete=models.CASCADE,
        related_name="medias",
        verbose_name=_("Observation"),
    )

    def delete(self, using=None, keep_parents=False):
        """Delete media file and thumbnails after deleting the instance."""
        delete(self.media_file)
        super().delete(using, keep_parents)

    class Meta:
        verbose_name = _("Media")
        verbose_name_plural = _("Medias")
        ordering = ["created_at"]


class Area(TimeStampMixin):
    name = models.CharField(max_length=100, unique=True, verbose_name=_("Name"))
    description = models.TextField(blank=True, verbose_name=_("Description"))
    min_zoom = models.PositiveSmallIntegerField(default=7, verbose_name=_("Min. zoom"))
    max_zoom = models.PositiveSmallIntegerField(default=15, verbose_name=_("Max. zoom"))
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
