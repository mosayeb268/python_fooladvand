@echo off
chcp 65001 > nul
title PDA Course Website (Development Mode)

echo ========================================================
echo   حالت توسعه و ویرایش زنده (Dev Mode - HMR)
echo   Python for Data Analysis Website
echo ========================================================
echo.

cd /d "%~dp0\website"

start "" http://localhost:5173/

npm run dev -- --port 5173 --host

pause
