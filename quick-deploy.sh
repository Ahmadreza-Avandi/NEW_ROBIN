#!/bin/bash

# 🚀 Quick Deploy Script for CRM System
echo "🚀 شروع دیپلوی سریع CRM..."

# بررسی وجود فایل‌های ضروری
if [ ! -f "deploy-server.sh" ]; then
    echo "❌ فایل deploy-server.sh یافت نشد!"
    exit 1
fi

if [ ! -f "docker-compose.yml" ]; then
    echo "❌ فایل docker-compose.yml یافت نشد!"
    exit 1
fi

# اجازه اجرا
chmod +x deploy-server.sh

# اجرای دیپلوی
echo "🔄 اجرای اسکریپت دیپلوی..."
./deploy-server.sh

echo "✅ دیپلوی کامل شد!"