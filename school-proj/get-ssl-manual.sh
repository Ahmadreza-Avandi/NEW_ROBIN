#!/bin/bash

# 🔐 دریافت دستی گواهی SSL برای sch.ahmadreza-avandi.ir
# این اسکریپت ساده‌ترین روش برای دریافت SSL است

echo "🔐 دریافت گواهی SSL برای sch.ahmadreza-avandi.ir"
echo ""

# بررسی root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ این اسکریپت باید با sudo اجرا شود"
    echo "دستور: sudo bash get-ssl-manual.sh"
    exit 1
fi

DOMAIN="sch.ahmadreza-avandi.ir"

# بررسی وجود گواهی
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ گواهی SSL قبلاً دریافت شده است"
    echo "📁 مسیر: /etc/letsencrypt/live/$DOMAIN/"
    exit 0
fi

echo "ℹ️  ایجاد دایرکتوری webroot..."
mkdir -p /var/www/certbot
chmod 755 /var/www/certbot

echo "ℹ️  اضافه کردن کانفیگ موقت به nginx..."

# ایجاد کانفیگ
cat > /etc/nginx/sites-available/school-ssl << 'EOF'
server {
    listen 80;
    server_name sch.ahmadreza-avandi.ir;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# فعال‌سازی
ln -sf /etc/nginx/sites-available/school-ssl /etc/nginx/sites-enabled/school-ssl

# تست nginx
echo "ℹ️  تست کانفیگ nginx..."
if nginx -t; then
    echo "✅ کانفیگ nginx صحیح است"
    systemctl reload nginx 2>/dev/null || true
else
    echo "❌ خطا در کانفیگ nginx"
    rm -f /etc/nginx/sites-enabled/school-ssl
    exit 1
fi

echo ""
echo "ℹ️  در حال دریافت گواهی SSL..."
echo "⏳ لطفاً صبر کنید..."
echo ""

# دریافت گواهی
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@ahmadreza-avandi.ir \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ گواهی SSL با موفقیت دریافت شد!"
    echo ""
    echo "📁 مسیر گواهی: /etc/letsencrypt/live/$DOMAIN/"
    echo "📄 Certificate: fullchain.pem"
    echo "🔑 Private Key: privkey.pem"
    echo ""
    echo "🎯 مرحله بعدی: bash deploy.sh"
    
    # حذف کانفیگ موقت
    rm -f /etc/nginx/sites-enabled/school-ssl
    systemctl reload nginx 2>/dev/null || true
else
    echo ""
    echo "❌ دریافت گواهی با خطا مواجه شد"
    echo ""
    echo "💡 راهنمایی:"
    echo "1. مطمئن شوید دامنه به IP سرور متصل است"
    echo "2. پورت 80 باز باشد"
    echo "3. لاگ خطا را بررسی کنید:"
    echo "   sudo tail -50 /var/log/letsencrypt/letsencrypt.log"
    
    # حذف کانفیگ موقت
    rm -f /etc/nginx/sites-enabled/school-ssl
    exit 1
fi
