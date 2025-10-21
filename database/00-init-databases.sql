-- ==========================================
-- اسکریپت اولیه‌سازی دیتابیس‌ها برای Docker
-- این فایل به صورت خودکار توسط MySQL در Docker اجرا می‌شود
-- ==========================================

-- ایجاد دیتابیس CRM اگر وجود نداشته باشد
CREATE DATABASE IF NOT EXISTS `crm_system` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- ایجاد دیتابیس SaaS Master اگر وجود نداشته باشد
CREATE DATABASE IF NOT EXISTS `saas_master` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر اگر وجود نداشته باشد
-- نکته: در Docker، کاربر از environment variables ایجاد می‌شود
-- MariaDB به صورت خودکار کاربر را از MYSQL_USER و MYSQL_PASSWORD می‌سازد
-- این دستورات فقط برای اطمینان از دسترسی‌ها هستند

-- نکته: این فایل بعد از ایجاد خودکار کاربر توسط MariaDB اجرا می‌شود
-- بنابراین کاربر از قبل وجود دارد و فقط باید دسترسی‌ها را تنظیم کنیم

FLUSH PRIVILEGES;

-- نمایش دیتابیس‌های ایجاد شده
SHOW DATABASES;
