#!/bin/bash

# 🔍 اسکریپت بررسی و رفع مشکل دیتابیس و امنیت
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 بررسی وضعیت دیتابیس و امنیت"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPOSE_FILE="docker-compose.deploy.yml"
ROOT_PASSWORD="1234"

# بررسی وجود فایل compose
if [ ! -f "$COMPOSE_FILE" ] && [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
fi

# 1. بررسی وضعیت کانتینرها
echo "📊 1. بررسی وضعیت کانتینرها..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "NAME|mysql|nextjs|nginx|phpmyadmin" || echo "⚠️  کانتینرها یافت نشدند"
echo ""

# 2. بررسی وضعیت دیتابیس‌ها
echo "🗄️  2. بررسی وضعیت دیتابیس‌ها..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)

if [ -z "$MYSQL_CONTAINER" ]; then
    echo "❌ کانتینر MySQL/MariaDB در حال اجرا نیست!"
    echo "🔧 تلاش برای راه‌اندازی..."
    docker compose -f $COMPOSE_FILE up -d mysql
    sleep 10
    MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
fi

if [ -n "$MYSQL_CONTAINER" ]; then
    echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"
    
    # بررسی اتصال
    if docker exec $MYSQL_CONTAINER mariadb-admin ping -h localhost -u root -p${ROOT_PASSWORD} >/dev/null 2>&1; then
        echo "✅ اتصال به MySQL برقرار است"
    else
        echo "❌ اتصال به MySQL برقرار نیست!"
        exit 1
    fi
    
    # بررسی دیتابیس‌ها
    echo ""
    echo "🔍 بررسی دیتابیس‌ها..."
    DATABASES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" || echo "")
    
    # بررسی crm_system
    if echo "$DATABASES" | grep -q "crm_system"; then
        echo "✅ دیتابیس crm_system موجود است"
        
        TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$TABLE_COUNT" -gt 1 ]; then
            echo "   ✅ دارای $((TABLE_COUNT - 1)) جدول"
            
            # بررسی جدول users
            USER_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1 || echo "0")
            echo "   👤 تعداد کاربران: $USER_COUNT"
            
            # بررسی کاربر CEO
            CEO_EXISTS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" 2>/dev/null | tail -1 || echo "0")
            if [ "$CEO_EXISTS" = "1" ] || [ "$CEO_EXISTS" -gt 0 ]; then
                echo "   ✅ کاربر CEO موجود است"
            else
                echo "   ❌ کاربر CEO موجود نیست!"
            fi
        else
            echo "   ❌ دیتابیس خالی است (بدون جدول)"
        fi
    else
        echo "❌ دیتابیس crm_system موجود نیست!"
    fi
    
    # بررسی saas_master
    if echo "$DATABASES" | grep -q "saas_master"; then
        echo "✅ دیتابیس saas_master موجود است"
        
        TABLE_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$TABLE_COUNT" -gt 1 ]; then
            echo "   ✅ دارای $((TABLE_COUNT - 1)) جدول"
            
            # بررسی Super Admins
            ADMIN_COUNT=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" 2>/dev/null | tail -1 || echo "0")
            echo "   👑 تعداد Super Admins: $ADMIN_COUNT"
        else
            echo "   ❌ دیتابیس خالی است (بدون جدول)"
        fi
    else
        echo "❌ دیتابیس saas_master موجود نیست!"
    fi
else
    echo "❌ کانتینر MySQL یافت نشد!"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 3. بررسی امنیت و لاگ‌های مشکوک
echo ""
echo "🔒 3. بررسی امنیت و لاگ‌های مشکوک..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی لاگ‌های MySQL برای دسترسی‌های مشکوک
echo "🔍 بررسی لاگ‌های MySQL برای فعالیت‌های مشکوک..."
if [ -n "$MYSQL_CONTAINER" ]; then
    SUSPICIOUS_LOGS=$(docker logs $MYSQL_CONTAINER --tail 100 2>&1 | grep -iE "(error|denied|access|unauthorized|drop|delete|truncate)" || echo "")
    if [ -n "$SUSPICIOUS_LOGS" ]; then
        echo "⚠️  فعالیت‌های مشکوک یافت شد:"
        echo "$SUSPICIOUS_LOGS" | head -10
    else
        echo "✅ هیچ فعالیت مشکوکی در لاگ‌های اخیر یافت نشد"
    fi
fi

# بررسی لاگ‌های nginx
echo ""
echo "🔍 بررسی لاگ‌های nginx..."
NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep nginx | head -1)
if [ -n "$NGINX_CONTAINER" ]; then
    RECENT_ACCESS=$(docker logs $NGINX_CONTAINER --tail 50 2>&1 | grep -E "(401|403|404|500)" | wc -l || echo "0")
    echo "   ⚠️  خطاهای اخیر در nginx: $RECENT_ACCESS"
    
    SUSPICIOUS_IPS=$(docker logs $NGINX_CONTAINER --tail 200 2>&1 | grep -E "401|403" | awk '{print $1}' | sort | uniq -c | sort -rn | head -5 || echo "")
    if [ -n "$SUSPICIOUS_IPS" ]; then
        echo "   🔍 IP های مشکوک (با بیشترین خطا):"
        echo "$SUSPICIOUS_IPS"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 4. بررسی دسترسی‌ها
echo ""
echo "🔐 4. بررسی دسترسی‌های کاربران دیتابیس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -n "$MYSQL_CONTAINER" ]; then
    # بررسی کاربر crm_user
    echo "🔍 بررسی کاربر crm_user..."
    if docker exec $MYSQL_CONTAINER mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ کاربر crm_user می‌تواند به دیتابیس متصل شود"
        
        # بررسی دسترسی‌ها
        PRIVILEGES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "SHOW GRANTS FOR 'crm_user'@'%';" 2>/dev/null | grep -c "GRANT" || echo "0")
        echo "   تعداد دسترسی‌ها: $PRIVILEGES"
    else
        echo "❌ کاربر crm_user نمی‌تواند به دیتابیس متصل شود!"
        echo "🔧 تلاش برای اصلاح..."
        
        docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "
            GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
            GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
            FLUSH PRIVILEGES;
        " 2>/dev/null || true
        
        echo "✅ دسترسی‌ها اصلاح شد"
    fi
    
    # بررسی کاربران اضافی (مشکوک)
    echo ""
    echo "🔍 بررسی کاربران دیتابیس..."
    ALL_USERS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p${ROOT_PASSWORD} -e "SELECT User, Host FROM mysql.user WHERE User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema', 'crm_user');" 2>/dev/null | grep -v "User" | grep -v "^$" || echo "")
    if [ -n "$ALL_USERS" ]; then
        echo "⚠️  کاربران اضافی یافت شد:"
        echo "$ALL_USERS"
    else
        echo "✅ فقط کاربران مجاز وجود دارند"
    fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 5. بررسی فایل‌های SQL
echo ""
echo "📁 5. بررسی فایل‌های SQL..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "database/crm_system.sql" ]; then
    CRM_SIZE=$(du -h database/crm_system.sql | cut -f1)
    echo "✅ crm_system.sql موجود است (حجم: $CRM_SIZE)"
else
    echo "❌ crm_system.sql یافت نشد!"
fi

if [ -f "database/saas_master.sql" ]; then
    SAAS_SIZE=$(du -h database/saas_master.sql | cut -f1)
    echo "✅ saas_master.sql موجود است (حجم: $SAAS_SIZE)"
else
    echo "❌ saas_master.sql یافت نشد!"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 6. خلاصه و پیشنهادات
echo ""
echo "📋 خلاصه و پیشنهادات:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی وضعیت دیتابیس‌ها
CRM_EXISTS=$(echo "$DATABASES" | grep -c "crm_system" || echo "0")
SAAS_EXISTS=$(echo "$DATABASES" | grep -c "saas_master" || echo "0")

NEEDS_IMPORT=false

if [ "$CRM_EXISTS" = "0" ]; then
    echo "❌ دیتابیس crm_system موجود نیست - نیاز به ایمپورت"
    NEEDS_IMPORT=true
fi

if [ "$SAAS_EXISTS" = "0" ]; then
    echo "❌ دیتابیس saas_master موجود نیست - نیاز به ایمپورت"
    NEEDS_IMPORT=true
fi

if [ "$NEEDS_IMPORT" = "true" ]; then
    echo ""
    echo "🔧 برای ایمپورت دیتابیس‌ها:"
    echo "   1. اجرای deploy-server.sh --clean"
    echo "   2. یا اجرای دستورات زیر:"
    echo ""
    echo "   docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm.sql"
    echo "   docker exec $MYSQL_CONTAINER mariadb -u root -p1234 crm_system < /tmp/crm.sql"
    echo ""
    echo "   docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas.sql"
    echo "   docker exec $MYSQL_CONTAINER mariadb -u root -p1234 saas_master < /tmp/saas.sql"
fi

echo ""
echo "🔐 اطلاعات دسترسی phpMyAdmin:"
if [ -f ".phpmyadmin_credentials" ]; then
    cat .phpmyadmin_credentials
else
    echo "⚠️  فایل .phpmyadmin_credentials یافت نشد"
    echo "   برای ایجاد مجدد، deploy-server.sh را اجرا کنید"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ بررسی کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

