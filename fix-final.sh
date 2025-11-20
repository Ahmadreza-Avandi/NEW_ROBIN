#!/bin/bash

# 🔧 اصلاح نهایی اسکریپت deploy
echo "🔧 اصلاح نهایی اسکریپت deploy..."

# اصلاح نام فایل‌های docker-compose که اشتباه شده‌اند
sed -i 's/docker compose\./docker-compose./g' deploy-server.sh

# اصلاح دستورات docker compose که نام فایل اشتباه دارند
sed -i 's/docker compose -f docker compose\./docker compose -f docker-compose./g' deploy-server.sh

echo "✅ اصلاحات نهایی انجام شد"

# بررسی نهایی
echo "🔍 بررسی نهایی..."
if grep -q "docker compose\." deploy-server.sh; then
    echo "⚠️  هنوز مشکل وجود دارد:"
    grep -n "docker compose\." deploy-server.sh
else
    echo "✅ همه مشکلات حل شد"
fi

echo "✅ اسکریپت آماده اجرا است!"