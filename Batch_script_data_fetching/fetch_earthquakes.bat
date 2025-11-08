REM ================================================
REM  Django Earthquake Data Fetch Script
REM  Uses environment variables from .env file
REM ================================================

@echo off
REM Load paths from environment variables
setlocal enabledelayedexpansion
for /f "tokens=1,2 delims==" %%a in (fetch_earthquakes.env) do set %%a=%%b

REM Change directory to backend
cd /d %BACKEND_DIR%

REM Log date/time
echo ============================== >> "%LOG_FILE%"
echo %DATE% %TIME% >> "%LOG_FILE%"

REM Run Django command
"%VENV_PYTHON%" manage.py fetch_earthquakes >> "%LOG_FILE%" 2>&1

@echo off
REM End of script