#!/bin/bash

# اسکریپت رفع مشکل docker-compose
echo "🔧 رفع مشکل docker-compose..."

# بررسی نسخه docker-compose
if command -v docker-compose >/dev/null 2>&1; then
    echo "✅ docker-compose موجود است"
    docker-compose --version
else
    echo "❌ docker-compose یافت نشد - نصب..."
    
    # نصب docker-compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    # ایجاد symlink
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    echo "✅ docker-compose نصب شد"
    docker-compose --version
fi

# تست docker-compose
echo "🧪 تست docker-compose..."
if docker-compose --version >/dev/null 2>&1; then
    echo "✅ docker-compose کار می‌کند"
else
    echo "❌ docker-compose کار نمی‌کند"
    
    # تلاش برای استفاده از docker compose plugin
    if docker compose version >/dev/null 2>&1; then
        echo "✅ docker compose plugin موجود است"
        echo "🔧 ایجاد alias برای docker-compose..."
        
        # ایجاد wrapper script
        cat > /usr/local/bin/docker-compose << 'EOF'
#!/bin/bash
docker compose "$@"
EOF
        chmod +x /usr/local/bin/docker-compose
        
        echo "✅ wrapper script ایجاد شد"
    else
        echo "❌ هیچ نسخه‌ای از docker compose کار نمی‌کند"
        exit 1
    fi
fi

echo "✅ مشکل docker-compose برطرف شد"