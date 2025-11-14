#!/bin/bash

# 🧪 تست AI API
# این اسکریپت AI API را تست می‌کند

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست AI API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی .env
echo "1️⃣ بررسی تنظیمات .env..."
if grep -q "RABIN_VOICE_OPENROUTER_API_KEY=sk-or-v1" .env; then
    echo "✅ API Key تنظیم شده"
else
    echo "❌ API Key تنظیم نشده"
    exit 1
fi

if grep -q "RABIN_VOICE_OPENROUTER_MODEL=openai/gpt-oss-120b" .env; then
    echo "✅ Model تنظیم شده"
else
    echo "❌ Model تنظیم نشده"
    exit 1
fi

echo ""
echo "2️⃣ تست مستقیم OpenRouter API..."

API_KEY=$(grep "RABIN_VOICE_OPENROUTER_API_KEY" .env | cut -d= -f2)
MODEL=$(grep "RABIN_VOICE_OPENROUTER_MODEL" .env | cut -d= -f2)

echo "🔑 API Key: ${API_KEY:0:20}..."
echo "🤖 Model: $MODEL"

RESPONSE=$(curl -s -X POST https://openrouter.ai/api/v1/chat/completions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -H "HTTP-Referer: http://localhost:3000" \
  -H "X-Title: Rabin CRM Test" \
  -d '{
    "model": "'"$MODEL"'",
    "messages": [
      {"role": "system", "content": "تو یک دستیار هوشمند هستی."},
      {"role": "user", "content": "سلام"}
    ],
    "max_tokens": 100
  }' \
  -w "\nHTTP_CODE:%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
RESPONSE_BODY=$(echo "$RESPONSE" | sed '/HTTP_CODE/d')

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ OpenRouter API پاسخ داد (HTTP $HTTP_CODE)"
    echo "📋 Response:"
    echo "$RESPONSE_BODY" | head -c 500
    echo ""
else
    echo "❌ OpenRouter API خطا داد (HTTP $HTTP_CODE)"
    echo "📋 Error Response:"
    echo "$RESPONSE_BODY"
    echo ""
    echo "💡 احتمالات:"
    echo "   - API Key اشتباه است"
    echo "   - Model در دسترس نیست"
    echo "   - Credit تمام شده"
    echo "   - Rate limit"
fi

echo ""
echo "3️⃣ تست NextJS AI API..."

# تشخیص فایل docker-compose
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "⚠️  فایل docker-compose یافت نشد - تست local"
    COMPOSE_FILE=""
fi

if [ -n "$COMPOSE_FILE" ] && docker-compose -f $COMPOSE_FILE ps nextjs | grep -q "Up"; then
    echo "✅ NextJS در حال اجراست"
    
    echo "📤 ارسال درخواست تست..."
    NEXTJS_RESPONSE=$(curl -s -X POST http://localhost:3000/api/voice-assistant/ai \
      -H "Content-Type: application/json" \
      -H "X-Tenant-Key: rabin" \
      -d '{
        "userMessage": "سلام",
        "history": []
      }' \
      -w "\nHTTP_CODE:%{http_code}")
    
    NEXTJS_HTTP_CODE=$(echo "$NEXTJS_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
    NEXTJS_BODY=$(echo "$NEXTJS_RESPONSE" | sed '/HTTP_CODE/d')
    
    echo ""
    if [ "$NEXTJS_HTTP_CODE" = "200" ]; then
        echo "✅ NextJS AI API کار می‌کند (HTTP $NEXTJS_HTTP_CODE)"
        echo "📋 Response:"
        echo "$NEXTJS_BODY" | head -c 300
    else
        echo "❌ NextJS AI API خطا داد (HTTP $NEXTJS_HTTP_CODE)"
        echo "📋 Error:"
        echo "$NEXTJS_BODY"
        
        echo ""
        echo "🔍 بررسی لاگ‌های NextJS:"
        docker-compose -f $COMPOSE_FILE logs nextjs | grep -i "voice ai\|openrouter\|error" | tail -20
    fi
else
    echo "⚠️  NextJS در حال اجرا نیست - تست نشد"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ تست کامل شد"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
