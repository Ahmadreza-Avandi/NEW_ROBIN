#!/bin/bash

# 🚀 اسکریپت دیپلوی کامل School-Proj
# این اسکریپت همه چیز رو از صفر تا صد انجام می‌ده
# استفاده: bash deploy-complete.sh [local|server|auto]
#   local = حالت لوکال
#   server = حالت سرور
#   auto = تشخیص خودکار (پیش‌فرض)

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

# تشخیص حالت
MODE=${1:-auto}

# تشخیص خودکار محیط
detect_environment() {
    if [ -f "/etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem" ] && command -v nginx &> /dev/null; then
        echo "server"
    else
        echo "local"
    fi
}

if [ "$MODE" = "auto" ]; then
    MODE=$(detect_environment)
    print_info "🔍 تشخیص خودکار محیط: $MODE"
fi

# تنظیمات بر اساس حالت
if [ "$MODE" = "local" ]; then
    DOMAIN="localhost"
    ENV_MODE="0"
    print_header "🏠 حالت لوکال"
    print_info "دامنه: $DOMAIN"
    print_info "پورت‌ها: Next.js:3003, Python:5001, MySQL:3307, Redis:6380"
else
    DOMAIN="sch.ahmadreza-avandi.ir"
    ENV_MODE="1"
    print_header "🌐 حالت سرور"
    print_info "دامنه: $DOMAIN"
    print_info "پورت‌ها: Next.js:3003, Python:5001, MySQL:3307, Redis:6380"
fi

echo ""

# 1. ایجاد فایل‌های .env
print_header "1️⃣ ایجاد فایل‌های .env"

if [ ! -f ".env" ] || [ ! -f "next/.env.local" ]; then
    print_info "فایل‌های .env یافت نشدند، در حال ایجاد..."
    bash setup-env.sh $ENV_MODE
else
    print_success "فایل‌های .env موجود هستند"
    read -p "آیا می‌خواهید فایل‌های .env را دوباره بسازید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash setup-env.sh $ENV_MODE
    fi
fi

# 2. پاک‌سازی nginx
print_header "2️⃣ پاک‌سازی کانفیگ‌های موقت nginx"

print_info "حذف کانفیگ‌های موقت..."
sudo rm -f /etc/nginx/sites-enabled/school-proj-temp 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-proj-temp 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/school-ssl* 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-ssl* 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/school-proj-certbot 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-proj-certbot 2>/dev/null || true

print_success "پاک‌سازی انجام شد"

# 3. بررسی گواهی SSL (فقط برای سرور)
if [ "$MODE" = "server" ]; then
    print_header "3️⃣ بررسی گواهی SSL"
    
    if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
        print_success "گواهی SSL موجود است"
        EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
        print_info "تاریخ انقضا: $EXPIRY"
    else
        print_error "گواهی SSL یافت نشد!"
        print_info "لطفاً ابتدا SSL را دریافت کنید:"
        echo "  sudo bash get-ssl-manual.sh"
        exit 1
    fi
else
    print_info "⏭️ حالت لوکال - بررسی SSL رد شد"
fi

# 4. توقف containers قبلی
print_header "4️⃣ توقف containers قبلی"

if [ -f "docker-compose.yml" ]; then
    print_info "در حال توقف containers..."
    docker-compose down 2>/dev/null || true
    print_success "Containers متوقف شدند"
fi

# 5. کانفیگ Nginx
if [ "$MODE" = "server" ]; then
    print_header "5️⃣ کانفیگ Nginx"
    
    # بررسی وجود nginx container
    if docker ps --format "{{.Names}}" | grep -q "^nginx$"; then
        print_info "nginx container یافت شد - استفاده از Docker nginx"
        
        # ایجاد کانفیگ Docker برای سرور
        print_info "ایجاد کانفیگ nginx برای Docker..."
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

        # کپی کانفیگ به nginx container
        docker cp nginx-docker-config.conf nginx:/etc/nginx/conf.d/school-proj.conf
        docker network connect school-proj_app-network nginx 2>/dev/null || true
        
        # تست و reload
        if docker exec nginx nginx -t 2>&1 | grep -q "successful"; then
            docker exec nginx nginx -s reload
            print_success "✅ nginx container کانفیگ شد"
        else
            print_error "خطا در کانفیگ nginx container"
            docker exec nginx nginx -t
            exit 1
        fi
        
    else
        print_info "nginx container یافت نشد - استفاده از system nginx"
        
        # کانفیگ برای system nginx
        sudo cp nginx-config.conf /etc/nginx/sites-available/school-proj
        sudo rm -f /etc/nginx/sites-enabled/school-proj
        sudo ln -sf /etc/nginx/sites-available/school-proj /etc/nginx/sites-enabled/school-proj
        
        # تست و reload
        if sudo nginx -t 2>&1 | grep -q "successful"; then
            if sudo systemctl is-active --quiet nginx 2>/dev/null; then
                sudo systemctl reload nginx
            else
                sudo systemctl start nginx
            fi
            print_success "✅ system nginx کانفیگ شد"
        else
            print_error "خطا در کانفیگ nginx"
            sudo nginx -t
            exit 1
        fi
    fi
else
    print_info "⏭️ حالت لوکال - کانفیگ nginx رد شد"
fi

# 6. Build containers
print_header "6️⃣ Build Docker Containers"

print_info "در حال build containers..."
print_warning "این ممکن است 5-10 دقیقه طول بکشد..."
echo ""

# Build با نمایش پیشرفت
docker-compose build --parallel 2>&1 | while read line; do
    if [[ $line == *"Step"* ]] || [[ $line == *"Successfully"* ]] || [[ $line == *"Building"* ]]; then
        echo "$line"
    fi
done || {
    print_warning "Build موازی با خطا مواجه شد، تلاش مجدد..."
    docker-compose build
}

print_success "Build کامل شد"

# 7. اجرای containers
print_header "7️⃣ اجرای Containers"

print_info "در حال اجرای containers..."
docker-compose up -d

print_success "Containers اجرا شدند"

# 8. انتظار برای آماده شدن
print_header "8️⃣ انتظار برای آماده شدن سرویس‌ها"

print_info "صبر برای اجرای کامل سرویس‌ها (30 ثانیه)..."
for i in {1..30}; do
    echo -n "."
    sleep 1
done
echo ""

print_success "سرویس‌ها در حال اجرا هستند"

# 9. بررسی وضعیت
print_header "9️⃣ وضعیت Containers"

docker-compose ps

# 10. بررسی سلامت
print_header "🔟 بررسی سلامت سرویس‌ها"

check_service() {
    local name=$1
    local port=$2
    local max_wait=60
    local count=0
    
    print_info "بررسی $name (پورت $port)..."
    
    while [ $count -lt $max_wait ]; do
        HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null || echo "000")
        
        if [[ "$HTTP_CODE" =~ ^(200|301|302|404)$ ]]; then
            print_success "$name در حال اجراست (HTTP $HTTP_CODE)"
            return 0
        fi
        
        if [ $((count % 10)) -eq 0 ]; then
            echo -n "  انتظار..."
        fi
        echo -n "."
        sleep 2
        count=$((count + 1))
    done
    
    echo ""
    print_warning "$name هنوز آماده نیست (ممکن است نیاز به زمان بیشتری داشته باشد)"
    return 1
}

check_service "Next.js Frontend" 3003
check_service "Python API" 5001
check_service "phpMyAdmin" 8083

# 11. نمایش لاگ‌های اخیر
print_header "1️⃣1️⃣ لاگ‌های اخیر"

print_info "لاگ‌های 15 خط آخر هر سرویس:"
echo ""
docker-compose logs --tail=15

# 12. اطلاعات نهایی
print_header "✅ دیپلوی کامل شد!"

echo ""
print_success "پروژه School-Proj با موفقیت دیپلوی شد!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 لینک‌های دسترسی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 وب‌سایت اصلی:      https://$DOMAIN"
echo "  � APPI Python:         https://$DOMAIN/python-api"
echo "  � phpMyAdhmin:         https://$DOMAIN/phpmyadmin"
echo "  � Repdis Commander:    https://$DOMAIN/redis-commander"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 پورت‌های محلی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  • Next.js:         localhost:3003"
echo "  • Python:          localhost:5001"
echo "  • MySQL:           localhost:3307"
echo "  • Redis:           localhost:6380"
echo "  • phpMyAdmin:      localhost:8083"
echo "  • Redis Commander: localhost:8084"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛠️  دستورات مفید:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  • بررسی وضعیت:      bash status.sh"
echo "  • مشاهده لاگ‌ها:      bash status.sh logs"
echo "  • ری‌استارت:         bash restart.sh"
echo "  • ری‌استارت سرویس:   bash restart.sh [service-name]"
echo "  • توقف:              bash stop.sh"
echo ""

print_success "همه چیز آماده است! 🎉"
print_info "پروژه School-Proj کاملاً مستقل از CRM است و هیچ تداخلی ندارد"

# تست نهایی سایت
print_header "🌐 تست نهایی"

if [ "$MODE" = "server" ]; then
    print_info "تست دسترسی به سایت..."
    if curl -s -I https://sch.ahmadreza-avandi.ir | head -1 | grep -q "200\|301\|302"; then
        print_success "✅ سایت از طریق HTTPS قابل دسترسی است!"
        echo ""
        echo "🎯 سایت شما آماده است:"
        echo "   👉 https://sch.ahmadreza-avandi.ir"
    else
        print_warning "⚠️ سایت ممکن است هنوز کاملاً آماده نباشد"
        print_info "چند دقیقه صبر کنید یا لاگ‌ها را بررسی کنید"
    fi
else
    print_info "تست دسترسی محلی..."
    if curl -s -I http://localhost:3003 | head -1 | grep -q "200\|301\|302"; then
        print_success "✅ سایت از طریق localhost قابل دسترسی است!"
        echo ""
        echo "🎯 سایت محلی شما آماده است:"
        echo "   👉 http://localhost:3003"
    else
        print_warning "⚠️ سایت محلی ممکن است هنوز کاملاً آماده نباشد"
        print_info "چند دقیقه صبر کنید یا لاگ‌ها را بررسی کنید"
    fi
fi
