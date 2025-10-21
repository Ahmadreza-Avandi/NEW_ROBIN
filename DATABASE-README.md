# 🗄️ راهنمای دیتابیس‌های پروژه CRM

## ساختار دیتابیس

این پروژه از **دو دیتابیس مجزا** استفاده می‌کند:

### 1️⃣ crm_system
دیتابیس اصلی CRM که شامل اطلاعات عملیاتی است:
- `users` - کاربران سیستم
- `customers` - مشتریان
- `deals` - معاملات
- `activities` - فعالیت‌ها
- `tasks` - وظایف
- `documents` - اسناد
- `calendar_events` - رویدادهای تقویم
- و سایر جداول CRM...

### 2️⃣ saas_master
دیتابیس مدیریت تنانت‌ها و پنل SaaS:
- `tenants` - اطلاعات شرکت‌ها (تنانت‌ها)
- `subscription_plans` - پلن‌های اشتراک
- `subscription_history` - تاریخچه اشتراک‌ها
- `super_admins` - مدیران ارشد سیستم
- `tenant_activity_logs` - لاگ فعالیت‌های تنانت‌ها

---

## 🚀 نصب سریع

### روش 1: استفاده از اسکریپت خودکار (توصیه می‌شود)

#### Linux/Mac:
```bash
chmod +x setup-databases.sh
./setup-databases.sh
```

#### Windows (PowerShell):
```powershell
.\setup-databases.ps1
```

### روش 2: نصب دستی

#### 1. ایجاد دیتابیس‌ها
```bash
mysql -u root -p
```

```sql
-- ایجاد دو دیتابیس
CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر
CREATE USER 'crm_app_user'@'localhost' IDENTIFIED BY 'Ahmad.1386';

-- دادن دسترسی‌ها
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_app_user'@'localhost';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 2. Import کردن دیتابیس‌ها
```bash
# Import CRM
mysql -u crm_app_user -p crm_system < database/crm_system.sql

# Import SaaS
mysql -u crm_app_user -p saas_master < database/saas_master.sql
```

---

## ⚙️ تنظیمات Environment

فایل `.env` باید شامل این متغیرها باشد:

```env
# تنظیمات مشترک
DATABASE_HOST=localhost
DATABASE_USER=crm_app_user
DATABASE_PASSWORD=Ahmad.1386

# دیتابیس CRM
DATABASE_NAME=crm_system

# دیتابیس SaaS
SAAS_DATABASE_NAME=saas_master
```

---

## 🔍 تست تنظیمات

بعد از نصب، تنظیمات را تست کنید:

```bash
node test-env.js
```

این اسکریپت:
- ✅ متغیرهای محیطی را بررسی می‌کند
- ✅ اتصال به هر دو دیتابیس را تست می‌کند
- ✅ جداول مهم را چک می‌کند
- ✅ تعداد رکوردها را نمایش می‌دهد

---

## 🐳 اجرا با Docker

در محیط Docker، تنظیمات به صورت خودکار انجام می‌شود:

```bash
# Build و اجرا
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f mysql

# دسترسی به MySQL در Docker
docker exec -it crm-mysql mysql -u crm_app_user -p
```

**نکته مهم**: در Docker نیازی به تغییر `DATABASE_HOST` نیست. به صورت خودکار از `mysql` (service name) استفاده می‌شود.

---

## 📊 نحوه استفاده در کد

### دیتابیس CRM
```typescript
import { executeQuery } from '@/lib/database';

// کوئری روی crm_system
const customers = await executeQuery('SELECT * FROM customers');
```

### دیتابیس SaaS
```typescript
import { getMasterConnection } from '@/lib/master-database';

// کوئری روی saas_master
const connection = await getMasterConnection();
const [tenants] = await connection.query('SELECT * FROM tenants');
connection.release();
```

---

## 🔧 عیب‌یابی

### خطا: Access denied
```bash
# بررسی دسترسی‌ها
mysql -u root -p
SHOW GRANTS FOR 'crm_app_user'@'localhost';
```

### خطا: Database not found
```bash
# بررسی دیتابیس‌ها
mysql -u root -p
SHOW DATABASES;
```

### خطا: Can't connect to MySQL server
```bash
# بررسی وضعیت MySQL
# Linux:
sudo systemctl status mysql

# Windows:
net start MySQL
```

---

## 📁 فایل‌های مرتبط

- `.env` - تنظیمات محیطی
- `.env.example` - نمونه تنظیمات
- `lib/database.ts` - اتصال به crm_system
- `lib/master-database.ts` - اتصال به saas_master
- `database/crm_system.sql` - ساختار دیتابیس CRM
- `database/saas_master.sql` - ساختار دیتابیس SaaS
- `test-env.js` - اسکریپت تست
- `setup-databases.sh` - اسکریپت نصب (Linux/Mac)
- `setup-databases.ps1` - اسکریپت نصب (Windows)

---

## 📚 مستندات بیشتر

برای اطلاعات کامل‌تر، فایل `ENV-SETUP-GUIDE.md` را مطالعه کنید.

---

## ⚠️ نکات امنیتی

1. **هرگز** فایل `.env` را commit نکنید
2. در production حتماً رمز عبور قوی استفاده کنید
3. دسترسی‌های دیتابیس را محدود کنید
4. از backup منظم استفاده کنید

---

## 🆘 پشتیبانی

اگر مشکلی داشتید:
1. ابتدا `test-env.js` را اجرا کنید
2. لاگ‌های MySQL را بررسی کنید
3. فایل `.env` را با `.env.example` مقایسه کنید
4. مستندات `ENV-SETUP-GUIDE.md` را مطالعه کنید
