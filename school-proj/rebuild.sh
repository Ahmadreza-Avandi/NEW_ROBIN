#!/bin/bash

# 🔄 اسکریپت Rebuild کامل School-Proj
# این اسکریپت همه چیز رو از نو می‌سازه

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_header "🔄 Rebuild کامل School-Proj"

# 1. ایجاد .env ها
print_header "1️⃣ ایجاد فایل‌های .env"
bash setup-env.sh 1

# 2. توقف containers
print_header "2️⃣ توقف و حذف containers قبلی"
print_info "در حال توقف containers..."
docker-compose down --remove-orphans 2>/dev/null || true
print_success "Containers متوقف شدند"

# 3. حذف images قدیمی (اختیاری)
read -p "آیا می‌خواهید images قدیمی را هم حذف کنید؟ (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "حذف images قدیمی..."
    docker-compose down --rmi local 2>/dev/null || true
fi

# 4. Build از نو
print_header "3️⃣ Build از نو"
print_info "در حال build containers (ممکن است 5-10 دقیقه طول بکشد)..."
docker-compose build --no-cache --parallel

print_success "Build کامل شد"

# 5. اجرا
print_header "4️⃣ اجرای Containers"
docker-compose up -d

print_success "Containers اجرا شدند"

# 6. انتظار
print_info "انتظار برای آماده شدن (20 ثانیه)..."
sleep 20

# 7. وضعیت
print_header "5️⃣ وضعیت نهایی"
docker-compose ps

print_header "✅ Rebuild کامل شد!"
echo ""
print_success "پروژه School-Proj با موفقیت rebuild شد!"
echo ""
echo "🌐 https://sch.ahmadreza-avandi.ir"
echo ""
print_info "برای مشاهده لاگ‌ها: docker-compose logs -f"
print_info "برای بررسی وضعیت: bash status.sh"
