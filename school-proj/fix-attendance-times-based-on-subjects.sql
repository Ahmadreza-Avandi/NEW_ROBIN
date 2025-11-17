-- ==========================================
-- تصحیح ساعت‌های حضور بر اساس درس‌های انتخاب شده
-- ==========================================

-- ابتدا بررسی می‌کنیم چه رکوردهای حضوری وجود دارد
SELECT '=== بررسی رکوردهای حضور فعلی ===' as step;

SELECT 
    a.id,
    a.fullName,
    a.nationalCode,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as correct_time,
    TIME_FORMAT(a.checkin_time, '%H:%i') as current_time,
    a.status,
    a.subjectId
FROM attendance a
LEFT JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.subjectId, a.fullName;

-- تصحیح ساعت‌های حضور بر اساس درس انتخاب شده
SELECT '=== تصحیح ساعت‌های حضور ===' as step;

-- برای درس تجارت الکترونیک زنگ اول (subjectId = 2) -> ساعت 7:30
UPDATE attendance a
JOIN subject s ON a.subjectId = s.id
SET a.checkin_time = s.startTime
WHERE a.subjectId = 2 
  AND a.jalali_date = '1404/08/26' 
  AND a.classId = 7;

-- برای درس امنیت شبکه زنگ دوم (subjectId = 3) -> ساعت 9:00
UPDATE attendance a
JOIN subject s ON a.subjectId = s.id
SET a.checkin_time = s.startTime
WHERE a.subjectId = 3 
  AND a.jalali_date = '1404/08/26' 
  AND a.classId = 7;

-- برای درس تجارت الکترونیک زنگ سوم (subjectId = 4) -> ساعت 10:30
UPDATE attendance a
JOIN subject s ON a.subjectId = s.id
SET a.checkin_time = s.startTime
WHERE a.subjectId = 4 
  AND a.jalali_date = '1404/08/26' 
  AND a.classId = 7;

-- برای درس امنیت شبکه زنگ چهارم (subjectId = 5) -> ساعت 12:30
UPDATE attendance a
JOIN subject s ON a.subjectId = s.id
SET a.checkin_time = s.startTime
WHERE a.subjectId = 5 
  AND a.jalali_date = '1404/08/26' 
  AND a.classId = 7;

-- اگر رکوردهایی بدون subjectId وجود دارند، آن‌ها را هم تصحیح می‌کنیم
-- (رکوردهایی که ممکن است از سیستم قدیمی باشند)
UPDATE attendance 
SET checkin_time = '07:30:00'
WHERE subjectId IS NULL 
  AND jalali_date = '1404/08/26' 
  AND classId = 7
  AND TIME(checkin_time) BETWEEN '07:00:00' AND '08:59:59';

UPDATE attendance 
SET checkin_time = '09:00:00'
WHERE subjectId IS NULL 
  AND jalali_date = '1404/08/26' 
  AND classId = 7
  AND TIME(checkin_time) BETWEEN '09:00:00' AND '10:29:59';

UPDATE attendance 
SET checkin_time = '10:30:00'
WHERE subjectId IS NULL 
  AND jalali_date = '1404/08/26' 
  AND classId = 7
  AND TIME(checkin_time) BETWEEN '10:30:00' AND '12:29:59';

UPDATE attendance 
SET checkin_time = '12:30:00'
WHERE subjectId IS NULL 
  AND jalali_date = '1404/08/26' 
  AND classId = 7
  AND TIME(checkin_time) BETWEEN '12:30:00' AND '23:59:59';

-- بررسی نتیجه نهایی
SELECT '=== نتیجه نهایی ===' as step;

SELECT 
    a.id,
    a.fullName,
    a.nationalCode,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as subject_start_time,
    TIME_FORMAT(a.checkin_time, '%H:%i') as attendance_time,
    a.status,
    CASE 
        WHEN TIME(a.checkin_time) = TIME(s.startTime) THEN '✓ مطابق'
        ELSE '✗ نامطابق'
    END as time_status
FROM attendance a
LEFT JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.checkin_time, a.fullName;

-- آمار نهایی
SELECT '=== آمار نهایی ===' as step;

SELECT 
    s.name as درس,
    TIME_FORMAT(s.startTime, '%H:%i') as ساعت_شروع,
    COUNT(a.id) as تعداد_حضور,
    GROUP_CONCAT(DISTINCT a.fullName ORDER BY a.fullName SEPARATOR ', ') as دانش_آموزان_حاضر
FROM subject s
LEFT JOIN attendance a ON s.id = a.subjectId 
    AND a.jalali_date = '1404/08/26' 
    AND a.status = 'present'
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
GROUP BY s.id, s.name, s.startTime
ORDER BY s.startTime;

SELECT 'ساعت‌های حضور با موفقیت تصحیح شدند!' AS final_message;