# 🔧 راهنمای حل مشکلات ایمپورت دیتابیس

## 🔍 مشکلات شایع و راه‌حل‌ها

### 1. دیتابیس خالی است (جداول ایمپورت نشده‌اند)

**علت‌های احتمالی:**
- فایل‌های SQL در مکان درست قرار ندارند
- Docker volume از قبل وجود داشته و init scripts اجرا نشده‌اند
- مشکل در مجوزهای فایل‌ها
- خطا در فایل‌های SQL

**راه‌حل‌ها:**

#### راه‌حل 1: استفاده از اسکریپت رفع مشکل (توصیه می‌شود)
```bash
chmod +x fix-database-import.sh
./fix-database-import.sh
```

#### راه‌حل 2: دیپلوی مجدد با --clean
```bash
./deploy-server.sh --clean
```

#### راه‌حل 3: ایمپورت دستی
```bash
# 1. کپی فایل‌ها به کانتینر
docker cp database/crm_system.sql $(docker-compose ps -q mysql):/tmp/crm.sql
docker cp database/saas_master.sql $(docker-compose ps -q mysql):/tmp/saas.sql

# 2. ایمپورت
docker-compose exec mysql mariadb -u root -p1234 crm_system < /tmp/crm.sql
docker-compose exec mysql mariadb -u root -p1234 saas_master < /tmp/saas.sql
```

### 2. فایل‌های SQL یافت نمی‌شوند

**بررسی مکان‌های مختلف:**
```bash
# بررسی پوشه database
ls -la database/*.sql

# بررسی root پروژه
ls -la *.sql

# جستجوی کلی
find . -name "*.sql" -type f
```

**راه‌حل:**
- فایل `crm_system.sql` را در پوشه `database/` قرار دهید
- یا فایل `دیتابیس.sql` را در root پروژه قرار دهید
- اطمینان حاصل کنید که فایل‌ها readable هستند

### 3. کاربر crm_user نمی‌تواند اتصال برقرار کند

**تست اتصال:**
```bash
docker-compose exec mysql mariadb -u crm_user -p1234 -e "SELECT 1;"
```

**راه‌حل:**
```bash
# ایجاد مجدد کاربر
docker-compose exec mysql mariadb -u root -p1234 -e "
DROP USER IF EXISTS 'crm_user'@'%';
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON *.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
"
```

### 4. مشکل در init scripts

**علت:**
- Docker volume از قبل وجود دارد
- Init scripts فقط در اولین راه‌اندازی اجرا می‌شوند

**راه‌حل:**
```bash
# حذف volume و راه‌اندازی مجدد
docker-compose down
docker volume rm $(basename $(pwd))_mysql_data
docker-compose up -d mysql
```

## 🧪 تست و بررسی

### تست سریع وضعیت دیتابیس
```bash
chmod +x test-database-import.sh
./test-database-import.sh
```

### بررسی دستی

#### 1. بررسی کانتینر MySQL
```bash
docker ps | grep mysql
docker-compose logs mysql
```

#### 2. بررسی دیتابیس‌ها
```bash
docker-compose exec mysql mariadb -u root -p1234 -e "SHOW DATABASES;"
```

#### 3. بررسی جداول
```bash
# crm_system
docker-compose exec mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;"

# saas_master
docker-compose exec mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;"
```

#### 4. بررسی کاربران
```bash
# کاربران MySQL
docker-compose exec mysql mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user;"

# کاربر CEO در crm_system
docker-compose exec mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT id, email, role FROM users WHERE email='Robintejarat@gmail.com';"

# Super Admin در saas_master
docker-compose exec mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT username, email, is_active FROM super_admins;"
```

## 📁 ساختار فایل‌های مورد نیاز

```
database/
├── 00-init-databases.sql     # ایجاد دیتابیس‌ها و کاربر
├── 01-crm_system.sql        # جداول CRM
├── 02-saas_master.sql       # جداول SaaS
└── 03-admin-users.sql       # کاربران ادمین
```

## 🔧 دستورات مفید

### مدیریت Docker
```bash
# مشاهده وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs mysql
docker-compose logs mysql -f

# راه‌اندازی مجدد
docker-compose restart mysql

# ورود به کانتینر
docker-compose exec mysql bash
```

### مدیریت دیتابیس
```bash
# ورود به MySQL
docker-compose exec mysql mariadb -u root -p1234

# بک‌آپ
docker-compose exec mysql mariadb-dump -u root -p1234 crm_system > backup_crm.sql
docker-compose exec mysql mariadb-dump -u root -p1234 saas_master > backup_saas.sql

# ریستور
docker-compose exec mysql mariadb -u root -p1234 crm_system < backup_crm.sql
```

### بررسی حافظه و منابع
```bash
# حافظه سیستم
free -h

# استفاده حافظه Docker
docker stats

# اندازه volumes
docker system df
```

## ⚠️ نکات مهم

1. **همیشه قبل از تغییرات مهم بک‌آپ بگیرید**
2. **فایل‌های SQL باید encoding درست داشته باشند (UTF-8)**
3. **مجوزهای فایل‌ها را بررسی کنید**
4. **در محیط production از رمزهای قوی استفاده کنید**
5. **لاگ‌ها را مرتب بررسی کنید**

## 🆘 در صورت مشکل

اگر هنوز مشکل دارید:

1. **لاگ‌های کامل را بررسی کنید:**
   ```bash
   docker-compose logs mysql > mysql_logs.txt
   ```

2. **اسکریپت تست را اجرا کنید:**
   ```bash
   ./test-database-import.sh > test_results.txt
   ```

3. **فایل‌های SQL را بررسی کنید:**
   ```bash
   head -20 database/crm_system.sql
   tail -20 database/crm_system.sql
   ```

4. **از اسکریپت رفع مشکل استفاده کنید:**
   ```bash
   ./fix-database-import.sh
   ```