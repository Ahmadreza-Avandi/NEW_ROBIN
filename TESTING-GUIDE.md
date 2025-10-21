# 🧪 راهنمای تست پروژه صدای رابین

این راهنما شامل تمام اسکریپت‌های تست و نحوه استفاده از آن‌هاست.

---

## 📋 فهرست اسکریپت‌ها

| اسکریپت | هدف | زمان اجرا |
|---------|-----|-----------|
| `test-tts-quick.sh` | تست سریع TTS | ~10 ثانیه |
| `test-tts-connection.sh` | تست کامل اتصال TTS | ~30 ثانیه |
| `test-endpoints.sh` | تست همه endpoint‌ها | ~20 ثانیه |
| `compare-implementations.sh` | مقایسه Next.js و Express.js | ~5 ثانیه |
| `rebuild-rabin-voice.sh` | Rebuild کانتینر | ~5-10 دقیقه |
| `quick-update.sh` | Update سریع بدون rebuild | ~30 ثانیه |

---

## 🚀 تست سریع TTS

### استفاده:
```bash
chmod +x test-tts-quick.sh
./test-tts-quick.sh
```

### تست Production:
```bash
./test-tts-quick.sh --prod
```

### چه چیزی تست می‌شود:
1. ✅ TTS API مستقیم
2. ✅ Local endpoint (`http://localhost:3001/rabin-voice/api/tts`)
3. ✅ Audio proxy
4. ✅ Container logs
5. ✅ Production endpoint (با flag `--prod`)

### خروجی موفق:
```
✅ TTS API is working!
✅ Local endpoint is working!
✅ Audio URL received: /rabin-voice/api/audio-proxy?url=...
✅ Audio proxy is working!
```

---

## 🔍 تست کامل اتصال TTS

### استفاده:
```bash
chmod +x test-tts-connection.sh
./test-tts-connection.sh
```

### چه چیزی تست می‌شود:
1. ✅ DNS Resolution
2. ✅ Ping Test
3. ✅ HTTPS Connection
4. ✅ SSL Certificate
5. ✅ Full API Test
6. ✅ Test from Docker Container

### خروجی موفق:
```
✅ Ping successful
✅ HTTPS connection successful
✅ SSL certificate is valid
✅ TTS API is working!
✅ Container can reach TTS API
```

### اگر تست ناموفق بود:
اسکریپت احتمالات مختلف رو نشون می‌ده:
- 🔥 Firewall
- 🌐 DNS
- 🔒 SSL
- ⏱️ Timeout
- 🚫 TTS API down

---

## 🎯 تست همه Endpoint‌ها

### استفاده:
```bash
chmod +x test-endpoints.sh
./test-endpoints.sh
```

### چه چیزی تست می‌شود:
1. ✅ Direct port access (3001)
2. ✅ Domain access (https://crm.robintejarat.com)
3. ✅ AI endpoint
4. ✅ TTS endpoint
5. ✅ Database endpoint
6. ✅ Audio Proxy endpoint
7. ✅ Static assets

### خروجی موفق:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 نتیجه نهایی
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ موفق: 7
❌ ناموفق: 0
⚠️  هشدار: 0
```

---

## 🔄 مقایسه Implementation‌ها

### استفاده:
```bash
chmod +x compare-implementations.sh
./compare-implementations.sh
```

### چه چیزی مقایسه می‌شود:
1. TTS API URLs
2. Request Body Structure
3. Headers
4. Audio Proxy URLs

### خروجی موفق:
```
✅ TTS API URL: MATCH
✅ Request Body: MATCH (both use 'text')
✅ Headers: MATCH (both use User-Agent)
✅ Implementations are ALIGNED
```

---

## 🔨 Rebuild کانتینر

### استفاده معمولی:
```bash
chmod +x rebuild-rabin-voice.sh
./rebuild-rabin-voice.sh
```

### Rebuild با پاکسازی کامل:
```bash
./rebuild-rabin-voice.sh --clean
```

### Rebuild + Restart Nginx:
```bash
./rebuild-rabin-voice.sh --clean --restart-nginx
```

### مراحل انجام شده:
1. 🛑 توقف کانتینر قبلی
2. 🧹 حذف image قبلی (با `--clean`)
3. 🔨 Build کانتینر جدید
4. 🚀 راه‌اندازی کانتینر
5. ⏳ انتظار برای آماده شدن
6. 🔍 تست سلامت سرویس
7. 📋 نمایش لاگ‌های اخیر
8. 🔄 Restart nginx (با `--restart-nginx`)

### زمان تقریبی:
- بدون `--clean`: ~3-5 دقیقه
- با `--clean`: ~5-10 دقیقه

---

## ⚡ Update سریع

### استفاده:
```bash
chmod +x quick-update.sh
./quick-update.sh
```

### چه زمانی استفاده کنیم:
- وقتی فقط کد تغییر کرده (نه dependencies)
- برای تست سریع تغییرات
- وقتی نمی‌خواهیم کل stack رو rebuild کنیم

### مراحل:
1. 🔨 Build Next.js
2. 🔄 Restart کانتینر
3. ⏳ انتظار برای آماده شدن
4. 🔍 تست سلامت

### زمان تقریبی:
~30 ثانیه

---

## 📊 Workflow توصیه شده

### 1️⃣ بعد از تغییرات کد:
```bash
# Update سریع
./quick-update.sh

# تست TTS
./test-tts-quick.sh

# اگر مشکلی بود، لاگ‌ها رو ببین
docker logs -f crm_rabin_voice | grep -E "(TTS|Error|❌)"
```

### 2️⃣ بعد از تغییرات dependencies:
```bash
# Rebuild کامل
./rebuild-rabin-voice.sh --clean --restart-nginx

# تست همه endpoint‌ها
./test-endpoints.sh

# تست TTS
./test-tts-quick.sh
```

### 3️⃣ برای Deployment Production:
```bash
# 1. Rebuild با پاکسازی
./rebuild-rabin-voice.sh --clean --restart-nginx

# 2. تست همه endpoint‌ها
./test-endpoints.sh

# 3. تست TTS کامل
./test-tts-connection.sh

# 4. تست Production
./test-tts-quick.sh --prod

# 5. مانیتور لاگ‌ها
docker logs -f crm_rabin_voice
```

### 4️⃣ اگر TTS کار نکرد:
```bash
# 1. تست اتصال
./test-tts-connection.sh

# 2. بررسی لاگ‌ها
docker logs --tail=100 crm_rabin_voice | grep TTS

# 3. تست مستقیم API
curl -X POST https://api.ahmadreza-avandi.ir/text-to-speech \
  -H "Content-Type: application/json" \
  -H "User-Agent: Dastyar-Robin/1.0" \
  -d '{"text":"سلام","speaker":"3","checksum":"1","filePath":"true","base64":"0"}'

# 4. بررسی implementation‌ها
./compare-implementations.sh
```

---

## 🐛 عیب‌یابی

### مشکل: Container start نمی‌شه
```bash
# بررسی لاگ‌های Docker Compose
docker-compose logs --tail=50 rabin-voice

# بررسی وضعیت کانتینر
docker ps -a | grep rabin

# حذف کامل و rebuild
docker-compose down
./rebuild-rabin-voice.sh --clean
```

### مشکل: TTS کار نمی‌کنه
```bash
# تست اتصال
./test-tts-connection.sh

# بررسی DNS
nslookup api.ahmadreza-avandi.ir

# تست از داخل کانتینر
docker exec crm_rabin_voice curl -I https://api.ahmadreza-avandi.ir
```

### مشکل: Audio playback کار نمی‌کنه
```bash
# تست audio proxy
curl -I "http://localhost:3001/rabin-voice/api/audio-proxy?url=https://example.com/test.mp3"

# بررسی لاگ‌های audio proxy
docker logs crm_rabin_voice | grep -i "audio\|proxy"
```

### مشکل: 404 Not Found
```bash
# بررسی basePath
grep basePath "صدای رابین/next.config.js"

# بررسی nginx config
cat nginx/default.conf | grep rabin-voice

# Restart nginx
docker-compose restart nginx
```

---

## 📝 دستورات مفید

### مشاهده لاگ‌های زنده:
```bash
# همه لاگ‌ها
docker logs -f crm_rabin_voice

# فقط TTS
docker logs -f crm_rabin_voice | grep TTS

# فقط خطاها
docker logs -f crm_rabin_voice | grep -E "(Error|❌)"

# فقط موفقیت‌ها
docker logs -f crm_rabin_voice | grep -E "(Success|✅)"
```

### ورود به کانتینر:
```bash
docker exec -it crm_rabin_voice sh
```

### بررسی وضعیت:
```bash
# وضعیت کانتینر
docker ps | grep rabin

# استفاده از منابع
docker stats crm_rabin_voice

# بررسی network
docker exec crm_rabin_voice ping -c 3 api.ahmadreza-avandi.ir
```

### Restart سریع:
```bash
# فقط rabin-voice
docker-compose restart rabin-voice

# همه سرویس‌ها
docker-compose restart
```

---

## 🎯 Checklist قبل از Production

- [ ] همه تست‌ها موفق هستند
- [ ] TTS API کار می‌کنه
- [ ] Audio playback کار می‌کنه
- [ ] Database connection موفق است
- [ ] AI endpoint کار می‌کنه
- [ ] لاگ‌ها خطای critical ندارند
- [ ] Nginx به درستی proxy می‌کنه
- [ ] SSL certificate معتبر است
- [ ] Environment variables صحیح هستند
- [ ] Backup از دیتابیس گرفته شده

---

## 📚 مستندات مرتبط

- [ARCHITECTURE-ANALYSIS.md](./ARCHITECTURE-ANALYSIS.md) - معماری کامل پروژه
- [FIXES-SUMMARY.md](./FIXES-SUMMARY.md) - خلاصه تغییرات
- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md) - چک‌لیست deploy
- [DATABASE_INTEGRATION.md](./صدای رابین/DATABASE_INTEGRATION.md) - مستندات دیتابیس

---

## 💡 نکات مهم

1. **همیشه قبل از production تست کنید**
2. **لاگ‌ها رو مانیتور کنید**
3. **از quick-update برای تست سریع استفاده کنید**
4. **از rebuild --clean برای production استفاده کنید**
5. **بعد از هر تغییر، test-endpoints.sh رو اجرا کنید**

---

**آخرین بروزرسانی:** 2024
**نسخه:** 1.0