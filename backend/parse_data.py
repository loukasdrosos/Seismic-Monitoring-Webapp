import pandas as pd
from datetime import datetime

# Load Excel (assume all data is in column 0)
df = pd.read_excel("C:\\Users\\l.drosos\\Desktop\\LOUKAS\\PROJECTS\\all_earthquakes.xlsx", header=None)

def parse_row(row):
    parts = str(row).split()
    # Example parts: ['1964', 'FEB', '24', '23', '30', '25.0', '38.9000', '23.9000', '10', '5.3']

    year = parts[0]
    month = parts[1]
    day = parts[2]
    hour = parts[3]
    minute = parts[4]
    second = parts[5]
    latitude = float(parts[6])
    longitude = float(parts[7])
    depth = float(parts[8])
    magnitude = float(parts[9])

    # Build datetime
    time_str = f"{year} {month} {day} {hour}:{minute}:{second}"
    time = datetime.strptime(time_str, "%Y %b %d %H:%M:%S.%f")

    return pd.Series([time, latitude, longitude, depth, magnitude])

# Apply parsing
df_parsed = df[0].apply(parse_row)
df_parsed.columns = ["time", "latitude", "longitude", "depth", "magnitude"]

print(df_parsed.head())

df_parsed.to_excel("history_quakes.xlsx", index=False)

