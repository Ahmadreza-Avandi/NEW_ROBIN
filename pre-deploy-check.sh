#!/bin/bash

# 🔍 Pre-Deployment Verification Script
# این اسکریپت قبل از دیپلوی همه چیز رو چک می‌کنه

echo "🔍 بررسی پیش از دیپلوی..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ERRORS=0
WARNINGS=0

# ═══════════════════════════════════════════════════════════════
# 1. بررسی فایل‌های ضروری
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📁 بررسی فایل‌های ضروری..."

# فایل‌های اصلی
REQUIRED_FILES=(
    "docker-compose.yml"
    "deploy-server.sh"
    ".env.server"
    "nginx/default.conf"
    "صدای رابین/Dockerfile"
    "صدای رابین/next.config.js"
    "صدای رابین/package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file - یافت نشد!"
        ERRORS=$((ERRORS + 1))
    fi
done

# ═══════════════════════════════════════════════════════════════
# 2. بررسی محتوای docker-compose.yml
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🐳 بررسی docker-compose.yml..."

if grep -q "rabin-voice:" docker-compose.yml; then
    echo "   ✅ سرویس rabin-voice تعریف شده"
else
    echo "   ❌ سرویس rabin-voice تعریف نشده!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "container_name: crm-rabin-voice" docker-compose.yml; then
    echo "   ✅ نام کانتینر: crm-rabin-voice"
else
    echo "   ⚠️  نام کانتینر ممکن است متفاوت باشد"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "build: ./صدای رابین" docker-compose.yml; then
    echo "   ✅ مسیر build صحیح است"
else
    echo "   ❌ مسیر build اشتباه است!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "3001" docker-compose.yml; then
    echo "   ✅ پورت 3001 تنظیم شده"
else
    echo "   ❌ پورت 3001 تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 3. بررسی nginx config
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🌐 بررسی nginx config..."

if grep -q "/rabin-voice" nginx/default.conf; then
    echo "   ✅ مسیر /rabin-voice تعریف شده"
else
    echo "   ❌ مسیر /rabin-voice تعریف نشده!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "rabin-voice:3001" nginx/default.conf; then
    echo "   ✅ proxy_pass به rabin-voice:3001"
else
    echo "   ❌ proxy_pass به rabin-voice:3001 تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

# بررسی تعداد location blocks برای rabin-voice
RABIN_LOCATIONS=$(grep -c "location /rabin-voice" nginx/default.conf)
if [ "$RABIN_LOCATIONS" -ge 2 ]; then
    echo "   ✅ چند location block برای rabin-voice ($RABIN_LOCATIONS)"
else
    echo "   ⚠️  فقط $RABIN_LOCATIONS location block برای rabin-voice"
    WARNINGS=$((WARNINGS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 4. بررسی next.config.js
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⚙️ بررسی next.config.js..."

if grep -q "basePath: '/rabin-voice'" "صدای رابین/next.config.js"; then
    echo "   ✅ basePath: '/rabin-voice'"
else
    echo "   ❌ basePath تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "assetPrefix: '/rabin-voice'" "صدای رابین/next.config.js"; then
    echo "   ✅ assetPrefix: '/rabin-voice'"
else
    echo "   ❌ assetPrefix تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "output: 'standalone'" "صدای رابین/next.config.js"; then
    echo "   ✅ output: 'standalone'"
else
    echo "   ❌ output: 'standalone' تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "trailingSlash: false" "صدای رابین/next.config.js"; then
    echo "   ✅ trailingSlash: false"
else
    echo "   ⚠️  trailingSlash تنظیم نشده"
    WARNINGS=$((WARNINGS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 5. بررسی Dockerfile
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🐋 بررسی Dockerfile..."

if grep -q "FROM node:18-alpine" "صدای رابین/Dockerfile"; then
    echo "   ✅ Base image: node:18-alpine"
else
    echo "   ⚠️  Base image متفاوت است"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q "output: 'standalone'" "صدای رابین/Dockerfile" || grep -q "standalone" "صدای رابین/Dockerfile"; then
    echo "   ✅ Standalone build"
else
    echo "   ⚠️  Standalone build ممکن است تنظیم نشده باشد"
    WARNINGS=$((WARNINGS + 1))
fi

if grep -q 'CMD \["node", "server.js"\]' "صدای رابین/Dockerfile"; then
    echo "   ✅ CMD: node server.js"
else
    echo "   ❌ CMD صحیح نیست!"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "EXPOSE 3001" "صدای رابین/Dockerfile"; then
    echo "   ✅ EXPOSE 3001"
else
    echo "   ❌ EXPOSE 3001 تنظیم نشده!"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 6. بررسی متغیرهای محیطی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔐 بررسی متغیرهای محیطی..."

if [ -f ".env.server" ]; then
    echo "   ✅ فایل .env.server موجود است"
    
    # بررسی متغیرهای کلیدی
    if grep -q "RABIN_VOICE_OPENROUTER_API_KEY" .env.server; then
        echo "   ✅ RABIN_VOICE_OPENROUTER_API_KEY"
    else
        echo "   ❌ RABIN_VOICE_OPENROUTER_API_KEY یافت نشد!"
        ERRORS=$((ERRORS + 1))
    fi
    
    if grep -q "RABIN_VOICE_TTS_API_URL" .env.server; then
        echo "   ✅ RABIN_VOICE_TTS_API_URL"
    else
        echo "   ⚠️  RABIN_VOICE_TTS_API_URL یافت نشد"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "RABIN_VOICE_OPENROUTER_MODEL" .env.server; then
        echo "   ✅ RABIN_VOICE_OPENROUTER_MODEL"
    else
        echo "   ⚠️  RABIN_VOICE_OPENROUTER_MODEL یافت نشد (از default استفاده می‌شود)"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo "   ❌ فایل .env.server یافت نشد!"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 7. بررسی دایرکتری‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📁 بررسی دایرکتری‌ها..."

if [ -d "صدای رابین" ]; then
    echo "   ✅ دایرکتری صدای رابین"
else
    echo "   ❌ دایرکتری صدای رابین یافت نشد!"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "صدای رابین/app" ]; then
    echo "   ✅ دایرکتری app"
else
    echo "   ❌ دایرکتری app یافت نشد!"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "صدای رابین/app/api" ]; then
    echo "   ✅ دایرکتری app/api"
else
    echo "   ❌ دایرکتری app/api یافت نشد!"
    ERRORS=$((ERRORS + 1))
fi

# بررسی logs directory
if [ -d "صدای رابین/logs" ]; then
    echo "   ✅ دایرکتری logs موجود است"
else
    echo "   ⚠️  دایرکتری logs موجود نیست - ایجاد می‌شود..."
    mkdir -p "صدای رابین/logs"
    chmod 755 "صدای رابین/logs"
    echo "   ✅ دایرکتری logs ایجاد شد"
fi

# ═══════════════════════════════════════════════════════════════
# 8. بررسی Docker
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🐳 بررسی Docker..."

if command -v docker &> /dev/null; then
    echo "   ✅ Docker نصب شده"
    DOCKER_VERSION=$(docker --version)
    echo "      $DOCKER_VERSION"
else
    echo "   ❌ Docker نصب نشده!"
    ERRORS=$((ERRORS + 1))
fi

if command -v docker-compose &> /dev/null; then
    echo "   ✅ Docker Compose نصب شده"
    COMPOSE_VERSION=$(docker-compose --version)
    echo "      $COMPOSE_VERSION"
else
    echo "   ❌ Docker Compose نصب نشده!"
    ERRORS=$((ERRORS + 1))
fi

# بررسی Docker daemon
if docker info &> /dev/null; then
    echo "   ✅ Docker daemon در حال اجراست"
else
    echo "   ❌ Docker daemon در حال اجرا نیست!"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# 9. بررسی حافظه سیستم
# ═══════════════════════════════════════════════════════════════

echo ""
echo "💾 بررسی منابع سیستم..."

if command -v free &> /dev/null; then
    TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
    FREE_MEM=$(free -m | awk 'NR==2{printf "%.0f", $4}')
    echo "   📊 حافظه کل: ${TOTAL_MEM}MB"
    echo "   📊 حافظه آزاد: ${FREE_MEM}MB"
    
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        echo "   ⚠️  حافظه کم - ممکن است نیاز به swap باشد"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✅ حافظه کافی است"
    fi
else
    echo "   ⚠️  نمی‌توان حافظه را بررسی کرد"
    WARNINGS=$((WARNINGS + 1))
fi

# بررسی فضای دیسک
if command -v df &> /dev/null; then
    DISK_USAGE=$(df -h . | awk 'NR==2{print $5}' | sed 's/%//')
    DISK_AVAIL=$(df -h . | awk 'NR==2{print $4}')
    echo "   📊 فضای دیسک استفاده شده: ${DISK_USAGE}%"
    echo "   📊 فضای دیسک آزاد: ${DISK_AVAIL}"
    
    if [ "$DISK_USAGE" -gt 90 ]; then
        echo "   ⚠️  فضای دیسک کم است!"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✅ فضای دیسک کافی است"
    fi
fi

# ═══════════════════════════════════════════════════════════════
# 10. بررسی deploy-server.sh
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📜 بررسی deploy-server.sh..."

if [ -x "deploy-server.sh" ]; then
    echo "   ✅ deploy-server.sh قابل اجراست"
else
    echo "   ⚠️  deploy-server.sh قابل اجرا نیست - اصلاح..."
    chmod +x deploy-server.sh
    echo "   ✅ مجوز اجرا اضافه شد"
fi

# بررسی محتوای اسکریپت
if grep -q "rabin-voice" deploy-server.sh; then
    echo "   ✅ اسکریپت شامل تنظیمات rabin-voice است"
else
    echo "   ❌ اسکریپت شامل تنظیمات rabin-voice نیست!"
    ERRORS=$((ERRORS + 1))
fi

# ═══════════════════════════════════════════════════════════════
# خلاصه نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه بررسی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ همه چیز آماده است! می‌توانید دیپلوی کنید."
    echo ""
    echo "🚀 برای دیپلوی اجرا کنید:"
    echo "   ./deploy-server.sh"
    echo ""
    echo "🧹 برای دیپلوی با پاکسازی کامل:"
    echo "   ./deploy-server.sh --clean"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS هشدار یافت شد، اما می‌توانید ادامه دهید."
    echo ""
    echo "🚀 برای دیپلوی اجرا کنید:"
    echo "   ./deploy-server.sh"
    exit 0
else
    echo "❌ $ERRORS خطا و $WARNINGS هشدار یافت شد!"
    echo ""
    echo "لطفاً خطاها را برطرف کنید و دوباره تلاش کنید."
    exit 1
fi