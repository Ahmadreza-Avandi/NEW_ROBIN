-- ========================================
-- مرحله 1: ایجاد دیتابیس و کاربر
-- ========================================

-- ایجاد دیتابیس
CREATE DATABASE IF NOT EXISTS school 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- استفاده از دیتابیس
USE school;

-- ایجاد کاربر (فقط برای لوکال)
-- در production این کار را از طریق پنل هاستینگ انجام دهید
CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON school.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;

-- نمایش پیام موفقیت
SELECT 'مرحله 1: دیتابیس و کاربر با موفقیت ایجاد شد' AS status;
