# تغییرات: حذف NestJS از پروژه

## خلاصه تغییرات

NestJS به طور کامل از پروژه حذف شد و تمام API ها به Next.js API Routes منتقل شدند که مستقیماً با MySQL کار می‌کنند.

## معماری جدید

```
┌─────────────┐
│   Next.js   │ ← فرانت‌اند + API Routes (بک‌اند)
└──────┬──────┘
       │
       ├─────→ MySQL (دیتابیس اصلی)
       ├─────→ Redis (کش)
       └─────→ Python/Flask (تشخیص چهره)
```

## فایل‌های تغییر یافته

### 1. API Routes (بازنویسی شده)
- `next/pages/api/add-user.ts` - ثبت کاربر جدید
- `next/pages/api/last_seen.ts` - آخرین بازدیدها
- `next/pages/api/view-person.ts` - لیست اشخاص
- `next/pages/api/auth/me.ts` - احراز هویت
- `next/pages/api/new-person.ts` - ثبت چهره جدید (با Python API)

### 2. کانفیگ‌ها
- `docker-compose.yml` - حذف سرویس nestjs
- `nginx-config.conf` - حذف upstream و location برای nestjs
- `next/next.config.js` - حذف rewrite برای /api
- `next/lib/config.ts` - حذف متغیرهای NestJS
- `setup-env.sh` - حذف env های NestJS

### 3. اسکریپت‌های دیپلوی
- `deploy-complete.sh`
- `status.sh`
- `quick-deploy.sh`

### 4. Dependencies
افزوده شده به `next/package.json`:
- `bcryptjs` - برای هش کردن پسورد
- `jsonwebtoken` - برای JWT authentication
- `form-data` - برای ارسال فایل به Python API

## نحوه استفاده

### لوکال
```bash
# نصب dependencies
cd next && npm install

# ایجاد .env ها
bash setup-env.sh 0

# اجرای MySQL و Redis
docker-compose up -d mysql redis

# اجرای Next.js
cd next && npm run dev
```

### سرور (Docker)
```bash
# ایجاد .env ها
bash setup-env.sh 1

# دیپلوی کامل
bash deploy-complete.sh
```

## پورت‌ها

- Next.js: `3003` (قبلاً 3003)
- Python: `5001` (قبلاً 5001)
- MySQL: `3307` (قبلاً 3307)
- Redis: `6380` (قبلاً 6380)
- ~~NestJS: 3002~~ (حذف شد)

## توجه

- تمام API های قبلی که از NestJS استفاده می‌کردند، حالا مستقیماً در Next.js پیاده‌سازی شده‌اند
- احراز هویت با JWT مستقیماً در Next.js انجام می‌شود
- دیتابیس از `school.sql` استفاده می‌کند (قبلاً `mydatabase (3).sql`)
