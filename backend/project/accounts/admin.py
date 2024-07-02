from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import Group
from django.utils.translation import gettext_lazy as _

from project.accounts.models import User

admin.site.site_header = admin.site.site_title = _("Regard d'altitude config panel")


class UserAdmin(BaseUserAdmin):
    list_display = (
        "email",
        "first_name",
        "last_name",
        "uuid",
        "is_active",
        "is_superuser",
        "date_joined",
        "last_login",
    )
    list_filter = (
        "is_superuser",
        "is_active",
    )
    search_fields = ("email", "first_name", "last_name", "uuid")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        (
            _("Personal info"),
            {
                "fields": (
                    "first_name",
                    "last_name",
                )
            },
        ),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    )
    readonly_fields = ("date_joined", "last_login", "uuid")


admin.site.register(User, UserAdmin)
admin.site.unregister(Group)
