#!/bin/bash

# 🔧 اسکریپت رفع مشکل ایمپورت دیتابیس
# این اسکریپت مشکلات ایمپورت دیتابیس در deploy-server.sh را حل می‌کند

set -e

echo "🔧 شروع رفع مشکل ایمپورت دیتابیس..."
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

# مرحله 1: بررسی و آماده‌سازی فایل‌های SQL
echo ""
echo "📋 مرحله 1: بررسی فایل‌های SQL..."

# ایجاد پوشه database اگر وجود ندارد
mkdir -p database

# بررسی فایل‌های موجود
echo "🔍 فایل‌های SQL موجود:"
find . -name "*.sql" -type f | head -10

# آماده‌سازی فایل init اصلی
echo ""
echo "📝 آماده‌سازی فایل init..."
cat > database/00-init-databases.sql << 'EOF'
-- ===========================================
-- Database Initialization Script for CRM System
-- ===========================================

-- Create CRM System Database
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SaaS Master Database  
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges (compatible with lib/database.ts)
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- Create user with password '1234' (matching lib/database.ts default)
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- Grant all privileges on both databases
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';
EOF

# کپی فایل‌های اصلی دیتابیس
echo ""
echo "📋 کپی فایل‌های دیتابیس..."

# کپی crm_system.sql
CRM_COPIED=false
if [ -f "database/crm_system.sql" ]; then
    echo "✅ database/crm_system.sql موجود است"
    cp database/crm_system.sql database/01-crm_system.sql
    CRM_COPIED=true
elif [ -f "crm_system.sql" ]; then
    echo "📋 کپی crm_system.sql از root..."
    cp crm_system.sql database/01-crm_system.sql
    CRM_COPIED=true
elif [ -f "دیتابیس.sql" ]; then
    echo "📋 استفاده از دیتابیس.sql..."
    cp "دیتابیس.sql" database/01-crm_system.sql
    CRM_COPIED=true
else
    echo "❌ فایل crm_system.sql یافت نشد!"
    echo "🔍 جستجوی فایل‌های SQL..."
    find . -name "*crm*" -name "*.sql" -o -name "*دیتابیس*" -name "*.sql" | head -5
    exit 1
fi

# کپی saas_master.sql
SAAS_COPIED=false
if [ -f "database/saas_master.sql" ]; then
    echo "✅ database/saas_master.sql موجود است"
    cp database/saas_master.sql database/02-saas_master.sql
    SAAS_COPIED=true
elif [ -f "saas_master.sql" ]; then
    echo "📋 کپی saas_master.sql از root..."
    cp saas_master.sql database/02-saas_master.sql
    SAAS_COPIED=true
else
    echo "⚠️  فایل saas_master.sql یافت نشد - ایجاد فایل پایه..."
    cat > database/02-saas_master.sql << 'EOF'
USE `saas_master`;

-- جداول پایه SaaS Master
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

-- ایجاد Super Admin پیش‌فرض
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
    SAAS_COPIED=true
fi

# اضافه کردن USE statements
if [ "$CRM_COPIED" = true ]; then
    echo "🔧 اضافه کردن USE statement به crm_system..."
    sed -i '/^USE /d' database/01-crm_system.sql
    sed -i '1i USE `crm_system`;' database/01-crm_system.sql
fi

if [ "$SAAS_COPIED" = true ]; then
    echo "🔧 اضافه کردن USE statement به saas_master..."
    sed -i '/^USE /d' database/02-saas_master.sql
    sed -i '1i USE `saas_master`;' database/02-saas_master.sql
fi

# ایجاد فایل admin users
echo "👑 ایجاد فایل کاربران ادمین..."
cat > database/03-admin-users.sql << 'EOF'
-- ===========================================
-- Admin Users Creation Script
-- ===========================================

USE `crm_system`;

-- اطمینان از وجود کاربر CEO (مهندس کریمی)
UPDATE users SET 
    password = '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye'
WHERE id = 'ceo-001' AND email = 'Robintejarat@gmail.com';

USE `saas_master`;

-- اطمینان از وجود Super Admin (احمدرضا اوندی)
UPDATE super_admins SET 
    is_active = 1,
    updated_at = NOW()
WHERE username = 'Ahmadreza.avandi' AND email = 'ahmadrezaavandi@gmail.com';
EOF

# مرحله 2: حذف volume موجود برای اطمینان از اجرای init scripts
echo ""
echo "🗑️ مرحله 2: حذف volume موجود..."

# متوقف کردن سرویس‌ها
echo "🛑 متوقف کردن سرویس‌ها..."
docker-compose -f $COMPOSE_FILE down 2>/dev/null || true

# حذف volume دیتابیس
echo "🗑️ حذف volume دیتابیس..."
docker volume rm $(basename $(pwd))_mysql_data 2>/dev/null || true
docker volume rm mysql_data 2>/dev/null || true
docker volume rm rabin-last_mysql_data 2>/dev/null || true

# مرحله 3: بررسی فایل‌های آماده شده
echo ""
echo "📊 مرحله 3: بررسی فایل‌های آماده شده..."
echo "✅ فایل‌های SQL آماده:"
ls -la database/0*.sql

echo ""
echo "📏 اندازه فایل‌ها:"
du -h database/0*.sql

# مرحله 4: راه‌اندازی مجدد با init scripts
echo ""
echo "🚀 مرحله 4: راه‌اندازی مجدد..."

# راه‌اندازی فقط MySQL ابتدا
echo "🗄️ راه‌اندازی MySQL..."
docker-compose -f $COMPOSE_FILE up -d mysql

# انتظار برای آماده شدن MySQL
echo "⏳ انتظار برای آماده شدن MySQL..."
sleep 30

# بررسی وضعیت MySQL
echo "🔍 بررسی وضعیت MySQL..."
docker-compose -f $COMPOSE_FILE logs mysql | tail -10

# تست اتصال
echo "🧪 تست اتصال دیتابیس..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT VERSION();" >/dev/null 2>&1; then
    echo "✅ MySQL آماده است"
    
    # بررسی دیتابیس‌ها
    echo "🔍 بررسی دیتابیس‌ها..."
    DATABASES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null)
    echo "$DATABASES"
    
    if echo "$DATABASES" | grep -q "crm_system"; then
        CRM_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
        echo "✅ crm_system: $((CRM_TABLE_COUNT - 1)) جدول"
    else
        echo "❌ crm_system یافت نشد"
    fi
    
    if echo "$DATABASES" | grep -q "saas_master"; then
        SAAS_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
        echo "✅ saas_master: $((SAAS_TABLE_COUNT - 1)) جدول"
    else
        echo "❌ saas_master یافت نشد"
    fi
    
    # تست کاربر crm_user
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ کاربر crm_user آماده است"
    else
        echo "❌ کاربر crm_user مشکل دارد"
    fi
    
else
    echo "❌ MySQL آماده نیست - بررسی لاگ‌ها:"
    docker-compose -f $COMPOSE_FILE logs mysql | tail -20
    exit 1
fi

# مرحله 5: راه‌اندازی بقیه سرویس‌ها
echo ""
echo "🚀 مرحله 5: راه‌اندازی بقیه سرویس‌ها..."
docker-compose -f $COMPOSE_FILE up -d

# انتظار نهایی
echo "⏳ انتظار برای آماده شدن همه سرویس‌ها..."
sleep 20

# بررسی نهایی
echo ""
echo "📊 بررسی نهایی:"
docker-compose -f $COMPOSE_FILE ps

echo ""
echo "✅ رفع مشکل ایمپورت دیتابیس کامل شد!"
echo ""
echo "🔧 دستورات مفید:"
echo "   • بررسی جداول crm_system: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "   • بررسی جداول saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SHOW TABLES;\""
echo "   • تست اتصال: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"SELECT 1;\""
echo "   • مشاهده لاگ MySQL: docker-compose -f $COMPOSE_FILE logs mysql"