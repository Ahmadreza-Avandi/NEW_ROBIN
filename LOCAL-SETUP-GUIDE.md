# 🚀 راهنمای راه‌اندازی محیط لوکال

این راهنما برای راه‌اندازی پروژه در محیط لوکال (development) طراحی شده است.

## 📋 پیش‌نیازها

1. **Node.js** (نسخه 18 یا بالاتر)
2. **MySQL Server** (نسخه 8.0 یا بالاتر)
3. **npm** یا **yarn**

## 🔧 مراحل راه‌اندازی

### 1. نصب وابستگی‌ها
```bash
npm install
```

### 2. تنظیم دیتابیس
مطمئن شوید MySQL در حال اجرا است و دیتابیس `crm_system` ایجاد شده باشد:

```sql
CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. تنظیم متغیرهای محیط
فایل `.env.local` به طور خودکار ایجاد شده است. در صورت نیاز می‌توانید آن را ویرایش کنید:

```bash
# بررسی فایل .env.local
cat .env.local
```

### 4. تست اتصال دیتابیس
```bash
node test-local-connection.js
```

### 5. اجرای پروژه
```bash
npm run dev
```

پروژه در آدرس `http://localhost:3000` در دسترس خواهد بود.

## 🔄 تفاوت محیط لوکال و سرور

### محیط لوکال (Development)
- استفاده از فایل `.env.local`
- اتصال به `localhost` برای دیتابیس
- `DOCKER_ENV=false`
- `NODE_ENV=development`

### محیط سرور (Production)
- استفاده از فایل `.env`
- اتصال به `mysql` (Docker service)
- `DOCKER_ENV=true`
- `NODE_ENV=production`

## 🎯 تشخیص خودکار محیط

پروژه به طور خودکار محیط اجرا را تشخیص می‌دهد:

```typescript
// در lib/tenant-database.ts
const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NODE_ENV === 'production';
const defaultHost = isDocker ? 'mysql' : 'localhost';
```

## 🐛 عیب‌یابی

### خطای `ENOTFOUND mysql`
این خطا زمانی رخ می‌دهد که پروژه سعی می‌کند به hostname `mysql` متصل شود در حالی که در محیط لوکال اجرا می‌شود.

**راه‌حل:**
1. مطمئن شوید فایل `.env.local` وجود دارد
2. بررسی کنید `DATABASE_HOST=localhost` در `.env.local` تنظیم شده باشد
3. اسکریپت تست را اجرا کنید: `node test-local-connection.js`

### خطای اتصال دیتابیس
1. مطمئن شوید MySQL در حال اجرا است
2. نام کاربری و رمز عبور را بررسی کنید
3. دیتابیس `crm_system` ایجاد شده باشد
4. دسترسی‌های کاربر تنظیم شده باشد

## 📁 ساختار فایل‌های محیط

```
.env          # تنظیمات سرور (production)
.env.local    # تنظیمات لوکال (development) - در git ignore
.env.example  # نمونه تنظیمات
```

## 🔐 امنیت

- فایل `.env.local` در `.gitignore` قرار دارد
- رمزهای عبور واقعی در repository ذخیره نمی‌شوند
- هر محیط تنظیمات جداگانه دارد

## 📞 پشتیبانی

در صورت بروز مشکل:
1. ابتدا اسکریپت تست را اجرا کنید
2. لاگ‌های خطا را بررسی کنید
3. تنظیمات دیتابیس را مجدداً بررسی کنید