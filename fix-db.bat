@echo off
chcp 65001 >nul
echo ====================================
echo رفع مشکلات دیتابیس CRM
echo ====================================
echo.

cd /d "e:\rabin-last"
node fix-and-check-db.js

echo.
echo ====================================
echo اتمام عملیات
echo ====================================
pause