import requests # download the XML from the website
import xml.etree.ElementTree as ET # parse the XML structure
from django.core.management.base import BaseCommand # Django base class for making CLI commands
from api.models import Earthquake # Django model for earthquakes
from datetime import datetime # Convert string timestamps into DateTimeField
from django.utils import timezone # Django timezone utilities
import re # Regular Expressions
import os
from dotenv import load_dotenv

class Command(BaseCommand):
    help = "Fetch and parse earthquake data from XML feed"

    # Load environment variables from .env file
    load_dotenv()

    def handle(self, *args, **kwargs):
        url = os.getenv('DATA_FETCH_URL', '')
        response = requests.get(url)
        root = ET.fromstring(response.content)

        self.stderr.write(f"Data Fetch URL: {url}\n")

        for item in root.findall(".//item"):
            desc = item.find("description").text

            # Replace <br> with newlines so regex works line by line
            cleaned_desc = desc.replace("<br>", "\n")

            # Parse values from string using regex
            try:
                # Time
                time_match = re.search(r"Time:\s*(\d{2}-[A-Za-z]{3}-\d{4} \d{2}:\d{2}:\d{2})", cleaned_desc)
                # Latitude
                lat_match = re.search(r"Latitude:\s*([\d.]+)N", cleaned_desc)
                # Longitude
                lon_match = re.search(r"Longitude:\s*([\d.]+)E", cleaned_desc)
                # Depth
                depth_match = re.search(r"Depth:\s*([\d.]+)km", cleaned_desc)
                # Magnitude
                mag_match = re.search(r"M\s*([\d.]+)", cleaned_desc)

                if all([time_match, lat_match, lon_match, depth_match, mag_match]):
                    time_str = time_match.group(1)
                    time = timezone.make_aware(datetime.strptime(time_str, "%d-%b-%Y %H:%M:%S"))

                    latitude = float(lat_match.group(1))
                    longitude = float(lon_match.group(1))
                    depth = float(depth_match.group(1))
                    magnitude = float(mag_match.group(1))

                    if not Earthquake.objects.filter(time=time, latitude=latitude, longitude=longitude).exists():
                        Earthquake.objects.create(
                            time=time,
                            latitude=latitude,
                            longitude=longitude,
                            depth=depth,
                            magnitude=magnitude
                        )
                        self.stdout.write(self.style.SUCCESS(f"Added: {time} M {magnitude}"))
                else:
                    raise ValueError("Could not find all fields in the description.")

            except Exception as e:
                self.stderr.write(f"Failed to parse entry: {e}")