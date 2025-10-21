#!/bin/bash

# اسکریپت ایمپورت دیتابیس برای داکر
# این اسکریپت مشکل DEFINER را حل می‌کند

echo "🔄 شروع ایمپورت دیتابیس برای داکر..."

# بررسی وجود فایل دیتابیس
if [ ! -f "دیتاییس تغیر کرده.sql" ]; then
    echo "❌ فایل دیتابیس یافت نشد!"
    exit 1
fi

# تنظیمات داکر
CONTAINER_NAME="crm-mysql"
DB_NAME="crm_system"
DB_USER="root"
DB_PASSWORD="root123"

echo "📋 بررسی وضعیت کانتینر داکر..."

# بررسی اجرای کانتینر
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "🚀 راه‌اندازی کانتینر داکر..."
    docker-compose up -d mysql
    
    # انتظار برای آماده شدن MySQL
    echo "⏳ انتظار برای آماده شدن MySQL..."
    sleep 30
fi

# تست اتصال به دیتابیس
echo "🔗 تست اتصال به دیتابیس..."
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT 1;" > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ اتصال به دیتابیس ناموفق!"
    exit 1
fi

echo "✅ اتصال به دیتابیس موفق"

# حذف دیتابیس قبلی (در صورت وجود)
echo "🗑️ حذف دیتابیس قبلی..."
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD -e "DROP DATABASE IF EXISTS $DB_NAME;"

# ایجاد دیتابیس جدید
echo "🆕 ایجاد دیتابیس جدید..."
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# کپی فایل SQL به کانتینر
echo "📁 کپی فایل SQL به کانتینر..."
docker cp "دیتاییس تغیر کرده.sql" $CONTAINER_NAME:/tmp/database.sql

# ایمپورت دیتابیس
echo "📥 ایمپورت دیتابیس..."
docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < /tmp/database.sql

if [ $? -eq 0 ]; then
    echo "✅ ایمپورت دیتابیس موفقیت‌آمیز بود!"
    
    # بررسی تعداد جداول
    TABLE_COUNT=$(docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" | wc -l)
    echo "📊 تعداد جداول ایجاد شده: $((TABLE_COUNT - 1))"
    
    # بررسی ویوها
    VIEW_COUNT=$(docker exec $CONTAINER_NAME mysql -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW FULL TABLES WHERE Table_type = 'VIEW';" | wc -l)
    echo "👁️ تعداد ویوهای ایجاد شده: $((VIEW_COUNT - 1))"
    
else
    echo "❌ خطا در ایمپورت دیتابیس!"
    exit 1
fi

# پاک‌سازی فایل موقت
docker exec $CONTAINER_NAME rm -f /tmp/database.sql

echo "🎉 ایمپورت دیتابیس با موفقیت تکمیل شد!"
echo "🔗 برای اتصال به دیتابیس از اطلاعات زیر استفاده کنید:"
echo "   Host: localhost"
echo "   Port: 3306"
echo "   Database: $DB_NAME"
echo "   Username: $DB_USER"
echo "   Password: $DB_PASSWORD"