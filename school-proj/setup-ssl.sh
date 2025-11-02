#!/bin/bash

# 🔐 اسکریپت دریافت گواهی SSL برای School-Proj
# دامنه: sch.ahmadreza-avandi.ir
# این اسکریپت با nginx موجود (CRM) کار می‌کند

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
EMAIL="admin@ahmadreza-avandi.ir"

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
    apt-get update -qq
    apt-get install -y certbot > /dev/null 2>&1
    print_success "Certbot نصب شد"
else
    print_success "Certbot نصب شده است"
fi

# بررسی وجود گواهی قبلی
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_success "گواهی SSL برای $DOMAIN قبلاً دریافت شده است"
    print_info "مسیر گواهی: /etc/letsencrypt/live/$DOMAIN/"
    
    # نمایش تاریخ انقضا
    EXPIRY_DATE=$(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)
    print_info "تاریخ انقضا: $EXPIRY_DATE"
    
    echo ""
    read -p "آیا می‌خواهید گواهی را تمدید کنید؟ (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "در حال تمدید گواهی..."
        certbot renew --force-renewal
        if [ $? -eq 0 ]; then
            print_success "گواهی تمدید شد"
        else
            print_error "تمدید گواهی با خطا مواجه شد"
        fi
    fi
    
    print_success "گواهی SSL آماده است!"
    print_info "حالا می‌توانید deploy.sh را اجرا کنید"
    exit 0
fi

# بررسی DNS
print_info "بررسی DNS برای $DOMAIN..."
DOMAIN_IP=$(host $DOMAIN 2>/dev/null | grep "has address" | awk '{print $4}' | head -n1)

if [ -z "$DOMAIN_IP" ]; then
    print_error "دامنه $DOMAIN به IP سرور متصل نیست!"
    print_info "لطفاً ابتدا DNS را تنظیم کنید"
    exit 1
fi

print_info "IP دامنه: $DOMAIN_IP"

# بررسی وجود nginx (host یا container)
print_header "بررسی وضعیت Nginx"

NGINX_IN_CONTAINER=false
NGINX_ON_HOST=false

# بررسی nginx در container
if docker ps 2>/dev/null | grep -q "nginx"; then
    print_info "Nginx در حال اجرا در Docker container"
    NGINX_IN_CONTAINER=true
fi

# بررسی nginx روی host
if systemctl is-active --quiet nginx 2>/dev/null; then
    print_info "Nginx در حال اجرا روی host"
    NGINX_ON_HOST=true
fi

# بررسی پورت 80
print_info "بررسی پورت 80..."
if netstat -tuln 2>/dev/null | grep -q ":80 "; then
    print_warning "پورت 80 در حال استفاده است"
    PORT_80_IN_USE=true
else
    print_success "پورت 80 آزاد است"
    PORT_80_IN_USE=false
fi

# انتخاب روش دریافت گواهی
print_header "دریافت گواهی SSL"

if [ "$PORT_80_IN_USE" = true ]; then
    print_info "روش: استفاده از webroot (پورت 80 در حال استفاده است)"
    
    # ایجاد دایرکتوری webroot
    mkdir -p /var/www/certbot
    chmod 755 /var/www/certbot
    
    # اضافه کردن کانفیگ موقت برای certbot
    print_info "اضافه کردن کانفیگ موقت به nginx..."
    
    cat > /etc/nginx/sites-available/school-ssl-temp << 'EOF'
server {
    listen 80;
    server_name sch.ahmadreza-avandi.ir;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }
    
    location / {
        return 200 'SSL Setup';
        add_header Content-Type text/plain;
    }
}
EOF
    
    # فعال‌سازی کانفیگ
    ln -sf /etc/nginx/sites-available/school-ssl-temp /etc/nginx/sites-enabled/school-ssl-temp
    
    # تست و reload nginx
    if nginx -t 2>&1 | grep -q "successful"; then
        if [ "$NGINX_ON_HOST" = true ]; then
            systemctl reload nginx
        fi
        print_success "کانفیگ nginx آپدیت شد"
    else
        print_error "خطا در کانفیگ nginx"
        rm -f /etc/nginx/sites-enabled/school-ssl-temp
        exit 1
    fi
    
    # دریافت گواهی
    print_info "در حال دریافت گواهی از Let's Encrypt..."
    print_warning "این ممکن است چند دقیقه طول بکشد..."
    
    certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN \
        --preferred-challenges http
    
    CERTBOT_EXIT=$?
    
    # حذف کانفیگ موقت
    rm -f /etc/nginx/sites-enabled/school-ssl-temp
    rm -f /etc/nginx/sites-available/school-ssl-temp
    
    if [ "$NGINX_ON_HOST" = true ]; then
        systemctl reload nginx 2>/dev/null || true
    fi
    
else
    print_info "روش: standalone (پورت 80 آزاد است)"
    
    # توقف موقت nginx اگر روی host است
    if [ "$NGINX_ON_HOST" = true ]; then
        print_info "توقف موقت nginx..."
        systemctl stop nginx
    fi
    
    # دریافت گواهی
    print_info "در حال دریافت گواهی از Let's Encrypt..."
    print_warning "این ممکن است چند دقیقه طول بکشد..."
    
    certbot certonly \
        --standalone \
        --non-interactive \
        --agree-tos \
        --email $EMAIL \
        -d $DOMAIN \
        --preferred-challenges http
    
    CERTBOT_EXIT=$?
    
    # راه‌اندازی مجدد nginx
    if [ "$NGINX_ON_HOST" = true ]; then
        print_info "راه‌اندازی مجدد nginx..."
        systemctl start nginx
    fi
fi

# بررسی نتیجه
if [ $CERTBOT_EXIT -eq 0 ]; then
    print_success "گواهی SSL با موفقیت دریافت شد!"
    
    # نمایش اطلاعات گواهی
    print_header "📋 اطلاعات گواهی"
    echo "  📁 مسیر گواهی: /etc/letsencrypt/live/$DOMAIN/"
    echo "  📄 Certificate: fullchain.pem"
    echo "  🔑 Private Key: privkey.pem"
    echo "  📅 تاریخ انقضا: $(openssl x509 -enddate -noout -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem | cut -d= -f2)"
    echo ""
    
    # تنظیم تمدید خودکار
    print_info "تنظیم تمدید خودکار..."
    if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
        (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet") | crontab -
        print_success "تمدید خودکار تنظیم شد (هر روز ساعت 3 صبح)"
    else
        print_info "تمدید خودکار قبلاً تنظیم شده است"
    fi
    
    print_success "همه چیز آماده است!"
    echo ""
    print_info "مرحله بعدی: دیپلوی پروژه"
    print_success "دستور: bash deploy.sh"
    
else
    print_error "دریافت گواهی SSL با خطا مواجه شد!"
    echo ""
    print_info "لطفاً موارد زیر را بررسی کنید:"
    echo "  1. دامنه به درستی به IP سرور متصل است"
    echo "  2. پورت 80 در دسترس است"
    echo "  3. فایروال مشکلی ایجاد نمی‌کند"
    echo ""
    print_info "برای مشاهده جزئیات خطا:"
    echo "  sudo tail -50 /var/log/letsencrypt/letsencrypt.log"
    echo ""
    print_info "اگر nginx پروژه CRM در حال اجراست، این دستور را امتحان کنید:"
    echo "  sudo certbot certonly --webroot --webroot-path=/var/www/certbot -d $DOMAIN"
    exit 1
fi
