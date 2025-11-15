@echo off
echo ========================================
echo   Restarting Next.js Server
echo ========================================
echo.

echo [1/4] Stopping all Node.js processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel% equ 0 (
    echo     ✓ Node processes stopped
) else (
    echo     ℹ No Node processes found
)
timeout /t 2 /nobreak >nul

echo.
echo [2/4] Clearing Next.js cache...
cd next
if exist .next (
    rmdir /s /q .next
    echo     ✓ .next folder removed
)
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo     ✓ node_modules\.cache removed
)

echo.
echo [3/4] Checking DATABASE_URL...
findstr "DATABASE_URL" ..\.env
echo.

echo [4/4] Starting Next.js server...
echo     Starting in new window...
start cmd /k "npm run dev"

echo.
echo ========================================
echo   ✓ Server restart complete!
echo ========================================
echo.
echo The server is starting in a new window.
echo Check the new window for server status.
echo.
pause
