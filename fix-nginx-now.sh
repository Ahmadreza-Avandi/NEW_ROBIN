#!/bin/bash

# ═══════════════════════════════════════════════════════════
# فیکس سریع Nginx برای CRM + School
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

print_header "🔧 فیکس Nginx"

# ۱. پیدا کردن پورت CRM
print_info "پیدا کردن پورت CRM Next.js..."
CRM_PORT=$(docker port nextjs 3000 2>/dev/null | cut -d: -f2 || echo "")

if [ -z "$CRM_PORT" ]; then
    print_warning "CRM container روی host port expose نشده"
    print_info "در حال expose کردن پورت 3000..."
    
    # چک کنیم docker-compose.yml کجاست
    if [ -f "docker-compose.yml" ]; then
        print_info "یافت شد: docker-compose.yml"
        CRM_PORT="3000"
    else
        print_error "نمی‌تونم پورت CRM رو پیدا کنم!"
        print_info "لطفاً دستی پورت CRM رو وارد کن (مثلاً 3000):"
        read CRM_PORT
    fi
else
    print_success "CRM روی پورت $CRM_PORT"
fi

# ۲. پاک کردن فایل‌های backup از sites-enabled
print_info "پاک‌سازی فایل‌های backup..."
rm -f /etc/nginx/sites-enabled/*.backup
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/school-proj

# ۳. ساخت کانفیگ جدید با localhost
print_info "ساخت کانفیگ جدید..."

cat > /etc/nginx/sites-available/combined-projects << EOF
# ═══════════════════════════════════════════════════════════
# کانفیگ Nginx برای CRM + School-Proj
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# CRM Project - crm.robintejarat.com
# ───────────────────────────────────────────────────────────

server {
    listen 80;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name crm.robintejarat.com www.crm.robintejarat.com;

    ssl_certificate /etc/letsencrypt/live/crm.robintejarat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.robintejarat.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    client_max_body_size 100M;

    # CRM Main App
    location / {
        proxy_pass http://localhost:$CRM_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # CRM phpMyAdmin
    location /secure-db-admin-panel-x7k9m2/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://localhost:$CRM_PORT;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}

# ───────────────────────────────────────────────────────────
# School Project - sch.ahmadreza-avandi.ir
# ───────────────────────────────────────────────────────────

server {
    listen 80;
    server_name sch.ahmadreza-avandi.ir;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name sch.ahmadreza-avandi.ir;

    ssl_certificate /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    client_max_body_size 100M;

    # School Nest.js API
    location /api/ {
        proxy_pass http://localhost:3002/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # School Python API
    location /python-api/ {
        proxy_pass http://localhost:5001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School phpMyAdmin
    location /phpmyadmin/ {
        proxy_pass http://localhost:8083/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School Redis Commander
    location /redis-commander/ {
        proxy_pass http://localhost:8084/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School Next.js Frontend
    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /_next/static {
        proxy_pass http://localhost:3003;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

print_success "کانفیگ جدید ساخته شد"

# ۴. فعال‌سازی کانفیگ
print_info "فعال‌سازی کانفیگ..."
ln -sf /etc/nginx/sites-available/combined-projects /etc/nginx/sites-enabled/combined-projects

# ۵. تست کانفیگ
print_info "تست کانفیگ..."
if nginx -t 2>&1; then
    print_success "کانفیگ معتبر است"
    
    # ۶. استارت/ریستارت Nginx
    print_info "استارت Nginx..."
    systemctl start nginx 2>/dev/null || systemctl restart nginx
    
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
        
    else
        print_error "Nginx استارت نشد!"
        systemctl status nginx
    fi
else
    print_error "کانفیگ خطا داره!"
    nginx -t
    exit 1
fi
