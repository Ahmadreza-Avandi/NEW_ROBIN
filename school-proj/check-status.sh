#!/bin/bash

# اسکریپت بررسی وضعیت کامل پروژه

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="sch.ahmadreza-avandi.ir"

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

check_service() {
    local service_name=$1
    local port=$2
    local url=${3:-"http://localhost:$port"}
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|302\|404"; then
        print_success "$service_name در حال اجراست"
        return 0
    else
        print_error "$service_name در دسترس نیست"
        return 1
    fi
}

print_header "🔍 بررسی وضعیت پروژه $DOMAIN"

# ۱. بررسی Docker
print_header "۱. بررسی Docker"

if command -v docker &> /dev/null; then
    print_success "Docker نصب شده است"
    
    if docker-compose ps &> /dev/null; then
        print_success "Docker Compose در دسترس است"
        echo ""
        print_info "وضعیت Containers:"
        docker-compose ps
    else
        print_error "Docker Compose در دسترس نیست"
    fi
else
    print_error "Docker نصب نیست"
fi

# ۲. بررسی Nginx
print_header "۲. بررسی Nginx"

if command -v nginx &> /dev/null; then
    print_success "Nginx نصب شده است"
    
    if systemctl is-active --quiet nginx; then
        print_success "Nginx در حال اجراست"
    else
        print_error "Nginx در حال اجرا نیست"
    fi
    
    if nginx -t &> /dev/null; then
        print_success "کانفیگ Nginx معتبر است"
    else
        print_error "کانفیگ Nginx خطا دارد"
    fi
else
    print_error "Nginx نصب نیست"
fi

# ۳. بررسی SSL
print_header "۳. بررسی SSL"

if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_success "گواهی SSL موجود است"
    
    expiry_date=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null | cut -d= -f2)
    if [ ! -z "$expiry_date" ]; then
        print_info "تاریخ انقضا: $expiry_date"
    fi
else
    print_error "گواهی SSL موجود نیست"
fi

# ۴. بررسی سرویس‌های محلی
print_header "۴. بررسی سرویس‌های محلی"

check_service "Next.js" 3000
check_service "Nest.js" 3001
check_service "Python API" 5000
check_service "phpMyAdmin" 8081
check_service "Redis Commander" 8082

# ۵. بررسی سرویس‌های عمومی
print_header "۵. بررسی سرویس‌های عمومی"

if command -v curl &> /dev/null; then
    check_service "وب‌سایت اصلی" 443 "https://$DOMAIN"
    check_service "API Nest.js" 443 "https://$DOMAIN/api"
    check_service "API Python" 443 "https://$DOMAIN/python-api"
    check_service "phpMyAdmin" 443 "https://$DOMAIN/phpmyadmin"
    check_service "Redis Commander" 443 "https://$DOMAIN/redis-commander"
else
    print_warning "curl نصب نیست - نمی‌توان سرویس‌های عمومی را تست کرد"
fi

# ۶. بررسی منابع سیستم
print_header "۶. بررسی منابع سیستم"

print_info "استفاده از دیسک:"
df -h / | tail -1

print_info "استفاده از RAM:"
free -h | grep Mem

if command -v docker &> /dev/null; then
    print_info "استفاده منابع containers:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" 2>/dev/null || print_warning "نمی‌توان آمار containers را نمایش داد"
fi

# ۷. خلاصه
print_header "📊 خلاصه وضعیت"

echo ""
print_info "🌐 لینک‌های مفید:"
echo "  • وب‌سایت: https://$DOMAIN"
echo "  • API: https://$DOMAIN/api"
echo "  • Python API: https://$DOMAIN/python-api"
echo "  • phpMyAdmin: https://$DOMAIN/phpmyadmin"
echo "  • Redis: https://$DOMAIN/redis-commander"
echo ""

print_info "🔧 دستورات مفید:"
echo "  • مشاهده لاگ‌ها: docker-compose logs -f"
echo "  • ری‌استارت: docker-compose restart"
echo "  • وضعیت: docker-compose ps"
echo "  • تست Nginx: sudo nginx -t"
echo ""

print_success "✅ بررسی وضعیت تکمیل شد!"