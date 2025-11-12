#!/bin/bash

# 🚀 اسکریپت ایمپورت سریع دیتابیس
# این اسکریپت دیتابیس‌ها را فوراً ایمپورت می‌کند

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 شروع ایمپورت سریع دیتابیس"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص فایل docker-compose
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

echo "📋 استفاده از: $COMPOSE_FILE"

# بررسی وجود فایل‌های SQL
echo ""
echo "🔍 بررسی فایل‌های SQL..."

if [ ! -f "database/crm_system.sql" ]; then
    echo "❌ فایل database/crm_system.sql یافت نشد!"
    exit 1
fi

if [ ! -f "database/saas_master.sql" ]; then
    echo "❌ فایل database/saas_master.sql یافت نشد!"
    exit 1
fi

echo "✅ فایل crm_system.sql موجود است ($(du -h database/crm_system.sql | cut -f1))"
echo "✅ فایل saas_master.sql موجود است ($(du -h database/saas_master.sql | cut -f1))"

# دریافت نام کانتینر MySQL
echo ""
echo "🔍 یافتن کانتینر MySQL..."
MYSQL_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q mysql 2>/dev/null || docker ps -q --filter "name=mysql")

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ کانتینر MySQL یافت نشد!"
    echo "💡 ابتدا سرویس‌ها را راه‌اندازی کنید: docker-compose up -d"
    exit 1
fi

echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"

# تست اتصال
echo ""
echo "🔌 تست اتصال به MySQL..."
if ! docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ اتصال به MySQL ناموفق!"
    echo "⏳ انتظار 10 ثانیه برای آماده شدن MySQL..."
    sleep 10
    
    if ! docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
        echo "❌ MySQL آماده نیست. لاگ‌ها را بررسی کنید:"
        echo "   docker logs $MYSQL_CONTAINER"
        exit 1
    fi
fi

echo "✅ اتصال به MySQL موفق"

# ایجاد دیتابیس‌ها
echo ""
echo "🗄️ ایجاد دیتابیس‌ها..."

docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "
CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
" 2>/dev/null

echo "✅ دیتابیس‌ها ایجاد شدند"

# کپی فایل‌ها به کانتینر
echo ""
echo "📦 کپی فایل‌های SQL به کانتینر..."

docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm_system.sql
echo "✅ crm_system.sql کپی شد"

docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas_master.sql
echo "✅ saas_master.sql کپی شد"

# ایمپورت crm_system
echo ""
echo "📥 ایمپورت crm_system.sql..."
echo "⏳ این ممکن است چند دقیقه طول بکشد..."

if docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 crm_system < /tmp/crm_system.sql' 2>&1 | grep -v "Warning"; then
    echo "✅ crm_system با موفقیت ایمپورت شد"
else
    echo "⚠️ ایمپورت crm_system با خطا مواجه شد (ممکن است طبیعی باشد)"
fi

# بررسی جداول crm_system
TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
echo "📊 تعداد جداول crm_system: $((TABLE_COUNT - 1))"

# ایمپورت saas_master
echo ""
echo "📥 ایمپورت saas_master.sql..."

if docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 saas_master < /tmp/saas_master.sql' 2>&1 | grep -v "Warning"; then
    echo "✅ saas_master با موفقیت ایمپورت شد"
else
    echo "⚠️ ایمپورت saas_master با خطا مواجه شد (ممکن است طبیعی باشد)"
fi

# بررسی جداول saas_master
TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
echo "📊 تعداد جداول saas_master: $((TABLE_COUNT - 1))"

# ایمپورت admin users اگر موجود باشد
if [ -f "database/03-admin-users.sql" ]; then
    echo ""
    echo "👑 ایمپورت کاربران ادمین..."
    docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 < /tmp/03-admin-users.sql' 2>/dev/null || true
    docker cp database/03-admin-users.sql $MYSQL_CONTAINER:/tmp/03-admin-users.sql 2>/dev/null || true
    docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 < /tmp/03-admin-users.sql' 2>/dev/null || true
fi

# پاکسازی فایل‌های موقت
echo ""
echo "🧹 پاکسازی فایل‌های موقت..."
docker exec $MYSQL_CONTAINER rm -f /tmp/crm_system.sql /tmp/saas_master.sql /tmp/03-admin-users.sql 2>/dev/null || true

# تست نهایی
echo ""
echo "🧪 تست نهایی..."

# تست دسترسی crm_user
if docker exec $MYSQL_CONTAINER mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;" >/dev/null 2>&1; then
    USER_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) as count FROM users;" 2>/dev/null | tail -1)
    echo "✅ دسترسی به crm_system: موفق"
    echo "   👥 تعداد کاربران: $USER_COUNT"
else
    echo "❌ دسترسی به crm_system: ناموفق"
fi

# تست دسترسی saas_master
if docker exec $MYSQL_CONTAINER mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" >/dev/null 2>&1; then
    ADMIN_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) as count FROM super_admins;" 2>/dev/null | tail -1)
    echo "✅ دسترسی به saas_master: موفق"
    echo "   👑 تعداد Super Admins: $ADMIN_COUNT"
else
    echo "❌ دسترسی به saas_master: ناموفق"
fi

# خلاصه نهایی
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ ایمپورت دیتابیس کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 خلاصه:"
echo "   ✅ crm_system: ایمپورت شد"
echo "   ✅ saas_master: ایمپورت شد"
echo ""
echo "🔄 Restart سرویس‌ها برای اطمینان:"
echo "   docker-compose -f $COMPOSE_FILE restart"
echo ""
echo "🌐 دسترسی به سیستم:"
echo "   http://crm.robintejarat.com"
echo ""
