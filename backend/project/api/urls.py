from django.conf import settings
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from project.api import views as api
from project.api.views import AccountViewSet

app_name = "api"

router = DefaultRouter()

router.register(r"observations", api.ObservationViewSet, basename="observations")
router.register(
    r"accounts/me/observations",
    api.AccountObservationViewset,
    basename="account-observations",
)

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
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path(
        "api/accounts/me/",
        AccountViewSet.as_view(
            {
                "get": "retrieve",
                "put": "update",
                "patch": "partial_update",
                "delete": "destroy",
            }
        ),
        name="me",
    ),
    path(
        "api/accounts/sign-up/",
        AccountViewSet.as_view(
            {
                "post": "signup",
            }
        ),
        name="me",
    ),
    path("api/", include(router.urls)),
]
