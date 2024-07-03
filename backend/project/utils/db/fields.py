from django.db import models

from project.utils.db.validators import (
    validate_svg_file_content,
    validate_svg_file_extension,
)


class SVGFileField(models.FileField):
    default_validators = [validate_svg_file_extension, validate_svg_file_content]
