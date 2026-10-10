@echo off
chcp 65001 > nul
title PDA Course Website - University Term 6

echo ========================================================
echo   پرتال جامع یادگیری پایتون برای تحلیل داده (PDA)
echo   دانشگاه - ترم ۶
echo ========================================================
echo.
echo در حال اجرای وب‌سایت در آدرس: http://localhost:4173/ ...
echo.

cd /d "%~dp0\website"

:: Open default browser after a short delay
start "" http://localhost:4173/

:: Run vite preview
npm run preview -- --port 4173 --host

pause
