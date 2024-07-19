from django.db.models import Func, TextField


class ConcatOp(Func):
    """
    Concat function alternative to use with GeneratedFields.
    Fixed in Django 5.1 in original Concat function
    """

    arg_joiner = " || "
    function = None
    output_field = TextField()
    template = "%(expressions)s"
