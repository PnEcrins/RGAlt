import factory
from factory import faker

from ..models import User


class UserFactory(factory.django.DjangoModelFactory):
    email = faker.Faker("email")
    first_name = faker.Faker("first_name")
    last_name = faker.Faker("last_name")
    password = factory.PostGenerationMethodCall("set_password", "password")
    is_active = True

    class Meta:
        model = User


class SuperUserFactory(UserFactory):
    is_superuser = True
