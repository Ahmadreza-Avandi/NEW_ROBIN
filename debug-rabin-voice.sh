#!/bin/bash

# 🎤 اسکریپت Debug Rabin Voice Assistant
set -e

DOMAIN="crm.robintejarat.com"
COMPOSE_FILE="docker-compose.deploy.yml"

echo "🎤 شروع Debug Rabin Voice Assistant..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 🔍 مرحله 1: بررسی وضعیت کلی
# ═══════════════════════════════════════════════════════════════

echo "🔍 مرحله 1: بررسی وضعیت کلی..."

# بررسی فایل docker-compose
if [ ! -f "$COMPOSE_FILE" ]; then
    echo "❌ فایل $COMPOSE_FILE یافت نشد!"
    if [ -f "docker-compose.yml" ]; then
        COMPOSE_FILE="docker-compose.yml"
        echo "✅ استفاده از docker-compose.yml"
    else
        echo "❌ هیچ فایل docker-compose یافت نشد!"
        exit 1
    fi
fi

# بررسی تعریف rabin-voice در docker-compose
echo "📋 بررسی تعریف rabin-voice در docker-compose..."
if grep -q "rabin-voice:" $COMPOSE_FILE; then
    echo "✅ rabin-voice در docker-compose تعریف شده"
    echo "📄 تنظیمات rabin-voice:"
    grep -A 15 "rabin-voice:" $COMPOSE_FILE
else
    echo "❌ rabin-voice در docker-compose تعریف نشده!"
    echo "🔧 لطفاً rabin-voice را به docker-compose اضافه کنید"
    exit 1
fi

# ═══════════════════════════════════════════════════════════════
# 🐳 مرحله 2: بررسی Docker Container
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🐳 مرحله 2: بررسی Docker Container..."

# جستجوی کانتینر با همه فرمت‌های ممکن
echo "🔍 جستجوی کانتینر Rabin Voice..."
RABIN_CONTAINERS=$(docker ps -a --format '{{.Names}}\t{{.Status}}\t{{.Image}}' | grep -E "(rabin|voice|صدای)" || echo "")

if [ -n "$RABIN_CONTAINERS" ]; then
    echo "📦 کانتینرهای یافت شده:"
    echo "$RABIN_CONTAINERS"
    
    # انتخاب کانتینر فعال
    ACTIVE_CO