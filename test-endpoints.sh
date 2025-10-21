#!/bin/bash

# 🧪 Test All Rabin Voice Endpoints
# این اسکریپت همه endpoint های صدای رابین رو تست می‌کنه

set -e

echo "🧪 تست endpoint های صدای رابین"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0

# ═══════════════════════════════════════════════════════════════
# Helper Functions
# ═══════════════════════════════════════════════════════════════

test_endpoint() {
    local name="$1"
    local url="$2"
    local method="${3:-GET}"
    local data="${4:-}"
    
    echo -n "Testing $name... "
    
    if [ "$method" = "POST" ]; then
        if [ -n "$data" ]; then
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" \
                -H "Content-Type: application/json" \
                -d "$data" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X POST "$url" 2>&1)
        fi
    else
        response=$(curl -s -w "\n%{http_code}" "$url" 2>&1)
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
        echo -e "${GREEN}✅ PASS${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (HTTP $http_code)"
        echo "   Response: $body"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# ═══════════════════════════════════════════════════════════════
# 1. Test Direct Port Access (3001)
# ═══════════════════════════════════════════════════════════════

echo "📍 تست دسترسی مستقیم (پورت 3001)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Homepage" "http://localhost:3001/rabin-voice"
test_endpoint "Health Check" "http://localhost:3001/rabin-voice/api/health" "GET"

echo ""

# ═══════════════════════════════════════════════════════════════
# 2. Test Through Domain (if available)
# ═══════════════════════════════════════════════════════════════

echo "🌐 تست از طریق دامنه"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if domain is accessible
if curl -s -k --connect-timeout 5 https://crm.robintejarat.com/rabin-voice > /dev/null 2>&1; then
    test_endpoint "Homepage (Domain)" "https://crm.robintejarat.com/rabin-voice"
    test_endpoint "Health Check (Domain)" "https://crm.robintejarat.com/rabin-voice/api/health"
else
    echo -e "${YELLOW}⚠️  دامنه در دسترس نیست (ممکن است روی سرور محلی باشید)${NC}"
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 3. Test API Endpoints
# ═══════════════════════════════════════════════════════════════

echo "🔌 تست API Endpoints"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test AI endpoint
AI_DATA='{"userMessage":"سلام","history":[]}'
test_endpoint "AI Endpoint" "http://localhost:3001/rabin-voice/api/ai" "POST" "$AI_DATA"

# Test TTS endpoint
TTS_DATA='{"text":"سلام"}'
test_endpoint "TTS Endpoint" "http://localhost:3001/rabin-voice/api/tts" "POST" "$TTS_DATA"

# Test Database endpoint
test_endpoint "Database Test" "http://localhost:3001/rabin-voice/api/database?action=test-connection"

echo ""

# ═══════════════════════════════════════════════════════════════
# 4. Test Audio Proxy
# ═══════════════════════════════════════════════════════════════

echo "🎵 تست Audio Proxy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# First get a real audio URL from TTS
echo -n "Getting audio URL from TTS... "
TTS_RESPONSE=$(curl -s -X POST "http://localhost:3001/rabin-voice/api/tts" \
    -H "Content-Type: application/json" \
    -d '{"text":"تست"}')

AUDIO_URL=$(echo "$TTS_RESPONSE" | grep -o '"audioUrl":"[^"]*"' | cut -d'"' -f4)

if [ -n "$AUDIO_URL" ]; then
    echo -e "${GREEN}✅${NC}"
    echo "Audio URL: $AUDIO_URL"
    
    # Test the audio proxy
    test_endpoint "Audio Proxy" "http://localhost:3001$AUDIO_URL"
else
    echo -e "${RED}❌ Failed to get audio URL${NC}"
    FAILED=$((FAILED + 1))
fi

echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Test Static Assets
# ═══════════════════════════════════════════════════════════════

echo "📦 تست Static Assets"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

test_endpoint "Next.js Static" "http://localhost:3001/rabin-voice/_next/static/css/app/layout.css" || true

echo ""

# ═══════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه نتایج"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "✅ موفق: ${GREEN}$PASSED${NC}"
echo -e "❌ ناموفق: ${RED}$FAILED${NC}"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$((PASSED * 100 / TOTAL))
    echo "نرخ موفقیت: $SUCCESS_RATE%"
fi

echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 همه تست‌ها موفق بودند!${NC}"
    exit 0
else
    echo -e "${RED}⚠️  برخی تست‌ها ناموفق بودند${NC}"
    echo ""
    echo "💡 راهنمایی:"
    echo "   • مطمئن شوید کانتینر در حال اجراست: docker ps"
    echo "   • لاگ‌ها را بررسی کنید: docker logs rabin-voice"
    echo "   • کانتینر را restart کنید: docker-compose restart rabin-voice"
    exit 1
fi