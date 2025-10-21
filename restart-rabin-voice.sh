#!/bin/bash

# 🔄 اسکریپت ری‌استارت صدای رابین روی سرور
set -e

DOMAIN="crm.robintejarat.com"
VOICE_SUBDOMAIN="rabin-voice"
VOICE_PORT=3001
CONTAINER_NAME="crm-rabin-voice"

echo "🔄 شروع ری‌استارت صدای رابین..."
echo "🌐 دامنه: $DOMAIN/$VOICE_SUBDOMAIN"
echo "📦 کانتینر: $CONTAINER_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 🔍 مرحله 1: بررسی وضعیت فعلی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔍 مرحله 1: بررسی وضعیت فعلی..."

# بررسی وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker نصب نیست!"
    exit 1
fi

# بررسی وجود docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose نصب نیست!"
    exit 1
fi

# نمایش وضعیت کانتینرهای فعلی
echo "📊 وضعیت کانتینرهای فعلی:"
docker-compose ps | grep -E "rabin-voice|crm-app" || echo "   هیچ کانتینری یافت نشد"

# ═══════════════════════════════════════════════════════════════
# 🧹 مرحله 2: پاکسازی و آماده‌سازی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🧹 مرحله 2: پاکسازی cache..."

# پاکسازی cache های صدای رابین
cd "صدای رابین"
echo "🧹 پاکسازی .next و cache..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .swc 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true

# بررسی فایل .env
if [ ! -f ".env" ]; then
    echo "⚠️  فایل .env یافت نشد!"
    if [ -f ".env.example" ]; then
        echo "📋 کپی از .env.example..."
        cp .env.example .env
    else
        echo "❌ فایل .env.example هم یافت نشد!"
        exit 1
    fi
fi

# نمایش تنظیمات .env (بدون نمایش کلیدهای محرمانه)
echo "⚙️  تنظیمات .env:"
echo "   PORT: $(grep '^PORT=' .env | cut -d'=' -f2 || echo '3001')"
echo "   TTS_API_URL: $(grep '^TTS_API_URL=' .env | cut -d'=' -f2 || echo 'not set')"
echo "   OPENROUTER_MODEL: $(grep '^OPENROUTER_MODEL=' .env | cut -d'=' -f2 || echo 'not set')"

cd ..

# ═══════════════════════════════════════════════════════════════
# 🛑 مرحله 3: توقف کانتینرهای فعلی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🛑 مرحله 3: توقف کانتینرهای فعلی..."

# توقف کانتینر صدای رابین
echo "🛑 توقف کانتینر rabin-voice..."
docker-compose stop rabin-voice 2>/dev/null || echo "   کانتینر در حال اجرا نبود"

# حذف کانتینر قدیمی
echo "🗑️  حذف کانتینر قدیمی..."
docker-compose rm -f rabin-voice 2>/dev/null || echo "   کانتینر وجود نداشت"

# ═══════════════════════════════════════════════════════════════
# 🔨 مرحله 4: Build مجدد
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔨 مرحله 4: Build مجدد..."

# Build کانتینر جدید با --no-cache
echo "🔨 Build کانتینر rabin-voice (این ممکن است چند دقیقه طول بکشد)..."
docker-compose build --no-cache rabin-voice

# ═══════════════════════════════════════════════════════════════
# 🚀 مرحله 5: راه‌اندازی مجدد
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🚀 مرحله 5: راه‌اندازی مجدد..."

# راه‌اندازی کانتینر جدید
echo "🚀 راه‌اندازی کانتینر rabin-voice..."
docker-compose up -d rabin-voice

# صبر برای آماده شدن سرویس
echo "⏳ صبر برای آماده شدن سرویس (30 ثانیه)..."
sleep 30

# ═══════════════════════════════════════════════════════════════
# ✅ مرحله 6: بررسی وضعیت نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "✅ مرحله 6: بررسی وضعیت نهایی..."

# نمایش وضعیت کانتینر
echo "📊 وضعیت کانتینر:"
docker-compose ps rabin-voice

# نمایش لاگ‌های اخیر
echo ""
echo "📋 لاگ‌های اخیر (20 خط آخر):"
docker-compose logs --tail=20 rabin-voice

# بررسی سلامت سرویس
echo ""
echo "🏥 بررسی سلامت سرویس..."
HEALTH_CHECK=$(docker inspect --format='{{.State.Health.Status}}' $(docker-compose ps -q rabin-voice) 2>/dev/null || echo "unknown")
echo "   وضعیت سلامت: $HEALTH_CHECK"

# تست اتصال به پورت
echo ""
echo "🔌 تست اتصال به پورت $VOICE_PORT..."
if nc -z localhost $VOICE_PORT 2>/dev/null; then
    echo "   ✅ پورت $VOICE_PORT در دسترس است"
else
    echo "   ⚠️  پورت $VOICE_PORT در دسترس نیست (ممکن است هنوز در حال راه‌اندازی باشد)"
fi

# ═══════════════════════════════════════════════════════════════
# 🔄 مرحله 7: ری‌استارت Nginx (ضروری برای اتصال به دامنه)
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔄 مرحله 7: ری‌استارت Nginx (ضروری)..."

# بررسی وجود کانتینر nginx
NGINX_CONTAINER=$(docker ps --filter "name=crm-nginx" --format "{{.Names}}" 2>/dev/null || echo "")

if [ -n "$NGINX_CONTAINER" ]; then
    echo "🔄 ری‌استارت کانتینر Nginx: $NGINX_CONTAINER"
    docker-compose restart nginx
    
    # صبر برای آماده شدن Nginx
    echo "⏳ صبر برای آماده شدن Nginx (5 ثانیه)..."
    sleep 5
    
    # بررسی وضعیت Nginx
    if docker ps | grep -q "crm-nginx"; then
        echo "✅ Nginx با موفقیت ری‌استارت شد"
    else
        echo "⚠️  مشکل در ری‌استارت Nginx"
        docker-compose logs --tail=20 nginx
    fi
else
    echo "⚠️  کانتینر Nginx یافت نشد!"
    echo "📋 کانتینرهای در حال اجرا:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    
    # تلاش برای راه‌اندازی Nginx
    echo ""
    echo "🚀 تلاش برای راه‌اندازی Nginx..."
    docker-compose up -d nginx
    sleep 5
fi

# ═══════════════════════════════════════════════════════════════
# 🧪 مرحله 8: تست اتصال به دامنه
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🧪 مرحله 8: تست اتصال به دامنه..."

# تست اتصال به دامنه (از داخل سرور)
echo "🔍 تست اتصال به https://$DOMAIN/$VOICE_SUBDOMAIN ..."

# تست با curl
if command -v curl &> /dev/null; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -k "https://$DOMAIN/$VOICE_SUBDOMAIN" --max-time 10 2>/dev/null || echo "000")
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
        echo "   ✅ دامنه در دسترس است (HTTP $HTTP_CODE)"
    else
        echo "   ⚠️  دامنه پاسخ نمی‌دهد (HTTP $HTTP_CODE)"
        echo "   💡 ممکن است نیاز به چند دقیقه زمان داشته باشد"
    fi
else
    echo "   ℹ️  curl موجود نیست - تست دامنه انجام نشد"
fi

# بررسی اتصال شبکه بین کانتینرها
echo ""
echo "🔗 بررسی اتصال شبکه بین کانتینرها..."
NETWORK_TEST=$(docker exec crm-nginx wget -q -O- --timeout=5 "http://rabin-voice:3001/rabin-voice" 2>/dev/null && echo "OK" || echo "FAIL")

if [ "$NETWORK_TEST" = "OK" ]; then
    echo "   ✅ اتصال شبکه Nginx -> Rabin Voice: موفق"
else
    echo "   ⚠️  اتصال شبکه Nginx -> Rabin Voice: ناموفق"
    echo "   💡 ممکن است نیاز به ری‌استارت کامل داشته باشید"
fi

# ═══════════════════════════════════════════════════════════════
# 🎉 پایان
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ری‌استارت صدای رابین با موفقیت انجام شد!"
echo ""
echo "📍 دسترسی‌ها:"
echo "   🌐 وب: https://$DOMAIN/$VOICE_SUBDOMAIN"
echo "   🔌 پورت محلی: http://localhost:$VOICE_PORT"
echo "   🔗 API: https://$DOMAIN/$VOICE_SUBDOMAIN/api/ai"
echo ""
echo "📊 وضعیت کانتینرها:"
docker-compose ps | grep -E "rabin-voice|nginx" || echo "   خطا در نمایش وضعیت"
echo ""
echo "📋 دستورات مفید:"
echo "   📊 مشاهده لاگ‌ها: docker-compose logs -f rabin-voice"
echo "   🔄 ری‌استارت سریع: ./quick-restart-rabin-voice.sh"
echo "   🛑 توقف: docker-compose stop rabin-voice"
echo "   🚀 شروع: docker-compose start rabin-voice"
echo ""
echo "💡 نکته: اگر مشکلی وجود دارد، لاگ‌ها را با دستور زیر بررسی کنید:"
echo "   docker-compose logs --tail=100 rabin-voice"
echo "   docker-compose logs --tail=50 nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"