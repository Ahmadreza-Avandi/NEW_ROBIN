-- ===========================================
-- Database Initialization Script for CRM System
-- ===========================================
-- این فایل اول از همه اجرا می‌شود (00-)
-- وظیفه: ایجاد دیتابیس‌ها و تنظیم دسترسی‌های کاربر
-- ===========================================

-- ایجاد دیتابیس CRM اگر وجود نداشته باشد
CREATE DATABASE IF NOT EXISTS `crm_system` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- ایجاد دیتابیس SaaS Master اگر وجود نداشته باشد
CREATE DATABASE IF NOT EXISTS `saas_master` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- ===========================================
-- تنظیم دسترسی‌های کاربر crm_user
-- ===========================================
-- نکته: MariaDB از MYSQL_USER و MYSQL_PASSWORD کاربر را ساخته
-- اما فقط به MYSQL_DATABASE دسترسی داده
-- باید دسترسی به saas_master هم بدهیم

-- دسترسی به crm_system (احتمالاً از قبل دارد)
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

-- دسترسی به saas_master (این مهم است!)
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

-- اعمال تغییرات
FLUSH PRIVILEGES;

-- تنظیم timezone
SET time_zone = '+00:00';

-- نمایش دیتابیس‌های ایجاد شده (برای debug)
SHOW DATABASES;

-- نمایش کاربران و دسترسی‌ها (برای debug)
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';
