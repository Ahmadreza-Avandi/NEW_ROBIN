#!/bin/bash

# 🔧 اسکریپت رفع مشکل Nginx

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

echo "🔧 رفع مشکل Nginx برای School-Proj"
echo ""

# 1. نمایش کانفیگ‌های فعلی
print_info "کانفیگ‌های فعلی nginx:"
sudo ls -la /etc/nginx/sites-enabled/ | grep -E 'sch|school' || echo "  هیچ کانفیگی یافت نشد"
echo ""

# 2. پیدا کردن کانفیگ‌های تکراری
print_info "جستجوی کانفیگ‌های تکراری برای دامنه sch.ahmadreza-avandi.ir..."
CONFLICTING_CONFIGS=$(sudo grep -l "server_name.*sch.ahmadreza-avandi.ir" /etc/nginx/sites-enabled/* 2>/dev/null | grep -v "school-proj" || true)

if [ ! -z "$CONFLICTING_CONFIGS" ]; then
    print_warning "کانفیگ‌های تکراری یافت شد:"
    echo "$CONFLICTING_CONFIGS"
    echo ""
    
    read -p "آیا می‌خواهید این کانفیگ‌ها را حذف کنید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        for config in $CONFLICTING_CONFIGS; do
            print_info "حذف $config..."
            sudo rm "$config"
        done
        print_success "کانفیگ‌های تکراری حذف شدند"
    fi
else
    print_success "کانفیگ تکراری یافت نشد"
fi

# 3. اطمینان از وجود کانفیگ school-proj
if [ ! -f "/etc/nginx/sites-enabled/school-proj" ]; then
    print_warning "کانفیگ school-proj در sites-enabled یافت نشد"
    print_info "کپی کانفیگ..."
    sudo cp nginx-config.conf /etc/nginx/sites-available/school-proj
    sudo ln -sf /etc/nginx/sites-available/school-proj /etc/nginx/sites-enabled/school-proj
    print_success "کانفیگ کپی شد"
fi

# 4. تست کانفیگ
print_info "تست کانفیگ nginx..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
else
    print_error "خطا در کانفیگ nginx:"
    sudo nginx -t
    exit 1
fi

# 5. Start/Restart nginx
print_info "راه‌اندازی nginx..."
if sudo systemctl is-active --quiet nginx; then
    print_info "nginx در حال اجراست، reload می‌شود..."
    sudo systemctl reload nginx
else
    print_info "nginx متوقف است، start می‌شود..."
    sudo systemctl start nginx
fi

# 6. Enable nginx
print_info "فعال‌سازی nginx برای اجرای خودکار..."
sudo systemctl enable nginx

# 7. بررسی وضعیت نهایی
echo ""
print_info "وضعیت نهایی nginx:"
sudo systemctl status nginx --no-pager -l

echo ""
print_success "✅ nginx آماده است!"
echo ""
echo "🌐 سایت شما باید از طریق HTTPS قابل دسترسی باشد:"
echo "   https://sch.ahmadreza-avandi.ir"
