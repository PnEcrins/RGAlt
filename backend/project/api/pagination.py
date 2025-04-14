from rest_framework.pagination import PageNumberPagination as BasePageNumberPagination


class PageNumberPagination(BasePageNumberPagination):
    """
    Custom pagination class that sets the default page size and maximum page size.
    """

    page_size_query_param = "page_size"
