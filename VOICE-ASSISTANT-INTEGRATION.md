# 🎤 راهنمای کامل پیاده‌سازی صدای رابین در CRM

## ✅ کارهای انجام شده

### 1. اصلاح فیلتر Tenant
- ✅ `app/api/customers/route.ts` - اضافه شدن فیلتر tenant_key
- ✅ `app/api/tasks/route.ts` - اضافه شدن فیلتر tenant_key
- ✅ `app/api/activities/route.ts` - اضافه شدن فیلتر tenant_key
- ✅ `app/api/tenant/dashboard/route.ts` - اضافه شدن فیلتر tenant_key

### 2. اضافه کردن صدای رابین به سایدبار
- ✅ `components/layout/dashboard-sidebar.tsx` - اضافه شدن منوی "صدای رابین"
- ✅ مسیر: `/[tenant_key]/dashboard/voice-assistant`

### 3. ایجاد صفحه صدای رابین
- ✅ `app/[tenant_key]/dashboard/voice-assistant/page.tsx` - صفحه کامل با UI

### 4. کپی فایل‌های صدای رابین
- ✅ `lib/voice-assistant/keywordDetector.ts` - تشخیص کلمات کلیدی
- ✅ `lib/voice-assistant/database.ts` - اتصال به دیتابیس با فیلتر tenant

### 5. اسکریپت اصلاح دیتابیس
- ✅ `scripts/fix-tenant-data.js` - اصلاح tenant_key در دیتابیس

## 🔧 کارهای باقی‌مانده

### 1. ایجاد API Routes برای صدای رابین

باید این فایل‌ها ایجاد شوند:

#### `app/api/voice-assistant/ai/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { processUserText, formatDataForAI } from '@/lib/voice-assistant/keywordDetector';

export async function POST(req: NextRequest) {
  try {
    const { userMessage, history } = await req.json();
    const tenantKey = req.headers.get('X-Tenant-Key') || 'rabin';

    // پردازش متن کاربر و دریافت داده‌ها
    const dbResults = await processUserText(userMessage, tenantKey);

    // فرمت کردن داده‌ها برای AI
    let contextData = '';
    if (dbResults.hasKeywords && dbResults.results) {
      contextData = formatDataForAI(dbResults.results);
    }

    // ارسال به OpenRouter AI
    const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'system',
            content: `تو رابین هستی، دستیار هوشمند CRM. ${contextData ? `\n\nداده‌های دیتابیس:\n${contextData}` : ''}`
          },
          ...history.map((h: any) => ([
            { role: 'user', content: h.user },
            { role: 'assistant', content: h.robin }
          ])).flat(),
          { role: 'user', content: userMessage }
        ]
      })
    });

    const aiData = await aiResponse.json();
    const response = aiData.choices[0]?.message?.content || 'متاسفانه نتوانستم پاسخ مناسبی تولید کنم.';

    return NextResponse.json({
      success: true,
      response,
      hasData: dbResults.hasKeywords,
      dataCount: dbResults.results?.length || 0
    });

  } catch (error: any) {
    console.error('AI API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

#### `app/api/voice-assistant/tts/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { success: false, error: 'متن الزامی است' },
        { status: 400 }
      );
    }

    // ارسال به سرویس TTS
    const ttsResponse = await fetch(process.env.RABIN_VOICE_TTS_API_URL || 'https://api.ahmadreza-avandi.ir/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text })
    });

    if (!ttsResponse.ok) {
      throw new Error('خطا در سرویس TTS');
    }

    const audioBlob = await ttsResponse.blob();
    const buffer = Buffer.from(await audioBlob.arrayBuffer());
    const base64 = buffer.toString('base64');

    return NextResponse.json({
      success: true,
      base64,
      audioUrl: `data:audio/wav;base64,${base64}`
    });

  } catch (error: any) {
    console.error('TTS API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

### 2. اصلاح فایل .env

اضافه کردن این متغیرها:

```env
# صدای رابین
RABIN_VOICE_OPENROUTER_API_KEY=your_key_here
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO
```

### 3. اجرای اسکریپت اصلاح دیتابیس

```bash
# اصلاح فایل برای ES Module
node scripts/fix-tenant-data.js
```

### 4. تست عملکرد

1. لاگین به: `http://localhost:3000/rabin/login`
2. رفتن به: `/rabin/dashboard/voice-assistant`
3. کلیک روی "فعال‌سازی صدا"
4. کلیک روی "شروع گفتگو"
5. گفتن: "چند تا مشتری داریم؟"

## 📋 چک‌لیست نهایی

### Backend
- [ ] ایجاد `app/api/voice-assistant/ai/route.ts`
- [ ] ایجاد `app/api/voice-assistant/tts/route.ts`
- [ ] اضافه کردن متغیرهای محیطی به `.env`
- [ ] اجرای `node scripts/fix-tenant-data.js`

### Frontend
- [x] صفحه voice-assistant ایجاد شد
- [x] منوی سایدبار اضافه شد
- [x] UI کامل پیاده‌سازی شد

### Database
- [x] فیلتر tenant_key در API ها اضافه شد
- [ ] اجرای اسکریپت اصلاح داده‌ها
- [ ] تست query ها با tenant_key

## 🐛 عیب‌یابی

### مشکل: داده‌های tenant دیگر نمایش داده می‌شود

```bash
# اجرای اسکریپت اصلاح
node scripts/fix-tenant-data.js

# بررسی دستی
mysql -u root -e "SELECT tenant_key, COUNT(*) FROM crm_system.customers GROUP BY tenant_key;"
```

### مشکل: صدای رابین کار نمی‌کند

1. بررسی `.env` - آیا `RABIN_VOICE_OPENROUTER_API_KEY` تنظیم شده؟
2. بررسی console - آیا خطایی وجود دارد؟
3. تست API: `curl http://localhost:3000/api/voice-assistant/ai`

### مشکل: ES Module Error در اسکریپت

فایل `scripts/fix-tenant-data.js` باید با `import` شروع شود نه `require`.

## 📝 نکات مهم

1. **Tenant Key**: همیشه از header `X-Tenant-Key` استفاده کنید
2. **Database Queries**: همه query ها باید `tenant_key = ?` داشته باشند
3. **API Keys**: کلیدهای OpenRouter را در `.env` قرار دهید
4. **TTS Service**: سرویس TTS باید در دسترس باشد

## 🚀 مراحل نهایی

1. ایجاد API routes (ai و tts)
2. اضافه کردن API keys به `.env`
3. اجرای اسکریپت اصلاح دیتابیس
4. تست کامل سیستم

---

**تاریخ:** 2025-01-07
**وضعیت:** 70% کامل شده
**باقی‌مانده:** API routes و تست نهایی
