# 🔧 اصلاح فیلتر Tenant در CRM

## مشکل اصلی

وقتی کاربر با `tenant_key='rabin'` لاگین می‌کرد، داشبورد داده‌های همه تنانت‌ها (مثل demo، samin و...) را نمایش می‌داد به جای اینکه فقط داده‌های مربوط به rabin را نشان دهد.

## تغییرات انجام شده

### 1. اصلاح API Routes

#### ✅ `app/api/customers/route.ts`
- اضافه شدن فیلتر `tenant_key` در GET
- اضافه شدن `tenant_key` در INSERT

#### ✅ `app/api/tasks/route.ts`
- اضافه شدن فیلتر `tenant_key` در GET
- اضافه شدن `tenant_key` در INSERT

#### ✅ `app/api/activities/route.ts`
- اضافه شدن فیلتر `tenant_key` در GET
- اضافه شدن `tenant_key` در INSERT

### 2. اضافه شدن صدای رابین

#### ✅ `components/layout/dashboard-sidebar.tsx`
- اضافه شدن آیکون `Mic` به imports
- اضافه شدن "صدای رابین" به منوی سایدبار
- مسیر: `/dashboard/voice-assistant`

#### ✅ `app/[tenant_key]/dashboard/voice-assistant/page.tsx`
- صفحه جدید برای دستیار صوتی
- قابلیت ضبط صدا
- نمایش تاریخچه گفتگو
- اتصال به سرویس `/rabin-voice`

### 3. اسکریپت اصلاح دیتابیس

#### ✅ `scripts/fix-tenant-data.js`
اسکریپت Node.js برای:
- بررسی وضعیت `tenant_key` در همه جداول
- اصلاح رکوردهای NULL یا خالی به 'rabin'
- نمایش گزارش کامل

## نحوه استفاده

### 1. اصلاح داده‌های موجود در دیتابیس

```bash
# اجرای اسکریپت اصلاح
node scripts/fix-tenant-data.js
```

این اسکریپت:
- همه رکوردهای با `tenant_key = NULL` را به `'rabin'` تغییر می‌دهد
- گزارش کاملی از وضعیت هر جدول نمایش می‌دهد

### 2. تست عملکرد

1. لاگین کنید به: `http://localhost:3000/rabin/login`
   - Email: `Robintejarat@gmail.com`
   - Password: `admin123`

2. بررسی کنید که:
   - ✅ فقط مشتریان rabin نمایش داده می‌شوند
   - ✅ فقط وظایف rabin نمایش داده می‌شوند
   - ✅ فقط فعالیت‌های rabin نمایش داده می‌شوند

3. تست صدای رابین:
   - به `/rabin/dashboard/voice-assistant` بروید
   - دکمه میکروفون را کلیک کنید
   - با دستیار صوتی صحبت کنید

### 3. بررسی دستی دیتابیس

```sql
-- بررسی مشتریان
SELECT tenant_key, COUNT(*) FROM customers GROUP BY tenant_key;

-- بررسی وظایف
SELECT tenant_key, COUNT(*) FROM tasks GROUP BY tenant_key;

-- بررسی فعالیت‌ها
SELECT tenant_key, COUNT(*) FROM activities GROUP BY tenant_key;
```

## ساختار Tenant در دیتابیس

همه جداول اصلی دارای ستون `tenant_key` هستند:

```sql
tenant_key VARCHAR(50) DEFAULT 'rabin'
```

### جداول با tenant_key:
- ✅ activities
- ✅ calendar_events
- ✅ chat_conversations
- ✅ chat_messages
- ✅ chat_participants
- ✅ contacts
- ✅ customers
- ✅ daily_reports
- ✅ deals
- ✅ deal_products
- ✅ documents
- ✅ feedback
- ✅ interactions
- ✅ notifications
- ✅ products
- ✅ sales
- ✅ sale_items
- ✅ tasks
- ✅ task_assignees
- ✅ tickets
- ✅ users

## نکات مهم

### 1. برای محیط Local
```env
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=
NODE_ENV=development
VPS_MODE=false
```

### 2. برای محیط Server/Docker
```env
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=1234
NODE_ENV=production
VPS_MODE=true
```

### 3. تشخیص خودکار محیط
فایل‌های `lib/database.ts`، `lib/master-database.ts` و `lib/tenant-database.ts` به صورت خودکار محیط را تشخیص می‌دهند:

- اگر `NODE_ENV=development` و `DOCKER_CONTAINER != true` → Local
- اگر `DOCKER_CONTAINER=true` یا `VPS_MODE=true` → Docker/Server

## مسیرهای صدای رابین

### Frontend (در CRM)
- صفحه اصلی: `/[tenant_key]/dashboard/voice-assistant`
- مثال: `http://localhost:3000/rabin/dashboard/voice-assistant`

### Backend (سرویس جداگانه)
- Health Check: `/rabin-voice/health`
- Chat API: `/rabin-voice/chat`
- پورت: `3001` (در Docker)

## عیب‌یابی

### مشکل: داده‌های tenant دیگر نمایش داده می‌شود

```bash
# 1. بررسی token
# در Developer Tools > Application > Cookies
# بررسی کنید که tenant_token موجود باشد

# 2. اجرای اسکریپت اصلاح
node scripts/fix-tenant-data.js

# 3. پاک کردن cache مرورگر
# Ctrl+Shift+Delete
```

### مشکل: صدای رابین کار نمی‌کند

```bash
# 1. بررسی سرویس
curl http://localhost:3001/rabin-voice/health

# 2. بررسی لاگ‌ها
docker logs crm-rabin-voice

# 3. راه‌اندازی مجدد
docker-compose restart rabin-voice
```

## تست‌های پیشنهادی

### 1. تست فیلتر Tenant
```javascript
// در Console مرورگر
fetch('/api/customers')
  .then(r => r.json())
  .then(data => {
    console.log('Customers:', data.customers);
    // همه باید tenant_key='rabin' داشته باشند
  });
```

### 2. تست ایجاد مشتری جدید
```javascript
fetch('/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'تست مشتری',
    email: 'test@example.com'
  })
})
  .then(r => r.json())
  .then(data => {
    console.log('New customer:', data);
    // باید tenant_key='rabin' داشته باشد
  });
```

## نتیجه

✅ فیلتر tenant_key در همه API ها اعمال شد
✅ صدای رابین به سایدبار اضافه شد
✅ صفحه دستیار صوتی ایجاد شد
✅ اسکریپت اصلاح دیتابیس آماده است
✅ تشخیص خودکار محیط (Local/Docker) پیاده‌سازی شد

---

**تاریخ:** 2025-01-07
**نسخه:** 1.0.0
