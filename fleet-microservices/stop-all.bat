@echo off
echo ========================================================
echo        Stopping FleetWave System...
echo ========================================================

echo Killing Java Processes (Backend Services)...
taskkill /F /IM java.exe /T

echo Killing Node Processes (Frontend)...
taskkill /F /IM node.exe /T

echo.
echo ========================================================
echo        All Services Stopped.
echo ========================================================
pause
