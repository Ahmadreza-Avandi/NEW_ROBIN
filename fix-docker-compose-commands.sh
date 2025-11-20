#!/bin/bash

# 🔧 تبدیل همه دستورات docker-compose به docker compose
echo "🔧 تبدیل دستورات docker-compose به docker compose..."

# بک‌آپ فایل اصلی
cp deploy-server.sh deploy-server.sh.backup

# تبدیل همه موارد docker-compose به docker compose
sed -i 's/docker-compose/docker compose/g' deploy-server.sh

echo "✅ همه دستورات docker-compose به docker compose تبدیل شدند"
echo "📄 فایل بک‌آپ: deploy-server.sh.backup"

# نمایش تعداد تغییرات
CHANGES=$(grep -c "docker compose" deploy-server.sh)
echo "📊 تعداد تغییرات: $CHANGES مورد"

echo "✅ آماده برای اجرا!"