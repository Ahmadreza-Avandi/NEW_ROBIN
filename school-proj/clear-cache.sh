#!/bin/bash

echo "🧹 Clearing Next.js cache..."

cd next

# پاک کردن کش Next.js
if [ -d ".next" ]; then
  rm -rf .next
  echo "✅ .next folder removed"
fi

if [ -d "node_modules/.cache" ]; then
  rm -rf node_modules/.cache
  echo "✅ node_modules/.cache removed"
fi

echo ""
echo "✅ Cache cleared successfully!"
echo ""
echo "Now restart the server with: npm run dev"
