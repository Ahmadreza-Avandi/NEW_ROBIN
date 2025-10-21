-- ===========================================
-- Database Initialization Script for CRM System
-- ===========================================
-- این اسکریپت دیتابیس و کاربران رو ایجاد می‌کنه
-- سازگار با هر دو محیط لوکال و سرور
-- ===========================================

-- Create CRM System Database
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SaaS Master Database
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;



-- ===========================================
-- کاربر اصلی: crm_user (برای هر دو محیط)
-- ===========================================

-- Drop existing users
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- Create user with password
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- Grant privileges on crm_system
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

-- Grant privileges on saas_master
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

-- Apply changes
FLUSH PRIVILEGES;

-- Use the database
USE `crm_system`;

-- Set timezone
SET time_zone = '+00:00';