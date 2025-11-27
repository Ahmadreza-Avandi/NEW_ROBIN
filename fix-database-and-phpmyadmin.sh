#!/bin/bash

# 🔧 اسکریپت رفع مشکل دیتابیس و phpMyAdmin
set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 رفع مشکل دیتابیس و phpMyAdmin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

COMPOSE_FILE="docker-compose.deploy.yml"

# 1. نمایش رمز phpMyAdmin
echo "🔐 اطلاعات دسترسی phpMyAdmin:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f ".phpmyadmin_credentials" ]; then
    cat .phpmyadmin_credentials
    echo ""
    echo "📋 خلاصه:"
    PHPMYADMIN_USER=$(grep "Username:" .phpmyadmin_credentials | cut -d: -f2 | tr -d ' ')
    PHPMYADMIN_PASS=$(grep "Password:" .phpmyadmin_credentials | head -1 | cut -d: -f2 | tr -d ' ')
    echo "   Username: $PHPMYADMIN_USER"
    echo "   Password: $PHPMYADMIN_PASS"
else
    echo "⚠️  فایل .phpmyadmin_credentials یافت نشد!"
    echo "🔧 ایجاد مجدد..."
    
    # ایجاد username و password تصادفی
    PHPMYADMIN_USER="dbadmin_$(date +%s | sha256sum | base64 | head -c 8)"
    PHPMYADMIN_PASS="$(date +%s | sha256sum | base64 | head -c 24)"
    
    cat > .phpmyadmin_credentials << EOF
# phpMyAdmin Access Credentials
# ================================
# URL: https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
# 
# Basic Auth (nginx):
# Username: $PHPMYADMIN_USER
# Password: $PHPMYADMIN_PASS
#
# MySQL Login:
# Username: crm_user
# Password: 1234
# 
# MySQL Root:
# Username: root
# Password: 1234
# ================================
EOF
    
    chmod 600 .phpmyadmin_credentials
    
    # ایجاد فایل .htpasswd
    HASHED_PASS=$(openssl passwd -apr1 "$PHPMYADMIN_PASS" 2>/dev/null || echo "$PHPMYADMIN_PASS")
    echo "$PHPMYADMIN_USER:$HASHED_PASS" > nginx/.htpasswd
    chmod 644 nginx/.htpasswd
    
    echo "✅ فایل .phpmyadmin_credentials ایجاد شد"
    cat .phpmyadmin_credentials
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 2. بررسی وضعیت دیتابیس‌ها
echo "🔍 بررسی وضعیت دیتابیس‌ها..."
echo ""

CRM_EXISTS=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'crm_system';" 2>/dev/null | grep -c "crm_system" || echo "0")
SAAS_EXISTS=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'saas_master';" 2>/dev/null | grep -c "saas_master" || echo "0")

if [ "$CRM_EXISTS" = "0" ]; then
    echo "❌ دیتابیس crm_system موجود نیست"
    NEEDS_IMPORT=true
else
    echo "✅ دیتابیس crm_system موجود است"
    
    # بررسی جداول
    TABLE_COUNT=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
    if [ "$TABLE_COUNT" -le 1 ]; then
        echo "⚠️  دیتابیس crm_system خالی است (بدون جدول)"
        NEEDS_IMPORT=true
    else
        echo "✅ دیتابیس crm_system دارای $((TABLE_COUNT - 1)) جدول است"
    fi
fi

if [ "$SAAS_EXISTS" = "0" ]; then
    echo "❌ دیتابیس saas_master موجود نیست"
    NEEDS_IMPORT=true
else
    echo "✅ دیتابیس saas_master موجود است"
    
    # بررسی جداول
    TABLE_COUNT=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
    if [ "$TABLE_COUNT" -le 1 ]; then
        echo "⚠️  دیتابیس saas_master خالی است (بدون جدول)"
        NEEDS_IMPORT=true
    else
        echo "✅ دیتابیس saas_master دارای $((TABLE_COUNT - 1)) جدول است"
    fi
fi

echo ""

# 3. ایمپورت دیتابیس‌ها
if [ "$NEEDS_IMPORT" = "true" ]; then
    echo "📥 شروع ایمپورت دیتابیس‌ها..."
    echo ""
    
    # بررسی وجود فایل‌های SQL
    if [ ! -f "database/crm_system.sql" ]; then
        echo "❌ فایل database/crm_system.sql یافت نشد!"
        exit 1
    fi
    
    if [ ! -f "database/saas_master.sql" ]; then
        echo "❌ فایل database/saas_master.sql یافت نشد!"
        exit 1
    fi
    
    # ایمپورت crm_system
    if [ "$CRM_EXISTS" = "0" ] || [ "$TABLE_COUNT" -le 1 ]; then
        echo "📥 ایمپورت crm_system..."
        MYSQL_CONTAINER=$(docker compose -f $COMPOSE_FILE ps -q mysql)
        
        if [ -n "$MYSQL_CONTAINER" ]; then
            # کپی فایل به کانتینر
            docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
            
            # ایمپورت
            echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
            docker compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p1234 crm_system < /tmp/crm_import.sql" 2>&1 | grep -v "Warning" || true
            
            sleep 3
            
            # بررسی مجدد
            NEW_TABLE_COUNT=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
            if [ "$NEW_TABLE_COUNT" -gt 1 ]; then
                echo "✅ crm_system با موفقیت ایمپورت شد - جداول: $((NEW_TABLE_COUNT - 1))"
            else
                echo "❌ ایمپورت crm_system ناموفق"
            fi
        fi
    fi
    
    # ایمپورت saas_master
    if [ "$SAAS_EXISTS" = "0" ]; then
        echo "📥 ایمپورت saas_master..."
        MYSQL_CONTAINER=$(docker compose -f $COMPOSE_FILE ps -q mysql)
        
        if [ -n "$MYSQL_CONTAINER" ]; then
            # کپی فایل به کانتینر
            docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas_import.sql
            
            # ایمپورت
            echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
            docker compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p1234 saas_master < /tmp/saas_import.sql" 2>&1 | grep -v "Warning" || true
            
            sleep 3
            
            # بررسی مجدد
            NEW_TABLE_COUNT=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
            if [ "$NEW_TABLE_COUNT" -gt 1 ]; then
                echo "✅ saas_master با موفقیت ایمپورت شد - جداول: $((NEW_TABLE_COUNT - 1))"
            else
                echo "❌ ایمپورت saas_master ناموفق"
            fi
        fi
    fi
    
    echo ""
fi

# 4. اطمینان از دسترسی کاربر crm_user
echo "🔧 اطمینان از دسترسی کاربر crm_user..."
docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "
    GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
    GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'localhost';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'localhost';
    FLUSH PRIVILEGES;
" 2>/dev/null || true

echo "✅ دسترسی‌ها تنظیم شد"
echo ""

# 5. راه‌اندازی مجدد NextJS برای اعمال تغییرات
echo "🔄 راه‌اندازی مجدد NextJS..."
docker compose -f $COMPOSE_FILE restart nextjs
sleep 5

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ همه کارها انجام شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 اطلاعات دسترسی:"
echo ""
echo "🔐 phpMyAdmin:"
if [ -f ".phpmyadmin_credentials" ]; then
    PHPMYADMIN_USER=$(grep "Username:" .phpmyadmin_credentials | cut -d: -f2 | tr -d ' ')
    PHPMYADMIN_PASS=$(grep "Password:" .phpmyadmin_credentials | head -1 | cut -d: -f2 | tr -d ' ')
    echo "   URL: https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
    echo "   Basic Auth Username: $PHPMYADMIN_USER"
    echo "   Basic Auth Password: $PHPMYADMIN_PASS"
    echo "   MySQL Username: crm_user"
    echo "   MySQL Password: 1234"
fi
echo ""
echo "🔐 CRM Login:"
echo "   Email: Robintejarat@gmail.com"
echo "   Password: 1234 (یا رمز موجود در دیتابیس)"
echo ""

