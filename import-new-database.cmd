@echo off
echo Importing new database structure...

echo Dropping existing database...
mysql -u root -p -e "DROP DATABASE IF EXISTS crm_system;"

echo Creating new database...
mysql -u root -p -e "CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo Importing new database structure and data...
mysql -u root -p crm_system < "دیتاییس تغیر کرده.sql"

echo Database import completed!
pause