#!/bin/bash

# ═══════════════════════════════════════════════════════════
# اسکریپت بررسی وضعیت کامل CRM + School
# ═══════════════════════════════════════════════════════════

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

print_header "🔍 بررسی وضعیت سیستم"

# ۱. بررسی SSL Certificates
print_header "۱. بررسی گواهی‌های SSL"

if [ -f "/etc/letsencrypt/live/crm.robintejarat.com/fullchain.pem" ]; then
    print_success "SSL برای CRM موجود است"
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/crm.robintejarat.com/fullchain.pem | cut -d= -f2)
    print_info "تاریخ انقضا CRM: $EXPIRY"
else
    print_error "SSL برای CRM موجود نیست!"
fi

if [ -f "/etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem" ]; then
    print_success "SSL برای School موجود است"
    EXPIRY=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem | cut -d= -f2)
    print_info "تاریخ انقضا School: $EXPIRY"
else
    print_error "SSL برای School موجود نیست!"
fi

# ۲. بررسی Docker Containers
print_header "۲. بررسی Docker Containers"

print_info "CRM Containers:"
docker ps --filter "name=nextjs" --filter "name=phpmyadmin" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || print_warning "CRM containers در حال اجرا نیستند"

echo ""
print_info "School Containers:"
docker ps --filter "name=school-proj" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || print_warning "School containers در حال اجرا نیستند"

# ۳. بررسی پورت‌ها
print_header "۳. بررسی پورت‌ها"

check_port() {
    local port=$1
    local name=$2
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        print_success "$name در حال اجرا (پورت $port)"
    else
        print_error "$name در حال اجرا نیست (پورت $port)"
    fi
}

print_info "پورت‌های CRM:"
check_port 3000 "CRM Next.js"

echo ""
print_info "پورت‌های School:"
check_port 3003 "School Next.js"
check_port 3002 "School Nest.js"
check_port 5001 "School Python"
check_port 8083 "School phpMyAdmin"
check_port 8084 "School Redis Commander"

# ۴. بررسی Nginx
print_header "۴. بررسی Nginx"

if systemctl is-active --quiet nginx; then
    print_success "Nginx در حال اجراست"
    
    print_info "کانفیگ‌های فعال:"
    ls -la /etc/nginx/sites-enabled/ 2>/dev/null || print_warning "دایرکتوری sites-enabled یافت نشد"
    
    echo ""
    print_info "تست کانفیگ Nginx:"
    if nginx -t 2>&1 | grep -q "successful"; then
        print_success "کانفیگ Nginx معتبر است"
    else
        print_error "کانفیگ Nginx خطا دارد!"
        nginx -t
    fi
else
    print_error "Nginx در حال اجرا نیست!"
fi

# ۵. بررسی دسترسی به دامنه‌ها
print_header "۵. بررسی دسترسی به سرویس‌ها"

test_url() {
    local url=$1
    local name=$2
    local response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null)
    
    if [ "$response" = "200" ] || [ "$response" = "301" ] || [ "$response" = "302" ]; then
        print_success "$name پاسخ می‌دهد (HTTP $response)"
    else
        print_error "$name پاسخ نمی‌دهد (HTTP $response)"
    fi
}

print_info "تست سرویس‌های School (localhost):"
test_url "http://localhost:3003" "School Next.js"
test_url "http://localhost:3002" "School Nest.js"
test_url "http://localhost:5001" "School Python"
test_url "http://localhost:8083" "School phpMyAdmin"

# ۶. خلاصه نهایی
print_header "📋 خلاصه"

echo ""
print_info "دامنه‌های شما:"
echo "  🔹 CRM:    https://crm.robintejarat.com"
echo "  🔹 School: https://sch.ahmadreza-avandi.ir"
echo ""

print_info "برای اعمال کانفیگ Nginx:"
echo "  sudo bash apply-nginx-config.sh"
echo ""

print_info "برای مشاهده لاگ‌های Nginx:"
echo "  sudo tail -f /var/log/nginx/error.log"
echo ""

print_info "برای مشاهده لاگ‌های School:"
echo "  cd school-proj && docker-compose logs -f"
echo ""
