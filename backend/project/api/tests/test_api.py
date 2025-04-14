from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from project.observations.models import ObservationCategory
from project.observations.tests.factories import ObservationFactory


class ObservationAPITestCase(APITestCase):
    """Test the observations API."""

    @classmethod
    def setUpTestData(cls):
        """Set up test data."""
        cls.category = ObservationCategory.add_root(label="Test category")
        cls.observations = ObservationFactory.create_batch(10, category=cls.category)
        cls.url_json = f"{reverse('api:observations-list')}?format=json"
        cls.url_geojson = f"{reverse('api:observations-list')}?format=geojson"

    def test_list_observations_json(self):
        """Test listing observations in JSON format."""
        response = self.client.get(self.url_json)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 10)

    def test_list_observations_geojson(self):
        """Test listing observations in GeoJSON format."""
        response = self.client.get(self.url_geojson)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("type", response.data)
        self.assertEqual(response.data["type"], "FeatureCollection")
        self.assertIn("features", response.data)
        self.assertEqual(len(response.data["features"]), 10)
        # Check that each feature has the required GeoJSON properties
        for feature in response.data["features"]:
            self.assertEqual(feature["type"], "Feature")
            self.assertIn("geometry", feature)
            self.assertIn("properties", feature)
            self.assertIn("id", feature)

    def test_pagination_json(self):
        """Test pagination with JSON format."""
        # Test with page_size=5
        url = f"{self.url_json}&page_size=5"
        response = self.client.get(url)
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(data["results"]), 5, data)
        self.assertIn("next", data)
        self.assertIsNotNone(data["next"])
        self.assertIn("previous", data)
        self.assertIsNone(data["previous"])
        self.assertIn("count", data)
        self.assertEqual(data["count"], 10)

        # Test second page
        response = self.client.get(f"{self.url_json}&page_size=5&page=2")
        data = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("results", data)
        self.assertEqual(len(data["results"]), 5)
        self.assertIn("next", data)
        self.assertIsNone(data["next"])
        self.assertIn("previous", data)
        self.assertIsNotNone(data["previous"])

    def test_pagination_geojson(self):
        """Test pagination with GeoJSON format."""
        # Test with page_size=5
        response = self.client.get(f"{self.url_geojson}&page_size=5")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "FeatureCollection")
        self.assertIn("features", response.data)
        self.assertEqual(len(response.data["features"]), 5)
        # Check pagination metadata
        self.assertIn("next", response.data)
        self.assertIsNotNone(response.data["next"])
        self.assertIn("previous", response.data)
        self.assertIsNone(response.data["previous"])
        self.assertIn("count", response.data)
        self.assertEqual(response.data["count"], 10)

        # Test second page
        response = self.client.get(f"{self.url_geojson}&page_size=5&page=2")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "FeatureCollection")
        self.assertIn("features", response.data)
        self.assertEqual(len(response.data["features"]), 5)
        # Check pagination metadata
        self.assertIn("next", response.data)
        self.assertIsNone(response.data["next"])
        self.assertIn("previous", response.data)
        self.assertIsNotNone(response.data["previous"])

    def test_detail_observation_json(self):
        """Test retrieving a single observation in JSON format."""
        observation = self.observations[0]
        url = reverse("api:observations-detail", kwargs={"uuid": observation.uuid})
        response = self.client.get(url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["uuid"], str(observation.uuid))
        self.assertEqual(response.data["name"], observation.name)
        self.assertEqual(response.data["comments"], observation.comments)

    def test_detail_observation_geojson(self):
        """Test retrieving a single observation in GeoJSON format."""
        observation = self.observations[0]
        url = reverse(
            "api:observations-detail",
            kwargs={"uuid": observation.uuid, "format": "geojson"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["type"], "Feature")
        self.assertIn("geometry", response.data)
        self.assertIn("properties", response.data)
        self.assertEqual(response.data["id"], str(observation.uuid))
        self.assertEqual(response.data["properties"]["name"], observation.name)
        self.assertEqual(response.data["properties"]["comments"], observation.comments)
