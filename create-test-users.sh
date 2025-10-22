#!/bin/bash

# ===========================================
# 👥 ایجاد کاربران تست برای CRM
# ===========================================
# این اسکریپت کاربران تست برای هر دو بخش CRM و SaaS می‌سازه
# ===========================================

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "👥 ایجاد کاربران تست برای CRM"
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

echo "📋 استفاده از فایل: $COMPOSE_FILE"

# بررسی اتصال دیتابیس
echo ""
echo "🔍 بررسی اتصال دیتابیس..."
if ! docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "❌ اتصال به دیتابیس ناموفق!"
    echo "💡 ابتدا اسکریپت fix-database-connection.sh را اجرا کنید"
    exit 1
fi
echo "✅ اتصال دیتابیس موفقیت‌آمیز"

# مرحله 1: ایجاد Super Admin برای SaaS
echo ""
echo "👑 مرحله 1: ایجاد Super Admin برای پنل SaaS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# تولید hash رمز عبور (123456)
PASSWORD_HASH='$2b$10$LZwtbXyn2q1sIMV5ymNU7ujRHGJJbdPOu2PKf6jUs3wmE.syBxiKK'

echo "🔐 ایجاد Super Admin..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D saas_master << EOF
-- حذف super admin قدیمی اگر وجود داره
DELETE FROM super_admins WHERE username = 'admin' OR email = 'admin@crm.robintejarat.com';

-- ایجاد super admin جدید
INSERT INTO super_admins (
    username, 
    email, 
    password_hash, 
    full_name, 
    phone, 
    role, 
    permissions, 
    is_active, 
    created_at, 
    updated_at
) VALUES (
    'admin',
    'admin@crm.robintejarat.com',
    '$PASSWORD_HASH',
    'مدیر کل سیستم',
    '09123456789',
    'super_admin',
    '["all"]',
    1,
    NOW(),
    NOW()
);

-- نمایش super admin ایجاد شده
SELECT id, username, email, full_name, role, is_active FROM super_admins WHERE username = 'admin';
EOF

echo "✅ Super Admin ایجاد شد:"
echo "   نام کاربری: admin"
echo "   ایمیل: admin@crm.robintejarat.com"
echo "   رمز عبور: 123456"

# مرحله 2: ایجاد کاربر عادی برای CRM
echo ""
echo "👤 مرحله 2: ایجاد کاربر عادی برای CRM..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔐 ایجاد کاربر عادی..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D crm_system << EOF
-- حذف کاربر قدیمی اگر وجود داره
DELETE FROM users WHERE email = 'user@crm.robintejarat.com';

-- ایجاد کاربر جدید
INSERT INTO users (
    name, 
    email, 
    password, 
    role, 
    status, 
    phone, 
    department, 
    position, 
    permissions, 
    created_at, 
    updated_at
) VALUES (
    'کاربر تست',
    'user@crm.robintejarat.com',
    '$PASSWORD_HASH',
    'user',
    'active',
    '09987654321',
    'فروش',
    'کارشناس فروش',
    '["customers_read", "customers_write", "tasks_read", "tasks_write"]',
    NOW(),
    NOW()
);

-- نمایش کاربر ایجاد شده
SELECT id, name, email, role, status, department, position FROM users WHERE email = 'user@crm.robintejarat.com';
EOF

echo "✅ کاربر عادی ایجاد شد:"
echo "   نام: کاربر تست"
echo "   ایمیل: user@crm.robintejarat.com"
echo "   رمز عبور: 123456"
echo "   نقش: user"

# مرحله 3: ایجاد کاربر مدیر برای CRM
echo ""
echo "👨‍💼 مرحله 3: ایجاد کاربر مدیر برای CRM..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🔐 ایجاد کاربر مدیر..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D crm_system << EOF
-- حذف مدیر قدیمی اگر وجود داره
DELETE FROM users WHERE email = 'manager@crm.robintejarat.com';

-- ایجاد مدیر جدید
INSERT INTO users (
    name, 
    email, 
    password, 
    role, 
    status, 
    phone, 
    department, 
    position, 
    permissions, 
    created_at, 
    updated_at
) VALUES (
    'مدیر سیستم',
    'manager@crm.robintejarat.com',
    '$PASSWORD_HASH',
    'admin',
    'active',
    '09111111111',
    'مدیریت',
    'مدیر کل',
    '["all"]',
    NOW(),
    NOW()
);

-- نمایش مدیر ایجاد شده
SELECT id, name, email, role, status, department, position FROM users WHERE email = 'manager@crm.robintejarat.com';
EOF

echo "✅ کاربر مدیر ایجاد شد:"
echo "   نام: مدیر سیستم"
echo "   ایمیل: manager@crm.robintejarat.com"
echo "   رمز عبور: 123456"
echo "   نقش: admin"

# مرحله 4: ایجاد tenant تست
echo ""
echo "🏢 مرحله 4: ایجاد tenant تست..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "🏗️ ایجاد tenant تست..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D saas_master << EOF
-- حذف tenant قدیمی اگر وجود داره
DELETE FROM tenants WHERE tenant_key = 'test-company';

-- ایجاد tenant جدید
INSERT INTO tenants (
    tenant_key,
    company_name,
    db_name,
    db_host,
    db_port,
    db_user,
    db_password,
    admin_name,
    admin_email,
    admin_phone,
    subscription_status,
    subscription_plan,
    subscription_start,
    subscription_end,
    max_users,
    max_customers,
    max_storage_mb,
    features,
    settings,
    is_active,
    is_deleted,
    created_at,
    updated_at
) VALUES (
    'test-company',
    'شرکت تست',
    'crm_system',
    'mysql',
    3306,
    'crm_user',
    '1234',
    'مدیر تست',
    'admin@test-company.com',
    '09333333333',
    'active',
    'professional',
    CURDATE(),
    DATE_ADD(CURDATE(), INTERVAL 1 YEAR),
    20,
    5000,
    2048,
    '["crm_basic", "customer_management", "task_management", "advanced_reports", "api_access"]',
    '{"theme": "default", "language": "fa"}',
    1,
    0,
    NOW(),
    NOW()
);

-- نمایش tenant ایجاد شده
SELECT id, tenant_key, company_name, admin_email, subscription_status, subscription_plan FROM tenants WHERE tenant_key = 'test-company';
EOF

echo "✅ Tenant تست ایجاد شد:"
echo "   کلید: test-company"
echo "   نام شرکت: شرکت تست"
echo "   ایمیل مدیر: admin@test-company.com"
echo "   پلن: professional"

# مرحله 5: تست لاگین
echo ""
echo "🧪 مرحله 5: تست لاگین کاربران..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

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

# انتظار برای آماده شدن سرویس‌ها
echo "⏳ انتظار برای آماده شدن سرویس‌ها..."
sleep 10

# تست لاگین Super Admin
echo ""
echo "👑 تست لاگین Super Admin..."
ADMIN_LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}' \
  "$BASE_URL/api/admin/auth/login" \
  --connect-timeout 15 2>/dev/null || echo "HTTP_STATUS:000")

ADMIN_LOGIN_STATUS=$(echo "$ADMIN_LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "   وضعیت: HTTP $ADMIN_LOGIN_STATUS"

if [ "$ADMIN_LOGIN_STATUS" = "200" ]; then
    echo "   ✅ لاگین Super Admin موفقیت‌آمیز"
elif [ "$ADMIN_LOGIN_STATUS" = "401" ]; then
    echo "   ⚠️  رمز عبور اشتباه (ممکن است hash درست نباشد)"
else
    echo "   ❌ خطا در لاگین Super Admin"
fi

# تست لاگین کاربر عادی
echo ""
echo "👤 تست لاگین کاربر عادی..."
USER_LOGIN_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"user@crm.robintejarat.com","password":"123456"}' \
  "$BASE_URL/api/auth/login" \
  --connect-timeout 15 2>/dev/null || echo "HTTP_STATUS:000")

USER_LOGIN_STATUS=$(echo "$USER_LOGIN_RESPONSE" | grep "HTTP_STATUS:" | cut -d':' -f2)
echo "   وضعیت: HTTP $USER_LOGIN_STATUS"

if [ "$USER_LOGIN_STATUS" = "200" ]; then
    echo "   ✅ لاگین کاربر عادی موفقیت‌آمیز"
elif [ "$USER_LOGIN_STATUS" = "401" ]; then
    echo "   ⚠️  رمز عبور اشتباه (ممکن است hash درست نباشد)"
else
    echo "   ❌ خطا در لاگین کاربر عادی"
fi

# خلاصه نهایی
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه کاربران ایجاد شده:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "👑 Super Admin (پنل SaaS):"
echo "   نام کاربری: admin"
echo "   ایمیل: admin@crm.robintejarat.com"
echo "   رمز عبور: 123456"
echo "   لینک لاگین: $BASE_URL/secret-zone-789/login"
echo ""
echo "👨‍💼 مدیر CRM:"
echo "   ایمیل: manager@crm.robintejarat.com"
echo "   رمز عبور: 123456"
echo "   لینک لاگین: $BASE_URL/login"
echo ""
echo "👤 کاربر عادی CRM:"
echo "   ایمیل: user@crm.robintejarat.com"
echo "   رمز عبور: 123456"
echo "   لینک لاگین: $BASE_URL/login"
echo ""
echo "🏢 Tenant تست:"
echo "   کلید: test-company"
echo "   نام: شرکت تست"
echo "   ایمیل مدیر: admin@test-company.com"
echo ""
echo "🔗 لینک‌های مفید:"
echo "   • پنل ادمین SaaS: $BASE_URL/secret-zone-789/admin-panel"
echo "   • داشبورد CRM: $BASE_URL/dashboard"
echo "   • صفحه اصلی: $BASE_URL"
echo ""
echo "💡 نکات:"
echo "   • همه رمزهای عبور: 123456"
echo "   • برای تست کامل از اسکریپت test-login-endpoints.sh استفاده کنید"
echo "   • اگر لاگین کار نکرد، ممکن است نیاز به hash مجدد رمز باشد"
echo ""
echo "✅ ایجاد کاربران تست کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"