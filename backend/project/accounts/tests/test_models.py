from django.test import TestCase


class AccountTestCase(TestCase):
    def test_is_staff(self):
        """Test that is_staff is same value as is_superuser"""
