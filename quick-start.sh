#!/bin/bash

# ⚡ Quick Start Script
# راه‌اندازی سریع CRM با تشخیص خودکار

echo "⚡ راه‌اندازی سریع CRM System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تشخیص وضعیت فعلی
echo "🔍 تشخیص وضعیت فعلی..."

# بررسی MySQL محلی
MYSQL_LOCAL=false
if command -v mysql >/dev/null 2>&1; then
    if mysql -u root -e "SELECT 1;" >/dev/null 2>&1; then
        MYSQL_LOCAL=true
        echo "✅ MySQL محلی در دسترس است"
    fi
fi

# بررسی Docker
DOCKER_AVAILABLE=false
if command -v docker >/dev/null 2>&1 && command -v docker-compose >/dev/null 2>&1; then
    DOCKER_AVAILABLE=true
    echo "✅ Docker در دسترس است"
fi

# بررسی کانتینرهای Docker موجود
DOCKER_MYSQL_RUNNING=false
if [ "$DOCKER_AVAILABLE" = true ]; then
    if docker ps --format '{{.Names}}' | grep -q "mysql\|mariadb"; then
        DOCKER_MYSQL_RUNNING=true
        echo "✅ کانتینر MySQL Docker در حال اجراست"
    fi
fi

echo ""
echo "📊 خلاصه وضعیت:"
echo "   MySQL محلی: $([ "$MYSQL_LOCAL" = true ] && echo "✅ آماده" || echo "❌ در دسترس نیست")"
echo "   Docker: $([ "$DOCKER_AVAILABLE" = true ] && echo "✅ آماده" || echo "❌ در دسترس نیست")"
echo "   Docker MySQL: $([ "$DOCKER_MYSQL_RUNNING" = true ] && echo "✅ در حال اجرا" || echo "❌ متوقف")"

echo ""
echo "🎯 انتخاب بهترین راه‌حل..."

# تصمیم‌گیری خودکار
if [ "$DOCKER_MYSQL_RUNNING" = true ]; then
    echo "🐳 استفاده از Docker MySQL موجود..."
    
    # تنظیم .env برای Docker
    sed -i 's|^DATABASE_HOST=.*|DATABASE_HOST=mysql|g' .env
    sed -i 's|^DATABASE_USER=.*|DATABASE_USER=crm_user|g' .env
    sed -i 's|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD=1234|g' .env
    sed -i 's|^DATABASE_URL=.*|DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system|g' .env
    
    echo "✅ .env تنظیم شد برای Docker"
    
elif [ "$MYSQL_LOCAL" = true ]; then
    echo "💻 استفاده از MySQL محلی..."
    
    # تنظیم .env برای محلی
    sed -i 's|^DATABASE_HOST=.*|DATABASE_HOST=localhost|g' .env
    sed -i 's|^DATABASE_USER=.*|DATABASE_USER=root|g' .env
    sed -i 's|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD=|g' .env
    sed -i 's|^DATABASE_URL=.*|DATABASE_URL=mysql://root:@localhost:3306/crm_system|g' .env
    
    echo "✅ .env تنظیم شد برای MySQL محلی"
    
    # بررسی و ایجاد دیتابیس‌ها
    echo "🗄️ بررسی دیتابیس‌ها..."
    
    if ! mysql -u root -e "USE crm_system;" >/dev/null 2>&1; then
        echo "📝 ایجاد دیتابیس crm_system..."
        mysql -u root -e "CREATE DATABASE crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    fi
    
    if ! mysql -u root -e "USE saas_master;" >/dev/null 2>&1; then
        echo "📝 ایجاد دیتابیس saas_master..."
        mysql -u root -e "CREATE DATABASE saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    fi
    
elif [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🐳 راه‌اندازی Docker MySQL..."
    
    # تنظیم .env برای Docker
    sed -i 's|^DATABASE_HOST=.*|DATABASE_HOST=mysql|g' .env
    sed -i 's|^DATABASE_USER=.*|DATABASE_USER=crm_user|g' .env
    sed -i 's|^DATABASE_PASSWORD=.*|DATABASE_PASSWORD=1234|g' .env
    sed -i 's|^DATABASE_URL=.*|DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system|g' .env
    
    # راه‌اندازی MySQL container
    echo "🚀 راه‌اندازی MySQL container..."
    docker-compose up -d mysql
    
    # انتظار برای آماده شدن
    echo "⏳ انتظار برای آماده شدن MySQL..."
    for i in {1..20}; do
        if docker-compose exec -T mysql mariadb-admin ping -h localhost -u root -p1234 >/dev/null 2>&1; then
            echo "✅ MySQL آماده شد"
            break
        fi
        echo "   تلاش $i/20..."
        sleep 3
    done
    
    # ایجاد دیتابیس‌ها و کاربر
    echo "🗄️ ایجاد دیتابیس‌ها و کاربر..."
    docker-compose exec -T mysql mariadb -u root -p1234 -e "
        CREATE DATABASE IF NOT EXISTS crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE DATABASE IF NOT EXISTS saas_master CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        CREATE USER IF NOT EXISTS 'crm_user'@'%' IDENTIFIED BY '1234';
        GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'%';
        GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'%';
        FLUSH PRIVILEGES;
    " >/dev/null 2>&1
    
    echo "✅ Docker MySQL آماده است"
    
else
    echo "❌ هیچ راه‌حل قابل استفاده یافت نشد!"
    echo ""
    echo "💡 راه‌حل‌های پیشنهادی:"
    echo "   1. نصب Docker: https://www.docker.com/products/docker-desktop"
    echo "   2. نصب MySQL محلی:"
    echo "      - Windows: XAMPP (https://www.apachefriends.org/)"
    echo "      - macOS: brew install mysql"
    echo "      - Linux: sudo apt install mysql-server"
    echo "   3. تشخیص دقیق مشکل: ./diagnose-database.sh"
    exit 1
fi

# تست اتصال
echo ""
echo "🧪 تست اتصال دیتابیس..."
if command -v node >/dev/null 2>&1 && [ -f "test-database-connection.js" ]; then
    if node test-database-connection.js >/dev/null 2>&1; then
        echo "✅ اتصال دیتابیس موفق"
    else
        echo "❌ اتصال دیتابیس ناموفق"
        echo "🔍 برای تشخیص دقیق: ./diagnose-database.sh"
    fi
else
    echo "⚠️  فایل تست یافت نشد"
fi

# نصب dependencies
echo ""
echo "📦 بررسی dependencies..."
if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        echo "📥 نصب npm packages..."
        npm install
    else
        echo "✅ npm packages نصب شده"
    fi
else
    echo "⚠️  فایل package.json یافت نشد"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 راه‌اندازی کامل شد!"
echo ""
echo "🚀 برای شروع:"
echo "   npm run dev"
echo ""
echo "🌐 دسترسی:"
echo "   http://localhost:3000"
echo ""
echo "🔧 ابزارهای مفید:"
echo "   • تست دیتابیس: node test-database-connection.js"
echo "   • تشخیص مشکل: ./diagnose-database.sh"
echo "   • تغییر محیط: ./setup-environment.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"