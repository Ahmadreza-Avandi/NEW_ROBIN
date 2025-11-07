#!/bin/bash

# ═══════════════════════════════════════════════════════════
# آپدیت فقط Nginx (بدون restart containers)
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

print_header "🔧 آپدیت کانفیگ Nginx"

# پیدا کردن IP های CRM
print_info "پیدا کردن IP های CRM containers..."

CRM_NEXTJS_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' nextjs 2>/dev/null || echo "")
CRM_PMA_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' crm_phpmyadmin 2>/dev/null || echo "")

if [ -z "$CRM_NEXTJS_IP" ]; then
    print_warning "نمی‌تونم IP container CRM Next.js رو پیدا کنم - استفاده از localhost:3000"
    CRM_NEXTJS_HOST="localhost:3000"
else
    print_success "CRM Next.js IP: $CRM_NEXTJS_IP"
    CRM_NEXTJS_HOST="$CRM_NEXTJS_IP:3000"
fi

if [ -z "$CRM_PMA_IP" ]; then
    print_warning "نمی‌تونم IP container CRM phpMyAdmin رو پیدا کنم - استفاده از localhost:8080"
    CRM_PMA_HOST="localhost:8080"
else
    print_success "CRM phpMyAdmin IP: $CRM_PMA_IP"
    CRM_PMA_HOST="$CRM_PMA_IP:80"
fi

print_info "ساخت کانفیگ Nginx..."

cat > /etc/nginx/sites-available/combined-projects << NGINX_EOF
# ═══════════════════════════════════════════════════════════
# کانفیگ Nginx برای CRM + School-Proj
# ═══════════════════════════════════════════════════════════

upstream crm_nextjs {
    server $CRM_NEXTJS_HOST;
}

upstream crm_phpmyadmin {
    server $CRM_PMA_HOST;
}

# ───────────────────────────────────────────────────────────
# CRM Project
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
# School Project
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

    # School API - Next.js handles these (not Nest.js!)
    location /api/ {
        proxy_pass http://localhost:3003/api/;
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
    location /python-api/ {
        proxy_pass http://localhost:5001/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # School phpMyAdmin - با trailing slash
    location /phpmyadmin/ {
        proxy_pass http://localhost:8083/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Prefix /phpmyadmin;
    }

    # School Redis Commander
    location /redis-commander/ {
        proxy_pass http://localhost:8084/redis-commander/;
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
NGINX_EOF

print_success "کانفیگ ساخته شد"

# اعمال کانفیگ
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/*.backup
rm -f /etc/nginx/sites-enabled/school-proj

ln -sf /etc/nginx/sites-available/combined-projects /etc/nginx/sites-enabled/combined-projects

# تست
print_info "تست کانفیگ..."
if nginx -t 2>&1; then
    print_success "کانفیگ معتبر است"
    
    print_info "Reload Nginx..."
    systemctl reload nginx
    
    print_success "Nginx reload شد!"
    
    print_header "✅ تمام!"
    echo ""
    echo "تست کن:"
    echo "  curl -I https://sch.ahmadreza-avandi.ir/phpmyadmin/"
    echo "  curl https://sch.ahmadreza-avandi.ir/api/grades"
    echo ""
else
    print_error "کانفیگ خطا داره!"
    nginx -t
    exit 1
fi
