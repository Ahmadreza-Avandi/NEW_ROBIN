#!/bin/bash

# 🚀 Simple CRM Server Deployment Script
set -e

DOMAIN="crm.robintejarat.com"
EMAIL="admin@crm.robintejarat.com"

echo "🚀 شروع دیپلوی ساده CRM..."
echo "🌐 دامنه: $DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 🛑 مرحله 1: متوقف کردن سرویس‌های قدیمی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🛑 مرحله 1: متوقف کردن سرویس‌های قدیمی..."

docker compose down 2>/dev/null || true

# ═══════════════════════════════════════════════════════════════
# ⚙️ مرحله 2: تنظیم فایل .env
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⚙️ مرحله 2: تنظیم فایل .env..."

# بررسی وجود .env
if [ ! -f ".env" ]; then
    echo "❌ فایل .env یافت نشد!"
    echo "🔧 ایجاد فایل .env پایه..."
    
    cat > .env << EOF
NODE_ENV=production
NEXTAUTH_URL=http://$DOMAIN
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=1234
DATABASE_NAME=crm_system
SAAS_DATABASE_NAME=saas_master
DB_HOST=mysql
DB_USER=crm_user
DB_PASSWORD=1234
DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system
DOCKER_CONTAINER=true
JWT_SECRET=g45YtsLm1gFe1Hy1MBSXLHMbVcfIogiRE4m41iEvELGNJMwkaHP2ALvIMkPfs
NEXTAUTH_SECRET=lwGfffrnAc9Y4ZCMgyvuYsew97UQjLsITqWVLC1Id7uq70NVYbe4MCiLtyNzArF
VPS_MODE=true
AUDIO_ENABLED=false
FALLBACK_TO_MANUAL_INPUT=true
RABIN_VOICE_OPENROUTER_API_KEY=.
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO
EOF
fi

# اطمینان از تنظیمات درست
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$DOMAIN|g" .env
sed -i "s|DATABASE_HOST=.*|DATABASE_HOST=mysql|g" .env
sed -i "s|VPS_MODE=.*|VPS_MODE=true|g" .env
sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env

echo "✅ فایل .env تنظیم شد"

# ═══════════════════════════════════════════════════════════════
# 📁 مرحله 3: آماده‌سازی فایل‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📁 مرحله 3: آماده‌سازی فایل‌ها..."

# ایجاد فولدرهای مورد نیاز
mkdir -p uploads/{documents,avatars,chat,temp}
mkdir -p public/uploads/{documents,avatars,chat}
mkdir -p nginx
mkdir -p database
mkdir -p logs

# تنظیم مجوزها
chmod -R 777 uploads
chmod -R 777 public/uploads

# ایجاد nginx config ساده
cat > nginx/simple.conf << 'EOF'
server {
    listen 80;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /api/ {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "✅ فایل‌ها آماده شدند"

# ═══════════════════════════════════════════════════════════════
# 🗄️ مرحله 4: آماده‌سازی دیتابیس
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🗄️ مرحله 4: آماده‌سازی دیتابیس..."

# ایجاد فایل init دیتابیس
cat > database/00-init-databases.sql << 'EOF'
-- Database Initialization Script
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
DROP USER IF EXISTS 'crm_user'@'%';
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
FLUSH PRIVILEGES;
EOF

# بررسی فایل‌های دیتابیس
if [ ! -f "database/crm_system.sql" ]; then
    echo "❌ فایل database/crm_system.sql یافت نشد!"
    exit 1
fi

if [ ! -f "database/saas_master.sql" ]; then
    echo "❌ فایل database/saas_master.sql یافت نشد!"
    exit 1
fi

echo "✅ دیتابیس آماده شد"

# ═══════════════════════════════════════════════════════════════
# 🔨 مرحله 5: Build و راه‌اندازی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔨 مرحله 5: Build و راه‌اندازی..."

# انتخاب فایل docker-compose مناسب
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
if [ "$TOTAL_MEM" -lt 2048 ]; then
    COMPOSE_FILE="docker-compose.memory-optimized.yml"
    echo "💾 استفاده از تنظیمات حافظه کم: $COMPOSE_FILE"
else
    COMPOSE_FILE="docker-compose.yml"
    echo "💾 استفاده از تنظیمات معمولی: $COMPOSE_FILE"
fi

# تنظیم nginx config در docker-compose
cp $COMPOSE_FILE docker-compose.deploy.yml
sed -i 's|./nginx/default.conf|./nginx/simple.conf|g' docker-compose.deploy.yml
sed -i 's|./nginx/low-memory.conf|./nginx/simple.conf|g' docker-compose.deploy.yml

COMPOSE_FILE="docker-compose.deploy.yml"

# Build و راه‌اندازی
echo "🔨 شروع build..."
docker compose -f $COMPOSE_FILE build --force-rm nextjs

echo "🚀 راه‌اندازی سرویس‌ها..."
docker compose -f $COMPOSE_FILE up -d

echo "✅ Build و راه‌اندازی کامل شد"

# ═══════════════════════════════════════════════════════════════
# ⏳ مرحله 6: انتظار و تست
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ مرحله 6: انتظار برای آماده شدن سرویس‌ها..."
sleep 30

# بررسی وضعیت کانتینرها
echo "📊 وضعیت کانتینرها:"
docker compose -f $COMPOSE_FILE ps

# تست دیتابیس
echo ""
echo "🧪 تست دیتابیس..."
sleep 15

if docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ دیتابیس در حال اجراست"
    
    # بررسی دیتابیس‌ها
    DATABASES=$(docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" || echo "")
    
    if echo "$DATABASES" | grep -q "crm_system"; then
        echo "✅ دیتابیس crm_system موجود است"
    else
        echo "⚠️  دیتابیس crm_system موجود نیست - ایمپورت..."
        docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 crm_system < database/crm_system.sql 2>/dev/null || true
    fi
    
    if echo "$DATABASES" | grep -q "saas_master"; then
        echo "✅ دیتابیس saas_master موجود است"
    else
        echo "⚠️  دیتابیس saas_master موجود نیست - ایمپورت..."
        docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p1234 saas_master < database/saas_master.sql 2>/dev/null || true
    fi
    
    # تست کاربر crm_user
    if docker compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ کاربر crm_user کار می‌کند"
    else
        echo "❌ کاربر crm_user مشکل دارد"
    fi
else
    echo "❌ دیتابیس مشکل دارد"
fi

# تست NextJS
echo ""
echo "🧪 تست NextJS..."
sleep 10

if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ NextJS در حال اجراست"
else
    echo "⚠️  NextJS هنوز آماده نیست"
fi

# تست دامنه
echo ""
echo "🧪 تست دامنه..."
DOMAIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --connect-timeout 10)
if [ "$DOMAIN_TEST" = "200" ] || [ "$DOMAIN_TEST" = "302" ] || [ "$DOMAIN_TEST" = "301" ]; then
    echo "✅ دامنه $DOMAIN در دسترس است (HTTP $DOMAIN_TEST)"
else
    echo "⚠️  دامنه پاسخ نمی‌دهد (HTTP $DOMAIN_TEST)"
fi

# ═══════════════════════════════════════════════════════════════
# 🎉 خلاصه نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 دیپلوی ساده کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🌐 آدرس‌های دسترسی:"
echo "   • سیستم CRM: http://$DOMAIN"
echo "   • لاگین: http://$DOMAIN/login"
echo ""
echo "👑 اطلاعات لاگین:"
echo "   • ایمیل: Robintejarat@gmail.com"
echo "   • رمز عبور: 1234"
echo ""
echo "📋 دستورات مفید:"
echo "   • مشاهده لاگ‌ها: docker compose -f $COMPOSE_FILE logs -f"
echo "   • راه‌اندازی مجدد: docker compose -f $COMPOSE_FILE restart"
echo "   • توقف: docker compose -f $COMPOSE_FILE down"
echo "   • بررسی وضعیت: docker compose -f $COMPOSE_FILE ps"
echo ""
echo "✅ دیپلوی کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"