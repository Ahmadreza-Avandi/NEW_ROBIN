-- ==========================================
-- حل کامل مشکل سیستم حضور و غیاب
-- حذف دروس تکراری و تصحیح ساعت‌های حضور
-- ==========================================

-- مرحله 1: بررسی وضعیت فعلی
SELECT '=== بررسی وضعیت فعلی ===' as step;

SELECT 
    s.id,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as startTime,
    TIME_FORMAT(s.endTime, '%H:%i') as endTime
FROM subject s
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
ORDER BY s.startTime;

-- مرحله 2: حذف دروس تکراری
SELECT '=== حذف دروس تکراری ===' as step;

-- حذف دروس با ID های بالاتر (6, 7, 8, 9) که تکراری هستند
DELETE FROM attendance WHERE subjectId IN (6, 7, 8, 9);
DELETE FROM subject WHERE id IN (6, 7, 8, 9);

-- مرحله 3: تصحیح ساعت‌های حضور
SELECT '=== تصحیح ساعت‌های حضور ===' as step;

-- زنگ اول: تجارت الکترونیک (7:30-9:00)
UPDATE attendance 
SET checkin_time = '07:30:00' 
WHERE subjectId = 2 
  AND jalali_date = '1404/08/26' 
  AND classId = 7;

-- زنگ دوم: امنیت شبکه (9:00-10:30)
UPDATE attendance 
SET checkin_time = '09:00:00' 
WHERE subjectId = 3 
  AND jalali_date = '1404/08/26' 
  AND classId = 7;

-- زنگ سوم: تجارت الکترونیک (10:30-12:30)
UPDATE attendance 
SET checkin_time = '10:30:00' 
WHERE subjectId = 4 
  AND jalali_date = '1404/08/26' 
  AND classId = 7;

-- زنگ چهارم: امنیت شبکه (12:30-13:45)
UPDATE attendance 
SET checkin_time = '12:30:00' 
WHERE subjectId = 5 
  AND jalali_date = '1404/08/26' 
  AND classId = 7;

-- مرحله 4: بررسی نتیجه نهایی
SELECT '=== نتیجه نهایی - دروس ===' as step;

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

SELECT '=== نتیجه نهایی - حضور و غیاب ===' as step;

SELECT 
    a.id,
    a.fullName,
    a.nationalCode,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as classStart,
    TIME_FORMAT(a.checkin_time, '%H:%i') as attendanceTime,
    a.status,
    CASE 
        WHEN TIME(a.checkin_time) = TIME(s.startTime) THEN 'مطابق'
        ELSE 'نامطابق'
    END as time_match
FROM attendance a
JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.checkin_time, a.fullName;

-- مرحله 5: آمار نهایی
SELECT '=== آمار نهایی ===' as step;

SELECT 
    'تعداد دروس' as item,
    COUNT(*) as count
FROM subject 
WHERE classId = 7 AND dayOfWeek = 'شنبه'

UNION ALL

SELECT 
    'تعداد رکوردهای حضور' as item,
    COUNT(*) as count
FROM attendance 
WHERE jalali_date = '1404/08/26' AND classId = 7

UNION ALL

SELECT 
    'تعداد دانش‌آموزان' as item,
    COUNT(DISTINCT nationalCode) as count
FROM attendance 
WHERE jalali_date = '1404/08/26' AND classId = 7;

-- پیام نهایی
SELECT 'سیستم حضور و غیاب با موفقیت تصحیح شد!' AS final_message;

-- نمایش برنامه درسی نهایی برای تأیید
SELECT '=== برنامه درسی نهایی شنبه ===' as final_schedule;

SELECT 
    CONCAT(TIME_FORMAT(s.startTime, '%H:%i'), ' - ', TIME_FORMAT(s.endTime, '%H:%i')) as time_slot,
    s.name as subject,
    COUNT(DISTINCT a.nationalCode) as students_present
FROM subject s
LEFT JOIN attendance a ON s.id = a.subjectId 
    AND a.jalali_date = '1404/08/26' 
    AND a.status = 'present'
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
GROUP BY s.id, s.startTime, s.endTime, s.name
ORDER BY s.startTime;