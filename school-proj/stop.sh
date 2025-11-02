#!/bin/bash

# 🛑 اسکریپت توقف پروژه School-Proj
# این اسکریپت تمام سرویس‌های پروژه را متوقف می‌کند

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

print_header "🛑 توقف پروژه School-Proj"

# بررسی وجود docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    print_error "فایل docker-compose.yml یافت نشد!"
    exit 1
fi

# نمایش وضعیت فعلی
print_info "وضعیت فعلی containers:"
docker-compose ps

echo ""
read -p "آیا مطمئن هستید که می‌خواهید تمام سرویس‌ها را متوقف کنید؟ (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "عملیات لغو شد"
    exit 0
fi

# توقف containers
print_info "در حال توقف containers..."
docker-compose down

print_success "تمام سرویس‌ها متوقف شدند"

# پیشنهاد پاک‌سازی
echo ""
read -p "آیا می‌خواهید volumes و images را هم پاک کنید؟ (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "در حال پاک‌سازی volumes و images..."
    docker-compose down -v --rmi all
    print_success "پاک‌سازی کامل انجام شد"
fi

print_success "عملیات با موفقیت انجام شد"
