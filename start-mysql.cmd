@echo off
echo ========================================
echo   راه‌اندازی MySQL
echo ========================================
echo.

echo [1] تلاش برای راه‌اندازی MySQL80...
net start MySQL80 2>nul
if %errorlevel% == 0 (
    echo ✓ MySQL80 راه‌اندازی شد
    goto :success
)

echo [2] تلاش برای راه‌اندازی MySQL...
net start MySQL 2>nul
if %errorlevel% == 0 (
    echo ✓ MySQL راه‌اندازی شد
    goto :success
)

echo.
echo ✗ سرویس MySQL یافت نشد!
echo.
echo احتمالا از XAMPP استفاده می‌کنید:
echo   1. XAMPP Control Panel را باز کنید
echo   2. دکمه Start کنار MySQL را بزنید
echo.
echo یا از Docker:
echo   docker-compose up -d mysql
echo.
pause
exit /b 1

:success
echo.
echo ========================================
echo   بررسی وضعیت...
echo ========================================
echo.
node check-mysql-status.cjs
pause
