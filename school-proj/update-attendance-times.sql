-- ==========================================
-- آپدیت ساعت حضور برای رکوردهای موجود
-- تغییر ساعت حضور به 5 دقیقه بعد از شروع کلاس
-- ==========================================

-- آپدیت زنگ اول (7:30 -> 7:35)
UPDATE `attendance` 
SET `checkin_time` = '07:35:00' 
WHERE `jalali_date` = '1404/08/26' 
  AND `classId` = 7 
  AND `checkin_time` = '07:30:00'
  AND `subjectId` = (SELECT id FROM subject WHERE name = 'تجارت الکترونیک' AND classId = 7 AND startTime = '07:30:00' LIMIT 1);

-- آپدیت زنگ دوم (9:00 -> 9:05)
UPDATE `attendance` 
SET `checkin_time` = '09:05:00' 
WHERE `jalali_date` = '1404/08/26' 
  AND `classId` = 7 
  AND `checkin_time` = '09:00:00'
  AND `subjectId` = (SELECT id FROM subject WHERE name = 'امنیت شبکه' AND classId = 7 AND startTime = '09:00:00' LIMIT 1);

-- آپدیت زنگ سوم (10:30 -> 10:35)
UPDATE `attendance` 
SET `checkin_time` = '10:35:00' 
WHERE `jalali_date` = '1404/08/26' 
  AND `classId` = 7 
  AND `checkin_time` = '10:30:00'
  AND `subjectId` = (SELECT id FROM subject WHERE name = 'تجارت الکترونیک' AND classId = 7 AND startTime = '10:30:00' LIMIT 1);

-- آپدیت زنگ چهارم (12:30 -> 12:35)
UPDATE `attendance` 
SET `checkin_time` = '12:35:00' 
WHERE `jalali_date` = '1404/08/26' 
  AND `classId` = 7 
  AND `checkin_time` = '12:30:00'
  AND `subjectId` = (SELECT id FROM subject WHERE name = 'امنیت شبکه' AND classId = 7 AND startTime = '12:30:00' LIMIT 1);

-- بررسی نتیجه
SELECT 
  a.id,
  a.fullName,
  s.name as subjectName,
  TIME_FORMAT(s.startTime, '%H:%i') as classStart,
  TIME_FORMAT(a.checkin_time, '%H:%i') as attendanceTime,
  a.status
FROM attendance a
JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.checkin_time, a.fullName;

SELECT 'ساعت‌های حضور با موفقیت به‌روزرسانی شدند!' AS result;
