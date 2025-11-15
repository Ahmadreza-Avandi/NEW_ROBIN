# 🔀 راهنمای مسیریابی API

این سند توضیح می‌دهد که چگونه درخواست‌های API در حالت‌های مختلف (لوکال و سرور) مسیریابی می‌شوند.

---

## 📍 ساختار Route ها

### NestJS Routes (Backend):
```
/auth/login          → لاگین
/auth/validate-token → اعتبارسنجی توکن
/users               → مدیریت کاربران
/users/role          → مدیریت نقش‌ها
/locations           → مدیریت مکان‌ها
/last_seen           → آخرین بازدید
```

### Python Routes (Face Detection):
```
/upload              → آپلود تصویر
/status              → وضعیت دوربین
/video_feed          → استریم ویدیو
/get_all_images      → دریافت تصاویر
```

---

## 🏠 حالت لوکال (Development)

### تنظیمات `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:5000
NESTJS_API_URL=http://localhost:3001
PYTHON_API_URL=http://localhost:5000
NODE_ENV=development
```

### نحوه کار:
در حالت لوکال، **مستقیماً** به سرویس‌ها متصل می‌شوید:

```typescript
// در کد Frontend (Browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // http://localhost:3001
await axios.post(`${apiUrl}/auth/login`, data);
// درخواست به: http://localhost:3001/auth/login

const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL; // http://localhost:5000
await fetch(`${pythonUrl}/upload`, {...});
// درخواست به: http://localhost:5000/upload
```

### مسیر درخواست‌ها:
```
Browser → http://localhost:3001/auth/login → NestJS (port 3001)
Browser → http://localhost:5000/upload → Python (port 5000)
```

---

## 🌐 حالت سرور (Production با Docker)

### تنظیمات `.env` (سرور):
```env
NEXT_PUBLIC_API_URL=https://sch.ahmadreza-avandi.ir/api
NEXT_PUBLIC_PYTHON_API_URL=https://sch.ahmadreza-avandi.ir/python-api
NESTJS_API_URL=http://nestjs:3001
PYTHON_API_URL=http://pythonserver:5000
NODE_ENV=production
```

### نحوه کار:
در حالت سرور، از **Next.js Rewrites** استفاده می‌شود:

```typescript
// در کد Frontend (Browser)
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // https://sch.ahmadreza-avandi.ir/api
await axios.post(`${apiUrl}/auth/login`, data);
// درخواست به: https://sch.ahmadreza-avandi.ir/api/auth/login

const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL; // https://sch.ahmadreza-avandi.ir/python-api
await fetch(`${pythonUrl}/upload`, {...});
// درخواست به: https://sch.ahmadreza-avandi.ir/python-api/upload
```

### مسیر درخواست‌ها:
```
Browser → https://sch.ahmadreza-avandi.ir/api/auth/login
        ↓ (Nginx)
        → Next.js (port 3000)
        ↓ (Rewrite: /api/* → http://nestjs:3001/*)
        → NestJS (port 3001) → /auth/login

Browser → https://sch.ahmadreza-avandi.ir/python-api/upload
        ↓ (Nginx)
        → Next.js (port 3000)
        ↓ (Rewrite: /python-api/* → http://pythonserver:5000/*)
        → Python (port 5000) → /upload
```

---

## ⚙️ تنظیمات Next.js Rewrites

در `next.config.js`:

```javascript
async rewrites() {
  const nestjsUrl = process.env.NESTJS_API_URL || 'http://localhost:3001';
  const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
  
  return [
    {
      source: '/api/:path*',
      destination: `${nestjsUrl}/:path*`,
    },
    {
      source: '/python-api/:path*',
      destination: `${pythonUrl}/:path*`,
    }
  ];
}
```

**توضیح:**
- `/api/auth/login` → `http://nestjs:3001/auth/login`
- `/python-api/upload` → `http://pythonserver:5000/upload`

---

## 📝 نحوه استفاده در کد

### ✅ درست:

```typescript
// Frontend (pages/*.tsx)
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
await axios.post(`${apiUrl}/auth/login`, data);

const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';
await fetch(`${pythonUrl}/upload`, {...});
```

```typescript
// API Routes (pages/api/*.ts)
const nestjsUrl = process.env.NESTJS_API_URL || 'http://localhost:3001';
await axios.get(`${nestjsUrl}/users`);

const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
await fetch(`${pythonUrl}/status`);
```

### ❌ اشتباه:

```typescript
// ❌ هاردکد کردن URL
await axios.post('http://localhost:3001/auth/login', data);

// ❌ اضافه کردن /api به URL در لوکال
const apiUrl = 'http://localhost:3001/api'; // اشتباه!
await axios.post(`${apiUrl}/auth/login`, data); // می‌شه: /api/auth/login که اشتباهه
```

---

## 🔍 عیب‌یابی

### مشکل: 404 Not Found

**علت:** مسیر اشتباه است.

**راه‌حل:**
1. بررسی کنید که `NEXT_PUBLIC_API_URL` در `.env.local` درست تنظیم شده:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001  ✅
   NEXT_PUBLIC_API_URL=http://localhost:3001/api  ❌
   ```

2. مطمئن شوید که route در NestJS وجود دارد:
   ```bash
   # بررسی لاگ‌های NestJS
   [RouterExplorer] Mapped {/auth/login, POST} route
   ```

3. درخواست را با مسیر کامل بررسی کنید:
   ```typescript
   console.log('API URL:', apiUrl);
   console.log('Full URL:', `${apiUrl}/auth/login`);
   ```

### مشکل: CORS Error

**علت:** درخواست از دامنه دیگری ارسال می‌شود.

**راه‌حل:**
- در لوکال: NestJS باید CORS را فعال کند
- در سرور: از rewrites استفاده کنید (مشکل CORS نداریم)

---

## 📊 جدول خلاصه

| محیط | Frontend URL | Backend URL | مسیر درخواست |
|------|-------------|-------------|--------------|
| **لوکال** | `http://localhost:3001` | `http://localhost:3001` | مستقیم |
| **سرور** | `https://domain/api` | `http://nestjs:3001` | از طریق Rewrite |

---

## 🚀 دستورات اجرا

### لوکال:
```bash
# ایجاد .env برای لوکال
bash setup-env.sh 0

# اجرای Next.js
cd next
npm run dev

# اجرای NestJS (ترمینال جدید)
cd nest
npm run start:dev

# اجرای Python (ترمینال جدید)
cd trainer
python app.py
```

### سرور:
```bash
# ایجاد .env برای سرور
bash setup-env.sh 1

# اجرای با Docker
docker-compose up --build
```

---

## ✅ چک‌لیست تست

- [ ] لاگین در لوکال کار می‌کند
- [ ] لاگین در سرور کار می‌کند
- [ ] آپلود تصویر در لوکال کار می‌کند
- [ ] آپلود تصویر در سرور کار می‌کند
- [ ] API routes در Next.js کار می‌کنند
- [ ] دیتابیس در هر دو حالت متصل است

---

## 📞 نکات مهم

1. **همیشه** از متغیرهای محیطی استفاده کنید
2. **هرگز** URL ها را هاردکد نکنید
3. در لوکال، مستقیماً به سرویس‌ها متصل شوید
4. در سرور، از rewrites استفاده کنید
5. بعد از تغییر `.env`، سرور را restart کنید
