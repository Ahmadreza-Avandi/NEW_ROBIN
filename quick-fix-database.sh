#!/bin/bash

# 🔧 اسکریپت سریع برای رفع مشکل دیتابیس
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 رفع سریع مشکل دیتابیس"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPOSE_FILE="docker-compose.deploy.yml"
if [ ! -f "$COMPOSE_FILE" ] && [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

ROOT_PASSWORD="1234"
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ کانتینر MySQL در حال اجرا نیست!"
    echo "🔧 راه‌اندازی MySQL..."
    docker compose -f $COMPOSE_FILE up -d mysql
    sleep 15
    MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
    
    if [ -z "$MYSQL_CONTAINER" ]; then
        echo "❌ نتوانست MySQL را راه‌اندازی کند!"
        exit 1
    fi
fi

echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"
echo ""

# بررسی و ایمپورت crm_system
echo "📥 بررسی و ایمپورت crm_system..."
CRM_EXISTS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "SHOW DATABASES LIKE 'crm_system';" 2>/dev/null | grep -c "crm_system" || echo "0")
CRM_TABLES=0

if [ "$CRM_EXISTS" = "1" ]; then
    CRM_TABLES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
fi

if [ "$CRM_EXISTS" = "0" ] || [ "$CRM_TABLES" -le 1 ]; then
    echo "⚠️  دیتابیس crm_system موجود نیست یا خالی است"
    
    if [ -f "database/crm_system.sql" ]; then
        echo "📥 شروع ایمپورت crm_system..."
        
        # ایجاد دیتابیس
        docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
        
        # کپی و ایمپورت
        docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
        echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
        docker exec $MYSQL_CONTAINER sh -c "mariadb -u root -p${ROOT_PASSWORD} crm_system < /tmp/crm_import.sql" 2>&1 | grep -v "Warning" || true
        
        sleep 5
        
        # بررسی
        NEW_TABLES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$NEW_TABLES" -gt 1 ]; then
            echo "✅ crm_system با موفقیت ایمپورت شد - $((NEW_TABLES - 1)) جدول"
        else
            echo "❌ ایمپورت crm_system ناموفق"
        fi
    else
        echo "❌ فایل database/crm_system.sql یافت نشد!"
    fi
else
    echo "✅ crm_system موجود است - $((CRM_TABLES - 1)) جدول"
fi

echo ""

# بررسی و ایمپورت saas_master
echo "📥 بررسی و ایمپورت saas_master..."
SAAS_EXISTS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "SHOW DATABASES LIKE 'saas_master';" 2>/dev/null | grep -c "saas_master" || echo "0")
SAAS_TABLES=0

if [ "$SAAS_EXISTS" = "1" ]; then
    SAAS_TABLES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
fi

if [ "$SAAS_EXISTS" = "0" ] || [ "$SAAS_TABLES" -le 1 ]; then
    echo "⚠️  دیتابیس saas_master موجود نیست یا خالی است"
    
    if [ -f "database/saas_master.sql" ]; then
        echo "📥 شروع ایمپورت saas_master..."
        
        # ایجاد دیتابیس
        docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
        
        # کپی و ایمپورت
        docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas_import.sql
        echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
        docker exec $MYSQL_CONTAINER sh -c "mariadb -u root -p${ROOT_PASSWORD} saas_master < /tmp/saas_import.sql" 2>&1 | grep -v "Warning" || true
        
        sleep 5
        
        # بررسی
        NEW_TABLES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$NEW_TABLES" -gt 1 ]; then
            echo "✅ saas_master با موفقیت ایمپورت شد - $((NEW_TABLES - 1)) جدول"
        else
            echo "❌ ایمپورت saas_master ناموفق"
        fi
    else
        echo "❌ فایل database/saas_master.sql یافت نشد!"
    fi
else
    echo "✅ saas_master موجود است - $((SAAS_TABLES - 1)) جدول"
fi

echo ""

# تنظیم دسترسی‌ها
echo "🔧 تنظیم دسترسی‌های کاربر crm_user..."
docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "
    GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
    GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'localhost';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'localhost';
    FLUSH PRIVILEGES;
" 2>/dev/null || true

echo "✅ دسترسی‌ها تنظیم شد"
echo ""

# راه‌اندازی مجدد NextJS
echo "🔄 راه‌اندازی مجدد NextJS..."
docker compose -f $COMPOSE_FILE restart nextjs 2>/dev/null || true
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ رفع مشکل کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 اطلاعات لاگین:"
echo "   Email: Robintejarat@gmail.com"
echo "   Password: 1234"
echo ""
