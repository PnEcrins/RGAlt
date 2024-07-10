from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.contrib.postgres.functions import RandomUUID
from django.db import models
from django.db.models import Value
from django.db.models.functions import Now, Lower, Upper, Left, Right, Length
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

from project.accounts.managers import UserManager
from project.utils.db.functions import ConcatOp


class User(AbstractBaseUser, PermissionsMixin):
    REQUIRED_FIELDS = ["first_name", "last_name"]
    uuid = models.UUIDField(
        editable=False, unique=True, db_index=True, db_default=RandomUUID()
    )
    email = models.EmailField(
        _("email address"),
        unique=True,
        error_messages={"unique": _("A user with that email already exists.")},
    )
    first_name = models.CharField(_("first name"), max_length=150)
    last_name = models.CharField(_("last name"), max_length=150)
    date_joined = models.DateTimeField(
        _("date joined"), default=timezone.now, db_default=Now()
    )
    is_active = models.BooleanField(
        _("active"),
        default=True,
        help_text=_(
            "Designates whether this user should be treated as active. "
            "Unselect this instead of deleting accounts."
        ),
    )
    nickname = models.GeneratedField(
        expression=ConcatOp(
            Upper(Left("first_name", 1)),
            Lower(Right("first_name", Length("first_name") - 1)),
            Value(" "),
            Upper(Left("last_name", 1)),
            Value("."),
        ),
        output_field=models.CharField(max_length=150),
        db_persist=True,
    )
    objects = UserManager()

    EMAIL_FIELD = "email"
    USERNAME_FIELD = "email"

    @property
    def is_staff(self):
        return self.is_superuser

    class Meta:
        verbose_name = _("user")
        verbose_name_plural = _("users")
        ordering = ["-date_joined"]
