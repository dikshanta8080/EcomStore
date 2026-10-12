@echo off

start "EcomStore Backend" cmd /k "cd /d "%~dp0retail_store_backend" && gradlew.bat bootRun"

start "EcomStore Frontend" cmd /k "cd /d "%~dp0retail_store_frontend" && npm run dev"