#!/bin/bash

# 🚀 اسکریپت سریع رفع مشکل دیتابیس
# این اسکریپت به سرعت دیتابیس را ایمپورت می‌کند

echo "🚀 رفع سریع مشکل دیتابیس..."

# تشخیص فایل docker-compose
COMPOSE_FILE="docker-compose.yml"
if [ -f "docker-compose.memory-optimized.yml" ]; then
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    if [ "$TOTAL_MEM" -lt 2048 ]; then
        COMPOSE_FILE="docker-compose.memory-optimized.yml"
    fi
fi

echo "📊 استفاده از: $COMPOSE_FILE"

# بررسی MySQL
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ MySQL در دسترس نیست!"
    exit 1
fi

echo "✅ MySQL آماده است"

# ایجاد دیتابیس‌ها
echo "🗄️ ایجاد دیتابیس‌ها..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "
CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
"

# ایمپورت crm_system
if [ -f "database/crm_system.sql" ]; then
    echo "📥 ایمپورت crm_system..."
    MYSQL_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q mysql)
    docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 crm_system < /tmp/crm.sql
    echo "✅ crm_system ایمپورت شد"
else
    echo "❌ فایل database/crm_system.sql یافت نشد!"
fi

# ایمپورت saas_master
if [ -f "database/saas_master.sql" ]; then
    echo "📥 ایمپورت saas_master..."
    docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas.sql
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 saas_master < /tmp/saas.sql
    echo "✅ saas_master ایمپورت شد"
else
    echo "❌ فایل database/saas_master.sql یافت نشد!"
fi

# تست نهایی
echo "🧪 تست نهایی..."
CRM_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
SAAS_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)

echo "📊 نتیجه:"
echo "   crm_system: $((CRM_COUNT - 1)) جدول"
echo "   saas_master: $((SAAS_COUNT - 1)) جدول"

if [ "$CRM_COUNT" -gt 1 ] && [ "$SAAS_COUNT" -gt 1 ]; then
    echo "✅ همه چیز آماده است!"
else
    echo "⚠️  برخی دیتابیس‌ها خالی هستند"
fi