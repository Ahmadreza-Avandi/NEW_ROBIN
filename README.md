# 🤖 پروژه صدای رابین - دستیار صوتی هوشمند

یک دستیار صوتی هوشمند با قابلیت تشخیص گفتار، تبدیل متن به صدا، و یکپارچگی با دیتابیس CRM.

---

## 📋 فهرست

- [درباره پروژه](#-درباره-پروژه)
- [ویژگی‌ها](#-ویژگیها)
- [معماری](#-معماری)
- [نصب و راه‌اندازی](#-نصب-و-راهاندازی)
- [تست](#-تست)
- [Deploy](#-deploy)
- [مستندات](#-مستندات)
- [عیب‌یابی](#-عیبیابی)

---

## 🎯 درباره پروژه

**صدای رابین** یک دستیار صوتی هوشمند است که:
- 🎤 گفتار شما را تشخیص می‌دهد
- 🤖 با هوش مصنوعی پاسخ می‌دهد
- 🔊 پاسخ را به صورت صوتی پخش می‌کند
- 💾 با دیتابیس CRM یکپارچه است

---

## ✨ ویژگی‌ها

### 🎤 تشخیص گفتار
- تشخیص گفتار فارسی
- پشتیبانی از کلمات کلیدی
- تشخیص خودکار پایان جمله

### 🤖 هوش مصنوعی
- یکپارچگی با OpenRouter
- استفاده از Claude 3 Haiku
- پاسخ‌های هوشمند و متناسب

### 🔊 تبدیل متن به صدا (TTS)
- صدای طبیعی فارسی
- پخش خودکار پاسخ‌ها
- پشتیبانی از متن‌های طولانی

### 💾 یکپارچگی با دیتابیس
- دسترسی به اطلاعات کاربران
- دسترسی به اطلاعات مشتریان
- گزارش‌های فروش
- مدیریت وظایف و فعالیت‌ها

---

## 🏗️ معماری

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React + Next.js)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
         ┌───────────▼──────────┐
         │   Next.js API Routes │
         │   (Port 3001)        │
         │                      │
         │  /rabin-voice/api/   │
         │  ├─ ai               │  → OpenRouter (Claude 3)
         │  ├─ tts              │  → TTS API
         │  ├─ audio-proxy      │  → Audio Streaming
         │  └─ database         │  → MySQL Database
         └──────────────────────┘
```

### تکنولوژی‌ها:
- **Frontend:** Next.js 14, React 18, TypeScript
- **Backend:** Next.js API Routes
- **Database:** MySQL 8.0
- **AI:** OpenRouter (Claude 3 Haiku)
- **TTS:** Custom Persian TTS API
- **Deployment:** Docker, Nginx

---

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها:
- Node.js 18+
- Docker & Docker Compose
- MySQL 8.0

### 1. Clone Repository
```bash
git clone <repository-url>
cd rabin-last
```

### 2. تنظیم Environment Variables
```bash
cd "صدای رابین"
cp .env.example .env
nano .env
```

```bash
# .env
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL=anthropic/claude-3-haiku
TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
PORT=3001
LOG_LEVEL=INFO

# Database (optional - move from lib/database.ts)
DB_HOST=your-db-host
DB_NAME=crm_system
DB_USER=your-db-user
DB_PASSWORD=your-db-password
```

### 3. نصب Dependencies
```bash
npm install
```

### 4. Build و Run
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

### 5. Docker Deployment
```bash
# Build and start
./rebuild-rabin-voice.sh --clean --restart-nginx

# Test
./test-endpoints.sh
```

---

## 🧪 تست

### تست سریع TTS:
```bash
chmod +x test-tts-quick.sh
./test-tts-quick.sh
```

### تست کامل اتصال:
```bash
chmod +x test-tts-connection.sh
./test-tts-connection.sh
```

### تست همه Endpoint‌ها:
```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### تست Production:
```bash
./test-tts-quick.sh --prod
```

برای اطلاعات بیشتر: [TESTING-GUIDE.md](./TESTING-GUIDE.md)

---

## 🚢 Deploy

### مراحل Deploy:

1. **Rebuild Container:**
   ```bash
   ./rebuild-rabin-voice.sh --clean --restart-nginx
   ```

2. **Test Endpoints:**
   ```bash
   ./test-endpoints.sh
   ```

3. **Monitor Logs:**
   ```bash
   docker logs -f crm_rabin_voice
   ```

4. **Test Production:**
   ```bash
   ./test-tts-quick.sh --prod
   ```

برای اطلاعات بیشتر: [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)

---

## 📚 مستندات

### مستندات اصلی:
- **[FINAL-SUMMARY.md](./FINAL-SUMMARY.md)** - خلاصه نهایی پروژه
- **[ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md)** - معماری کامل
- **[TESTING-GUIDE.md](./TESTING-GUIDE.md)** - راهنمای تست
- **[DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)** - چک‌لیست deploy

### مستندات تغییرات:
- **[FIXES-SUMMARY.md](./FIXES-SUMMARY.md)** - خلاصه تغییرات و رفع مشکلات

### مستندات فنی:
- **[DATABASE_INTEGRATION.md](./صدای رابین/DATABASE_INTEGRATION.md)** - یکپارچگی دیتابیس

---

## 🐛 عیب‌یابی

### مشکل: TTS کار نمی‌کنه
```bash
# تست اتصال
./test-tts-connection.sh

# بررسی لاگ‌ها
docker logs --tail=100 crm_rabin_voice | grep TTS
```

### مشکل: Container start نمی‌شه
```bash
# بررسی لاگ‌ها
docker-compose logs --tail=50 rabin-voice

# Rebuild
./rebuild-rabin-voice.sh --clean
```

### مشکل: 404 Not Found
```bash
# بررسی nginx
docker-compose restart nginx

# بررسی basePath
grep basePath "صدای رابین/next.config.js"
```

برای اطلاعات بیشتر: [TESTING-GUIDE.md](./TESTING-GUIDE.md#-عیبیابی)

---

## 📊 API Endpoints

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/rabin-voice/api/ai` | POST | AI conversation | ✅ |
| `/rabin-voice/api/tts` | POST | Text-to-Speech | ✅ |
| `/rabin-voice/api/audio-proxy` | GET | Audio proxy | ✅ |
| `/rabin-voice/api/database` | POST | Database queries | ✅ |

### مثال استفاده:

#### TTS:
```bash
curl -X POST http://localhost:3001/rabin-voice/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام"}'
```

#### AI:
```bash
curl -X POST http://localhost:3001/rabin-voice/api/ai \
  -H "Content-Type: application/json" \
  -d '{"message":"سلام رابین"}'
```

#### Database:
```bash
curl -X POST http://localhost:3001/rabin-voice/api/database \
  -H "Content-Type: application/json" \
  -d '{"action":"getEmployees"}'
```

---

## 🔧 اسکریپت‌های مفید

### تست:
- `test-tts-quick.sh` - تست سریع TTS
- `test-tts-connection.sh` - تست کامل اتصال
- `test-endpoints.sh` - تست همه endpoint‌ها
- `compare-implementations.sh` - مقایسه implementation‌ها

### Deploy:
- `rebuild-rabin-voice.sh` - Rebuild کانتینر
- `quick-update.sh` - Update سریع بدون rebuild

---

## 📈 وضعیت پروژه

### ✅ کامل شده:
- [x] تشخیص گفتار فارسی
- [x] یکپارچگی با AI
- [x] تبدیل متن به صدا
- [x] یکپارچگی با دیتابیس
- [x] Audio proxy
- [x] Docker deployment
- [x] مستندات کامل
- [x] اسکریپت‌های تست

### 🚧 در حال توسعه:
- [ ] Caching mechanism
- [ ] Retry mechanism
- [ ] Monitoring/Metrics
- [ ] Rate limiting

### 💡 پیشنهادات بهبود:
- [ ] حذف Express.js (Legacy)
- [ ] انتقال DB credentials به .env
- [ ] محدود کردن CORS
- [ ] اضافه کردن unit tests

---

## 🔐 امنیت

### ⚠️ نکات امنیتی:
1. API keys در `.env` نگهداری می‌شوند ✅
2. Database credentials باید به `.env` منتقل شوند ⚠️
3. CORS باید محدود شود ⚠️
4. `.env` در `.gitignore` است ✅

---

## 📞 پشتیبانی

### دستورات مفید:

```bash
# مشاهده لاگ‌ها
docker logs -f crm_rabin_voice

# ورود به کانتینر
docker exec -it crm_rabin_voice sh

# Restart
docker-compose restart rabin-voice

# بررسی وضعیت
docker ps | grep rabin
```

---

## 🤝 مشارکت

برای مشارکت در پروژه:
1. Fork کنید
2. Branch جدید بسازید
3. تغییرات را commit کنید
4. Push کنید
5. Pull Request بسازید

---

## 📝 لایسنس

[لایسنس پروژه]

---

## 🙏 تشکر

از همه کسانی که در توسعه این پروژه مشارکت داشتند، تشکر می‌کنیم.

---

## 📞 تماس

- **Website:** https://crm.robintejarat.com/rabin-voice
- **Email:** [ایمیل]
- **GitHub:** [لینک GitHub]

---

**نسخه:** 1.0  
**آخرین بروزرسانی:** 2024  
**وضعیت:** ✅ Production Ready

---

**موفق باشید! 🚀**
