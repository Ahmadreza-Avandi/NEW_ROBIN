#!/bin/sh
# Docker Entrypoint Script - Fix permissions at runtime

echo "🔧 Checking upload directories permissions..."

# Create directories if they don't exist
mkdir -p /app/uploads/documents /app/uploads/avatars /app/uploads/chat /app/uploads/temp /app/uploads/products
mkdir -p /app/public/uploads/documents /app/public/uploads/avatars /app/public/uploads/chat /app/public/uploads/products

# Try to fix permissions (will work if running as root or if directories are writable)
chmod -R 777 /app/uploads 2>/dev/null || echo "⚠️ Cannot change uploads permissions (expected if not root)"
chmod -R 777 /app/public/uploads 2>/dev/null || echo "⚠️ Cannot change public/uploads permissions (expected if not root)"

# Test write access
if touch /app/public/uploads/products/.write-test 2>/dev/null; then
    rm -f /app/public/uploads/products/.write-test
    echo "✅ Upload directories are writable"
else
    echo "❌ WARNING: Upload directories may not be writable!"
    echo "   Please ensure host directories have correct permissions:"
    echo "   chmod -R 777 uploads public/uploads"
fi

echo "🚀 Starting Next.js server..."
exec node server.js
