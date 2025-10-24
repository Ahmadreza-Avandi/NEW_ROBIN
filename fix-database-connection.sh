#!/bin/bash

# ===========================================
# 🔧 اصلاح مشکل اتصال دیتابیس
# ===========================================
# این اسکریپت مشکل اتصال دیتابیس رو حل می‌کنه
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 اصلاح مشکل اتصال دیتابیس CRM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

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

# مرحله 1: بررسی وضعیت فعلی
echo ""
echo "🔍 مرحله 1: بررسی وضعیت فعلی..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی کانتینرها
echo "📊 وضعیت کانتینرها:"
docker-compose -f $COMPOSE_FILE ps

# بررسی فایل .env
echo ""
echo "📝 بررسی فایل .env..."
if [ -f ".env" ]; then
    echo "✅ فایل .env موجود است"
    echo "📋 تنظیمات دیتابیس فعلی:"
    grep -E "^(DATABASE_HOST|DB_HOST|DATABASE_USER|DB_USER|DATABASE_PASSWORD|DB_PASSWORD)" .env || echo "   متغیرهای دیتابیس یافت نشد"
else
    echo "❌ فایل .env یافت نشد!"
    exit 1
fi

# مرحله 2: تست اتصال دیتابیس
echo ""
echo "🧪 مرحله 2: تست اتصال دیتابیس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست اتصال به MySQL container
echo "🔌 تست اتصال به MySQL container..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT VERSION();" >/dev/null 2>&1; then
    echo "✅ اتصال به MySQL container موفقیت‌آمیز"
    
    # بررسی دیتابیس‌ها
    echo "📊 دیتابیس‌های موجود:"
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" || echo "   دیتابیس‌های CRM یافت نشد"
    
    # بررسی کاربران
    echo "👥 کاربران موجود:"
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user WHERE User IN ('crm_user', 'root');" 2>/dev/null || echo "   خطا در دریافت لیست کاربران"
    
else
    echo "❌ اتصال به MySQL container ناموفق"
    echo "🔍 لاگ MySQL:"
    docker-compose -f $COMPOSE_FILE logs mysql | tail -10
fi

# مرحله 3: تست اتصال از NextJS
echo ""
echo "🧪 تست اتصال از NextJS..."
if [ -f "test-database-connection.js" ]; then
    echo "🔧 کپی فایل تست به کانتینر NextJS..."
    docker cp test-database-connection.js nextjs:/app/test-database-connection.js
    echo "🔧 اجرای تست اتصال در NextJS container..."
    docker-compose -f $COMPOSE_FILE exec -T nextjs node test-database-connection.js || echo "⚠️  تست اتصال ناموفق"
else
    echo "⚠️  فایل test-database-connection.js یافت نشد"
fi

# مرحله 4: اصلاح مشکلات
echo ""
echo "🔧 مرحله 3: اصلاح مشکلات..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ایجاد دیتابیس‌ها اگر وجود ندارن
echo "🗄️ ایجاد دیتابیس‌های CRM..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
-- ایجاد دیتابیس‌ها
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- نمایش دیتابیس‌های ایجاد شده
SHOW DATABASES LIKE '%crm%';
SHOW DATABASES LIKE '%saas%';
EOF

echo "✅ دیتابیس‌ها ایجاد شدند"

# اصلاح دسترسی‌های دیتابیس
echo "🔐 اصلاح دسترسی‌های دیتابیس..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
-- اصلاح دسترسی‌های کاربر crm_user
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- ایجاد مجدد کاربر
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- اعطای دسترسی‌ها
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'172.%.%.%';

GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;

-- نمایش کاربران
SELECT User, Host FROM mysql.user WHERE User = 'crm_user';
EOF

echo "✅ دسترسی‌های دیتابیس اصلاح شد"

# اصلاح مشکل redirect
echo ""
echo "🔧 اصلاح مشکل redirect..."
# اطمینان از HTTP در NEXTAUTH_URL برای تست اولیه
sed -i 's|NEXTAUTH_URL=https://|NEXTAUTH_URL=http://|g' .env
echo "✅ NEXTAUTH_URL به HTTP تنظیم شد"

# راه‌اندازی مجدد NextJS
echo ""
echo "🔄 راه‌اندازی مجدد NextJS..."
docker-compose -f $COMPOSE_FILE restart nextjs

# انتظار برای آماده شدن
echo "⏳ انتظار برای آماده شدن سرویس‌ها..."
sleep 20

# مرحله 4: تست نهایی
echo ""
echo "🧪 مرحله 4: تست نهایی..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست اتصال مجدد
echo "🔌 تست اتصال نهایی..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user می‌تواند به crm_system متصل شود"
else
    echo "❌ کاربر crm_user نمی‌تواند به crm_system متصل شود"
fi

if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user می‌تواند به saas_master متصل شود"
else
    echo "❌ کاربر crm_user نمی‌تواند به saas_master متصل شود"
fi

# تست API و صفحات
echo ""
echo "🌐 تست API های CRM و صفحات..."
sleep 5

# تست صفحه اصلی
MAIN_PAGE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost --connect-timeout 5)
echo "📄 صفحه اصلی: HTTP $MAIN_PAGE_TEST"

# تست صفحه لاگین CRM
LOGIN_PAGE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/login --connect-timeout 5)
echo "🔐 صفحه لاگین CRM: HTTP $LOGIN_PAGE_TEST"

# تست داشبورد CRM (باید redirect به لاگین بده)
DASHBOARD_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/dashboard --connect-timeout 5)
echo "� داشبورeد CRM: HTTP $DASHBOARD_TEST"

# تست پنل ادمین SaaS (باید redirect به لاگین بده)
ADMIN_PANEL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/secret-zone-789/admin-panel --connect-timeout 5)
echo "🔧 پنل ادمین SaaS: HTTP $ADMIN_PANEL_TEST"

# تست صفحه لاگین پنل ادمین
ADMIN_LOGIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/secret-zone-789/login --connect-timeout 5)
echo "🔐 لاگین پنل ادمین: HTTP $ADMIN_LOGIN_TEST"

# تست API health
HEALTH_API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/health --connect-timeout 5)
echo "🏥 API Health: HTTP $HEALTH_API_TEST"

# تست API users (باید 401 برگردونه چون احراز هویت نشده)
USERS_API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/users --connect-timeout 5)
echo "👥 API Users: HTTP $USERS_API_TEST"

# تست API admin auth
ADMIN_AUTH_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/admin/auth/login -X POST -H "Content-Type: application/json" -d '{}' --connect-timeout 5)
echo "🔐 API Admin Auth: HTTP $ADMIN_AUTH_TEST"

# خلاصه نهایی
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه نهایی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی وضعیت کانتینرها
RUNNING_CONTAINERS=$(docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" | wc -l)
TOTAL_CONTAINERS=$(docker-compose -f $COMPOSE_FILE ps --services | wc -l)

echo "📦 کانتینرها: $RUNNING_CONTAINERS از $TOTAL_CONTAINERS در حال اجرا"

if [ "$MAIN_PAGE_TEST" = "200" ] || [ "$MAIN_PAGE_TEST" = "302" ]; then
    echo "✅ وب‌سایت در دسترس است"
else
    echo "❌ وب‌سایت در دسترس نیست"
fi

if [ "$LOGIN_PAGE_TEST" = "200" ]; then
    echo "✅ صفحه لاگین CRM کار می‌کند"
else
    echo "❌ صفحه لاگین CRM مشکل دارد"
fi

if [ "$ADMIN_LOGIN_TEST" = "200" ]; then
    echo "✅ صفحه لاگین پنل ادمین کار می‌کند"
else
    echo "❌ صفحه لاگین پنل ادمین مشکل دارد"
fi

if [ "$USERS_API_TEST" = "200" ] || [ "$USERS_API_TEST" = "401" ]; then
    echo "✅ API های CRM کار می‌کنند"
else
    echo "❌ API های CRM مشکل دارند"
fi

if [ "$ADMIN_AUTH_TEST" = "400" ] || [ "$ADMIN_AUTH_TEST" = "401" ]; then
    echo "✅ API احراز هویت ادمین کار می‌کند"
else
    echo "❌ API احراز هویت ادمین مشکل دارد"
fi

echo ""
echo "🎯 دستورات مفید:"
echo "   • مشاهده لاگ‌ها: docker-compose -f $COMPOSE_FILE logs -f"
echo "   • تست دیتابیس: docker-compose -f $COMPOSE_FILE exec nextjs node test-database-connection.js"
echo "   • ورود به MySQL: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234"
echo "   • راه‌اندازی مجدد: docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "✅ اصلاح مشکل اتصال دیتابیس کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"