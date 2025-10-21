#!/bin/bash

# اسکریپت نصب و راه‌اندازی دیتابیس‌های پروژه CRM
# این اسکریپت دو دیتابیس crm_system و saas_master را ایجاد و import می‌کند

set -e  # خروج در صورت خطا

# رنگ‌ها برای خروجی
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}🚀 راه‌اندازی دیتابیس‌های پروژه CRM${NC}"
echo -e "${CYAN}========================================${NC}"

# بارگذاری متغیرهای محیطی
if [ -f .env ]; then
    echo -e "${GREEN}✅ فایل .env یافت شد${NC}"
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ فایل .env یافت نشد!${NC}"
    echo -e "${YELLOW}لطفاً ابتدا فایل .env را از .env.example کپی کنید${NC}"
    exit 1
fi

# دریافت اطلاعات دیتابیس از .env
DB_HOST=${DATABASE_HOST:-localhost}
DB_USER=${DATABASE_USER:-crm_app_user}
DB_PASS=${DATABASE_PASSWORD:-Ahmad.1386}
CRM_DB=${DATABASE_NAME:-crm_system}
SAAS_DB=${SAAS_DATABASE_NAME:-saas_master}

echo -e "\n${BLUE}📋 تنظیمات:${NC}"
echo -e "  Host: ${DB_HOST}"
echo -e "  User: ${DB_USER}"
echo -e "  CRM Database: ${CRM_DB}"
echo -e "  SaaS Database: ${SAAS_DB}"

# درخواست رمز عبور root
echo -e "\n${YELLOW}🔐 لطفاً رمز عبور root MySQL را وارد کنید:${NC}"
read -s MYSQL_ROOT_PASS

# تست اتصال
echo -e "\n${CYAN}🔌 تست اتصال به MySQL...${NC}"
if ! mysql -u root -p"${MYSQL_ROOT_PASS}" -e "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${RED}❌ خطا: نمی‌توان به MySQL متصل شد${NC}"
    exit 1
fi
echo -e "${GREEN}✅ اتصال موفقیت‌آمیز${NC}"

# ایجاد دیتابیس‌ها
echo -e "\n${CYAN}📊 ایجاد دیتابیس‌ها...${NC}"

mysql -u root -p"${MYSQL_ROOT_PASS}" <<EOF
-- ایجاد دیتابیس CRM
CREATE DATABASE IF NOT EXISTS ${CRM_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد دیتابیس SaaS
CREATE DATABASE IF NOT EXISTS ${SAAS_DB} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر (اگر وجود نداشته باشد)
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';

-- دادن دسترسی‌ها
GRANT ALL PRIVILEGES ON ${CRM_DB}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${SAAS_DB}.* TO '${DB_USER}'@'localhost';
GRANT ALL PRIVILEGES ON ${CRM_DB}.* TO '${DB_USER}'@'%';
GRANT ALL PRIVILEGES ON ${SAAS_DB}.* TO '${DB_USER}'@'%';

FLUSH PRIVILEGES;
EOF

echo -e "${GREEN}✅ دیتابیس‌ها ایجاد شدند${NC}"

# Import دیتابیس CRM
if [ -f "database/crm_system.sql" ]; then
    echo -e "\n${CYAN}📥 Import دیتابیس CRM...${NC}"
    mysql -u "${DB_USER}" -p"${DB_PASS}" "${CRM_DB}" < database/crm_system.sql
    echo -e "${GREEN}✅ دیتابیس CRM import شد${NC}"
else
    echo -e "${YELLOW}⚠️  فایل database/crm_system.sql یافت نشد${NC}"
fi

# Import دیتابیس SaaS
if [ -f "database/saas_master.sql" ]; then
    echo -e "\n${CYAN}📥 Import دیتابیس SaaS...${NC}"
    mysql -u "${DB_USER}" -p"${DB_PASS}" "${SAAS_DB}" < database/saas_master.sql
    echo -e "${GREEN}✅ دیتابیس SaaS import شد${NC}"
else
    echo -e "${YELLOW}⚠️  فایل database/saas_master.sql یافت نشد${NC}"
fi

# بررسی نهایی
echo -e "\n${CYAN}🔍 بررسی نهایی...${NC}"

CRM_TABLES=$(mysql -u "${DB_USER}" -p"${DB_PASS}" -D "${CRM_DB}" -e "SHOW TABLES;" | wc -l)
SAAS_TABLES=$(mysql -u "${DB_USER}" -p"${DB_PASS}" -D "${SAAS_DB}" -e "SHOW TABLES;" | wc -l)

echo -e "${GREEN}✅ دیتابیس CRM: $((CRM_TABLES - 1)) جدول${NC}"
echo -e "${GREEN}✅ دیتابیس SaaS: $((SAAS_TABLES - 1)) جدول${NC}"

echo -e "\n${CYAN}========================================${NC}"
echo -e "${GREEN}✅ نصب با موفقیت انجام شد!${NC}"
echo -e "${CYAN}========================================${NC}"

echo -e "\n${BLUE}📝 مراحل بعدی:${NC}"
echo -e "  1. نصب dependencies: ${CYAN}npm install${NC}"
echo -e "  2. تست تنظیمات: ${CYAN}node test-env.js${NC}"
echo -e "  3. اجرای پروژه: ${CYAN}npm run dev${NC}"
echo -e ""
