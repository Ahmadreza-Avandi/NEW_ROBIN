# 🔧 رفع مشکلات سیستم صوتی رابین

## مشکلات شناسایی شده و راه‌حل‌ها

### 1. ✅ مشکل TTS API
**مشکل:** API قدیمی استفاده می‌شد  
**راه‌حل:** آپدیت به API جدید با ساختار ساده‌تر

```javascript
// قبل
const requestBody = {
  text: text,
  speaker: "3",
  checksum: "1",
  filePath: "true",
  base64: "0"
};

// بعد (ساده‌تر)
const requestBody = {
  text: text,
  speaker: "3"
};
```

**آدرس API جدید:**
```
POST http://api.ahmadreza-avandi.ir/text-to-speech
```

**پاسخ API:**
```json
{
  "success": true,
  "audioUrl": "http://...",
  "directUrl": "https://...",
  "checksum": "...",
  "base64": null,
  "requestId": "...",
  "shamsiDate": "..."
}
```

---

### 2. ✅ مشکل هوش مصنوعی - تگ‌های فکری
**مشکل:** مدل `qwen/qwen3-235b-a22b:free` تمام فرآیند فکری خودش رو توی پاسخ می‌ذاشت:

```
<think>Okay, the user said "سلام خودتو معرفی می‌کنی"...</think>
Let me check the key points...
According to the system prompt...
```

این باعث می‌شد TTS همه این متن‌های انگلیسی رو هم بخونه! 😅

**راه‌حل:**
1. تغییر مدل به `google/gemini-2.0-flash-exp:free` که تگ فکری نداره
2. اضافه کردن فیلتر برای حذف تگ‌های `<think>` و متن‌های فکری انگلیسی

```typescript
// حذف تگ‌های فکری
content = content.replace(/<think>[\s\S]*?<\/think>/gi, '');
content = content.replace(/<thinking>[\s\S]*?<\/thinking>/gi, '');

// حذف خطوط انگلیسی که توضیح فرآیند فکری هستند
const hasThinkingKeywords = /\b(okay|let me|check|need to|should|according to)\b/i.test(line);
```

---

### 3. ✅ مشکل دیتابیس
**مشکل:** خطای دیتابیس باعث می‌شد کل سیستم کار نکنه  
**راه‌حل:** اضافه کردن try-catch برای اینکه دیتابیس اختیاری باشه

```typescript
try {
  const dbConnected = await testConnection();
  if (dbConnected) {
    // استفاده از دیتابیس
  }
} catch (dbError) {
  console.error('⚠️ Database error (non-critical):', dbError.message);
  // ادامه بدون دیتابیس
}
```

---

### 4. ✅ بهبود Retry Mechanism
**مشکل:** خطاهای شبکه موقت باعث failure می‌شدند  
**راه‌حل:** اضافه کردن retry با exponential backoff

```typescript
async function callOpenRouter(messages, retryCount = 0) {
  const maxRetries = 3;
  try {
    // درخواست به API
  } catch (error) {
    if (retryCount < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
      return callOpenRouter(messages, retryCount + 1);
    }
  }
}
```

---

## 🧪 فایل‌های تست

### 1. `test-all-systems.js`
تست کامل همه سیستم‌ها (DNS, TTS, OpenRouter)

```bash
node test-all-systems.js
```

### 2. `test-models.js`
تست مدل‌های مختلف AI برای پیدا کردن بهترین گزینه

```bash
node test-models.js
```

### 3. `test-tts-new.js`
تست API جدید TTS

```bash
node test-tts-new.js
```

---

## 🎯 مدل‌های پیشنهادی

### رایگان و بدون تگ فکری:
1. ✨ **google/gemini-2.0-flash-exp:free** (پیشنهادی - سریع و تمیز)
2. **meta-llama/llama-3.2-3b-instruct:free** (سریع ولی کوچک)
3. **qwen/qwen-2.5-7b-instruct:free** (خوب برای فارسی)

### پولی ولی عالی:
- **anthropic/claude-3-haiku** (بهترین کیفیت)
- **anthropic/claude-3.5-sonnet** (قوی‌ترین)

---

## 📝 تنظیمات محیطی

در فایل `.env` می‌تونی مدل رو تغییر بدی:

```env
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=google/gemini-2.0-flash-exp:free
```

---

## ✅ چک‌لیست نهایی

- [x] TTS API به نسخه جدید آپدیت شد
- [x] مدل AI به Gemini تغییر کرد (بدون تگ فکری)
- [x] فیلتر برای حذف متن‌های فکری اضافه شد
- [x] دیتابیس اختیاری شد (نباید مانع کار سیستم بشه)
- [x] Retry mechanism برای خطاهای شبکه اضافه شد
- [x] فایل‌های تست برای دیباگ آماده شدند

---

## 🚀 نحوه اجرا

```bash
cd "صدای رابین"
npm run dev
```

سیستم باید الان بدون مشکل کار کنه! 🎉

اگر هنوز مشکلی هست:
1. اول `test-all-systems.js` رو اجرا کن
2. اگر OpenRouter کار نکرد، `test-models.js` رو اجرا کن
3. اگر TTS کار نکرد، `test-tts-new.js` رو اجرا کن
