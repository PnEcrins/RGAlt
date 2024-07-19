# uncomment and set settings here to use S3 for media and static files
# https://django-storages.readthedocs.io/en/latest/backends/amazon-S3.html#authentication-settings
#
from storages.backends.s3 import S3Storage


class StaticStorage(S3Storage):
    location = "static"
    default_acl = "public-read"


class MediaStorage(S3Storage):
    default_acl = "public-read"


STORAGES = {
    "default": {
        "BACKEND": "project.settings.MediaStorage",
        "OPTIONS": {},
    },
    "staticfiles": {
        "BACKEND": "project.settings.StaticStorage",
        "OPTIONS": {},
    },
}
