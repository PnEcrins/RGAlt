from django.test import TestCase

from .factories import SuperUserFactory, UserFactory


class AccountTestCase(TestCase):
    def test_is_staff(self):
        """Test that is_staff is same value as is_superuser"""
        user = UserFactory()
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        super_user = SuperUserFactory()
        self.assertTrue(super_user.is_staff)
        self.assertTrue(super_user.is_superuser)
