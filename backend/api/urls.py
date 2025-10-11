from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EarthquakeViewSet

router = DefaultRouter()
router.register(r'earthquakes', EarthquakeViewSet, basename='earthquake')

urlpatterns = [
    path('', include(router.urls)),
]

    # This automatically creates endpoints like:

    # GET /earthquakes/ → list all earthquakes

    # GET /earthquakes/<id>/ → retrieve a single earthquake

    # POST /earthquakes/ → create a new earthquake

    # PUT /earthquakes/<id>/ → update an existing one

    # DELETE /earthquakes/<id>/ → delete