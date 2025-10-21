#!/bin/bash

echo "🔍 بررسی دسترسی به دامنه..."

DOMAIN="crm.robintejarat.com"

echo "📡 بررسی DNS..."
nslookup $DOMAIN

echo ""
echo "🌐 بررسی اتصال به دامنه..."
curl -I http://$DOMAIN --connect-timeout 10 || echo "❌ اتصال به دامنه ناموفق"

echo ""
echo "🔗 بررسی اتصال محلی..."
curl -I http://localhost --connect-timeout 5 || echo "❌ اتصال محلی ناموفق"

echo ""
echo "📊 وضعیت پورت‌ها:"
netstat -tlnp | grep :80
netstat -tlnp | grep :443

echo ""
echo "🔥 وضعیت فایروال:"
ufw status

echo ""
echo "🐳 وضعیت Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "📋 لاگ‌های nginx:"
docker logs crm_nginx --tail 10

echo ""
echo "🧪 تست مستقیم nginx:"
docker exec crm_nginx nginx -t

echo ""
echo "🔍 بررسی IP سرور:"
curl -s ifconfig.me
echo ""

echo "✅ بررسی کامل شد!"