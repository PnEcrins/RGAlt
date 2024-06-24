from django.conf import settings
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter

from project import api

app_name = "api"

router = DefaultRouter()

router.register(r"events", api.EventViewSet, basename="events")
router.register(r"accounts", api.AccountViewSet, basename="accounts")

urlpatterns = [
    path(
        "api/schema/",
        SpectacularAPIView.as_view(
            urlconf="project.api.urls",
            custom_settings=settings.API_SWAGGER_SETTINGS,
        ),
        name="schema",
    ),
    path(
        "api/swagger/",
        SpectacularSwaggerView.as_view(url_name="api:schema"),
        name="swagger-ui",
    ),
    path("api/settings/", api.SettingsApiView.as_view(), name="settings"),
    path("api/", include(router.urls)),
]
