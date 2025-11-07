#!/bin/bash

# ═══════════════════════════════════════════════════════════
# اسکریپت اعمال کانفیگ Nginx برای CRM + School
# ═══════════════════════════════════════════════════════════

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# بررسی root access
if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با sudo اجرا شود"
    exit 1
fi

print_header "🔧 اعمال کانفیگ Nginx"

# بررسی وجود فایل کانفیگ
if [ ! -f "nginx-combined-final.conf" ]; then
    print_error "فایل nginx-combined-final.conf یافت نشد!"
    exit 1
fi

# بکاپ از کانفیگ فعلی
print_info "بکاپ از کانفیگ فعلی..."
BACKUP_DIR="/etc/nginx/backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -d "/etc/nginx/sites-enabled" ]; then
    cp -r /etc/nginx/sites-enabled/* "$BACKUP_DIR/" 2>/dev/null || true
fi
if [ -d "/etc/nginx/sites-available" ]; then
    cp -r /etc/nginx/sites-available/* "$BACKUP_DIR/" 2>/dev/null || true
fi

print_success "بکاپ در $BACKUP_DIR ذخیره شد"

# کپی کانفیگ جدید
print_info "کپی کانفیگ جدید..."
cp nginx-combined-final.conf /etc/nginx/sites-available/combined-projects

# حذف کانفیگ‌های قدیمی از sites-enabled
print_info "پاک‌سازی کانفیگ‌های قدیمی..."
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/school-proj
rm -f /etc/nginx/sites-enabled/crm-proj

# فعال‌سازی کانفیگ جدید
print_info "فعال‌سازی کانفیگ جدید..."
ln -sf /etc/nginx/sites-available/combined-projects /etc/nginx/sites-enabled/combined-projects

# تست کانفیگ
print_info "تست کانفیگ Nginx..."
if nginx -t 2>&1; then
    print_success "کانفیگ Nginx معتبر است"
    
    # Reload Nginx
    print_info "Reload Nginx..."
    systemctl reload nginx
    
    print_success "Nginx با موفقیت reload شد!"
    
    print_header "✅ تمام شد!"
    echo ""
    print_success "دامنه‌های شما آماده هستند:"
    echo ""
    echo "  🔹 CRM:    https://crm.robintejarat.com"
    echo "  🔹 School: https://sch.ahmadreza-avandi.ir"
    echo ""
    print_info "برای بررسی وضعیت:"
    echo "  systemctl status nginx"
    echo ""
    print_info "برای مشاهده لاگ‌ها:"
    echo "  tail -f /var/log/nginx/error.log"
    echo "  tail -f /var/log/nginx/access.log"
    
else
    print_error "کانفیگ Nginx خطا دارد!"
    echo ""
    print_info "در حال بازگردانی بکاپ..."
    
    rm -f /etc/nginx/sites-enabled/combined-projects
    cp -r "$BACKUP_DIR"/* /etc/nginx/sites-enabled/ 2>/dev/null || true
    
    systemctl reload nginx 2>/dev/null || true
    
    print_error "کانفیگ قبلی بازگردانی شد"
    echo ""
    print_info "برای مشاهده خطا:"
    echo "  nginx -t"
    exit 1
fi
