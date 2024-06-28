from django.test import TestCase


class AccountAdminTestCase(TestCase):
    def test_superuser_ca(self):
        """Test that only superuser can login to the admin site."""
