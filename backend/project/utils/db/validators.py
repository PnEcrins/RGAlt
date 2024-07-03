from django.core.exceptions import ValidationError
from django.core.validators import FileExtensionValidator


def validate_svg_file_extension(value):
    return FileExtensionValidator(allowed_extensions=["svg"])(value)


# write django validator that check if http://www.w3.org/2000/svg is in file content
def validate_svg_file_content(value):
    content = str(value.read())
    if "http://www.w3.org/2000/svg" not in content:
        raise ValidationError("File is not an SVG file")
