# 🏗️ تحلیل معماری پروژه صدای رابین

## 📋 خلاصه پروژه

این پروژه یک دستیار صوتی هوشمند است که از **دو سیستم موازی** استفاده می‌کند:

1. **Next.js 14** (App Router) - Frontend + API Routes
2. **Express.js** - Backend API Server (Legacy)

---

## 🔄 معماری فعلی

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│                    (React Components)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├─────────────────────────────────────────┐
                     │                                         │
         ┌───────────▼──────────┐              ┌──────────────▼─────────┐
         │   Next.js API Routes │              │   Express.js Server    │
         │   (Port 3001)        │              │   (Port 3001)          │
         │                      │              │                        │
         │  /rabin-voice/api/   │              │  /api/                 │
         │  ├─ ai               │              │  ├─ ai                 │
         │  ├─ tts              │              │  ├─ tts/convert        │
         │  ├─ audio-proxy      │              │  ├─ tts/stream         │
         │  └─ database         │              │  └─ database           │
         └──────────┬───────────┘              └────────┬───────────────┘
                    │                                   │
                    │                                   │
         ┌──────────▼──────────┐              ┌────────▼───────────────┐
         │  TTS API (NEW)      │              │  TTS API (OLD)         │
         │  ahmadreza-avandi   │              │  ahmadreza-avandi      │
         │  ✅ WORKING         │              │  ✅ WORKING            │
         └─────────────────────┘              └────────────────────────┘
```

---

## 📁 ساختار فایل‌ها

### Next.js Structure
```
صدای رابین/
├── app/
│   ├── api/
│   │   ├── ai/route.ts           # OpenRouter AI integration
│   │   ├── tts/route.ts          # Text-to-Speech (FIXED ✅)
│   │   ├── audio-proxy/route.ts  # Audio file proxy
│   │   └── database/route.ts     # Database queries
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── VoiceAssistant.tsx        # Main voice UI
│   ├── MicrophoneButton.tsx
│   └── ChatHistory.tsx
├── utils/
│   ├── api.ts                    # API client (basePath: /rabin-voice)
│   ├── speech.ts                 # Speech recognition & TTS
│   ├── audioPlayer.ts
│   └── storage.ts
├── lib/
│   ├── database.ts               # MySQL connection pool
│   └── keywordDetector.ts
└── contexts/
    └── RobinContext.tsx
```

### Express.js Structure (Legacy)
```
api/
├── index.js                      # Express server
├── routes/
│   ├── ai.js                     # OpenRouter integration
│   ├── tts.js                    # TTS with proxy (WORKING ✅)
│   └── database.js               # Database queries
├── services/
│   ├── database.js
│   └── keywordDetector.js
└── utils/
    ├── logger.js
    └── actions.js
```

---

## 🔧 تنظیمات مهم

### 1. Next.js Configuration (`next.config.js`)
```javascript
{
  basePath: '/rabin-voice',
  assetPrefix: '/rabin-voice',
  output: 'standalone',
  trailingSlash: false
}
```

### 2. Environment Variables (`.env`)
```bash
OPENROUTER_API_KEY=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
OPENROUTER_MODEL=anthropic/claude-3-haiku
TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
PORT=3001
LOG_LEVEL=INFO
```

### 3. Database Configuration (`lib/database.ts`)
```typescript
{
  host: "181.41.194.136",
  database: "crm_system",
  user: "crm_app_user",
  password: "Ahmad.1386",
  charset: 'utf8mb4',
  connectionLimit: 10
}
```

---

## 🎯 API Endpoints

### Next.js API Routes (در حال استفاده ✅)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/rabin-voice/api/ai` | POST | AI conversation | ✅ Working |
| `/rabin-voice/api/tts` | POST | Text-to-Speech | ✅ FIXED |
| `/rabin-voice/api/audio-proxy` | GET | Audio file proxy | ✅ Working |
| `/rabin-voice/api/database` | POST | Database queries | ✅ Working |

### Express.js API Routes (Legacy - غیرفعال)

| Endpoint | Method | Description | Status |
|----------|--------|-------------|--------|
| `/api/ai` | POST | AI conversation | ⚠️ Not used |
| `/api/tts/convert` | POST | Text-to-Speech | ⚠️ Not used |
| `/api/tts/stream` | GET | Audio streaming | ⚠️ Not used |
| `/api/database` | POST | Database queries | ⚠️ Not used |

---

## 🔍 مشکلات پیدا شده و رفع شده

### ❌ مشکل 1: TTS API اشتباه
**قبل:**
```typescript
// app/api/tts/route.ts
const ttsUrl = 'https://partai.gw.isahab.ir/TextToSpeech/v1/speech-synthesys';
const requestBody = {
  data: processedText,  // ❌ Wrong field name
  filePath: "true",
  base64: "0",
  checksum: "1",
  speaker: "3"
};
```

**بعد:**
```typescript
// app/api/tts/route.ts
const ttsUrl = 'https://api.ahmadreza-avandi.ir/text-to-speech';
const requestBody = {
  text: processedText,  // ✅ Correct field name
  speaker: "3",
  checksum: "1",
  filePath: "true",
  base64: "0"
};
```

### ❌ مشکل 2: Audio Proxy URL بدون basePath
**قبل:**
```typescript
const audioUrl = '/api/audio-proxy?url=...';  // ❌ Missing basePath
```

**بعد:**
```typescript
const audioUrl = '/rabin-voice/api/audio-proxy?url=...';  // ✅ With basePath
```

### ❌ مشکل 3: Direct URL بدون Protocol
**قبل:**
```typescript
const audioUrl = `/rabin-voice/api/audio-proxy?url=${encodeURIComponent(filePath)}`;
// اگر filePath بدون http باشه، proxy کار نمی‌کنه
```

**بعد:**
```typescript
const directUrl = filePath.startsWith('http') ? filePath : `https://${filePath}`;
const audioUrl = `/rabin-voice/api/audio-proxy?url=${encodeURIComponent(directUrl)}`;
```

---

## 📊 TTS API Response Structure

### API Response Format
```json
{
  "data": {
    "status": "success",
    "data": {
      "filePath": "api.ahmadreza-avandi.ir/storage/audio/file.mp3",
      "checksum": "abc123...",
      "base64": null
    }
  }
}
```

### Processing Flow
```
1. Client sends text → /rabin-voice/api/tts
2. Next.js calls → https://api.ahmadreza-avandi.ir/text-to-speech
3. TTS API returns → filePath
4. Next.js creates proxy URL → /rabin-voice/api/audio-proxy?url=...
5. Client plays audio through proxy
```

---

## 🚀 Deployment

### Docker Container
```bash
Container Name: crm_rabin_voice
Port: 3001
Base Path: /rabin-voice
Production URL: https://crm.robintejarat.com/rabin-voice
```

### Nginx Configuration
```nginx
location /rabin-voice/ {
    proxy_pass http://localhost:3001/rabin-voice/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 🧪 Testing

### Test Scripts Created

1. **test-endpoints.sh** - Test all API endpoints
2. **test-tts-connection.sh** - Diagnose TTS connectivity
3. **quick-update.sh** - Fast rebuild without full stack restart

### Manual Testing
```bash
# Test TTS endpoint
curl -X POST https://crm.robintejarat.com/rabin-voice/api/tts \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام"}'

# Test audio proxy
curl -I "https://crm.robintejarat.com/rabin-voice/api/audio-proxy?url=..."

# Test database
curl -X POST https://crm.robintejarat.com/rabin-voice/api/database \
  -H "Content-Type: application/json" \
  -d '{"action":"getEmployees"}'
```

---

## 📝 توصیه‌های بهبود

### 1. حذف Express.js (اختیاری)
چون همه چیز در Next.js کار می‌کنه، می‌تونیم Express.js رو حذف کنیم:
- کاهش پیچیدگی
- کاهش حجم Docker image
- یک سیستم واحد برای نگهداری

### 2. Error Handling بهتر
```typescript
// Add retry mechanism
const maxRetries = 3;
for (let i = 0; i < maxRetries; i++) {
  try {
    const response = await fetch(ttsUrl, ...);
    break;
  } catch (error) {
    if (i === maxRetries - 1) throw error;
    await sleep(1000 * (i + 1));
  }
}
```

### 3. Caching
```typescript
// Cache TTS responses
const cacheKey = `tts:${hash(text)}`;
const cached = await redis.get(cacheKey);
if (cached) return cached;
```

### 4. Monitoring
```typescript
// Add metrics
console.log('📊 TTS Metrics:', {
  duration: Date.now() - startTime,
  textLength: text.length,
  success: true
});
```

---

## 🔐 Security Notes

1. **API Keys**: در `.env` نگهداری می‌شن (✅)
2. **Database Credentials**: در کد هاردکد شدن (⚠️ باید به .env منتقل بشن)
3. **CORS**: Audio proxy با `Access-Control-Allow-Origin: *` (⚠️ باید محدود بشه)

### پیشنهاد: Database Config در .env
```bash
# .env
DB_HOST=181.41.194.136
DB_NAME=crm_system
DB_USER=crm_app_user
DB_PASSWORD=Ahmad.1386
```

```typescript
// lib/database.ts
const DB_CONFIG = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  charset: 'utf8mb4'
};
```

---

## 📚 Dependencies

### Main Dependencies
```json
{
  "next": "14.x",
  "react": "18.x",
  "mysql2": "^3.x",
  "express": "^4.x",
  "axios": "^1.x"
}
```

### TTS Integration
- **Provider**: Custom API (ahmadreza-avandi.ir)
- **Format**: MP3
- **Proxy**: Required for CORS
- **Timeout**: 30 seconds

---

## 🎯 Summary

### ✅ چیزهایی که کار می‌کنن:
- Next.js API Routes با basePath صحیح
- Audio Proxy با URL کامل
- Database connection pool
- AI integration با OpenRouter
- Speech recognition

### ✅ چیزهایی که فیکس شدن:
- TTS API endpoint (partai → ahmadreza-avandi)
- TTS request body structure (data → text)
- Audio proxy URL با basePath
- Direct URL با protocol

### 📋 کارهای باقی‌مانده:
- [ ] تست کامل روی سرور production
- [ ] حذف Express.js (اختیاری)
- [ ] انتقال DB credentials به .env
- [ ] محدود کردن CORS
- [ ] اضافه کردن caching
- [ ] اضافه کردن monitoring

---

## 🔗 مستندات مرتبط

- [DEPLOYMENT-CHECKLIST.md](./DEPLOYMENT-CHECKLIST.md)
- [DATABASE_INTEGRATION.md](./صدای رابین/DATABASE_INTEGRATION.md)
- [test-endpoints.sh](./test-endpoints.sh)
- [test-tts-connection.sh](./test-tts-connection.sh)

---

**آخرین بروزرسانی:** 2024
**وضعیت:** ✅ Ready for Production Testing