# 🗄️ راهنمای مهاجرت و به‌روزرسانی دیتابیس

## 📊 ساختار فعلی دیتابیس

### جداول موجود:
1. **User** - کاربران (مدیر، معلم، دانش‌آموز)
2. **Role** - نقش‌ها و دسترسی‌ها
3. **Class** - کلاس‌ها
4. **grade** - پایه‌های تحصیلی (دهم، یازدهم، دوازدهم)
5. **major** - رشته‌ها (شبکه، مکاترونیک، ماشین ابزار)
6. **Subject** - دروس (با معلم، کلاس، روز و ساعت)
7. **attendance** - حضور و غیاب

### روابط:
```
User → Role (roleId)
User → Class (classId)
User → major (majorId)
User → grade (gradeId)

Class → major (majorId)
Class → grade (gradeId)

Subject → Class (classId)
Subject → User/Teacher (teacherId)

attendance → User (nationalCode)
attendance → Class (classId)
attendance → Subject (subjectId)
```

---

## 🔐 سیستم دسترسی

### نقش‌ها (Roles):

#### 1. مدیر (roleId = 1)
✅ دسترسی کامل به همه چیز
- مدیریت کاربران
- مدیریت کلاس‌ها، پایه‌ها، رشته‌ها
- مدیریت دروس
- مشاهده حضور و غیاب

#### 2. معلم (roleId = 2)
✅ دسترسی محدود
- مشاهده دانش‌آموزان کلاس خودش
- ثبت حضور و غیاب
- مشاهده دروس خودش
❌ نمی‌تواند کلاس، پایه، رشته ایجاد کند

#### 3. دانش‌آموز (roleId = 3)
✅ دسترسی خیلی محدود
- فقط ثبت‌نام
- مشاهده پروفایل خودش
- مشاهده حضور و غیاب خودش
❌ هیچ دسترسی مدیریتی ندارد

---

## 🛠️ مراحل به‌روزرسانی دیتابیس

### مرحله 1: ایمپورت دیتابیس در لوکال

```bash
# اگر دیتابیس school وجود ندارد، ایجاد کنید
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS school CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ایجاد کاربر crm_user
mysql -u root -p -e "CREATE USER IF NOT EXISTS 'crm_user'@'localhost' IDENTIFIED BY '1234';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON school.* TO 'crm_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"

# ایمپورت دیتابیس
mysql -u crm_user -p1234 school < "mydatabase (3).sql"
```

### مرحله 2: اصلاح نام جداول (اختیاری)

اگر می‌خواهید نام جداول یکسان باشند:

```sql
-- تغییر نام جداول به حروف کوچک
RENAME TABLE `Class` TO `class`;
RENAME TABLE `Role` TO `role`;
RENAME TABLE `Subject` TO `subject`;
RENAME TABLE `User` TO `user`;
```

### مرحله 3: اضافه کردن ایندکس‌های بهینه‌سازی

```sql
-- بهینه‌سازی جستجو
ALTER TABLE attendance ADD INDEX idx_date (jalali_date);
ALTER TABLE attendance ADD INDEX idx_status (status);
ALTER TABLE subject ADD INDEX idx_day (dayOfWeek);
```

---

## 📝 اسکریپت‌های SQL مفید

### 1. مشاهده تمام کلاس‌ها با اطلاعات کامل

```sql
SELECT 
    c.id,
    c.name AS className,
    g.name AS gradeName,
    m.name AS majorName,
    COUNT(DISTINCT u.id) AS studentCount,
    COUNT(DISTINCT s.id) AS subjectCount
FROM class c
LEFT JOIN grade g ON c.gradeId = g.id
LEFT JOIN major m ON c.majorId = m.id
LEFT JOIN user u ON u.classId = c.id AND u.roleId = 3
LEFT JOIN subject s ON s.classId = c.id
GROUP BY c.id, c.name, g.name, m.name
ORDER BY g.id, m.id;
```

### 2. مشاهده دروس یک معلم

```sql
SELECT 
    s.id,
    s.name AS subjectName,
    c.name AS className,
    s.dayOfWeek,
    s.startTime,
    s.endTime,
    u.fullName AS teacherName
FROM subject s
JOIN class c ON s.classId = c.id
JOIN user u ON s.teacherId = u.id
WHERE s.teacherId = ?
ORDER BY 
    FIELD(s.dayOfWeek, 'شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه'),
    s.startTime;
```

### 3. مشاهده حضور و غیاب یک دانش‌آموز

```sql
SELECT 
    a.jalali_date,
    a.dayOfWeek,
    a.checkin_time,
    s.name AS subjectName,
    a.status,
    c.name AS className
FROM attendance a
LEFT JOIN subject s ON a.subjectId = s.id
LEFT JOIN class c ON a.classId = c.id
WHERE a.nationalCode = ?
ORDER BY a.gregorian_date DESC, a.checkin_time DESC
LIMIT 50;
```

### 4. آمار حضور و غیاب کلاس

```sql
SELECT 
    u.fullName,
    u.nationalCode,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS presentCount,
    COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absentCount,
    COUNT(*) AS totalDays
FROM user u
LEFT JOIN attendance a ON u.nationalCode = a.nationalCode
WHERE u.classId = ? AND u.roleId = 3
GROUP BY u.id, u.fullName, u.nationalCode
ORDER BY u.fullName;
```

---

## 🔄 اسکریپت‌های مهاجرت

### اضافه کردن ستون جدید به جدول

```sql
-- مثال: اضافه کردن ایمیل به کاربران
ALTER TABLE user 
ADD COLUMN email VARCHAR(255) NULL AFTER phoneNumber,
ADD UNIQUE INDEX user_email_unique (email);
```

### ایجاد جدول جدید برای لاگ‌ها

```sql
CREATE TABLE IF NOT EXISTS audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    tableName VARCHAR(50) NOT NULL,
    recordId INT NULL,
    oldValue TEXT NULL,
    newValue TEXT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES user(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_table (tableName),
    INDEX idx_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🧪 تست دیتابیس

### بررسی ساختار

```sql
-- مشاهده تمام جداول
SHOW TABLES;

-- مشاهده ساختار جدول
DESCRIBE user;
DESCRIBE subject;
DESCRIBE attendance;

-- بررسی روابط
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    CONSTRAINT_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'school'
AND REFERENCED_TABLE_NAME IS NOT NULL;
```

### بررسی داده‌ها

```sql
-- تعداد کاربران به تفکیک نقش
SELECT r.name AS roleName, COUNT(u.id) AS userCount
FROM role r
LEFT JOIN user u ON r.id = u.roleId
GROUP BY r.id, r.name;

-- تعداد دروس به تفکیک کلاس
SELECT c.name AS className, COUNT(s.id) AS subjectCount
FROM class c
LEFT JOIN subject s ON c.id = s.classId
GROUP BY c.id, c.name;
```

---

## 🚨 نکات مهم

1. **همیشه Backup بگیرید** قبل از هر تغییر
2. **تست کنید** در محیط development قبل از production
3. **Foreign Keys** را رعایت کنید
4. **Character Set** باید `utf8mb4` باشد برای پشتیبانی فارسی
5. **Indexes** را برای بهینه‌سازی اضافه کنید

---

## 📦 Backup و Restore

### Backup

```bash
# Backup کامل
mysqldump -u crm_user -p1234 school > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup فقط ساختار
mysqldump -u crm_user -p1234 --no-data school > structure.sql

# Backup فقط داده‌ها
mysqldump -u crm_user -p1234 --no-create-info school > data.sql
```

### Restore

```bash
# Restore از backup
mysql -u crm_user -p1234 school < backup_20250514_120000.sql
```
