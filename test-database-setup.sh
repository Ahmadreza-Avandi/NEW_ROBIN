#!/bin/bash

# ===========================================
# 🧪 اسکریپت تست تنظیمات دیتابیس
# ===========================================
# این اسکریپت قبل از deploy اجرا می‌شود
# تا مطمئن شویم همه فایل‌ها درست هستند
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست تنظیمات دیتابیس"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# بررسی وجود فایل‌ها
echo "📁 بررسی وجود فایل‌های SQL..."
echo ""

REQUIRED_FILES=(
    "database/00-init-databases.sql"
    "database/crm_system.sql"
    "database/saas_master.sql"
    "database/03-admin-users.sql"
)

ALL_OK=true

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        SIZE=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")
        if [ "$SIZE" -gt 100 ]; then
            echo "✅ $file"
            echo "   📊 اندازه: $SIZE bytes"
        else
            echo "❌ $file - خیلی کوچک (ممکن است خالی باشد)"
            ALL_OK=false
        fi
    else
        echo "❌ $file - یافت نشد!"
        ALL_OK=false
    fi
    echo ""
done

# بررسی محتوای فایل‌ها
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 بررسی محتوای فایل‌ها..."
echo ""

# بررسی 00-init-databases.sql
if [ -f "database/00-init-databases.sql" ]; then
    echo "📄 00-init-databases.sql:"
    
    if grep -q "CREATE DATABASE.*crm_system" database/00-init-databases.sql; then
        echo "   ✅ ایجاد دیتابیس crm_system"
    else
        echo "   ❌ ایجاد دیتابیس crm_system یافت نشد"
        ALL_OK=false
    fi
    
    if grep -q "CREATE DATABASE.*saas_master" database/00-init-databases.sql; then
        echo "   ✅ ایجاد دیتابیس saas_master"
    else
        echo "   ❌ ایجاد دیتابیس saas_master یافت نشد"
        ALL_OK=false
    fi
    
    if grep -q "GRANT.*crm_user" database/00-init-databases.sql; then
        echo "   ✅ دسترسی‌های کاربر crm_user"
    else
        echo "   ❌ دسترسی‌های کاربر crm_user یافت نشد"
        ALL_OK=false
    fi
    echo ""
fi

# بررسی crm_system.sql
if [ -f "database/crm_system.sql" ]; then
    echo "📄 crm_system.sql:"
    
    if grep -q "USE.*crm_system" database/crm_system.sql; then
        echo "   ✅ USE statement موجود است"
    else
        echo "   ⚠️  USE statement یافت نشد - اضافه می‌شود"
    fi
    
    TABLE_COUNT=$(grep -c "CREATE TABLE" database/crm_system.sql || echo "0")
    echo "   📊 تعداد جداول: $TABLE_COUNT"
    
    if [ "$TABLE_COUNT" -lt 5 ]; then
        echo "   ⚠️  تعداد جداول کم است"
        ALL_OK=false
    fi
    echo ""
fi

# بررسی saas_master.sql
if [ -f "database/saas_master.sql" ]; then
    echo "📄 saas_master.sql:"
    
    if grep -q "USE.*saas_master" database/saas_master.sql; then
        echo "   ✅ USE statement موجود است"
    else
        echo "   ⚠️  USE statement یافت نشد - اضافه می‌شود"
    fi
    
    TABLE_COUNT=$(grep -c "CREATE TABLE" database/saas_master.sql || echo "0")
    echo "   📊 تعداد جداول: $TABLE_COUNT"
    
    if [ "$TABLE_COUNT" -lt 2 ]; then
        echo "   ⚠️  تعداد جداول کم است"
        ALL_OK=false
    fi
    echo ""
fi

# بررسی 03-admin-users.sql
if [ -f "database/03-admin-users.sql" ]; then
    echo "📄 03-admin-users.sql:"
    
    if grep -q "USE.*crm_system" database/03-admin-users.sql; then
        echo "   ✅ بخش CRM موجود است"
    fi
    
    if grep -q "USE.*saas_master" database/03-admin-users.sql; then
        echo "   ✅ بخش SaaS موجود است"
    fi
    
    if grep -q "Ahmadreza.avandi" database/03-admin-users.sql; then
        echo "   ✅ Super Admin موجود است"
    fi
    echo ""
fi

# بررسی docker-compose.yml
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 بررسی docker-compose.yml..."
echo ""

if [ -f "docker-compose.yml" ]; then
    if grep -q "database/crm_system.sql:/docker-entrypoint-initdb.d/01-crm_system.sql" docker-compose.yml; then
        echo "✅ Mount crm_system.sql درست است"
    else
        echo "❌ Mount crm_system.sql اشتباه است"
        ALL_OK=false
    fi
    
    if grep -q "database/saas_master.sql:/docker-entrypoint-initdb.d/02-saas_master.sql" docker-compose.yml; then
        echo "✅ Mount saas_master.sql درست است"
    else
        echo "❌ Mount saas_master.sql اشتباه است"
        ALL_OK=false
    fi
    
    if grep -q "MYSQL_USER.*crm_user" docker-compose.yml; then
        echo "✅ کاربر MySQL: crm_user"
    fi
    
    if grep -q "MYSQL_PASSWORD.*1234" docker-compose.yml; then
        echo "✅ رمز عبور MySQL: 1234"
    fi
else
    echo "❌ docker-compose.yml یافت نشد!"
    ALL_OK=false
fi

# نتیجه نهایی
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ALL_OK" = true ]; then
    echo "✅ همه چیز آماده است!"
    echo ""
    echo "🚀 می‌توانید اسکریپت deploy را اجرا کنید:"
    echo "   ./deploy-server.sh"
    echo ""
    echo "   یا برای rebuild کامل:"
    echo "   ./deploy-server.sh --clean"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo "❌ برخی مشکلات وجود دارد!"
    echo ""
    echo "💡 راه‌حل‌ها:"
    echo "   1. مطمئن شوید فایل‌های SQL در پوشه database/ هستند"
    echo "   2. اگر USE statement ندارند، اسکریپت deploy خودکار اضافه می‌کند"
    echo "   3. docker-compose.yml را بررسی کنید"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 1
fi
