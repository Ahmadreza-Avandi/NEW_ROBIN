#!/bin/bash

# 🚀 Quick Deploy Script for phpMyAdmin Security Updates
# این اسکریپت برای deploy سریع تغییرات امنیتی phpMyAdmin است

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 Quick Deploy - phpMyAdmin Security Updates"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# بررسی اینکه روی سرور هستیم یا لوکال
if [ -f "/etc/hostname" ] && grep -q "vps\|server\|cloud" /etc/hostname 2>/dev/null; then
    echo "✅ در حال اجرا روی سرور"
    ON_SERVER=true
else
    echo "⚠️  در حال اجرا روی لوکال"
    ON_SERVER=false
fi

echo ""

# مرحله 1: بررسی فایل‌های مورد نیاز
echo "📋 مرحله 1: بررسی فایل‌های مورد نیاز..."

REQUIRED_FILES=(
    "deploy-server.sh"
    "docker-compose.yml"
    "nginx/default.conf"
)

MISSING_FILES=0
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - یافت نشد!"
        MISSING_FILES=$((MISSING_FILES + 1))
    fi
done

if [ $MISSING_FILES -gt 0 ]; then
    echo ""
    echo "❌ $MISSING_FILES فایل یافت نشد!"
    echo "💡 لطفاً ابتدا فایل‌ها را از git pull کنید"
    exit 1
fi

echo ""

# مرحله 2: Backup
echo "💾 مرحله 2: ایجاد Backup..."

BACKUP_DIR="backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Backup فایل‌های config
cp docker-compose.yml "$BACKUP_DIR/" 2>/dev/null || true
cp nginx/default.conf "$BACKUP_DIR/" 2>/dev/null || true
cp .env "$BACKUP_DIR/" 2>/dev/null || true

# Backup دیتابیس (اگر روی سرور هستیم)
if [ "$ON_SERVER" = true ] && docker ps | grep -q crm-mysql; then
    echo "   📦 Backup دیتابیس..."
    docker exec crm-mysql mysqldump -u root -p1234 --all-databases > "$BACKUP_DIR/database-backup.sql" 2>/dev/null || true
fi

echo "   ✅ Backup در $BACKUP_DIR ذخیره شد"
echo ""

# مرحله 3: اجرای Deploy
echo "🚀 مرحله 3: اجرای Deploy..."
echo ""

if [ "$ON_SERVER" = true ]; then
    # روی سرور - اجرای deploy-server.sh
    echo "🔧 اجرای deploy-server.sh..."
    chmod +x deploy-server.sh
    
    # پرسیدن از کاربر برای clean deploy
    read -p "آیا می‌خواهید clean deploy انجام دهید؟ (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🧹 Clean deploy در حال اجرا..."
        ./deploy-server.sh --clean
    else
        echo "🔄 Deploy معمولی در حال اجرا..."
        ./deploy-server.sh
    fi
else
    # روی لوکال - فقط راهنمایی
    echo "⚠️  شما روی لوکال هستید!"
    echo ""
    echo "📋 برای deploy روی سرور:"
    echo ""
    echo "1. آپلود فایل‌ها به سرور:"
    echo "   scp deploy-server.sh user@server:/path/to/project/"
    echo "   scp docker-compose.yml user@server:/path/to/project/"
    echo "   scp nginx/default.conf user@server:/path/to/project/nginx/"
    echo ""
    echo "2. اتصال به سرور:"
    echo "   ssh user@crm.robintejarat.com"
    echo ""
    echo "3. اجرای deploy:"
    echo "   cd /path/to/project"
    echo "   ./deploy-server.sh"
    echo ""
    exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Deploy با موفقیت انجام شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# نمایش اطلاعات مهم
echo "📋 اطلاعات مهم:"
echo ""

if [ -f ".phpmyadmin_credentials" ]; then
    echo "🔐 اطلاعات دسترسی phpMyAdmin:"
    cat .phpmyadmin_credentials
    echo ""
    echo "⚠️  این اطلاعات را یادداشت کنید و فایل را حذف کنید:"
    echo "   rm .phpmyadmin_credentials"
else
    echo "⚠️  فایل .phpmyadmin_credentials یافت نشد"
    echo "   اطلاعات دسترسی در خروجی deploy-server.sh نمایش داده شده"
fi

echo ""
echo "🧪 تست دسترسی:"
echo "   https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
echo ""

# نمایش وضعیت سرویس‌ها
echo "📊 وضعیت سرویس‌ها:"
docker-compose ps

echo ""
echo "✅ همه چیز آماده است!"
echo ""
