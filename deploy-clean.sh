#!/bin/bash

# 🚀 اسکریپت دیپلوی کامل با پاکسازی - CRM System
# این اسکریپت همه مشکلات را حل می‌کند و دیپلوی کاملی انجام می‌دهد

echo "🚀 شروع دیپلوی کامل CRM با پاکسازی..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# مرحله 1: پاکسازی کامل
echo "🧹 مرحله 1: پاکسازی کامل..."

# متوقف کردن همه سرویس‌ها
echo "🛑 متوقف کردن همه سرویس‌ها..."
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose.memory-optimized.yml down 2>/dev/null || true

# حذف کانتینرهای قدیمی
echo "🗑️ حذف کانتینرهای قدیمی..."
docker stop $(docker ps -q --filter "name=crm") 2>/dev/null || true
docker rm $(docker ps -aq --filter "name=crm") 2>/dev/null || true

# حذف images قدیمی
echo "🗑️ حذف images قدیمی..."
docker rmi $(docker images --filter "reference=*crm*" -q) 2>/dev/null || true
docker rmi $(docker images --filter "dangling=true" -q) 2>/dev/null || true

# پاکسازی کامل Docker
echo "🧹 پاکسازی کامل Docker..."
docker system prune -af --volumes

# مرحله 2: آماده‌سازی فولدرها
echo "📁 مرحله 2: آماده‌سازی فولدرها..."

# حذف فولدرهای قدیمی
rm -rf uploads 2>/dev/null || true
rm -rf public/uploads 2>/dev/null || true

# ایجاد فولدرهای جدید
mkdir -p uploads/{documents,avatars,chat,temp}
mkdir -p public/uploads/{documents,avatars,chat}

# تنظیم مجوزها
chmod -R 755 uploads
chmod -R 755 public/uploads

echo "✅ فولدرهای آپلود آماده شدند"

# مرحله 3: آماده‌سازی دیتابیس
echo "🗄️ مرحله 3: آماده‌سازی دیتابیس..."

mkdir -p database

# کپی فایل دیتابیس جدید
if [ -f "دیتاییس تغیر کرده.sql" ]; then
    cp "دیتاییس تغیر کرده.sql" database/crm_system.sql
    echo "✅ فایل دیتابیس جدید کپی شد"
fi

# مرحله 4: پاکسازی cache های محلی
echo "🧹 مرحله 4: پاکسازی cache های محلی..."
rm -rf .next node_modules/.cache .swc .turbo dist build 2>/dev/null || true
npm cache clean --force 2>/dev/null || true

# مرحله 5: اجرای دیپلوی اصلی
echo "🚀 مرحله 5: اجرای دیپلوی اصلی..."
chmod +x deploy-server.sh
./deploy-server.sh --clean

echo ""
echo "🎉 دیپلوی کامل با پاکسازی تمام شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 سیستم CRM: https://crm.robintejarat.com"
echo "📄 مدیریت اسناد: https://crm.robintejarat.com/dashboard/documents"
echo "📅 تقویم: https://crm.robintejarat.com/dashboard/calendar"
echo "🔐 phpMyAdmin: https://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/"
echo ""
echo "✅ همه چیز آماده است!"