#!/bin/bash

# 🔧 اسکریپت حل مشکل پورت 80
# این اسکریپت nginx سیستم را متوقف می‌کند و پروژه را اجرا می‌کند

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 حل مشکل پورت 80"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی پورت 80
echo "🔍 بررسی پورت 80..."
if sudo lsof -i :80 >/dev/null 2>&1 || sudo netstat -tulpn | grep :80 >/dev/null 2>&1; then
    echo "⚠️  پورت 80 اشغال است"
    echo ""
    echo "📋 سرویس‌های در حال استفاده از پورت 80:"
    sudo lsof -i :80 2>/dev/null || sudo netstat -tulpn | grep :80
    echo ""
    
    # متوقف کردن nginx سیستم
    echo "🛑 متوقف کردن nginx سیستم..."
    sudo systemctl stop nginx 2>/dev/null && echo "✅ nginx متوقف شد (systemctl)" || true
    sudo service nginx stop 2>/dev/null && echo "✅ nginx متوقف شد (service)" || true
    
    # غیرفعال کردن nginx برای اینکه بعد از ریبوت اجرا نشه
    echo "🔒 غیرفعال کردن nginx برای بوت خودکار..."
    sudo systemctl disable nginx 2>/dev/null && echo "✅ nginx غیرفعال شد" || true
    
    sleep 3
    
    # بررسی مجدد
    if sudo lsof -i :80 >/dev/null 2>&1 || sudo netstat -tulpn | grep :80 >/dev/null 2>&1; then
        echo "❌ پورت 80 هنوز اشغال است!"
        echo "📋 سرویس‌های باقی‌مانده:"
        sudo lsof -i :80 2>/dev/null || sudo netstat -tulpn | grep :80
        echo ""
        echo "💡 راه‌حل دستی:"
        echo "   1. پیدا کردن PID: sudo lsof -i :80"
        echo "   2. متوقف کردن: sudo kill -9 <PID>"
        exit 1
    else
        echo "✅ پورت 80 آزاد شد"
    fi
else
    echo "✅ پورت 80 آزاد است"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ پورت 80 آماده است"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 حالا می‌توانید deploy-server.sh را اجرا کنید:"
echo "   bash deploy-server.sh --clean"
