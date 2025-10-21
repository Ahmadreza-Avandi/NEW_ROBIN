# 🔧 راهنمای تنظیم Environment Variables

این راهنما نحوه استفاده از فایل `.env` واحد برای هر دو محیط لوکال و داکر را توضیح می‌دهد.

## 📋 فهرست مطالب
- [نصب اولیه](#نصب-اولیه)
- [اجرای لوکال](#اجرای-لوکال)
- [اجرای داکر](#اجرای-داکر)
- [تنظیمات دیتابیس](#تنظیمات-دیتابیس)

---

## 🚀 نصب اولیه

### 1. کپی کردن فایل Environment

```bash
cp .env.example .env
```

### 2. ویرایش فایل .env

فایل `.env` را باز کنید و مقادیر زیر را تنظیم کنید:

```env
# Database Password (حتماً تغییر دهید!)
DATABASE_PASSWORD=your_secure_password_here

# JWT Secret (حتماً تغییر دهید!)
JWT_SECRET=your_jwt_secret_key_here

# Email Configuration (اختیاری)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rabin Voice API Key (اختیاری)
RABIN_VOICE_OPENROUTER_API_KEY=your_api_key
```

---

## 💻 اجرای لوکال

### پیش‌نیازها
- Node.js 18+
- MySQL/MariaDB نصب شده روی سیستم
- npm یا yarn

### مراحل اجرا

#### 1. نصب Dependencies

```bash
npm install
```

#### 2. ایجاد دیتابیس‌ها

```bash
# ورود به MySQL
mysql -u root -p

# ایجاد دو دیتابیس
CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# ایجاد کاربر و دادن دسترسی به هر دو دیتابیس
CREATE USER 'crm_app_user'@'localhost' IDENTIFIED BY 'Ahmad.1386';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_app_user'@'localhost';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_app_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Import کردن دیتابیس‌ها

```bash
# Import CRM System (دیتابیس اصلی)
mysql -u crm_app_user -p crm_system < database/crm_system.sql

# Import SaaS Master (دیتابیس مدیریت تنانت‌ها)
mysql -u crm_app_user -p saas_master < database/saas_master.sql
```

#### 4. تنظیم .env برای لوکال

مطمئن شوید که در فایل `.env` مقادیر زیر تنظیم شده:

```env
DATABASE_HOST=localhost
DB_HOST=localhost
NODE_ENV=development
```

#### 5. اجرای پروژه

```bash
# Development mode
npm run dev

# Production mode
npm run build
npm start
```

پروژه روی `http://localhost:3000` اجرا می‌شود.

---

## 🐳 اجرای داکر

### پیش‌نیازها
- Docker
- Docker Compose

### مراحل اجرا

#### 1. تنظیم .env برای داکر

فایل `.env` به صورت خودکار توسط Docker Compose خوانده می‌شود.
**نیازی به تغییر `DATABASE_HOST` نیست** - داکر به صورت خودکار از service name استفاده می‌کند.

#### 2. Build و اجرای کانتینرها

```bash
# Build و اجرا
docker-compose up -d

# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده وضعیت
docker-compose ps
```

#### 3. دسترسی به سرویس‌ها

- **CRM Application**: `http://localhost` یا `http://localhost:80`
- **Rabin Voice**: داخلی - از طریق nginx
- **phpMyAdmin**: `http://localhost/secure-db-admin-panel-x7k9m2/`

#### 4. دستورات مفید داکر

```bash
# توقف سرویس‌ها
docker-compose down

# توقف و حذف volumes
docker-compose down -v

# Restart کردن یک سرویس خاص
docker-compose restart nextjs

# مشاهده لاگ یک سرویس خاص
docker-compose logs -f nextjs

# ورود به کانتینر
docker exec -it crm-nextjs sh
```

---

## 🗄️ تنظیمات دیتابیس

### ساختار دیتابیس

پروژه از **دو دیتابیس** استفاده می‌کند:

#### 1. crm_system (دیتابیس اصلی CRM)
```
crm_system
├── activities
├── customers
├── deals
├── users
├── documents
├── tasks
└── ... (سایر جداول CRM)
```

#### 2. saas_master (دیتابیس مدیریت تنانت‌ها)
```
saas_master
├── tenants
├── subscription_plans
├── subscription_history
├── super_admins
├── tenant_activity_logs
└── ... (سایر جداول SaaS)
```

### Environment Variables دیتابیس

پروژه از دو سری متغیر پشتیبانی می‌کند:

#### 1. متغیرهای جدید (توصیه می‌شود)
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

#### 2. متغیرهای قدیمی (Legacy Support)
```env
DB_HOST=localhost
DB_USER=crm_app_user
DB_PASSWORD=Ahmad.1386
DB_NAME=crm_system
```

**نکته**: هر دو سری متغیر کار می‌کنند. کد به صورت خودکار از هر کدام که موجود باشد استفاده می‌کند.

#### نحوه استفاده در کد

- **CRM Database**: از `lib/database.ts` استفاده می‌کند → `crm_system`
- **SaaS Database**: از `lib/master-database.ts` استفاده می‌کند → `saas_master`

### تغییر خودکار HOST در داکر

کد به صورت هوشمند `DATABASE_HOST` را تشخیص می‌دهد:

```typescript
// در لوکال
host: process.env.DATABASE_HOST || 'localhost'

// در داکر (production)
host: process.env.NODE_ENV === 'production' ? 'mysql' : 'localhost'
```

---

## 🔍 عیب‌یابی

### مشکل: نمی‌تواند به دیتابیس متصل شود (لوکال)

```bash
# بررسی وضعیت MySQL
sudo systemctl status mysql

# راه‌اندازی MySQL
sudo systemctl start mysql

# بررسی کاربر و دسترسی‌ها
mysql -u crm_app_user -p
```

### مشکل: نمی‌تواند به دیتابیس متصل شود (داکر)

```bash
# بررسی وضعیت کانتینر MySQL
docker-compose ps mysql

# مشاهده لاگ MySQL
docker-compose logs mysql

# Restart کردن MySQL
docker-compose restart mysql
```

### مشکل: خطای Permission Denied

```bash
# در لوکال
sudo chown -R $USER:$USER uploads/
sudo chmod -R 755 uploads/

# در داکر
docker exec -it crm-nextjs sh
chown -R node:node /app/uploads
```

---

## 📝 نکات مهم

1. **امنیت**: حتماً `DATABASE_PASSWORD` و `JWT_SECRET` را در production تغییر دهید
2. **Git**: فایل `.env` در `.gitignore` قرار دارد و commit نمی‌شود
3. **Backup**: قبل از تغییرات مهم، از دیتابیس backup بگیرید
4. **Docker**: در داکر نیازی به تغییر `DATABASE_HOST` نیست
5. **Legacy Code**: کدهای قدیمی که از `DB_*` استفاده می‌کنند همچنان کار می‌کنند

---

## 🆘 پشتیبانی

اگر مشکلی داشتید:
1. لاگ‌ها را بررسی کنید
2. فایل `.env` را با `.env.example` مقایسه کنید
3. مطمئن شوید دیتابیس ایجاد شده و import شده است
4. در صورت نیاز با تیم توسعه تماس بگیرید
