#!/bin/bash

# اسکریپت خیلی سریع دیپلوی

echo "🚀 دیپلوی سریع..."

# توقف
docker-compose down

# Pre-build Nest.js اگه نیاز باشه
if [ ! -f "nest/dist/main.js" ]; then
    echo "📦 Build Nest.js..."
    cd nest && npm run build && cd ..
fi

# Build فقط اگه image وجود نداشته باشه
echo "🔨 Build containers..."
docker-compose build --parallel

# اجرا
echo "▶️ اجرای containers..."
docker-compose up -d

echo "⏳ صبر 15 ثانیه..."
sleep 15

echo "📊 وضعیت:"
docker-compose ps

echo "✅ آماده!"
echo "🌐 http://localhost:3000"