#!/bin/bash

# 🛠️ اسکریپت آماده‌سازی سرور برای School-Proj
# این اسکریپت تمام پیش‌نیازها را نصب و تنظیم می‌کند

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

print_header "🛠️ آماده‌سازی سرور برای School-Proj"

# بررسی دسترسی root
if [ "$EUID" -ne 0 ]; then 
    print_error "این اسکریپت باید با دسترسی root اجرا شود"
    print_info "لطفاً با sudo اجرا کنید: sudo bash setup-server.sh"
    exit 1
fi

# آپدیت سیستم
print_header "1️⃣ آپدیت سیستم"
print_info "در حال آپدیت لیست پکیج‌ها..."
apt-get update -qq
print_success "لیست پکیج‌ها آپدیت شد"

# نصب ابزارهای پایه
print_header "2️⃣ نصب ابزارهای پایه"
print_info "در حال نصب curl, wget, git, net-tools..."
apt-get install -y curl wget git net-tools software-properties-common apt-transport-https ca-certificates gnupg lsb-release > /dev/null 2>&1
print_success "ابزارهای پایه نصب شدند"

# نصب Docker
print_header "3️⃣ نصب Docker"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)
    print_success "Docker نصب شده است (نسخه $DOCKER_VERSION)"
else
    print_info "در حال نصب Docker..."
    
    # حذف نسخه‌های قدیمی
    apt-get remove -y docker docker-engine docker.io containerd runc > /dev/null 2>&1
    
    # اضافه کردن repository Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # نصب Docker
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io > /dev/null 2>&1
    
    # راه‌اندازی Docker
    systemctl start docker
    systemctl enable docker
    
    print_success "Docker نصب و راه‌اندازی شد"
fi

# نصب Docker Compose
print_header "4️⃣ نصب Docker Compose"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version | cut -d ' ' -f3 | cut -d ',' -f1)
    print_success "Docker Compose نصب شده است (نسخه $COMPOSE_VERSION)"
else
    print_info "در حال نصب Docker Compose..."
    
    # دریافت آخرین نسخه
    COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d '"' -f 4)
    curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose نصب شد (نسخه $COMPOSE_VERSION)"
fi

# نصب Nginx
print_header "5️⃣ نصب Nginx"
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d '/' -f2)
    print_success "Nginx نصب شده است (نسخه $NGINX_VERSION)"
else
    print_info "در حال نصب Nginx..."
    apt-get install -y nginx > /dev/null 2>&1
    systemctl start nginx
    systemctl enable nginx
    print_success "Nginx نصب و راه‌اندازی شد"
fi

# نصب Certbot
print_header "6️⃣ نصب Certbot"
if command -v certbot &> /dev/null; then
    CERTBOT_VERSION=$(certbot --version 2>&1 | cut -d ' ' -f2)
    print_success "Certbot نصب شده است (نسخه $CERTBOT_VERSION)"
else
    print_info "در حال نصب Certbot..."
    apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    print_success "Certbot نصب شد"
fi

# بررسی پورت‌ها
print_header "7️⃣ بررسی پورت‌های مورد نیاز"

check_port() {
    local port=$1
    local service=$2
    
    if netstat -tuln | grep -q ":$port "; then
        print_warning "پورت $port در حال استفاده است ($service)"
        print_info "سرویس در حال استفاده: $(netstat -tulpn | grep ":$port " | awk '{print $7}')"
        return 1
    else
        print_success "پورت $port آزاد است ($service)"
        return 0
    fi
}

print_info "بررسی پورت‌های School-Proj..."
check_port 3003 "Next.js"
check_port 3002 "Nest.js"
check_port 5001 "Python"
check_port 3307 "MySQL"
check_port 6380 "Redis"
check_port 8083 "phpMyAdmin"
check_port 8084 "Redis Commander"

# بررسی فایروال
print_header "8️⃣ بررسی فایروال"
if command -v ufw &> /dev/null; then
    print_info "بررسی تنظیمات UFW..."
    
    if ufw status | grep -q "Status: active"; then
        print_info "UFW فعال است. بررسی پورت‌ها..."
        
        # بررسی پورت‌های HTTP و HTTPS
        if ! ufw status | grep -q "80/tcp"; then
            print_warning "پورت 80 باز نیست"
            read -p "آیا می‌خواهید پورت 80 را باز کنید؟ (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ufw allow 80/tcp
                print_success "پورت 80 باز شد"
            fi
        else
            print_success "پورت 80 باز است"
        fi
        
        if ! ufw status | grep -q "443/tcp"; then
            print_warning "پورت 443 باز نیست"
            read -p "آیا می‌خواهید پورت 443 را باز کنید؟ (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ufw allow 443/tcp
                print_success "پورت 443 باز شد"
            fi
        else
            print_success "پورت 443 باز است"
        fi
    else
        print_info "UFW غیرفعال است"
    fi
else
    print_info "UFW نصب نیست"
fi

# ایجاد دایرکتوری‌های مورد نیاز
print_header "9️⃣ ایجاد دایرکتوری‌های مورد نیاز"
print_info "ایجاد دایرکتوری‌ها..."

mkdir -p /var/www/certbot
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

print_success "دایرکتوری‌ها ایجاد شدند"

# تنظیم دسترسی‌ها
print_header "🔐 تنظیم دسترسی‌ها"
print_info "تنظیم دسترسی‌های Docker..."

# اضافه کردن کاربر فعلی به گروه docker
if [ ! -z "$SUDO_USER" ]; then
    usermod -aG docker $SUDO_USER
    print_success "کاربر $SUDO_USER به گروه docker اضافه شد"
    print_warning "برای اعمال تغییرات، لطفاً logout و login کنید"
fi

# نمایش اطلاعات سیستم
print_header "📊 اطلاعات سیستم"

echo "  🖥️  سیستم عامل: $(lsb_release -d | cut -f2)"
echo "  🐳 Docker: $(docker --version | cut -d ' ' -f3 | cut -d ',' -f1)"
echo "  📦 Docker Compose: $(docker-compose --version | cut -d ' ' -f3 | cut -d ',' -f1)"
echo "  🌐 Nginx: $(nginx -v 2>&1 | cut -d '/' -f2)"
echo "  🔐 Certbot: $(certbot --version 2>&1 | cut -d ' ' -f2)"
echo "  💾 فضای دیسک: $(df -h / | awk 'NR==2 {print $4}') آزاد"
echo "  🧠 رم: $(free -h | awk 'NR==2 {print $7}') آزاد"
echo "  🔢 CPU: $(nproc) هسته"
echo ""

# خلاصه
print_header "✅ آماده‌سازی سرور کامل شد!"

echo ""
print_success "سرور آماده دیپلوی است!"
echo ""
print_info "مراحل بعدی:"
echo "  1️⃣  دریافت گواهی SSL: sudo bash setup-ssl.sh"
echo "  2️⃣  دیپلوی پروژه: bash deploy.sh"
echo ""
print_info "دستورات مفید:"
echo "  • بررسی وضعیت Docker: docker ps"
echo "  • بررسی وضعیت Nginx: sudo systemctl status nginx"
echo "  • مشاهده لاگ‌های Nginx: sudo tail -f /var/log/nginx/error.log"
echo ""

# تست Docker
print_info "تست Docker..."
if docker run --rm hello-world > /dev/null 2>&1; then
    print_success "Docker به درستی کار می‌کند"
else
    print_warning "Docker ممکن است نیاز به راه‌اندازی مجدد داشته باشد"
fi

print_success "همه چیز آماده است! 🎉"
