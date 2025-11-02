#!/bin/bash

# 🔧 اضافه کردن School-Proj به nginx container CRM

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

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_header "🔧 اضافه کردن School-Proj به Nginx CRM"

# پیدا کردن nginx container
NGINX_CONTAINER=$(docker ps --filter "ancestor=nginx:alpine" --format "{{.Names}}" | head -n1)

if [ -z "$NGINX_CONTAINER" ]; then
    print_error "nginx container یافت نشد!"
    exit 1
fi

print_success "nginx container یافت شد: $NGINX_CONTAINER"

# بررسی کانفیگ فعلی
print_info "بررسی کانفیگ فعلی nginx..."
docker exec $NGINX_CONTAINER ls -la /etc/nginx/conf.d/

# ایجاد کانفیگ School-Proj
print_info "ایجاد کانفیگ School-Proj..."

cat > /tmp/school-proj.conf << 'EOF'
# School-Proj Configuration
# دامنه: sch.ahmadreza-avandi.ir

# Upstream برای Next.js
upstream school_nextjs_backend {
    server host.docker.internal:3003;
}

# Upstream برای Nest.js API
upstream school_nestjs_backend {
    server host.docker.internal:3002;
}

# Upstream برای Python API
upstream school_python_backend {
    server host.docker.internal:5001;
}

# Upstream برای phpMyAdmin
upstream school_phpmyadmin_backend {
    server host.docker.internal:8083;
}

# Upstream برای Redis Commander
upstream school_redis_commander_backend {
    server host.docker.internal:8084;
}

# ریدایرکت HTTP به HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name sch.ahmadreza-avandi.ir;
    
    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# سرور اصلی HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name sch.ahmadreza-avandi.ir;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=63072000" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    
    # تنظیمات عمومی
    client_max_body_size 50M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 75s;

    # API Nest.js
    location /api/ {
        proxy_pass http://school_nestjs_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Python
    location /python-api/ {
        proxy_pass http://school_python_backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # phpMyAdmin
    location /phpmyadmin/ {
        proxy_pass http://school_phpmyadmin_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Redis Commander
    location /redis-commander/ {
        proxy_pass http://school_redis_commander_backend/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Next.js (باید آخرین باشه)
    location / {
        proxy_pass http://school_nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Static files برای Next.js
    location /_next/static {
        proxy_pass http://school_nextjs_backend;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, immutable";
    }
}
EOF

print_success "کانفیگ ایجاد شد"

# کپی کانفیگ به container
print_info "کپی کانفیگ به nginx container..."
docker cp /tmp/school-proj.conf $NGINX_CONTAINER:/etc/nginx/conf.d/school-proj.conf

# تست کانفیگ
print_info "تست کانفیگ nginx..."
if docker exec $NGINX_CONTAINER nginx -t 2>&1 | grep -q "successful"; then
    print_success "کانفیگ nginx صحیح است"
    
    # Reload nginx
    print_info "Reload nginx..."
    docker exec $NGINX_CONTAINER nginx -s reload
    print_success "nginx reload شد"
else
    print_error "خطا در کانفیگ nginx"
    docker exec $NGINX_CONTAINER nginx -t
    
    # حذف کانفیگ خطا
    docker exec $NGINX_CONTAINER rm /etc/nginx/conf.d/school-proj.conf
    exit 1
fi

# پاک‌سازی
rm /tmp/school-proj.conf

print_header "✅ School-Proj به nginx اضافه شد"

echo ""
print_success "دامنه School-Proj آماده است!"
echo ""
echo "🌐 https://sch.ahmadreza-avandi.ir"
echo ""
print_info "نکته: اگر SSL error می‌دهد، باید گواهی SSL را دریافت کنید:"
echo "  sudo bash get-ssl-manual.sh"
echo ""
