#!/bin/bash

# 🧪 اسکریپت تست سریع Rabin Voice

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست سریع Rabin Voice"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. بررسی کانتینر
echo "1️⃣ بررسی کانتینر Rabin Voice..."
if docker ps | grep -q "rabin"; then
    CONTAINER_NAME=$(docker ps --format '{{.Names}}' | grep rabin | head -1)
    echo "✅ کانتینر در حال اجراست: $CONTAINER_NAME"
    
    # بررسی وضعیت
    STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER_NAME)
    echo "   وضعیت: $STATUS"
    
    # بررسی health
    HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "no-healthcheck")
    echo "   سلامت: $HEALTH"
else
    echo "❌ کانتینر Rabin Voice یافت نشد!"
    exit 1
fi

echo ""

# 2. بررسی Port
echo "2️⃣ بررسی Port..."
PORT=$(docker exec $CONTAINER_NAME env | grep "^PORT=" | cut -d'=' -f2)
if [ "$PORT" = "3001" ]; then
    echo "✅ Port درست است: $PORT"
else
    echo "❌ Port اشتباه است: $PORT (باید 3001 باشد)"
fi

echo ""

# 3. بررسی API Key
echo "3️⃣ بررسی API Key..."
API_KEY=$(docker exec $CONTAINER_NAME env | grep "OPENROUTER_API_KEY" | cut -d'=' -f2)
if [ -n "$API_KEY" ] && [ "$API_KEY" != "your_openrouter_api_key_here" ]; then
    echo "✅ API Key تنظیم شده است"
    echo "   Key: ${API_KEY:0:20}..."
else
    echo "❌ API Key تنظیم نشده یا placeholder است"
fi

echo ""

# 4. بررسی Model
echo "4️⃣ بررسی Model..."
MODEL=$(docker exec $CONTAINER_NAME env | grep "OPENROUTER_MODEL" | cut -d'=' -f2)
if [ -n "$MODEL" ]; then
    echo "✅ Model: $MODEL"
else
    echo "⚠️  Model تنظیم نشده"
fi

echo ""

# 5. تست اتصال داخلی
echo "5️⃣ تست اتصال داخلی (از داخل کانتینر)..."
if docker exec $CONTAINER_NAME wget -q -O- http://127.0.0.1:3001/rabin-voice/ > /dev/null 2>&1; then
    echo "✅ سرویس از داخل کانتینر پاسخ می‌دهد"
else
    echo "❌ سرویس از داخل کانتینر پاسخ نمی‌دهد"
fi

echo ""

# 6. تست اتصال از host
echo "6️⃣ تست اتصال از host..."
if curl -f -s http://localhost:3001/rabin-voice/ > /dev/null 2>&1; then
    echo "✅ سرویس از host قابل دسترسی است"
else
    echo "⚠️  سرویس از host قابل دسترسی نیست (ممکن است port expose نشده باشد)"
fi

echo ""

# 7. تست اتصال از Nginx
echo "7️⃣ تست اتصال از Nginx..."
if docker exec crm_nginx wget -q -O- http://rabin-voice:3001/rabin-voice/ > /dev/null 2>&1; then
    echo "✅ Nginx می‌تواند به Rabin Voice متصل شود"
else
    echo "❌ Nginx نمی‌تواند به Rabin Voice متصل شود"
fi

echo ""

# 8. تست از طریق دامنه
echo "8️⃣ تست از طریق دامنه..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://crm.robintejarat.com/rabin-voice/ 2>/dev/null)
if [ "$RESPONSE" = "200" ]; then
    echo "✅ دامنه پاسخ می‌دهد (HTTP $RESPONSE)"
elif [ "$RESPONSE" = "308" ] || [ "$RESPONSE" = "301" ]; then
    echo "⚠️  دامنه redirect می‌کند (HTTP $RESPONSE)"
else
    echo "❌ دامنه پاسخ نمی‌دهد یا خطا دارد (HTTP $RESPONSE)"
fi

echo ""

# 9. بررسی لاگ‌های اخیر
echo "9️⃣ لاگ‌های اخیر (10 خط آخر)..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs $CONTAINER_NAME --tail=10
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "✅ تست کامل شد!"