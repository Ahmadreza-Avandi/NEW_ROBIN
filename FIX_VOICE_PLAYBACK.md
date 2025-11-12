# 🔊 رفع مشکل پخش صدا در دستیار رابین

## 🎯 مشکل
صدا در alert نمایش داده می‌شود اما پخش نمی‌شود.

## 🔧 تغییرات اعمال شده

### 1. استفاده از Base64 برای قابلیت اطمینان بیشتر

**قبل:**
```typescript
const audioSrc = data.directUrl || data.audioUrl;
```

**بعد:**
```typescript
// اولویت: base64 > directUrl > audioUrl
if (data.base64) {
  audioSrc = `data:audio/mpeg;base64,${data.base64}`;
} else if (data.directUrl) {
  audioSrc = data.directUrl;
} else {
  audioSrc = data.audioUrl;
}
```

**چرا؟**
- Base64 مستقیماً در مرورگر کار می‌کند
- نیازی به CORS ندارد
- مشکل network را حل می‌کند

### 2. بهبود مدیریت CORS

**قبل:**
```typescript
audio.crossOrigin = 'anonymous';
```

**بعد:**
```typescript
// فقط برای URL های خارجی
if (!audioSrc.startsWith('data:')) {
  audio.crossOrigin = 'anonymous';
}
```

### 3. لاگ‌های بهتر برای Debug

اضافه شده:
- لاگ کامل خطاها
- نمایش نوع صدا (base64/directUrl/audioUrl)
- جزئیات بیشتر در console

---

## ⚡ اعمال تغییرات (بدون rebuild)

### روش 1: Restart سریع (توصیه می‌شود)

```bash
# روی سرور
chmod +x restart-nextjs.sh
./restart-nextjs.sh
```

**زمان:** 10-15 ثانیه

### روش 2: Restart دستی

```bash
# با docker-compose.deploy.yml
docker-compose -f docker-compose.deploy.yml restart nextjs

# یا با docker-compose.yml
docker-compose restart nextjs
```

### روش 3: Hot Reload (اگر در development mode هستید)

تغییرات خودکار اعمال می‌شوند، نیازی به restart نیست.

---

## 🧪 تست

### 1. باز کردن صفحه

```
https://crm.robintejarat.com/rabin/dashboard/voice-assistant
```

### 2. باز کردن Console (F12)

در Chrome/Firefox: `F12` → `Console`

### 3. شروع گفتگو

چیزی بگویید، مثلاً: "سلام"

### 4. بررسی لاگ‌ها

باید ببینید:
```
🎵 Attempt 1/3 - Requesting TTS for text length: 245
✅ TTS Response received: { audioUrl: "...", hasBase64: true }
🎵 Using base64 audio (most reliable)
🔊 Loading audio from: data:audio/mpeg;base64,...
✅ Audio loaded and ready to play
▶️ Starting audio playback...
✅ Audio playback completed
```

---

## 🐛 عیب‌یابی

### مشکل 1: هنوز صدا پخش نمی‌شود

**بررسی Console:**
```javascript
// چه خطایی می‌بینید؟
❌ Audio playback failed: ...
```

**راه‌حل‌های احتمالی:**

#### الف) مشکل CORS
```
Access to audio at '...' from origin '...' has been blocked by CORS policy
```

**راه‌حل:** استفاده از base64 (که الان اعمال شده)

#### ب) مشکل Format
```
Error: The element has no supported sources
```

**راه‌حل:** بررسی فرمت صدا در TTS API

#### ج) مشکل Autoplay
```
DOMException: play() failed because the user didn't interact with the document first
```

**راه‌حل:** کاربر باید ابتدا کلیک کند (که در کد شماست)

### مشکل 2: TTS API پاسخ نمی‌دهد

**بررسی:**
```bash
# تست مستقیم TTS API
curl -X POST https://api.ahmadreza-avandi.ir/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام","speaker":"3"}'
```

**اگر خطا داد:**
- بررسی کنید API در دسترس است
- بررسی کنید firewall مشکلی ندارد

### مشکل 3: صدا قطع می‌شود

**علت:** Timeout کوتاه

**راه‌حل:** در کد اعمال شده:
```typescript
const timeoutDuration = Math.max(45000, processedText.length * 100);
```

---

## 📊 مقایسه قبل و بعد

| ویژگی | قبل | بعد |
|-------|-----|-----|
| منبع صدا | فقط URL | Base64 (اولویت اول) |
| CORS | همیشه فعال | فقط برای URL |
| Debug | محدود | کامل |
| Retry | 3 بار | 3 بار (بهبود یافته) |
| Timeout | ثابت | پویا |

---

## 🔍 بررسی دقیق مشکل

### اگر هنوز کار نکرد:

#### 1. بررسی Response TTS API

در Console، بعد از گفتن چیزی:
```javascript
// باید ببینید:
✅ TTS Response received: {
  audioUrl: "https://...",
  directUrl: "https://...",
  base64: "UklGRi4...",  // ← این مهم است!
  hasBase64: true
}
```

**اگر `hasBase64: false` است:**
- TTS API base64 نمی‌فرستد
- باید از URL استفاده کنید
- ممکن است CORS مشکل داشته باشد

#### 2. تست دستی پخش صدا

در Console:
```javascript
// کپی audioUrl از response
const audio = new Audio('https://...');
audio.play();

// یا با base64:
const audio = new Audio('data:audio/mpeg;base64,UklGRi4...');
audio.play();
```

**اگر کار کرد:** مشکل در کد است  
**اگر کار نکرد:** مشکل در صدا یا مرورگر است

#### 3. بررسی مرورگر

```javascript
// آیا Audio API پشتیبانی می‌شود؟
console.log('Audio supported:', typeof Audio !== 'undefined');

// آیا AudioContext کار می‌کند؟
const ctx = new AudioContext();
console.log('AudioContext state:', ctx.state);
```

---

## 💡 نکات مهم

### 1. Base64 vs URL

**Base64 (توصیه می‌شود):**
- ✅ بدون CORS
- ✅ قابل اطمینان‌تر
- ❌ حجم بیشتر در response

**URL:**
- ✅ حجم کمتر
- ❌ نیاز به CORS
- ❌ ممکن است expire شود

### 2. Autoplay Policy

مرورگرها اجازه autoplay صدا را بدون تعامل کاربر نمی‌دهند.

**راه‌حل شما:** ✅ کاربر روی دکمه میکروفون کلیک می‌کند

### 3. HTTPS

صدا فقط در HTTPS کار می‌کند (یا localhost).

**وضعیت شما:** ✅ https://crm.robintejarat.com

---

## 📞 دستورات سریع

```bash
# Restart NextJS
./restart-nextjs.sh

# یا دستی:
docker-compose -f docker-compose.deploy.yml restart nextjs

# مشاهده لاگ‌ها
docker-compose -f docker-compose.deploy.yml logs -f nextjs

# تست TTS API
curl -X POST https://api.ahmadreza-avandi.ir/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام رابین","speaker":"3"}'
```

---

## ✅ چک‌لیست

پس از restart:

- [ ] صفحه را refresh کنید (Ctrl+F5)
- [ ] Console را باز کنید (F12)
- [ ] چیزی بگویید
- [ ] لاگ‌ها را بررسی کنید
- [ ] صدا باید پخش شود

اگر نشد:
- [ ] لاگ‌های خطا را کپی کنید
- [ ] Response TTS API را بررسی کنید
- [ ] تست دستی پخش صدا را انجام دهید

---

**زمان اعمال:** 10-15 ثانیه (فقط restart)  
**نیاز به rebuild:** خیر  
**Downtime:** خیلی کم (5-10 ثانیه)
