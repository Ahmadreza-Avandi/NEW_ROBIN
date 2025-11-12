#!/bin/bash

# 🧪 تست کامل سیستم صوتی
# این اسکریپت تمام بخش‌های سیستم صوتی را تست می‌کند

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست کامل سیستم صوتی رابین"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص فایل docker-compose
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

echo "📋 استفاده از: $COMPOSE_FILE"
echo ""

# 1. تست TTS API خارجی
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣ تست TTS API خارجی"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

TTS_URL="https://api.ahmadreza-avandi.ir/text-to-speech"
echo "🌐 URL: $TTS_URL"
echo "📤 ارسال درخواست تست..."

TTS_RESPONSE=$(curl -s -X POST "$TTS_URL" \
  -H "Content-Type: application/json" \
  -d '{"text":"سلام این یک تست است","speaker":"3"}' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$TTS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$TTS_RESPONSE" | sed '/HTTP_CODE/d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ TTS API پاسخ داد (HTTP $HTTP_CODE)"
    
    # بررسی وجود base64
    if echo "$RESPONSE_BODY" | grep -q '"base64"'; then
        echo "✅ Response شامل base64 است"
    else
        echo "⚠️  Response شامل base64 نیست"
    fi
    
    # بررسی وجود audioUrl
    if echo "$RESPONSE_BODY" | grep -q '"audioUrl"'; then
        echo "✅ Response شامل audioUrl است"
    else
        echo "❌ Response شامل audioUrl نیست"
    fi
    
    # نمایش بخشی از response
    echo "📋 بخشی از Response:"
    echo "$RESPONSE_BODY" | head -c 200
    echo "..."
else
    echo "❌ TTS API خطا داد (HTTP $HTTP_CODE)"
    echo "📋 Response:"
    echo "$RESPONSE_BODY"
fi

echo ""

# 2. تست NextJS API
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣ تست NextJS TTS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی وضعیت NextJS
if docker-compose -f $COMPOSE_FILE ps nextjs | grep -q "Up"; then
    echo "✅ NextJS در حال اجراست"
    
    # تست health check
    echo "🔍 تست health check..."
    HEALTH_RESPONSE=$(curl -s http://localhost:3000/api/voice-assistant/tts)
    
    if echo "$HEALTH_RESPONSE" | grep -q '"success":true'; then
        echo "✅ TTS API endpoint سالم است"
        echo "📋 Response:"
        echo "$HEALTH_RESPONSE" | head -c 200
    else
        echo "⚠️  TTS API endpoint مشکل دارد"
        echo "📋 Response:"
        echo "$HEALTH_RESPONSE"
    fi
else
    echo "❌ NextJS در حال اجرا نیست"
fi

echo ""

# 3. بررسی فایل‌های کد
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣ بررسی فایل‌های کد"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی playAudio function
if grep -q "data:audio/mpeg;base64" "app/[tenant_key]/dashboard/voice-assistant/page.tsx"; then
    echo "✅ کد از base64 استفاده می‌کند"
else
    echo "⚠️  کد از base64 استفاده نمی‌کند"
fi

# بررسی عدم وجود alert
if grep -q "alert(" "app/[tenant_key]/dashboard/voice-assistant/page.tsx"; then
    echo "⚠️  کد شامل alert است"
else
    echo "✅ کد شامل alert نیست"
fi

# بررسی retry mechanism
if grep -q "retries = 3" "app/[tenant_key]/dashboard/voice-assistant/page.tsx"; then
    echo "✅ Retry mechanism فعال است (3 تلاش)"
else
    echo "⚠️  Retry mechanism یافت نشد"
fi

echo ""

# 4. بررسی لاگ‌های NextJS
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣ بررسی لاگ‌های اخیر NextJS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "📋 آخرین لاگ‌های مربوط به TTS:"
docker-compose -f $COMPOSE_FILE logs nextjs 2>/dev/null | grep -i "tts\|audio\|voice" | tail -10 || echo "   لاگی یافت نشد"

echo ""

# 5. خلاصه و توصیه‌ها
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه و توصیه‌ها"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "✅ اگر همه تست‌ها موفق بودند:"
echo "   1. Restart NextJS: ./restart-nextjs.sh"
echo "   2. صفحه را refresh کنید: Ctrl+F5"
echo "   3. Console را باز کنید: F12"
echo "   4. چیزی بگویید و لاگ‌ها را ببینید"
echo ""
echo "❌ اگر TTS API خطا داد:"
echo "   - بررسی کنید API در دسترس است"
echo "   - بررسی کنید firewall مشکلی ندارد"
echo "   - با تیم پشتیبانی API تماس بگیرید"
echo ""
echo "⚠️  اگر base64 در response نیست:"
echo "   - کد از directUrl یا audioUrl استفاده می‌کند"
echo "   - ممکن است CORS مشکل داشته باشد"
echo "   - نیاز به تنظیمات اضافی nginx دارد"
echo ""
echo "🔍 برای debug بیشتر:"
echo "   - لاگ‌های NextJS: docker-compose -f $COMPOSE_FILE logs -f nextjs"
echo "   - لاگ‌های nginx: docker-compose -f $COMPOSE_FILE logs -f nginx"
echo "   - Console مرورگر: F12 → Console"
echo ""
