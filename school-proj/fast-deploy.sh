#!/bin/bash

# 🚀 اسکریپت دیپلوی سریع و بهینه

set -e

# رنگ‌ها
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

print_header "🚀 دیپلوی سریع و بهینه"

# توقف containers قبلی
print_info "توقف containers قبلی..."
docker-compose down 2>/dev/null || true

# پاک‌سازی سریع
read -p "پاک‌سازی images قدیمی؟ (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "پاک‌سازی..."
    docker system prune -f
fi

# Pre-build Nest.js (چون نیاز به build داره)
print_header "۱. Build Nest.js"
print_info "Build کردن Nest.js..."
cd nest
npm run build 2>/dev/null || {
    print_warning "Build نشد، نصب dependencies..."
    npm install --silent
    npm run build
}
cd ..
print_success "Nest.js آماده شد"

# Build به ترتیب اولویت (سریع‌ترین اول)
print_header "۲. Build Containers"

print_info "Build Python (سریع‌ترین)..."
docker-compose build pythonserver

print_info "Build Next.js..."
docker-compose build nextjs

print_info "Build Nest.js..."
docker-compose build nestjs

print_success "همه containers build شدند"

# اجرای سرویس‌ها
print_header "۳. اجرای سرویس‌ها"

print_info "شروع دیتابیس و Redis..."
docker-compose up -d mysql redis

print_info "صبر برای آماده شدن MySQL..."
sleep 15

print_info "شروع سرویس‌های اصلی..."
docker-compose up -d

print_success "همه سرویس‌ها اجرا شدند"

# بررسی سریع
print_header "۴. بررسی سریع"
sleep 10

docker-compose ps

print_success "🎉 دیپلوی سریع تکمیل شد!"
echo ""
echo "🌐 دسترسی:"
echo "  ��� محلی: http://localhost:3000"
echo "  • عمومی: https://sch.ahmadreza-avandi.ir"
echo ""
echo "📝 لاگ‌ها: docker-compose logs -f"