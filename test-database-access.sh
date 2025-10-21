#!/bin/bash

# 🔍 اسکریپت تست و رفع مشکل دسترسی دیتابیس
set -e

echo "🔍 تست دسترسی دیتابیس و phpMyAdmin"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بارگذاری متغیرهای محیطی
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
    echo "✅ متغیرهای محیطی بارگذاری شد"
else
    echo "❌ فایل .env یافت نشد!"
    exit 1
fi

# تشخیص فایل docker-compose
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.memory-optimized.yml" ]; then
    COMPOSE_FILE="docker-compose.memory-optimized.yml"
else
    COMPOSE_FILE="docker-compose.yml"
fi

echo "📋 استفاده از: $COMPOSE_FILE"
echo ""

# ═══════════════════════════════════════════════════════════════
# 1. بررسی وضعیت کانتینر MySQL
# ═══════════════════════════════════════════════════════════════

echo "1️⃣ بررسی وضعیت کانتینر MySQL..."
if docker ps | grep -q mysql; then
    MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep mysql | head -1)
    echo "✅ کانتینر MySQL در حال اجراست: $MYSQL_CONTAINER"
else
    echo "❌ کانتینر MySQL در حال اجرا نیست!"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. تست اتصال با root
# ═══════════════════════════════════════════════════════════════

echo "2️⃣ تست اتصال با root..."
ROOT_PASSWORD="${DATABASE_PASSWORD}_ROOT"

if docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "SELECT VERSION();" >/dev/null 2>&1; then
    VERSION=$(docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "SELECT VERSION();" 2>/dev/null | tail -1)
    echo "✅ اتصال root موفق - نسخه: $VERSION"
else
    echo "❌ اتصال root ناموفق!"
    echo "🔍 رمز عبور root: $ROOT_PASSWORD"
    exit 1
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. بررسی دیتابیس‌ها
# ═══════════════════════════════════════════════════════════════

echo "3️⃣ بررسی دیتابیس‌های موجود..."
DATABASES=$(docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "SHOW DATABASES;" 2>/dev/null | tail -n +2)

echo "📊 دیتابیس‌های موجود:"
echo "$DATABASES"

if echo "$DATABASES" | grep -q "crm_system"; then
    echo "✅ دیتابیس crm_system موجود است"
else
    echo "❌ دیتابیس crm_system موجود نیست!"
fi

if echo "$DATABASES" | grep -q "saas_master"; then
    echo "✅ دیتابیس saas_master موجود است"
else
    echo "⚠️  دیتابیس saas_master موجود نیست"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 4. بررسی کاربران
# ═══════════════════════════════════════════════════════════════

echo "4️⃣ بررسی کاربران موجود..."
USERS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "SELECT User, Host FROM mysql.user;" 2>/dev/null | tail -n +2)

echo "👥 کاربران موجود:"
echo "$USERS"

if echo "$USERS" | grep -q "$DATABASE_USER"; then
    echo "✅ کاربر $DATABASE_USER موجود است"
else
    echo "❌ کاربر $DATABASE_USER موجود نیست!"
    echo "🔧 ایجاد کاربر..."
    
    docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "
        CREATE USER IF NOT EXISTS '$DATABASE_USER'@'%' IDENTIFIED BY '$DATABASE_PASSWORD';
        CREATE USER IF NOT EXISTS '$DATABASE_USER'@'localhost' IDENTIFIED BY '$DATABASE_PASSWORD';
    " 2>/dev/null
    
    echo "✅ کاربر ایجاد شد"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 5. تست اتصال با کاربر عادی
# ═══════════════════════════════════════════════════════════════

echo "5️⃣ تست اتصال با کاربر $DATABASE_USER..."

if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ اتصال با کاربر $DATABASE_USER موفق"
else
    echo "❌ اتصال با کاربر $DATABASE_USER ناموفق!"
    echo "🔧 تلاش برای رفع مشکل..."
    
    # ریست رمز عبور
    docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "
        ALTER USER '$DATABASE_USER'@'%' IDENTIFIED BY '$DATABASE_PASSWORD';
        ALTER USER '$DATABASE_USER'@'localhost' IDENTIFIED BY '$DATABASE_PASSWORD';
        FLUSH PRIVILEGES;
    " 2>/dev/null
    
    # تست مجدد
    if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ مشکل برطرف شد"
    else
        echo "❌ مشکل همچنان وجود دارد"
    fi
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 6. بررسی دسترسی‌ها
# ═══════════════════════════════════════════════════════════════

echo "6️⃣ بررسی دسترسی‌های کاربر $DATABASE_USER..."

GRANTS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "SHOW GRANTS FOR '$DATABASE_USER'@'%';" 2>/dev/null | tail -n +2)

echo "🔐 دسترسی‌های فعلی:"
echo "$GRANTS"

# بررسی دسترسی به crm_system
if echo "$GRANTS" | grep -q "crm_system"; then
    echo "✅ دسترسی به crm_system موجود است"
else
    echo "❌ دسترسی به crm_system موجود نیست!"
    echo "🔧 اضافه کردن دسترسی..."
    
    docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "
        GRANT ALL PRIVILEGES ON crm_system.* TO '$DATABASE_USER'@'%';
        GRANT ALL PRIVILEGES ON crm_system.* TO '$DATABASE_USER'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null
    
    echo "✅ دسترسی اضافه شد"
fi

# بررسی دسترسی به saas_master
if echo "$GRANTS" | grep -q "saas_master"; then
    echo "✅ دسترسی به saas_master موجود است"
else
    echo "⚠️  دسترسی به saas_master موجود نیست"
    echo "🔧 اضافه کردن دسترسی..."
    
    docker exec $MYSQL_CONTAINER mariadb -u root -p"$ROOT_PASSWORD" -e "
        GRANT ALL PRIVILEGES ON saas_master.* TO '$DATABASE_USER'@'%';
        GRANT ALL PRIVILEGES ON saas_master.* TO '$DATABASE_USER'@'localhost';
        FLUSH PRIVILEGES;
    " 2>/dev/null
    
    echo "✅ دسترسی اضافه شد"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 7. تست عملیات CRUD
# ═══════════════════════════════════════════════════════════════

echo "7️⃣ تست عملیات CRUD با کاربر $DATABASE_USER..."

# تست SELECT
if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
    echo "✅ SELECT روی crm_system موفق"
else
    echo "❌ SELECT روی crm_system ناموفق"
fi

# تست CREATE TABLE
if docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "USE crm_system; CREATE TABLE IF NOT EXISTS test_table (id INT);" >/dev/null 2>&1; then
    echo "✅ CREATE TABLE روی crm_system موفق"
    
    # پاک کردن جدول تست
    docker exec $MYSQL_CONTAINER mariadb -u "$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "USE crm_system; DROP TABLE IF EXISTS test_table;" >/dev/null 2>&1
else
    echo "❌ CREATE TABLE روی crm_system ناموفق"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 8. بررسی phpMyAdmin
# ═══════════════════════════════════════════════════════════════

echo "8️⃣ بررسی phpMyAdmin..."

if docker ps | grep -q phpmyadmin; then
    PHPMYADMIN_CONTAINER=$(docker ps --format '{{.Names}}' | grep phpmyadmin | head -1)
    echo "✅ کانتینر phpMyAdmin در حال اجراست: $PHPMYADMIN_CONTAINER"
    
    # بررسی متغیرهای محیطی phpMyAdmin
    echo ""
    echo "🔍 تنظیمات phpMyAdmin:"
    docker exec $PHPMYADMIN_CONTAINER env | grep PMA || true
    
else
    echo "⚠️  کانتینر phpMyAdmin در حال اجرا نیست"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 9. خلاصه نهایی
# ═══════════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه نهایی"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔐 اطلاعات ورود به phpMyAdmin:"
echo "   آدرس: http://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/"
echo ""
echo "   گزینه 1 (کاربر عادی - توصیه می‌شود):"
echo "   - Username: $DATABASE_USER"
echo "   - Password: $DATABASE_PASSWORD"
echo ""
echo "   گزینه 2 (root):"
echo "   - Username: root"
echo "   - Password: $ROOT_PASSWORD"
echo ""
echo "📚 برای اطلاعات بیشتر، فایل PHPMYADMIN-LOGIN.md را مطالعه کنید"
echo ""
echo "✅ تست کامل شد!"
