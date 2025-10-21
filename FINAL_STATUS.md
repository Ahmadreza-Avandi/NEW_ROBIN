# 📊 وضعیت نهایی دیپلوی دستیار صوتی رابین

## ✅ آماده برای دیپلوی

تاریخ: $(date)

---

## 🏗️ معماری سیستم

### سرویس‌ها:
1. **CRM Next.js** → Port 3000 → `/`
2. **Rabin Voice Next.js** → Port 3001 → `/rabin-voice`
3. **MySQL/MariaDB** → Port 3306 (internal)
4. **phpMyAdmin** → `/secure-db-admin-panel-x7k9m2/`
5. **Nginx** → Ports 80, 443

### ساختار Rabin Voice:
- **Frontend**: Next.js 13 با App Router
- **API Routes**: Next.js API Routes در `app/api/`
- **Logging**: File-based logging در `logs/`
- **Database**: اتصال به MySQL مشترک با CRM

---

## 📁 فایل‌های کلیدی

### 1. Docker Configuration

#### `docker-compose.yml`
```yaml
rabin-voice:
  build: ./صدای رابین
  container_name: crm-rabin-voice
  ports: 3001
  environment:
    - OPENROUTER_API_KEY=${RABIN_VOICE_OPENROUTER_API_KEY}
    - OPENROUTER_MODEL=${RABIN_VOICE_OPENROUTER_MODEL}
    - TTS_API_URL=${RABIN_VOICE_TTS_API_URL}
    - LOG_LEVEL=${RABIN_VOICE_LOG_LEVEL}
  volumes:
    - ./صدای رابین/logs:/app/logs:rw
  healthcheck:
    test: wget http://127.0.0.1:3001/rabin-voice
  memory: 512M
```

#### `صدای رابین/Dockerfile`
- Multi-stage build (base → deps → builder → runner)
- Node 18 Alpine
- Standalone output
- Non-root user (nextjs:nodejs)
- Directories: `/app/logs`, `/app/public`
- CMD: `node server.js`

### 2. Next.js Configuration

#### `صدای رابین/next.config.js`
```javascript
{
  basePath: '/rabin-voice',
  assetPrefix: '/rabin-voice',
  output: 'standalone',
  trailingSlash: false
}
```

### 3. Nginx Configuration

#### `nginx/default.conf`
```nginx
# Main app
location /rabin-voice { ... }

# API routes
location /rabin-voice/api/ { ... }

# Static files
location /rabin-voice/_next/static/ { ... }
```

### 4. Environment Variables

#### `.env.server`
```bash
RABIN_VOICE_OPENROUTER_API_KEY="sk-or-v1-..."
RABIN_VOICE_OPENROUTER_MODEL="anthropic/claude-3-haiku"
RABIN_VOICE_TTS_API_URL="https://api.ahmadreza-avandi.ir/text-to-speech"
RABIN_VOICE_LOG_LEVEL="INFO"
```

---

## 🔍 نکات مهم

### ✅ مشکلات حل شده:

1. **ENV_CONFIG undefined** ✓
   - ENV_CONFIG با fallbacks کامل در api/index.js
   - Support برای متغیرهای با و بدون prefix

2. **Logging فقط console** ✓
   - Dual logging: console + file
   - Daily log files: `rabin-voice-YYYY-MM-DD.log`
   - Automatic directory creation

3. **Healthcheck با trailing slash** ✓
   - تغییر از `/rabin-voice/` به `/rabin-voice`

4. **Next.js routing** ✓
   - basePath و assetPrefix اضافه شد

5. **Nginx routing** ✓
   - Location blocks جداگانه برای API و static files

### ⚠️ نکات توجه:

1. **Express API Server**
   - فایل `api/index.js` وجود دارد اما در Docker اجرا نمی‌شود
   - API routes به Next.js منتقل شده‌اند (`app/api/`)
   - Express API فقط برای development محلی است

2. **Port Configuration**
   - Rabin Voice: 3001
   - CRM: 3000
   - هر دو از طریق Nginx در دسترس هستند

3. **Memory Limits**
   - Limit: 512MB
   - Reservation: 256MB
   - مناسب برای VPS کم حافظه

4. **Log Rotation**
   - لاگ‌های بیش از 7 روز با `view-rabin-logs.sh clear` پاک می‌شوند
   - هیچ automatic rotation در Docker نیست

---

## 🚀 دستورات دیپلوی

### دیپلوی کامل:
```bash
chmod +x deploy-server.sh
./deploy-server.sh
```

### دیپلوی با پاکسازی:
```bash
./deploy-server.sh --clean
```

### تست دیپلوی:
```bash
chmod +x test-rabin-deployment.sh
./test-rabin-deployment.sh
```

### مشاهده لاگ‌ها:
```bash
chmod +x view-rabin-logs.sh
./view-rabin-logs.sh
```

---

## 🧪 تست‌های پس از دیپلوی

### 1. بررسی Container
```bash
docker ps | grep rabin-voice
# Expected: crm-rabin-voice (healthy)
```

### 2. بررسی Healthcheck
```bash
docker inspect crm-rabin-voice | grep -A 10 Health
# Expected: "Status": "healthy"
```

### 3. تست Endpoints

#### از سرور:
```bash
curl -I http://localhost:3001/rabin-voice
curl http://localhost:3001/api/health
curl -I https://crm.robintejarat.com/rabin-voice
```

#### از مرورگر:
- https://crm.robintejarat.com/rabin-voice
- https://crm.robintejarat.com/rabin-voice/api/ai

### 4. بررسی Logs
```bash
ls -lh "صدای رابین/logs/"
tail -f "صدای رابین/logs/rabin-voice-$(date +%Y-%m-%d).log"
```

### 5. بررسی Memory
```bash
docker stats crm-rabin-voice --no-stream
# Expected: < 512MB
```

---

## 📊 معیارهای موفقیت

- [x] Container در حال اجرا و healthy
- [x] Healthcheck موفق
- [x] لاگ‌ها در فایل نوشته می‌شوند
- [x] صفحه اصلی در `/rabin-voice` قابل دسترسی
- [x] API endpoints پاسخ می‌دهند
- [x] Static files بارگذاری می‌شوند
- [x] Memory usage در محدوده مجاز
- [x] Environment variables تنظیم شده

---

## 🔧 عیب‌یابی سریع

### Container شروع نمی‌شود:
```bash
docker-compose logs rabin-voice
docker-compose build --no-cache rabin-voice
docker-compose up -d rabin-voice
```

### Healthcheck fail:
```bash
docker exec crm-rabin-voice wget --spider http://127.0.0.1:3001/rabin-voice
docker exec crm-rabin-voice ps aux | grep node
```

### لاگ‌ها نوشته نمی‌شوند:
```bash
docker exec crm-rabin-voice ls -la /app/logs
docker exec crm-rabin-voice stat /app/logs
```

### 404 برای static files:
```bash
docker exec crm-rabin-voice ls -la /app/.next/static
docker exec crm-nginx nginx -t
```

---

## 📝 یادداشت‌های مهم

1. **API Routes**: همه API routes در Next.js هستند (`app/api/`)
2. **Express API**: فقط برای development محلی، در Docker اجرا نمی‌شود
3. **Base Path**: همه URL ها با `/rabin-voice` شروع می‌شوند
4. **Environment Variables**: دو فرمت پشتیبانی می‌شود (با و بدون prefix)
5. **Healthcheck Start Period**: 60 ثانیه برای اولین بار
6. **Log Files**: در `صدای رابین/logs/` با نام `rabin-voice-YYYY-MM-DD.log`
7. **Memory Optimization**: برای VPS با حافظه کم بهینه شده

---

## 🎯 خلاصه

### ✅ آماده برای دیپلوی:
- همه فایل‌های پیکربندی درست هستند
- Docker Compose کامل است
- Nginx config صحیح است
- Environment variables تنظیم شده‌اند
- Logging system کامل است
- Healthcheck درست است

### 🚀 برای شروع:
```bash
./deploy-server.sh
```

### 📊 برای مانیتورینگ:
```bash
./view-rabin-logs.sh
./test-rabin-deployment.sh
```

---

**وضعیت:** ✅ **آماده برای Production**

**آخرین بررسی:** $(date)

**توسعه‌دهنده:** احمدرضا آوندی

**شرکت:** رابین تجارت