#!/bin/bash

# ===========================================
# 🧪 تست تنظیمات .env و Docker
# ===========================================
# این اسکریپت بررسی می‌کنه که همه چیز درست تنظیم شده
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست تنظیمات .env و Docker"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# بررسی وجود فایل .env
if [ ! -f ".env" ]; then
    echo "❌ فایل .env یافت نشد!"
    echo "🔧 لطفاً ابتدا اسکریپت setup-env.sh را اجرا کنید:"
    echo "   bash setup-env.sh"
    exit 1
fi

echo "✅ فایل .env موجود است"
echo ""

# بارگذاری متغیرهای محیطی
set -a
source .env
set +a

# نمایش تنظیمات فعلی
echo "📋 تنظیمات فعلی از .env:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 NODE_ENV: ${NODE_ENV:-not set}"
echo "🗄️ DATABASE_HOST: ${DATABASE_HOST:-not set}"
echo "👤 DATABASE_USER: ${DATABASE_USER:-not set}"
echo "🔑 DATABASE_PASSWORD: ${DATABASE_PASSWORD:-not set}"
echo "📊 DATABASE_NAME: ${DATABASE_NAME:-not set}"
echo "📊 SAAS_DATABASE_NAME: ${SAAS_DATABASE_NAME:-not set}"
echo ""

# بررسی متغیرهای ضروری
echo "🔍 بررسی متغیرهای ضروری..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

MISSING=0

if [ -z "$DATABASE_HOST" ]; then
    echo "❌ DATABASE_HOST تنظیم نشده"
    MISSING=$((MISSING + 1))
else
    echo "✅ DATABASE_HOST: $DATABASE_HOST"
fi

if [ -z "$DATABASE_USER" ]; then
    echo "❌ DATABASE_USER تنظیم نشده"
    MISSING=$((MISSING + 1))
else
    echo "✅ DATABASE_USER: $DATABASE_USER"
fi

if [ -z "$DATABASE_PASSWORD" ]; then
    echo "❌ DATABASE_PASSWORD تنظیم نشده"
    MISSING=$((MISSING + 1))
else
    echo "✅ DATABASE_PASSWORD: ****"
fi

if [ -z "$DATABASE_NAME" ]; then
    echo "❌ DATABASE_NAME تنظیم نشده"
    MISSING=$((MISSING + 1))
else
    echo "✅ DATABASE_NAME: $DATABASE_NAME"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ JWT_SECRET تنظیم نشده"
    MISSING=$((MISSING + 1))
else
    echo "✅ JWT_SECRET: ****"
fi

echo ""

if [ $MISSING -gt 0 ]; then
    echo "⚠️  $MISSING متغیر ضروری تنظیم نشده!"
    echo "🔧 لطفاً فایل .env را ویرایش کنید"
    exit 1
fi

# بررسی فایل‌های Docker
echo "🐳 بررسی فایل‌های Docker..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "docker-compose.yml" ]; then
    echo "✅ docker-compose.yml موجود است"
    
    # بررسی تنظیمات MySQL در docker-compose
    if grep -q "MYSQL_USER.*DATABASE_USER" docker-compose.yml; then
        echo "✅ MySQL از DATABASE_USER استفاده می‌کند"
    else
        echo "⚠️  MySQL ممکن است از DATABASE_USER استفاده نکند"
    fi
    
    if grep -q "MYSQL_PASSWORD.*DATABASE_PASSWORD" docker-compose.yml; then
        echo "✅ MySQL از DATABASE_PASSWORD استفاده می‌کند"
    else
        echo "⚠️  MySQL ممکن است از DATABASE_PASSWORD استفاده نکند"
    fi
    
    # بررسی تنظیمات phpMyAdmin
    if grep -q "PMA_USER.*DATABASE_USER" docker-compose.yml; then
        echo "✅ phpMyAdmin از DATABASE_USER استفاده می‌کند"
    else
        echo "⚠️  phpMyAdmin ممکن است از DATABASE_USER استفاده نکند"
    fi
else
    echo "❌ docker-compose.yml یافت نشد!"
fi

if [ -f "docker-compose.memory-optimized.yml" ]; then
    echo "✅ docker-compose.memory-optimized.yml موجود است"
else
    echo "⚠️  docker-compose.memory-optimized.yml یافت نشد"
fi

echo ""

# بررسی فایل‌های دیتابیس
echo "🗄️ بررسی فایل‌های دیتابیس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "database/init.sql" ]; then
    echo "✅ database/init.sql موجود است"
    
    # بررسی اینکه هر دو کاربر در init.sql هستند
    if grep -q "crm_user" database/init.sql; then
        echo "✅ کاربر crm_user در init.sql تعریف شده (برای لوکال)"
    else
        echo "⚠️  کاربر crm_user در init.sql یافت نشد"
    fi
    
    if grep -q "crm_app_user" database/init.sql; then
        echo "✅ کاربر crm_app_user در init.sql تعریف شده (برای سرور)"
    else
        echo "⚠️  کاربر crm_app_user در init.sql یافت نشد"
    fi
    
    # بررسی دیتابیس‌ها
    if grep -q "crm_system" database/init.sql; then
        echo "✅ دیتابیس crm_system در init.sql تعریف شده"
    else
        echo "⚠️  دیتابیس crm_system در init.sql یافت نشد"
    fi
    
    if grep -q "saas_master" database/init.sql; then
        echo "✅ دیتابیس saas_master در init.sql تعریف شده"
    else
        echo "⚠️  دیتابیس saas_master در init.sql یافت نشد"
    fi
else
    echo "❌ database/init.sql یافت نشد!"
fi

echo ""

# خلاصه نهایی
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه تنظیمات"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 اطلاعات دسترسی دیتابیس:"
echo "   Host: $DATABASE_HOST"
echo "   User: $DATABASE_USER"
echo "   Password: $DATABASE_PASSWORD"
echo "   Database: $DATABASE_NAME"
echo ""
echo "🔐 اطلاعات دسترسی phpMyAdmin:"
echo "   URL: /secure-db-admin-panel-x7k9m2/"
echo "   Username: $DATABASE_USER"
echo "   Password: $DATABASE_PASSWORD"
echo ""
echo "🔐 اطلاعات دسترسی Root:"
echo "   Username: root"
echo "   Password: ${DATABASE_PASSWORD}_ROOT"
echo ""

# تست اتصال به دیتابیس (اگر Docker در حال اجراست)
if command -v docker &> /dev/null; then
    echo "🧪 تست اتصال به دیتابیس..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # بررسی اینکه MySQL container در حال اجراست
    if docker ps --format '{{.Names}}' | grep -qE "(mysql|crm-mysql)"; then
        MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|crm-mysql)" | head -1)
        echo "✅ MySQL container در حال اجراست: $MYSQL_CONTAINER"
        
        # تست اتصال با root
        echo ""
        echo "🔐 تست اتصال با root..."
        if docker exec $MYSQL_CONTAINER mariadb -u root -p"${DATABASE_PASSWORD}_ROOT" -e "SELECT VERSION();" >/dev/null 2>&1; then
            echo "✅ اتصال با root موفق"
            
            VERSION=$(docker exec $MYSQL_CONTAINER mariadb -u root -p"${DATABASE_PASSWORD}_ROOT" -e "SELECT VERSION();" 2>/dev/null | tail -1)
            echo "   نسخه: $VERSION"
        else
            echo "❌ اتصال با root ناموفق!"
        fi
        
        # تست اتصال با کاربر عادی
        echo ""
        echo "👤 تست اتصال با $DATABASE_USER..."
        if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ اتصال با $DATABASE_USER موفق"
            
            # بررسی دسترسی به crm_system
            if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
                echo "✅ دسترسی به crm_system موجود است"
            else
                echo "❌ دسترسی به crm_system وجود ندارد!"
            fi
            
            # بررسی دسترسی به saas_master
            if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
                echo "✅ دسترسی به saas_master موجود است"
            else
                echo "⚠️  دسترسی به saas_master وجود ندارد"
            fi
        else
            echo "❌ اتصال با $DATABASE_USER ناموفق!"
            echo ""
            echo "🔧 برای رفع مشکل:"
            echo "   1. مطمئن شوید که Docker container ها در حال اجرا هستند"
            echo "   2. اسکریپت deploy را مجدداً اجرا کنید"
            echo "   3. یا دستور زیر را اجرا کنید:"
            echo "      docker-compose restart mysql"
        fi
        
        # نمایش کاربران موجود
        echo ""
        echo "👥 کاربران موجود در دیتابیس:"
        docker exec $MYSQL_CONTAINER mariadb -u root -p"${DATABASE_PASSWORD}_ROOT" -e "SELECT User, Host FROM mysql.user WHERE User IN ('root', 'crm_user', 'crm_app_user');" 2>/dev/null || echo "   نمی‌توان لیست کاربران را دریافت کرد"
        
    else
        echo "⚠️  MySQL container در حال اجرا نیست"
        echo ""
        echo "🔧 برای راه‌اندازی Docker:"
        echo "   docker-compose up -d"
        echo "   یا"
        echo "   bash deploy-server.sh"
    fi
else
    echo "⚠️  Docker نصب نیست یا در دسترس نیست"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ تست تنظیمات کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
