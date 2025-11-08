from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg, Max, Min, Count
from django.db.models.functions import TruncHour, TruncDay, TruncMonth, TruncYear
from .models import Earthquake
from .serializers import EarthquakeSerializer
from .utils import apply_filters

class EarthquakeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for the Earthquake model.
    """
    serializer_class = EarthquakeSerializer

    # Return the queryset with applied filters
    def get_queryset(self):
        queryset = Earthquake.objects.using('default').all()
        params = self.request.query_params

        return apply_filters(queryset, params)

#This gives you automatic support for:
  #  GET (list, detail) 
  #  POST (create)
  #  PUT/PATCH (update)
  #  DELETE

class EarthquakeStatsView(APIView):
    """
    Returns earthquake statistics based on selected filters.
    - Groups dynamically based on selected date range:
        • > 365 days → per year
        • 31–365 days → per month
        • 2–30 days → per day
        • 1 day → per hour
    - If no results → returns { has_results: False }
    """

    def get(self, request):
        queryset = Earthquake.objects.using("default").all()
        params = request.GET

        # Apply all filters (date + others)
        filtered_qs = apply_filters(queryset, params)

        if not filtered_qs.exists():
            return Response({
                "has_results": False,
                "filtered_stats": {}
            })

        # Calculates the earliest and latest earthquake timestamps and computes the number of days between them.
        date_range = filtered_qs.aggregate(min_time=Min("time"), max_time=Max("time"))
        start_time, end_time = date_range["min_time"], date_range["max_time"]

        if not start_time or not end_time:
            return Response({
                "has_results": False,
                "filtered_stats": {}
            })

        days_range = (end_time - start_time).days

        # Determines whether to group earthquakes by hour, day, month, or year based on the range of data
        if start_time.date() == end_time.date():
            label = "hour"
            trunc_fn = TruncHour("time")
        elif days_range > 365:
            label = "year"
            trunc_fn = TruncYear("time")
        elif days_range > 30:
            label = "month"
            trunc_fn = TruncMonth("time")
        else:
            label = "day"
            trunc_fn = TruncDay("time")

        # Aggregate stats per period
        per_period = (
            filtered_qs.annotate(period=trunc_fn)
            .values("period")
            .annotate(
                count=Count("id"),
                avg_magnitude=Avg("magnitude"),
                max_magnitude=Max("magnitude"),
            )
            .order_by("period")
        )

        # Format datetime labels for frontend
        def format_datetime(data):
            if label == "year":
                return data.strftime("%Y")
            elif label == "month":
                return data.strftime("%Y-%m")
            elif label == "day":
                return data.strftime("%Y-%m-%d")
            else:
                return data.strftime("%Y-%m-%d %H:00")

        # Prepare data for frontend
        filtered_stats = {
            "filtered_time_distribution_type": label,
            "filtered_time_distribution": [
                {
                    "period": format_datetime(e["period"]),
                    "count": e["count"],
                    "avg_magnitude": round(e["avg_magnitude"], 2) if e["avg_magnitude"] else None,
                    "max_magnitude": e["max_magnitude"],
                }
                for e in per_period
            ],
        }

        '''
        Returns JSON like this to the frontend:
            {
            "has_results": true,
                "filtered_stats": {
                    "filtered_time_distribution_type": "day",
                    "filtered_time_distribution": [
                    {"period": "2025-11-01", "count": 5, "avg_magnitude": 3.2, "max_magnitude": 4.1},
                    ...
                    ]
                }
            }
        '''

        return Response({
            "has_results": True,
            "filtered_stats": filtered_stats,
        })
    
  