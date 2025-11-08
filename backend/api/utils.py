from django.utils import timezone
from datetime import datetime
from .models import Earthquake

def apply_filters(queryset, params):
    # Extract query parameters
    min_date_str = params.get('min_date', None)
    max_date_str = params.get('max_date', None)
    min_latitude = params.get('min_latitude', None)
    max_latitude = params.get('max_latitude', None)
    min_longitude = params.get('min_longitude', None)
    max_longitude = params.get('max_longitude', None)
    min_depth = params.get('min_depth', None)
    max_depth = params.get('max_depth', None)
    min_magnitude = params.get('min_magnitude', None)
    max_magnitude = params.get('max_magnitude', None)

    # Date filter
    if not min_date_str and not max_date_str:
        # If no dates are provided, filter by last 24 hours
        now = timezone.now()
        past_24h = now - timezone.timedelta(hours=24)
        queryset = queryset.filter(time__gte=past_24h) 
    elif min_date_str and max_date_str:
        try:
            min_date = datetime.strptime(min_date_str, "%Y-%m-%d")
            max_date = datetime.strptime(max_date_str, "%Y-%m-%d")

            # Make the dates timezone-aware because timezone support (USE_TZ=True)
            min_date = timezone.make_aware(min_date)
            max_date = timezone.make_aware(max_date)

            if min_date.date() == max_date.date():
                queryset = queryset.filter(time__date=min_date.date())
            else:
                queryset = queryset.filter(time__gte=min_date, time__lt=max_date + timezone.timedelta(days=1))
        except ValueError:
            return Earthquake.objects.none()    # If the date format is incorrect, return an empty queryset
    else:
        return queryset     # If only one date is given do not filter, return full queryset (frontend shows error message)

    # Latitude filters
    if min_latitude:
        try:
            queryset = queryset.filter(latitude__gte=float(min_latitude))
        except ValueError:
            return Earthquake.objects.none()    # If the latitude format is incorrect, return an empty queryset

    if max_latitude:
        try:
            queryset = queryset.filter(latitude__lte=float(max_latitude))
        except ValueError:
            return Earthquake.objects.none()   # If the latitude format is incorrect, return an empty queryset

    # Longitude filters
    if min_longitude:
        try:
            queryset = queryset.filter(longitude__gte=float(min_longitude))
        except ValueError:
            return Earthquake.objects.none()   # If the longitude format is incorrect, return an empty queryset

    if max_longitude:
        try:
            queryset = queryset.filter(longitude__lte=float(max_longitude))
        except ValueError:
            return Earthquake.objects.none()    # If the longitude format is incorrect, return an empty queryset

    # Depth filters
    if min_depth:
        try:
            queryset = queryset.filter(depth__gte=float(min_depth))
        except ValueError:
            return Earthquake.objects.none()     # If the depth format is incorrect, return an empty queryset

    if max_depth:
        try:
            queryset = queryset.filter(depth__lte=float(max_depth))
        except ValueError:
            return Earthquake.objects.none()    # If the depth format is incorrect, return an empty queryset   

    # Magnitude filters
    if min_magnitude:
        try:
            queryset = queryset.filter(magnitude__gte=float(min_magnitude))
        except ValueError: 
            return Earthquake.objects.none()   # If the magnitude format is incorrect, return an empty queryset

    if max_magnitude:
        try:
            queryset = queryset.filter(magnitude__lte=float(max_magnitude))
        except ValueError:
            return Earthquake.objects.none()   # If the magnitude format is incorrect, return an empty queryset

    return queryset
