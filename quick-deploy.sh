#!/bin/bash

# 🚀 Quick Deploy Script - برای دیپلوی سریع بدون تنظیمات پیچیده
set -e

echo "🚀 دیپلوی سریع CRM + Rabin Voice..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تعیین مسیر اصلی پروژه
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "📂 مسیر پروژه: $SCRIPT_DIR"

# مرحله 1: کپی فایل .env
echo ""
echo "📋 مرحله 1: کپی فایل .env..."
if [ -f ".env.server" ]; then
    cp .env.server .env
    echo "✅ فایل .env کپی شد"
elif [ -f ".env" ]; then
    echo "✅ فایل .env از قبل موجود است"
else
    echo "❌ فایل .env.server یافت نشد!"
    echo "🔍 فایل‌های موجود:"
    ls -la | grep -E "\.env" || echo "   هیچ فایل .env یافت نشد"
    exit 1
fi

# مرحله 2: ایجاد دایرکتری‌های مورد نیاز
echo ""
echo "📁 مرحله 2: ایجاد دایرکتری‌های مورد نیاز..."
mkdir -p "صدای رابین/logs"
mkdir -p "صدای رابین/public"
mkdir -p uploads/{documents,avatars,chat,temp}
mkdir -p public/uploads/{documents,avatars,chat}
mkdir -p database
chmod -R 755 "صدای رابین/logs"
chmod -R 755 "صدای رابین/public"
chmod -R 777 uploads
chmod -R 777 public/uploads
echo "✅ دایرکتری‌ها ایجاد شدند"

# مرحله 3: پاک کردن containerهای قبلی
echo ""
echo "🧹 مرحله 3: پاک کردن containerهای قبلی..."
docker-compose down 2>/dev/null || true
echo "✅ containerهای قبلی پاک شدند"

# مرحله 4: Build کردن همه سرویس‌ها
echo ""
echo "🔨 مرحله 4: Build کردن سرویس‌ها..."
echo "   ⏳ این مرحله ممکن است چند دقیقه طول بکشد..."

# Build به ترتیب اولویت: اول Rabin Voice، بعد NextJS
echo "🎤 Build Rabin Voice (اولویت اول)..."
docker-compose build rabin-voice

echo "🌐 Build NextJS CRM..."
docker-compose build nextjs

echo "✅ Build تمام شد"

# مرحله 5: اجرای سرویس‌ها
echo ""
echo "🚀 مرحله 5: اجرای سرویس‌ها..."
docker-compose up -d
echo "✅ سرویس‌ها اجرا شدند"

# مرحله 6: انتظار برای آماده شدن
echo ""
echo "⏳ مرحله 6: انتظار برای آماده شدن سرویس‌ها..."
echo "   ⏳ لطفاً صبر کنید..."
sleep 30

# مرحله 7: چک کردن وضعیت
echo ""
echo "🔍 مرحله 7: چک کردن وضعیت سرویس‌ها..."
docker-compose ps

# مرحله 8: تست سرویس‌ها
echo ""
echo "🧪 مرحله 8: تست سرویس‌ها..."

# تست MySQL
echo "🗄️  تست MySQL..."
sleep 5
if docker-compose exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ MySQL در حال اجراست"
else
    echo "⚠️  MySQL هنوز آماده نیست"
fi

# تست NextJS
echo "🌐 تست NextJS..."
sleep 5
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ NextJS در حال اجراست"
else
    echo "⚠️  NextJS هنوز آماده نیست"
fi

# تست Rabin Voice
echo "🎤 تست Rabin Voice..."
sleep 5
if docker ps --format '{{.Names}}' | grep -q "crm-rabin-voice"; then
    echo "✅ Container Rabin Voice در حال اجراست"
    if curl -f http://localhost:3001/rabin-voice/ >/dev/null 2>&1; then
        echo "✅ Rabin Voice API پاسخ می‌دهد"
    else
        echo "⚠️  Rabin Voice API هنوز آماده نیست"
    fi
else
    echo "❌ Container Rabin Voice در حال اجرا نیست!"
fi

# تست Nginx
echo "🌐 تست Nginx..."
if docker-compose exec -T nginx nginx -t >/dev/null 2>&1; then
    echo "✅ Nginx config درست است"
else
    echo "⚠️  Nginx config مشکل دارد"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ دیپلوی با موفقیت انجام شد!"
echo ""
echo "🌐 آدرس‌های دسترسی:"
echo "   • CRM: http://localhost (یا http://crm.robintejarat.com)"
echo "   • Rabin Voice: http://localhost/rabin-voice"
echo "   • phpMyAdmin: http://localhost/secure-db-admin-panel-x7k9m2/"
echo ""
echo "📊 برای مشاهده لاگ‌ها:"
echo "   docker-compose logs -f"
echo ""
echo "🔧 برای راه‌اندازی مجدد:"
echo "   docker-compose restart"
echo ""
echo "🛑 برای توقف:"
echo "   docker-compose down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"