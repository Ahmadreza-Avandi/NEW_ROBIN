#!/bin/bash

# ═══════════════════════════════════════════════════════════
# اسکریپت دیپلوی کامل School-Proj با کانفیگ Nginx
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

DOMAIN="sch.ahmadreza-avandi.ir"
PROJECT_DIR="$(pwd)"

print_header "🚀 دیپلوی School-Proj"

# ۱. بررسی دسترسی root
if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با sudo اجرا شود"
    exit 1
fi

# ۲. بررسی Docker
print_header "۱. بررسی پیش‌نیازها"

if ! command -v docker &> /dev/null; then
    print_error "Docker نصب نیست!"
    exit 1
fi
print_success "Docker نصب شده است"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose نصب نیست!"
    exit 1
fi
print_success "Docker Compose نصب شده است"

# ۳. بررسی SSL
print_header "۲. بررسی SSL"

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    print_error "گواهی SSL برای $DOMAIN وجود ندارد!"
    print_info "لطفاً ابتدا SSL را دریافت کنید: bash setup-ssl.sh"
    exit 1
fi
print_success "گواهی SSL موجود است"

# ۴. توقف containers قبلی
print_header "۳. توقف containers قبلی"

if [ -f "docker-compose.yml" ]; then
    print_info "در حال توقف containers قبلی..."
    docker-compose down 2>/dev/null || true
    print_success "Containers قبلی متوقف شدند"
fi

# ۵. بیلد و اجرای containers
print_header "۴. بیلد و اجرای Containers"

print_info "در حال بیلد containers..."
docker-compose build --parallel || docker-compose build

print_success "بیلد با موفقیت انجام شد"

print_info "در حال اجرای containers..."
docker-compose up -d

print_success "Containers اجرا شدند"

# ۶. صبر برای آماده شدن سرویس‌ها
print_header "۵. صبر برای آماده شدن سرویس‌ها"

print_info "صبر کنید تا سرویس‌ها آماده شوند..."
sleep 10

# ۷. کانفیگ Nginx
print_header "۶. کانفیگ Nginx"

print_info "پیدا کردن IP های CRM containers..."

# پیدا کردن IP CRM containers
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

    # School Nest.js API
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

print_success "کانفیگ Nginx ساخته شد"

# ۸. اعمال کانفیگ Nginx
print_info "اعمال کانفیگ Nginx..."

# پاک کردن کانفیگ‌های قدیمی
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/*.backup
rm -f /etc/nginx/sites-enabled/school-proj

# فعال‌سازی کانفیگ جدید
ln -sf /etc/nginx/sites-available/combined-projects /etc/nginx/sites-enabled/combined-projects

# تست کانفیگ
print_info "تست کانفیگ Nginx..."
if nginx -t 2>&1; then
    print_success "کانفیگ Nginx معتبر است"
    
    # Reload nginx
    print_info "Reload Nginx..."
    systemctl reload nginx || systemctl restart nginx
    
    print_success "Nginx reload شد"
else
    print_error "کانفیگ Nginx خطا دارد!"
    nginx -t
    exit 1
fi

# ۹. بررسی سلامت سرویس‌ها
print_header "۷. بررسی سلامت سرویس‌ها"

sleep 5

check_service() {
    local name=$1
    local port=$2
    local max_attempts=15
    local attempt=1
    
    print_info "بررسی $name..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port > /dev/null 2>&1; then
            print_success "$name آماده است (پورت $port)"
            return 0
        fi
        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_warning "$name هنوز آماده نیست (پورت $port)"
    return 1
}

check_service "Next.js" 3003
check_service "Nest.js" 3002
check_service "Python API" 5001
check_service "phpMyAdmin" 8083

# ۱۰. نمایش اطلاعات نهایی
print_header "✅ دیپلوی با موفقیت انجام شد!"

echo ""
print_success "پروژه‌های شما آماده هستند:"
echo ""
echo "  🔹 CRM:    https://crm.robintejarat.com"
echo "  🔹 School: https://sch.ahmadreza-avandi.ir"
echo ""

print_info "School APIs:"
echo "  • Frontend:        https://sch.ahmadreza-avandi.ir"
echo "  • Nest.js API:     https://sch.ahmadreza-avandi.ir/api"
echo "  • Python API:      https://sch.ahmadreza-avandi.ir/python-api"
echo "  • phpMyAdmin:      https://sch.ahmadreza-avandi.ir/phpmyadmin"
echo "  • Redis Commander: https://sch.ahmadreza-avandi.ir/redis-commander"
echo ""

print_info "دستورات مفید:"
echo "  • مشاهده لاگ‌ها:       docker-compose logs -f"
echo "  • مشاهده لاگ سرویس:   docker-compose logs -f [service-name]"
echo "  • ری‌استارت:          docker-compose restart"
echo "  • توقف:               docker-compose down"
echo "  • وضعیت:              docker-compose ps"
echo ""

print_info "لاگ‌های Nginx:"
echo "  • tail -f /var/log/nginx/access.log"
echo "  • tail -f /var/log/nginx/error.log"
echo ""
