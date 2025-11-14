# 📋 خلاصه تغییرات برای پشتیبانی از .env در Next.js

## ✅ تغییرات انجام شده

### 1. فایل کانفیگ مرکزی
- ✅ ایجاد `next/lib/config.ts` - مدیریت مرکزی تمام URL ها و تنظیمات

### 2. فایل‌های API به‌روزرسانی شده (استفاده از DATABASE_URL)
- ✅ `next/pages/api/grades.ts`
- ✅ `next/pages/api/subjects.ts`
- ✅ `next/pages/api/majors.ts`
- ✅ `next/pages/api/roles.ts`
- ✅ `next/pages/api/students-by-class.ts`
- ✅ `next/pages/api/user.view.ts`
- ✅ `next/pages/api/attendance.ts`
- ✅ `next/pages/api/classes.ts`
- ✅ `next/pages/api/class-subjects.ts`
- ✅ `next/pages/api/compare-attendance-with-class-time.ts`
- ✅ `next/pages/api/add-subject-column.ts`
- ✅ `next/pages/api/users/[id].ts`

### 3. فایل‌های Frontend به‌روزرسانی شده
- ✅ `next/pages/register2.tsx` - استفاده از `NEXT_PUBLIC_PYTHON_API_URL`
- ✅ `next/next.config.js` - rewrites با متغیرهای محیطی

## ⚠️ فایل‌هایی که نیاز به به‌روزرسانی دارند

### فایل‌های API که از NestJS استفاده می‌کنند:
- ❌ `next/pages/api/login.ts` - استفاده از `NESTJS_API_URL` ✅ (قبلاً درست بود)
- ❌ `next/pages/api/add-user.ts` - استفاده از `NESTJS_API_URL` ✅ (قبلاً درست بود)
- ❌ `next/pages/api/validate-token.ts` - استفاده از `NESTJS_API_URL` ✅ (قبلاً درست بود)
- ❌ `next/pages/api/users.ts` - URL هاردکد شده
- ❌ `next/pages/api/profile.ts` - URL هاردکد شده
- ❌ `next/pages/api/new-person.ts` - URL هاردکد شده
- ❌ `next/pages/api/view-person.ts` - URL هاردکد شده
- ❌ `next/pages/api/last_seen.ts` - URL هاردکد شده
- ❌ `next/pages/api/auth/me.ts` - URL هاردکد شده

### فایل‌های Frontend که از API استفاده می‌کنند:
- ❌ `next/pages/login.tsx` - URL هاردکد شده
- ❌ `next/pages/profile.tsx` - URL هاردکد شده
- ❌ `next/pages/register.tsx` - URL هاردکد شده
- ❌ `next/pages/roles.tsx` - URL هاردکد شده
- ❌ `next/pages/viewplace.tsx` - URL هاردکد شده
- ❌ `next/pages/newplace.tsx` - URL هاردکد شده
- ❌ `next/pages/createreshte.tsx` - URL هاردکد شده
- ❌ `next/pages/createclass.tsx` - URL هاردکد شده
- ❌ `next/pages/createdars.tsx` - URL هاردکد شده
- ❌ `next/pages/onlinecam/class1.tsx` - URL هاردکد شده
- ❌ `next/pages/users/userpic.tsx` - URL هاردکد شده

## 🔧 نحوه استفاده از کانفیگ مرکزی

### در API Routes (Server-side):
```typescript
import { DATABASE_URL, SERVER_NESTJS_URL, SERVER_PYTHON_URL } from '@/lib/config';

// برای دیتابیس
const dbConfig = {
  connectionString: DATABASE_URL
};

// برای NestJS API
const response = await axios.get(`${SERVER_NESTJS_URL}/endpoint`);

// برای Python API
const response = await fetch(`${SERVER_PYTHON_URL}/endpoint`);
```

### در صفحات Frontend (Client-side):
```typescript
import { CLIENT_API_URL, CLIENT_PYTHON_API_URL } from '@/lib/config';

// برای NestJS API
const response = await fetch(`${CLIENT_API_URL}/endpoint`);

// برای Python API
const response = await fetch(`${CLIENT_PYTHON_API_URL}/endpoint`);
```

### استفاده مستقیم از متغیرهای محیطی:
```typescript
// در Client-side
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL;

// در Server-side (API routes)
const nestjsUrl = process.env.NESTJS_API_URL;
const pythonUrl = process.env.PYTHON_API_URL;
const dbUrl = process.env.DATABASE_URL;
```

## 📝 متغیرهای محیطی مورد نیاز

### حالت لوکال (MODE=0):
```env
# Client-side
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:5000

# Server-side
NESTJS_API_URL=http://localhost:3001
PYTHON_API_URL=http://localhost:5000
DATABASE_URL=mysql://crm_user:1234@localhost:3306/school

NODE_ENV=development
```

### حالت سرور (MODE=1):
```env
# Client-side
NEXT_PUBLIC_API_URL=https://sch.ahmadreza-avandi.ir/api
NEXT_PUBLIC_PYTHON_API_URL=https://sch.ahmadreza-avandi.ir/python-api

# Server-side
NESTJS_API_URL=http://nestjs:3001
PYTHON_API_URL=http://pythonserver:5000
DATABASE_URL=mysql://user:userpassword@mysql:3306/mydatabase

NODE_ENV=production
```

## 🎯 مراحل بعدی

1. ✅ به‌روزرسانی فایل‌های API باقی‌مانده
2. ✅ به‌روزرسانی فایل‌های Frontend
3. ✅ تست در حالت لوکال
4. ✅ تست در حالت سرور (Docker)
5. ✅ حذف URL های هاردکد شده

## 🔍 بررسی نهایی

برای اطمینان از اینکه همه URL ها به‌روزرسانی شده‌اند:

```bash
# جستجوی URL های هاردکد شده
grep -r "http://localhost" next/pages/
grep -r "https://sch.ahmadreza-avandi.ir" next/pages/
grep -r "mysql://" next/pages/api/
```

## ✨ مزایای این تغییرات

1. **مدیریت مرکزی**: تمام تنظیمات در یک جا
2. **انعطاف‌پذیری**: تغییر آسان بین لوکال و سرور
3. **امنیت**: عدم هاردکد کردن اطلاعات حساس
4. **قابلیت نگهداری**: کد تمیزتر و قابل فهم‌تر
5. **مقیاس‌پذیری**: آماده برای محیط‌های مختلف (dev, staging, production)
