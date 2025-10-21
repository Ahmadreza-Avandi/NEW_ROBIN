#!/bin/bash

# 🔄 Rebuild Rabin Voice Container
# این اسکریپت فقط کانتینر صدای رابین رو rebuild می‌کنه

set -e  # Exit on error

echo "🔄 شروع rebuild صدای رابین..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 1. بررسی Docker
# ═══════════════════════════════════════════════════════════════

if ! command -v docker &> /dev/null; then
    echo "❌ Docker نصب نشده است!"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo "❌ Docker daemon در حال اجرا نیست!"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# 2. توقف و حذف کانتینر قبلی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🛑 توقف کانتینر قبلی..."

# Try different container name formats
CONTAINER_NAMES=("crm-rabin-voice" "crm_rabin_voice" "rabin-voice")

for container_name in "${CONTAINER_NAMES[@]}"; do
    if docker ps -a --format '{{.Names}}' | grep -q "^${container_name}$"; then
        echo "   توقف و حذف: $container_name"
        docker stop "$container_name" 2>/dev/null || true
        docker rm "$container_name" 2>/dev/null || true
    fi
done

# ═══════════════════════════════════════════════════════════════
# 3. حذف image قبلی (اختیاری)
# ═══════════════════════════════════════════════════════════════

if [ "$1" == "--clean" ]; then
    echo ""
    echo "🧹 حذف image قبلی..."
    
    # Remove old images
    docker images | grep "crm-rabin-voice" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    docker images | grep "rabin-voice" | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    
    echo "   ✅ Image های قبلی حذف شدند"
fi

# ═══════════════════════════════════════════════════════════════
# 4. Build و Start کانتینر جدید
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔨 Build کانتینر جدید..."

# Check available memory
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
echo "   💾 حافظه موجود: ${TOTAL_MEM}MB"

if [ "$TOTAL_MEM" -lt 1024 ]; then
    echo "   ⚠️  حافظه کم - استفاده از build تک مرحله‌ای"
    export DOCKER_BUILDKIT=0
    export COMPOSE_DOCKER_CLI_BUILD=0
fi

# Build only rabin-voice service
docker-compose build --no-cache rabin-voice

echo ""
echo "🚀 راه‌اندازی کانتینر..."

# Start rabin-voice service
docker-compose up -d rabin-voice

# ═══════════════════════════════════════════════════════════════
# 5. انتظار برای آماده شدن
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ انتظار برای آماده شدن سرویس..."

# Wait for container to be healthy
MAX_WAIT=60
WAITED=0

while [ $WAITED -lt $MAX_WAIT ]; do
    # Check if container is running
    if docker ps --format '{{.Names}}' | grep -qE "^(crm-rabin-voice|crm_rabin_voice|rabin-voice)$"; then
        echo "   ✅ کانتینر در حال اجراست"
        break
    fi
    
    sleep 2
    WAITED=$((WAITED + 2))
    echo -n "."
done

echo ""

if [ $WAITED -ge $MAX_WAIT ]; then
    echo "   ⚠️  کانتینر بعد از ${MAX_WAIT} ثانیه آماده نشد"
fi

# ═══════════════════════════════════════════════════════════════
# 6. تست سلامت سرویس
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔍 تست سلامت سرویس..."

# Find container name
CONTAINER_NAME=""
for name in "${CONTAINER_NAMES[@]}"; do
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        CONTAINER_NAME="$name"
        break
    fi
done

if [ -z "$CONTAINER_NAME" ]; then
    echo "   ❌ کانتینر یافت نشد!"
    echo ""
    echo "📋 لاگ‌های Docker Compose:"
    docker-compose logs --tail=50 rabin-voice
    exit 1
fi

echo "   📦 نام کانتینر: $CONTAINER_NAME"

# Check container status
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' "$CONTAINER_NAME")
echo "   📊 وضعیت: $CONTAINER_STATUS"

if [ "$CONTAINER_STATUS" != "running" ]; then
    echo "   ❌ کانتینر در حال اجرا نیست!"
    echo ""
    echo "📋 لاگ‌های کانتینر:"
    docker logs --tail=50 "$CONTAINER_NAME"
    exit 1
fi

# Test health endpoint
echo ""
echo "🏥 تست health endpoint..."

sleep 5  # Wait a bit for the service to fully start

# Test direct port
if curl -f -s http://localhost:3001/rabin-voice > /dev/null 2>&1; then
    echo "   ✅ پورت 3001 پاسخ می‌دهد"
else
    echo "   ⚠️  پورت 3001 پاسخ نمی‌دهد (ممکن است هنوز در حال راه‌اندازی باشد)"
fi

# Test through nginx (if available)
if command -v curl &> /dev/null; then
    DOMAIN=$(grep -oP 'server_name\s+\K[^;]+' nginx/default.conf 2>/dev/null | head -1 || echo "")
    
    if [ -n "$DOMAIN" ]; then
        echo ""
        echo "🌐 تست از طریق nginx..."
        
        if curl -f -s -k "https://${DOMAIN}/rabin-voice" > /dev/null 2>&1; then
            echo "   ✅ دسترسی از طریق nginx موفق"
        elif curl -f -s "http://${DOMAIN}/rabin-voice" > /dev/null 2>&1; then
            echo "   ✅ دسترسی از طریق nginx موفق (HTTP)"
        else
            echo "   ⚠️  دسترسی از طریق nginx ناموفق (ممکن است nginx نیاز به restart داشته باشد)"
        fi
    fi
fi

# ═══════════════════════════════════════════════════════════════
# 7. نمایش لاگ‌های اخیر
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📋 لاگ‌های اخیر:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs --tail=20 "$CONTAINER_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 8. Restart nginx (اختیاری)
# ═══════════════════════════════════════════════════════════════

if [ "$2" == "--restart-nginx" ] || [ "$1" == "--restart-nginx" ]; then
    echo ""
    echo "🔄 Restart nginx..."
    
    if docker ps --format '{{.Names}}' | grep -q "nginx"; then
        docker-compose restart nginx
        echo "   ✅ nginx restart شد"
    else
        echo "   ⚠️  کانتینر nginx یافت نشد"
    fi
fi

# ═══════════════════════════════════════════════════════════════
# خلاصه نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Rebuild صدای رابین با موفقیت انجام شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 اطلاعات کانتینر:"
docker ps --filter "name=rabin-voice" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🔗 دسترسی:"
echo "   • مستقیم: http://localhost:3001/rabin-voice"

if [ -n "$DOMAIN" ]; then
    echo "   • از طریق دامنه: https://${DOMAIN}/rabin-voice"
fi

echo ""
echo "📝 دستورات مفید:"
echo "   • مشاهده لاگ‌ها: docker logs -f $CONTAINER_NAME"
echo "   • ورود به کانتینر: docker exec -it $CONTAINER_NAME sh"
echo "   • Restart: docker-compose restart rabin-voice"
echo "   • توقف: docker-compose stop rabin-voice"
echo ""
echo "💡 برای rebuild کامل با پاکسازی cache:"
echo "   ./rebuild-rabin-voice.sh --clean"
echo ""
echo "💡 برای rebuild + restart nginx:"
echo "   ./rebuild-rabin-voice.sh --restart-nginx"