#!/bin/bash

# 🔐 اسکریپت دریافت گواهی SSL برای School-Proj
# دامنه: sch.ahmadreza-avandi.ir

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
EMAIL="admin@ahmadreza-avandi.ir"  # ایمیل خود را وارد کنید

print_header "🔐 دریافت گواهی SSL برای $DOMAIN"

# بررسی دسترسی root
if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با دسترسی root اجرا شود"
    print_info "لطفاً با sudo اجرا کنید: sudo bash setup-ssl.sh"
    exit 1
fi

# بررسی نصب Certbot
print_info "بررسی نصب Certbot..."
if ! command -v certbot &> /dev/null; then
    print_warning "Certbot نصب نیست. در حال نصب..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot نصب شد"
else
    print_success "Certbot نصب شده است"
fi

# بررسی نصب Nginx
print_info "بررسی نصب Nginx..."
if ! command -v nginx &> /dev/null; then
    print_warning "Nginx نصب نیست. در حال نصب..."
    apt-get update
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx نصب و راه‌اندازی شد"
else
    print_success "Nginx نصب شده است"
fi

# بررسی وجود گواهی قبلی
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_warning "گواهی SSL برای $DOMAIN قبلاً دریافت شده است"
    read -p "آیا می‌خواهید گواهی را تمدید کنید؟ (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "در حال تمدید گواهی..."
        certbot renew --nginx
        print_success "گواهی تمدید شد"
    fi
    exit 0
fi

# بررسی DNS
print_info "بررسی DNS برای $DOMAIN..."
if ! host $DOMAIN > /dev/null 2>&1; then
    print_error "دامنه $DOMAIN به IP سرور متصل نیست!"
    print_info "لطفاً ابتدا DNS را تنظیم کنید"
    exit 1
fi

SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(host $DOMAIN | grep "has address" | awk '{print $4}' | head -n1)

print_info "IP سرور: $SERVER_IP"
print_info "IP دامنه: $DOMAIN_IP"

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    print_warning "IP دامنه با IP سرور مطابقت ندارد!"
    read -p "آیا می‌خواهید ادامه دهید؟ (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# ایجاد کانفیگ موقت Nginx برای Certbot
print_info "ایجاد کانفیگ موقت Nginx..."
cat > /etc/nginx/sites-available/school-proj-temp << EOF
server {
    listen 80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# فعال‌سازی کانفیگ موقت
ln -sf /etc/nginx/sites-available/school-proj-temp /etc/nginx/sites-enabled/school-proj-temp

# تست و reload Nginx
print_info "تست کانفیگ Nginx..."
if nginx -t; then
    systemctl reload nginx
    print_success "Nginx reload شد"
else
    print_error "کانفیگ Nginx خطا دارد!"
    exit 1
fi

# دریافت گواهی SSL
print_header "دریافت گواهی SSL"
print_info "در حال دریافت گواهی از Let's Encrypt..."
print_warning "این ممکن است چند دقیقه طول بکشد..."

certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    print_success "گواهی SSL با موفقیت دریافت شد!"
    
    # حذف کانفیگ موقت
    rm -f /etc/nginx/sites-enabled/school-proj-temp
    rm -f /etc/nginx/sites-available/school-proj-temp
    
    # نمایش اطلاعات گواهی
    print_header "📋 اطلاعات گواهی"
    echo "  📁 مسیر گواهی: /etc/letsencrypt/live/$DOMAIN/"
    echo "  📄 Certificate: fullchain.pem"
    echo "  🔑 Private Key: privkey.pem"
    echo "  📅 تاریخ انقضا: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)"
    echo ""
    
    # تنظیم تمدید خودکار
    print_info "تنظیم تمدید خودکار..."
    if ! crontab -l | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
        print_success "تمدید خودکار تنظیم شد (هر روز ساعت 3 صبح)"
    else
        print_info "تمدید خودکار قبلاً تنظیم شده است"
    fi
    
    print_success "همه چیز آماده است!"
    print_info "حالا می‌توانید deploy.sh را اجرا کنید"
    
else
    print_error "دریافت گواهی SSL با خطا مواجه شد!"
    print_info "لطفاً موارد زیر را بررسی کنید:"
    echo "  1. دامنه به درستی به IP سرور متصل است"
    echo "  2. پورت 80 باز است"
    echo "  3. Nginx در حال اجراست"
    echo "  4. فایروال مشکلی ایجاد نمی‌کند"
    exit 1
fi
