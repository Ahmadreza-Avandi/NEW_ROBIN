#!/bin/bash

# 📥 ایمپورت دستی دیتابیس‌های CRM
echo "📥 ایمپورت دستی دیتابیس‌های CRM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص فایل docker-compose
COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
fi

ROOT_PASSWORD="1234"

echo "📋 استفاده از فایل: $COMPOSE_FILE"

# بررسی کانتینر MySQL
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ کانتینر MySQL یافت نشد!"
    echo "🔧 راه‌اندازی MySQL..."
    docker-compose -f $COMPOSE_FILE up -d mysql
    sleep 30
    MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
fi

if [ -n "$MYSQL_CONTAINER" ]; then
    echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"
else
    echo "❌ نتوانستیم کانتینر MySQL را راه‌اندازی کنیم!"
    exit 1
fi

# تست اتصال
echo ""
echo "🔐 تست اتصال..."
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ اتصال ناموفق!"
    exit 1
fi
echo "✅ اتصال موفق"

# ایجاد دیتابیس‌ها
echo ""
echo "🗄️ ایجاد دیتابیس‌ها..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"
echo "✅ دیتابیس‌ها ایجاد شدند"

# ایجاد کاربر
echo ""
echo "👤 ایجاد کاربر crm_user..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
DROP USER IF EXISTS 'crm_user'@'%';
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
"
echo "✅ کاربر crm_user ایجاد شد"

# ایمپورت crm_system
echo ""
echo "📥 ایمپورت crm_system..."
CRM_IMPORTED=false

if [ -f "database/crm_system.sql" ]; then
    echo "📥 ایمپورت از database/crm_system.sql..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} crm_system < database/crm_system.sql
    CRM_IMPORTED=true
elif [ -f "crm_system.sql" ]; then
    echo "📥 ایمپورت از crm_system.sql..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} crm_system < crm_system.sql
    CRM_IMPORTED=true
else
    echo "❌ فایل crm_system.sql یافت نشد!"
    echo "🔍 فایل‌های موجود:"
    ls -la *.sql 2>/dev/null || echo "   هیچ فایل SQL یافت نشد"
fi

# ایمپورت saas_master
echo ""
echo "📥 ایمپورت saas_master..."
SAAS_IMPORTED=false

if [ -f "database/saas_master.sql" ]; then
    echo "📥 ایمپورت از database/saas_master.sql..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} saas_master < database/saas_master.sql
    SAAS_IMPORTED=true
else
    echo "❌ فایل saas_master.sql یافت نشد!"
fi

# بررسی نتایج
echo ""
echo "📊 بررسی نتایج..."

if [ "$CRM_IMPORTED" = true ]; then
    CRM_TABLES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$CRM_TABLES" -gt 1 ]; then
        echo "✅ crm_system: $((CRM_TABLES - 1)) جدول ایمپورت شد"
        
        # بررسی جدول users
        USER_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1)
        echo "   👥 کاربران: $USER_COUNT"
    else
        echo "❌ crm_system خالی است"
    fi
else
    echo "❌ crm_system ایمپورت نشد"
fi

if [ "$SAAS_IMPORTED" = true ]; then
    SAAS_TABLES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$SAAS_TABLES" -gt 1 ]; then
        echo "✅ saas_master: $((SAAS_TABLES - 1)) جدول ایمپورت شد"
    else
        echo "❌ saas_master خالی است"
    fi
else
    echo "❌ saas_master ایمپورت نشد"
fi

# تست نهایی
echo ""
echo "🧪 تست نهایی..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user به crm_system دسترسی دارد"
else
    echo "❌ کاربر crm_user به crm_system دسترسی ندارد"
fi

if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user به saas_master دسترسی دارد"
else
    echo "❌ کاربر crm_user به saas_master دسترسی ندارد"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 ایمپورت دستی کامل شد!"
echo ""
echo "📋 دستورات تست:"
echo "   • تست سریع: ./test-database-quick.sh"
echo "   • مشاهده جداول: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"