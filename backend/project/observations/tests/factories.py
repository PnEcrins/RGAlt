import factory
import factory.fuzzy
from django.contrib.gis.geos import Point, Polygon
from factory import random
from faker import Faker
from faker.providers import geo

from project.accounts.tests.factories import UserFactory
from project.observations.models import Area, Observation, ObservationCategory, Source

fake = Faker()
fake.add_provider(geo)


class FuzzyPolygon(factory.fuzzy.BaseFuzzyAttribute):
    """Yields random polygon"""

    def __init__(self, length=None, **kwargs):
        if length is None:
            length = random.randgen.randrange(3, 20, 1)
        if length < 3:
            raise Exception("Polygon needs to be 3 or greater in length.")
        self.length = length
        super().__init__(**kwargs)

    def get_random_coords(self):
        return (
            fake.longitude(),
            fake.latitude(),
        )

    def fuzz(self):
        prefix = suffix = self.get_random_coords()
        coords = [self.get_random_coords() for __ in range(self.length - 1)]
        return Polygon([prefix] + coords + [suffix])


class AreaFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Area

    name = factory.Faker("city")
    geom = FuzzyPolygon()
    description = factory.Faker("text")


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = ObservationCategory

    label = factory.Faker("word")
    description = factory.Faker("text")


class ObservationFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Observation

    name = factory.Faker("sentence", nb_words=4)
    comments = factory.Faker("text")
    event_date = factory.Faker("date_object")
    location = factory.LazyFunction(
        lambda: Point(float(fake.longitude()), float(fake.latitude()))
    )
    observer = factory.SubFactory(UserFactory)
    source = factory.LazyFunction(
        lambda: Source.objects.create(
            label=factory.Faker("word"),
            description=factory.Faker("text"),
        )
    )
