# نحوه استفاده از setup-env.sh بهبود یافته

## تغییرات اعمال شده:

### 1. تنظیمات تعاملی OpenRouter
اسکریپت حالا به صورت تعاملی از شما می‌پرسد:
- کلید API OpenRouter
- مدل مورد نظر (با گزینه‌های پیشنهادی)

### 2. مدل‌های پیشنهادی:
1. `google/gemini-2.0-flash-exp:free` - سریع، رایگان، بدون تگ فکری
2. `meta-llama/llama-3.2-3b-instruct:free` - سریع و کوچک
3. `anthropic/claude-3-haiku` - پولی ولی عالی
4. `z-ai/glm-4.5-air:free` - پیش‌فرض
5. مدل دلخواه خود

### 3. متغیرهای جدید در .env:
```bash
# AI Configuration
OPENROUTER_API_KEY=your_actual_api_key
OPENROUTER_MODEL=selected_model

# Rabin Voice (همان مقادیر)
RABIN_VOICE_OPENROUTER_API_KEY=your_actual_api_key
RABIN_VOICE_OPENROUTER_MODEL=selected_model
```

### 4. کد AI بهبود یافته:
```typescript
const AI_CONFIG = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || 's',
  OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || 'z-ai/glm-4.5-air:free'
};
```

## نحوه اجرا:
```bash
chmod +x setup-env.sh
./setup-env.sh
```

سپس:
1. کلید API خود را وارد کنید
2. مدل مورد نظر را انتخاب کنید
3. اسکریپت باقی تنظیمات را خودکار انجام می‌دهد

## مزایا:
- ✅ تنظیم خودکار کلید API و مدل
- ✅ گزینه‌های پیشنهادی برای مدل‌ها
- ✅ اعتبارسنجی ورودی‌ها
- ✅ نمایش اطلاعات تنظیم شده
- ✅ سازگاری با کد موجود