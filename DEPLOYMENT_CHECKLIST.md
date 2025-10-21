# ✅ چک‌لیست دیپلوی دستیار صوتی رابین

## 📋 بررسی قبل از دیپلوی

### 1️⃣ فایل‌های پیکربندی

- [x] **docker-compose.yml**
  - ✅ سرویس `rabin-voice` تعریف شده
  - ✅ Container name: `crm-rabin-voice`
  - ✅ Port: 3001
  - ✅ Environment variables با دو فرمت (با و بدون prefix)
  - ✅ Volume برای logs: `./صدای رابین/logs:/app/logs:rw`
  - ✅ Healthcheck: `http://127.0.0.1:3001/rabin-voice`
  - ✅ Memory limits: 512M limit, 256M reservation
  - ✅ Network: crm-network
  - ✅ Depends on: mysql (healthy)

- [x] **nginx/default.conf**
  - ✅ Location `/rabin-voice` برای Next.js app
  - ✅ Location `/rabin-voice/api/` برای API routes
  - ✅ Location `/rabin-voice/_next/static/` برای static files
  - ✅ Proxy pass به `rabin-voice:3001`
  - ✅ Timeout settings: 30s-60s
  - ✅ Buffer settings مناسب

- [x] **صدای رابین/next.config.js**
  - ✅ `basePath: '/rabin-voice'`
  - ✅ `assetPrefix: '/rabin-voice'`
  - ✅ `output: 'standalone'`
  - ✅ `trailingSlash: false`

- [x] **صدای رابین/Dockerfile**
  - ✅ Multi-stage build
  - ✅ Node 18 Alpine
  - ✅ Standalone build
  - ✅ User: nextjs (non-root)
  - ✅ Directories: `/app/logs`, `/app/public`
  - ✅ Port: 3001
  - ✅ CMD: `node server.js`

- [x] **صدای رابین/api/index.js**
  - ✅ ENV_CONFIG object با fallbacks
  - ✅ Support برای متغیرهای با prefix و بدون prefix
  - ✅ Global ENV_CONFIG
  - ✅ Automatic logs directory creation
  - ✅ Environment debugging output
  - ✅ Health check endpoint: `/api/health`

- [x] **صدای رابین/api/utils/logger.js**
  - ✅ File system imports (fs, path)
  - ✅ Automatic log directory creation
  - ✅ Daily log files: `rabin-voice-YYYY-MM-DD.log`
  - ✅ Dual output: console + file
  - ✅ Colored console, plain file
  - ✅ Log level support

- [x] **.env.server**
  - ✅ `RABIN_VOICE_OPENROUTER_API_KEY` تنظیم شده
  - ✅ `RABIN_VOICE_OPENROUTER_MODEL` تنظیم شده
  - ✅ `RABIN_VOICE_TTS_API_URL` تنظیم شده
  - ✅ `RABIN_VOICE_LOG_LEVEL` تنظیم شده

### 2️⃣ دایرکتری‌ها

- [x] **صدای رابین/logs/**
  - ✅ ایجاد شده در اسکریپت deploy-server.sh (خط 289)
  - ✅ Permissions: 755
  - ✅ Mount شده در docker-compose.yml با `:rw`

- [x] **صدای رابین/public/**
  - ✅ ایجاد شده در اسکریپت deploy-server.sh (خط 290)
  - ✅ Permissions: 755
  - ✅ .gitkeep file (خط 295)

### 3️⃣ اسکریپت‌های کمکی

- [x] **deploy-server.sh**
  - ✅ ایجاد دایرکتری‌های رابین (خط 287-295)
  - ✅ Nginx config با rabin-voice (خط 608-619, 671-682)
  - ✅ بررسی container rabin-voice (خط 830-857)
  - ✅ تست Rabin Voice (خط 962-999)

- [x] **view-rabin-logs.sh**
  - ✅ مشاهده لاگ‌های Docker
  - ✅ مشاهده لاگ‌های فایل
  - ✅ لیست فایل‌های لاگ
  - ✅ پاکسازی لاگ‌های قدیمی (>7 روز)

- [x] **test-rabin-deployment.sh**
  - ✅ بررسی Docker containers
  - ✅ بررسی دایرکتری‌ها و فایل‌ها
  - ✅ بررسی environment variables
  - ✅ تست endpoints
  - ✅ نمایش لاگ‌های اخیر

## 🔍 نکات مهم

### ⚠️ مشکلات احتمالی و راه‌حل‌ها

#### 1. مشکل Healthcheck
**علامت:** Container مدام restart می‌شود
**علت:** Healthcheck به `/rabin-voice/` با trailing slash اشاره می‌کند
**راه‌حل:** ✅ **حل شده** - در docker-compose.yml به `/rabin-voice` بدون trailing slash تغییر داده شد

#### 2. مشکل Environment Variables
**علامت:** `ENV_CONFIG is not defined`
**علت:** متغیر ENV_CONFIG در api/index.js تعریف نشده بود
**راه‌حل:** ✅ **حل شده** - ENV_CONFIG با fallbacks کامل ایجاد شد

#### 3. مشکل Logging
**علامت:** لاگ‌ها فقط در console نمایش داده می‌شوند
**علت:** logger.js فقط console.log استفاده می‌کرد
**راه‌حل:** ✅ **حل شده** - سیستم dual logging (console + file) پیاده‌سازی شد

#### 4. مشکل Next.js Routing
**علامت:** 404 برای `/rabin-voice`
**علت:** basePath در next.config.js تنظیم نشده بود
**راه‌حل:** ✅ **حل شده** - basePath و assetPrefix اضافه شدند

#### 5. مشکل Nginx Routing
**علامت:** Static files و API routes 404 می‌دهند
**علت:** فقط یک location block برای `/rabin-voice` وجود داشت
**راه‌حل:** ✅ **حل شده** - location blocks جداگانه برای API و static files اضافه شدند

## 🚀 دستورات دیپلوی

### دیپلوی کامل
```bash
chmod +x deploy-server.sh
./deploy-server.sh
```

### دیپلوی با پاکسازی کامل
```bash
./deploy-server.sh --clean
```

### مشاهده لاگ‌ها
```bash
# لاگ‌های Docker و فایل
./view-rabin-logs.sh

# فقط لاگ‌های Docker
./view-rabin-logs.sh docker

# فقط لاگ‌های فایل
./view-rabin-logs.sh file

# لیست فایل‌های لاگ
./view-rabin-logs.sh list
```

### تست دیپلوی
```bash
chmod +x test-rabin-deployment.sh
./test-rabin-deployment.sh
```

### دستورات مفید Docker
```bash
# مشاهده وضعیت
docker-compose ps

# مشاهده لاگ‌های زنده
docker-compose logs -f rabin-voice

# ری‌استارت سرویس
docker-compose restart rabin-voice

# ورود به container
docker exec -it crm-rabin-voice sh

# بررسی healthcheck
docker inspect crm-rabin-voice | grep -A 10 Health
```

## 🧪 تست‌های پس از دیپلوی

### 1. بررسی Container
```bash
docker ps | grep rabin-voice
# باید نمایش دهد: crm-rabin-voice (healthy)
```

### 2. بررسی Logs
```bash
ls -lh "صدای رابین/logs/"
# باید فایل rabin-voice-YYYY-MM-DD.log وجود داشته باشد
```

### 3. تست Endpoints

#### از داخل سرور:
```bash
# صفحه اصلی
curl -I http://localhost:3001/rabin-voice

# Health check
curl http://localhost:3001/api/health

# از طریق Nginx
curl -I https://crm.robintejarat.com/rabin-voice
```

#### از مرورگر:
- https://crm.robintejarat.com/rabin-voice
- https://crm.robintejarat.com/rabin-voice/api/health

### 4. بررسی Environment Variables
```bash
docker exec crm-rabin-voice env | grep -E "RABIN|OPENROUTER|TTS"
```

### 5. بررسی Memory Usage
```bash
docker stats crm-rabin-voice --no-stream
# باید کمتر از 512M باشد
```

## 📊 معیارهای موفقیت

- ✅ Container در حال اجرا و healthy است
- ✅ Healthcheck موفق است
- ✅ لاگ‌ها در فایل نوشته می‌شوند
- ✅ صفحه اصلی در `/rabin-voice` قابل دسترسی است
- ✅ API endpoints پاسخ می‌دهند
- ✅ Static files بارگذاری می‌شوند
- ✅ Memory usage در محدوده مجاز است
- ✅ هیچ error در لاگ‌ها نیست

## 🔧 عیب‌یابی

### Container شروع نمی‌شود
```bash
# بررسی لاگ‌های build
docker-compose logs rabin-voice

# بررسی image
docker images | grep rabin

# rebuild کامل
docker-compose build --no-cache rabin-voice
docker-compose up -d rabin-voice
```

### Healthcheck fail می‌شود
```bash
# تست مستقیم endpoint
docker exec crm-rabin-voice wget --spider http://127.0.0.1:3001/rabin-voice

# بررسی Next.js
docker exec crm-rabin-voice ps aux | grep node

# بررسی port
docker exec crm-rabin-voice netstat -tlnp | grep 3001
```

### لاگ‌ها نوشته نمی‌شوند
```bash
# بررسی دایرکتری logs
docker exec crm-rabin-voice ls -la /app/logs

# بررسی permissions
docker exec crm-rabin-voice stat /app/logs

# تست نوشتن
docker exec crm-rabin-voice touch /app/logs/test.txt
```

### 404 برای static files
```bash
# بررسی Next.js build
docker exec crm-rabin-voice ls -la /app/.next/static

# بررسی nginx config
docker exec crm-nginx nginx -t

# بررسی proxy pass
docker exec crm-nginx cat /etc/nginx/conf.d/default.conf | grep rabin-voice
```

## 📝 یادداشت‌های مهم

1. **Port 3001**: رابین روی پورت 3001 اجرا می‌شود (CRM روی 3000)
2. **Base Path**: همه URL ها باید با `/rabin-voice` شروع شوند
3. **Memory Limit**: حداکثر 512MB برای VPS کم حافظه
4. **Log Rotation**: لاگ‌های بیش از 7 روز خودکار پاک می‌شوند
5. **Environment Variables**: دو فرمت پشتیبانی می‌شود (با و بدون `RABIN_VOICE_` prefix)
6. **Healthcheck**: 60 ثانیه start_period برای اولین بار
7. **Dependencies**: رابین باید قبل از NextJS بالا بیاید

## 🎯 نتیجه‌گیری

همه چیز آماده است! برای دیپلوی:

```bash
./deploy-server.sh
```

پس از دیپلوی، برای تست:

```bash
./test-rabin-deployment.sh
```

برای مشاهده لاگ‌ها:

```bash
./view-rabin-logs.sh
```

---

**آخرین بروزرسانی:** $(date)
**وضعیت:** ✅ آماده برای دیپلوی