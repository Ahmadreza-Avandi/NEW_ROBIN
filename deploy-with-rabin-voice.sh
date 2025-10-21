#!/bin/bash

# 🚀 Deploy CRM + Rabin Voice Assistant
set -e

echo "🚀 شروع دیپلوی CRM + دستیار صوتی رابین..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# مرحله 1: کپی فایل .env
echo "📋 مرحله 1: کپی فایل .env..."
if [ -f ".env.server" ]; then
    cp .env.server .env
    echo "✅ فایل .env کپی شد"
else
    echo "❌ فایل .env.server یافت نشد!"
    exit 1
fi

# مرحله 2: ایجاد دایرکتری‌های مورد نیاز
echo ""
echo "📁 مرحله 2: ایجاد دایرکتری‌های مورد نیاز..."
mkdir -p "صدای رابین/logs"
mkdir -p "صدای رابین/public"
chmod -R 755 "صدای رابین/logs"
chmod -R 755 "صدای رابین/public"
echo "✅ دایرکتری‌ها ایجاد شدند"

# مرحله 3: پاک کردن containerهای قبلی
echo ""
echo "🧹 مرحله 3: پاک کردن containerهای قبلی..."
docker-compose down
echo "✅ containerهای قبلی پاک شدند"

# مرحله 4: Build کردن همه سرویس‌ها
echo ""
echo "🔨 مرحله 4: Build کردن سرویس‌ها..."
echo "   - Building CRM NextJS..."
docker-compose build nextjs
echo "   - Building Rabin Voice..."
docker-compose build rabin-voice
echo "✅ Build تمام شد"

# مرحله 5: اجرای سرویس‌ها
echo ""
echo "🚀 مرحله 5: اجرای سرویس‌ها..."
docker-compose up -d
echo "✅ سرویس‌ها اجرا شدند"

# مرحله 6: چک کردن وضعیت
echo ""
echo "🔍 مرحله 6: چک کردن وضعیت سرویس‌ها..."
sleep 5
docker-compose ps

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ دیپلوی با موفقیت انجام شد!"
echo ""
echo "📊 برای مشاهده لاگ‌ها:"
echo "   docker-compose logs -f nextjs"
echo "   docker-compose logs -f rabin-voice"
echo ""
echo "🌐 آدرس‌های دسترسی:"
echo "   CRM: https://crm.robintejarat.com"
echo "   Rabin Voice: https://crm.robintejarat.com/rabin-voice"
echo ""
echo "🔧 برای restart کردن nginx:"
echo "   docker-compose restart nginx"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"