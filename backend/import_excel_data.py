import pandas as pd
import django
import os

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

import pytz
from api.models import Earthquake
from django.db import connections

using_db = 'default'

# Data excel path from environment variable
excel_data = os.getenv('IMPORT_DATA_PATH')

df = pd.read_excel(excel_data, engine='openpyxl')

# Normalize column names (Excel headers may have spaces)
df.columns = [col.strip().lower() for col in df.columns]
# Column names: ["time", "latitude", "longitude", "depth", "magnitude"]

# Helper: convert Greek-style decimal strings to float
def to_float(value):
    return float(str(value).replace(",", ".").strip())

# Helper: format magnitude (drop .0 if integer)
def round_magnitude(value):
    val = to_float(value)
    if val.is_integer():
        return int(val)  # e.g. 2.0 → 2
    return round(val, 1)  # keep one decimal: 1.4 → 1.4

def round_lat_or_long(value):
    val = to_float(value)
    if val.is_integer():
        return int(val)  # e.g. 2.0 → 2
    return round(val, 2)  # keep 2 decimals : 1.4567 → 1.46

timezone = pytz.timezone(os.getenv("IMPORT_TIME_ZONE", "GMT"))

earthquakes = []
for _, row in df.iterrows():
    time = pd.to_datetime(row["time"], dayfirst=True)
    time = timezone.localize(time).astimezone(pytz.UTC)
    latitude = round_lat_or_long(row["latitude"])
    longitude = round_lat_or_long(row["longitude"])
    depth = to_float(row["depth"])
    magnitude = round_magnitude(row["magnitude"])

    earthquakes.append(
        Earthquake(
            time=time,
            latitude=latitude,
            longitude=longitude,
            depth=depth,
            magnitude=magnitude
        )
    )

Earthquake.objects.using(using_db).bulk_create(earthquakes, ignore_conflicts=True, batch_size=500)

print(f"✅ Inserted {len(earthquakes)} rows into {using_db}.")

