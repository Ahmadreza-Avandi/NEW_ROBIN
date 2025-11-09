-- ===========================================
-- Admin Users Creation Script
-- ===========================================
-- این فایل آخرین فایل است که اجرا می‌شود (03-)
-- وظیفه: اطمینان از وجود کاربران ادمین
-- ===========================================

USE `crm_system`;

-- ===========================================
-- کاربر CEO (مهندس کریمی)
-- ===========================================
-- این کاربر از فایل crm_system.sql می‌آید
-- فقط اطمینان حاصل می‌کنیم که رمز عبور درست است
-- رمز عبور: 1234 (bcrypt hash)

UPDATE users SET 
    password = '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    is_active = 1,
    updated_at = NOW()
WHERE id = 'ceo-001' AND email = 'Robintejarat@gmail.com';

-- بررسی وجود کاربر CEO
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    is_active,
    'CEO User Check' as status
FROM users 
WHERE id = 'ceo-001';

-- ===========================================
-- کاربر Super Admin (احمدرضا اوندی)
-- ===========================================

USE `saas_master`;

-- اطمینان از وجود Super Admin
-- رمز عبور: 1234 (bcrypt hash)

INSERT INTO `super_admins` (
    `username`, 
    `email`, 
    `password`, 
    `full_name`, 
    `is_active`
) VALUES (
    'Ahmadreza.avandi',
    'ahmadrezaavandi@gmail.com',
    '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    'احمدرضا اوندی',
    1
)
ON DUPLICATE KEY UPDATE 
    `is_active` = 1,
    `password` = '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    `updated_at` = NOW();

-- بررسی وجود Super Admin
SELECT 
    id,
    username,
    email,
    full_name,
    is_active,
    'Super Admin Check' as status
FROM super_admins
WHERE username = 'Ahmadreza.avandi';

-- ===========================================
-- خلاصه نهایی
-- ===========================================

-- تعداد کاربران در crm_system
USE `crm_system`;
SELECT COUNT(*) as total_users, 'CRM Users' as info FROM users;

-- تعداد Super Admins در saas_master
USE `saas_master`;
SELECT COUNT(*) as total_admins, 'Super Admins' as info FROM super_admins;
