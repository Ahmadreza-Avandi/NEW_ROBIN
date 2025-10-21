#!/bin/bash

echo "🔧 حل سریع مشکلات..."

# کپی nginx config درست
cp nginx/low-memory-fixed.conf nginx/active.conf
echo "✅ nginx config درست شد"

# پاک کردن volume قدیمی و راه‌اندازی مجدد
docker-compose -f docker-compose.deploy.yml down -v
docker volume prune -f
docker-compose -f docker-compose.deploy.yml up -d

echo "🎉 مشکلات حل شد!"
echo "⏳ منتظر 30 ثانیه بمانید تا سرویس‌ها آماده شوند..."
sleep 30

echo "📊 وضعیت نهایی:"
docker-compose -f docker-compose.deploy.yml ps

echo ""
echo "🌐 تست دامنه:"
curl -H "Host: crm.robintejarat.com" http://localhost || echo "هنوز آماده نیست"