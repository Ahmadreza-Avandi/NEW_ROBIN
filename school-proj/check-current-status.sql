-- ==========================================
-- بررسی وضعیت فعلی دروس و حضور و غیاب
-- ==========================================

-- نمایش همه دروس کلاس دوازدهم شبکه برای روز شنبه
SELECT 
    'دروس موجود' as section,
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

-- نمایش همه رکوردهای حضور برای روز شنبه
SELECT 
    'رکوردهای حضور' as section,
    a.id,
    a.fullName,
    a.nationalCode,
    s.name as subjectName,
    TIME_FORMAT(s.startTime, '%H:%i') as classStart,
    TIME_FORMAT(a.checkin_time, '%H:%i') as attendanceTime,
    a.status,
    a.subjectId
FROM attendance a
LEFT JOIN subject s ON a.subjectId = s.id
WHERE a.jalali_date = '1404/08/26' 
  AND a.classId = 7
ORDER BY a.subjectId, a.fullName;

-- بررسی دروس تکراری
SELECT 
    'دروس تکراری' as section,
    s.name,
    TIME_FORMAT(s.startTime, '%H:%i') as startTime,
    TIME_FORMAT(s.endTime, '%H:%i') as endTime,
    COUNT(*) as count
FROM subject s
WHERE s.classId = 7 AND s.dayOfWeek = 'شنبه'
GROUP BY s.name, s.startTime, s.endTime
HAVING COUNT(*) > 1;

-- آمار کلی
SELECT 
    'آمار کلی' as section,
    (SELECT COUNT(*) FROM subject WHERE classId = 7 AND dayOfWeek = 'شنبه') as total_subjects,
    (SELECT COUNT(*) FROM attendance WHERE jalali_date = '1404/08/26' AND classId = 7) as total_attendance_records,
    (SELECT COUNT(DISTINCT nationalCode) FROM attendance WHERE jalali_date = '1404/08/26' AND classId = 7) as unique_students;