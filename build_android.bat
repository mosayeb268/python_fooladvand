@echo off
chcp 65001 >nul
echo ======================================================================
echo    راهنمای راه‌اندازی و بیلد نسخه اندروید تبلت شیائومی Pad 6 Pro
echo              پرتال جامع تحلیل داده با پایتون (PDA)
echo ======================================================================
echo.
echo دو روش برای استفاده روی تبلت شیائومی Pad 6 Pro وجود دارد:
echo.
echo [روش ۱: نصب فوق‌سریع و بدون نیاز به بیلد (پیشنهاد ویژه PWA)]:
echo   ۱. سایت را روی سرور محلی یا گیتهاب اجرا کنید.
echo   ۲. در مرورگر Chrome یا Mi Browser تبلت، آدرس را باز کنید.
echo   ۳. روی علامت منو سه نقطه کلیک کرده و گزینه «افزودن به صفحه اصلی» یا
echo      «Install App» را انتخاب کنید.
echo   ۴. برنامه به صورت تمام‌صفحه و با پشتیبانی آفلاین نصب خواهد شد!
echo.
echo [روش ۲: تولید فایل نصبی بومی مستقیم (APK با Capacitor)]:
echo   در حال آماده‌سازی و همگام‌سازی کدهای وب با محیط اندروید...
echo.

cd /d "%~dp0\website"

echo 1. در حال بیلد فایل‌های بهینه‌شده وب...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [خطا] بیلد وب با خطا مواجه شد.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo 2. همگام‌سازی کدهای وب با پروژه اندروید...
call npx @capacitor/cli sync android

echo.
echo 3. ساخت مستقیم فایل APK با Gradle...
cd android
if exist "gradlew.bat" (
    call gradlew.bat assembleDebug
    if exist "app\build\outputs\apk\debug\app-debug.apk" (
        echo.
        echo ======================================================================
        echo [موفقیت کامل] فایل APK با موفقیت ساخته شد!
        echo آدرس فایل نصبی:
        echo website\android\app\build\outputs\apk\debug\app-debug.apk
        echo ======================================================================
    )
) else (
    echo [اطلاع] فایل Gradle wrapper پیدا نشد. برای باز کردن در اندروید استودیو:
    echo npx @capacitor/cli open android
)

echo.
pause
