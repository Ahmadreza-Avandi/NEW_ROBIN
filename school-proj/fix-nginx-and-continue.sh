#!/bin/bash

# 🔧 اسکریپت رفع مشکل nginx و ادامه دیپلوی

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

print_header "🔧 رفع مشکل nginx و ادامه دیپلوی"

# بررسی root
if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با sudo اجرا شود"
    exit 1
fi

# حذف کانفیگ‌های موقت
print_info "پاک‌سازی کانفیگ‌های موقت..."

rm -f /etc/nginx/sites-enabled/school-proj-temp
rm -f /etc/nginx/sites-available/school-proj-temp
rm -f /etc/nginx/sites-enabled/school-ssl-temp
rm -f /etc/nginx/sites-available/school-ssl-temp
rm -f /etc/nginx/sites-enabled/school-ssl
rm -f /etc/nginx/sites-available/school-ssl
rm -f /etc/nginx/sites-enabled/school-proj-certbot
rm -f /etc/nginx/sites-available/school-proj-certbot

print_success "کانفیگ‌های موقت پاک شدند"

# بررسی وضعیت nginx
print_info "بررسی وضعیت nginx..."

if systemctl is-active --quiet nginx; then
    print_info "nginx روی host در حال اجراست"
    NGINX_ON_HOST=true
else
    print_warning "nginx روی host فعال نیست"
    NGINX_ON_HOST=false
fi

if docker ps 2>/dev/null | grep -q "nginx"; then
    print_info "nginx در Docker container در حال اجراست"
    NGINX_IN_DOCKER=true
else
    print_warning "nginx در Docker container یافت نشد"
    NGINX_IN_DOCKER=false
fi

# تست کانفیگ nginx
print_info "تست کانفیگ nginx..."
if nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
    
    # reload nginx اگر روی host است
    if [ "$NGINX_ON_HOST" = true ]; then
        systemctl reload nginx
        print_success "nginx reload شد"
    fi
else
    print_error "کانفیگ nginx خطا دارد"
    nginx -t
    exit 1
fi

# نمایش کانفیگ‌های فعال
print_header "📋 کانفیگ‌های فعال nginx"
ls -la /etc/nginx/sites-enabled/

print_success "nginx آماده است!"
echo ""
print_info "حالا می‌توانید دیپلوی را ادامه دهید:"
echo ""
echo "  cd school-proj"
echo "  bash deploy.sh"
echo ""
