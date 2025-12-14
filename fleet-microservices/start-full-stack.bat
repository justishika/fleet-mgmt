@echo off
title FleetWave Launcher
echo ========================================================
echo        FleetWave - Full Stack Launcher
echo ========================================================

echo [1/6] Starting Discovery Service (Eureka)...
start "Discovery Service" cmd /k "cd discovery-service && ..\mvnw.cmd spring-boot:run"

echo Waiting for Eureka to warm up...
timeout /t 10 /nobreak > nul

echo [2/6] Starting API Gateway...
start "API Gateway" cmd /k "cd api-gateway && ..\mvnw.cmd spring-boot:run"

echo Waiting for Gateway to warm up...
timeout /t 5 /nobreak > nul

echo [3/6] Starting Fleet Service...
start "Fleet Service" cmd /k "cd fleet-service && ..\mvnw.cmd spring-boot:run"

echo [4/6] Starting Driver Service...
start "Driver Service" cmd /k "cd driver-service && ..\mvnw.cmd spring-boot:run"

echo [5/6] Starting Dispatch Service...
start "Dispatch Service" cmd /k "cd dispatch-service && ..\mvnw.cmd spring-boot:run"

echo [6/6] Starting Frontend (FleetWave)...
start "FleetWave Console" cmd /k "cd fleet-wave && npm.cmd run dev"

echo.
echo ========================================================
echo           All Systems Go! 🚀
echo ========================================================
echo.
echo Opening Browser...
ping 127.0.0.1 -n 6 > nul
start http://localhost:5173

echo.
echo [INFO] Eureka Dashboard: http://localhost:8761
echo [INFO] API Gateway:      http://localhost:9000
