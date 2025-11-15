#!/bin/bash

# 🔧 اسکریپت ایجاد فایل‌های .env برای School-Proj
# این اسکریپت تمام env های لازم رو می‌سازه
# استفاده: bash setup-env.sh [0|1]
#   0 = لوکال (پیش‌فرض)
#   1 = سرور

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

# دریافت حالت از آرگومان (0=لوکال، 1=سرور)
MODE=${1:-0}

# تنظیمات بر اساس حالت
if [ "$MODE" = "0" ]; then
    print_header "🏠 حالت لوکال"
    
    # تنظیمات لوکال
    DOMAIN="localhost"
    MYSQL_HOST="localhost"
    MYSQL_PORT="3306"
    MYSQL_ROOT_PASSWORD="1234"
    MYSQL_DATABASE="school"
    MYSQL_USER="crm_user"
    MYSQL_PASSWORD="1234"
    JWT_SECRET="school_proj_jwt_secret_local_dev"
    
    # آدرس‌های لوکال
    NEXT_PUBLIC_PYTHON_API_URL="http://localhost:5000"
    PYTHON_API_URL="http://localhost:5000"
    REDIS_HOST="localhost"
    
    NODE_ENV="development"
    
else
    print_header "🌐 حالت سرور"
    
    # تنظیمات سرور
    DOMAIN="sch.ahmadreza-avandi.ir"
    MYSQL_HOST="mysql"
    MYSQL_PORT="3306"
    MYSQL_ROOT_PASSWORD="rootpassword"
    MYSQL_DATABASE="mydatabase"
    MYSQL_USER="user"
    MYSQL_PASSWORD="userpassword"
    JWT_SECRET="school_proj_jwt_secret_$(date +%s)_$(openssl rand -hex 16)"
    
    # آدرس‌های سرور (Docker)
    NEXT_PUBLIC_PYTHON_API_URL="https://${DOMAIN}/python-api"
    PYTHON_API_URL="http://pythonserver:5000"
    REDIS_HOST="redis"
    
    NODE_ENV="production"
fi

print_header "🔧 ایجاد فایل‌های .env برای School-Proj"

# 1. فایل .env اصلی پروژه
print_info "ایجاد .env اصلی پروژه..."

cat > .env << EOF
# School-Proj Environment Variables
# حالت: $([ "$MODE" = "0" ] && echo "لوکال" || echo "سرور")
# تاریخ ایجاد: $(date)

# MySQL Configuration
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
MYSQL_DATABASE=${MYSQL_DATABASE}
MYSQL_USER=${MYSQL_USER}
MYSQL_PASSWORD=${MYSQL_PASSWORD}

# Redis Configuration
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379

# Database URL
DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?connect_timeout=30

# API URLs for Next.js (Client-side)
NEXT_PUBLIC_PYTHON_API_URL=${NEXT_PUBLIC_PYTHON_API_URL}

# API URLs for Server-side
PYTHON_API_URL=${PYTHON_API_URL}

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Domain
DOMAIN=${DOMAIN}

# Node Environment
NODE_ENV=${NODE_ENV}
EOF

print_success "فایل .env اصلی ایجاد شد"

# 2. فایل .env.local برای Next.js
print_info "ایجاد next/.env.local..."

cat > next/.env.local << EOF
# Next.js Environment Variables
# School-Proj Frontend
# حالت: $([ "$MODE" = "0" ] && echo "لوکال" || echo "سرور")

# API URLs for Client-side (Browser)
NEXT_PUBLIC_PYTHON_API_URL=${NEXT_PUBLIC_PYTHON_API_URL}

# API URLs for Server-side
PYTHON_API_URL=${PYTHON_API_URL}

# Redis
REDIS_HOST=${REDIS_HOST}
REDIS_PORT=6379

# Database
DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${MYSQL_DATABASE}?connect_timeout=30

# JWT Secret
JWT_SECRET=${JWT_SECRET}

# Environment
NODE_ENV=${NODE_ENV}
EOF

print_success "فایل next/.env.local ایجاد شد"

# 3. فایل .env برای Next.js (production)
if [ "$MODE" = "1" ]; then
    print_info "ایجاد next/.env.production..."
    
    cat > next/.env.production << EOF
# Next.js Production Environment
# School-Proj

NEXT_PUBLIC_PYTHON_API_URL=/python-api
NODE_ENV=production
EOF
    
    print_success "فایل next/.env.production ایجاد شد"
fi

# 5. بررسی و نمایش خلاصه
print_header "📋 خلاصه فایل‌های ایجاد شده"

echo "✅ .env (اصلی پروژه)"
echo "✅ nest/.env (Backend)"
echo "✅ next/.env.local (Frontend)"
if [ "$MODE" = "1" ]; then
    echo "✅ next/.env.production (Frontend - Production)"
fi
echo ""

print_header "🔐 اطلاعات مهم"

echo "🏷️  حالت: $([ "$MODE" = "0" ] && echo "لوکال 🏠" || echo "سرور 🌐")"
echo "� دامنه: Q${DOMAIN}"
echo "�️  دیتاcبیس: ${MYSQL_DATABASE}"
echo "🖥️  هاست MySQL: ${MYSQL_HOST}:${MYSQL_PORT}"
echo "👤 کاربر MySQL: ${MYSQL_USER}"
echo "🔑 رمز MySQL: ${MYSQL_PASSWORD}"
echo "🔐 JWT Secret: ${JWT_SECRET:0:30}..."
echo "🌍 محیط: ${NODE_ENV}"
echo ""

print_header "⚠️  نکات امنیتی"

echo "1. این فایل‌ها حاوی اطلاعات حساس هستند"
echo "2. هرگز آنها را commit نکنید"
echo "3. در .gitignore اضافه شده‌اند"
if [ "$MODE" = "1" ]; then
    echo "4. برای production، رمزهای قوی‌تر استفاده کنید"
fi
echo ""

# 6. ایجاد .gitignore اگر وجود نداشته باشد
if [ ! -f ".gitignore" ]; then
    print_info "ایجاد .gitignore..."
    cat > .gitignore << EOF
# Environment files
.env
.env.local
.env.production
.env.development
nest/.env
next/.env
next/.env.local
next/.env.production

# Dependencies
node_modules/
*/node_modules/

# Build outputs
dist/
build/
.next/
*/dist/
*/build/
*/.next/

# Logs
*.log
logs/
*/logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Docker
*.pid
EOF
    print_success "فایل .gitignore ایجاد شد"
fi

print_header "✅ تمام فایل‌های .env آماده است!"

echo ""
if [ "$MODE" = "0" ]; then
    print_success "حالا می‌توانید پروژه را به صورت لوکال اجرا کنید"
    echo "  - Next.js: cd next && npm run dev"
    echo "  - Nest.js: cd nest && npm run start:dev"
    echo "  - Python: cd trainer && python app.py"
else
    print_success "حالا می‌توانید دیپلوی را انجام دهید:"
    echo "  bash deploy-auto.sh"
fi
echo ""

# 7. تست وجود فایل‌ها
print_info "بررسی نهایی..."

FILES_OK=true

if [ ! -f ".env" ]; then
    print_error ".env یافت نشد"
    FILES_OK=false
fi

if [ ! -f "nest/.env" ]; then
    print_error "nest/.env یافت نشد"
    FILES_OK=false
fi

if [ ! -f "next/.env.local" ]; then
    print_error "next/.env.local یافت نشد"
    FILES_OK=false
fi

if [ "$FILES_OK" = true ]; then
    print_success "تمام فایل‌ها با موفقیت ایجاد شدند"
else
    print_error "برخی فایل‌ها ایجاد نشدند"
    exit 1
fi

print_success "آماده برای دیپلوی! 🚀"
