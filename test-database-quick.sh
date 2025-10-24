#!/bin/bash

# 🧪 تست سریع دیتابیس CRM
echo "🧪 تست سریع دیتابیس CRM"
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
    exit 1
fi

echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"

# تست اتصال root
echo ""
echo "🔐 تست اتصال root..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT VERSION();" >/dev/null 2>&1; then
    echo "✅ اتصال root موفق"
    VERSION=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT VERSION();" 2>/dev/null | tail -1)
    echo "   نسخه: $VERSION"
else
    echo "❌ اتصال root ناموفق!"
    echo "🔍 لاگ MySQL:"
    docker logs $MYSQL_CONTAINER --tail 5
    exit 1
fi

# بررسی دیتابیس‌ها
echo ""
echo "🗄️ بررسی دیتابیس‌ها..."
DATABASES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SHOW DATABASES;" 2>/dev/null)

if echo "$DATABASES" | grep -q "crm_system"; then
    echo "✅ دیتابیس crm_system موجود است"
    CRM_TABLES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
    echo "   📊 تعداد جداول: $((CRM_TABLES - 1))"
else
    echo "❌ دیتابیس crm_system موجود نیست!"
fi

if echo "$DATABASES" | grep -q "saas_master"; then
    echo "✅ دیتابیس saas_master موجود است"
    SAAS_TABLES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
    echo "   📊 تعداد جداول: $((SAAS_TABLES - 1))"
else
    echo "❌ دیتابیس saas_master موجود نیست!"
fi

# تست کاربر crm_user
echo ""
echo "👤 تست کاربر crm_user..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user آماده است"
    
    # تست دسترسی به crm_system
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
        echo "✅ دسترسی به crm_system موجود است"
    else
        echo "❌ دسترسی به crm_system ندارد"
    fi
    
    # تست دسترسی به saas_master
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
        echo "✅ دسترسی به saas_master موجود است"
    else
        echo "❌ دسترسی به saas_master ندارد"
    fi
else
    echo "❌ کاربر crm_user مشکل دارد!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 برای اصلاح مشکلات دیتابیس:"
echo "   ./fix-database-import.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"