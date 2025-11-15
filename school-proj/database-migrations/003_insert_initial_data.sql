-- ========================================
-- مرحله 3: درج داده‌های اولیه
-- ========================================

USE school;

-- درج نقش‌ها
INSERT INTO role (id, name, permissions) VALUES
(1, 'مدیر', '{"viewPlaces": true, "editPlaces": true, "deletePlaces": true, "viewPersons": true, "editPersons": true, "deletePersons": true, "viewRoles": true, "editRoles": true, "deleteRoles": true}'),
(2, 'معلم', '{"viewPlaces": true, "editPlaces": false, "deletePlaces": false, "viewPersons": true, "editPersons": false, "deletePersons": false, "viewRoles": false, "editRoles": false, "deleteRoles": false}'),
(3, 'دانش‌آموز', '{"viewPlaces": false, "editPlaces": false, "deletePlaces": false, "viewPersons": false, "editPersons": false, "deletePersons": false, "viewRoles": false, "editRoles": false, "deleteRoles": false}')
ON DUPLICATE KEY UPDATE 
  permissions = VALUES(permissions);

-- درج پایه‌های تحصیلی
INSERT INTO grade (id, name) VALUES
(1, 'یازدهم'),
(2, 'دوازدهم'),
(3, 'دهم')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name);

-- درج رشته‌ها
INSERT INTO major (id, name) VALUES
(1, 'شبکه و نرم‌افزار'),
(2, 'مکاترونیک'),
(3, 'ماشین ابزار')
ON DUPLICATE KEY UPDATE 
  name = VALUES(name);

-- درج کلاس‌ها
INSERT INTO class (id, name, majorId, gradeId) VALUES
(1, 'یازدهم شبکه و نرم‌افزار', 1, 1),
(2, 'دوازدهم مکاترونیک', 2, 2),
(3, 'دهم شبکه و نرم‌افزار', 1, 3),
(4, 'دهم مکاترونیک', 2, 3),
(5, 'یازدهم مکاترونیک', 2, 1),
(6, 'دوازدهم ماشین ابزار', 3, 2)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  majorId = VALUES(majorId),
  gradeId = VALUES(gradeId);

-- درج کاربر مدیر پیش‌فرض
-- رمز عبور: admin123
INSERT INTO user (id, fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId) VALUES
(1, 'مدیر سیستم', '0000000000', '09000000000', '$2a$10$j/KCE2ssT13HxS505UR7HecVmy53oekUg.2k5/8omY6CDoFEvYgU2', 1, NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE 
  fullName = VALUES(fullName),
  roleId = VALUES(roleId);

SELECT 'مرحله 3: داده‌های اولیه با موفقیت درج شدند' AS status;
SELECT '⚠️ توجه: کاربر مدیر پیش‌فرض:' AS note;
SELECT 'کد ملی: 0000000000' AS admin_username;
SELECT 'رمز عبور: admin123' AS admin_password;
SELECT '🔐 لطفاً بعد از ورود، رمز عبور را تغییر دهید!' AS warning;
