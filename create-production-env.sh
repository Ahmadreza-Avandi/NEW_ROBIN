#!/bin/bash

# ==========================================
# 🚀 ساخت سریع فایل .env برای Production
# ==========================================
# این اسکریپت یک فایل .env آماده برای سرور می‌سازد
# با تنظیمات پیش‌فرض امن
# ==========================================

set -e

echo "🚀 ساخت فایل .env برای Production..."

# تولید JWT Secret تصادفی
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "$(date +%s | sha256sum | base64 | head -c 32)")

# دریافت دامنه از آرگومان یا استفاده از پیش‌فرض
DOMAIN="${1:-crm.robintejarat.com}"

cat > .env << EOF
# ==========================================
# 🚀 Production Environment Configuration
# ==========================================
# Generated: $(date)
# Domain: ${DOMAIN}
# ==========================================
# ⚠️  IMPORTANT: این فایل حاوی اطلاعات حساس است
# ⚠️  هرگز این فایل را commit نکنید
# ==========================================

# ==========================================
# 🌐 Application Configuration
# ==========================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://${DOMAIN}
NEXTAUTH_URL=https://${DOMAIN}

# ==========================================
# 🗄️ Database Configuration
# ==========================================
# برای Docker: mysql
# برای لوکال: localhost
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=1234

# CRM System Database (دیتابیس اصلی CRM)
DATABASE_NAME=crm_system
DB_NAME=crm_system

# SaaS Master Database (دیتابیس مدیریت تنانت‌ها)
SAAS_DATABASE_NAME=saas_master

# Legacy support (برای سازگاری با کدهای قدیمی)
DB_HOST=mysql
DB_USER=crm_user
DB_PASSWORD=1234

# ==========================================
# 🔐 JWT & Security Configuration
# ==========================================
JWT_SECRET=${JWT_SECRET}

# ==========================================
# 📧 Email Configuration (Optional)
# ==========================================
# Google OAuth 2.0 Configuration
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# SMTP Configuration
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
# EMAIL_USER=your_email@gmail.com
# EMAIL_PASS=your_app_password

# ==========================================
# 📁 File Upload Configuration
# ==========================================
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# ==========================================
# 🎤 Rabin Voice Configuration (Optional)
# ==========================================
# RABIN_VOICE_OPENROUTER_API_KEY=your_api_key_here
# RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
# RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
# RABIN_VOICE_LOG_LEVEL=INFO
EOF

echo "✅ فایل .env ساخته شد!"
echo ""
echo "📋 تنظیمات:"
echo "  🌐 Domain: ${DOMAIN}"
echo "  🗄️  Database: mysql (Docker service)"
echo "  👤 User: crm_user"
echo "  🔐 JWT Secret: ***"
echo ""
echo "⚠️  نکات مهم:"
echo "  1. رمز دیتابیس را تغییر دهید (DATABASE_PASSWORD)"
echo "  2. تنظیمات ایمیل را فعال کنید (اختیاری)"
echo "  3. API Key های Rabin Voice را تنظیم کنید (اختیاری)"
echo ""
echo "🚀 برای deployment:"
echo "  docker-compose up -d"
echo ""
