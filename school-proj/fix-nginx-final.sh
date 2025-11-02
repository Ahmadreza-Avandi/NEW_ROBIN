#!/bin/bash

# 🔧 اسکریپت نهایی برای تنظیم nginx

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

if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با sudo اجرا شود"
    exit 1
fi

print_header "🔧 تنظیم نهایی Nginx برای School-Proj"

# 1. پاک‌سازی کانفیگ‌های موقت
print_info "پاک‌سازی کانفیگ‌های موقت..."
rm -f /etc/nginx/sites-enabled/school-proj-temp 2>/dev/null || true
rm -f /etc/nginx/sites-available/school-proj-temp 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/school-ssl* 2>/dev/null || true
rm -f /etc/nginx/sites-available/school-ssl* 2>/dev/null || true
rm -f /etc/nginx/sites-enabled/school-proj-certbot 2>/dev/null || true
rm -f /etc/nginx/sites-available/school-proj-certbot 2>/dev/null || true
print_success "پاک‌سازی انجام شد"

# 2. کپی کانفیگ جدید
print_info "کپی کانفیگ nginx برای School-Proj..."
cp nginx-config.conf /etc/nginx/sites-available/school-proj

# 3. ایجاد symlink
print_info "ایجاد symlink..."
rm -f /etc/nginx/sites-enabled/school-proj
ln -sf /etc/nginx/sites-available/school-proj /etc/nginx/sites-enabled/school-proj

# 4. نمایش کانفیگ‌های فعال
print_header "کانفیگ‌های فعال nginx"
ls -la /etc/nginx/sites-enabled/

# 5. تست nginx
print_info "تست کانفیگ nginx..."
if nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
else
    print_error "خطا در کانفیگ nginx"
    nginx -t
    exit 1
fi

# 6. Reload nginx
print_info "Reload nginx..."
if systemctl is-active --quiet nginx; then
    systemctl reload nginx
    print_success "nginx reload شد"
else
    print_warning "nginx روی host فعال نیست"
    print_info "آیا nginx در Docker container است؟"
    
    if docker ps | grep -q "nginx"; then
        print_info "nginx در Docker یافت شد"
        print_warning "برای reload nginx در Docker:"
        echo "  docker exec <nginx-container-name> nginx -s reload"
    fi
fi

print_header "✅ تنظیمات nginx کامل شد"

echo ""
print_info "بررسی دسترسی:"
echo "  • https://sch.ahmadreza-avandi.ir"
echo ""
print_info "اگر هنوز CRM نمایش می‌دهد:"
echo "  1. Cache مرورگر را پاک کنید"
echo "  2. از حالت Incognito استفاده کنید"
echo "  3. DNS را چک کنید: nslookup sch.ahmadreza-avandi.ir"
echo ""
