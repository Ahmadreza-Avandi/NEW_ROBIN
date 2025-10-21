#!/bin/bash

# 🔍 Test TTS API Connection
# این اسکریپت اتصال به TTS API رو تست می‌کنه

echo "🔍 تست اتصال به TTS API"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TTS_URL="https://partai.gw.isahab.ir/TextToSpeech/v1/speech-synthesys"
TTS_DOMAIN="partai.gw.isahab.ir"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════
# 1. DNS Resolution Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}1. تست DNS Resolution${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v nslookup &> /dev/null; then
    echo "Testing DNS lookup for: $TTS_DOMAIN"
    nslookup $TTS_DOMAIN
    echo ""
elif command -v dig &> /dev/null; then
    echo "Testing DNS lookup for: $TTS_DOMAIN"
    dig $TTS_DOMAIN +short
    echo ""
else
    echo -e "${YELLOW}⚠️  nslookup/dig not available${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# 2. Ping Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}2. تست Ping${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if ping -c 3 $TTS_DOMAIN &> /dev/null; then
    echo -e "${GREEN}✅ Ping successful${NC}"
    ping -c 3 $TTS_DOMAIN
else
    echo -e "${RED}❌ Ping failed${NC}"
    echo "   Server may block ICMP or be unreachable"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 3. HTTPS Connection Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}3. تست HTTPS Connection${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Testing connection to: $TTS_URL"
echo ""

# Test with curl
if curl -v -k --connect-timeout 10 -I "$TTS_URL" 2>&1 | head -20; then
    echo ""
    echo -e "${GREEN}✅ HTTPS connection successful${NC}"
else
    echo ""
    echo -e "${RED}❌ HTTPS connection failed${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 4. SSL Certificate Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}4. تست SSL Certificate${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if command -v openssl &> /dev/null; then
    echo "Checking SSL certificate for: $TTS_DOMAIN"
    echo | openssl s_client -servername $TTS_DOMAIN -connect $TTS_DOMAIN:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificate is valid${NC}"
    else
        echo -e "${RED}❌ SSL certificate check failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  openssl not available${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Full API Test
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}5. تست کامل TTS API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo "Sending test request to TTS API..."
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$TTS_URL" \
    -H "Content-Type: application/json" \
    -H "gateway-token: eyJhbGciOiJIUzI1NiJ9.eyJzeXN0ZW0iOiJzYWhhYiIsImNyZWF0ZVRpbWUiOiIxNDA0MDYwNDIxMTQ1NDgyNCIsInVuaXF1ZUZpZWxkcyI6eyJ1c2VybmFtZSI6ImU2ZTE2ZWVkLTkzNzEtNGJlOC1hZTBiLTAwNGNkYjBmMTdiOSJ9LCJncm91cE5hbWUiOiJkZjk4NTY2MTZiZGVhNDE2NGQ4ODMzZmRkYTUyOGUwNCIsImRhdGEiOnsic2VydmljZUlEIjoiZGY1M2E3ODAtMjE1OC00NTI0LTkyNDctYzZmMGJhZDNlNzcwIiwicmFuZG9tVGV4dCI6InJtWFJSIn19.6wao3Mps4YOOFh-Si9oS5JW-XZ9RHR58A1CWgM0DUCg" \
    -d '{
        "data": "سلام",
        "filePath": "true",
        "base64": "0",
        "checksum": "1",
        "speaker": "3"
    }' \
    --connect-timeout 30 \
    --max-time 60 \
    2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status Code: $HTTP_CODE"
echo ""
echo "Response Body:"
echo "$BODY" | head -50
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ TTS API is working!${NC}"
    
    # Try to extract filePath
    FILE_PATH=$(echo "$BODY" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$FILE_PATH" ]; then
        echo ""
        echo "Audio file path: $FILE_PATH"
        echo ""
        echo "Testing audio file download..."
        if curl -I "$FILE_PATH" 2>&1 | head -10; then
            echo -e "${GREEN}✅ Audio file is accessible${NC}"
        else
            echo -e "${RED}❌ Audio file is not accessible${NC}"
        fi
    fi
else
    echo -e "${RED}❌ TTS API request failed${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# 6. Test from Docker Container
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}6. تست از داخل Docker Container${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find container name
CONTAINER_NAME=""
for name in "crm-rabin-voice" "crm_rabin_voice" "rabin-voice"; do
    if docker ps --format '{{.Names}}' | grep -q "^${name}$"; then
        CONTAINER_NAME="$name"
        break
    fi
done

if [ -n "$CONTAINER_NAME" ]; then
    echo "Testing from container: $CONTAINER_NAME"
    echo ""
    
    docker exec "$CONTAINER_NAME" sh -c "curl -s -w '\nHTTP Code: %{http_code}\n' -X POST '$TTS_URL' \
        -H 'Content-Type: application/json' \
        -H 'gateway-token: eyJhbGciOiJIUzI1NiJ9.eyJzeXN0ZW0iOiJzYWhhYiIsImNyZWF0ZVRpbWUiOiIxNDA0MDYwNDIxMTQ1NDgyNCIsInVuaXF1ZUZpZWxkcyI6eyJ1c2VybmFtZSI6ImU2ZTE2ZWVkLTkzNzEtNGJlOC1hZTBiLTAwNGNkYjBmMTdiOSJ9LCJncm91cE5hbWUiOiJkZjk4NTY2MTZiZGVhNDE2NGQ4ODMzZmRkYTUyOGUwNCIsImRhdGEiOnsic2VydmljZUlEIjoiZGY1M2E3ODAtMjE1OC00NTI0LTkyNDctYzZmMGJhZDNlNzcwIiwicmFuZG9tVGV4dCI6InJtWFJSIn19.6wao3Mps4YOOFh-Si9oS5JW-XZ9RHR58A1CWgM0DUCg' \
        -d '{\"data\":\"تست\",\"filePath\":\"true\",\"base64\":\"0\",\"checksum\":\"1\",\"speaker\":\"3\"}' \
        --connect-timeout 30" 2>&1 | head -30
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Container can reach TTS API${NC}"
    else
        echo ""
        echo -e "${RED}❌ Container cannot reach TTS API${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Rabin Voice container not found${NC}"
fi
echo ""

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "اگر تست‌ها ناموفق بودند، احتمالات:"
echo ""
echo "1. 🔥 Firewall: سرور شما به TTS API دسترسی ندارد"
echo "   راه‌حل: با مدیر سرور تماس بگیرید"
echo ""
echo "2. 🌐 DNS: مشکل در resolve کردن domain"
echo "   راه‌حل: تنظیمات DNS رو بررسی کنید"
echo ""
echo "3. 🔒 SSL: مشکل در certificate"
echo "   راه‌حل: از curl با -k استفاده کنید (insecure)"
echo ""
echo "4. ⏱️  Timeout: سرور TTS خیلی کنده"
echo "   راه‌حل: timeout رو افزایش بدید"
echo ""
echo "5. 🚫 TTS API down: سرور TTS خاموش است"
echo "   راه‌حل: با تیم TTS تماس بگیرید"
echo ""