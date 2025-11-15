#!/bin/bash

# 🗄️ اسکریپت اجرای مهاجرت‌های دیتابیس
# استفاده: bash run-migrations.sh [username] [password] [database]

# رنگ‌ها
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# پارامترها
DB_USER=${1:-crm_user}
DB_PASS=${2:-1234}
DB_NAME=${3:-school}
DB_HOST=${4:-localhost}

print_header "🗄️ اجرای مهاجرت‌های دیتابیس"

print_info "تنظیمات:"
echo "  کاربر: $DB_USER"
echo "  دیتابیس: $DB_NAME"
echo "  هاست: $DB_HOST"
echo ""

# بررسی اتصال به MySQL
print_info "بررسی اتصال به MySQL..."
if ! mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" -e "SELECT 1" &> /dev/null; then
    print_error "اتصال به MySQL ناموفق بود!"
    print_info "لطفاً اطلاعات اتصال را بررسی کنید"
    exit 1
fi
print_success "اتصال به MySQL برقرار شد"

# دریافت لیست فایل‌های migration
MIGRATION_DIR="$(dirname "$0")"
MIGRATIONS=(
    "001_initial_setup.sql"
    "002_create_tables.sql"
    "003_insert_initial_data.sql"
    "004_create_views_procedures.sql"
    "005_optimization_indexes.sql"
)

# اجرای هر migration
for migration in "${MIGRATIONS[@]}"; do
    migration_file="$MIGRATION_DIR/$migration"
    
    if [ ! -f "$migration_file" ]; then
        print_warning "فایل $migration یافت نشد، رد شد"
        continue
    fi
    
    print_info "در حال اجرای: $migration"
    
    if mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" < "$migration_file" 2>&1 | tee /tmp/migration_output.log; then
        print_success "$migration با موفقیت اجرا شد"
    else
        print_error "خطا در اجرای $migration"
        cat /tmp/migration_output.log
        print_warning "آیا می‌خواهید ادامه دهید؟ (y/n)"
        read -r response
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            print_error "مهاجرت متوقف شد"
            exit 1
        fi
    fi
    
    echo ""
done

print_header "✅ مهاجرت‌ها با موفقیت اجرا شدند"

# نمایش اطلاعات مهم
print_info "اطلاعات ورود پیش‌فرض:"
echo ""
echo "  🔐 کاربر مدیر:"
echo "     کد ملی: 0000000000"
echo "     رمز عبور: admin123"
echo ""
print_warning "لطفاً بعد از ورود، رمز عبور را تغییر دهید!"
echo ""

# نمایش آمار
print_info "آمار دیتابیس:"
mysql -u"$DB_USER" -p"$DB_PASS" -h"$DB_HOST" "$DB_NAME" -e "
SELECT 
    'نقش‌ها' AS 'جدول',
    COUNT(*) AS 'تعداد'
FROM role
UNION ALL
SELECT 'پایه‌ها', COUNT(*) FROM grade
UNION ALL
SELECT 'رشته‌ها', COUNT(*) FROM major
UNION ALL
SELECT 'کلاس‌ها', COUNT(*) FROM class
UNION ALL
SELECT 'کاربران', COUNT(*) FROM user;
"

print_success "دیتابیس آماده استفاده است! 🚀"
