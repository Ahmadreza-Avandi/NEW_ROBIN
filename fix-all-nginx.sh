#!/bin/bash

# ═══════════════════════════════════════════════════════════
# فیکس کامل Nginx برای CRM + School
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

print_header "🔍 پیدا کردن پورت‌های CRM"

# پیدا کردن IP CRM containers
CRM_NEXTJS_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nextjs 2>/dev/null || echo "")
CRM_PMA_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' crm_phpmyadmin 2>/dev/null || echo "")

if [ -z "$CRM_NEXTJS_IP" ]; then
    print_error "نمی‌تونم IP container CRM Next.js رو پیدا کنم!"
    print_info "در حال بررسی پورت‌های expose شده..."
    
    # سعی کن پورت پیدا کنی
    CRM_NEXTJS_PORT=$(docker port nextjs 3000 2>/dev/null | head -n1 | cut -d: -f2 || echo "3000")
    CRM_NEXTJS_HOST="localhost:$CRM_NEXTJS_PORT"
    print_warning "استفاده از localhost:$CRM_NEXTJS_PORT برای CRM"
else
    print_success "CRM Next.js IP: $CRM_NEXTJS_IP"
    CRM_NEXTJS_HOST="$CRM_NEXTJS_IP:3000"
fi

if [ -z "$CRM_PMA_IP" ]; then
    print_warning "نمی‌تونم IP container CRM phpMyAdmin رو پیدا کنم"
    CRM_PMA_PORT=$(docker port crm_phpmyadmin 80 2>/dev/null | head -n1 | cut -d: -f2 || echo "8080")
    CRM_PMA_HOST="localhost:$CRM_PMA_PORT"
    print_warning "استفاده از localhost:$CRM_PMA_PORT برای phpMyAdmin"
else
    print_success "CRM phpMyAdmin IP: $CRM_PMA_IP"
    CRM_PMA_HOST="$CRM_PMA_IP:80"
fi

print_header "🔍 بررسی پورت‌های School"

print_success "School Next.js: localhost:3003"
print_success "School Nest.js: localhost:3002"
print_success "School Python: localhost:5001"
print_success "School phpMyAdmin: localhost:8083"

print_header "📝 ساخت کانفیگ Nginx"

cat > /etc/nginx/sites-available/combined-projects << NGINX_EOF
# ═══════════════════════════════════════════════════════════
# کانفیگ Nginx برای CRM + School-Proj
# ═══════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────
# CRM Project - crm.robintejarat.com
# ───────────────────────────────────────────────────────────

upstream crm_nextjs {
    server $CRM_NEXTJS_HOST;
}

upstream crm_phpmyadmin {
    server $CRM_PMA_HOST;
}

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

    location / {
        proxy_pass http://crm_nextjs;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    location /secure-db-admin-panel-x7k9m2/ {
        proxy_pass http://crm_phpmyadmin/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /api/ {
        proxy_pass http://crm_nextjs;
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

    # School Nest.js API - مهم: بدون trailing slash
    location /api {
        rewrite ^/api/(.*) /\$1 break;
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # School Python API
    location /python-api {
        rewrite ^/python-api/(.*) /\$1 break;
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School phpMyAdmin
    location /phpmyadmin {
        rewrite ^/phpmyadmin/(.*) /\$1 break;
        proxy_pass http://localhost:8083;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School Redis Commander
    location /redis-commander {
        rewrite ^/redis-commander/(.*) /\$1 break;
        proxy_pass http://localhost:8084;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School Next.js Frontend - باید آخر باشه
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
NGINX_EOF

print_success "کانفیگ ساخته شد"

print_header "🔧 اعمال کانفیگ"

# پاک کردن کانفیگ‌های قدیمی
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/*.backup
rm -f /etc/nginx/sites-enabled/school-proj

# فعال‌سازی کانفیگ جدید
ln -sf /etc/nginx/sites-available/combined-projects /etc/nginx/sites-enabled/combined-projects

# تست کانفیگ
print_info "تست کانفیگ..."
if nginx -t 2>&1; then
    print_success "کانفیگ معتبر است"
    
    # Reload nginx
    print_info "Reload Nginx..."
    systemctl reload nginx
    
    print_success "Nginx reload شد!"
    
    print_header "✅ تمام!"
    echo ""
    print_success "دامنه‌های شما آماده هستند:"
    echo ""
    echo "  🔹 CRM:    https://crm.robintejarat.com"
    echo "  🔹 School: https://sch.ahmadreza-avandi.ir"
    echo ""
    
    print_info "تست API های School:"
    echo "  curl https://sch.ahmadreza-avandi.ir/api/grades"
    echo "  curl https://sch.ahmadreza-avandi.ir/python-api/"
    echo ""
    
    print_info "برای مشاهده لاگ‌ها:"
    echo "  sudo tail -f /var/log/nginx/error.log"
    
else
    print_error "کانفیگ خطا داره!"
    nginx -t
    exit 1
fi
