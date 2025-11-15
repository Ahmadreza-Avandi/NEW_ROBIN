#!/bin/bash

# 🚀 دیپلوی سریع School-Proj
# این اسکریپت فقط build و deploy می‌کنه

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

print_header "🚀 دیپلوی سریع School-Proj"

# بررسی .env
if [ ! -f ".env" ]; then
    print_error "فایل .env یافت نشد!"
    print_info "در حال ایجاد..."
    bash setup-env.sh
fi

# توقف containers قبلی
print_info "توقف containers قبلی..."
docker-compose down 2>/dev/null || true

# Build
print_header "Build Containers"
print_info "در حال build (ممکن است 5-10 دقیقه طول بکشد)..."

# Build هر سرویس جداگانه برای دیباگ بهتر
print_info "Build MySQL..."
docker-compose build mysql

print_info "Build Redis..."
docker-compose build redis

print_info "Build Next.js..."
docker-compose build nextjs || {
    print_error "خطا در build Next.js"
    print_info "در حال تلاش مجدد..."
    docker-compose build --no-cache nextjs
}

print_info "Build Python..."
docker-compose build pythonserver

print_success "Build کامل شد"

# اجرا
print_header "اجرای Containers"
docker-compose up -d

print_success "Containers اجرا شدند"

# انتظار
print_info "انتظار برای آماده شدن (20 ثانیه)..."
sleep 20

# وضعیت
print_header "وضعیت"
docker-compose ps

print_success "دیپلوی کامل شد!"
echo ""
echo "🌐 https://sch.ahmadreza-avandi.ir"
echo ""
print_info "برای مشاهده لاگ‌ها: docker-compose logs -f"
