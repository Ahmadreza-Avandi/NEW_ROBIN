-- ========================================
-- مرحله 4: ایجاد View ها و Stored Procedures
-- ========================================

USE school;

-- View: اطلاعات کامل کاربران
CREATE OR REPLACE VIEW v_users_full AS
SELECT 
    u.id,
    u.fullName,
    u.nationalCode,
    u.phoneNumber,
    u.roleId,
    r.name AS roleName,
    r.permissions,
    u.classId,
    c.name AS className,
    u.majorId,
    m.name AS majorName,
    u.gradeId,
    g.name AS gradeName,
    u.createdAt,
    u.updatedAt
FROM user u
LEFT JOIN role r ON u.roleId = r.id
LEFT JOIN class c ON u.classId = c.id
LEFT JOIN major m ON u.majorId = m.id
LEFT JOIN grade g ON u.gradeId = g.id;

-- View: اطلاعات کامل کلاس‌ها
CREATE OR REPLACE VIEW v_classes_full AS
SELECT 
    c.id,
    c.name AS className,
    c.majorId,
    m.name AS majorName,
    c.gradeId,
    g.name AS gradeName,
    COUNT(DISTINCT u.id) AS studentCount,
    COUNT(DISTINCT s.id) AS subjectCount,
    c.createdAt,
    c.updatedAt
FROM class c
LEFT JOIN major m ON c.majorId = m.id
LEFT JOIN grade g ON c.gradeId = g.id
LEFT JOIN user u ON u.classId = c.id AND u.roleId = 3
LEFT JOIN subject s ON s.classId = c.id
GROUP BY c.id, c.name, c.majorId, m.name, c.gradeId, g.name, c.createdAt, c.updatedAt;

-- View: اطلاعات کامل دروس
CREATE OR REPLACE VIEW v_subjects_full AS
SELECT 
    s.id,
    s.name AS subjectName,
    s.classId,
    c.name AS className,
    s.teacherId,
    u.fullName AS teacherName,
    s.dayOfWeek,
    s.startTime,
    s.endTime,
    g.name AS gradeName,
    m.name AS majorName,
    s.createdAt,
    s.updatedAt
FROM subject s
JOIN class c ON s.classId = c.id
JOIN user u ON s.teacherId = u.id
LEFT JOIN grade g ON c.gradeId = g.id
LEFT JOIN major m ON c.majorId = m.id;

-- View: آمار حضور و غیاب
CREATE OR REPLACE VIEW v_attendance_stats AS
SELECT 
    u.id AS userId,
    u.fullName,
    u.nationalCode,
    u.classId,
    c.name AS className,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS presentCount,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absentCount,
    COUNT(*) AS totalDays,
    ROUND(COUNT(CASE WHEN a.status = 'present' THEN 1 END) * 100.0 / COUNT(*), 2) AS attendancePercentage
FROM user u
LEFT JOIN class c ON u.classId = c.id
LEFT JOIN attendance a ON u.nationalCode = a.nationalCode
WHERE u.roleId = 3
GROUP BY u.id, u.fullName, u.nationalCode, u.classId, c.name;

-- Stored Procedure: دریافت دروس یک معلم
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_teacher_subjects(IN p_teacherId INT)
BEGIN
    SELECT 
        s.id,
        s.name AS subjectName,
        c.name AS className,
        s.dayOfWeek,
        s.startTime,
        s.endTime,
        COUNT(DISTINCT u.id) AS studentCount
    FROM subject s
    JOIN class c ON s.classId = c.id
    LEFT JOIN user u ON u.classId = c.id AND u.roleId = 3
    WHERE s.teacherId = p_teacherId
    GROUP BY s.id, s.name, c.name, s.dayOfWeek, s.startTime, s.endTime
    ORDER BY 
        FIELD(s.dayOfWeek, 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'),
        s.startTime;
END //
DELIMITER ;

-- Stored Procedure: دریافت حضور و غیاب یک دانش‌آموز
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_get_student_attendance(
    IN p_nationalCode VARCHAR(10),
    IN p_limit INT
)
BEGIN
    SELECT 
        a.id,
        a.jalali_date,
        a.gregorian_date,
        a.dayOfWeek,
        a.checkin_time,
        a.status,
        s.name AS subjectName,
        c.name AS className,
        a.location
    FROM attendance a
    LEFT JOIN subject s ON a.subjectId = s.id
    LEFT JOIN class c ON a.classId = c.id
    WHERE a.nationalCode = p_nationalCode
    ORDER BY a.gregorian_date DESC, a.checkin_time DESC
    LIMIT p_limit;
END //
DELIMITER ;

-- Stored Procedure: آمار حضور کلاس در یک تاریخ
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS sp_class_attendance_by_date(
    IN p_classId INT,
    IN p_jalaliDate VARCHAR(10)
)
BEGIN
    SELECT 
        u.id,
        u.fullName,
        u.nationalCode,
        COALESCE(a.status, 'absent') AS status,
        a.checkin_time,
        COUNT(DISTINCT a.subjectId) AS attendedSubjects,
        (SELECT COUNT(*) FROM subject WHERE classId = p_classId) AS totalSubjects
    FROM user u
    LEFT JOIN attendance a ON u.nationalCode = a.nationalCode 
        AND a.jalali_date = p_jalaliDate
    WHERE u.classId = p_classId AND u.roleId = 3
    GROUP BY u.id, u.fullName, u.nationalCode, a.status, a.checkin_time
    ORDER BY u.fullName;
END //
DELIMITER ;

SELECT 'مرحله 4: View ها و Stored Procedures با موفقیت ایجاد شدند' AS status;
