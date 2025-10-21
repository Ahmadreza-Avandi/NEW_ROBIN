@echo off
chcp 65001 >nul
echo 🔧 ایمپورت جداول مفقود...

REM Load database settings
set DB_HOST=localhost
set DB_PORT=3306
set DB_NAME=crm_system
set DB_USER=root
set DB_PASS=

REM Check if .env.local exists and load it
if exist .env.local (
    echo 📄 بارگذاری تنظیمات از .env.local...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
        if "%%a"=="DB_HOST" set DB_HOST=%%b
        if "%%a"=="DB_PORT" set DB_PORT=%%b
        if "%%a"=="DB_NAME" set DB_NAME=%%b
        if "%%a"=="DB_USER" set DB_USER=%%b
        if "%%a"=="DB_PASS" set DB_PASS=%%b
    )
)

echo 📊 اتصال به دیتابیس: %DB_HOST%:%DB_PORT%/%DB_NAME%

REM Test MySQL connection
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "SELECT 1;" %DB_NAME% >nul 2>&1
if errorlevel 1 (
    echo ❌ خطا در اتصال به دیتابیس
    echo 💡 اطمینان حاصل کنید که:
    echo    - MySQL در حال اجرا است
    echo    - اطلاعات اتصال در .env.local صحیح است
    echo    - دیتابیس %DB_NAME% وجود دارد
    pause
    exit /b 1
)

echo ✅ اتصال به دیتابیس موفق بود

REM Import missing tables
echo 🔄 ایمپورت جداول مفقود...
mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% %DB_NAME% < missing-tables.sql
if errorlevel 1 (
    echo ❌ خطا در ایمپورت جداول
    pause
    exit /b 1
)

echo ✅ جداول مفقود با موفقیت ایمپورت شدند

REM Verify important tables
echo 🔍 بررسی وجود جداول مهم...

mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "SHOW TABLES LIKE 'modules';" %DB_NAME% | findstr "modules" >nul
if errorlevel 1 (
    echo ❌ جدول modules موجود نیست
) else (
    echo ✅ جدول modules موجود است
)

mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "SHOW TABLES LIKE 'sales';" %DB_NAME% | findstr "sales" >nul
if errorlevel 1 (
    echo ❌ جدول sales موجود نیست
) else (
    echo ✅ جدول sales موجود است
)

mysql -h%DB_HOST% -P%DB_PORT% -u%DB_USER% -p%DB_PASS% -e "SHOW TABLES LIKE 'users';" %DB_NAME% | findstr "users" >nul
if errorlevel 1 (
    echo ❌ جدول users موجود نیست
) else (
    echo ✅ جدول users موجود است
)

echo.
echo 🎉 ایمپورت جداول تمام شد!
echo.
echo 📋 تغییرات اعمال شده:
echo    - جداول مفقود ایجاد شدند
echo    - ستون‌های مفقود اضافه شدند  
echo    - ویوهای مورد نیاز ایجاد شدند
echo    - ایندکس‌ها برای بهبود عملکرد اضافه شدند
echo.
echo 🚀 حالا می‌توانید سرور را راه‌اندازی کنید:
echo    npm run dev
echo.
pause