#!/bin/bash

# 🚀 اسکریپت دیپلوی خودکار School-Proj
# این اسکریپت همه چیز رو خودکار انجام می‌ده

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_header() {
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_header "🚀 دیپلوی خودکار School-Proj"

# 1. ایجاد .env ها
print_header "1️⃣ تنظیم Environment Variables"
bash setup-env.sh 1

# 2. توقف containers قبلی
print_header "2️⃣ توقف Containers قبلی"
docker-compose down --remove-orphans 2>/dev/null || true

# 3. Build و اجرا
print_header "3️⃣ Build و اجرای Containers"
print_info "در حال build و اجرا (ممکن است 3-5 دقیقه طول بکشد)..."
docker-compose up -d --build

# 4. انتظار برای آماده شدن
print_header "4️⃣ انتظار برای آماده شدن"
print_info "صبر برای اجرای کامل سرویس‌ها (20 ثانیه)..."
sleep 20

# 5. کانفیگ Nginx
print_header "5️⃣ کانفیگ Nginx"

# بررسی وجود nginx container
if docker ps --format "{{.Names}}" | grep -q "^nginx$"; then
    print_info "استفاده از nginx container موجود..."
    
    # ایجاد کانفیگ Docker
    cat > nginx-docker-config.conf << 'EOF'
upstream school_nextjs_backend {
    server school-proj-nextjs-1:3000;
}
upstream school_python_backend {
    server school-proj-pythonserver-1:5000;
}
upstream school_phpmyadmin_backend {
    server school-proj-phpmyadmin-1:80;
}
upstream school_redis_commander_backend {
    server school-proj-redis-commander-1:8081;
}

server {
    listen 80;
    server_name sch.ahmadreza-avandi.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    http2 on;
    server_name sch.ahmadreza-avandi.ir;

    ssl_certificate /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/privkey.pem;

    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    location /python-api/ {
        proxy_pass http://school_python_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /phpmyadmin/ {
        proxy_pass http://school_phpmyadmin_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /redis-commander/ {
        proxy_pass http://school_redis_commander_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://school_nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

    # کپی و reload
    docker cp nginx-docker-config.conf nginx:/etc/nginx/conf.d/school-proj.conf
    docker network connect school-proj_app-network nginx 2>/dev/null || true
    docker exec nginx nginx -t && docker exec nginx nginx -s reload
    print_success "nginx container کانفیگ شد"
else
    print_warning "nginx container یافت نشد - لطفاً به صورت دستی nginx را تنظیم کنید"
fi

# 6. بررسی وضعیت
print_header "6️⃣ وضعیت نهایی"
docker-compose ps

# 7. تست سرویس‌ها
print_header "7️⃣ تست سرویس‌ها"

test_service() {
    local name=$1
    local url=$2
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        print_success "$name در حال اجراست"
    else
        print_warning "$name ممکن است هنوز آماده نباشد"
    fi
}

test_service "Next.js" "http://localhost:3003"
test_service "Python API" "http://localhost:5001"
test_service "phpMyAdmin" "http://localhost:8083"

# 8. نتیجه نهایی
print_header "✅ دیپلوی کامل شد!"

echo ""
print_success "🎉 پروژه School-Proj با موفقیت دیپلوی شد!"
echo ""
echo "🌐 لینک‌های دسترسی:"
echo "   • وب‌سایت اصلی:      https://sch.ahmadreza-avandi.ir"
echo "   • Python API:         https://sch.ahmadreza-avandi.ir/python-api"
echo "   • phpMyAdmin:         https://sch.ahmadreza-avandi.ir/phpmyadmin"
echo "   • Redis Commander:    https://sch.ahmadreza-avandi.ir/redis-commander"
echo ""
echo "📍 پورت‌های محلی:"
echo "   • Next.js:         localhost:3003"
echo "   • Python:          localhost:5001"
echo "   • MySQL:           localhost:3307"
echo "   • Redis:           localhost:6380"
echo ""
print_info "برای مشاهده لاگ‌ها: docker-compose logs -f"
print_info "برای بررسی وضعیت: bash status.sh"