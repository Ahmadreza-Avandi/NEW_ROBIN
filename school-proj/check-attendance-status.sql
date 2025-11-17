-- بررسی وضعیت فعلی حضور و غیاب

-- نمایش همه رکوردهای حضور
SELECT 
    a.id,
    a.fullName as نام,
    a.nationalCode as کد_ملی,
    COALESCE(s.name, 'بدون درس') as درس,
    TIME_FORMAT(COALESCE(s.startTime, '00:00:00'), '%H:%i') as ساعت_درس,
    TIME_FORMAT(a.checkin_time, '%H:%i') as ساعت_حضور,
    a.status as وضعیت,
    a.subjectId as شناسه_درس
FROM attendance a
LEFT JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.checkin_time, a.fullName;

-- بررسی رکوردهایی که ساعت حضور با ساعت درس مطابقت ندارد
SELECT 
    'رکوردهای نامطابق' as نوع,
    a.fullName as نام,
    s.name as درس,
    TIME_FORMAT(s.startTime, '%H:%i') as ساعت_صحیح,
    TIME_FORMAT(a.checkin_time, '%H:%i') as ساعت_فعلی
FROM attendance a
JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
  AND TIME(a.checkin_time) != TIME(s.startTime);

-- آمار کلی
SELECT 
    COUNT(*) as تعداد_کل_رکوردها,
    COUNT(CASE WHEN status = 'present' THEN 1 END) as تعداد_حاضرین,
    COUNT(CASE WHEN status = 'absent' THEN 1 END) as تعداد_غایبین,
    COUNT(DISTINCT nationalCode) as تعداد_دانش_آموزان
FROM attendance 
WHERE jalali_date = '1404/08/26' 
  AND classId = 7;