-- ==========================================
-- حذف دروس تکراری و تصحیح ساعت‌های حضور
-- ==========================================

-- ابتدا دروس تکراری را حذف می‌کنیم
-- فقط دروس با ID های 2, 3, 4, 5 را نگه می‌داریم و بقیه را حذف می‌کنیم
DELETE FROM subject WHERE id IN (6, 7, 8, 9);

-- حذف رکوردهای حضور مربوط به دروس حذف شده
DELETE FROM attendance WHERE subjectId IN (6, 7, 8, 9);

-- بروزرسانی ساعت‌های حضور در جدول attendance
-- زنگ اول: تجارت الکترونیک (7:30-9:00) -> ساعت حضور: 7:30
UPDATE attendance 
SET checkin_time = '07:30:00' 
WHERE subjectId = 2 AND jalali_date = '1404/08/26';

-- زنگ دوم: امنیت شبکه (9:00-10:30) -> ساعت حضور: 9:00
UPDATE attendance 
SET checkin_time = '09:00:00' 
WHERE subjectId = 3 AND jalali_date = '1404/08/26';

-- زنگ سوم: تجارت الکترونیک (10:30-12:30) -> ساعت حضور: 10:30
UPDATE attendance 
SET checkin_time = '10:30:00' 
WHERE subjectId = 4 AND jalali_date = '1404/08/26';

-- زنگ چهارم: امنیت شبکه (12:30-13:45) -> ساعت حضور: 12:30
UPDATE attendance 
SET checkin_time = '12:30:00' 
WHERE subjectId = 5 AND jalali_date = '1404/08/26';

-- بررسی نتیجه - نمایش دروس باقی‌مانده
SELECT 
    s.id,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as startTime,
    TIME_FORMAT(s.endTime, '%H:%i') as endTime,
    s.dayOfWeek,
    c.name as className
FROM subject s
JOIN class c ON s.classId = c.id
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
ORDER BY s.startTime;

-- بررسی نتیجه - نمایش رکوردهای حضور
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

-- نمایش تعداد دروس و رکوردهای حضور
SELECT 
    'دروس' as type,
    COUNT(*) as count
FROM subject 
WHERE classId = 7 AND dayOfWeek = 'شنبه'

UNION ALL

SELECT 
    'رکوردهای حضور' as type,
    COUNT(*) as count
FROM attendance 
WHERE jalali_date = '1404/08/26' AND classId = 7;

SELECT 'تصحیحات با موفقیت انجام شد!' AS result;