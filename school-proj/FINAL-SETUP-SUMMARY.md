# ✅ خلاصه نهایی تنظیمات پروژه

## 🎯 تغییرات انجام شده

### 1. ساخت فایل کانفیگ مرکزی
✅ `next/lib/config.ts` - مدیریت مرکزی URL ها

### 2. به‌روزرسانی اسکریپت setup-env.sh
✅ پشتیبانی از دو حالت:
- `bash setup-env.sh 0` → لوکال
- `bash setup-env.sh 1` → سرور

### 3. به‌روزرسانی تمام فایل‌های API
✅ همه فایل‌های `next/pages/api/*.ts` از متغیرهای محیطی استفاده می‌کنند

### 4. به‌روزرسانی تمام فایل‌های Frontend
✅ همه فایل‌های `next/pages/*.tsx` از متغیرهای محیطی استفاده می‌کنند

### 5. تنظیم Next.js Rewrites
✅ `next.config.js` برای مسیریابی درست تنظیم شده

---

## 🔧 نحوه استفاده

### حالت لوکال:

```bash
# 1. ایجاد فایل‌های .env
bash setup-env.sh 0

# 2. اجرای MySQL (اگر نصب نیست)
# مطمئن شوید MySQL روی localhost:3306 در حال اجراست
# دیتابیس: school
# کاربر: crm_user
# رمز: 1234

# 3. اجرای NestJS
cd nest
npm install
npm run start:dev

# 4. اجرای Next.js (ترمینال جدید)
cd next
npm install
npm run dev

# 5. اجرای Python (ترمینال جدید)
cd trainer
pip install -r requirements.txt
python app.py

# 6. باز کردن مرورگر
# http://localhost:3000
```

### حالت سرور:

```bash
# 1. ایجاد فایل‌های .env
bash setup-env.sh 1

# 2. اجرای با Docker
docker-compose up --build

# 3. باز کردن مرورگر
# https://sch.ahmadreza-avandi.ir
```

---

## 📁 ساختار فایل‌های .env

### لوکال (`MODE=0`):
```
.env
nest/.env
next/.env.local
```

### سرور (`MODE=1`):
```
.env
nest/.env
next/.env.local
next/.env.production
```

---

## 🔑 متغیرهای محیطی

### لوکال:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:5000
NESTJS_API_URL=http://localhost:3001
PYTHON_API_URL=http://localhost:5000
DATABASE_URL=mysql://crm_user:1234@localhost:3306/school
NODE_ENV=development
```

### سرور:
```env
NEXT_PUBLIC_API_URL=https://sch.ahmadreza-avandi.ir/api
NEXT_PUBLIC_PYTHON_API_URL=https://sch.ahmadreza-avandi.ir/python-api
NESTJS_API_URL=http://nestjs:3001
PYTHON_API_URL=http://pythonserver:5000
DATABASE_URL=mysql://user:userpassword@mysql:3306/mydatabase
NODE_ENV=production
```

---

## 🛠️ مشکل و راه‌حل

### مشکل: POST http://localhost:3001/api/login 404 (Not Found)

**علت:**
- در لوکال، NestJS route لاگین روی `/auth/login` است نه `/api/login`
- `NEXT_PUBLIC_API_URL` نباید `/api` داشته باشد

**راه‌حل:**
✅ تغییر داده شد:
```typescript
// قبل (اشتباه):
NEXT_PUBLIC_API_URL=http://localhost:3001/api
await axios.post(`${apiUrl}/login`, data); // می‌شه: /api/login ❌

// بعد (درست):
NEXT_PUBLIC_API_URL=http://localhost:3001
await axios.post(`${apiUrl}/auth/login`, data); // می‌شه: /auth/login ✅
```

---

## 📋 چک‌لیست نهایی

### قبل از اجرا:
- [ ] MySQL نصب و اجرا شده (لوکال)
- [ ] دیتابیس `school` ساخته شده (لوکال)
- [ ] کاربر `crm_user` با رمز `1234` ساخته شده (لوکال)
- [ ] Node.js و npm نصب شده
- [ ] Python نصب شده

### بعد از اجرا:
- [ ] NestJS روی پورت 3001 اجرا شده
- [ ] Next.js روی پورت 3000 اجرا شده
- [ ] Python روی پورت 5000 اجرا شده
- [ ] صفحه لاگین باز می‌شود
- [ ] لاگین کار می‌کند
- [ ] دیتابیس متصل است

---

## 🎯 Routes اصلی

### NestJS (Backend):
```
POST   /auth/login                    → لاگین
GET    /auth/validate-token           → اعتبارسنجی
GET    /users                         → لیست کاربران
POST   /users/add-user                → افزودن کاربر
GET    /users/by-national-code/:code  → جستجو با کد ملی
POST   /users/role                    → ایجاد نقش
GET    /locations                     → لیست مکان‌ها
GET    /last_seen                     → آخرین بازدید
```

### Python (Face Detection):
```
POST   /upload           → آپلود تصویر
GET    /status           → وضعیت دوربین
GET    /video_feed       → استریم ویدیو
GET    /get_all_images   → دریافت تصاویر
```

---

## 📚 مستندات

برای اطلاعات بیشتر:
- `API-ROUTING-GUIDE.md` - راهنمای کامل مسیریابی
- `ENV-SETUP-GUIDE.md` - راهنمای تنظیم .env
- `ENV-EXAMPLES.md` - نمونه فایل‌های .env
- `NEXT-ENV-MIGRATION-SUMMARY.md` - خلاصه تغییرات

---

## 🚀 دستورات سریع

```bash
# لوکال
bash setup-env.sh 0
cd nest && npm run start:dev &
cd next && npm run dev &
cd trainer && python app.py &

# سرور
bash setup-env.sh 1
docker-compose up --build

# تست
curl http://localhost:3001/auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"nationalCode":"1234567890","password":"test"}'
```

---

## ✨ نکات مهم

1. **همیشه** بعد از تغییر `.env` سرورها را restart کنید
2. **هرگز** فایل‌های `.env` را commit نکنید
3. در لوکال، مستقیماً به سرویس‌ها متصل می‌شوید
4. در سرور، از rewrites استفاده می‌شود
5. برای تست، از Postman یا curl استفاده کنید

---

## 🎉 تمام!

پروژه شما آماده است! هم روی لوکال و هم روی سرور با Docker کار می‌کند.
