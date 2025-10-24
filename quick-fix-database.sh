#!/bin/bash

# ===========================================
# 🚀 حل سریع مشکل دیتابیس CRM
# ===========================================

set -e

echo "🚀 حل سریع مشکل دیتابیس CRM..."

# تشخیص docker-compose file
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

echo "📋 استفاده از فایل: $COMPOSE_FILE"

# مرحله 1: ایجاد دیتابیس‌ها
echo ""
echo "🗄️ مرحله 1: ایجاد دیتابیس‌ها..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
-- ایجاد دیتابیس‌ها
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- نمایش دیتابیس‌های ایجاد شده
SHOW DATABASES;
EOF

echo "✅ دیتابیس‌ها ایجاد شدند"

# مرحله 2: اصلاح دسترسی‌های کاربر
echo ""
echo "🔐 مرحله 2: اصلاح دسترسی‌های کاربر..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
-- حذف کاربران قدیمی
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- ایجاد مجدد کاربر
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- اعطای دسترسی‌ها به crm_system
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

-- اعطای دسترسی‌ها به saas_master
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;

-- تست دسترسی
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';
EOF

echo "✅ دسترسی‌های کاربر اصلاح شد"

# مرحله 3: import فایل‌های دیتابیس
echo ""
echo "📥 مرحله 3: import فایل‌های دیتابیس..."

# import crm_system.sql اگر وجود داره
if [ -f "database/crm_system.sql" ]; then
    echo "📥 import crm_system.sql..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 crm_system < database/crm_system.sql
    echo "✅ crm_system.sql import شد"
else
    echo "⚠️  فایل database/crm_system.sql یافت نشد"
fi

# import saas_master.sql اگر وجود داره
if [ -f "database/saas_master.sql" ]; then
    echo "📥 import saas_master.sql..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 saas_master < database/saas_master.sql
    echo "✅ saas_master.sql import شد"
else
    echo "⚠️  فایل database/saas_master.sql یافت نشد"
fi

# مرحله 4: اصلاح .env
echo ""
echo "🔧 مرحله 4: اصلاح .env..."
# اطمینان از HTTP در NEXTAUTH_URL
sed -i 's|NEXTAUTH_URL=https://|NEXTAUTH_URL=http://|g' .env
echo "✅ NEXTAUTH_URL به HTTP تنظیم شد"

# مرحله 5: راه‌اندازی مجدد
echo ""
echo "🔄 مرحله 5: راه‌اندازی مجدد سرویس‌ها..."
docker-compose -f $COMPOSE_FILE restart nextjs
echo "⏳ انتظار برای آماده شدن..."
sleep 15

# مرحله 6: تست نهایی
echo ""
echo "🧪 مرحله 6: تست نهایی..."

# تست اتصال دیتابیس
echo "🔌 تست اتصال دیتابیس..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ اتصال به crm_system موفقیت‌آمیز"
else
    echo "❌ اتصال به crm_system ناموفق"
fi

if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ اتصال به saas_master موفقیت‌آمیز"
else
    echo "❌ اتصال به saas_master ناموفق"
fi

# تست وب‌سایت
echo ""
echo "🌐 تست وب‌سایت..."
MAIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 10)
echo "📄 صفحه اصلی: HTTP $MAIN_PAGE_STATUS"

LOGIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/login --connect-timeout 10)
echo "🔐 صفحه لاگین: HTTP $LOGIN_PAGE_STATUS"

ADMIN_LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/secret-zone-789/login --connect-timeout 10)
echo "🔧 لاگین ادمین: HTTP $ADMIN_LOGIN_STATUS"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$MAIN_PAGE_STATUS" = "200" ] && [ "$LOGIN_PAGE_STATUS" = "200" ] && [ "$ADMIN_LOGIN_STATUS" = "200" ]; then
    echo "🎉 همه چیز درست کار می‌کند!"
else
    echo "⚠️  برخی مشکلات هنوز باقی مانده"
fi

echo ""
echo "🔗 لینک‌های مفید:"
echo "   • صفحه اصلی: http://crm.robintejarat.com"
echo "   • لاگین CRM: http://crm.robintejarat.com/login"
echo "   • لاگین ادمین: http://crm.robintejarat.com/secret-zone-789/login"
echo ""
echo "✅ حل سریع مشکل دیتابیس کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"