#!/bin/bash

# 🔄 Restart سریع NextJS (بدون rebuild)
# برای اعمال تغییرات کد بدون نیاز به build مجدد

echo "🔄 Restart سریع NextJS..."

# تشخیص فایل docker-compose
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

echo "📋 استفاده از: $COMPOSE_FILE"

# Restart NextJS
echo "🔄 Restart NextJS container..."
docker-compose -f $COMPOSE_FILE restart nextjs

echo "⏳ انتظار برای آماده شدن..."
sleep 5

# بررسی وضعیت
if docker-compose -f $COMPOSE_FILE ps nextjs | grep -q "Up"; then
    echo "✅ NextJS با موفقیت restart شد"
    echo ""
    echo "🌐 سیستم آماده است:"
    echo "   https://crm.robintejarat.com/rabin/dashboard/voice-assistant"
    echo ""
    echo "📋 مشاهده لاگ‌ها:"
    echo "   docker-compose -f $COMPOSE_FILE logs -f nextjs"
else
    echo "❌ NextJS restart ناموفق"
    echo "🔍 لاگ‌های خطا:"
    docker-compose -f $COMPOSE_FILE logs nextjs | tail -20
fi
