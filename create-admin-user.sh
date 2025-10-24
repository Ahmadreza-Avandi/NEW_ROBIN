#!/bin/bash

# ===========================================
# 👑 ایجاد کاربر ادمین با رمز درست
# ===========================================

set -e

echo "👑 ایجاد کاربر ادمین با رمز درست..."

# تشخیص docker-compose file
if [ -f "docker-compose.deploy.yml" ]; then
    COMPOSE_FILE="docker-compose.deploy.yml"
elif [ -f "docker-compose.yml" ]; then
    COMPOSE_FILE="docker-compose.yml"
else
    echo "❌ فایل docker-compose یافت نشد!"
    exit 1
fi

# دریافت رمز عبور از کاربر
echo ""
echo "🔐 لطفاً رمز عبور مورد نظر را وارد کنید:"
read -s PASSWORD
echo ""

# تولید hash رمز عبور
echo "🔧 تولید hash رمز عبور..."
PASSWORD_HASH=$(docker-compose -f $COMPOSE_FILE exec -T nextjs node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('$PASSWORD', 10);
console.log(hash);
")

# حذف کاراکترهای اضافی
PASSWORD_HASH=$(echo "$PASSWORD_HASH" | tr -d '\r\n')

echo "✅ Hash تولید شد: $PASSWORD_HASH"

# ایجاد Super Admin
echo ""
echo "👑 ایجاد Super Admin..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D saas_master << EOF
-- حذف super admin قدیمی
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

# ایجاد کاربر مدیر CRM
echo ""
echo "👨‍💼 ایجاد کاربر مدیر CRM..."
docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -D crm_system << EOF
-- حذف مدیر قدیمی
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
SELECT id, name, email, role, status FROM users WHERE email = 'manager@crm.robintejarat.com';
EOF

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ کاربران ایجاد شدند:"
echo ""
echo "👑 Super Admin (پنل SaaS):"
echo "   نام کاربری: admin"
echo "   ایمیل: admin@crm.robintejarat.com"
echo "   رمز عبور: [رمز وارد شده]"
echo "   لینک: http://crm.robintejarat.com/secret-zone-789/login"
echo ""
echo "👨‍💼 مدیر CRM:"
echo "   ایمیل: manager@crm.robintejarat.com"
echo "   رمز عبور: [رمز وارد شده]"
echo "   لینک: http://crm.robintejarat.com/login"
echo ""
echo "✅ کاربران با موفقیت ایجاد شدند!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"