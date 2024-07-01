from django.test import TestCase

from project.accounts.tests.factories import UserFactory
from project.api.serializers.accounts import AccountSerializer


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
