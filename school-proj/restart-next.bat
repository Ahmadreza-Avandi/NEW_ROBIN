@echo off
echo Stopping Next.js server...
taskkill /F /IM node.exe 2>nul

echo Cleaning Next.js cache...
cd next
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache

echo Restarting Next.js server...
start cmd /k "npm run dev"

echo Done!
pause
