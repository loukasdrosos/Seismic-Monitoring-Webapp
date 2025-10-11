import pandas as pd
import django
import os

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from api.models import Earthquake
from django.db import connections

df = pd.read_excel("C:\\Users\\l.drosos\\Desktop\\LOUKAS\\PROJECTS\\lost_earthquakes.xlsx", engine='openpyxl')

# Normalize column names (Excel headers may have spaces)
df.columns = [col.strip().lower() for col in df.columns]
# Now: ["time", "latitude", "longitude", "depth", "magnitude"]

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

using_db = 'testdb'

for _, row in df.iterrows():
    time = pd.to_datetime(row["time"], dayfirst=True)
    latitude = round_lat_or_long(row["latitude"])
    longitude = round_lat_or_long(row["longitude"])
    depth = to_float(row["depth"])
    magnitude = round_magnitude(row["magnitude"])

    eq, created = Earthquake.objects.using(using_db).get_or_create(
        time=time,
        latitude=latitude,
        longitude=longitude,
        depth=depth,
        magnitude=magnitude
    )

    if created:
        print(f"Inserted: Time: {time} Lat: {latitude}, Long: {longitude} Depth: {depth} Magnitude: {magnitude}")
    else:
        print(f"Skipped duplicate: Time: {time} Lat: {latitude}, Long: {longitude} Depth: {depth} Magnitude: {magnitude}")