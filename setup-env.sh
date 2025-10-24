#!/bin/bash

# ===========================================
# 🔧 CRM Environment Setup Script
# ===========================================
# این اسکریپت فایل .env قدیمی رو حذف می‌کنه
# و یه .env کامل و درست می‌سازه
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 CRM Environment Configuration Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# تشخیص محیط
echo "🔍 تشخیص محیط اجرا..."
if [ -f "/etc/hostname" ] && grep -q "id-" /etc/hostname 2>/dev/null; then
    ENVIRONMENT="server"
    echo "✅ محیط: سرور (Production)"
else
    ENVIRONMENT="local"
    echo "✅ محیط: لوکال (Development)"
fi

# تنظیمات دیتابیس
DB_USER="crm_user"
DB_PASSWORD="1234"

echo "📝 Database User: $DB_USER"
echo "📝 Database Password: $DB_PASSWORD"

# حذف .env قدیمی و پشتیبان‌گیری
if [ -f ".env" ]; then
    BACKUP_FILE=".env.backup.$(date +%Y%m%d_%H%M%S)"
    echo ""
    echo "🗑️  حذف .env قدیمی..."
    echo "📦 پشتیبان‌گیری به: $BACKUP_FILE"
    mv .env "$BACKUP_FILE"
    echo "✅ .env قدیمی حذف شد"
fi

# حذف فایل‌های .env اضافی
echo ""
echo "🧹 پاکسازی فایل‌های .env اضافی..."
rm -f .env.local .env.production .env.development .env.test 2>/dev/null || true
echo "✅ پاکسازی انجام شد"

# تولید رمزهای امن برای JWT و NextAuth
echo ""
echo "🔐 تولید رمزهای امن..."
JWT_SECRET=$(openssl rand -base64 48 | tr -d "=+/" 2>/dev/null || echo "your_jwt_secret_key_here_change_in_production_$(date +%s)")
NEXTAUTH_SECRET=$(openssl rand -base64 48 | tr -d "=+/" 2>/dev/null || echo "your_nextauth_secret_here_change_in_production_$(date +%s)")

echo "✅ رمزهای امن تولید شدند"

# درخواست کلید API و مدل OpenRouter
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🤖 تنظیمات هوش مصنوعی (OpenRouter)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# درخواست کلید API
echo "🔑 لطفاً کلید API خود را از OpenRouter وارد کنید:"
echo "   (برای دریافت کلید به https://openrouter.ai مراجعه کنید)"
echo ""
read -p "OpenRouter API Key: " OPENROUTER_API_KEY

# بررسی خالی نبودن کلید
while [ -z "$OPENROUTER_API_KEY" ]; do
    echo "❌ کلید API نمی‌تواند خالی باشد!"
    read -p "OpenRouter API Key: " OPENROUTER_API_KEY
done

echo ""
echo "📋 مدل‌های پیشنهادی:"
echo "   1. google/gemini-2.0-flash-exp:free (سریع، رایگان، بدون تگ فکری)"
echo "   2. meta-llama/llama-3.2-3b-instruct:free (سریع و کوچک)"
echo "   3. anthropic/claude-3-haiku (پولی ولی عالی)"
echo "   4. z-ai/glm-4.5-air:free (پیش‌فرض)"
echo "   5. مدل دلخواه خود را وارد کنید"
echo ""
read -p "انتخاب کنید (1-5) یا نام مدل را وارد کنید: " MODEL_CHOICE

# تنظیم مدل بر اساس انتخاب
case $MODEL_CHOICE in
    1)
        OPENROUTER_MODEL="google/gemini-2.0-flash-exp:free"
        ;;
    2)
        OPENROUTER_MODEL="meta-llama/llama-3.2-3b-instruct:free"
        ;;
    3)
        OPENROUTER_MODEL="anthropic/claude-3-haiku"
        ;;
    4|"")
        OPENROUTER_MODEL="z-ai/glm-4.5-air:free"
        ;;
    5)
        echo ""
        read -p "نام مدل دلخواه خود را وارد کنید: " CUSTOM_MODEL
        while [ -z "$CUSTOM_MODEL" ]; do
            echo "❌ نام مدل نمی‌تواند خالی باشد!"
            read -p "نام مدل دلخواه خود را وارد کنید: " CUSTOM_MODEL
        done
        OPENROUTER_MODEL="$CUSTOM_MODEL"
        ;;
    *)
        # اگر مستقیماً نام مدل وارد شده
        OPENROUTER_MODEL="$MODEL_CHOICE"
        ;;
esac

echo ""
echo "✅ تنظیمات هوش مصنوعی:"
echo "   🔑 API Key: ${OPENROUTER_API_KEY:0:20}..."
echo "   🤖 Model: $OPENROUTER_MODEL"

# تنظیم متغیرهای بر اساس محیط
if [ "$ENVIRONMENT" = "server" ]; then
    NODE_ENV="production"
    DATABASE_HOST="mysql"
    NEXTAUTH_URL="http://crm.robintejarat.com"
    APP_URL="http://crm.robintejarat.com"
else
    NODE_ENV="development"
    DATABASE_HOST="mysql"  # برای Docker همیشه mysql
    NEXTAUTH_URL="http://localhost:3000"
    APP_URL="http://localhost:3000"
fi

# ایجاد فایل .env جدید (کامل و درست)
echo ""
echo "📝 ایجاد فایل .env جدید (کامل)..."

# حذف .env اگه هنوز وجود داره
rm -f .env

cat > .env << 'EOF'
# ===========================================
# 🔧 CRM Environment Configuration
# ===========================================
# این فایل توسط setup-env.sh ساخته شده
# تاریخ: __DATE__
# محیط: __ENVIRONMENT__
# ===========================================

# ===========================================
# 🌍 Application Configuration
# ===========================================
NODE_ENV=__NODE_ENV__
NEXT_PUBLIC_APP_URL=__APP_URL__

# ===========================================
# 🗄️ Database Configuration
# ===========================================
# Database Host: 
#   - Local Development: localhost (اگر MySQL محلی داری)
#   - Docker: mysql (service name) - پیشنهادی
DATABASE_HOST=__DATABASE_HOST__
DATABASE_USER=crm_user
DATABASE_PASSWORD=__DATABASE_PASSWORD__

# CRM System Database (دیتابیس اصلی CRM)
DATABASE_NAME=crm_system
DB_NAME=crm_system

# SaaS Master Database (دیتابیس مدیریت تنانت‌ها)
SAAS_DATABASE_NAME=saas_master

# Legacy support (برای سازگاری با کدهای قدیمی)
DB_HOST=__DATABASE_HOST__
DB_USER=crm_user
DB_PASSWORD=__DATABASE_PASSWORD__

# Database URL for Prisma/ORM (if needed)
DATABASE_URL=mysql://crm_user:__DATABASE_PASSWORD__@__DATABASE_HOST__:3306/crm_system

# ===========================================
# 🔐 Authentication & Security
# ===========================================
# JWT Secret for token signing
JWT_SECRET=__JWT_SECRET__

# NextAuth Configuration
NEXTAUTH_SECRET=__NEXTAUTH_SECRET__
NEXTAUTH_URL=__NEXTAUTH_URL__

# ===========================================
# 📧 Email Configuration
# ===========================================
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here

# Google OAuth 2.0 (Optional - for Gmail API)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# ===========================================
# 📁 File Upload Configuration
# ===========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ===========================================
# 🤖 AI Configuration (OpenRouter)
# ===========================================
OPENROUTER_API_KEY=__OPENROUTER_API_KEY__
OPENROUTER_MODEL=__OPENROUTER_MODEL__

# ===========================================
# 🎤 Rabin Voice Assistant Configuration
# ===========================================
RABIN_VOICE_OPENROUTER_API_KEY=__OPENROUTER_API_KEY__
RABIN_VOICE_OPENROUTER_MODEL=__OPENROUTER_MODEL__
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO

# ===========================================
# 🐳 Docker & Production Settings
# ===========================================
# Audio settings for VPS
AUDIO_ENABLED=false
VPS_MODE=true
FALLBACK_TO_MANUAL_INPUT=true

# Development bypass (only for development)
ALLOW_DEV_FALLBACK=0
EOF

# جایگزینی متغیرها در فایل .env
sed -i "s|__DATE__|$(date '+%Y-%m-%d %H:%M:%S')|g" .env
sed -i "s|__ENVIRONMENT__|$ENVIRONMENT|g" .env
sed -i "s|__NODE_ENV__|$NODE_ENV|g" .env
sed -i "s|__APP_URL__|$APP_URL|g" .env
sed -i "s|__DATABASE_HOST__|$DATABASE_HOST|g" .env
sed -i "s|__DATABASE_PASSWORD__|$DB_PASSWORD|g" .env
sed -i "s|__JWT_SECRET__|$JWT_SECRET|g" .env
sed -i "s|__NEXTAUTH_SECRET__|$NEXTAUTH_SECRET|g" .env
sed -i "s|__NEXTAUTH_URL__|$NEXTAUTH_URL|g" .env
sed -i "s|__OPENROUTER_API_KEY__|$OPENROUTER_API_KEY|g" .env
sed -i "s|__OPENROUTER_MODEL__|$OPENROUTER_MODEL|g" .env

echo "✅ فایل .env ایجاد شد"

# به‌روزرسانی فایل init.sql دیتابیس
echo ""
echo "🗄️ به‌روزرسانی فایل init.sql دیتابیس..."

if [ ! -d "database" ]; then
    mkdir -p database
fi

# بررسی و حفاظت از init.sql موجود
if [ ! -f "database/init.sql" ] || [ ! -s "database/init.sql" ]; then
    echo "📝 ایجاد فایل init.sql جدید..."
    cat > database/init.sql << EOF
-- ===========================================
-- Database Initialization Script
-- Generated automatically by setup-env.sh
-- Date: $(date '+%Y-%m-%d %H:%M:%S')
-- ===========================================

-- Create CRM System Database
CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SaaS Master Database
CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ===========================================
-- کاربر اصلی: crm_user (برای هر دو محیط)
-- ===========================================

-- Drop existing users
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- Create user with password
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- Grant privileges on crm_system
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`crm_system\`.* TO 'crm_user'@'172.%.%.%';

-- Grant privileges on saas_master
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'172.%.%.%';

-- Apply changes
FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';
EOF
else
    echo "✅ فایل init.sql موجود است - حفاظت شد"
fi

echo "✅ فایل init.sql به‌روزرسانی شد"

# تست و بررسی فایل .env
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 بررسی و تست فایل .env"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# بررسی وجود متغیرهای ضروری
REQUIRED_VARS=(
    "NODE_ENV"
    "DATABASE_HOST"
    "DATABASE_USER"
    "DATABASE_PASSWORD"
    "DATABASE_NAME"
    "JWT_SECRET"
    "NEXTAUTH_SECRET"
    "NEXTAUTH_URL"
    "OPENROUTER_API_KEY"
    "OPENROUTER_MODEL"
)

MISSING_VARS=0
VALID_VARS=0

for var in "${REQUIRED_VARS[@]}"; do
    if grep -q "^${var}=" .env && ! grep -q "^${var}=$" .env && ! grep -q "^${var}=your_" .env; then
        echo "✅ $var - تنظیم شده"
        VALID_VARS=$((VALID_VARS + 1))
    else
        echo "❌ $var - تنظیم نشده یا مقدار پیش‌فرض دارد"
        MISSING_VARS=$((MISSING_VARS + 1))
    fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# نمایش اطلاعات مهم
echo ""
echo "📋 اطلاعات مهم:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌍 محیط: $ENVIRONMENT"
echo "🗄️ Database Host: $DATABASE_HOST"
echo "👤 Database User: $DB_USER"
echo "🔑 Database Password: $DB_PASSWORD"
echo "🌐 App URL: $APP_URL"
echo "🤖 AI Model: $OPENROUTER_MODEL"
echo "🔑 AI API Key: ${OPENROUTER_API_KEY:0:20}..."
echo ""

# نتیجه نهایی
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $MISSING_VARS -eq 0 ]; then
    echo "✅ فایل .env با موفقیت ایجاد و تست شد!"
    echo "✅ همه متغیرهای ضروری تنظیم شده‌اند"
    echo ""
    echo "⚠️  توجه: متغیرهای زیر را باید دستی تنظیم کنید:"
    echo "   - SMTP_USER و SMTP_PASS (برای ارسال ایمیل)"
    echo "   - GOOGLE_CLIENT_ID و GOOGLE_CLIENT_SECRET (اختیاری)"
    echo ""
    echo "📝 برای ویرایش: nano .env"
    EXIT_CODE=0
else
    echo "⚠️  فایل .env ایجاد شد اما $MISSING_VARS متغیر نیاز به تنظیم دارد"
    echo ""
    echo "📝 لطفاً فایل .env را ویرایش کنید: nano .env"
    EXIT_CODE=1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $EXIT_CODE
