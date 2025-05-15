from rest_framework_gis.serializers import GeoFeatureModelSerializer


def override_serializer(format_output, base_serializer_class):
    """Override Serializer switch output format and dimension data"""
    if format_output == "geojson":

        class GeneratedGeoSerializer(GeoFeatureModelSerializer, base_serializer_class):
            class Meta(base_serializer_class.Meta):
                pass

        final_class = GeneratedGeoSerializer
    else:
        final_class = base_serializer_class

    return final_class
