#!/bin/bash

# ==========================================
# 🚀 اسکریپت ساخت فایل .env برای سرور
# ==========================================
# این اسکریپت یک فایل .env کامل برای deployment روی سرور می‌سازد
# ==========================================

set -e

echo "🔧 ساخت فایل .env برای سرور..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# رنگ‌ها
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# تابع برای دریافت ورودی با مقدار پیش‌فرض
get_input() {
    local prompt="$1"
    local default="$2"
    local value
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " value
        echo "${value:-$default}"
    else
        read -p "$prompt: " value
        echo "$value"
    fi
}

# تابع برای دریافت رمز عبور
get_password() {
    local prompt="$1"
    local default="$2"
    local value
    
    if [ -n "$default" ]; then
        read -sp "$prompt [$default]: " value
        echo ""
        echo "${value:-$default}"
    else
        read -sp "$prompt: " value
        echo ""
        echo "$value"
    fi
}

echo -e "${BLUE}📋 لطفاً اطلاعات زیر را وارد کنید:${NC}"
echo ""

# ==========================================
# 🌐 تنظیمات عمومی
# ==========================================
echo -e "${GREEN}🌐 تنظیمات عمومی:${NC}"
NODE_ENV=$(get_input "محیط اجرا (production/development)" "production")
DOMAIN=$(get_input "دامنه سرور" "crm.robintejarat.com")
NEXT_PUBLIC_APP_URL="https://${DOMAIN}"

echo ""

# ==========================================
# 🗄️ تنظیمات دیتابیس
# ==========================================
echo -e "${GREEN}🗄️ تنظیمات دیتابیس:${NC}"
echo -e "${YELLOW}نکته: در Docker، DATABASE_HOST باید 'mysql' باشد${NC}"

DATABASE_HOST=$(get_input "Database Host (برای Docker: mysql)" "mysql")
DATABASE_USER=$(get_input "Database User" "crm_user")
DATABASE_PASSWORD=$(get_password "Database Password" "1234")
DATABASE_NAME=$(get_input "CRM Database Name" "crm_system")
SAAS_DATABASE_NAME=$(get_input "SaaS Database Name" "saas_master")

echo ""

# ==========================================
# 🔐 تنظیمات امنیتی
# ==========================================
echo -e "${GREEN}🔐 تنظیمات امنیتی:${NC}"
JWT_SECRET=$(get_input "JWT Secret (رشته تصادفی امن)" "$(openssl rand -base64 32 2>/dev/null || echo 'change_this_secret_key_in_production')")

echo ""

# ==========================================
# 📧 تنظیمات ایمیل
# ==========================================
echo -e "${GREEN}📧 تنظیمات ایمیل (اختیاری - Enter برای رد کردن):${NC}"
GOOGLE_CLIENT_ID=$(get_input "Google Client ID" "")
GOOGLE_CLIENT_SECRET=$(get_input "Google Client Secret" "")
GOOGLE_REFRESH_TOKEN=$(get_input "Google Refresh Token" "")
EMAIL_USER=$(get_input "Email User" "")
EMAIL_PASS=$(get_password "Email Password/App Password" "")

echo ""

# ==========================================
# 🎤 تنظیمات Rabin Voice
# ==========================================
echo -e "${GREEN}🎤 تنظیمات Rabin Voice (اختیاری):${NC}"
RABIN_VOICE_OPENROUTER_API_KEY=$(get_input "OpenRouter API Key" "")
RABIN_VOICE_OPENROUTER_MODEL=$(get_input "OpenRouter Model" "anthropic/claude-3-haiku")
RABIN_VOICE_TTS_API_URL=$(get_input "TTS API URL" "https://api.ahmadreza-avandi.ir/text-to-speech")
RABIN_VOICE_LOG_LEVEL=$(get_input "Log Level" "INFO")

echo ""
echo -e "${BLUE}📝 در حال ساخت فایل .env.server...${NC}"

# ==========================================
# ساخت فایل .env.server
# ==========================================
cat > .env.server << EOF
# ==========================================
# 🚀 Environment Variables for Server Deployment
# ==========================================
# Generated: $(date)
# Domain: ${DOMAIN}
# ==========================================

# ==========================================
# 🌐 Application Configuration
# ==========================================
NODE_ENV=${NODE_ENV}
NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
NEXTAUTH_URL=${NEXT_PUBLIC_APP_URL}

# ==========================================
# 🗄️ Database Configuration
# ==========================================
# برای Docker: DATABASE_HOST=mysql
# برای لوکال: DATABASE_HOST=localhost
DATABASE_HOST=${DATABASE_HOST}
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}

# CRM System Database (دیتابیس اصلی CRM)
DATABASE_NAME=${DATABASE_NAME}
DB_NAME=${DATABASE_NAME}

# SaaS Master Database (دیتابیس مدیریت تنانت‌ها)
SAAS_DATABASE_NAME=${SAAS_DATABASE_NAME}

# Legacy support (برای سازگاری با کدهای قدیمی)
DB_HOST=${DATABASE_HOST}
DB_USER=${DATABASE_USER}
DB_PASSWORD=${DATABASE_PASSWORD}

# ==========================================
# 🔐 JWT & Security Configuration
# ==========================================
JWT_SECRET=${JWT_SECRET}

# ==========================================
# 📧 Email Configuration
# ==========================================
EOF

# اضافه کردن تنظیمات ایمیل اگر وارد شده باشند
if [ -n "$GOOGLE_CLIENT_ID" ]; then
cat >> .env.server << EOF
# Google OAuth 2.0 Configuration
GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
GOOGLE_REFRESH_TOKEN=${GOOGLE_REFRESH_TOKEN}

EOF
fi

if [ -n "$EMAIL_USER" ]; then
cat >> .env.server << EOF
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=${EMAIL_USER}
SMTP_PASS=${EMAIL_PASS}
EMAIL_USER=${EMAIL_USER}
EMAIL_PASS=${EMAIL_PASS}

EOF
fi

# ادامه فایل
cat >> .env.server << EOF
# ==========================================
# 📁 File Upload Configuration
# ==========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ==========================================
# 🎤 Rabin Voice Configuration
# ==========================================
EOF

if [ -n "$RABIN_VOICE_OPENROUTER_API_KEY" ]; then
cat >> .env.server << EOF
RABIN_VOICE_OPENROUTER_API_KEY=${RABIN_VOICE_OPENROUTER_API_KEY}
RABIN_VOICE_OPENROUTER_MODEL=${RABIN_VOICE_OPENROUTER_MODEL}
RABIN_VOICE_TTS_API_URL=${RABIN_VOICE_TTS_API_URL}
RABIN_VOICE_LOG_LEVEL=${RABIN_VOICE_LOG_LEVEL}
EOF
else
cat >> .env.server << EOF
# RABIN_VOICE_OPENROUTER_API_KEY=your_api_key_here
# RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
# RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
# RABIN_VOICE_LOG_LEVEL=INFO
EOF
fi

echo ""
echo -e "${GREEN}✅ فایل .env.server با موفقیت ساخته شد!${NC}"
echo ""
echo -e "${BLUE}📋 خلاصه تنظیمات:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  🌐 Domain: ${YELLOW}${DOMAIN}${NC}"
echo -e "  🗄️  Database Host: ${YELLOW}${DATABASE_HOST}${NC}"
echo -e "  👤 Database User: ${YELLOW}${DATABASE_USER}${NC}"
echo -e "  📊 CRM Database: ${YELLOW}${DATABASE_NAME}${NC}"
echo -e "  🏢 SaaS Database: ${YELLOW}${SAAS_DATABASE_NAME}${NC}"
echo -e "  🔐 JWT Secret: ${YELLOW}***${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${YELLOW}📝 مراحل بعدی:${NC}"
echo "  1. فایل .env.server را بررسی کنید"
echo "  2. برای استفاده در سرور: cp .env.server .env"
echo "  3. برای deployment: ./deploy-server.sh"
echo ""
echo -e "${YELLOW}⚠️  نکات امنیتی:${NC}"
echo "  - فایل .env.server را commit نکنید"
echo "  - رمزهای قوی استفاده کنید"
echo "  - JWT_SECRET را تغییر دهید"
echo "  - دسترسی‌های دیتابیس را محدود کنید"
echo ""
