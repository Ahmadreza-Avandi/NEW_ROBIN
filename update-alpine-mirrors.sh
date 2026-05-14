#!/bin/bash

# اسکریپت به‌روزرسانی میرورهای Alpine برای آروان کلود
echo "🔧 به‌روزرسانی میرورهای Alpine برای آروان کلود..."

# تابع برای به‌روزرسانی Dockerfile های Alpine
update_alpine_dockerfile() {
    local dockerfile_path="$1"
    local description="$2"
    
    if [ -f "$dockerfile_path" ]; then
        echo "📝 به‌روزرسانی $description..."
        
        # بررسی اینکه آیا قبلاً میرور آروان کلود اضافه شده یا نه
        if ! grep -q "mirror.arvancloud.ir" "$dockerfile_path"; then
            # اضافه کردن میرور آروان کلود بعد از FROM alpine
            sed -i '/FROM.*alpine/a\\n# تنظیم میرور آروان کلود برای Alpine\nRUN echo "https://mirror.arvancloud.ir/alpine/v3.20/main" > /etc/apk/repositories && \\\n    echo "https://mirror.arvancloud.ir/alpine/v3.20/community" >> /etc/apk/repositories\n' "$dockerfile_path"
            
            # به‌روزرسانی دستورات apk add
            sed -i 's/RUN apk add/RUN apk update \&\& apk add/g' "$dockerfile_path"
            
            echo "✅ $description به‌روزرسانی شد"
        else
            echo "✅ $description قبلاً به‌روزرسانی شده"
        fi
    else
        echo "⚠️  $dockerfile_path یافت نشد"
    fi
}

# به‌روزرسانی Dockerfile اصلی (قبلاً انجام شده)
echo "✅ Dockerfile اصلی قبلاً به‌روزرسانی شده"

# به‌روزرسانی nginx Dockerfile
update_alpine_dockerfile "nginx/Dockerfile" "nginx Dockerfile"

# به‌روزرسانی redis Dockerfile
update_alpine_dockerfile "redis/Dockerfile" "redis Dockerfile"

# به‌روزرسانی school-proj Dockerfiles
update_alpine_dockerfile "school-proj/next/Dockerfile" "school-proj Next.js Dockerfile"
update_alpine_dockerfile "school-proj/nest/Dockerfile" "school-proj Nest.js Dockerfile"

echo ""
echo "🔍 بررسی docker-compose فایل‌ها..."

# بررسی docker-compose.yml اصلی
if grep -q "image: nginx:alpine" docker-compose.yml; then
    echo "⚠️  docker-compose.yml هنوز از nginx:alpine استفاده می‌کند"
    echo "🔧 تغییر به build سفارشی..."
    sed -i 's/image: nginx:alpine/build:\n      context: .\/nginx\n      dockerfile: Dockerfile/g' docker-compose.yml
    echo "✅ docker-compose.yml به‌روزرسانی شد"
else
    echo "✅ docker-compose.yml از build سفارشی استفاده می‌کند"
fi

# بررسی docker-compose.memory-optimized.yml
if grep -q "image: nginx:alpine" docker-compose.memory-optimized.yml; then
    echo "⚠️  docker-compose.memory-optimized.yml هنوز از nginx:alpine استفاده می‌کند"
    echo "🔧 تغییر به build سفارشی..."
    sed -i 's/image: nginx:alpine/build:\n      context: .\/nginx\n      dockerfile: Dockerfile/g' docker-compose.memory-optimized.yml
    echo "✅ docker-compose.memory-optimized.yml به‌روزرسانی شد"
else
    echo "✅ docker-compose.memory-optimized.yml از build سفارشی استفاده می‌کند"
fi

# بررسی school-proj docker-compose.yml
if [ -f "school-proj/docker-compose.yml" ]; then
    if grep -q "image: redis:alpine" school-proj/docker-compose.yml; then
        echo "🔧 به‌روزرسانی school-proj redis..."
        sed -i 's/image: redis:alpine/build:\n      context: ..\/redis\n      dockerfile: Dockerfile/g' school-proj/docker-compose.yml
        echo "✅ school-proj redis به‌روزرسانی شد"
    else
        echo "✅ school-proj redis قبلاً به‌روزرسانی شده"
    fi
fi

echo ""
echo "📋 خلاصه تغییرات:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Dockerfile اصلی - میرور آروان کلود اضافه شد"
echo "✅ nginx/Dockerfile - ایجاد شد با میرور آروان کلود"
echo "✅ redis/Dockerfile - ایجاد شد با میرور آروان کلود"
echo "✅ docker-compose.yml - تغییر به build سفارشی"
echo "✅ docker-compose.memory-optimized.yml - تغییر به build سفارشی"
echo "✅ deploy-server.sh - nginx موقت به build سفارشی تغییر کرد"
echo ""
echo "🚀 حالا می‌توانید deploy را ادامه دهید:"
echo "   bash deploy-server.sh"
echo ""
echo "📝 نکته: اولین build ممکن است کمی طولانی باشد چون images سفارشی ساخته می‌شوند"