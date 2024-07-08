from django.test import RequestFactory, TestCase

from project.accounts.tests.factories import UserFactory
from project.api.serializers.accounts import AccountSerializer
from project.api.serializers.common import EndpointsSerializer, SettingsSerializer
from project.observations.models import Area, ObservationCategory
from project.observations.tests.factories import AreaFactory


class AccountSerializerTestCase(TestCase):
    def test_password_check_success_after_change(self):
        """Test password change method"""
        user = UserFactory(password="password")
        self.assertTrue(user.check_password("password"))

        serializer = AccountSerializer(
            instance=user, data={"email": user.email, "password": "new_password"}
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)

        serializer.save()

        user.refresh_from_db()
        self.assertTrue(user.check_password("new_password"))


class SettingsSerializerTestCase(TestCase):
    def test_settings_serializer(self):
        """Test settings serializer"""
        self.maxDiff = None
        AreaFactory.create_batch(5)
        cat_root_1 = ObservationCategory.add_root(label="Root 1")
        cat_root_2 = ObservationCategory.add_root(label="Root 2")
        cat_root_1.add_child(label="Child 1")
        cat_root_1.add_child(label="Child 2")
        serializer = SettingsSerializer(
            {
                "areas": Area.objects.all(),
                "categories": ObservationCategory.objects.filter(depth=1).order_by(
                    "label"
                ),
                "endpoints": EndpointsSerializer().data,
            },
            context={"request": RequestFactory().get("/")},
        )
        data = {
            "categories": [
                {
                    "id": cat_root_1.id,
                    "label": cat_root_1.label,
                    "description": "",
                    "pictogram": None,
                    "children": [
                        {
                            "children": [],
                            "description": "",
                            "id": child.id,
                            "label": child.label,
                            "pictogram": None,
                        }
                        for child in cat_root_1.get_children()
                    ],
                },
                {
                    "id": cat_root_2.id,
                    "description": "",
                    "label": cat_root_2.label,
                    "pictogram": None,
                    "children": [],
                },
            ],
            "areas": [
                {
                    "id": area.id,
                    "name": area.name,
                    "description": area.description,
                    "bbox": [
                        (area.geom.extent[0], area.geom.extent[3]),
                        (area.geom.extent[2], area.geom.extent[1]),
                    ],
                }
                for area in Area.objects.all()
            ],
            "endpoints": {
                "observations": "http://testserver/api/observations/",
                "signup": "http://testserver/api/accounts/sign-up/",
                "token": {
                    "token": "http://testserver/api/token/",
                    "token_refresh": "http://testserver/api/token/refresh/",
                    "token_verify": "http://testserver/api/token/verify/",
                },
                "user": {
                    "me": "http://testserver/api/accounts/me/",
                    "observations": "http://testserver/api/accounts/me/observations/",
                },
            },
        }
        self.assertDictEqual(
            dict(serializer.data),
            dict(sorted(data.items())),
        )
