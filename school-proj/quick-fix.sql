-- حذف سریع دروس تکراری و تصحیح ساعت‌ها

-- حذف رکوردهای حضور مربوط به دروس تکراری
DELETE FROM attendance WHERE subjectId IN (6, 7, 8, 9);

-- حذف دروس تکراری
DELETE FROM subject WHERE id IN (6, 7, 8, 9);

-- تصحیح ساعت‌های حضور
UPDATE attendance SET checkin_time = '07:30:00' WHERE subjectId = 2 AND jalali_date = '1404/08/26';
UPDATE attendance SET checkin_time = '09:00:00' WHERE subjectId = 3 AND jalali_date = '1404/08/26';
UPDATE attendance SET checkin_time = '10:30:00' WHERE subjectId = 4 AND jalali_date = '1404/08/26';
UPDATE attendance SET checkin_time = '12:30:00' WHERE subjectId = 5 AND jalali_date = '1404/08/26';

-- بررسی نتیجه
SELECT 'تصحیح انجام شد!' as result;

SELECT 
    s.name as درس,
    TIME_FORMAT(s.startTime, '%H:%i') as شروع,
    TIME_FORMAT(s.endTime, '%H:%i') as پایان,
    COUNT(a.id) as تعداد_حضور
FROM subject s
LEFT JOIN attendance a ON s.id = a.subjectId AND a.jalali_date = '1404/08/26'
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
GROUP BY s.id, s.name, s.startTime, s.endTime
ORDER BY s.startTime;