#!/bin/bash

# 🚀 Quick Update Script for Rabin Voice
# این اسکریپت تغییرات کد رو بدون rebuild کامل اعمال می‌کنه

set -e

echo "🚀 آپدیت سریع صدای رابین..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 1. بررسی فایل‌های تغییر یافته
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📝 فایل‌های تغییر یافته:"
echo "   • utils/api.ts - API_BASE_URL به /rabin-voice/api تغییر کرد"
echo "   • utils/speech.ts - TTS endpoints به /rabin-voice/api/tts تغییر کرد"
echo "   • components/VoiceAssistant.tsx - API endpoint اصلاح شد"

# ═══════════════════════════════════════════════════════════════
# 2. Rebuild کانتینر
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔨 Rebuild کانتینر صدای رابین..."

# Stop container
echo "   🛑 توقف کانتینر..."
docker-compose stop rabin-voice 2>/dev/null || true

# Remove container
echo "   🗑️  حذف کانتینر قبلی..."
docker-compose rm -f rabin-voice 2>/dev/null || true

# Build new image
echo "   🔨 Build image جدید..."
docker-compose build --no-cache rabin-voice

# Start container
echo "   🚀 راه‌اندازی کانتینر..."
docker-compose up -d rabin-voice

# ═══════════════════════════════════════════════════════════════
# 3. انتظار برای آماده شدن
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ انتظار برای آماده شدن سرویس..."

sleep 10

# Find container name
CONTAINER_NAME=""
for name in "crm-rabin-voice" "crm_rabin_voice" "rabin-voice"; do
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        CONTAINER_NAME="$name"
        break
    fi
done

if [ -z "$CONTAINER_NAME" ]; then
    echo "   ❌ کانتینر یافت نشد!"
    exit 1
fi

echo "   ✅ کانتینر در حال اجراست: $CONTAINER_NAME"

# ═══════════════════════════════════════════════════════════════
# 4. تست سرویس
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔍 تست سرویس..."

# Test port 3001
if curl -f -s http://localhost:3001/rabin-voice > /dev/null 2>&1; then
    echo "   ✅ پورت 3001 پاسخ می‌دهد"
else
    echo "   ⚠️  پورت 3001 هنوز آماده نیست"
fi

# Test API endpoint
if curl -f -s http://localhost:3001/rabin-voice/api/health > /dev/null 2>&1; then
    echo "   ✅ API endpoint سالم است"
else
    echo "   ⚠️  API endpoint هنوز آماده نیست"
fi

# ═══════════════════════════════════════════════════════════════
# 5. نمایش لاگ‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📋 لاگ‌های اخیر:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker logs --tail=30 "$CONTAINER_NAME"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# خلاصه
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ آپدیت با موفقیت انجام شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 تست کنید:"
echo "   • مستقیم: http://localhost:3001/rabin-voice"
echo "   • از طریق دامنه: https://crm.robintejarat.com/rabin-voice"
echo ""
echo "📝 دستورات مفید:"
echo "   • مشاهده لاگ‌ها: docker logs -f $CONTAINER_NAME"
echo "   • Restart nginx: docker-compose restart nginx"
echo ""