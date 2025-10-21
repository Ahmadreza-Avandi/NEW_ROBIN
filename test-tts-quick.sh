#!/bin/bash

# 🚀 Quick TTS Test
# تست سریع TTS API

echo "🚀 تست سریع TTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
TTS_API="https://api.ahmadreza-avandi.ir/text-to-speech"
LOCAL_ENDPOINT="http://localhost:3001/rabin-voice/api/tts"
PROD_ENDPOINT="https://crm.robintejarat.com/rabin-voice/api/tts"
TEST_TEXT="سلام"

# ═══════════════════════════════════════════════════════════════
# 1. Test TTS API directly
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}1️⃣  تست مستقیم TTS API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL: $TTS_API"
echo "Text: $TEST_TEXT"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$TTS_API" \
  -H "Content-Type: application/json" \
  -H "User-Agent: Dastyar-Robin/1.0" \
  -d "{\"text\":\"$TEST_TEXT\",\"speaker\":\"3\",\"checksum\":\"1\",\"filePath\":\"true\",\"base64\":\"0\"}" \
  --connect-timeout 10 \
  --max-time 30 \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ TTS API is working!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | head -20
    echo ""
    
    # Extract filePath
    FILE_PATH=$(echo "$BODY" | grep -o '"filePath":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$FILE_PATH" ]; then
        echo -e "${GREEN}✅ Audio file path received: $FILE_PATH${NC}"
    fi
else
    echo -e "${RED}❌ TTS API failed${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | head -20
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. Test Local Endpoint
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}2️⃣  تست Local Endpoint${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "URL: $LOCAL_ENDPOINT"
echo "Text: $TEST_TEXT"
echo ""

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$LOCAL_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"text\":\"$TEST_TEXT\"}" \
  --connect-timeout 10 \
  --max-time 30 \
  2>&1)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

echo "HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Local endpoint is working!${NC}"
    echo ""
    echo "Response:"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    echo ""
    
    # Extract audioUrl
    AUDIO_URL=$(echo "$BODY" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)
    if [ -n "$AUDIO_URL" ]; then
        echo -e "${GREEN}✅ Audio URL received: $AUDIO_URL${NC}"
        
        # Test audio proxy
        echo ""
        echo "Testing audio proxy..."
        FULL_AUDIO_URL="http://localhost:3001${AUDIO_URL}"
        
        if curl -I -s "$FULL_AUDIO_URL" | head -1 | grep -q "200"; then
            echo -e "${GREEN}✅ Audio proxy is working!${NC}"
        else
            echo -e "${RED}❌ Audio proxy failed${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Local endpoint failed${NC}"
    echo ""
    echo "Response:"
    echo "$BODY"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. Test Production Endpoint (optional)
# ═══════════════════════════════════════════════════════════════

if [ "$1" == "--prod" ]; then
    echo -e "${BLUE}3️⃣  تست Production Endpoint${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "URL: $PROD_ENDPOINT"
    echo "Text: $TEST_TEXT"
    echo ""
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PROD_ENDPOINT" \
      -H "Content-Type: application/json" \
      -d "{\"text\":\"$TEST_TEXT\"}" \
      --connect-timeout 10 \
      --max-time 30 \
      2>&1)
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n-1)
    
    echo "HTTP Status: $HTTP_CODE"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✅ Production endpoint is working!${NC}"
        echo ""
        echo "Response:"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    else
        echo -e "${RED}❌ Production endpoint failed${NC}"
        echo ""
        echo "Response:"
        echo "$BODY"
    fi
    
    echo ""
fi

# ═══════════════════════════════════════════════════════════════
# 4. Check Container Logs
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}4️⃣  لاگ‌های اخیر Container${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Find container
CONTAINER_NAME=""
for name in "crm-rabin-voice" "crm_rabin_voice" "rabin-voice"; do
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${name}$"; then
        CONTAINER_NAME="$name"
        break
    fi
done

if [ -n "$CONTAINER_NAME" ]; then
    echo "Container: $CONTAINER_NAME"
    echo ""
    docker logs --tail=30 "$CONTAINER_NAME" 2>&1 | grep -E "(TTS|Error|✅|❌|🎤|📡)" || echo "No TTS logs found"
else
    echo -e "${YELLOW}⚠️  Container not found${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 برای تست production endpoint:"
echo "   ./test-tts-quick.sh --prod"
echo ""
echo "💡 برای مشاهده لاگ‌های زنده:"
echo "   docker logs -f $CONTAINER_NAME | grep TTS"
echo ""
echo "💡 برای تست کامل:"
echo "   ./test-endpoints.sh"
echo ""