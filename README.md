# Real-Time Seismic Activity Monitoring Web Application

## Overview

This is a full-stack web application for real-time monitoring and visualization of earthquake activity in Greece.

It provides:

- **Real-time earthquake data** from a database.
- **Interactive map** with clustered markers and heatmap visualization.
- **Dynamic statistics sidebar** with charts for number of earthquakes, average magnitude, and maximum magnitude over time.
- **Advanced filtering** by date, latitude, longitude, depth, and magnitude.

---

## Tech Stack

- **Backend:** Django, Django REST Framework, MySQL / SQLite  
- **Frontend:** React.js, Leaflet.js, Recharts  
- **Task Scheduling:** Windows Task Scheduler  
- **Data Source:** XML feed from National and Kapodistrian University of Athens  

---

## Features

- Earthquake list with table view and filters.
- Interactive Leaflet map with markers and clustering.
- Heatmap layer for large datasets.
- Dynamic statistics charts using Recharts.
- Automatic data fetching with a task scheduler.
- Supports SQLite or optional MySQL database.
- Easy import of historical data from Excel files.

![Project Screenshot](assets/dashboard.png)

![Statistics Sidebar](assets/stats_sidebar.png)

---

## Abstract

This project is part of my Master’s thesis in Control and Computing at the National and Kapodistrian University of Athens. It presents an integrated web application for real-time monitoring and visualization of seismic activity in Greece.

The main objective is the automated collection, processing, and visualization of earthquake data recorded in real time. The application combines backend and frontend technologies to deliver a complete system that allows dynamic user interaction with geospatial data through a modern, user-friendly web interface.

Seismic data are retrieved in XML format from the public website of the Department of Geology and Geoenvironment of the National and Kapodistrian University of Athens. These data are processed and stored in the application’s database, while a REST API built with Django REST Framework exposes them to the frontend for interactive visualization.

The frontend, developed with React.js and the Leaflet library, provides a rich map interface where users can view recent earthquakes (e.g., from the last 24 hours) or filter data by date range, coordinates, depth, and magnitude. Additional visualization options, such as clustering and heatmaps, enhance understanding of seismic trends over time.

Overall, this application offers an accessible platform for both researchers and the public to explore the historical and real-time seismic activity of Greece. It also serves as a solid foundation for future extensions, such as real-time notifications, predictive modeling using machine learning, and integration with international seismic data networks.

---

## Prerequisites

Before running this project, make sure you have the following installed:

### 1. Python
- **Version:** 3.10 or higher
- Check if it's installed:
  ```bash
  python --version
  ```

If not installed, download it from: https://www.python.org/downloads/

### 2. Node.js
- **Version:** 18 or higher
- Check if it's installed:
  ```bash
  node --version
  npm --version
  ```

If not installed, download it from: https://nodejs.org/

### 3. MySQL (Optional)
- If you’re using MySQL instead of SQLite.
- Check if it's installed:
  ```bash
  mysql --version
  ```

If not installed, download it from: https://dev.mysql.com/downloads/workbench/

## Installation

### 1. Clone the repository

Download the project .zip file from Github and unzip it in your computer, or open a terminal (Command Prompt / PowerShell / Git Bash) and run:

```bash
git clone https://github.com/loukasdrosos/Seismic-Monitoring-Webapp.git
cd Seismic-Monitoring-Webapp
```

### 2. Set up a Python virtual environment (recommended)

Creates an isolated Python environment separate from your system Python.
Contains its own python.exe and pip, so installed packages won't affect your global Python installation.

```bash
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Mac/Linux
```

### 3. Set up the database

You can choose one of the following:

**Option 1:** MySQL database

Create a MySQL database for the project.

**Option 2:** SQLite database

Create a new database using Django in Step 6.

### 4. Install backend dependencies 

Go to the backend directory and install the dependencies from requirements.txt

```bash
cd backend
pip install -r requirements.txt
```

### 5. Configure .env variables for backend

Copy the example .env file and edit the values on the .env file.

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

**Update the values according to your environment:**

Set DJANGO_SECRET_KEY to a secure random key. In order to generate a key open a command prompt window from the project's backend directory and run this command:

```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

**DJANGO_SECRET_KEY** - Copy the output of the command above in the .env file.

**DJANGO_DEBUG** - Set to "True" only when in development mode, during Production set to "False".

**USE_SQLITE3** -  "True" if you are using an SQLite database, "False" if you are using a MySQL database.

**MYSQL_DB_ENGINE** - MySQL engine, don't change it.

**MYSQL_DB_NAME** - MySQL database name, necessary only if a MySQL database is used.

**MYSQL_DB_USER** - MySQL username, necessary only if a MySQL database is used.

**MYSQL_DB_PASSWORD** - MySQL password for user, necessary only if a MySQL database is used.

**MYSQL_DB_HOST** - MySQL database host server, necessary only if a MySQL database is used.

**MYSQL_DB_PORT** - MySQL database port, necessary only if a MySQL database is used.

**DATA_FETCH_URL** - Data source for automatic fetching of data. **WARNING**, changing feed may require change in parsing logic due to different XML/JSON structure.

**CORS_ALLOWED_ORIGINS** - Frontend origin URLs for CORS.

**IMPORT_DATA_PATH** - Excel filepath to use for manually loading data in the database.

**IMPORT_TIME_ZONE** - Time zone based on the source that data are being imported from. When importing data, the backend converts the times in the Excel file to the correct Django timezone.

### 6. Apply Migrations and Start Backend

If you created a new database (SQLite or MySQL), run on backend directory:

```bash
python manage.py makemigrations
python manage.py migrate
```

### 7. Start the Django server

Start the Django development server with this command:

```bash
python manage.py runserver
```

The backend API should now be running at http://127.0.0.1:8000/.

You can close the server by pressing *CTRL + C* in the cmd window.

![Django Server](assets/django_server.png)

### 8. Import data 

You can import data in the database in 2 ways: 

#### 1. Automatic

On the cmd window on the backend directory close the Django server and run the following command:

```bash
python manage.py fetch_earthquakes
```

This will automatically fetch and save in the database the earthquakes currently present in the source feed selected **DATA_FETCH_URL** in the .env file above.

The source that is pre-configured is an XML feed for the latest earthquakes happening in Greece.

In the final step of this project, you can create a scheduled task in Windows Task Scheduler to automatically fetch the latest data from the configured data source at your chosen time intervals.

#### 2. Manually

You can also insert data from an excel file, if you have older data or custom data you want to display.

While on the project's backend directory run this command:

```bash
python import_excel_data.py
```

The project already contains a sample excel file in the backend\Excel_Data directory that contains a lot of data from earthquakes in Greece, but you can also create an excel file with your own data. 

In order to import data from another excel file, you have to configure the path of the new excel file in **IMPORT_DATA_PATH** in the .env file above.

Excel File Format

The Excel file should contain the following columns in this exact order and with these headers:

| Time                | Latitude | Longitude | Depth | Magnitude |
| ------------------- | -------- | --------- | ----- | --------- |
| 24-02-1964 23:30:25 | 38,90    | 23,90     | 10,0  | 5,3       |
| 11-04-1964 16:00:00 | 39,75    | 25,25     | 10,0  | 5,7       |
| 21-04-1964 08:14:40 | 38,50    | 22,25     | 10,0  | 4,5       |
| 24-04-1964 03:49:58 | 38,00    | 21,80     | 10,0  | 5,0       |
| 29-04-1964 04:21:00 | 39,25    | 23,75     | 10,0  | 5,8       |

**Notes:**

Time format → DD-MM-YYYY HH:MM:SS

Numeric fields are floats with one or two decimals

IMPORT_TIME_ZONE in your .env determines how timestamps are stored

Ensure the file path in .env matches your Excel location

Example:

```bash
IMPORT_DATA_PATH=./Excel_Data/Greece_earthquakes_history.xlsx
```

### 9. Install frontend dependencies

On a new terminal, open the virtual environment, then in the cmd window navigate to the frontend directory of this project and run:

```bash
npm install
```

### 10. Configure .env variables for frontend

Copy the example .env file and edit the values on the .env file.

```bash
copy .env.example .env      # Windows
# cp .env.example .env      # Mac/Linux
```

**Update the values according to your environment:**

Edit .env and update the values:

**VITE_MINIMUM_LATITUDE / VITE_MAXIMUM_LATITUDE** – Minimum and maximum latitude for map filters.

**VITE_MINIMUM_LONGITUDE / VITE_MAXIMUM_LONGITUDE** – Minimum and maximum longitude for map filters.

**VITE_CENTER_LATITUDE / VITE_CENTER_LONGITUDE** – Initial center coordinates of the map.

**VITE_DEFAULT_ZOOM_LEVEL** – Default zoom level for the map.

**VITE_USE_STADIA** - Sets either Stadia map or OpenStreetMap for Leaflet.

**VITE_USE_STADIA_API_KEY** - Set to true if you want to use Stadia in production.

**VITE_STADIA_API_KEY** – Optional API key for Stadia Maps satellite tiles (needed only if you use Stadia tiles in production).

**VITE_API_URL** – The base URL of your backend Django REST API (e.g., http://localhost:8000).

### 11. Run the React frontend

On the frontend directory run:

```bash
npm run dev
```
The app will be available at http://localhost:5173/ (default Vite port).

You can close the server by pressing *CTRL + C* in the cmd window.

![Project Screenshot](assets/dashboard.png)

### 12. Configure .env for automatic data fetching

In the Batch_script_data_fetching directory of the project, the batch script "fetch_earthquakes.bat" runs your Django manage.py fetch_earthquakes command using the paths and settings defined in the fetch_earthquakes.env configuration file.

Create a file named fetch_earthquakes.env in the same directory as the batch script, and fill it with the following values:

**BACKEND_DIR** - Full path to your Django backend folder (contains manage.py)

**VENV_PYTHON** - Full path to your Python interpreter inside virtual environment

**LOG_FILE** - Full path to where you want the log file saved

**Notes:**

Make sure all paths are absolute (full paths).

Use double backslashes \\ if you edit this in certain editors to avoid escaping issues.

The log file will record the time and result of each fetch operation.

### 13. Set Up Automatic Execution (Windows Task Scheduler)

You can configure the **fetch_earthquakes.bat** script to run automatically (e.g., every hour) using **Windows Task Scheduler**, ensuring your database stays continuously up to date.

**Steps:**

Open Task Scheduler (search “Task Scheduler” in the Start menu).

Click Create Task... on the right panel.

Under the General tab:

Name it: Earthquake Data Fetch.

When running the task, use the following user account: SYSTEM

Check Run with highest privileges.

Under the Triggers tab:

Click New... → Choose Daily or Repeat task every 1 hour, or whenever you want the task to run.

Set Start time as desired.

Under the Actions tab:

Click New...

Action: Start a program

Program/script: C:\Path\to\fetch_earthquakes.bat

(Optional) Under Conditions, uncheck “Start the task only if the computer is on AC power”.

Click OK to save, and enter your password if prompted.

The Task Scheduler will now run your data-fetching script automatically at the specified intervals.

### Web Application Installed

## License
This project is licensed under the MIT License