#!/bin/bash

# 🔄 Rebuild سریع (با cache)

set -e

echo "🔄 Rebuild سریع School-Proj..."
echo ""

# 1. ایجاد .env ها
echo "📝 ایجاد .env ها..."
bash setup-env.sh 1

# 2. توقف
echo "⏹️  توقف containers..."
docker-compose down --remove-orphans

# 3. Build (با cache)
echo "🔨 Build containers (با cache)..."
docker-compose build

# 4. اجرا
echo "▶️  اجرای containers..."
docker-compose up -d

# 5. انتظار
echo "⏳ انتظار 15 ثانیه..."
sleep 15

# 6. وضعیت
echo ""
echo "📊 وضعیت:"
docker-compose ps

echo ""
echo "✅ Done!"
echo "🌐 https://sch.ahmadreza-avandi.ir"
