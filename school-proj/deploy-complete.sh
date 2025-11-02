#!/bin/bash

# 🚀 اسکریپت دیپلوی کامل School-Proj
# این اسکریپت همه چیز رو از صفر تا صد انجام می‌ده

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

DOMAIN="sch.ahmadreza-avandi.ir"

print_header "🚀 دیپلوی کامل School-Proj"
print_info "دامنه: $DOMAIN"
print_info "پورت‌ها: Next.js:3003, Nest.js:3002, Python:5001, MySQL:3307, Redis:6380"
echo ""

# 1. ایجاد فایل‌های .env
print_header "1️⃣ ایجاد فایل‌های .env"

if [ ! -f ".env" ] || [ ! -f "nest/.env" ] || [ ! -f "next/.env.local" ]; then
    print_info "فایل‌های .env یافت نشدند، در حال ایجاد..."
    bash setup-env.sh
else
    print_success "فایل‌های .env موجود هستند"
    read -p "آیا می‌خواهید فایل‌های .env را دوباره بسازید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        bash setup-env.sh
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

# 3. بررسی SSL
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

# 4. توقف containers قبلی
print_header "4️⃣ توقف containers قبلی"

if [ -f "docker-compose.yml" ]; then
    print_info "در حال توقف containers..."
    docker-compose down 2>/dev/null || true
    print_success "Containers متوقف شدند"
fi

# 5. کانفیگ Nginx
print_header "5️⃣ کانفیگ Nginx"

print_info "کپی کانفیگ nginx..."
sudo cp nginx-config.conf /etc/nginx/sites-available/school-proj

# حذف و ایجاد symlink
sudo rm -f /etc/nginx/sites-enabled/school-proj
sudo ln -sf /etc/nginx/sites-available/school-proj /etc/nginx/sites-enabled/school-proj

# تست nginx
print_info "تست کانفیگ nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
    
    # reload nginx
    if sudo systemctl is-active --quiet nginx 2>/dev/null; then
        sudo systemctl reload nginx
        print_success "nginx reload شد"
    else
        print_info "nginx روی host فعال نیست (در Docker است)"
    fi
else
    print_error "خطا در کانفیگ nginx"
    sudo nginx -t
    exit 1
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
check_service "Nest.js Backend" 3002
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
echo "  🔧 API Nest.js:        https://$DOMAIN/api"
echo "  🐍 API Python:         https://$DOMAIN/python-api"
echo "  💾 phpMyAdmin:         https://$DOMAIN/phpmyadmin"
echo "  📊 Redis Commander:    https://$DOMAIN/redis-commander"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📍 پورت‌های محلی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  • Next.js:         localhost:3003"
echo "  • Nest.js:         localhost:3002"
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
