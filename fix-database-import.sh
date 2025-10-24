#!/bin/bash

# 🔧 اسکریپت اصلاح و ایمپورت دیتابیس
set -e

echo "🔧 اسکریپت اصلاح و ایمپورت دیتابیس CRM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص فایل docker-compose
COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.memory-optimized.yml" ]; then
    COMPOSE_FILE="docker-compose.memory-optimized.yml"
fi

echo "📋 استفاده از فایل: $COMPOSE_FILE"

# بارگذاری متغیرهای محیطی
if [ -f ".env" ]; then
    set -a
    source .env 2>/dev/null || true
    set +a
    echo "✅ متغیرهای محیطی بارگذاری شد"
else
    echo "❌ فایل .env یافت نشد!"
    exit 1
fi

# بررسی وجود کانتینر MySQL
echo ""
echo "🔍 بررسی کانتینر MySQL..."
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

# تست اتصال root
echo ""
echo "🔐 تست اتصال root..."
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT -e "SELECT VERSION();" >/dev/null 2>&1; then
    echo "❌ اتصال root ناموفق!"
    echo "🔍 لاگ MySQL:"
    docker logs $MYSQL_CONTAINER --tail 10
    exit 1
fi
echo "✅ اتصال root موفق"

# بررسی و ایجاد دیتابیس‌ها
echo ""
echo "🗄️ بررسی و ایجاد دیتابیس‌ها..."

# ایجاد دیتابیس‌ها
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT -e "
CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# ایجاد کاربر crm_user
echo "👤 ایجاد کاربر crm_user..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT -e "
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'172.%.%.%';

GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;
"

# تست کاربر crm_user
echo "🧪 تست کاربر crm_user..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user آماده است"
else
    echo "❌ کاربر crm_user مشکل دارد!"
    exit 1
fi

# ایمپورت فایل‌های دیتابیس
echo ""
echo "📥 ایمپورت فایل‌های دیتابیس..."

# ایمپورت crm_system
CRM_IMPORTED=false
if [ -f "database/crm_system.sql" ]; then
    echo "📥 ایمپورت database/crm_system.sql..."
    # اضافه کردن USE statement
    echo "USE \`crm_system\`;" > /tmp/crm_import.sql
    cat database/crm_system.sql >> /tmp/crm_import.sql
    docker cp /tmp/crm_import.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT < /tmp/crm_import.sql
    rm -f /tmp/crm_import.sql
    CRM_IMPORTED=true
    echo "✅ crm_system ایمپورت شد"
elif [ -f "crm_system.sql" ]; then
    echo "📥 ایمپورت crm_system.sql از root..."
    echo "USE \`crm_system\`;" > /tmp/crm_import.sql
    cat crm_system.sql >> /tmp/crm_import.sql
    docker cp /tmp/crm_import.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT < /tmp/crm_import.sql
    rm -f /tmp/crm_import.sql
    CRM_IMPORTED=true
    echo "✅ crm_system ایمپورت شد"
elif [ -f "دیتابیس.sql" ]; then
    echo "📥 ایمپورت دیتابیس.sql..."
    echo "USE \`crm_system\`;" > /tmp/crm_import.sql
    cat "دیتابیس.sql" >> /tmp/crm_import.sql
    docker cp /tmp/crm_import.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT < /tmp/crm_import.sql
    rm -f /tmp/crm_import.sql
    CRM_IMPORTED=true
    echo "✅ crm_system ایمپورت شد"
else
    echo "❌ فایل crm_system.sql یافت نشد!"
fi

# ایمپورت saas_master
SAAS_IMPORTED=false
if [ -f "database/saas_master.sql" ]; then
    echo "📥 ایمپورت saas_master.sql..."
    echo "USE \`saas_master\`;" > /tmp/saas_import.sql
    cat database/saas_master.sql >> /tmp/saas_import.sql
    docker cp /tmp/saas_import.sql $MYSQL_CONTAINER:/tmp/saas_import.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT < /tmp/saas_import.sql
    rm -f /tmp/saas_import.sql
    SAAS_IMPORTED=true
    echo "✅ saas_master ایمپورت شد"
else
    echo "❌ فایل saas_master.sql یافت نشد!"
fi

# بررسی نتایج
echo ""
echo "📊 بررسی نتایج ایمپورت..."

if [ "$CRM_IMPORTED" = true ]; then
    CRM_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$CRM_TABLE_COUNT" -gt 1 ]; then
        echo "✅ crm_system: $((CRM_TABLE_COUNT - 1)) جدول"
        
        # بررسی جدول users
        USER_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1)
        echo "   👥 کاربران: $USER_COUNT"
        
        # بررسی جدول customers
        CUSTOMER_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM customers;" 2>/dev/null | tail -1)
        echo "   🏢 مشتریان: $CUSTOMER_COUNT"
    else
        echo "❌ crm_system خالی است"
    fi
else
    echo "❌ crm_system ایمپورت نشد"
fi

if [ "$SAAS_IMPORTED" = true ]; then
    SAAS_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
    if [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
        echo "✅ saas_master: $((SAAS_TABLE_COUNT - 1)) جدول"
        
        # بررسی جدول super_admins
        ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" 2>/dev/null | tail -1)
        echo "   👑 ادمین‌ها: $ADMIN_COUNT"
    else
        echo "❌ saas_master خالی است"
    fi
else
    echo "❌ saas_master ایمپورت نشد"
fi

# تست نهایی اتصال
echo ""
echo "🧪 تست نهایی اتصال..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ اتصال به crm_system موفق"
else
    echo "❌ اتصال به crm_system ناموفق"
fi

if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ اتصال به saas_master موفق"
else
    echo "❌ اتصال به saas_master ناموفق"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 اصلاح دیتابیس کامل شد!"
echo ""
echo "📋 دستورات مفید:"
echo "   • مشاهده جداول crm_system: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "   • مشاهده جداول saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SHOW TABLES;\""
echo "   • تست اتصال: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"SELECT 1;\""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"