import os

import requests
from django.conf import settings
from django.contrib.gis.gdal import DataSource
from django.core.files.base import ContentFile
from django.core.management import BaseCommand, CommandError
from django.utils.text import slugify

from project.accounts.models import User
from project.observations.models import Media, Observation, ObservationCategory, Source


class Command(BaseCommand):
    help = "Import old data"
    file_path = settings.CONF_DIR / "evenements.geojson"
    media_base_url = "https://websig.ecrins-parcnational.fr/index.php/view/media/getMedia?repository=rgalt&project=rgalt&path="
    source = None
    mapping_category = {
        1: "Avalanche",
        2: "Chablis",
        3: "Chute de blocs",
        4: "Crue torrentielle",
        5: "Incendie",
        6: "Crue torrentielle",
        7: "Lave torrentielle",
        8: "Crue torrentielle",
        9: "Volis",
        10: "Formation d'un nouveau lac glaciaire",
        11: "Glissement de terrain",
        12: "Formation d'un nouveau lac glaciaire",
    }

    def get_source(self):
        if not self.source:
            self.source, _ = Source.objects.get_or_create(label="LizMap")
            if _:
                self.stdout.write("Source 'LizMap' created.")
        return self.source

    def get_category(self, feature):
        category = ObservationCategory.objects.filter(
            label=self.mapping_category.get(feature.get("id_event_type"))
        ).last()
        if category:
            return category
        else:
            return ObservationCategory.add_root(
                label=self.mapping_category.get(feature.get("id_event_type")),
            )

    def get_user(self, feature):
        observer = feature.get("observers")
        if observer:
            email = f"{slugify(observer)}@fake.org"
            first_name = feature.get("observers").split(" ")[0]
            last_name = feature.get("observers").split(" ")[-1]

            return User.objects.get_or_create(
                email=email,
                defaults={
                    "email": email,
                    "is_active": False,
                    "first_name": first_name,
                    "last_name": last_name,
                },
            )[0]

    def add_arguments(self, parser):
        parser.add_argument("file_path", type=str)

    def handle(self, *args, **options):
        file_path = settings.CONF_DIR / options["file_path"]
        if not os.path.exists(file_path):
            raise CommandError(
                f"File {options["file_path"]} does not exist in config directory"
            )
        Observation.objects.all().delete()
        ds = DataSource(self.file_path)

        layer = ds[0]
        self.stdout.write(f"Importing {len(layer)} observations")
        source = self.get_source()

        for feature in layer:
            location = feature.geom.geos
            name = feature.get("name_event")
            event_date = feature.get("date_event") or feature.get("date_create")
            description = feature.get("description")
            category = self.get_category(feature)
            observation = Observation.objects.create(
                name=name or "",
                location=location,
                event_date=event_date,
                comments=description or "",
                category=category,
                source=source,
                observer=self.get_user(feature),
            )
            self.stdout.write("Observation created...", ending="")
            picture_path = feature.get("picture_path")
            if picture_path:
                try:
                    picture_response = requests.get(self.media_base_url + picture_path)
                    if picture_response.status_code != 200:
                        raise Exception(
                            f"Error while downloading picture: {picture_path}"
                        )
                    picture_data = picture_response.content
                    content_file = ContentFile(
                        picture_data, name=picture_path.split("/")[-1]
                    )
                    Media.objects.create(
                        observation=observation,
                        media_file=content_file,
                        legend=picture_path or "",
                    )
                    self.stdout.write("with picture.")

                except Exception as e:
                    self.stdout.write(f"{e}")

            else:
                self.stdout.write("without picture.")
