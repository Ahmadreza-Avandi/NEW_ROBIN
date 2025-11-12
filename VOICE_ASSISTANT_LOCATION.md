# 🎤 راهنمای سیستم صوتی رابین در CRM

## 📍 مکان‌یابی کامپوننت‌های صوتی

### 🔍 جستجو انجام شد:
- ✅ API Routes بررسی شد
- ✅ Components بررسی شد
- ✅ Dashboard بررسی شد

## 📂 ساختار فایل‌های موجود

### 1. API Routes (Backend)

#### 📁 app/api/voice-assistant/
```
app/api/voice-assistant/
├── ai/
│   └── route.ts          ✅ پردازش متن و AI
└── tts/
    └── route.ts          ✅ تبدیل متن به صدا
```

#### 📁 app/api/rabin-voice/
```
app/api/rabin-voice/
├── ai/                   ⚠️ خالی است
└── tts/                  ⚠️ خالی است
```

### 2. قابلیت‌های موجود

#### ✅ Voice Assistant AI (app/api/voice-assistant/ai/route.ts)
**وظایف:**
- پردازش متن کاربر
- استخراج کلمات کلیدی
- جستجو در دیتابیس CRM
- تولید پاسخ هوشمند با AI
- حفظ تاریخچه گفتگو

**ویژگی‌ها:**
- اتصال به OpenRouter AI
- پشتیبانی از Claude 3 Haiku
- استخراج داده از دیتابیس
- Context-aware responses
- History management

**Endpoints:**
```
POST /api/voice-assistant/ai
Body: {
  "userMessage": "متن کاربر",
  "history": [...]
}
```

#### ✅ Text-to-Speech (app/api/voice-assistant/tts/route.ts)
**وظایف:**
- تبدیل متن فارسی به صدا
- استفاده از API خارجی
- مدیریت timeout و خطاها

**API استفاده شده:**
```
https://api.ahmadreza-avandi.ir/text-to-speech
```

**Endpoints:**
```
POST /api/voice-assistant/tts
Body: {
  "text": "متن برای تبدیل به صدا"
}

GET /api/voice-assistant/tts
Response: Health check
```

### 3. تنظیمات محیطی (.env)

```bash
# AI Configuration
RABIN_VOICE_OPENROUTER_API_KEY=.
RABIN_VOICE_OPENROUTER_MODEL=.
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO

# Audio Settings
AUDIO_ENABLED=false
VPS_MODE=true
FALLBACK_TO_MANUAL_INPUT=true
```

## ❌ کامپوننت‌های UI یافت نشد

### جستجوهای انجام شده:
```bash
# جستجو برای کامپوننت‌های صوتی
❌ voice|Voice|VOICE
❌ rabin|Rabin|RABIN
❌ VoiceAssistant
❌ Audio|Microphone
❌ صوت|صوتی|رابین
```

### نتیجه:
**هیچ کامپوننت UI برای سیستم صوتی در dashboard یافت نشد!**

## 🔧 وضعیت فعلی

### ✅ موجود:
1. Backend API برای AI
2. Backend API برای TTS
3. پردازش متن و استخراج داده
4. اتصال به OpenRouter
5. اتصال به TTS API

### ❌ ناموجود:
1. کامپوننت UI در dashboard
2. دکمه میکروفون
3. رابط کاربری صوتی
4. Speech-to-Text (STT)
5. Audio player component

## 💡 تحلیل

### احتمال 1: UI در پروژه جداگانه
ممکن است رابط کاربری صوتی در یک پروژه جداگانه باشد که در nginx به عنوان `/rabin-voice` تنظیم شده:

```nginx
# از nginx/default.conf
location /rabin-voice {
    proxy_pass http://rabin-voice:3001;
    ...
}
```

**نکته:** این service در docker-compose.yml فعلی وجود ندارد!

### احتمال 2: UI هنوز پیاده‌سازی نشده
Backend آماده است اما Frontend هنوز ساخته نشده.

### احتمال 3: UI در فایل‌های دیگر
ممکن است در:
- `components/` directory
- `lib/` directory
- یک repository جداگانه

## 🚀 برای فعال‌سازی کامل سیستم صوتی

### مراحل لازم:

#### 1. بررسی پروژه Rabin Voice جداگانه
```bash
# آیا پروژه‌ای با نام rabin-voice وجود دارد؟
ls -la ../rabin-voice/
```

#### 2. اگر پروژه جداگانه وجود دارد:
```yaml
# اضافه کردن به docker-compose.yml
services:
  rabin-voice:
    build: ../rabin-voice
    container_name: rabin-voice
    ports:
      - "3001:3001"
    environment:
      - NEXT_PUBLIC_API_URL=http://nextjs:3000
    networks:
      - crm-network
```

#### 3. اگر UI وجود ندارد، باید ساخته شود:

**کامپوننت‌های مورد نیاز:**
- `VoiceAssistantButton.tsx` - دکمه میکروفون
- `VoiceChat.tsx` - رابط گفتگوی صوتی
- `AudioRecorder.tsx` - ضبط صدا
- `AudioPlayer.tsx` - پخش پاسخ صوتی

**مثال ساده:**
```tsx
// components/VoiceAssistant.tsx
'use client';

import { useState } from 'react';

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const handleVoiceInput = async (text: string) => {
    // ارسال به API
    const response = await fetch('/api/voice-assistant/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userMessage: text,
        history: []
      })
    });
    
    const data = await response.json();
    
    // تبدیل پاسخ به صدا
    const ttsResponse = await fetch('/api/voice-assistant/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: data.response })
    });
    
    const audioData = await ttsResponse.json();
    // پخش صدا
    const audio = new Audio(audioData.audioUrl);
    audio.play();
  };
  
  return (
    <div>
      <button onClick={() => setIsListening(!isListening)}>
        🎤 {isListening ? 'در حال گوش دادن...' : 'شروع گفتگو'}
      </button>
    </div>
  );
}
```

## 📋 چک‌لیست برای فعال‌سازی

- [ ] بررسی وجود پروژه rabin-voice جداگانه
- [ ] بررسی components/ برای UI صوتی
- [ ] بررسی lib/ برای helper functions
- [ ] تست API های موجود
- [ ] ساخت UI در صورت نبود
- [ ] اضافه کردن Speech-to-Text
- [ ] تست کامل سیستم

## 🧪 تست API های موجود

### تست AI:
```bash
curl -X POST http://localhost:3000/api/voice-assistant/ai \
  -H "Content-Type: application/json" \
  -d '{
    "userMessage": "چند مشتری دارم؟",
    "history": []
  }'
```

### تست TTS:
```bash
curl -X POST http://localhost:3000/api/voice-assistant/tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "سلام، من رابین هستم"
  }'
```

### Health Check:
```bash
curl http://localhost:3000/api/voice-assistant/tts
```

## 📞 نتیجه‌گیری

### ✅ Backend آماده است:
- API های AI و TTS کار می‌کنند
- اتصال به OpenRouter و TTS API برقرار است
- پردازش متن و استخراج داده فعال است

### ❌ Frontend یافت نشد:
- هیچ کامپوننت UI در dashboard نیست
- احتمالاً در پروژه جداگانه یا هنوز ساخته نشده

### 💡 توصیه:
1. بررسی کنید آیا پروژه `rabin-voice` جداگانه وجود دارد
2. اگر وجود دارد، آن را به docker-compose اضافه کنید
3. اگر وجود ندارد، UI را در dashboard ایجاد کنید

---

**آخرین بررسی:** $(date)
**وضعیت Backend:** ✅ Ready
**وضعیت Frontend:** ❌ Not Found
