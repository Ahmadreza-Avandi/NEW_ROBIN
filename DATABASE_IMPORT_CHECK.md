# ✅ گزارش بررسی ایمپورت خودکار دیتابیس

## 📊 وضعیت فایل‌های دیتابیس

### فایل‌های موجود در پوشه database:
```
✅ 00-init-databases.sql     (2 KB)  - ایجاد دیتابیس‌ها و کاربران
✅ crm_system.sql           (212 KB) - جداول اصلی CRM
✅ saas_master.sql          (19 KB)  - جداول مدیریت تنانت‌ها
✅ 03-admin-users.sql       (2 KB)   - کاربران ادمین
❌ 01-grant-privileges.sql  (نیازی نیست - در 00-init انجام می‌شود)
```

## 🔍 بررسی docker-compose.yml

### ✅ تنظیمات MySQL صحیح است:

```yaml
volumes:
  - mysql_data:/var/lib/mysql
  # Init scripts will run in alphabetical order
  - ./database/00-init-databases.sql:/docker-entrypoint-initdb.d/00-init-databases.sql:ro
  - ./database/crm_system.sql:/docker-entrypoint-initdb.d/01-crm_system.sql:ro
  - ./database/saas_master.sql:/docker-entrypoint-initdb.d/02-saas_master.sql:ro
  - ./database/03-admin-users.sql:/docker-entrypoint-initdb.d/03-admin-users.sql:ro
```

### 📋 ترتیب اجرای فایل‌ها:
1. **00-init-databases.sql** - ایجاد دیتابیس‌ها و کاربران
2. **01-crm_system.sql** - ایمپورت جداول CRM (212 KB)
3. **02-saas_master.sql** - ایمپورت جداول SaaS (19 KB)
4. **03-admin-users.sql** - ایجاد کاربران ادمین

## ✅ بررسی فایل crm_system.sql

### ساختار فایل:
```sql
-- Database: `crm_system`
USE `crm_system`;  ✅ دستور USE موجود است

-- جداول اصلی:
✅ activities
✅ customers
✅ users
✅ deals
✅ contacts
✅ products
✅ tasks
... و بقیه جداول
```

### نکات مهم:
- ✅ دستور `USE crm_system` در فایل موجود است
- ✅ تمام جداول با `CREATE TABLE` تعریف شده‌اند
- ✅ Character set: utf8mb4
- ✅ Collation: utf8mb4_unicode_ci

## 🔧 بررسی deploy-server.sh

### مرحله 3: آماده‌سازی فایل‌های دیتابیس

```bash
# ✅ بررسی وجود فایل‌ها
if [ -f "database/crm_system.sql" ]; then
    echo "✅ فایل database/crm_system.sql موجود است"
    
    # ✅ اطمینان از وجود USE statement
    if ! grep -q "USE \`crm_system\`" database/crm_system.sql; then
        sed -i '/-- Database: `crm_system`/a\\n-- استفاده از دیتابیس crm_system\nUSE `crm_system`;'
    fi
fi
```

### ✅ اسکریپت چک می‌کند:
1. وجود فایل crm_system.sql
2. وجود فایل saas_master.sql
3. وجود دستور USE در فایل‌ها
4. اگر USE نباشد، اضافه می‌کند

## 🚀 نحوه کار ایمپورت خودکار

### زمان اولین راه‌اندازی:
1. Docker container MySQL ایجاد می‌شود
2. MariaDB به طور خودکار فایل‌های `/docker-entrypoint-initdb.d/` را اجرا می‌کند
3. فایل‌ها به ترتیب الفبایی اجرا می‌شوند (00, 01, 02, 03)
4. دیتابیس‌ها و جداول ایجاد می‌شوند

### ⚠️ نکته مهم:
**فایل‌های init فقط در اولین راه‌اندازی اجرا می‌شوند!**

اگر volume `mysql_data` از قبل وجود داشته باشد، فایل‌های init اجرا نمی‌شوند.

### برای ایمپورت مجدد:
```bash
# حذف volume و rebuild کامل
./deploy-server.sh --clean

# یا دستی:
docker-compose down -v
docker volume rm mysql_data
docker-compose up -d
```

## 🧪 تست ایمپورت

### پس از deploy، بررسی کنید:

```bash
# 1. بررسی وضعیت MySQL
docker exec crm-mysql mysqladmin -u root -p1234 ping

# 2. بررسی دیتابیس‌ها
docker exec crm-mysql mysql -u root -p1234 -e "SHOW DATABASES;"

# 3. بررسی جداول crm_system
docker exec crm-mysql mysql -u root -p1234 -e "USE crm_system; SHOW TABLES;"

# 4. شمارش جداول
docker exec crm-mysql mysql -u root -p1234 -e "
  SELECT COUNT(*) as table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'crm_system';
"

# 5. بررسی کاربران
docker exec crm-mysql mysql -u root -p1234 -e "
  SELECT user, host FROM mysql.user WHERE user = 'crm_user';
"

# 6. تست اتصال با crm_user
docker exec crm-mysql mysql -u crm_user -p1234 -e "
  USE crm_system; 
  SELECT COUNT(*) FROM users;
"
```

## 🔍 عیب‌یابی

### مشکل: جداول ایمپورت نشده‌اند

**علت احتمالی:**
- Volume قبلی وجود دارد و init scripts اجرا نشده‌اند

**راه‌حل:**
```bash
# حذف volume و rebuild
docker-compose down
docker volume rm mysql_data
docker-compose up -d
```

### مشکل: خطای "database not found"

**علت احتمالی:**
- فایل 00-init-databases.sql اجرا نشده

**راه‌حل:**
```bash
# اجرای دستی
docker exec -i crm-mysql mysql -u root -p1234 < database/00-init-databases.sql
```

### مشکل: خطای "table already exists"

**علت احتمالی:**
- جداول از قبل وجود دارند

**راه‌حل:**
```bash
# حذف و ایجاد مجدد دیتابیس
docker exec crm-mysql mysql -u root -p1234 -e "
  DROP DATABASE IF EXISTS crm_system;
  CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# ایمپورت مجدد
docker exec -i crm-mysql mysql -u root -p1234 crm_system < database/crm_system.sql
```

## 📝 لاگ‌های مفید

### مشاهده لاگ‌های MySQL در حین راه‌اندازی:
```bash
docker logs -f crm-mysql
```

### جستجو برای خطاهای ایمپورت:
```bash
docker logs crm-mysql 2>&1 | grep -i error
docker logs crm-mysql 2>&1 | grep -i "ready for connections"
```

## ✅ نتیجه‌گیری

### وضعیت کلی: **✅ آماده برای ایمپورت خودکار**

1. ✅ فایل‌های SQL موجود و صحیح هستند
2. ✅ docker-compose.yml به درستی تنظیم شده
3. ✅ deploy-server.sh فایل‌ها را چک می‌کند
4. ✅ ترتیب اجرا صحیح است (00, 01, 02, 03)
5. ✅ دستورات USE در فایل‌ها موجود است

### توصیه‌ها:

1. **اولین deploy:**
   ```bash
   ./deploy-server.sh --clean
   ```

2. **بررسی پس از deploy:**
   ```bash
   # تعداد جداول باید بیشتر از 30 باشد
   docker exec crm-mysql mysql -u root -p1234 -e "
     SELECT COUNT(*) FROM information_schema.tables 
     WHERE table_schema = 'crm_system';
   "
   ```

3. **Backup قبل از هر تغییر:**
   ```bash
   docker exec crm-mysql mysqldump -u root -p1234 --all-databases > backup-$(date +%Y%m%d).sql
   ```

---

**آخرین بررسی:** $(date)
**وضعیت:** ✅ Ready for Production
