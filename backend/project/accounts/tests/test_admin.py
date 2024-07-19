from django.test import TestCase

from .factories import SuperUserFactory, UserFactory


class AccountAdminTestCase(TestCase):
    def test_superuser_ca(self):
        """Test that only superuser can log in to the admin site."""
        simple_user = UserFactory()
        self.client.force_login(simple_user)
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 302)
        super_user = SuperUserFactory()
        self.client.force_login(super_user)
        response = self.client.get("/admin/")
        self.assertEqual(response.status_code, 200)
