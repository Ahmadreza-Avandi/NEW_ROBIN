#!/bin/bash

# ===========================================
# 🔧 Local Database Setup Script
# ===========================================
# این اسکریپت دیتابیس محلی را برای development تنظیم می‌کند
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 Local Database Setup for CRM Development"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# بررسی وجود MySQL
echo "🔍 بررسی وجود MySQL..."
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL یافت نشد!"
    echo ""
    echo "💡 راه‌حل‌ها:"
    echo "   1. نصب MySQL: sudo apt install mysql-server (Ubuntu/Debian)"
    echo "   2. یا نصب XAMPP/WAMP/MAMP"
    echo "   3. یا استفاده از Docker: docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=1234 mysql:8.0"
    echo ""
    exit 1
fi

echo "✅ MySQL یافت شد"

# تست اتصال به MySQL
echo ""
echo "🔌 تست اتصال به MySQL..."

# تلاش برای اتصال بدون رمز عبور (پیش‌فرض محلی)
if mysql -u root -e "SELECT 1;" &> /dev/null; then
    echo "✅ اتصال به MySQL با کاربر root (بدون رمز) موفق بود"
    DB_PASSWORD=""
elif mysql -u root -p1234 -e "SELECT 1;" &> /dev/null; then
    echo "✅ اتصال به MySQL با کاربر root (رمز: 1234) موفق بود"
    DB_PASSWORD="1234"
else
    echo "❌ اتصال به MySQL ناموفق!"
    echo ""
    echo "💡 لطفاً رمز عبور root MySQL را وارد کنید:"
    read -s -p "MySQL Root Password: " DB_PASSWORD
    echo ""
    
    if ! mysql -u root -p"$DB_PASSWORD" -e "SELECT 1;" &> /dev/null; then
        echo "❌ رمز عبور اشتباه است!"
        exit 1
    fi
    echo "✅ اتصال به MySQL موفق بود"
fi

# ایجاد دیتابیس‌ها
echo ""
echo "🗄️ ایجاد دیتابیس‌ها..."

MYSQL_CMD="mysql -u root"
if [ -n "$DB_PASSWORD" ]; then
    MYSQL_CMD="mysql -u root -p$DB_PASSWORD"
fi

# ایجاد دیتابیس crm_system
echo "📝 ایجاد دیتابیس crm_system..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# ایجاد دیتابیس saas_master
echo "📝 ایجاد دیتابیس saas_master..."
$MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "✅ دیتابیس‌ها ایجاد شدند"

# ایمپورت فایل‌های SQL
echo ""
echo "📋 ایمپورت فایل‌های SQL..."

# جستجوی فایل‌های SQL
CRM_SQL_FILE=""
SAAS_SQL_FILE=""

# جستجوی فایل crm_system
if [ -f "database/crm_system.sql" ]; then
    CRM_SQL_FILE="database/crm_system.sql"
elif [ -f "crm_system.sql" ]; then
    CRM_SQL_FILE="crm_system.sql"
elif [ -f "دیتابیس.sql" ]; then
    CRM_SQL_FILE="دیتابیس.sql"
elif [ -f "complate database.sql" ]; then
    CRM_SQL_FILE="complate database.sql"
fi

# جستجوی فایل saas_master
if [ -f "database/saas_master.sql" ]; then
    SAAS_SQL_FILE="database/saas_master.sql"
elif [ -f "saas_master.sql" ]; then
    SAAS_SQL_FILE="saas_master.sql"
fi

# ایمپورت crm_system
if [ -n "$CRM_SQL_FILE" ]; then
    echo "📋 ایمپورت $CRM_SQL_FILE به crm_system..."
    $MYSQL_CMD crm_system < "$CRM_SQL_FILE"
    echo "✅ فایل CRM ایمپورت شد"
else
    echo "⚠️  فایل SQL برای crm_system یافت نشد"
    echo "🔍 فایل‌های موجود:"
    ls -la *.sql 2>/dev/null || echo "   هیچ فایل SQL یافت نشد"
fi

# ایمپورت saas_master
if [ -n "$SAAS_SQL_FILE" ]; then
    echo "📋 ایمپورت $SAAS_SQL_FILE به saas_master..."
    $MYSQL_CMD saas_master < "$SAAS_SQL_FILE"
    echo "✅ فایل SaaS ایمپورت شد"
else
    echo "⚠️  فایل SQL برای saas_master یافت نشد"
    echo "📝 ایجاد ساختار پایه saas_master..."
    
    # ایجاد ساختار پایه
    $MYSQL_CMD saas_master << 'EOF'
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
    echo "✅ ساختار پایه saas_master ایجاد شد"
fi

# به‌روزرسانی .env برای local
echo ""
echo "⚙️ به‌روزرسانی فایل .env برای محیط محلی..."

# پشتیبان‌گیری از .env
if [ -f ".env" ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# به‌روزرسانی تنظیمات دیتابیس
sed -i "s|DATABASE_HOST=.*|DATABASE_HOST=localhost|g" .env 2>/dev/null || true
sed -i "s|DATABASE_USER=.*|DATABASE_USER=root|g" .env 2>/dev/null || true
sed -i "s|DATABASE_PASSWORD=.*|DATABASE_PASSWORD=$DB_PASSWORD|g" .env 2>/dev/null || true
sed -i "s|DB_HOST=.*|DB_HOST=localhost|g" .env 2>/dev/null || true
sed -i "s|DB_USER=.*|DB_USER=root|g" .env 2>/dev/null || true
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=$DB_PASSWORD|g" .env 2>/dev/null || true
sed -i "s|NODE_ENV=.*|NODE_ENV=development|g" .env 2>/dev/null || true
sed -i "s|VPS_MODE=.*|VPS_MODE=false|g" .env 2>/dev/null || true
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://localhost:3000|g" .env 2>/dev/null || true

# به‌روزرسانی DATABASE_URL
if [ -n "$DB_PASSWORD" ]; then
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=mysql://root:$DB_PASSWORD@localhost:3306/crm_system|g" .env 2>/dev/null || true
else
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=mysql://root:@localhost:3306/crm_system|g" .env 2>/dev/null || true
fi

echo "✅ فایل .env به‌روزرسانی شد"

# تست نهایی
echo ""
echo "🧪 تست نهایی اتصال..."

# تست crm_system
if $MYSQL_CMD -e "USE crm_system; SELECT 1;" &> /dev/null; then
    echo "✅ اتصال به crm_system موفق"
else
    echo "❌ اتصال به crm_system ناموفق"
fi

# تست saas_master
if $MYSQL_CMD -e "USE saas_master; SELECT 1;" &> /dev/null; then
    echo "✅ اتصال به saas_master موفق"
else
    echo "❌ اتصال به saas_master ناموفق"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ تنظیم دیتابیس محلی کامل شد!"
echo ""
echo "📋 اطلاعات اتصال:"
echo "   🏠 Host: localhost"
echo "   👤 User: root"
echo "   🔑 Password: $([ -n "$DB_PASSWORD" ] && echo "$DB_PASSWORD" || echo "(خالی)")"
echo "   🗄️ Databases: crm_system, saas_master"
echo ""
echo "🚀 حالا می‌توانید اپلیکیشن را اجرا کنید:"
echo "   npm run dev"
echo ""
echo "🔧 برای تغییر به حالت Docker:"
echo "   ./setup-env.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"