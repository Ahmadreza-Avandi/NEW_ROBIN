#!/bin/bash

# 🧪 اسکریپت تست سریع ایمپورت دیتابیس
# این اسکریپت وضعیت دیتابیس را بررسی می‌کند

set -e

echo "🧪 تست وضعیت دیتابیس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص فایل docker-compose
COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose.memory-optimized.yml" ]; then
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 2048 ]; then
        COMPOSE_FILE="docker-compose.memory-optimized.yml"
    fi
fi

echo "📊 استفاده از فایل: $COMPOSE_FILE"

# بررسی وضعیت کانتینر MySQL
echo ""
echo "🔍 بررسی کانتینر MySQL..."
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
if [ -n "$MYSQL_CONTAINER" ]; then
    echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"
    STATUS=$(docker inspect --format='{{.State.Status}}' $MYSQL_CONTAINER 2>/dev/null)
    echo "📊 وضعیت: $STATUS"
else
    echo "❌ کانتینر MySQL یافت نشد!"
    echo "🔧 برای راه‌اندازی: docker-compose -f $COMPOSE_FILE up -d mysql"
    exit 1
fi

# تست اتصال root
echo ""
echo "🔐 تست اتصال root..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT VERSION();" >/dev/null 2>&1; then
    VERSION=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT VERSION();" 2>/dev/null | tail -1)
    echo "✅ اتصال root موفق - نسخه: $VERSION"
else
    echo "❌ اتصال root ناموفق!"
    echo "🔍 لاگ MySQL:"
    docker-compose -f $COMPOSE_FILE logs mysql | tail -10
    exit 1
fi

# بررسی دیتابیس‌ها
echo ""
echo "🗄️ بررسی دیتابیس‌ها..."
DATABASES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)")

if echo "$DATABASES" | grep -q "crm_system"; then
    echo "✅ دیتابیس crm_system موجود است"
    
    # شمارش جداول
    CRM_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$CRM_TABLE_COUNT" -gt 1 ]; then
        echo "   📊 تعداد جداول: $((CRM_TABLE_COUNT - 1))"
        
        # نمایش چند جدول اول
        echo "   📋 جداول موجود:"
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | head -10 | tail -5 | sed 's/^/      /'
    else
        echo "   ❌ دیتابیس خالی است!"
    fi
else
    echo "❌ دیتابیس crm_system موجود نیست!"
fi

if echo "$DATABASES" | grep -q "saas_master"; then
    echo "✅ دیتابیس saas_master موجود است"
    
    # شمارش جداول
    SAAS_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
        echo "   📊 تعداد جداول: $((SAAS_TABLE_COUNT - 1))"
        
        # نمایش جداول
        echo "   📋 جداول موجود:"
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | head -10 | tail -5 | sed 's/^/      /'
    else
        echo "   ❌ دیتابیس خالی است!"
    fi
else
    echo "❌ دیتابیس saas_master موجود نیست!"
fi

# تست کاربر crm_user
echo ""
echo "👤 تست کاربر crm_user..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user می‌تواند اتصال برقرار کند"
    
    # تست دسترسی به crm_system
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
        echo "✅ دسترسی به crm_system موجود است"
    else
        echo "❌ دسترسی به crm_system وجود ندارد!"
    fi
    
    # تست دسترسی به saas_master
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
        echo "✅ دسترسی به saas_master موجود است"
    else
        echo "❌ دسترسی به saas_master وجود ندارد!"
    fi
else
    echo "❌ کاربر crm_user نمی‌تواند اتصال برقرار کند!"
fi

# بررسی کاربران مهم
echo ""
echo "👑 بررسی کاربران مهم..."

# بررسی CEO در crm_system
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" >/dev/null 2>&1; then
    CEO_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" 2>/dev/null | tail -1)
    if [ "$CEO_COUNT" = "1" ]; then
        echo "✅ کاربر CEO (مهندس کریمی) موجود است"
    else
        echo "⚠️  کاربر CEO یافت نشد"
    fi
else
    echo "⚠️  نمی‌توان جدول users را بررسی کرد"
fi

# بررسی Super Admin در saas_master
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins WHERE username='Ahmadreza.avandi';" >/dev/null 2>&1; then
    SUPER_ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins WHERE username='Ahmadreza.avandi';" 2>/dev/null | tail -1)
    if [ "$SUPER_ADMIN_COUNT" = "1" ]; then
        echo "✅ Super Admin (احمدرضا اوندی) موجود است"
    else
        echo "⚠️  Super Admin یافت نشد"
    fi
else
    echo "⚠️  نمی‌توان جدول super_admins را بررسی کرد"
fi

# بررسی فایل‌های SQL
echo ""
echo "📁 بررسی فایل‌های SQL..."
echo "🔍 فایل‌های موجود در database/:"
ls -la database/*.sql 2>/dev/null | sed 's/^/   /' || echo "   هیچ فایل SQL یافت نشد"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# خلاصه نهایی
echo "📊 خلاصه وضعیت:"
if echo "$DATABASES" | grep -q "crm_system" && [ "$CRM_TABLE_COUNT" -gt 1 ]; then
    echo "✅ crm_system: آماده ($((CRM_TABLE_COUNT - 1)) جدول)"
else
    echo "❌ crm_system: خالی یا مشکل دارد"
fi

if echo "$DATABASES" | grep -q "saas_master" && [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
    echo "✅ saas_master: آماده ($((SAAS_TABLE_COUNT - 1)) جدول)"
else
    echo "❌ saas_master: خالی یا مشکل دارد"
fi

echo ""
echo "🔧 راه‌حل‌های پیشنهادی:"
if [ "$CRM_TABLE_COUNT" -le 1 ] || [ "$SAAS_TABLE_COUNT" -le 1 ]; then
    echo "   1. اجرای اسکریپت رفع مشکل: ./fix-database-import.sh"
    echo "   2. دیپلوی مجدد با --clean: ./deploy-server.sh --clean"
    echo "   3. ایمپورت دستی:"
    echo "      docker cp database/01-crm_system.sql \$(docker-compose -f $COMPOSE_FILE ps -q mysql):/tmp/crm.sql"
    echo "      docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234 crm_system < /tmp/crm.sql"
else
    echo "   ✅ همه چیز آماده است!"
fi

echo ""
echo "🔗 دستورات مفید:"
echo "   • مشاهده جداول crm_system: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "   • مشاهده جداول saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SHOW TABLES;\""
echo "   • ورود به MySQL: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234"
echo "   • مشاهده لاگ MySQL: docker-compose -f $COMPOSE_FILE logs mysql"