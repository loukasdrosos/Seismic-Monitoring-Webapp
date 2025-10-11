from rest_framework import serializers
from .models import Earthquake

class EarthquakeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Earthquake model.
    """
    time = serializers.SerializerMethodField()
    latitude = serializers.SerializerMethodField()
    longitude = serializers.SerializerMethodField()
    depth = serializers.SerializerMethodField()

    class Meta:
        model = Earthquake
        fields = ['id', 'time', 'latitude', 'longitude', 'depth', 'magnitude']

    def get_time(self, obj):
        return obj.time.strftime("%d-%m-%Y %H:%M:%S UTC")

    def get_latitude(self, obj):
        return f"{obj.latitude}°N"
    
    def get_longitude(self, obj):
        return f"{obj.longitude}°E"
    
    def get_depth(self, obj):
        return f"{obj.depth} km"
