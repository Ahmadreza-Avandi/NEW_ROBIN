@echo off
echo ========================================
echo   اجرای پروژه در ویندوز
echo ========================================
echo.

echo [1/2] تنظیم DATABASE_HOST برای ویندوز...
powershell -Command "(Get-Content '.env') -replace 'DATABASE_HOST=10.255.255.254', 'DATABASE_HOST=127.0.0.1' | Set-Content '.env'"
powershell -Command "(Get-Content '.env') -replace 'DB_HOST=10.255.255.254', 'DB_HOST=127.0.0.1' | Set-Content '.env'"
echo ✓ تنظیمات آپدیت شد

echo.
echo [2/2] تست اتصال MySQL...
node test-db-connection.cjs
if %errorlevel% neq 0 (
    echo.
    echo ✗ اتصال MySQL ناموفق!
    echo لطفاً MySQL را در XAMPP روشن کنید
    pause
    exit /b 1
)

echo.
echo ========================================
echo   آماده اجرا!
echo ========================================
echo.
echo برای اجرای سرور:
echo   npm run dev
echo.
pause
