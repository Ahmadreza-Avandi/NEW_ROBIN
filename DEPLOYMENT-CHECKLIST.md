# ✅ چک‌لیست Deployment صدای رابین

این چک‌لیست برای اطمینان از صحت deployment در subdirectory (`/rabin-voice`) طراحی شده است.

## 📋 قبل از Deployment

### 1. بررسی تنظیمات Next.js
- [x] `next.config.js` دارای `basePath: '/rabin-voice'` است
- [x] `next.config.js` دارای `assetPrefix: '/rabin-voice'` است
- [x] `output: 'standalone'` برای Docker فعال است

### 2. بررسی API Endpoints در Frontend
- [x] `utils/api.ts` - `API_BASE_URL = '/rabin-voice/api'`
- [x] `utils/speech.ts` - خط 125: `/rabin-voice/api/tts`
- [x] `utils/speech.ts` - خط 412: `/rabin-voice/api/tts`
- [x] `components/VoiceAssistant.tsx` - خط 93: `/rabin-voice/api/ai`

### 3. بررسی API Routes در Backend
- [x] `app/api/tts/route.ts` - خط 54: `/rabin-voice/api/audio-proxy`
- [x] همه API routes در `app/api/` به درستی کار می‌کنند

### 4. بررسی تنظیمات Docker
- [ ] `docker-compose.yml` دارای سرویس `rabin-voice` است
- [ ] پورت 3001 به درستی map شده است
- [ ] Environment variables تنظیم شده‌اند
- [ ] Health check فعال است

### 5. بررسی تنظیمات Nginx
- [ ] Route `/rabin-voice` به `rabin-voice:3001` proxy می‌شود
- [ ] Header های لازم (Host, X-Real-IP, etc.) تنظیم شده‌اند
- [ ] SSL certificate معتبر است
- [ ] CORS headers در صورت نیاز تنظیم شده‌اند

---

## 🚀 مراحل Deployment

### مرحله 1: آپلود کد
```bash
# کد را به سرور آپلود کنید
scp -r "صدای رابین" user@server:/path/to/project/
```

### مرحله 2: Pre-Deployment Check
```bash
# اجرای اسکریپت بررسی قبل از deployment
chmod +x pre-deploy-check.sh
./pre-deploy-check.sh
```

### مرحله 3: Build و Deploy
```bash
# استفاده از اسکریپت rebuild
chmod +x rebuild-rabin-voice.sh
./rebuild-rabin-voice.sh --clean --restart-nginx
```

### مرحله 4: تست Endpoints
```bash
# تست همه endpoint ها
chmod +x test-endpoints.sh
./test-endpoints.sh
```

---

## 🔍 بررسی بعد از Deployment

### 1. بررسی Container
```bash
# بررسی وضعیت container
docker ps | grep rabin-voice

# بررسی لاگ‌ها
docker logs rabin-voice --tail=50

# بررسی health
docker inspect rabin-voice | grep -A 10 Health
```

### 2. بررسی Endpoints

#### دسترسی مستقیم (پورت 3001)
- [ ] `http://localhost:3001/rabin-voice` - صفحه اصلی
- [ ] `http://localhost:3001/rabin-voice/api/health` - Health check
- [ ] `http://localhost:3001/rabin-voice/api/ai` - AI endpoint (POST)
- [ ] `http://localhost:3001/rabin-voice/api/tts` - TTS endpoint (POST)

#### دسترسی از طریق دامنه
- [ ] `https://crm.robintejarat.com/rabin-voice` - صفحه اصلی
- [ ] `https://crm.robintejarat.com/rabin-voice/api/health` - Health check
- [ ] `https://crm.robintejarat.com/rabin-voice/api/ai` - AI endpoint (POST)
- [ ] `https://crm.robintejarat.com/rabin-voice/api/tts` - TTS endpoint (POST)

### 3. بررسی Browser Console
```javascript
// باز کردن Developer Tools (F12) و بررسی:
// 1. هیچ 401 Unauthorized error نباشد
// 2. همه API calls به /rabin-voice/api/* بروند
// 3. Static assets از /rabin-voice/_next/* لود شوند
// 4. هیچ CORS error نباشد
```

### 4. تست عملکرد
- [ ] کلیک روی دکمه میکروفون
- [ ] صحبت کردن و تشخیص گفتار
- [ ] دریافت پاسخ از AI
- [ ] پخش صدای پاسخ
- [ ] بررسی لاگ‌ها در console

---

## 🐛 عیب‌یابی مشکلات رایج

### مشکل: 401 Unauthorized
**علت:** API calls به مسیر اشتباه می‌روند (بدون `/rabin-voice` prefix)

**راه‌حل:**
1. بررسی کنید همه fetch calls در frontend دارای `/rabin-voice/api` هستند
2. بررسی کنید `next.config.js` دارای `basePath` است
3. Rebuild کنید: `./rebuild-rabin-voice.sh --clean`

### مشکل: 404 Not Found
**علت:** Nginx routing یا basePath اشتباه است

**راه‌حل:**
1. بررسی Nginx config: `location /rabin-voice`
2. بررسی `next.config.js`: `basePath: '/rabin-voice'`
3. Restart Nginx: `docker-compose restart nginx`

### مشکل: صدا پخش نمی‌شود
**علت:** Audio proxy یا TTS endpoint مشکل دارد

**راه‌حل:**
1. بررسی لاگ‌های TTS: `docker logs rabin-voice | grep TTS`
2. بررسی audio-proxy endpoint: `/rabin-voice/api/audio-proxy`
3. تست مستقیم TTS API با curl

### مشکل: Static assets لود نمی‌شوند
**علت:** `assetPrefix` تنظیم نشده است

**راه‌حل:**
1. بررسی `next.config.js`: `assetPrefix: '/rabin-voice'`
2. Rebuild: `./rebuild-rabin-voice.sh --clean`

### مشکل: Container بالا نمی‌آید
**علت:** Build error یا resource کم

**راه‌حل:**
1. بررسی لاگ‌های build: `docker-compose logs rabin-voice`
2. بررسی منابع: `free -h` و `df -h`
3. پاک کردن cache: `docker system prune -a`

---

## 📊 Monitoring

### لاگ‌های مهم
```bash
# لاگ‌های real-time
docker logs -f rabin-voice

# لاگ‌های خطا
docker logs rabin-voice 2>&1 | grep -i error

# لاگ‌های TTS
docker logs rabin-voice 2>&1 | grep TTS

# لاگ‌های API
docker logs rabin-voice 2>&1 | grep API
```

### Metrics
```bash
# استفاده از منابع
docker stats rabin-voice

# تعداد restart ها
docker inspect rabin-voice | grep RestartCount

# Uptime
docker inspect rabin-voice | grep StartedAt
```

---

## 🔄 آپدیت سریع

برای اعمال تغییرات کوچک بدون rebuild کامل:

```bash
# 1. ویرایش فایل‌ها
# 2. اجرای اسکریپت آپدیت سریع
./quick-update.sh
```

---

## 📝 یادداشت‌های مهم

### مسیرهای مهم در Production
- Frontend: `https://crm.robintejarat.com/rabin-voice`
- API Base: `https://crm.robintejarat.com/rabin-voice/api`
- Health Check: `https://crm.robintejarat.com/rabin-voice/api/health`

### Environment Variables مورد نیاز
```env
OPENROUTER_API_KEY=your_key_here
NODE_ENV=production
PORT=3001
```

### پورت‌ها
- Container Internal: 3001
- Nginx Proxy: 443 (HTTPS)
- Direct Access: 3001 (فقط localhost)

### مسیرهای API
- AI: `/rabin-voice/api/ai`
- TTS: `/rabin-voice/api/tts`
- Audio Proxy: `/rabin-voice/api/audio-proxy`
- Database: `/rabin-voice/api/database`
- Health: `/rabin-voice/api/health`

---

## ✅ Deployment موفق!

اگر همه موارد بالا را چک کردید و تست‌ها موفق بودند، deployment شما کامل است! 🎉

برای پشتیبانی یا گزارش مشکل، لاگ‌های کامل را ذخیره کنید:
```bash
docker logs rabin-voice > rabin-voice-logs.txt 2>&1
```