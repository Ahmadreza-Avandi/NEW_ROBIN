#!/bin/bash

# 🔍 بررسی آمادگی سیستم برای deploy
echo "🔍 بررسی آمادگی سیستم CRM..."

# بررسی فایل‌های ضروری
echo "📁 بررسی فایل‌های ضروری..."

REQUIRED_FILES=(
    ".env.server.template"
    "docker-compose.yml"
    "docker-compose.memory-optimized.yml"
    "deploy-server.sh"
    "database/init.sql"
    "database/crm_system.sql"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
        echo "❌ $file"
    else
        echo "✅ $file"
    fi
done

# بررسی فولدرها
echo ""
echo "📂 بررسی فولدرها..."

REQUIRED_DIRS=(
    "database"
    "database/migrations"
    "nginx"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        echo "❌ $dir (فولدر وجود ندارد)"
        mkdir -p "$dir"
        echo "✅ $dir (ایجاد شد)"
    else
        echo "✅ $dir"
    fi
done

# بررسی Docker
echo ""
echo "🐳 بررسی Docker..."
if command -v docker >/dev/null 2>&1; then
    echo "✅ Docker نصب است"
    if docker --version >/dev/null 2>&1; then
        echo "✅ Docker در حال اجراست"
    else
        echo "⚠️  Docker نصب است اما ممکن است در حال اجرا نباشد"
    fi
else
    echo "❌ Docker نصب نیست"
fi

if command -v docker-compose >/dev/null 2>&1; then
    echo "✅ Docker Compose نصب است"
else
    echo "❌ Docker Compose نصب نیست"
fi

# بررسی حافظه سیستم
echo ""
echo "💾 بررسی حافظه سیستم..."
if command -v free >/dev/null 2>&1; then
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    echo "📊 حافظه کل: ${TOTAL_MEM}MB"
    
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        echo "⚠️  حافظه کم - استفاده از تنظیمات بهینه‌شده توصیه می‌شود"
    elif [ "$TOTAL_MEM" -lt 2048 ]; then
        echo "⚠️  حافظه متوسط - استفاده از تنظیمات بهینه‌شده"
    else
        echo "✅ حافظه کافی"
    fi
else
    echo "⚠️  نمی‌توان حافظه سیستم را بررسی کرد"
fi

# خلاصه
echo ""
echo "📋 خلاصه:"
if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo "✅ همه فایل‌های ضروری موجود است"
    echo "🚀 سیستم آماده deploy است!"
    echo ""
    echo "📝 مراحل بعدی:"
    echo "1. فایل .env را از template کپی و تنظیم کنید"
    echo "2. اسکریپت deploy-server.sh را اجرا کنید"
else
    echo "❌ فایل‌های زیر یافت نشد:"
    for file in "${MISSING_FILES[@]}"; do
        echo "   - $file"
    done
    echo ""
    echo "⚠️  لطفاً فایل‌های گمشده را ایجاد کنید"
fi