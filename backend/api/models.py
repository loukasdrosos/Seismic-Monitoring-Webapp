from django.db import models

class Earthquake(models.Model):
    """
    Model representing an earthquake event.
    """
    time = models.DateTimeField()
    latitude = models.FloatField()
    longitude = models.FloatField()
    depth = models.FloatField()
    magnitude = models.FloatField()
    
    class Meta:
        unique_together = ('time', 'latitude', 'longitude', 'depth', 'magnitude')
        ordering = ['-time']  # Ordering: latest first

    def __str__(self):
        return f"{self.time} | M{self.magnitude}M | Lat: {self.latitude}N | Lon: {self.longitude}E | Depth: {self.depth} km"