#!/bin/bash

# 🔧 حل مشکل نسخه Docker
echo "🔧 حل مشکل نسخه Docker..."

# بررسی وضعیت فعلی
echo "📊 وضعیت فعلی Docker:"
docker version

# متوقف کردن Docker daemon
echo "🛑 متوقف کردن Docker daemon..."
sudo systemctl stop docker
sudo systemctl stop docker.socket

# پاک کردن فایل‌های موقت Docker
echo "🧹 پاک کردن فایل‌های موقت..."
sudo rm -rf /var/lib/docker/tmp/*
sudo rm -rf /var/run/docker*

# راه‌اندازی مجدد Docker
echo "🚀 راه‌اندازی مجدد Docker..."
sudo systemctl start docker
sudo systemctl enable docker

# انتظار برای آماده شدن
sleep 5

# بررسی وضعیت جدید
echo "✅ بررسی وضعیت جدید:"
docker version

# تست ساده
echo "🧪 تست ساده Docker:"
docker run --rm hello-world

echo "✅ Docker آماده است!"