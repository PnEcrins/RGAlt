from . import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

INSTALLED_APPS += [  # noqa
    "debug_toolbar",
]

MIDDLEWARE = [
    "debug_toolbar.middleware.DebugToolbarMiddleware",
] + MIDDLEWARE  # noqa

DEBUG_TOOLBAR_CONFIG = {
    "SHOW_TOOLBAR_CALLBACK": lambda request: True,
    "IS_RUNNING_TESTS": False,
}
