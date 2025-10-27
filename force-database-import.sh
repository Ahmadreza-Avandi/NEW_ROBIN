#!/bin/bash

# 🔧 اسکریپت اجباری ایمپورت دیتابیس
# این اسکریپت دیتابیس‌ها را به صورت دستی ایمپورت می‌کند

set -e

echo "🔧 شروع ایمپورت اجباری دیتابیس..."
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

# بررسی وضعیت MySQL
echo ""
echo "🔍 بررسی وضعیت MySQL..."
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ MySQL در دسترس نیست!"
    echo "🚀 راه‌اندازی MySQL..."
    docker-compose -f $COMPOSE_FILE up -d mysql
    sleep 30
fi

# تست مجدد
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ MySQL هنوز در دسترس نیست!"
    exit 1
fi

echo "✅ MySQL آماده است"

# مرحله 1: ایجاد دیتابیس‌ها و کاربر
echo ""
echo "🗄️ مرحله 1: ایجاد دیتابیس‌ها و کاربر..."

docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
-- ایجاد دیتابیس‌ها
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- حذف کاربر قدیمی
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- ایجاد کاربر جدید
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- اعطای مجوزها
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;

-- نمایش دیتابیس‌های ایجاد شده
SHOW DATABASES;
EOF

echo "✅ دیتابیس‌ها و کاربر ایجاد شدند"

# مرحله 2: ایمپورت crm_system
echo ""
echo "📥 مرحله 2: ایمپورت crm_system..."

if [ -f "database/crm_system.sql" ]; then
    echo "📋 استفاده از database/crm_system.sql"
    CRM_FILE="database/crm_system.sql"
elif [ -f "database/01-crm_system.sql" ]; then
    echo "📋 استفاده از database/01-crm_system.sql"
    CRM_FILE="database/01-crm_system.sql"
elif [ -f "دیتابیس.sql" ]; then
    echo "📋 استفاده از دیتابیس.sql"
    CRM_FILE="دیتابیس.sql"
else
    echo "❌ فایل crm_system یافت نشد!"
    exit 1
fi

# کپی فایل به کانتینر
MYSQL_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q mysql)
echo "📋 کپی فایل $CRM_FILE به کانتینر..."
docker cp "$CRM_FILE" $MYSQL_CONTAINER:/tmp/crm_import.sql

# ایمپورت
echo "⏳ ایمپورت crm_system (ممکن است چند دقیقه طول بکشد)..."
docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p1234 crm_system < /tmp/crm_import.sql" 2>&1 | grep -v "Warning" || true

# بررسی نتیجه
CRM_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$CRM_TABLE_COUNT" -gt 1 ]; then
    echo "✅ crm_system با موفقیت ایمپورت شد - تعداد جداول: $((CRM_TABLE_COUNT - 1))"
else
    echo "❌ ایمپورت crm_system ناموفق!"
fi

# مرحله 3: ایمپورت saas_master
echo ""
echo "📥 مرحله 3: ایمپورت saas_master..."

if [ -f "database/saas_master.sql" ]; then
    echo "📋 استفاده از database/saas_master.sql"
    SAAS_FILE="database/saas_master.sql"
elif [ -f "database/02-saas_master.sql" ]; then
    echo "📋 استفاده از database/02-saas_master.sql"
    SAAS_FILE="database/02-saas_master.sql"
else
    echo "⚠️  فایل saas_master یافت نشد - ایجاد ساختار پایه..."
    
    # ایجاد ساختار پایه saas_master
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 << 'EOF'
USE `saas_master`;

CREATE TABLE IF NOT EXISTS `super_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `super_admins` (`username`, `email`, `password`, `full_name`, `is_active`) VALUES
('Ahmadreza.avandi', 'ahmadrezaavandi@gmail.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'احمدرضا اوندی', 1)
ON DUPLICATE KEY UPDATE `is_active` = 1;

CREATE TABLE IF NOT EXISTS `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_key` varchar(50) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `admin_email` varchar(255) NOT NULL,
  `subscription_status` enum('active','expired','suspended','trial') DEFAULT 'trial',
  `subscription_plan` enum('basic','professional','enterprise','custom') DEFAULT 'basic',
  `subscription_start` date DEFAULT NULL,
  `subscription_end` date DEFAULT NULL,
  `max_users` int(11) DEFAULT 5,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_key` (`tenant_key`),
  UNIQUE KEY `admin_email` (`admin_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF
    
    SAAS_FILE=""
fi

# اگر فایل saas_master موجود است، ایمپورت کن
if [ -n "$SAAS_FILE" ] && [ -f "$SAAS_FILE" ]; then
    echo "📋 کپی فایل $SAAS_FILE به کانتینر..."
    docker cp "$SAAS_FILE" $MYSQL_CONTAINER:/tmp/saas_import.sql
    
    echo "⏳ ایمپورت saas_master..."
    docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p1234 saas_master < /tmp/saas_import.sql" 2>&1 | grep -v "Warning" || true
fi

# بررسی نتیجه saas_master
SAAS_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
if [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
    echo "✅ saas_master با موفقیت ایمپورت شد - تعداد جداول: $((SAAS_TABLE_COUNT - 1))"
else
    echo "❌ ایمپورت saas_master ناموفق!"
fi

# مرحله 4: تست نهایی
echo ""
echo "🧪 مرحله 4: تست نهایی..."

# تست کاربر crm_user
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user آماده است"
    
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
    echo "❌ کاربر crm_user مشکل دارد!"
fi

# نمایش خلاصه
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه نهایی:"

# نمایش دیتابیس‌ها
echo "🗄️ دیتابیس‌های موجود:"
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" | sed 's/^/   ✅ /'

# نمایش جداول crm_system
if [ "$CRM_TABLE_COUNT" -gt 1 ]; then
    echo "📋 جداول crm_system ($((CRM_TABLE_COUNT - 1)) جدول):"
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | head -10 | tail -5 | sed 's/^/   • /'
fi

# نمایش جداول saas_master
if [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
    echo "📋 جداول saas_master ($((SAAS_TABLE_COUNT - 1)) جدول):"
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | head -10 | tail -5 | sed 's/^/   • /'
fi

echo ""
echo "✅ ایمپورت اجباری دیتابیس کامل شد!"
echo ""
echo "🔧 دستورات تست:"
echo "   • تست اتصال: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"SELECT 1;\""
echo "   • مشاهده جداول crm: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "   • مشاهده جداول saas: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SHOW TABLES;\""
echo "   • ورود به MySQL: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234"