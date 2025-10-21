#!/bin/bash

# 🔍 مقایسه Implementation های TTS
# این اسکریپت تفاوت‌های بین Next.js و Express.js رو نشون می‌ده

echo "🔍 مقایسه Implementation های TTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ═══════════════════════════════════════════════════════════════
# 1. Next.js Implementation
# ═══════════════════════════════════════════════════════════════

echo -e "${BLUE}1️⃣  Next.js Implementation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NEXTJS_FILE="صدای رابین/app/api/tts/route.ts"

if [ -f "$NEXTJS_FILE" ]; then
    echo -e "${GREEN}✅ فایل: $NEXTJS_FILE${NC}"
    echo ""
    
    # Extract TTS URL
    TTS_URL=$(grep -oP "ttsUrl\s*=\s*.*'https://[^']+'" "$NEXTJS_FILE" | grep -oP "https://[^']+")
    echo "🌐 TTS API URL:"
    echo "   $TTS_URL"
    echo ""
    
    # Extract request body structure
    echo "📤 Request Body Structure:"
    sed -n '/const requestBody = {/,/};/p' "$NEXTJS_FILE" | head -10
    echo ""
    
    # Extract headers
    echo "📋 Headers:"
    sed -n '/headers: {/,/},/p' "$NEXTJS_FILE" | head -10
    echo ""
    
else
    echo -e "${RED}❌ فایل یافت نشد: $NEXTJS_FILE${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# 2. Express.js Implementation
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${BLUE}2️⃣  Express.js Implementation${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EXPRESS_FILE="صدای رابین/api/routes/tts.js"

if [ -f "$EXPRESS_FILE" ]; then
    echo -e "${GREEN}✅ فایل: $EXPRESS_FILE${NC}"
    echo ""
    
    # Extract TTS URL
    TTS_URL=$(grep -oP "ttsUrl\s*=\s*'https://[^']+'" "$EXPRESS_FILE" | grep -oP "https://[^']+")
    echo "🌐 TTS API URL:"
    echo "   $TTS_URL"
    echo ""
    
    # Extract request body structure
    echo "📤 Request Body Structure:"
    sed -n '/await axios.post(ttsUrl, {/,/}, {/p' "$EXPRESS_FILE" | head -10
    echo ""
    
    # Extract headers
    echo "📋 Headers:"
    sed -n '/headers: {/,/}/p' "$EXPRESS_FILE" | head -10
    echo ""
    
else
    echo -e "${RED}❌ فایل یافت نشد: $EXPRESS_FILE${NC}"
fi

# ═══════════════════════════════════════════════════════════════
# 3. مقایسه
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}3️⃣  مقایسه${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Compare TTS URLs
NEXTJS_URL=$(grep -oP "ttsUrl\s*=\s*.*'https://[^']+'" "$NEXTJS_FILE" 2>/dev/null | grep -oP "https://[^']+" | head -1)
EXPRESS_URL=$(grep -oP "ttsUrl\s*=\s*'https://[^']+'" "$EXPRESS_FILE" 2>/dev/null | grep -oP "https://[^']+" | head -1)

echo "🌐 TTS API URLs:"
echo ""
echo "   Next.js:    $NEXTJS_URL"
echo "   Express.js: $EXPRESS_URL"
echo ""

if [ "$NEXTJS_URL" == "$EXPRESS_URL" ]; then
    echo -e "   ${GREEN}✅ URLs are SAME${NC}"
else
    echo -e "   ${RED}❌ URLs are DIFFERENT${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 4. Request Body Fields
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}4️⃣  Request Body Fields${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Next.js:"
grep -A 6 "const requestBody = {" "$NEXTJS_FILE" 2>/dev/null | grep -E "(text|data|speaker|checksum|filePath|base64)" | sed 's/^/   /'
echo ""

echo "Express.js:"
sed -n '/await axios.post(ttsUrl, {/,/}, {/p' "$EXPRESS_FILE" 2>/dev/null | grep -E "(text|data|speaker|checksum|filePath|base64)" | sed 's/^/   /'
echo ""

# ═══════════════════════════════════════════════════════════════
# 5. Audio Proxy
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${CYAN}5️⃣  Audio Proxy URLs${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Next.js:"
grep -oP "audioUrl\s*=\s*\`[^\`]+\`" "$NEXTJS_FILE" 2>/dev/null | head -1 | sed 's/^/   /'
echo ""

echo "Express.js:"
grep -oP "proxyUrl\s*=\s*\`[^\`]+\`" "$EXPRESS_FILE" 2>/dev/null | head -1 | sed 's/^/   /'
echo ""

# ═══════════════════════════════════════════════════════════════
# 6. Summary
# ═══════════════════════════════════════════════════════════════

echo ""
echo -e "${YELLOW}📊 خلاصه${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if implementations match
MATCH_COUNT=0

# Check URL
if [ "$NEXTJS_URL" == "$EXPRESS_URL" ]; then
    MATCH_COUNT=$((MATCH_COUNT + 1))
    echo -e "✅ TTS API URL: ${GREEN}MATCH${NC}"
else
    echo -e "❌ TTS API URL: ${RED}DIFFERENT${NC}"
fi

# Check if both use 'text' field
NEXTJS_TEXT=$(grep -c '"text":' "$NEXTJS_FILE" 2>/dev/null || echo 0)
EXPRESS_TEXT=$(grep -c 'text:' "$EXPRESS_FILE" 2>/dev/null || echo 0)

if [ "$NEXTJS_TEXT" -gt 0 ] && [ "$EXPRESS_TEXT" -gt 0 ]; then
    MATCH_COUNT=$((MATCH_COUNT + 1))
    echo -e "✅ Request Body: ${GREEN}MATCH (both use 'text')${NC}"
else
    echo -e "❌ Request Body: ${RED}DIFFERENT${NC}"
fi

# Check if both use User-Agent
NEXTJS_UA=$(grep -c "'User-Agent'" "$NEXTJS_FILE" 2>/dev/null || echo 0)
EXPRESS_UA=$(grep -c "'User-Agent'" "$EXPRESS_FILE" 2>/dev/null || echo 0)

if [ "$NEXTJS_UA" -gt 0 ] && [ "$EXPRESS_UA" -gt 0 ]; then
    MATCH_COUNT=$((MATCH_COUNT + 1))
    echo -e "✅ Headers: ${GREEN}MATCH (both use User-Agent)${NC}"
else
    echo -e "⚠️  Headers: ${YELLOW}MAY DIFFER${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ "$MATCH_COUNT" -ge 2 ]; then
    echo -e "${GREEN}✅ Implementations are ALIGNED${NC}"
    echo ""
    echo "Next.js و Express.js از همان API و ساختار استفاده می‌کنند."
else
    echo -e "${RED}❌ Implementations are DIFFERENT${NC}"
    echo ""
    echo "Next.js و Express.js از API یا ساختار متفاوتی استفاده می‌کنند."
fi

echo ""
echo "💡 توصیه:"
echo "   • از Next.js API Routes استفاده کنید (در حال استفاده)"
echo "   • Express.js را می‌توانید حذف کنید (Legacy)"
echo ""