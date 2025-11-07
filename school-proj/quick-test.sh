#!/bin/bash

echo "🔍 تست سریع API ها"
echo ""

echo "1️⃣ آپدیت Nginx..."
sudo bash update-nginx-only.sh

echo ""
echo "2️⃣ تست API مستقیم از Next.js:"
curl -s http://localhost:3003/api/grades | head -5
echo ""

echo "3️⃣ تست API از طریق دامنه:"
curl -s https://sch.ahmadreza-avandi.ir/api/grades | head -5
echo ""

echo "4️⃣ تست majors:"
curl -s https://sch.ahmadreza-avandi.ir/api/majors | head -5
echo ""

echo "5️⃣ چک کردن لاگ Next.js:"
docker-compose logs --tail=10 nextjs
