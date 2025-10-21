-- ==========================================
-- تنظیم دسترسی‌های کاربران برای دیتابیس‌ها
-- این فایل بعد از 00-init-databases.sql اجرا می‌شود
-- ==========================================

-- استفاده از دیتابیس mysql برای تنظیم دسترسی‌ها
USE mysql;

-- اطمینان از اینکه کاربر می‌تواند به هر دو دیتابیس دسترسی داشته باشد
-- نکته: کاربر از قبل توسط MYSQL_USER و MYSQL_PASSWORD ایجاد شده است

-- دادن تمام دسترسی‌ها به کاربر برای دیتابیس crm_system
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'localhost';

-- دادن تمام دسترسی‌ها به کاربر برای دیتابیس saas_master
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'localhost';

-- دادن دسترسی SELECT به information_schema برای phpMyAdmin
GRANT SELECT ON information_schema.* TO 'crm_user'@'%';
GRANT SELECT ON information_schema.* TO 'crm_user'@'localhost';

-- دادن دسترسی به mysql database برای phpMyAdmin (محدود)
GRANT SELECT ON mysql.* TO 'crm_user'@'%';
GRANT SELECT ON mysql.* TO 'crm_user'@'localhost';

-- اعمال تغییرات
FLUSH PRIVILEGES;

-- نمایش کاربران و دسترسی‌های آن‌ها
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';

-- نمایش دیتابیس‌های موجود
SHOW DATABASES;
