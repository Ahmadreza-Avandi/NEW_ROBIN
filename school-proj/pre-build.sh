#!/bin/bash

# اسکریپت pre-build برای آماده‌سازی سریع

set -e

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

echo -e "${BLUE}🔨 Pre-build پروژه...${NC}"

# Build Nest.js
if [ -d "nest" ]; then
    print_info "Build Nest.js..."
    cd nest
    
    if [ ! -d "node_modules" ]; then
        print_warning "نصب dependencies..."
        npm install --silent --no-audit --no-fund
    fi
    
    if [ ! -d "dist" ]; then
        print_info "Build کردن..."
        npm run build
    fi
    
    cd ..
    print_success "Nest.js آماده"
fi

# Build Next.js (اختیاری)
if [ -d "next" ]; then
    print_info "آماده‌سازی Next.js..."
    cd next
    
    if [ ! -d "node_modules" ]; then
        print_warning "نصب dependencies..."
        npm install --silent --no-audit --no-fund
    fi
    
    cd ..
    print_success "Next.js آماده"
fi

# بررسی فایل‌های ضروری
print_info "بررسی فایل‌های ضروری..."

required_files=(
    "docker-compose.yml"
    "nest/dist/main.js"
    "next/package.json"
    "faceDetectionWithCamera/requirements.txt"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file ✓"
    else
        print_warning "$file موجود نیست"
    fi
done

print_success "🎉 Pre-build تکمیل شد!"
echo ""
echo "حالا می‌تونی اجرا کنی:"
echo "  ./fast-deploy.sh"