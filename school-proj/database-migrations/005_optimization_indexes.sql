-- ========================================
-- مرحله 5: بهینه‌سازی و ایندکس‌های اضافی
-- ========================================

USE school;

-- بهینه‌سازی جدول attendance
ALTER TABLE attendance 
ADD INDEX IF NOT EXISTS idx_date_class (jalali_date, classId),
ADD INDEX IF NOT EXISTS idx_date_status (jalali_date, status),
ADD INDEX IF NOT EXISTS idx_user_date (nationalCode, jalali_date);

-- بهینه‌سازی جدول subject
ALTER TABLE subject
ADD INDEX IF NOT EXISTS idx_class_day (classId, dayOfWeek),
ADD INDEX IF NOT EXISTS idx_teacher_day (teacherId, dayOfWeek);

-- بهینه‌سازی جدول user
ALTER TABLE user
ADD INDEX IF NOT EXISTS idx_role_class (roleId, classId),
ADD INDEX IF NOT EXISTS idx_fullname (fullName);

-- تنظیمات بهینه‌سازی
ALTER TABLE attendance ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
ALTER TABLE user ENGINE=InnoDB ROW_FORMAT=DYNAMIC;
ALTER TABLE subject ENGINE=InnoDB ROW_FORMAT=DYNAMIC;

-- آنالیز جداول برای بهینه‌سازی
ANALYZE TABLE attendance;
ANALYZE TABLE user;
ANALYZE TABLE subject;
ANALYZE TABLE class;

SELECT 'مرحله 5: بهینه‌سازی و ایندکس‌ها با موفقیت اعمال شدند' AS status;
