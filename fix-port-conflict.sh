#!/bin/bash

# ═══════════════════════════════════════════════════════════
# فیکس conflict پورت - توقف nginx container
# ═══════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با sudo اجرا شود"
    exit 1
fi

print_header "🔧 فیکس Conflict پورت"

# ۱. پیدا کردن nginx container
print_info "پیدا کردن nginx container..."
NGINX_CONTAINER=$(docker ps --filter "name=nginx" --format "{{.Names}}" | head -n1)

if [ -z "$NGINX_CONTAINER" ]; then
    print_warning "nginx container یافت نشد"
else
    print_info "یافت شد: $NGINX_CONTAINER"
    
    echo ""
    read -p "آیا می‌خواهید این container رو stop کنید؟ (y/n) " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "در حال stop کردن $NGINX_CONTAINER..."
        docker stop "$NGINX_CONTAINER"
        print_success "Container متوقف شد"
        
        echo ""
        read -p "آیا می‌خواهید این container رو حذف کنید؟ (y/n) " -n 1 -r
        echo ""
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker rm "$NGINX_CONTAINER"
            print_success "Container حذف شد"
        fi
    else
        print_warning "Container متوقف نشد - نمی‌تونیم ادامه بدیم"
        exit 1
    fi
fi

# ۲. بررسی پورت‌ها
print_info "بررسی پورت‌ها..."
sleep 2

if netstat -tuln | grep -q ":80 "; then
    print_error "پورت 80 هنوز گرفته شده!"
    lsof -i :80
    exit 1
else
    print_success "پورت 80 آزاد است"
fi

if netstat -tuln | grep -q ":443 "; then
    print_error "پورت 443 هنوز گرفته شده!"
    lsof -i :443
    exit 1
else
    print_success "پورت 443 آزاد است"
fi

# ۳. استارت nginx روی host
print_info "استارت nginx روی host..."
systemctl start nginx

if systemctl is-active --quiet nginx; then
    print_success "Nginx با موفقیت استارت شد!"
    
    print_header "✅ تمام!"
    echo ""
    print_success "دامنه‌های شما آماده هستند:"
    echo ""
    echo "  🔹 CRM:    https://crm.robintejarat.com"
    echo "  🔹 School: https://sch.ahmadreza-avandi.ir"
    echo ""
    
    print_info "تست کن:"
    echo "  curl -I https://sch.ahmadreza-avandi.ir"
    echo "  curl -I https://crm.robintejarat.com"
    echo ""
    
    print_info "برای مشاهده لاگ‌ها:"
    echo "  sudo tail -f /var/log/nginx/access.log"
    echo "  sudo tail -f /var/log/nginx/error.log"
    
else
    print_error "Nginx استارت نشد!"
    systemctl status nginx
    exit 1
fi
