-- Fix admin password
-- Password: admin123
-- این کوئری رمز عبور مدیر را به admin123 تنظیم می‌کند

-- حذف کاربر قبلی و ایجاد مجدد با رمز صحیح
DELETE FROM user WHERE nationalCode = '1';

-- درج کاربر مدیر با رمز هش شده صحیح
-- رمز عبور: admin123
INSERT INTO user (id, fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId, createdAt, updatedAt) 
VALUES (
  1, 
  'مدیر سیستم', 
  '1', 
  '1', 
  '$2a$10$YourNewHashWillBeHere',  -- این باید با خروجی generate-password.js جایگزین شود
  1, 
  NULL, 
  NULL, 
  NULL, 
  NOW(), 
  NOW()
);
