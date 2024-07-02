from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from project.accounts.models import User


class AccountSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    def save(self, **kwargs):
        super().save()
        if "password" in self.validated_data:
            self.instance.set_password(self.validated_data["password"])
            self.instance.save()

        return self.instance

    class Meta:
        model = User
        fields = (
            "id",
            "uuid",
            "email",
            "is_superuser",
            "last_name",
            "first_name",
            "password",
        )
        read_only_fields = ("is_superuser",)
