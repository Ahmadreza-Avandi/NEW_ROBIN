-- اضافه کردن ستون عکس به جدول User
ALTER TABLE User 
ADD COLUMN profilePhoto LONGTEXT NULL COMMENT 'تصویر پروفایل کاربر (Base64)';

-- یا اگه میخوای در جدول attendance باشه:
ALTER TABLE attendance 
ADD COLUMN faceImage LONGTEXT NULL COMMENT 'تصویر چهره در زمان حضور (Base64)';

-- ایندکس برای بهبود سرعت
CREATE INDEX idx_user_nationalCode ON User(nationalCode);
CREATE INDEX idx_attendance_nationalCode ON attendance(nationalCode);
