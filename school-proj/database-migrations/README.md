# 🗄️ راهنمای مهاجرت دیتابیس

## 📋 فهرست مهاجرت‌ها

### مرحله 1: `001_initial_setup.sql`
- ایجاد دیتابیس `school`
- ایجاد کاربر `crm_user`
- تنظیم دسترسی‌ها

### مرحله 2: `002_create_tables.sql`
- ایجاد تمام جداول اصلی
- تنظیم Foreign Keys
- ایجاد ایندکس‌های اولیه

### مرحله 3: `003_insert_initial_data.sql`
- درج نقش‌ها (مدیر، معلم، دانش‌آموز)
- درج پایه‌ها (دهم، یازدهم، دوازدهم)
- درج رشته‌ها (شبکه، مکاترونیک، ماشین ابزار)
- درج کلاس‌های نمونه
- ایجاد کاربر مدیر پیش‌فرض

### مرحله 4: `004_create_views_procedures.sql`
- ایجاد View های کاربردی
- ایجاد Stored Procedures

### مرحله 5: `005_optimization_indexes.sql`
- اضافه کردن ایندکس‌های بهینه‌سازی
- تنظیمات performance

---

## 🚀 نحوه اجرا

### روش 1: اجرای خودکار (توصیه می‌شود)

```bash
cd database-migrations
bash run-migrations.sh
```

یا با پارامترهای سفارشی:

```bash
bash run-migrations.sh [username] [password] [database] [host]

# مثال:
bash run-migrations.sh crm_user 1234 school localhost
```

### روش 2: اجرای دستی

```bash
# مرحله 1
mysql -u root -p < 001_initial_setup.sql

# مرحله 2
mysql -u crm_user -p1234 school < 002_create_tables.sql

# مرحله 3
mysql -u crm_user -p1234 school < 003_insert_initial_data.sql

# مرحله 4
mysql -u crm_user -p1234 school < 004_create_views_procedures.sql

# مرحله 5
mysql -u crm_user -p1234 school < 005_optimization_indexes.sql
```

### روش 3: از طریق phpMyAdmin

1. وارد phpMyAdmin شوید
2. دیتابیس `school` را انتخاب کنید
3. به تب "SQL" بروید
4. محتوای هر فایل را کپی و اجرا کنید (به ترتیب)

---

## 🔐 اطلاعات ورود پیش‌فرض

بعد از اجرای مهاجرت‌ها:

```
کاربر مدیر:
  کد ملی: 0000000000
  رمز عبور: admin123
```

⚠️ **مهم**: حتماً بعد از اولین ورود، رمز عبور را تغییر دهید!

---

## 📊 ساختار دیتابیس

### جداول اصلی:

```
role          → نقش‌ها (مدیر، معلم، دانش‌آموز)
grade         → پایه‌های تحصیلی
major         → رشته‌ها
class         → کلاس‌ها
user          → کاربران
subject       → دروس
attendance    → حضور و غیاب
location      → مکان‌ها
last_seen     → آخرین بازدید
```

### View ها:

```
v_users_full         → اطلاعات کامل کاربران
v_classes_full       → اطلاعات کامل کلاس‌ها
v_subjects_full      → اطلاعات کامل دروس
v_attendance_stats   → آمار حضور و غیاب
```

### Stored Procedures:

```
sp_get_teacher_subjects(teacherId)           → دروس یک معلم
sp_get_student_attendance(nationalCode, limit) → حضور یک دانش‌آموز
sp_class_attendance_by_date(classId, date)   → حضور کلاس در یک تاریخ
```

---

## 🧪 تست دیتابیس

بعد از اجرای مهاجرت‌ها، این کوئری‌ها را اجرا کنید:

```sql
-- بررسی جداول
SHOW TABLES;

-- بررسی تعداد رکوردها
SELECT 'نقش‌ها' AS جدول, COUNT(*) AS تعداد FROM role
UNION ALL
SELECT 'پایه‌ها', COUNT(*) FROM grade
UNION ALL
SELECT 'رشته‌ها', COUNT(*) FROM major
UNION ALL
SELECT 'کلاس‌ها', COUNT(*) FROM class
UNION ALL
SELECT 'کاربران', COUNT(*) FROM user;

-- بررسی View ها
SELECT * FROM v_users_full LIMIT 5;
SELECT * FROM v_classes_full;

-- تست Stored Procedure
CALL sp_get_teacher_subjects(1);
```

---

## 🔄 Rollback (بازگشت)

اگر نیاز به بازگشت دارید:

```sql
-- حذف دیتابیس (⚠️ خطرناک!)
DROP DATABASE IF EXISTS school;

-- یا حذف جداول
USE school;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS class;
DROP TABLE IF EXISTS location;
DROP TABLE IF EXISTS last_seen;
DROP TABLE IF EXISTS grade;
DROP TABLE IF EXISTS major;
DROP TABLE IF EXISTS role;
```

---

## 📝 نکات مهم

1. **Backup**: همیشه قبل از اجرا backup بگیرید
2. **Permissions**: مطمئن شوید کاربر MySQL دسترسی لازم را دارد
3. **Character Set**: همه جداول `utf8mb4` هستند
4. **Foreign Keys**: رعایت ترتیب حذف مهم است
5. **Production**: در production از کاربر root استفاده نکنید

---

## 🆘 عیب‌یابی

### خطا: Access denied

```bash
# بررسی دسترسی کاربر
mysql -u root -p -e "SHOW GRANTS FOR 'crm_user'@'localhost';"

# اعطای دسترسی
mysql -u root -p -e "GRANT ALL PRIVILEGES ON school.* TO 'crm_user'@'localhost';"
```

### خطا: Table already exists

```bash
# حذف جدول موجود
mysql -u crm_user -p1234 school -e "DROP TABLE IF EXISTS table_name;"
```

### خطا: Cannot add foreign key constraint

```bash
# بررسی جداول والد
mysql -u crm_user -p1234 school -e "SHOW TABLES;"

# اجرای مجدد به ترتیب
```

---

## 📞 پشتیبانی

برای مشکلات:
1. لاگ‌های MySQL را بررسی کنید
2. دسترسی‌های کاربر را چک کنید
3. ترتیب اجرای فایل‌ها را رعایت کنید
