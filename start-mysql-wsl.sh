#!/bin/bash

echo "========================================"
echo "  🔧 راه‌اندازی MySQL در WSL/Linux"
echo "========================================"
echo ""

# بررسی نصب MySQL
echo "[1/4] بررسی نصب MySQL..."
if command -v mysql &> /dev/null; then
    echo "✓ MySQL نصب است"
else
    echo "✗ MySQL نصب نیست!"
    echo ""
    echo "برای نصب MySQL:"
    echo "  sudo apt update"
    echo "  sudo apt install mysql-server -y"
    exit 1
fi
echo ""

# بررسی وضعیت فعلی
echo "[2/4] بررسی وضعیت MySQL..."
if sudo systemctl is-active --quiet mysql; then
    echo "✓ MySQL در حال اجرا است"
elif sudo service mysql status &> /dev/null; then
    echo "✓ MySQL در حال اجرا است"
else
    echo "⚠️  MySQL متوقف است"
    echo ""
    echo "[3/4] راه‌اندازی MySQL..."
    
    # تلاش با systemctl
    if command -v systemctl &> /dev/null; then
        sudo systemctl start mysql
        if [ $? -eq 0 ]; then
            echo "✓ MySQL با systemctl راه‌اندازی شد"
        fi
    # تلاش با service
    elif command -v service &> /dev/null; then
        sudo service mysql start
        if [ $? -eq 0 ]; then
            echo "✓ MySQL با service راه‌اندازی شد"
        fi
    # تلاش مستقیم
    else
        sudo mysqld_safe --skip-grant-tables &
        sleep 3
        echo "✓ MySQL به صورت مستقیم راه‌اندازی شد"
    fi
fi
echo ""

# تست اتصال
echo "[4/4] تست اتصال..."
sleep 2

if mysql -u root -e "SELECT 1;" &> /dev/null; then
    echo "✓ اتصال به MySQL موفق"
    echo ""
    echo "========================================"
    echo "  ✅ MySQL آماده است!"
    echo "========================================"
    echo ""
    echo "مرحله بعد: رفع مشکل tenant_key"
    echo "  node fix-login-issue.cjs"
    echo ""
else
    echo "⚠️  اتصال به MySQL با مشکل مواجه شد"
    echo ""
    echo "احتمالا نیاز به تنظیم رمز عبور دارید:"
    echo "  sudo mysql"
    echo "  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '1234';"
    echo "  FLUSH PRIVILEGES;"
    echo "  EXIT;"
    echo ""
fi
