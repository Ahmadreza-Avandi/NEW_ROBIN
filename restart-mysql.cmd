@echo off
echo Restarting MySQL service...
net stop mysql80
timeout /t 3
net start mysql80
echo MySQL restarted successfully!
pause