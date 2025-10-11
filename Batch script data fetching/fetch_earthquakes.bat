@echo off
REM Change directory to your Django backend project
cd /d C:\Users\l.drosos\Desktop\LOUKAS\PROJECTS\Python\MASTERS\backend

REM Log the current date and time
echo ============================== >> "C:\Users\l.drosos\Desktop\LOUKAS\PROJECTS\Python\MASTERS\Batch script data fetching\fetch_log.txt"
echo %DATE% %TIME% >> "C:\Users\l.drosos\Desktop\LOUKAS\PROJECTS\Python\MASTERS\Batch script data fetching\fetch_log.txt"

REM Run the fetch command and append output to log
C:\Users\l.drosos\Desktop\LOUKAS\PROJECTS\Python\virtual-envs\venvMasters\Scripts\python.exe manage.py fetch_earthquakes >> "C:\Users\l.drosos\Desktop\LOUKAS\PROJECTS\Python\MASTERS\Batch script data fetching\fetch_log.txt" 2>&1