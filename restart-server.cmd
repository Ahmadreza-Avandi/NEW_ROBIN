@echo off
echo 🔄 Restart کردن سرور Next.js...

REM Kill any existing Node.js processes
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im npm.exe >nul 2>&1

echo ✅ پروسه‌های قبلی بسته شدند

REM Wait a moment
timeout /t 2 >nul

echo 🚀 شروع سرور جدید...
npm run dev