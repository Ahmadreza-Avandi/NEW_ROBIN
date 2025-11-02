#!/bin/bash

# 📊 اسکریپت بررسی وضعیت پروژه School-Proj
# این اسکریپت وضعیت تمام سرویس‌ها را نمایش می‌دهد

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
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
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${CYAN}  $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_header "📊 وضعیت پروژه School-Proj"

# بررسی وجود docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    print_error "فایل docker-compose.yml یافت نشد!"
    exit 1
fi

# نمایش وضعیت containers
print_info "وضعیت Containers:"
echo ""
docker-compose ps
echo ""

# بررسی سلامت سرویس‌ها
print_header "🔍 بررسی سلامت سرویس‌ها"

check_service() {
    local service_name=$1
    local port=$2
    local url=$3
    
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port$url" | grep -q "200\|301\|302"; then
        print_success "$service_name در حال اجراست (پورت $port)"
        return 0
    else
        print_error "$service_name در دسترس نیست (پورت $port)"
        return 1
    fi
}

check_service "Next.js Frontend" 3003 "/"
check_service "Nest.js Backend" 3002 "/"
check_service "Python API" 5001 "/"
check_service "phpMyAdmin" 8083 "/"

# نمایش استفاده از منابع
print_header "💻 استفاده از منابع"
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" $(docker-compose ps -q)

# نمایش لاگ‌های اخیر
print_header "📝 لاگ‌های اخیر (10 خط آخر)"
docker-compose logs --tail=10

# اطلاعات دسترسی
print_header "🌐 لینک‌های دسترسی"
echo ""
echo "  🌐 وب‌سایت اصلی:      https://sch.ahmadreza-avandi.ir"
echo "  🔧 API Nest.js:        https://sch.ahmadreza-avandi.ir/api"
echo "  🐍 API Python:         https://sch.ahmadreza-avandi.ir/python-api"
echo "  💾 phpMyAdmin:         https://sch.ahmadreza-avandi.ir/phpmyadmin"
echo "  📊 Redis Commander:    https://sch.ahmadreza-avandi.ir/redis-commander"
echo ""
echo "  📍 پورت‌های محلی:"
echo "     Next.js:    localhost:3003"
echo "     Nest.js:    localhost:3002"
echo "     Python:     localhost:5001"
echo "     MySQL:      localhost:3307"
echo "     Redis:      localhost:6380"
echo "     phpMyAdmin: localhost:8083"
echo ""

# دستورات مفید
print_header "🛠️  دستورات مفید"
echo ""
echo "  • مشاهده لاگ‌های زنده:     ./status.sh logs"
echo "  • ری‌استارت پروژه:         docker-compose restart"
echo "  • ری‌استارت یک سرویس:      docker-compose restart [service-name]"
echo "  • توقف پروژه:              ./stop.sh"
echo "  • دیپلوی مجدد:             ./deploy.sh"
echo ""

# اگر آرگومان logs داده شده باشد، لاگ‌های زنده را نمایش بده
if [ "$1" == "logs" ]; then
    print_header "📝 لاگ‌های زنده"
    docker-compose logs -f
fi
