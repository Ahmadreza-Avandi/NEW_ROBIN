#!/bin/bash

# 📊 اسکریپت بررسی وضعیت صدای رابین

DOMAIN="crm.robintejarat.com"
VOICE_SUBDOMAIN="rabin-voice"
VOICE_PORT=3001

echo "📊 بررسی وضعیت صدای رابین"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 🐳 وضعیت کانتینرها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🐳 وضعیت کانتینرها:"
echo ""
docker-compose ps | grep -E "NAME|rabin-voice|nginx" || echo "   خطا در نمایش وضعیت"

# ═══════════════════════════════════════════════════════════════
# 🏥 بررسی سلامت
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🏥 بررسی سلامت کانتینرها:"
echo ""

# بررسی rabin-voice
RABIN_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' crm-rabin-voice 2>/dev/null || echo "unknown")
RABIN_STATUS=$(docker inspect --format='{{.State.Status}}' crm-rabin-voice 2>/dev/null || echo "not found")
echo "   📦 Rabin Voice:"
echo "      وضعیت: $RABIN_STATUS"
echo "      سلامت: $RABIN_HEALTH"

# بررسی nginx
NGINX_STATUS=$(docker inspect --format='{{.State.Status}}' crm-nginx 2>/dev/null || echo "not found")
echo ""
echo "   🌐 Nginx:"
echo "      وضعیت: $NGINX_STATUS"

# ═══════════════════════════════════════════════════════════════
# 🔌 بررسی پورت‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔌 بررسی پورت‌ها:"
echo ""

# بررسی پورت 3001
if nc -z localhost $VOICE_PORT 2>/dev/null; then
    echo "   ✅ پورت $VOICE_PORT (Rabin Voice): در دسترس"
else
    echo "   ❌ پورت $VOICE_PORT (Rabin Voice): در دسترس نیست"
fi

# بررسی پورت 80
if nc -z localhost 80 2>/dev/null; then
    echo "   ✅ پورت 80 (HTTP): در دسترس"
else
    echo "   ❌ پورت 80 (HTTP): در دسترس نیست"
fi

# بررسی پورت 443
if nc -z localhost 443 2>/dev/null; then
    echo "   ✅ پورت 443 (HTTPS): در دسترس"
else
    echo "   ❌ پورت 443 (HTTPS): در دسترس نیست"
fi

# ═══════════════════════════════════════════════════════════════
# 🔗 بررسی اتصال شبکه
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔗 بررسی اتصال شبکه داخلی:"
echo ""

# تست اتصال Nginx -> Rabin Voice
NETWORK_TEST=$(docker exec crm-nginx wget -q -O- --timeout=5 "http://rabin-voice:3001/rabin-voice" 2>/dev/null && echo "OK" || echo "FAIL")
if [ "$NETWORK_TEST" = "OK" ]; then
    echo "   ✅ Nginx -> Rabin Voice: موفق"
else
    echo "   ❌ Nginx -> Rabin Voice: ناموفق"
fi

# ═══════════════════════════════════════════════════════════════
# 🌐 بررسی دسترسی از خارج
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🌐 بررسی دسترسی از دامنه:"
echo ""

# تست HTTPS
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN/$VOICE_SUBDOMAIN" --max-time 10 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ https://$DOMAIN/$VOICE_SUBDOMAIN: در دسترس (HTTP $HTTP_CODE)"
    elif [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "   ⚠️  https://$DOMAIN/$VOICE_SUBDOMAIN: ریدایرکت (HTTP $HTTP_CODE)"
    else
        echo "   ❌ https://$DOMAIN/$VOICE_SUBDOMAIN: در دسترس نیست (HTTP $HTTP_CODE)"
    fi
else
    echo "   ℹ️  curl موجود نیست - تست دامنه انجام نشد"
fi

# ═══════════════════════════════════════════════════════════════
# 💾 استفاده از منابع
# ═══════════════════════════════════════════════════════════════

echo ""
echo "💾 استفاده از منابع:"
echo ""
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | grep -E "NAME|rabin-voice|nginx" || echo "   خطا در نمایش منابع"

# ═══════════════════════════════════════════════════════════════
# 📋 لاگ‌های اخیر
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📋 لاگ‌های اخیر (10 خط آخر):"
echo ""
echo "--- Rabin Voice ---"
docker-compose logs --tail=10 rabin-voice 2>/dev/null || echo "   خطا در نمایش لاگ"

# ═══════════════════════════════════════════════════════════════
# 📍 اطلاعات دسترسی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 اطلاعات دسترسی:"
echo ""
echo "   🌐 وب: https://$DOMAIN/$VOICE_SUBDOMAIN"
echo "   🔌 پورت محلی: http://localhost:$VOICE_PORT"
echo "   🔗 API: https://$DOMAIN/$VOICE_SUBDOMAIN/api/ai"
echo "   🎤 TTS API: https://$DOMAIN/$VOICE_SUBDOMAIN/api/tts"
echo ""
echo "📋 دستورات مفید:"
echo "   📊 مشاهده لاگ‌های زنده: ./logs-rabin-voice.sh"
echo "   🔄 ری‌استارت سریع: ./quick-restart-rabin-voice.sh"
echo "   🔨 ری‌استارت کامل: ./restart-rabin-voice.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"