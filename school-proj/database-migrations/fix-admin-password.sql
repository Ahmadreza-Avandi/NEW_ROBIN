-- ========================================
-- اصلاح رمز عبور مدیر
-- ========================================
-- این اسکریپت رمز عبور مدیر را به صورت هش شده ذخیره می‌کند

USE school;

-- حذف کاربر قبلی (اگر وجود دارد)
DELETE FROM user WHERE nationalCode = '0000000000' OR nationalCode = '1';

-- درج کاربر مدیر با رمز عبور هش شده
-- رمز عبور: admin123
-- هش bcrypt: $2a$10$j/KCE2ssT13HxS505UR7HecVmy53oekUg.2k5/8omY6CDoFEvYgU2

INSERT INTO user (id, fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId) 
VALUES (
  1, 
  'مدیر سیستم', 
  '1', 
  '1', 
  '$2a$10$j/KCE2ssT13HxS505UR7HecVmy53oekUg.2k5/8omY6CDoFEvYgU2', 
  1, 
  NULL, 
  NULL, 
  NULL
);

-- نمایش اطلاعات ورود
SELECT '✅ رمز عبور مدیر با موفقیت به‌روزرسانی شد' AS status;
SELECT '' AS '';
SELECT '🔐 اطلاعات ورود:' AS info;
SELECT 'کد ملی: 0000000000' AS username;
SELECT 'رمز عبور: admin123' AS password;
SELECT '' AS '';
SELECT '⚠️ لطفاً بعد از ورود، رمز عبور را تغییر دهید!' AS warning;
