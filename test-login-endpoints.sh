#!/bin/bash

# ===========================================
# 🔐 تست endpoint های لاگین CRM
# ===========================================
# این اسکریپت endpoint های لاگین رو با اطلاعات واقعی تست می‌کنه
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 تست endpoint های لاگین CRM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# تشخیص docker-compose file
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

# تشخیص دامنه
if [ -f ".env" ]; then
    DOMAIN=$(grep "NEXTAUTH_URL" .env | cut -d'=' -f2 | sed 's|http://||' | sed 's|https://||' || echo "localhost")
    if [ -z "$DOMAIN" ] || [ "$DOMAIN" = "localhost:3000" ]; then
        DOMAIN="localhost"
    fi
else
    DOMAIN="localhost"
fi

BASE_URL="http://$DOMAIN"
echo "🌐 تست بر روی: $BASE_URL"

# مرحله 1: دریافت اطلاعات کاربران از دیتابیس
echo ""
echo "🔍 مرحله 1: دریافت اطلاعات کاربران از دیتابیس..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# دریافت اطلاعات super admin از saas_master
echo "👑 دریافت اطلاعات Super Admin..."
SUPER_ADMIN_INFO=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D saas_master -e "SELECT username, email FROM super_admins WHERE is_active = 1 LIMIT 1;" 2>/dev/null | tail -n +2 | head -1)

if [ -n "$SUPER_ADMIN_INFO" ]; then
    ADMIN_USERNAME=$(echo "$SUPER_ADMIN_INFO" | awk '{print $1}')
    ADMIN_EMAIL=$(echo "$SUPER_ADMIN_INFO" | awk '{print $2}')
    echo "✅ Super Admin یافت شد:"
    echo "   نام کاربری: $ADMIN_USERNAME"
    echo "   ایمیل: $ADMIN_EMAIL"
else
    echo "❌ Super Admin یافت نشد!"
    ADMIN_USERNAME="admin"
    ADMIN_EMAIL="admin@example.com"
fi

# دریافت اطلاعات کاربر عادی از crm_system
echo ""
echo "👤 دریافت اطلاعات کاربر عادی..."
USER_INFO=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D crm_system -e "SELECT email, name FROM users WHERE status = 'active' LIMIT 1;" 2>/dev/null | tail -n +2 | head -1)

if [ -n "$USER_INFO" ]; then
    USER_EMAIL=$(echo "$USER_INFO" | awk '{print $1}')
    USER_NAME=$(echo "$USER_INFO" | awk '{print $2}')
    echo "✅ کاربر عادی یافت شد:"
    echo "   ایمیل: $USER_EMAIL"
    echo "   نام: $USER_NAME"
else
    echo "❌ کاربر عادی یافت نشد!"
    USER_EMAIL="user@example.com"
    USER_NAME="Test User"
fi

# مرحله 2: تست صفحات لاگین
echo ""
echo "🌐 مرحله 2: تست صفحات لاگین..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست صفحه لاگین CRM
echo "🔐 تست صفحه لاگین CRM..."
LOGIN_PAGE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/login" --connect-timeout 10)
echo "   صفحه لاگین CRM: HTTP $LOGIN_PAGE_STATUS"

# تست صفحه لاگین پنل ادمین
echo "🔧 تست صفحه لاگین پنل ادمین..."
ADMIN_LOGIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/secret-zone-789/login" --connect-timeout 10)
echo "   صفحه لاگین ادمین: HTTP $ADMIN_LOGIN_STATUS"

# مرحله 3: تست API های احراز هویت
echo ""
echo "🧪 مرحله 3: تست API های احراز هویت..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست API لاگین Super Admin
echo "👑 تست API لاگین Super Admin..."
echo "   درخواست با نام کاربری: $ADMIN_USERNAME"

ADMIN_LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"$ADMIN_USERNAME\",\"password\":\"123456\"}" \
  "$BASE_URL/api/admin/auth/login" \
  --connect-timeout 10)

ADMIN_LOGIN_HTTP_STATUS=$(echo "$ADMIN_LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
ADMIN_LOGIN_BODY=$(echo "$ADMIN_LOGIN_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   وضعیت: HTTP $ADMIN_LOGIN_HTTP_STATUS"
if [ "$ADMIN_LOGIN_HTTP_STATUS" = "200" ]; then
    echo "   ✅ لاگین Super Admin موفقیت‌آمیز"
    echo "   پاسخ: $ADMIN_LOGIN_BODY"
elif [ "$ADMIN_LOGIN_HTTP_STATUS" = "401" ]; then
    echo "   ⚠️  رمز عبور اشتباه (انتظار می‌رفت)"
    echo "   پاسخ: $ADMIN_LOGIN_BODY"
else
    echo "   ❌ خطای غیرمنتظره"
    echo "   پاسخ: $ADMIN_LOGIN_BODY"
fi

# تست با ایمیل
echo ""
echo "   درخواست با ایمیل: $ADMIN_EMAIL"
ADMIN_EMAIL_LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"123456\"}" \
  "$BASE_URL/api/admin/auth/login" \
  --connect-timeout 10)

ADMIN_EMAIL_LOGIN_HTTP_STATUS=$(echo "$ADMIN_EMAIL_LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "   وضعیت: HTTP $ADMIN_EMAIL_LOGIN_HTTP_STATUS"

# تست API لاگین کاربر عادی
echo ""
echo "👤 تست API لاگین کاربر عادی..."
echo "   درخواست با ایمیل: $USER_EMAIL"

USER_LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"123456\"}" \
  "$BASE_URL/api/auth/login" \
  --connect-timeout 10)

USER_LOGIN_HTTP_STATUS=$(echo "$USER_LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
USER_LOGIN_BODY=$(echo "$USER_LOGIN_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "   وضعیت: HTTP $USER_LOGIN_HTTP_STATUS"
if [ "$USER_LOGIN_HTTP_STATUS" = "200" ]; then
    echo "   ✅ لاگین کاربر عادی موفقیت‌آمیز"
    echo "   پاسخ: $USER_LOGIN_BODY"
elif [ "$USER_LOGIN_HTTP_STATUS" = "401" ]; then
    echo "   ⚠️  رمز عبور اشتباه (انتظار می‌رفت)"
    echo "   پاسخ: $USER_LOGIN_BODY"
else
    echo "   ❌ خطای غیرمنتظره"
    echo "   پاسخ: $USER_LOGIN_BODY"
fi

# مرحله 4: تست API های محافظت شده
echo ""
echo "🛡️ مرحله 4: تست API های محافظت شده..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست API users بدون token
echo "👥 تست API users (بدون احراز هویت)..."
USERS_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/users" --connect-timeout 10)
echo "   وضعیت: HTTP $USERS_API_STATUS"
if [ "$USERS_API_STATUS" = "401" ]; then
    echo "   ✅ API محافظت شده درست کار می‌کند"
else
    echo "   ⚠️  API محافظت نشده یا مشکل دارد"
fi

# تست API customers بدون token
echo "🏢 تست API customers (بدون احراز هویت)..."
CUSTOMERS_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/customers" --connect-timeout 10)
echo "   وضعیت: HTTP $CUSTOMERS_API_STATUS"
if [ "$CUSTOMERS_API_STATUS" = "401" ]; then
    echo "   ✅ API محافظت شده درست کار می‌کند"
else
    echo "   ⚠️  API محافظت نشده یا مشکل دارد"
fi

# تست API admin tenants بدون token
echo "🏗️ تست API admin tenants (بدون احراز هویت)..."
TENANTS_API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/admin/tenants" --connect-timeout 10)
echo "   وضعیت: HTTP $TENANTS_API_STATUS"
if [ "$TENANTS_API_STATUS" = "401" ]; then
    echo "   ✅ API ادمین محافظت شده درست کار می‌کند"
else
    echo "   ⚠️  API ادمین محافظت نشده یا مشکل دارد"
fi

# مرحله 5: تست دسترسی به داشبوردها
echo ""
echo "📊 مرحله 5: تست دسترسی به داشبوردها..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تست داشبورد CRM
echo "📈 تست داشبورد CRM..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/dashboard" --connect-timeout 10)
echo "   وضعیت: HTTP $DASHBOARD_STATUS"
if [ "$DASHBOARD_STATUS" = "302" ] || [ "$DASHBOARD_STATUS" = "401" ]; then
    echo "   ✅ داشبورد محافظت شده (redirect به لاگین)"
elif [ "$DASHBOARD_STATUS" = "200" ]; then
    echo "   ⚠️  داشبورد بدون احراز هویت قابل دسترس است"
else
    echo "   ❌ داشبورد مشکل دارد"
fi

# تست پنل ادمین
echo "🔧 تست پنل ادمین..."
ADMIN_PANEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/secret-zone-789/admin-panel" --connect-timeout 10)
echo "   وضعیت: HTTP $ADMIN_PANEL_STATUS"
if [ "$ADMIN_PANEL_STATUS" = "302" ] || [ "$ADMIN_PANEL_STATUS" = "401" ]; then
    echo "   ✅ پنل ادمین محافظت شده (redirect به لاگین)"
elif [ "$ADMIN_PANEL_STATUS" = "200" ]; then
    echo "   ⚠️  پنل ادمین بدون احراز هویت قابل دسترس است"
else
    echo "   ❌ پنل ادمین مشکل دارد"
fi

# خلاصه نهایی
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه نهایی تست لاگین:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# خلاصه وضعیت
TOTAL_TESTS=8
PASSED_TESTS=0

# بررسی نتایج
if [ "$LOGIN_PAGE_STATUS" = "200" ]; then
    echo "✅ صفحه لاگین CRM"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ صفحه لاگین CRM"
fi

if [ "$ADMIN_LOGIN_STATUS" = "200" ]; then
    echo "✅ صفحه لاگین ادمین"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ صفحه لاگین ادمین"
fi

if [ "$ADMIN_LOGIN_HTTP_STATUS" = "401" ] || [ "$ADMIN_LOGIN_HTTP_STATUS" = "200" ]; then
    echo "✅ API لاگین ادمین"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ API لاگین ادمین"
fi

if [ "$USER_LOGIN_HTTP_STATUS" = "401" ] || [ "$USER_LOGIN_HTTP_STATUS" = "200" ]; then
    echo "✅ API لاگین کاربر"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ API لاگین کاربر"
fi

if [ "$USERS_API_STATUS" = "401" ]; then
    echo "✅ محافظت API Users"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ محافظت API Users"
fi

if [ "$CUSTOMERS_API_STATUS" = "401" ]; then
    echo "✅ محافظت API Customers"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ محافظت API Customers"
fi

if [ "$DASHBOARD_STATUS" = "302" ] || [ "$DASHBOARD_STATUS" = "401" ]; then
    echo "✅ محافظت داشبورد"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ محافظت داشبورد"
fi

if [ "$ADMIN_PANEL_STATUS" = "302" ] || [ "$ADMIN_PANEL_STATUS" = "401" ]; then
    echo "✅ محافظت پنل ادمین"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo "❌ محافظت پنل ادمین"
fi

echo ""
echo "📊 نتیجه: $PASSED_TESTS از $TOTAL_TESTS تست موفقیت‌آمیز"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo "🎉 همه تست‌ها موفقیت‌آمیز!"
elif [ $PASSED_TESTS -gt $((TOTAL_TESTS / 2)) ]; then
    echo "⚠️  اکثر تست‌ها موفقیت‌آمیز، برخی نیاز به بررسی دارند"
else
    echo "❌ تعداد زیادی از تست‌ها ناموفق، نیاز به بررسی جدی"
fi

echo ""
echo "🔗 لینک‌های مفید:"
echo "   • لاگین CRM: $BASE_URL/login"
echo "   • داشبورد CRM: $BASE_URL/dashboard"
echo "   • لاگین پنل ادمین: $BASE_URL/secret-zone-789/login"
echo "   • پنل ادمین: $BASE_URL/secret-zone-789/admin-panel"
echo ""
echo "📋 اطلاعات لاگین یافت شده:"
echo "   • Super Admin: $ADMIN_USERNAME / $ADMIN_EMAIL"
echo "   • کاربر عادی: $USER_EMAIL"
echo "   • رمز عبور پیش‌فرض: 123456"
echo ""
echo "✅ تست endpoint های لاگین کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"