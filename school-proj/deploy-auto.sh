#!/bin/bash

# 🚀 اسکریپت دیپلوی خودکار School-Proj (بدون تعامل)
# این اسکریپت همه چیز رو خودکار انجام می‌ده

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

DOMAIN="sch.ahmadreza-avandi.ir"

print_header "🚀 دیپلوی خودکار School-Proj"

# 1. پاک‌سازی کانفیگ‌های موقت
print_header "1️⃣ پاک‌سازی"
print_info "حذف کانفیگ‌های موقت nginx..."

sudo rm -f /etc/nginx/sites-enabled/school-proj-temp 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-proj-temp 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/school-ssl* 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-ssl* 2>/dev/null || true
sudo rm -f /etc/nginx/sites-enabled/school-proj-certbot 2>/dev/null || true
sudo rm -f /etc/nginx/sites-available/school-proj-certbot 2>/dev/null || true

print_success "پاک‌سازی انجام شد"

# 2. بررسی SSL
print_header "2️⃣ بررسی SSL"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_success "گواهی SSL موجود است"
else
    print_error "گواهی SSL یافت نشد!"
    print_info "لطفاً ابتدا SSL را دریافت کنید:"
    echo "  sudo bash get-ssl-manual.sh"
    exit 1
fi

# 3. توقف containers قبلی
print_header "3️⃣ توقف containers قبلی"
if [ -f "docker-compose.yml" ]; then
    print_info "در حال توقف containers..."
    docker-compose down 2>/dev/null || true
    print_success "Containers متوقف شدند"
fi

# 4. کانفیگ Nginx
print_header "4️⃣ کانفیگ Nginx"
print_info "کپی کانفیگ nginx..."

sudo cp nginx-config.conf /etc/nginx/sites-available/school-proj

# حذف symlink قبلی و ایجاد جدید
sudo rm -f /etc/nginx/sites-enabled/school-proj
sudo ln -sf /etc/nginx/sites-available/school-proj /etc/nginx/sites-enabled/school-proj

# تست nginx
print_info "تست کانفیگ nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
    
    # reload nginx اگر فعال است
    if sudo systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
        print_success "nginx reload شد"
    else
        print_warning "nginx روی host فعال نیست (احتمالاً در Docker است)"
    fi
else
    print_error "خطا در کانفیگ nginx"
    sudo nginx -t
    exit 1
fi

# 5. Build و اجرای containers
print_header "5️⃣ Build و اجرای Docker Containers"

print_info "در حال build containers..."
print_warning "این ممکن است چند دقیقه طول بکشد..."

docker-compose build --parallel 2>&1 | grep -v "^#" || {
    print_warning "Build موازی با خطا مواجه شد، تلاش مجدد..."
    docker-compose build
}

print_success "Build کامل شد"

print_info "در حال اجرای containers..."
docker-compose up -d

print_success "Containers اجرا شدند"

# 6. انتظار برای آماده شدن سرویس‌ها
print_header "6️⃣ انتظار برای آماده شدن سرویس‌ها"
print_info "صبر برای اجرای کامل سرویس‌ها..."
sleep 10

# 7. بررسی وضعیت
print_header "7️⃣ وضعیت Containers"
docker-compose ps

# 8. بررسی سلامت
print_header "8️⃣ بررسی سلامت سرویس‌ها"

check_service() {
    local name=$1
    local port=$2
    local max_wait=30
    local count=0
    
    print_info "بررسی $name (پورت $port)..."
    
    while [ $count -lt $max_wait ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port 2>/dev/null | grep -q "200\|301\|302\|404"; then
            print_success "$name در حال اجراست"
            return 0
        fi
        sleep 2
        count=$((count + 1))
    done
    
    print_warning "$name هنوز آماده نیست"
    return 1
}

check_service "Next.js" 3003
check_service "Nest.js" 3002
check_service "Python" 5001
check_service "phpMyAdmin" 8083

# 9. نمایش لاگ‌های اخیر
print_header "9️⃣ لاگ‌های اخیر"
docker-compose logs --tail=20

# 10. اطلاعات نهایی
print_header "✅ دیپلوی کامل شد!"

echo ""
print_success "پروژه School-Proj با موفقیت دیپلوی شد!"
echo ""
echo "🌐 لینک‌های دسترسی:"
echo "  • وب‌سایت:        https://$DOMAIN"
echo "  • API Nest.js:    https://$DOMAIN/api"
echo "  • API Python:     https://$DOMAIN/python-api"
echo "  • phpMyAdmin:     https://$DOMAIN/phpmyadmin"
echo "  • Redis Commander: https://$DOMAIN/redis-commander"
echo ""
echo "📍 پورت‌های محلی:"
echo "  • Next.js:    localhost:3003"
echo "  • Nest.js:    localhost:3002"
echo "  • Python:     localhost:5001"
echo "  • MySQL:      localhost:3307"
echo "  • Redis:      localhost:6380"
echo ""
print_info "دستورات مفید:"
echo "  • وضعیت:         bash status.sh"
echo "  • لاگ‌ها:         bash status.sh logs"
echo "  • ری‌استارت:     bash restart.sh"
echo "  • توقف:          bash stop.sh"
echo ""

print_success "همه چیز آماده است! 🎉"
