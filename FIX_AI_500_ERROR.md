# � رفع خططای 500 در AI API

## ❌ مشکل
```
/api/voice-assistant/ai:1  Failed to load resource: the server responded with a status of 500 ()
```

## 🔍 علت‌های احتمالی

### 1. API Key تنظیم نشده یا اشتباه
```env
RABIN_VOICE_OPENROUTER_API_KEY=.  # ❌ اشتباه
```

### 2. Model نامعتبر یا در دسترس نیست
```env
RABIN_VOICE_OPENROUTER_MODEL=.  # ❌ اشتباه
```

### 3. خطا در اتصال به OpenRouter
- Network error
- Timeout
- Rate limit

### 4. خطا در پردازش دیتابیس
- Database connection failed
- Query error

---

## ✅ راه‌حل اعمال شده

### تنظیمات جدید در `.env`:

```env
# API Key معتبر
RABIN_VOICE_OPENROUTER_API_KEY=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

# Model جدید (رایگان)
RABIN_VOICE_OPENROUTER_MODEL=zhipu-ai/glm-4.5-air:free
```

---

## 🧪 تست

### روش 1: اسکریپت خودکار (توصیه می‌شود)

```bash
chmod +x test-ai-api.sh
./test-ai-api.sh
```

این اسکریپت:
- ✅ تنظیمات .env را بررسی می‌کند
- ✅ OpenRouter API را مستقیماً تست می‌کند
- ✅ NextJS API را تست می‌کند
- ✅ لاگ‌های خطا را نمایش می‌دهد

### روش 2: تست دستی OpenRouter

```bash
# تست مستقیم OpenRouter API
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: http://localhost:3000" \
  -d '{
    "model": "zhipu-ai/glm-4.5-air:free",
    "messages": [
      {"role": "user", "content": "سلام"}
    ],
    "max_tokens": 100
  }'
```

**انتظار:**
```json
{
  "id": "...",
  "choices": [
    {
      "message": {
        "content": "سلام! چطور می‌تونم کمکتون کنم؟"
      }
    }
  ]
}
```

### روش 3: تست NextJS API

```bash
# تست local
curl -X POST http://localhost:3000/api/voice-assistant/ai \
  -H "Content-Type: application/json" \
  -H "X-Tenant-Key: rabin" \
  -d '{
    "userMessage": "سلام",
    "history": []
  }'
```

**انتظار:**
```json
{
  "success": true,
  "response": "سلام! چطور می‌تونم کمکتون کنم؟",
  "hasData": false,
  "dataCount": 0
}
```

---

## 🔄 اعمال تغییرات

### روی لوکال (Development):

```bash
# تغییرات خودکار اعمال می‌شوند (Hot Reload)
# فقط صفحه را refresh کنید
```

### روی سرور (Production):

```bash
# 1. آپلود .env جدید به سرور
scp .env user@server:/path/to/project/

# 2. Restart NextJS
./restart-nextjs.sh

# یا دستی:
docker-compose -f docker-compose.deploy.yml restart nextjs
```

---

## 🐛 عیب‌یابی

### خطا: "OpenRouter API error: 401"

**علت:** API Key اشتباه یا منقضی شده

**راه‌حل:**
```bash
# بررسی API Key
grep RABIN_VOICE_OPENROUTER_API_KEY .env

# تست مستقیم
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"test"}]}'
```

### خطا: "OpenRouter API error: 404"

**علت:** Model نامعتبر یا در دسترس نیست

**راه‌حل:**
```bash
# لیست مدل‌های موجود
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"

# یا استفاده از مدل دیگر:
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
```

### خطا: "OpenRouter API error: 429"

**علت:** Rate limit - درخواست‌های زیاد

**راه‌حل:**
```bash
# صبر کنید و دوباره تلاش کنید
# یا credit اضافه کنید
```

### خطا: "Database connection failed"

**علت:** دیتابیس در دسترس نیست

**راه‌حل:**
```bash
# بررسی MySQL
docker-compose ps mysql

# تست اتصال
docker-compose exec mysql mariadb -u crm_user -p1234 -e "SELECT 1;"

# اگر مشکل دارد، ایمپورت کنید
./import-database-now.sh
```

### خطا: "Request timeout"

**علت:** OpenRouter خیلی طول کشید

**راه‌حل:**
```typescript
// در کد timeout افزایش یافته (50 ثانیه)
// اگر باز هم timeout می‌خورد:
const timeoutId = setTimeout(() => {
  controller.abort();
}, 90000); // 90 second
```

---

## 📊 بررسی لاگ‌ها

### لاگ‌های موفق:

```
🎤 Voice AI Request: { message: "سلام", tenant: "rabin" }
📚 Adding 0 previous conversations to context
💬 Current message: سلام
🤖 Calling OpenRouter AI: { model: "openai/gpt-oss-120b" }
✅ AI Response generated: سلام! چطور می‌تونم...
```

### لاگ‌های خطا:

```
❌ OpenRouter API Error: {"error":{"message":"Invalid API key"}}
❌ Voice AI API Error: Error: OpenRouter API error: 401
```

**بررسی لاگ‌ها:**
```bash
# روی سرور
docker-compose -f docker-compose.deploy.yml logs -f nextjs | grep "Voice AI"

# روی لوکال
# در terminal که npm run dev اجرا شده
```

---

## 🔑 مدیریت API Keys

### بررسی Credit:

```bash
# بررسی credit باقیمانده
curl https://openrouter.ai/api/v1/auth/key \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### مدل‌های پیشنهادی:

```env
# سریع و ارزان
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku

# متوسط
RABIN_VOICE_OPENROUTER_MODEL=openai/gpt-3.5-turbo

# قوی
RABIN_VOICE_OPENROUTER_MODEL=openai/gpt-4

# فارسی بهتر
RABIN_VOICE_OPENROUTER_MODEL=openai/gpt-oss-120b

# رایگان و سریع
RABIN_VOICE_OPENROUTER_MODEL=zhipu-ai/glm-4.5-air:free
```

---

## ✅ چک‌لیست

### قبل از تست:
- [ ] API Key در .env تنظیم شده
- [ ] Model در .env تنظیم شده
- [ ] NextJS restart شده (اگر روی سرور)
- [ ] صفحه refresh شده

### حین تست:
- [ ] Console باز است (F12)
- [ ] چیزی گفته شد
- [ ] لاگ‌ها در Console نمایش داده می‌شوند

### اگر موفق بود:
- [ ] پاسخ AI دریافت شد
- [ ] صدا پخش شد
- [ ] هیستوری ذخیره شد

### اگر خطا داد:
- [ ] خطا در Console کپی شد
- [ ] لاگ‌های NextJS بررسی شد
- [ ] OpenRouter API مستقیماً تست شد
- [ ] Credit بررسی شد

---

## 📞 دستورات سریع

```bash
# تست کامل
./test-ai-api.sh

# Restart NextJS
./restart-nextjs.sh

# تست OpenRouter مستقیم
curl -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer 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" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-oss-120b","messages":[{"role":"user","content":"سلام"}]}'

# تست NextJS API
curl -X POST http://localhost:3000/api/voice-assistant/ai \
  -H "Content-Type: application/json" \
  -d '{"userMessage":"سلام","history":[]}'

# لاگ‌های NextJS
docker-compose -f docker-compose.deploy.yml logs -f nextjs
```

---

**تاریخ:** $(date)
**API Key:** تنظیم شد ✅
**Model:** openai/gpt-oss-120b ✅
**وضعیت:** آماده برای تست
