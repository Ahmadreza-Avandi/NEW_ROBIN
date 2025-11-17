-- تصحیح سریع ساعت‌های حضور

-- تصحیح ساعت حضور بر اساس درس انتخاب شده
UPDATE attendance a
JOIN subject s ON a.subjectId = s.id
SET a.checkin_time = s.startTime
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7;

-- بررسی نتیجه
SELECT 
    a.fullName as نام,
    s.name as درس,
    TIME_FORMAT(a.checkin_time, '%H:%i') as ساعت_حضور,
    a.status as وضعیت
FROM attendance a
JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.checkin_time, a.fullName;

SELECT 'ساعت‌های حضور تصحیح شدند!' as نتیجه;