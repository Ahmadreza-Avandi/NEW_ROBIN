#!/bin/bash

# 🧪 تست دیپلوی دستیار صوتی رابین
# این اسکریپت وضعیت سرویس رابین را بررسی می‌کند

echo "🧪 تست دیپلوی دستیار صوتی رابین"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DOMAIN="${1:-crm.robintejarat.com}"
PROTOCOL="${2:-https}"

echo "🌐 دامنه: $DOMAIN"
echo "🔒 پروتکل: $PROTOCOL"
echo ""

# تابع برای چک کردن URL
check_url() {
    local url=$1
    local name=$2
    
    echo -n "🔍 چک کردن $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 10 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ OK (HTTP $response)"
        return 0
    elif [ "$response" = "000" ]; then
        echo "❌ FAILED (Connection timeout or refused)"
        return 1
    else
        echo "⚠️  WARNING (HTTP $response)"
        return 1
    fi
}

# تابع برای چک کردن Docker container
check_container() {
    local container_name=$1
    
    echo -n "🐳 چک کردن container $container_name... "
    
    if docker ps --format '{{.Names}}' | grep -q "^${container_name}$"; then
        status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
        health=$(docker inspect --format='{{.State.Health.Status}}' "$container_name" 2>/dev/null)
        
        if [ "$status" = "running" ]; then
            if [ "$health" = "healthy" ] || [ "$health" = "" ]; then
                echo "✅ Running"
                return 0
            else
                echo "⚠️  Running but unhealthy ($health)"
                return 1
            fi
        else
            echo "❌ Not running ($status)"
            return 1
        fi
    else
        echo "❌ Container not found"
        return 1
    fi
}

# مرحله 1: چک کردن Docker containers
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 مرحله 1: بررسی Docker Containers"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

check_container "crm-rabin-voice"
CONTAINER_STATUS=$?

check_container "crm-nextjs"
check_container "crm-nginx"
check_container "crm-mysql"

echo ""

# مرحله 2: چک کردن دایرکتری‌ها و فایل‌ها
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📁 مرحله 2: بررسی دایرکتری‌ها و فایل‌ها"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo -n "📁 دایرکتری logs... "
if [ -d "صدای رابین/logs" ]; then
    echo "✅ موجود"
    
    # چک کردن فایل‌های لاگ
    LOG_COUNT=$(ls "صدای رابین/logs"/*.log 2>/dev/null | wc -l)
    if [ "$LOG_COUNT" -gt 0 ]; then
        echo "   📄 تعداد فایل‌های لاگ: $LOG_COUNT"
        LATEST_LOG=$(ls -t "صدای رابین/logs"/*.log 2>/dev/null | head -1)
        LOG_SIZE=$(du -h "$LATEST_LOG" 2>/dev/null | cut -f1)
        echo "   📊 حجم آخرین لاگ: $LOG_SIZE"
    else
        echo "   ⚠️  هیچ فایل لاگی یافت نشد"
    fi
else
    echo "❌ یافت نشد"
fi

echo -n "📁 دایرکتری public... "
if [ -d "صدای رابین/public" ]; then
    echo "✅ موجود"
else
    echo "❌ یافت نشد"
fi

echo -n "📄 فایل .env... "
if [ -f ".env" ]; then
    echo "✅ موجود"
    
    # چک کردن متغیرهای مهم
    echo -n "   🔑 RABIN_VOICE_OPENROUTER_API_KEY... "
    if grep -q "RABIN_VOICE_OPENROUTER_API_KEY=" .env && ! grep -q "RABIN_VOICE_OPENROUTER_API_KEY=$" .env; then
        echo "✅ تنظیم شده"
    else
        echo "❌ تنظیم نشده"
    fi
else
    echo "❌ یافت نشد"
fi

echo ""

# مرحله 3: چک کردن endpoints
if [ "$CONTAINER_STATUS" -eq 0 ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🌐 مرحله 3: بررسی Endpoints"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # چک کردن از داخل container
    echo "🔍 چک کردن از داخل container..."
    
    echo -n "   📍 http://127.0.0.1:3001/rabin-voice... "
    docker exec crm-rabin-voice wget --spider -q http://127.0.0.1:3001/rabin-voice 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✅ OK"
    else
        echo "❌ FAILED"
    fi
    
    echo ""
    
    # چک کردن از خارج (اگر دامنه در دسترس باشد)
    if [ "$PROTOCOL" = "https" ] || [ "$PROTOCOL" = "http" ]; then
        echo "🔍 چک کردن از خارج..."
        
        check_url "$PROTOCOL://$DOMAIN/rabin-voice" "صفحه اصلی رابین"
        check_url "$PROTOCOL://$DOMAIN/rabin-voice/_next/static/css" "فایل‌های استاتیک"
        
        echo ""
    fi
else
    echo "⚠️  Container در حال اجرا نیست، تست endpoints انجام نمی‌شود"
    echo ""
fi

# مرحله 4: نمایش لاگ‌های اخیر
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 مرحله 4: لاگ‌های اخیر"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$CONTAINER_STATUS" -eq 0 ]; then
    echo "🐳 آخرین 10 خط لاگ Docker:"
    docker-compose logs --tail=10 rabin-voice
    
    echo ""
    
    LATEST_LOG=$(ls -t "صدای رابین/logs"/*.log 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ]; then
        echo "📁 آخرین 10 خط لاگ فایل:"
        tail -10 "$LATEST_LOG"
    fi
else
    echo "⚠️  Container در حال اجرا نیست"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ تست تمام شد!"
echo ""
echo "💡 دستورات مفید:"
echo "   docker-compose logs -f rabin-voice    # مشاهده لاگ‌های زنده"
echo "   ./view-rabin-logs.sh                  # مشاهده لاگ‌های فایل"
echo "   docker-compose restart rabin-voice    # ری‌استارت سرویس"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"