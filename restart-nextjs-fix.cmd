@echo off
echo 🔄 Restarting NextJS server to apply tenant filtering fixes...

echo.
echo 🛑 Stopping any running NextJS processes...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 🧹 Clearing NextJS cache...
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo.
echo 🚀 Starting NextJS development server...
echo ⚠️  Please wait for the server to start completely...
echo 🌐 Then go to: http://localhost:3000/aghbanushop/login
echo 📧 Email: info@aghbanushop.ir
echo 🔑 Password: 09175456003

start cmd /k "npm run dev"

echo.
echo ✅ Server restart initiated!
echo 💡 After login, you should see only 4 tasks for aghbanushop tenant
pause