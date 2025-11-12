#!/bin/bash

echo "🔍 بررسی syntax اسکریپت deploy-server.sh..."
echo ""

# شمارش if و fi
IF_COUNT=$(grep -c "^\s*if \[" deploy-server.sh || echo "0")
FI_COUNT=$(grep -c "^\s*fi\s*$" deploy-server.sh || echo "0")

echo "📊 آمار:"
echo "   if statements: $IF_COUNT"
echo "   fi statements: $FI_COUNT"
echo ""

if [ "$IF_COUNT" -eq "$FI_COUNT" ]; then
    echo "✅ تعداد if و fi برابر است"
else
    echo "❌ تعداد if و fi برابر نیست!"
    echo "   اختلاف: $((IF_COUNT - FI_COUNT))"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 تست syntax با bash..."
echo ""

# تست syntax
if bash -n deploy-server.sh 2>&1; then
    echo ""
    echo "✅ Syntax صحیح است!"
    exit 0
else
    echo ""
    echo "❌ خطای syntax وجود دارد!"
    exit 1
fi
