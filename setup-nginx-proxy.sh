#!/bin/bash

# 🌐 تنظیم nginx به عنوان reverse proxy برای Docker
# این اسکریپت nginx سیستم را طوری تنظیم می‌کند که به Docker proxy کند

DOMAIN="crm.robintejarat.com"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 تنظیم nginx سیستم به عنوان Reverse Proxy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی وجود nginx
if ! command -v nginx &> /dev/null; then
    echo "❌ nginx روی سیستم نصب نیست"
    echo "💡 دو گزینه دارید:"
    echo "   1. نصب nginx: sudo apt install nginx"
    echo "   2. استفاده از Docker nginx (توصیه می‌شود)"
    exit 1
fi

echo "✅ nginx روی سیستم نصب است"

# پشتیبان‌گیری از تنظیمات قبلی
echo "📦 پشتیبان‌گیری از تنظیمات nginx..."
sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || true

# ایجاد تنظیمات جدید
echo "📝 ایجاد تنظیمات reverse proxy..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'EOF'
server {
    listen 80;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    client_max_body_size 50M;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    # Proxy به Docker nginx
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# فعال کردن سایت
echo "🔗 فعال کردن سایت..."
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/ 2>/dev/null || true

# حذف default اگر وجود دارد
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    echo "🗑️ حذف تنظیمات default..."
    sudo rm /etc/nginx/sites-enabled/default
fi

# تست تنظیمات
echo "🧪 تست تنظیمات nginx..."
if sudo nginx -t; then
    echo "✅ تنظیمات nginx صحیح است"
    
    # ریلود nginx
    echo "🔄 ریلود nginx..."
    sudo systemctl reload nginx || sudo service nginx reload
    echo "✅ nginx ریلود شد"
else
    echo "❌ تنظیمات nginx مشکل دارد!"
    echo "🔙 بازگردانی تنظیمات قبلی..."
    sudo rm /etc/nginx/sites-available/$DOMAIN
    sudo systemctl reload nginx || sudo service nginx reload
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ nginx سیستم به عنوان reverse proxy تنظیم شد"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 تنظیمات:"
echo "   🌐 nginx سیستم: پورت 80 (عمومی)"
echo "   🐳 Docker nginx: پورت 8080 (داخلی)"
echo ""
echo "💡 حالا باید docker-compose را با پورت 8080 اجرا کنید"
echo "   یا از اسکریپت deploy-with-system-nginx.sh استفاده کنید"
