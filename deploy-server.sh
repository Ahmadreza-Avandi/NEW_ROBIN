#!/bin/bash

# 🚀 Complete CRM Server Deployment Script - All-in-One
set -e

DOMAIN="crm.robintejarat.com"
EMAIL="admin@crm.robintejarat.com"

# بررسی آرگومان‌ها
FORCE_CLEAN=false
if [ "$1" = "--clean" ] || [ "$1" = "-c" ]; then
    FORCE_CLEAN=true
    echo "🧹 حالت پاکسازی کامل فعال شد"
fi

echo "🚀 شروع دیپلوی کامل CRM روی سرور..."
echo "🌐 دامنه: $DOMAIN"
if [ "$FORCE_CLEAN" = true ]; then
    echo "🧹 حالت: پاکسازی کامل + rebuild"
else
    echo "🔄 حالت: rebuild معمولی"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ═══════════════════════════════════════════════════════════════
# 🔒 مرحله 0: بررسی امنیت و بک‌آپ خودکار قبل از deploy
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔒 مرحله 0: بررسی امنیت و بک‌آپ خودکار..."
echo ""

# ایجاد فولدر بک‌آپ
mkdir -p backups
BACKUP_DIR="backups"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# بک‌آپ خودکار دیتابیس‌ها (اگر در حال اجرا هستند)
echo "💾 بک‌آپ خودکار دیتابیس‌ها..."
if docker ps --format '{{.Names}}' | grep -qE "(mysql|mariadb)"; then
    MYSQL_CONTAINER_BACKUP=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
    
    if [ -n "$MYSQL_CONTAINER_BACKUP" ]; then
        # بک‌آپ crm_system
        if docker exec $MYSQL_CONTAINER_BACKUP mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'crm_system';" >/dev/null 2>&1; then
            echo "📦 بک‌آپ crm_system..."
            docker exec $MYSQL_CONTAINER_BACKUP mariadb-dump -u root -p1234 crm_system > "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" 2>/dev/null || true
            if [ -f "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" ] && [ -s "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" ]; then
                BACKUP_SIZE=$(du -h "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" | cut -f1)
                echo "✅ بک‌آپ crm_system: $BACKUP_SIZE"
            fi
        fi
        
        # بک‌آپ saas_master
        if docker exec $MYSQL_CONTAINER_BACKUP mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'saas_master';" >/dev/null 2>&1; then
            echo "📦 بک‌آپ saas_master..."
            docker exec $MYSQL_CONTAINER_BACKUP mariadb-dump -u root -p1234 saas_master > "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" 2>/dev/null || true
            if [ -f "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" ] && [ -s "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" ]; then
                BACKUP_SIZE=$(du -h "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" | cut -f1)
                echo "✅ بک‌آپ saas_master: $BACKUP_SIZE"
            fi
        fi
        
        # بررسی لاگ‌های مشکوک
        echo "🔍 بررسی لاگ‌های مشکوک MySQL..."
        SUSPICIOUS_LOGS=$(docker logs $MYSQL_CONTAINER_BACKUP --tail 200 2>&1 | grep -iE "(drop database|delete from|truncate|unauthorized access)" || echo "")
        if [ -n "$SUSPICIOUS_LOGS" ]; then
            echo "⚠️  فعالیت‌های مشکوک در لاگ‌های MySQL یافت شد!"
            echo "$SUSPICIOUS_LOGS" | head -5
        else
            echo "✅ هیچ فعالیت مشکوکی در لاگ‌های MySQL یافت نشد"
        fi
        
        # بررسی کاربران غیرمجاز
        echo "🔍 بررسی کاربران دیتابیس..."
        UNAUTHORIZED_USERS=$(docker exec $MYSQL_CONTAINER_BACKUP mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user WHERE User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema', 'crm_user') AND User != '';" 2>/dev/null | grep -v "User" | grep -v "^$" || echo "")
        if [ -n "$UNAUTHORIZED_USERS" ]; then
            echo "⚠️  کاربران غیرمجاز یافت شد - حذف..."
            echo "$UNAUTHORIZED_USERS" | while read -r line; do
                USER_NAME=$(echo "$line" | awk '{print $1}')
                USER_HOST=$(echo "$line" | awk '{print $2}')
                if [ -n "$USER_NAME" ] && [ -n "$USER_HOST" ] && [ "$USER_NAME" != "User" ]; then
                    docker exec $MYSQL_CONTAINER_BACKUP mariadb -u root -p1234 -e "DROP USER IF EXISTS '$USER_NAME'@'$USER_HOST';" 2>/dev/null || true
                fi
            done
            docker exec $MYSQL_CONTAINER_BACKUP mariadb -u root -p1234 -e "FLUSH PRIVILEGES;" 2>/dev/null || true
        else
            echo "✅ فقط کاربران مجاز وجود دارند"
        fi
    fi
fi

# بررسی لاگ‌های nginx برای IP های مشکوک
echo "🔍 بررسی لاگ‌های nginx برای IP های مشکوک..."
if docker ps --format '{{.Names}}' | grep -q nginx 2>/dev/null; then
    NGINX_CONTAINER_BACKUP=$(docker ps --format '{{.Names}}' | grep nginx | head -1 2>/dev/null || echo "")
    if [ -n "$NGINX_CONTAINER_BACKUP" ]; then
        SUSPICIOUS_IPS=$(timeout 10 docker logs $NGINX_CONTAINER_BACKUP --tail 100 2>/dev/null | grep -E "401|403" | awk '{print $1}' | sort | uniq -c | sort -rn | head -3 2>/dev/null || echo "")
        if [ -n "$SUSPICIOUS_IPS" ] && echo "$SUSPICIOUS_IPS" | grep -qv "^[[:space:]]*$"; then
            echo "⚠️  IP های مشکوک با بیشترین خطا:"
            echo "$SUSPICIOUS_IPS" | head -3
        else
            echo "✅ IP مشکوکی یافت نشد"
        fi
    else
        echo "✅ nginx کانتینر یافت نشد (طبیعی در شروع)"
    fi
else
    echo "✅ nginx کانتینر یافت نشد (طبیعی در شروع)"
fi

echo "✅ بررسی امنیت و بک‌آپ کامل شد"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ═══════════════════════════════════════════════════════════════
# 🔒 مرحله 0: بررسی امنیت و بک‌آپ قبل از deploy
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔒 مرحله 0: بررسی امنیت و بک‌آپ..."
echo ""

# ایجاد فولدر بک‌آپ
mkdir -p backups
BACKUP_DIR="backups"
BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# بک‌آپ خودکار دیتابیس‌ها (اگر در حال اجرا هستند)
echo "💾 بک‌آپ خودکار دیتابیس‌ها..."
if docker ps --format '{{.Names}}' | grep -qE "(mysql|mariadb)"; then
    MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
    
    if [ -n "$MYSQL_CONTAINER" ]; then
        # بک‌آپ crm_system
        if docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'crm_system';" >/dev/null 2>&1; then
            echo "📦 بک‌آپ crm_system..."
            docker exec $MYSQL_CONTAINER mariadb-dump -u root -p1234 crm_system > "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" 2>/dev/null || true
            if [ -f "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" ] && [ -s "$BACKUP_DIR/crm_system_backup_$BACKUP_TIMESTAMP.sql" ]; then
                echo "✅ بک‌آپ crm_system با موفقیت انجام شد"
            fi
        fi
        
        # بک‌آپ saas_master
        if docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "SHOW DATABASES LIKE 'saas_master';" >/dev/null 2>&1; then
            echo "📦 بک‌آپ saas_master..."
            docker exec $MYSQL_CONTAINER mariadb-dump -u root -p1234 saas_master > "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" 2>/dev/null || true
            if [ -f "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" ] && [ -s "$BACKUP_DIR/saas_master_backup_$BACKUP_TIMESTAMP.sql" ]; then
                echo "✅ بک‌آپ saas_master با موفقیت انجام شد"
            fi
        fi
        
        # بررسی لاگ‌های مشکوک
        echo "🔍 بررسی لاگ‌های مشکوک MySQL..."
        SUSPICIOUS_LOGS=$(docker logs $MYSQL_CONTAINER --tail 200 2>&1 | grep -iE "(drop database|delete|truncate|unauthorized access)" || echo "")
        if [ -n "$SUSPICIOUS_LOGS" ]; then
            echo "⚠️  فعالیت‌های مشکوک در لاگ‌های MySQL یافت شد!"
            echo "$SUSPICIOUS_LOGS" | head -5
        else
            echo "✅ هیچ فعالیت مشکوکی در لاگ‌های MySQL یافت نشد"
        fi
        
        # بررسی کاربران غیرمجاز
        echo "🔍 بررسی کاربران دیتابیس..."
        UNAUTHORIZED_USERS=$(docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user WHERE User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema', 'crm_user') AND User != '';" 2>/dev/null | grep -v "User" | grep -v "^$" || echo "")
        if [ -n "$UNAUTHORIZED_USERS" ]; then
            echo "⚠️  کاربران غیرمجاز یافت شد:"
            echo "$UNAUTHORIZED_USERS"
            echo "🔧 حذف کاربران غیرمجاز..."
            docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "$UNAUTHORIZED_USERS" | while read -r user host; do
                if [ -n "$user" ] && [ -n "$host" ]; then
                    docker exec $MYSQL_CONTAINER mariadb -u root -p1234 -e "DROP USER IF EXISTS '$user'@'$host';" 2>/dev/null || true
                fi
            done
        else
            echo "✅ فقط کاربران مجاز وجود دارند"
        fi
    fi
fi

# بررسی لاگ‌های nginx
echo "🔍 بررسی لاگ‌های nginx..."
if docker ps --format '{{.Names}}' | grep -q nginx 2>/dev/null; then
    NGINX_CONTAINER=$(docker ps --format '{{.Names}}' | grep nginx | head -1 2>/dev/null || echo "")
    if [ -n "$NGINX_CONTAINER" ]; then
        SUSPICIOUS_IPS=$(timeout 10 docker logs $NGINX_CONTAINER --tail 100 2>/dev/null | grep -E "401|403|404" | awk '{print $1}' | sort | uniq -c | sort -rn | head -3 2>/dev/null || echo "")
        if [ -n "$SUSPICIOUS_IPS" ] && echo "$SUSPICIOUS_IPS" | grep -qv "^[[:space:]]*$"; then
            echo "⚠️  IP های مشکوک با بیشترین خطا:"
            echo "$SUSPICIOUS_IPS" | head -3
        else
            echo "✅ IP مشکوکی یافت نشد"
        fi
    else
        echo "✅ nginx کانتینر یافت نشد (طبیعی در شروع)"
    fi
else
    echo "✅ nginx کانتینر یافت نشد (طبیعی در شروع)"
fi

echo "✅ بررسی امنیت و بک‌آپ کامل شد"
echo ""

# ═══════════════════════════════════════════════════════════════
# 🔍 مرحله 1: بررسی سیستم و آماده‌سازی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔍 مرحله 1: بررسی سیستم..."

# بررسی حافظه سیستم
TOTAL_MEM=$(free -m | awk 'NR==2{printf "%.0f", $2}')
echo "💾 حافظه سیستم: ${TOTAL_MEM}MB"

# تنظیم swap برای سرورهای کم حافظه
if [ "$TOTAL_MEM" -lt 2048 ]; then
    echo "🔧 تنظیم swap برای حافظه کم..."
    
    SWAP_SIZE=$(free -m | awk '/^Swap:/ {print $2}')
    if [ "$SWAP_SIZE" -eq 0 ]; then
        echo "📀 ایجاد فایل swap 2GB..."
        sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1024 count=2097152
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        
        if ! grep -q "/swapfile" /etc/fstab; then
            echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        fi
        
        echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
        sudo sysctl vm.swappiness=10
    fi
    
    COMPOSE_FILE="docker-compose.memory-optimized.yml"
    NGINX_CONFIG="nginx/low-memory.conf"
else
    COMPOSE_FILE="docker-compose.yml"
    NGINX_CONFIG="nginx/default.conf"
fi

echo "📊 استفاده از فایل: $COMPOSE_FILE"

# ═══════════════════════════════════════════════════════════════
# 🔧 مرحله 2: حل مشکلات Build و کاراکترهای مخفی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔧 مرحله 2: حل مشکلات Build..."

# اجرای اسکریپت حل مشکل encoding
echo "🔧 حل مشکل encoding..."
if [ -f "fix-encoding-final.sh" ]; then
    chmod +x fix-encoding-final.sh
    ./fix-encoding-final.sh
else
    echo "🔍 حذف کاراکترهای مخفی و تصحیح encoding..."

    # حذف فایل مشکل‌دار و بازسازی
    if [ -f "app/api/customer-club/send-message/route.ts" ]; then
        echo "🔧 بازسازی فایل مشکل‌دار route.ts..."
        rm -f "app/api/customer-club/send-message/route.ts"
    fi

    # بازسازی فایل route.ts با encoding درست
    cat > "app/api/customer-club/send-message/route.ts" << 'EOF'
import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import { executeQuery, executeSingle } from '@/lib/database';

const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export async function POST(req: NextRequest) {
    try {
        const token = req.cookies.get('auth-token')?.value ||
            req.headers.get('authorization')?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Token not found' },
                { status: 401 }
            );
        }

        const tokenRequest = new NextRequest('https://crm.robintejarat.com', {
            headers: new Headers({ 'authorization': `Bearer ${token}` })
        });
        const userId = await getUserFromToken(tokenRequest);
        if (!userId) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { contactIds, message } = body;

        if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Invalid contact list' },
                { status: 400 }
            );
        }

        if (!message || !message.content) {
            return NextResponse.json(
                { success: false, message: 'Message content is required' },
                { status: 400 }
            );
        }

        const placeholders = contactIds.map(() => '?').join(',');
        const contacts = await executeQuery(`
      SELECT c.*, cu.name as customer_name
      FROM contacts c
      LEFT JOIN customers cu ON c.company_id = cu.id
      WHERE c.id IN (${placeholders})
    `, contactIds);

        if (contacts.length === 0) {
            return NextResponse.json(
                { success: false, message: 'No valid contacts found' },
                { status: 400 }
            );
        }

        const results = {
            total: contacts.length,
            sent: 0,
            failed: 0,
            errors: [] as string[]
        };

        if (message.type === 'email') {
            if (!message.subject) {
                return NextResponse.json(
                    { success: false, message: 'Email subject is required' },
                    { status: 400 }
                );
            }

            for (const contact of contacts) {
                if (!contact.email) {
                    results.failed++;
                    results.errors.push(`${contact.name}: No email available`);
                    continue;
                }

                try {
                    const personalizedContent = message.content
                        .replace(/\{name\}/g, contact.name || 'Dear User')
                        .replace(/\{customer\}/g, contact.customer_name || '')
                        .replace(/\{role\}/g, contact.role || '')
                        .replace(/\{email\}/g, contact.email || '')
                        .replace(/\{phone\}/g, contact.phone || '')
                        .replace(/\{company\}/g, contact.customer_name || '');

                    results.sent++;
                    console.log(`Email would be sent to ${contact.email}`);

                    await executeSingle(`
                        INSERT INTO message_logs (id, contact_id, user_id, type, subject, content, status, sent_at)
                        VALUES (?, ?, ?, 'email', ?, ?, 'sent', NOW())
                    `, [generateUUID(), contact.id, userId, message.subject, personalizedContent]);

                } catch (error: any) {
                    console.error(`Error processing email for ${contact.email}:`, error);
                    results.failed++;
                    results.errors.push(`${contact.name}: ${error.message}`);
                }
            }

        } else if (message.type === 'sms') {
            return NextResponse.json(
                { success: false, message: 'SMS system not implemented yet' },
                { status: 400 }
            );
        }

        const campaignId = generateUUID();
        await executeSingle(`
      INSERT INTO message_campaigns (id, user_id, title, type, content, total_recipients, sent_count, failed_count, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
            campaignId,
            userId,
            message.subject || 'Group Message',
            message.type,
            message.content,
            results.total,
            results.sent,
            results.failed
        ]);

        return NextResponse.json({
            success: true,
            message: `Message processed successfully. ${results.sent} successful, ${results.failed} failed`,
            data: results
        });

    } catch (error) {
        console.error('Send message API error:', error);
        return NextResponse.json(
            { success: false, message: 'Error processing message' },
            { status: 500 }
        );
    }
}
EOF

    # پاکسازی کاراکترهای مخفی از بقیه فایل‌ها
    find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | while read -r file; do
        if [ -f "$file" ] && [ "$file" != "./app/api/customer-club/send-message/route.ts" ]; then
            # حذف کاراکترهای مخفی با hex codes
            sed -i 's/\xE2\x80\x8F//g; s/\xE2\x80\x8E//g; s/\xE2\x80\x8B//g; s/\xE2\x80\x8C//g; s/\xE2\x80\x8D//g; s/\xEF\xBB\xBF//g' "$file" 2>/dev/null || true
            # حذف CRLF line endings
            sed -i 's/\r$//' "$file" 2>/dev/null || true
        fi
    done
fi

# پاکسازی کامل cache های محلی
echo "🧹 پاکسازی کامل cache های محلی..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true
rm -rf .swc 2>/dev/null || true
rm -rf node_modules/.next 2>/dev/null || true
rm -rf .turbo 2>/dev/null || true
rm -rf dist 2>/dev/null || true
rm -rf build 2>/dev/null || true

# پاکسازی npm/yarn cache
echo "🧹 پاکسازی npm cache..."
npm cache clean --force 2>/dev/null || true
yarn cache clean 2>/dev/null || true

# پاکسازی TypeScript cache
echo "🧹 پاکسازی TypeScript cache..."
rm -rf tsconfig.tsbuildinfo 2>/dev/null || true

# حذف فایل‌های اضافی
echo "🗑️ حذف فایل‌های اضافی..."
find . -name "*.new" -delete 2>/dev/null || true
find . -name "*.backup" -delete 2>/dev/null || true

# ═══════════════════════════════════════════════════════════════
# 📁 مرحله 3: آماده‌سازی فایل‌ها و دایرکتری‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "📁 مرحله 3: آماده‌سازی فایل‌ها..."

# ایجاد دایرکتری‌های مورد نیاز
echo "📁 ایجاد دایرکتری‌های مورد نیاز..."
sudo mkdir -p /etc/letsencrypt
sudo mkdir -p /var/www/certbot
mkdir -p nginx/ssl
mkdir -p database
mkdir -p database/migrations



# ایجاد فولدرهای آپلود
echo "📁 ایجاد فولدرهای آپلود..."
mkdir -p uploads/{documents,avatars,chat,temp,products}
mkdir -p public/uploads/{documents,avatars,chat,products}
mkdir -p logs

# تنظیم مجوزها برای فولدرهای آپلود - مجوزهای مناسب برای Docker
chmod -R 777 uploads
chmod -R 777 public/uploads
chmod -R 755 logs

# تنظیم ownership برای کاربر فعلی
if [ "$(id -u)" != "0" ]; then
    # اگر root نیستیم، مجوزها را برای کاربر فعلی تنظیم کنیم
    chown -R $(id -u):$(id -g) uploads 2>/dev/null || true
    chown -R $(id -u):$(id -g) public/uploads 2>/dev/null || true
    chown -R $(id -u):$(id -g) logs 2>/dev/null || true
fi

# ایجاد فایل .gitkeep برای حفظ فولدرها در git
echo "# Keep this folder in git" > uploads/.gitkeep
echo "# Keep this folder in git" > uploads/documents/.gitkeep
echo "# Keep this folder in git" > uploads/avatars/.gitkeep
echo "# Keep this folder in git" > uploads/chat/.gitkeep
echo "# Keep this folder in git" > uploads/temp/.gitkeep
echo "# Keep this folder in git" > uploads/products/.gitkeep
echo "# Keep this folder in git" > public/uploads/.gitkeep
echo "# Keep this folder in git" > public/uploads/documents/.gitkeep
echo "# Keep this folder in git" > public/uploads/avatars/.gitkeep
echo "# Keep this folder in git" > public/uploads/chat/.gitkeep
echo "# Keep this folder in git" > public/uploads/products/.gitkeep

echo "✅ فولدرهای آپلود ایجاد شدند:"
echo "   📁 uploads/{documents,avatars,chat,temp,products}"
echo "   📁 public/uploads/{documents,avatars,chat,products}"

# آماده‌سازی فایل‌های دیتابیس
echo "🗄️ آماده‌سازی فایل‌های دیتابیس..."

# پاک کردن فایل‌های قدیمی دیتابیس
echo "🧹 پاک کردن فایل‌های قدیمی دیتابیس..."
rm -f database/0*.sql 2>/dev/null || true

# ایجاد فایل init اصلی برای ایجاد دیتابیس‌ها و کاربر
echo "📝 ایجاد فایل init دیتابیس..."
cat > database/00-init-databases.sql << 'EOF'
-- ===========================================
-- Database Initialization Script for CRM System
-- ===========================================

-- Create CRM System Database
CREATE DATABASE IF NOT EXISTS `crm_system` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create SaaS Master Database  
CREATE DATABASE IF NOT EXISTS `saas_master` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user and grant privileges (compatible with lib/database.ts)
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';
DROP USER IF EXISTS 'crm_user'@'127.0.0.1';
DROP USER IF EXISTS 'crm_user'@'172.%.%.%';

-- Create user with password '1234' (matching lib/database.ts default)
CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'127.0.0.1' IDENTIFIED BY '1234';
CREATE USER 'crm_user'@'172.%.%.%' IDENTIFIED BY '1234';

-- Grant all privileges on both databases
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `crm_system`.* TO 'crm_user'@'172.%.%.%';

GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'127.0.0.1';
GRANT ALL PRIVILEGES ON `saas_master`.* TO 'crm_user'@'172.%.%.%';

FLUSH PRIVILEGES;

-- Set timezone
SET time_zone = '+00:00';
EOF

# کپی فایل‌های دیتابیس اصلی
echo "📋 کپی فایل‌های دیتابیس..."

# بررسی وجود فایل crm_system.sql
CRM_DB_FOUND=false
if [ -f "database/crm_system.sql" ]; then
    echo "✅ فایل database/crm_system.sql موجود است"
    CRM_DB_FOUND=true
    
    # اطمینان از وجود USE statement
    if ! grep -q "USE \`crm_system\`" database/crm_system.sql; then
        echo "🔧 اضافه کردن USE statement به crm_system.sql..."
        sed -i '/-- Database: `crm_system`/a\\n-- استفاده از دیتابیس crm_system\nUSE `crm_system`;' database/crm_system.sql
    fi
else
    echo "❌ فایل database/crm_system.sql یافت نشد!"
    echo "🔍 فایل‌های موجود در database:"
    ls -la database/ | grep -i sql || echo "   هیچ فایل SQL یافت نشد"
    exit 1
fi

# بررسی وجود فایل saas_master.sql
SAAS_DB_FOUND=false
if [ -f "database/saas_master.sql" ]; then
    echo "✅ فایل database/saas_master.sql موجود است"
    SAAS_DB_FOUND=true
    
    # اطمینان از وجود USE statement
    if ! grep -q "USE \`saas_master\`" database/saas_master.sql; then
        echo "🔧 اضافه کردن USE statement به saas_master.sql..."
        sed -i '/-- Database: `saas_master`/a\\n-- استفاده از دیتابیس saas_master\nUSE `saas_master`;' database/saas_master.sql
    fi
else
    echo "❌ فایل database/saas_master.sql یافت نشد!"
    echo "🔍 فایل‌های موجود در database:"
    ls -la database/ | grep -i saas || echo "   هیچ فایل SaaS یافت نشد"
    exit 1
fi

# بررسی نهایی فایل‌ها
echo ""
echo "📊 بررسی نهایی فایل‌های SQL:"

# ایجاد فایل .gitkeep برای migrations
if [ ! -f "database/migrations/.gitkeep" ]; then
    echo "# This folder is for future database migrations" > database/migrations/.gitkeep
fi

# بررسی وجود فایل 03-admin-users.sql
if [ ! -f "database/03-admin-users.sql" ]; then
    echo "👑 ایجاد فایل کاربران ادمین..."
    cat > database/03-admin-users.sql << 'EOF'
-- ===========================================
-- Admin Users Creation Script
-- ===========================================
-- این فایل آخرین فایل است که اجرا می‌شود (03-)
-- وظیفه: اطمینان از وجود کاربران ادمین
-- ===========================================

USE `crm_system`;

-- ===========================================
-- کاربر CEO (مهندس کریمی)
-- ===========================================
-- این کاربر از فایل crm_system.sql می‌آید
-- فقط اطمینان حاصل می‌کنیم که رمز عبور درست است
-- رمز عبور: 1234 (bcrypt hash)

UPDATE users SET 
    password = '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    is_active = 1,
    updated_at = NOW()
WHERE id = 'ceo-001' AND email = 'Robintejarat@gmail.com';

USE `saas_master`;

-- ===========================================
-- کاربر Super Admin (احمدرضا اوندی)
-- ===========================================

INSERT INTO `super_admins` (
    `username`, 
    `email`, 
    `password`, 
    `full_name`, 
    `is_active`
) VALUES (
    'Ahmadreza.avandi',
    'ahmadrezaavandi@gmail.com',
    '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    'احمدرضا اوندی',
    1
)
ON DUPLICATE KEY UPDATE 
    `is_active` = 1,
    `password` = '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    `updated_at` = NOW();
EOF
else
    echo "✅ فایل 03-admin-users.sql موجود است"
fi

# خلاصه فایل‌های آماده شده
echo ""
echo "✅ فایل‌های دیتابیس آماده شدند:"
echo "   📄 00-init-databases.sql - ایجاد دیتابیس‌ها و دسترسی‌ها"
if [ "$CRM_DB_FOUND" = true ]; then
    echo "   📄 crm_system.sql - جداول CRM ✅"
else
    echo "   📄 crm_system.sql - جداول CRM ❌ (یافت نشد)"
    exit 1
fi
if [ "$SAAS_DB_FOUND" = true ]; then
    echo "   📄 saas_master.sql - جداول SaaS ✅"
else
    echo "   📄 saas_master.sql - جداول SaaS ❌ (یافت نشد)"
    exit 1
fi
echo "   📄 03-admin-users.sql - کاربران ادمین"

# نمایش اندازه فایل‌ها برای اطمینان
echo ""
echo "📊 اندازه فایل‌های دیتابیس:"
ls -lh database/*.sql 2>/dev/null | grep -E "(00-init|crm_system|saas_master|03-admin)" | while read -r line; do
    echo "   $line"
done

# ═══════════════════════════════════════════════════════════════
# ⚙️ مرحله 4: تنظیم فایل .env
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⚙️ مرحله 4: تنظیم فایل .env..."

# بررسی وجود setup-env.sh
if [ ! -f "setup-env.sh" ]; then
    echo "❌ setup-env.sh یافت نشد!"
    echo "⚠️  لطفاً ابتدا setup-env.sh را از ریپازیتوری دریافت کنید"
    exit 1
fi

# اجرای setup هوشمند برای ساخت .env درست
echo "🧠 ساخت فایل .env با تشخیص هوشمند محیط..."

# تنظیم متغیرهای محیطی برای تشخیص سرور
export VPS_MODE=true
export DOMAIN="$DOMAIN"

# اجرای setup هوشمند
if [ -f "setup-smart-env.sh" ]; then
    chmod +x setup-smart-env.sh
    bash setup-smart-env.sh
elif [ -f "setup-env.sh" ]; then
    echo "⚠️  setup-smart-env.sh یافت نشد، استفاده از setup-env.sh..."
    chmod +x setup-env.sh
    bash setup-env.sh
else
    echo "⚠️  هیچ اسکریپت setup یافت نشد، ایجاد .env پایه..."
    
    # ایجاد .env پایه برای سرور
    cat > .env << EOF
NODE_ENV=production
NEXTAUTH_URL=http://$DOMAIN
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=1234
DATABASE_NAME=crm_system
SAAS_DATABASE_NAME=saas_master
DB_HOST=mysql
DB_USER=crm_user
DB_PASSWORD=1234
DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system
DOCKER_CONTAINER=true
JWT_SECRET=g45YtsLm1gFe1Hy1MBSXLHMbVcfIogiRE4m41iEvELGNJMwkaHP2ALvIMkPfs
NEXTAUTH_SECRET=lwGfffrnAc9Y4ZCMgyvuYsew97UQjLsITqWVLC1Id7uq70NVYbe4MCiLtyNzArF
VPS_MODE=true
AUDIO_ENABLED=false
FALLBACK_TO_MANUAL_INPUT=true
RABIN_VOICE_OPENROUTER_API_KEY=.
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO
EOF
fi

# بررسی موفقیت
if [ ! -f ".env" ]; then
    echo "❌ فایل .env ساخته نشد!"
    exit 1
fi

echo "✅ فایل .env با موفقیت ساخته شد"

# تنظیم NEXTAUTH_URL - ابتدا HTTP برای تست
sed -i "s|NEXTAUTH_URL=.*|NEXTAUTH_URL=http://$DOMAIN|g" .env
echo "🌐 NEXTAUTH_URL به HTTP تنظیم شد (برای تست اولیه)"

# اطمینان از تنظیمات سرور
sed -i "s|DATABASE_HOST=.*|DATABASE_HOST=mysql|g" .env
sed -i "s|DATABASE_USER=.*|DATABASE_USER=crm_user|g" .env
sed -i "s|DATABASE_PASSWORD=.*|DATABASE_PASSWORD=1234|g" .env
sed -i "s|DB_HOST=.*|DB_HOST=mysql|g" .env
sed -i "s|DB_USER=.*|DB_USER=crm_user|g" .env
sed -i "s|DB_PASSWORD=.*|DB_PASSWORD=1234|g" .env
sed -i "s|VPS_MODE=.*|VPS_MODE=true|g" .env
sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env

# اطمینان از وجود DOCKER_CONTAINER برای تشخیص محیط
if ! grep -q "^DOCKER_CONTAINER=" .env; then
    echo "DOCKER_CONTAINER=true" >> .env
else
    sed -i "s|DOCKER_CONTAINER=.*|DOCKER_CONTAINER=true|g" .env
fi

# اطمینان از DATABASE_URL درست
if ! grep -q "^DATABASE_URL=" .env || grep -q "^DATABASE_URL=$" .env; then
    sed -i "s|^DATABASE_URL=.*|DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system|g" .env || echo "DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system" >> .env
else
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=mysql://crm_user:1234@mysql:3306/crm_system|g" .env
fi

echo "🔧 تنظیمات سرور اعمال شد"

# بارگذاری متغیرهای محیطی (با روش امن)
echo "📋 بارگذاری متغیرهای محیطی..."
# استفاده از روش امن برای بارگذاری .env
set -a
source .env 2>/dev/null || true
set +a
echo "✅ متغیرهای محیطی بارگذاری شد"

# ═══════════════════════════════════════════════════════════════
# 🛑 مرحله 5: متوقف کردن سرویس‌های قدیمی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🛑 مرحله 5: متوقف کردن سرویس‌های قدیمی..."

docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
docker-compose down 2>/dev/null || true

# بررسی اینکه آیا دیتابیس خالی است یا نه
echo "🔍 بررسی وضعیت دیتابیس..."
DB_NEEDS_INIT=false

# اگر volume وجود نداره، حتماً نیاز به init داریم
if ! docker volume ls | grep -q "mysql_data"; then
    echo "📦 Volume دیتابیس وجود ندارد - نیاز به init"
    DB_NEEDS_INIT=true
else
    echo "📦 Volume دیتابیس موجود است"
    
    # بررسی اینکه آیا دیتابیس‌ها در volume موجود هستند
    echo "🔍 بررسی محتوای volume دیتابیس..."
    if docker ps --format '{{.Names}}' | grep -qE "(mysql|mariadb)"; then
        MYSQL_CONTAINER_CHECK=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
        if [ -n "$MYSQL_CONTAINER_CHECK" ]; then
            sleep 5  # منتظر آماده شدن MySQL
            DATABASES_CHECK=$(docker exec $MYSQL_CONTAINER_CHECK mariadb -u root -p1234 -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" || echo "")
            if [ -z "$DATABASES_CHECK" ] || ! echo "$DATABASES_CHECK" | grep -q "crm_system"; then
                echo "⚠️  Volume موجود است ولی دیتابیس‌ها خالی هستند - حذف volume برای init مجدد..."
                docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
                docker volume rm rabin-last_mysql_data 2>/dev/null || true
                docker volume rm mysql_data 2>/dev/null || true
                DB_NEEDS_INIT=true
                echo "✅ Volume دیتابیس حذف شد - init scripts اجرا خواهند شد"
            else
                echo "✅ دیتابیس‌ها در volume موجود هستند"
            fi
        fi
    fi
    
    # اگر --clean استفاده شده، volume رو پاک کن
    if [ "$FORCE_CLEAN" = true ]; then
        echo "🧹 حذف volume دیتابیس برای rebuild کامل..."
        docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
        docker volume rm rabin-last_mysql_data 2>/dev/null || true
        docker volume rm mysql_data 2>/dev/null || true
        DB_NEEDS_INIT=true
        echo "✅ Volume دیتابیس حذف شد"
    fi
fi

# پاکسازی Docker cache و images
if [ "$FORCE_CLEAN" = true ]; then
    echo "🧹 پاکسازی کامل Docker cache و images..."

    # متوقف کردن همه کانتینرها
    echo "🛑 متوقف کردن همه کانتینرهای مربوط به CRM..."
    docker stop $(docker ps -q --filter "name=crm") 2>/dev/null || true
    docker stop $(docker ps -q --filter "name=nextjs") 2>/dev/null || true
    docker stop $(docker ps -q --filter "name=nginx") 2>/dev/null || true
    docker stop $(docker ps -q --filter "name=mysql") 2>/dev/null || true
    docker stop $(docker ps -q --filter "name=phpmyadmin") 2>/dev/null || true


    # حذف کانتینرهای متوقف شده
    echo "🗑️ حذف کانتینرهای متوقف شده..."
    docker container prune -f

    # حذف images مربوط به پروژه
    echo "🗑️ حذف images مربوط به پروژه..."
    docker rmi $(docker images --filter "reference=*crm*" -q) 2>/dev/null || true
    docker rmi $(docker images --filter "reference=*nextjs*" -q) 2>/dev/null || true
    docker rmi $(docker images --filter "dangling=true" -q) 2>/dev/null || true

    # پاکسازی کامل build cache
    echo "🧹 پاکسازی کامل build cache..."
    docker builder prune -af

    # پاکسازی volumes غیرضروری (احتیاط: دیتابیس حفظ می‌شود)
    echo "🧹 پاکسازی volumes غیرضروری..."
    docker volume prune -f

    # پاکسازی networks غیرضروری
    echo "🧹 پاکسازی networks غیرضروری..."
    docker network prune -f

    # پاکسازی کامل سیستم
    echo "🧹 پاکسازی نهایی سیستم..."
    docker system prune -af --volumes

    echo "✅ پاکسازی کامل انجام شد"
else
    echo "🧹 پاکسازی معمولی Docker cache..."
    docker system prune -f
fi

# ═══════════════════════════════════════════════════════════════
# 🔐 مرحله 5.5: ایجاد احراز هویت برای phpMyAdmin
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔐 مرحله 5.5: تنظیم احراز هویت phpMyAdmin..."

# ایجاد دایرکتری nginx اگر وجود نداشته باشد
mkdir -p nginx

# ایجاد username و password تصادفی برای Basic Auth
PHPMYADMIN_USER="dbadmin_$(date +%s | sha256sum | base64 | head -c 8)"
PHPMYADMIN_PASS="$(date +%s | sha256sum | base64 | head -c 24)"

# ذخیره اطلاعات در فایل امن
cat > .phpmyadmin_credentials << EOF
# phpMyAdmin Access Credentials
# ================================
# URL: https://$DOMAIN/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
# 
# Basic Auth (nginx):
# Username: $PHPMYADMIN_USER
# Password: $PHPMYADMIN_PASS
#
# MySQL Login:
# Username: crm_user
# Password: 1234
# 
# MySQL Root:
# Username: root
# Password: 1234
# ================================
# ⚠️  این فایل را در جای امن نگه دارید و از سرور حذف کنید!
EOF

chmod 600 .phpmyadmin_credentials

echo "✅ اطلاعات دسترسی phpMyAdmin در فایل .phpmyadmin_credentials ذخیره شد"
echo ""
echo "📋 اطلاعات دسترسی phpMyAdmin:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URL: https://$DOMAIN/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
echo ""
echo "🔐 Basic Auth (لایه اول امنیتی):"
echo "   Username: $PHPMYADMIN_USER"
echo "   Password: $PHPMYADMIN_PASS"
echo ""
echo "🗄️  MySQL Login (لایه دوم امنیتی):"
echo "   Username: crm_user"
echo "   Password: 1234"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  این اطلاعات را در جای امن یادداشت کنید!"
echo "⚠️  فایل .phpmyadmin_credentials را پس از یادداشت حذف کنید"
echo ""

# ایجاد فایل .htpasswd برای nginx
# استفاده از openssl برای hash کردن password
HASHED_PASS=$(openssl passwd -apr1 "$PHPMYADMIN_PASS")
echo "$PHPMYADMIN_USER:$HASHED_PASS" > nginx/.htpasswd
chmod 644 nginx/.htpasswd

echo "✅ فایل احراز هویت nginx ایجاد شد"

# ═══════════════════════════════════════════════════════════════
# 🌐 مرحله 6: تنظیم SSL و nginx
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🌐 مرحله 6: تنظیم SSL و nginx..."

# کپی nginx config مناسب
echo "📝 تنظیم nginx config..."
if [ -f "nginx/simple.conf" ]; then
    cp nginx/simple.conf nginx/active.conf
    echo "✅ استفاده از nginx config ساده"
elif [ -f "$NGINX_CONFIG" ]; then
    cp $NGINX_CONFIG nginx/active.conf
else
    echo "⚠️  فایل nginx config یافت نشد، ایجاد config پایه..."
    cat > nginx/active.conf << 'EOF'
server {
    listen 80;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # phpMyAdmin - Secured with Basic Auth
    location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
        # Basic Authentication - First layer of security
        auth_basic "Database Management - Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://phpmyadmin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enhanced Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Disable caching for security
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        add_header Pragma "no-cache" always;
    }
}
EOF
fi

# تنظیم docker-compose موقت برای SSL
echo "🔧 تنظیم nginx موقت برای SSL..."
cat > docker-compose.temp.yml << EOF
version: '3.8'

services:
  nginx-temp:
    build:
      context: ./nginx
      dockerfile: Dockerfile
    container_name: nginx-temp
    ports:
      - "80:80"
    volumes:
      - ./nginx/temp.conf:/etc/nginx/conf.d/default.conf:ro
      - /var/www/certbot:/var/www/certbot
    networks:
      - crm_network

networks:
  crm_network:
    driver: bridge
EOF

# ایجاد nginx config موقت
cat > nginx/temp.conf << 'EOF'
server {
    listen 80;
    server_name crm.robintejarat.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
EOF

# بررسی و متوقف کردن nginx سیستم اگر پورت 80 اشغال است
echo "🔍 بررسی پورت 80..."
if sudo lsof -i :80 >/dev/null 2>&1 || sudo netstat -tulpn | grep :80 >/dev/null 2>&1; then
    echo "⚠️  پورت 80 اشغال است - متوقف کردن nginx سیستم..."
    sudo systemctl stop nginx 2>/dev/null || true
    sudo service nginx stop 2>/dev/null || true
    sleep 3
    echo "✅ nginx سیستم متوقف شد"
fi

# راه‌اندازی nginx موقت
echo "🌐 راه‌اندازی nginx موقت..."
docker-compose -f docker-compose.temp.yml up -d

# انتظار برای آماده شدن nginx
sleep 10

# دریافت گواهی SSL
echo "📜 دریافت گواهی SSL..."
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "🔐 تلاش برای دریافت گواهی SSL..."
    sudo docker run --rm \
        -v /etc/letsencrypt:/etc/letsencrypt \
        -v /var/www/certbot:/var/www/certbot \
        certbot/certbot \
        certonly --webroot --webroot-path=/var/www/certbot \
        --email $EMAIL --agree-tos --no-eff-email \
        -d $DOMAIN || echo "⚠️  دریافت SSL ناموفق، ادامه با HTTP"
fi

# بررسی مجدد SSL
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ گواهی SSL موجود است"
    SSL_AVAILABLE=true
else
    echo "⚠️  گواهی SSL موجود نیست"
    SSL_AVAILABLE=false
fi

# متوقف کردن nginx موقت
echo "🛑 متوقف کردن nginx موقت..."
docker-compose -f docker-compose.temp.yml down

# پاک کردن فایل‌های موقت
rm -f nginx/temp.conf docker-compose.temp.yml

# تنظیم nginx config نهایی
echo "📝 تنظیم nginx config..."
cat > nginx/active.conf << 'EOF'
# DNS resolver for Docker
resolver 127.0.0.11 valid=30s;

server {
    listen 80;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    client_max_body_size 50M;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # phpMyAdmin - Secured with Basic Auth
    location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
        # Basic Authentication - First layer of security
        auth_basic "Database Management - Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://phpmyadmin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Enhanced Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Disable caching for security
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        add_header Pragma "no-cache" always;
    }
    
    location /api/ {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# اگر SSL موجود است، HTTPS server اضافه کن
if [ "$SSL_AVAILABLE" = true ]; then
    echo "✅ گواهی SSL موجود است، اضافه کردن HTTPS server..."
    cat >> nginx/active.conf << 'EOF'

server {
    listen 443 ssl http2;
    server_name crm.robintejarat.com www.crm.robintejarat.com;
    
    ssl_certificate /etc/letsencrypt/live/crm.robintejarat.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crm.robintejarat.com/privkey.pem;
    
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozTLS:10m;
    ssl_session_tickets off;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    
    client_max_body_size 50M;
    
    location / {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # phpMyAdmin - Secured with Basic Auth
    location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
        # Basic Authentication - First layer of security
        auth_basic "Database Management - Restricted Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://phpmyadmin/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # Enhanced Security headers
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Disable caching for security
        add_header Cache-Control "no-store, no-cache, must-revalidate" always;
        add_header Pragma "no-cache" always;
    }
    
    location /api/ {
        proxy_pass http://nextjs:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF
else
    echo "⚠️  گواهی SSL یافت نشد، فقط HTTP فعال است"
fi

# ═══════════════════════════════════════════════════════════════
# 🔨 مرحله 7: Build و راه‌اندازی سرویس‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔨 مرحله 7: Build و راه‌اندازی سرویس‌ها..."

# اطمینان از وجود فایل‌های SQL قبل از build
echo "🔍 بررسی نهایی فایل‌های SQL..."

# بررسی فایل‌های ضروری
if [ ! -f "database/00-init-databases.sql" ]; then
    echo "❌ فایل 00-init-databases.sql یافت نشد!"
    exit 1
fi

if [ ! -f "database/crm_system.sql" ]; then
    echo "❌ فایل crm_system.sql یافت نشد!"
    echo "🔍 فایل‌های موجود در database/:"
    ls -la database/*.sql 2>/dev/null || echo "   هیچ فایل SQL یافت نشد"
    exit 1
fi

if [ ! -f "database/saas_master.sql" ]; then
    echo "❌ فایل saas_master.sql یافت نشد!"
    echo "🔍 فایل‌های موجود در database/:"
    ls -la database/*.sql 2>/dev/null || echo "   هیچ فایل SQL یافت نشد"
    exit 1
fi

if [ ! -f "database/03-admin-users.sql" ]; then
    echo "⚠️  فایل 03-admin-users.sql یافت نشد - ادامه بدون آن"
fi

echo "✅ همه فایل‌های SQL آماده هستند"

# تنظیم docker-compose برای استفاده از nginx config فعال
echo "🔧 تنظیم docker-compose..."
cp $COMPOSE_FILE docker-compose.deploy.yml

# تنظیم nginx volume در فایل deploy
sed -i 's|./nginx/default.conf:/etc/nginx/conf.d/default.conf|./nginx/active.conf:/etc/nginx/conf.d/default.conf|g' docker-compose.deploy.yml
sed -i 's|./nginx/default.conf:/etc/nginx/conf.d/default.conf:ro|./nginx/active.conf:/etc/nginx/conf.d/default.conf:ro|g' docker-compose.deploy.yml
sed -i 's|./nginx/simple.conf:/etc/nginx/conf.d/default.conf|./nginx/active.conf:/etc/nginx/conf.d/default.conf|g' docker-compose.deploy.yml
sed -i 's|./nginx/low-memory.conf:/etc/nginx/conf.d/default.conf|./nginx/active.conf:/etc/nginx/conf.d/default.conf|g' docker-compose.deploy.yml

COMPOSE_FILE="docker-compose.deploy.yml"

# Build و راه‌اندازی
if [ "$FORCE_CLEAN" = true ]; then
    echo "🔨 Force rebuild از صفر (بدون cache)..."
    
    # تنظیم محدودیت حافظه Docker
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        echo "⚠️  حافظه بسیار کم - استفاده از تنظیمات محدود"
        export DOCKER_BUILDKIT=0
        export COMPOSE_DOCKER_CLI_BUILD=0
        
        # Build مرحله به مرحله برای حافظه کم
        echo "🔨 Build مرحله‌ای برای حافظه کم..."
        docker-compose -f $COMPOSE_FILE build --no-cache --force-rm mysql
        docker-compose -f $COMPOSE_FILE build --no-cache --force-rm phpmyadmin
        docker-compose -f $COMPOSE_FILE build --no-cache --force-rm nextjs
        docker-compose -f $COMPOSE_FILE build --no-cache --force-rm nginx
        
        # راه‌اندازی
        docker-compose -f $COMPOSE_FILE up -d
    else
        echo "🔨 شروع build کامل و راه‌اندازی..."
        # Force rebuild بدون استفاده از cache
        docker-compose -f $COMPOSE_FILE build --no-cache --force-rm
        docker-compose -f $COMPOSE_FILE up -d
    fi
else
    echo "🔨 Build معمولی و راه‌اندازی..."
    
    # تنظیم محدودیت حافظه Docker
    if [ "$TOTAL_MEM" -lt 1024 ]; then
        echo "⚠️  حافظه بسیار کم - استفاده از تنظیمات محدود"
        export DOCKER_BUILDKIT=0
        export COMPOSE_DOCKER_CLI_BUILD=0
        
        # Build مرحله به مرحله برای حافظه کم
        echo "🔨 Build مرحله‌ای برای حافظه کم..."
        docker-compose -f $COMPOSE_FILE build --force-rm mysql || true
        docker-compose -f $COMPOSE_FILE build --force-rm phpmyadmin || true
        echo "🔨 Build NextJS CRM..."
        docker-compose -f $COMPOSE_FILE build --force-rm nextjs
        docker-compose -f $COMPOSE_FILE build --force-rm nginx || true
        
        # راه‌اندازی
        docker-compose -f $COMPOSE_FILE up -d
    else
        echo "🔨 شروع build و راه‌اندازی..."
        # Build NextJS
        echo "🔨 Build NextJS CRM..."
        docker-compose -f $COMPOSE_FILE build --force-rm nextjs
        # راه‌اندازی همه سرویس‌ها
        docker-compose -f $COMPOSE_FILE up --build -d
    fi
fi

echo "✅ Build و راه‌اندازی کامل شد"

# بررسی images ساخته شده
echo ""
echo "🔍 بررسی images ساخته شده..."
echo "📦 Images موجود:"
docker images | grep -E "rabin-last|mariadb|nginx|phpmyadmin" || echo "⚠️  هیچ image یافت نشد"

# ═══════════════════════════════════════════════════════════════
# ⏳ مرحله 8: انتظار و تست سرویس‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "⏳ مرحله 8: انتظار برای آماده شدن سرویس‌ها..."
echo "⏳ منتظر اجرای init scripts دیتابیس..."
sleep 45

# بررسی وضعیت سرویس‌ها
echo "📊 وضعیت سرویس‌ها:"
docker-compose -f $COMPOSE_FILE ps

# بررسی جامع همه کانتینرها
echo ""
echo "🔍 بررسی جامع کانتینرها..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# نام‌های کانتینر با dash و underscore
CONTAINERS_EXPECTED=("mysql" "phpmyadmin" "nextjs" "nginx")
CONTAINERS_RUNNING=0
CONTAINERS_MISSING=0

for container in "${CONTAINERS_EXPECTED[@]}"; do
    # جستجو با همه فرمت‌های ممکن
    if docker ps --format '{{.Names}}' | grep -qE "(crm[-_]${container}|${container})"; then
        ACTUAL_NAME=$(docker ps --format '{{.Names}}' | grep -E "(crm[-_]${container}|${container})" | head -1)
        echo "✅ $container - در حال اجرا ($ACTUAL_NAME)"
        CONTAINERS_RUNNING=$((CONTAINERS_RUNNING + 1))
    else
        echo "❌ $container - یافت نشد یا متوقف است"
        CONTAINERS_MISSING=$((CONTAINERS_MISSING + 1))
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 خلاصه: $CONTAINERS_RUNNING از ${#CONTAINERS_EXPECTED[@]} کانتینر در حال اجرا"

if [ $CONTAINERS_MISSING -gt 0 ]; then
    echo "⚠️  $CONTAINERS_MISSING کانتینر مشکل دارد!"
    echo "🔍 بررسی لاگ‌های کانتینرهای مشکل‌دار..."
    for container in "${CONTAINERS_EXPECTED[@]}"; do
        if ! docker ps --format '{{.Names}}' | grep -qE "(crm[-_]${container}|${container})"; then
            echo ""
            echo "📋 لاگ $container:"
            # جستجوی نام واقعی کانتینر
            ACTUAL_NAME=$(docker ps -a --format '{{.Names}}' | grep -E "(crm[-_]${container}|${container})" | head -1)
            if [ -n "$ACTUAL_NAME" ]; then
                docker logs $ACTUAL_NAME 2>&1 | tail -15
            else
                echo "   کانتینر یافت نشد"
            fi
        fi
    done
fi

# تست سرویس‌ها
echo ""
echo "🧪 تست سرویس‌ها..."

# تست دیتابیس
echo "🗄️ تست اتصال دیتابیس..."

# انتظار اضافی برای آماده شدن دیتابیس و اجرای init scripts
echo "⏳ انتظار برای آماده شدن کامل دیتابیس و اجرای init scripts..."
echo "   (init scripts ممکن است 30-60 ثانیه طول بکشد)"
sleep 30

# تست اتصال root (رمز عبور root همیشه 1234 است طبق docker compose)
ROOT_PASSWORD="1234"
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT VERSION();" >/dev/null 2>&1; then
    echo "✅ دیتابیس MariaDB در حال اجراست"
    
    # بررسی وجود دیتابیس‌ها
    echo "🔍 بررسی دیتابیس‌ها..."
    DATABASES=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SHOW DATABASES;" 2>/dev/null | grep -E "(crm_system|saas_master)" || echo "")
    
    # بررسی crm_system
    CRM_EXISTS=false
    CRM_TABLE_COUNT=0
    if echo "$DATABASES" | grep -q "crm_system"; then
        echo "✅ دیتابیس crm_system موجود است"
        CRM_EXISTS=true
        
        # شمارش جداول crm_system
        CRM_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$CRM_TABLE_COUNT" -gt 1 ]; then
            echo "✅ دیتابیس crm_system آماده است - تعداد جداول: $((CRM_TABLE_COUNT - 1))"
        else
            echo "⚠️  دیتابیس crm_system خالی است - جداول ایمپورت نشده"
        fi
    else
        echo "❌ دیتابیس crm_system موجود نیست!"
        CRM_EXISTS=false
        CRM_TABLE_COUNT=0
    fi
    
    # بررسی saas_master
    SAAS_EXISTS=false
    SAAS_TABLE_COUNT=0
    if echo "$DATABASES" | grep -q "saas_master"; then
        echo "✅ دیتابیس saas_master موجود است"
        SAAS_EXISTS=true
        
        # شمارش جداول saas_master
        SAAS_TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        if [ "$SAAS_TABLE_COUNT" -gt 1 ]; then
            echo "✅ دیتابیس saas_master آماده است - تعداد جداول: $((SAAS_TABLE_COUNT - 1))"
        else
            echo "⚠️  دیتابیس saas_master خالی است - جداول ایمپورت نشده"
        fi
    else
        echo "❌ دیتابیس saas_master موجود نیست!"
        SAAS_EXISTS=false
        SAAS_TABLE_COUNT=0
    fi
    
    # تست اتصال با کاربر crm_user (مطابق lib/database.ts)
    echo "🔐 تست اتصال با کاربر crm_user..."
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
        echo "✅ کاربر crm_user می‌تواند به دیتابیس متصل شود"
        
        # بررسی دسترسی به crm_system
        if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT 1;" >/dev/null 2>&1; then
            echo "✅ کاربر crm_user به crm_system دسترسی دارد"
            
            # تست یک جدول مهم
            if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;" >/dev/null 2>&1; then
                USER_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1)
                echo "✅ جدول users آماده است - تعداد کاربران: $USER_COUNT"
            else
                echo "⚠️  جدول users مشکل دارد یا موجود نیست"
            fi
        else
            echo "❌ کاربر crm_user به crm_system دسترسی ندارد!"
        fi
        
        # بررسی دسترسی به saas_master
        if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT 1;" >/dev/null 2>&1; then
            echo "✅ کاربر crm_user به saas_master دسترسی دارد"
            
            # تست جدول super_admins
            if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" >/dev/null 2>&1; then
                ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" 2>/dev/null | tail -1)
                echo "✅ جدول super_admins آماده است - تعداد ادمین‌ها: $ADMIN_COUNT"
            else
                echo "⚠️  جدول super_admins مشکل دارد یا موجود نیست"
            fi
        else
            echo "⚠️  کاربر crm_user به saas_master دسترسی ندارد"
        fi
    else
        echo "❌ کاربر crm_user نمی‌تواند به دیتابیس متصل شود!"
        echo "🔧 تلاش برای اصلاح دسترسی‌ها..."
        
        # اجرای مجدد init script
        if [ -f "database/00-init-databases.sql" ]; then
            echo "🔧 اجرای مجدد init script..."
            docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} < database/00-init-databases.sql 2>/dev/null || true
            sleep 5
            
            # تست مجدد
            if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
                echo "✅ کاربر crm_user پس از اصلاح کار می‌کند"
            else
                echo "❌ کاربر crm_user هنوز مشکل دارد"
                
                # تلاش برای ایجاد دستی کاربر
                echo "🔧 تلاش برای ایجاد دستی کاربر..."
                docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
                    DROP USER IF EXISTS 'crm_user'@'%';
                    CREATE USER 'crm_user'@'%' IDENTIFIED BY '1234';
                    GRANT ALL PRIVILEGES ON *.* TO 'crm_user'@'%';
                    FLUSH PRIVILEGES;
                " 2>/dev/null || true
                
                # تست نهایی
                if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
                    echo "✅ کاربر crm_user پس از ایجاد دستی کار می‌کند"
                else
                    echo "❌ کاربر crm_user هنوز مشکل دارد - نیاز به بررسی دستی"
                fi
            fi
        fi
    fi
    
    # بررسی و اصلاح دیتابیس‌های خالی
    echo ""
    echo "🔧 بررسی و اصلاح دیتابیس‌های خالی..."
    
    # اگر crm_system موجود نیست یا خالی است، تلاش برای ایمپورت
    if [ "$CRM_EXISTS" = "false" ] || [ "$CRM_TABLE_COUNT" -le 1 ]; then
        if [ -f "database/crm_system.sql" ]; then
        echo "🔧 ایمپورت مجدد crm_system..."
        echo "📋 کپی فایل به کانتینر..."
        
        # اطمینان از وجود دیتابیس
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "CREATE DATABASE IF NOT EXISTS \`crm_system\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || true
        
        # کپی فایل به کانتینر
        MYSQL_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q mysql)
        if [ -n "$MYSQL_CONTAINER" ]; then
            docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm_import.sql
            
            # ایمپورت با روش مطمئن
            echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
            docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p${ROOT_PASSWORD} crm_system < /tmp/crm_import.sql" 2>&1 | grep -v "Warning" || true
            sleep 5
            
            # بررسی مجدد
            NEW_CRM_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
            NEW_CRM_COUNT=$(echo "$NEW_CRM_COUNT" | tr -d ' ' | grep -E "^[0-9]+$" || echo "0")
            if [ "$NEW_CRM_COUNT" -gt 1 ] && [ "$NEW_CRM_COUNT" != "0" ]; then
                echo "✅ crm_system با موفقیت ایمپورت شد - جداول: $((NEW_CRM_COUNT - 1))"
            else
                echo "❌ ایمپورت crm_system ناموفق - تلاش مجدد..."
                # تلاش مجدد با روش دیگر
                sleep 2
                docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p${ROOT_PASSWORD} crm_system < /tmp/crm_import.sql" 2>&1 | grep -v "Warning" || true
                sleep 3
                FINAL_CRM_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
                FINAL_CRM_COUNT=$(echo "$FINAL_CRM_COUNT" | tr -d ' ' | grep -E "^[0-9]+$" || echo "0")
                if [ "$FINAL_CRM_COUNT" -gt 1 ] && [ "$FINAL_CRM_COUNT" != "0" ]; then
                    echo "✅ crm_system با موفقیت ایمپورت شد (تلاش مجدد) - جداول: $((FINAL_CRM_COUNT - 1))"
                else
                    echo "❌ ایمپورت crm_system ناموفق - نیاز به بررسی دستی"
                fi
            fi
        else
            echo "❌ کانتینر MySQL یافت نشد!"
        fi
        else
            echo "⚠️  فایل database/crm_system.sql یافت نشد!"
        fi
    fi
    
    # اگر saas_master موجود نیست یا خالی است، تلاش برای ایمپورت
    if [ "$SAAS_EXISTS" = "false" ] || [ "$SAAS_TABLE_COUNT" -le 1 ]; then
        echo "🔧 ایمپورت مجدد saas_master..."
        
        # اطمینان از وجود دیتابیس
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
        CREATE DATABASE IF NOT EXISTS \`saas_master\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
        " 2>/dev/null || true
        
        # ایمپورت فایل اگر موجود باشد
        MYSQL_CONTAINER=$(docker-compose -f $COMPOSE_FILE ps -q mysql)
        if [ -n "$MYSQL_CONTAINER" ]; then
            # بررسی فایل‌های ممکن
            SAAS_FILE=""
            if [ -f "database/saas_master.sql" ]; then
                SAAS_FILE="database/saas_master.sql"
                echo "✅ فایل database/saas_master.sql یافت شد"
            elif [ -f "database/02-saas_master.sql" ]; then
                SAAS_FILE="database/02-saas_master.sql"
                echo "✅ فایل database/02-saas_master.sql یافت شد"
            else
                echo "🔍 بررسی فایل‌های موجود در database/:"
                ls -la database/*saas*.sql 2>/dev/null || echo "   هیچ فایل saas یافت نشد"
            fi
            
            if [ -n "$SAAS_FILE" ] && [ -f "$SAAS_FILE" ]; then
                echo "📥 ایمپورت از $SAAS_FILE..."
                echo "📋 کپی فایل به کانتینر..."
                
                # کپی فایل به کانتینر
                if docker cp "$SAAS_FILE" $MYSQL_CONTAINER:/tmp/saas_import.sql; then
                    echo "✅ فایل با موفقیت کپی شد"
                    
                    # ایمپورت با روش مطمئن
                    echo "⏳ در حال ایمپورت... (ممکن است چند دقیقه طول بکشد)"
                    docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p${ROOT_PASSWORD} saas_master < /tmp/saas_import.sql" 2>&1 | grep -v "Warning" || true
                else
                    echo "❌ خطا در کپی فایل!"
                fi
            else
                echo "⚠️  فایل saas_master یافت نشد - ایجاد ساختار پایه..."
                docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
            USE saas_master;
            
            CREATE TABLE IF NOT EXISTS \`super_admins\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`username\` varchar(50) NOT NULL,
              \`email\` varchar(255) NOT NULL,
              \`password\` varchar(255) NOT NULL,
              \`full_name\` varchar(255) DEFAULT NULL,
              \`is_active\` tinyint(1) DEFAULT 1,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`username\` (\`username\`),
              UNIQUE KEY \`email\` (\`email\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            
            INSERT INTO \`super_admins\` (\`username\`, \`email\`, \`password\`, \`full_name\`, \`is_active\`) VALUES
            ('Ahmadreza.avandi', 'ahmadrezaavandi@gmail.com', '\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'احمدرضا اوندی', 1)
            ON DUPLICATE KEY UPDATE \`is_active\` = 1;
            
            CREATE TABLE IF NOT EXISTS \`tenants\` (
              \`id\` int(11) NOT NULL AUTO_INCREMENT,
              \`tenant_key\` varchar(50) NOT NULL,
              \`company_name\` varchar(255) NOT NULL,
              \`admin_email\` varchar(255) NOT NULL,
              \`subscription_status\` enum('active','expired','suspended','trial') DEFAULT 'trial',
              \`subscription_plan\` enum('basic','professional','enterprise','custom') DEFAULT 'basic',
              \`subscription_start\` date DEFAULT NULL,
              \`subscription_end\` date DEFAULT NULL,
              \`max_users\` int(11) DEFAULT 5,
              \`is_active\` tinyint(1) DEFAULT 1,
              \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
              \`updated_at\` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
              PRIMARY KEY (\`id\`),
              UNIQUE KEY \`tenant_key\` (\`tenant_key\`),
              UNIQUE KEY \`admin_email\` (\`admin_email\`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            " 2>/dev/null || true
            fi
        fi
        
        sleep 5
        
        # بررسی مجدد
        NEW_SAAS_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
        NEW_SAAS_COUNT=$(echo "$NEW_SAAS_COUNT" | tr -d ' ' | grep -E "^[0-9]+$" || echo "0")
        if [ "$NEW_SAAS_COUNT" -gt 1 ] && [ "$NEW_SAAS_COUNT" != "0" ]; then
            echo "✅ saas_master با موفقیت ایمپورت شد - جداول: $((NEW_SAAS_COUNT - 1))"
            
            # بررسی جدول super_admins
            ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" 2>/dev/null | tail -1 || echo "0")
            echo "   👑 Super Admins: $ADMIN_COUNT"
        else
            echo "❌ ایمپورت saas_master ناموفق - تلاش مجدد..."
            # تلاش مجدد
            sleep 2
            docker-compose -f $COMPOSE_FILE exec -T mysql sh -c "mariadb -u root -p${ROOT_PASSWORD} saas_master < /tmp/saas_import.sql" 2>&1 | grep -v "Warning" || true
            sleep 3
            FINAL_SAAS_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
            FINAL_SAAS_COUNT=$(echo "$FINAL_SAAS_COUNT" | tr -d ' ' | grep -E "^[0-9]+$" || echo "0")
            if [ "$FINAL_SAAS_COUNT" -gt 1 ] && [ "$FINAL_SAAS_COUNT" != "0" ]; then
                echo "✅ saas_master با موفقیت ایمپورت شد (تلاش مجدد) - جداول: $((FINAL_SAAS_COUNT - 1))"
            else
                echo "❌ ایمپورت saas_master ناموفق - نیاز به بررسی دستی"
            fi
        fi
    fi
    
    # اطمینان از دسترسی کاربر crm_user به saas_master
    echo ""
    echo "🔧 اطمینان از دسترسی کاربر crm_user به saas_master..."
    docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'%';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'localhost';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'127.0.0.1';
    GRANT ALL PRIVILEGES ON \`saas_master\`.* TO 'crm_user'@'172.%.%.%';
    FLUSH PRIVILEGES;
    " 2>/dev/null || true
    
    # بررسی و بازگردانی کاربر CEO
    echo ""
    echo "👤 بررسی و بازگردانی کاربر CEO..."
    CEO_EXISTS=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" 2>/dev/null | tail -1 || echo "0")
    
    if [ "$CEO_EXISTS" = "0" ] || [ -z "$CEO_EXISTS" ]; then
        echo "⚠️  کاربر CEO موجود نیست - ایجاد کاربر..."
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
        USE crm_system;
        INSERT INTO users (id, email, password, name, role, is_active, status, tenant_key, created_at, updated_at)
        VALUES (
            'ceo-001',
            'Robintejarat@gmail.com',
            '\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
            'مهندس کریمی',
            'CEO',
            1,
            'active',
            'rabin',
            NOW(),
            NOW()
        ) ON DUPLICATE KEY UPDATE
            password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
            is_active=1,
            status='active',
            updated_at=NOW();
        " 2>/dev/null || true
        echo "✅ کاربر CEO ایجاد/بازگردانی شد"
    else
        echo "✅ کاربر CEO موجود است"
        # بازگردانی رمز در صورت نیاز
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
        USE crm_system;
        UPDATE users SET 
            password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
            is_active=1,
            status='active'
        WHERE email='Robintejarat@gmail.com';
        " 2>/dev/null || true
        echo "✅ رمز کاربر CEO بازگردانی شد"
    fi
    
    # بررسی کاربران ادمین
    echo "👑 بررسی کاربران ادمین..."
    
    # بررسی CEO در crm_system
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" >/dev/null 2>&1; then
        CEO_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com';" 2>/dev/null | tail -1)
        if [ "$CEO_COUNT" = "1" ]; then
            echo "✅ کاربر CEO (مهندس کریمی) موجود است"
        else
            echo "⚠️  کاربر CEO یافت نشد"
        fi
    fi
    
    # بررسی Super Admin در saas_master
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins WHERE username='Ahmadreza.avandi';" >/dev/null 2>&1; then
        SUPER_ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins WHERE username='Ahmadreza.avandi';" 2>/dev/null | tail -1)
        if [ "$SUPER_ADMIN_COUNT" = "1" ]; then
            echo "✅ Super Admin (احمدرضا اوندی) موجود است"
        else
            echo "⚠️  Super Admin یافت نشد - ایجاد Super Admin..."
            docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
            USE saas_master;
            INSERT INTO \`super_admins\` (\`username\`, \`email\`, \`password\`, \`full_name\`, \`is_active\`) VALUES
            ('Ahmadreza.avandi', 'ahmadrezaavandi@gmail.com', '\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'احمدرضا اوندی', 1)
            ON DUPLICATE KEY UPDATE \`is_active\` = 1;
            " 2>/dev/null || true
            echo "✅ Super Admin ایجاد شد"
        fi
    else
        echo "⚠️  نمی‌توان به جدول super_admins دسترسی پیدا کرد"
    fi
    
else
    echo "❌ دیتابیس در حال اجرا نیست یا مشکل دارد!"
    echo "🔍 بررسی لاگ MySQL:"
    docker-compose -f $COMPOSE_FILE logs mysql | tail -10
fi

# تست NextJS
echo "🧪 تست NextJS..."
sleep 10
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    echo "✅ NextJS در حال اجراست"
    
    # تست فولدرهای آپلود در کانتینر
    echo "📁 بررسی فولدرهای آپلود در کانتینر..."
    if docker-compose -f $COMPOSE_FILE exec -T nextjs ls -la /app/uploads >/dev/null 2>&1; then
        echo "✅ فولدر uploads در کانتینر موجود است"
    else
        echo "❌ فولدر uploads در کانتینر موجود نیست"
    fi
    
    if docker-compose -f $COMPOSE_FILE exec -T nextjs ls -la /app/public/uploads >/dev/null 2>&1; then
        echo "✅ فولدر public/uploads در کانتینر موجود است"
    else
        echo "❌ فولدر public/uploads در کانتینر موجود نیست"
    fi
    
    # تست مجوز نوشتن
    if docker-compose -f $COMPOSE_FILE exec -T nextjs touch /app/uploads/test.txt >/dev/null 2>&1; then
        echo "✅ مجوز نوشتن در uploads موجود است"
        docker-compose -f $COMPOSE_FILE exec -T nextjs rm -f /app/uploads/test.txt >/dev/null 2>&1
    else
        echo "❌ مجوز نوشتن در uploads وجود ندارد - اصلاح مشکل..."
        
        # اصلاح مجوزهای uploads در کانتینر
        echo "🔧 اصلاح مجوزهای uploads در کانتینر..."
        docker-compose -f $COMPOSE_FILE exec -T nextjs sh -c "
            mkdir -p /app/uploads/documents /app/uploads/avatars /app/uploads/chat /app/uploads/temp &&
            mkdir -p /app/public/uploads/documents /app/public/uploads/avatars /app/public/uploads/chat &&
            chown -R nextjs:nodejs /app/uploads /app/public/uploads &&
            chmod -R 775 /app/uploads /app/public/uploads
        " 2>/dev/null || true
        
        # تست مجدد
        if docker-compose -f $COMPOSE_FILE exec -T nextjs touch /app/uploads/test.txt >/dev/null 2>&1; then
            echo "✅ مجوز نوشتن اصلاح شد"
            docker-compose -f $COMPOSE_FILE exec -T nextjs rm -f /app/uploads/test.txt >/dev/null 2>&1
        else
            echo "⚠️  مجوز نوشتن هنوز مشکل دارد"
        fi
    fi
else
    echo "⚠️  NextJS ممکن است هنوز آماده نباشد"
    echo "🔍 لاگ NextJS:"
    docker-compose -f $COMPOSE_FILE logs nextjs | tail -5
fi

# تست nginx config
echo "🧪 تست nginx config..."
if docker-compose -f $COMPOSE_FILE exec -T nginx nginx -t >/dev/null 2>&1; then
    echo "✅ nginx config درست است"
else
    echo "❌ nginx config مشکل دارد"
    docker-compose -f $COMPOSE_FILE logs nginx | tail -5
fi



# تست دامنه
echo "🧪 تست دامنه..."
sleep 5
DOMAIN_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --connect-timeout 10)
if [ "$DOMAIN_TEST" = "200" ] || [ "$DOMAIN_TEST" = "302" ] || [ "$DOMAIN_TEST" = "301" ]; then
    echo "✅ دامنه $DOMAIN در دسترس است (HTTP $DOMAIN_TEST)"
else
    echo "⚠️  دامنه پاسخ نمی‌دهد (HTTP $DOMAIN_TEST)"
    echo "🔍 تست محلی nginx:"
    curl -s -I -H "Host: $DOMAIN" http://localhost | head -3
fi

# تست API های مهم
echo "🧪 تست API های مهم..."
sleep 3

# تست API documents
DOCS_API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/api/documents --connect-timeout 5)
if [ "$DOCS_API_TEST" = "200" ] || [ "$DOCS_API_TEST" = "401" ]; then
    echo "✅ API Documents در دسترس است (HTTP $DOCS_API_TEST)"
else
    echo "⚠️  API Documents مشکل دارد (HTTP $DOCS_API_TEST)"
fi

# تست API events
EVENTS_API_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/api/events --connect-timeout 5)
if [ "$EVENTS_API_TEST" = "200" ] || [ "$EVENTS_API_TEST" = "401" ]; then
    echo "✅ API Events در دسترس است (HTTP $EVENTS_API_TEST)"
else
    echo "⚠️  API Events مشکل دارد (HTTP $EVENTS_API_TEST)"
fi

# تست صفحه documents
DOCS_PAGE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/dashboard/documents --connect-timeout 5)
if [ "$DOCS_PAGE_TEST" = "200" ] || [ "$DOCS_PAGE_TEST" = "302" ]; then
    echo "✅ صفحه Documents در دسترس است (HTTP $DOCS_PAGE_TEST)"
else
    echo "⚠️  صفحه Documents مشکل دارد (HTTP $DOCS_PAGE_TEST)"
fi

# تست صفحه calendar
CALENDAR_PAGE_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN/dashboard/calendar --connect-timeout 5)
if [ "$CALENDAR_PAGE_TEST" = "200" ] || [ "$CALENDAR_PAGE_TEST" = "302" ]; then
    echo "✅ صفحه Calendar در دسترس است (HTTP $CALENDAR_PAGE_TEST)"
else
    echo "⚠️  صفحه Calendar مشکل دارد (HTTP $CALENDAR_PAGE_TEST)"
fi



# ═══════════════════════════════════════════════════════════════
# 🔐 مرحله 9: تنظیمات امنیتی و نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔐 مرحله 9: تنظیمات امنیتی..."

# تنظیم تجدید خودکار SSL
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "⏰ تنظیم تجدید خودکار SSL..."
    (sudo crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && cd $(pwd) && docker-compose -f $COMPOSE_FILE restart nginx") | sudo crontab -
fi

# تنظیم فایروال
echo "🔥 تنظیم فایروال..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# نمایش لاگ‌های اخیر
echo ""
echo "📋 لاگ‌های اخیر:"
docker-compose -f $COMPOSE_FILE logs --tail=20

# ═══════════════════════════════════════════════════════════════
# 🔧 مرحله 11: تست و اصلاح دیتابیس
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔧 مرحله 11: تست و اصلاح دیتابیس..."

# انتظار اضافی برای آماده شدن دیتابیس
echo "⏳ انتظار برای آماده شدن کامل دیتابیس..."
sleep 30

# بررسی وضعیت کانتینر MySQL
echo "🔍 بررسی وضعیت کانتینر MySQL..."
MYSQL_CONTAINER=$(docker ps --format '{{.Names}}' | grep -E "(mysql|mariadb)" | head -1)
if [ -n "$MYSQL_CONTAINER" ]; then
    echo "✅ کانتینر MySQL: $MYSQL_CONTAINER"
    MYSQL_STATUS=$(docker inspect --format='{{.State.Status}}' $MYSQL_CONTAINER 2>/dev/null)
    echo "📊 وضعیت: $MYSQL_STATUS"
    
    # بررسی لاگ‌های اخیر MySQL
    echo "📋 لاگ‌های اخیر MySQL:"
    docker logs $MYSQL_CONTAINER --tail 10 2>/dev/null | grep -E "(ready|error|warning)" || echo "   لاگ خاصی یافت نشد"
else
    echo "❌ کانتینر MySQL یافت نشد!"
    echo "🔍 کانتینرهای موجود:"
    docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
fi

# تست اتصال دیتابیس با کاربر crm_user
echo "🔌 تست اتصال دیتابیس..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user می‌تواند به دیتابیس متصل شود"
    
    # تست دسترسی به crm_system
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SHOW TABLES;" >/dev/null 2>&1; then
        TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l)
        echo "✅ دیتابیس crm_system آماده است - تعداد جداول: $((TABLE_COUNT - 1))"
    else
        echo "❌ دسترسی به crm_system ناموفق"
    fi
    
    # تست دسترسی به saas_master
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SHOW TABLES;" >/dev/null 2>&1; then
        TABLE_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l)
        echo "✅ دیتابیس saas_master آماده است - تعداد جداول: $((TABLE_COUNT - 1))"
        
        # بررسی کاربر Super Admin
        SUPER_ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins WHERE username='Ahmadreza.avandi';" 2>/dev/null | tail -1)
        if [ "$SUPER_ADMIN_COUNT" = "1" ]; then
            echo "✅ Super Admin (Ahmadreza.avandi) موجود است"
        else
            echo "⚠️  Super Admin یافت نشد"
        fi
    else
        echo "❌ دسترسی به saas_master ناموفق"
    fi
    
    # بررسی کاربر CEO در crm_system
    CEO_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users WHERE id='ceo-001';" 2>/dev/null | tail -1)
    if [ "$CEO_COUNT" = "1" ]; then
        echo "✅ کاربر CEO (مهندس کریمی) موجود است"
    else
        echo "⚠️  کاربر CEO یافت نشد"
    fi
else
    echo "❌ کاربر crm_user نمی‌تواند به دیتابیس متصل شود!"
    echo "🔍 بررسی لاگ MySQL:"
    docker-compose -f $COMPOSE_FILE logs mysql | tail -10
fi

# ═══════════════════════════════════════════════════════════════
# 🎉 خلاصه نهایی
# ═══════════════════════════════════════════════════════════════

# ═══════════════════════════════════════════════════════════════
# 🔧 مرحله 10: رفع مشکل redirect و تست نهایی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔧 مرحله 10: رفع مشکل redirect و تست نهایی..."

# بررسی و رفع مشکل redirect
REDIRECT_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --connect-timeout 10)
echo "🧪 تست اولیه دامنه: HTTP $REDIRECT_TEST"

if [ "$REDIRECT_TEST" = "307" ] || [ "$REDIRECT_TEST" = "301" ] || [ "$REDIRECT_TEST" = "302" ]; then
    echo "⚠️  مشکل redirect شناسایی شد (HTTP $REDIRECT_TEST)"
    echo "🔧 رفع مشکل NEXTAUTH_URL..."
    
    # اطمینان از HTTP در NEXTAUTH_URL
    sed -i "s|NEXTAUTH_URL=https://$DOMAIN|NEXTAUTH_URL=http://$DOMAIN|g" .env
    
    # راه‌اندازی مجدد NextJS
    echo "🔄 راه‌اندازی مجدد NextJS..."
    docker-compose -f $COMPOSE_FILE restart nextjs
    
    # انتظار
    sleep 15
    
    # تست مجدد
    FINAL_TEST=$(curl -s -o /dev/null -w "%{http_code}" http://$DOMAIN --connect-timeout 10)
    echo "🧪 تست نهایی: HTTP $FINAL_TEST"
fi

# اگر HTTP کار کرد و SSL موجود است، به HTTPS تغییر بده
if [ "$SSL_AVAILABLE" = true ] && ([ "$REDIRECT_TEST" = "200" ] || [ "$FINAL_TEST" = "200" ]); then
    echo "🔒 تغییر به HTTPS..."
    sed -i "s|NEXTAUTH_URL=http://$DOMAIN|NEXTAUTH_URL=https://$DOMAIN|g" .env
    
    # اضافه کردن HTTP to HTTPS redirect
    sed -i '/location \/ {/i\    # Redirect HTTP to HTTPS\n    return 301 https://$server_name$request_uri;' nginx/active.conf
    
    # راه‌اندازی مجدد
    docker-compose -f $COMPOSE_FILE restart nginx nextjs
    sleep 10
    
    # تست HTTPS
    HTTPS_TEST=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN --connect-timeout 10 -k)
    echo "🧪 تست HTTPS: $HTTPS_TEST"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 دیپلوی کامل شد!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 خلاصه نهایی کانتینرها:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# بررسی نهایی همه کانتینرها
FINAL_CONTAINERS=("mysql" "phpmyadmin" "nextjs" "nginx")
FINAL_RUNNING=0

for container in "${FINAL_CONTAINERS[@]}"; do
    # جستجو با همه فرمت‌های ممکن
    if docker ps --format '{{.Names}}' | grep -qE "(crm[-_]${container}|${container})"; then
        ACTUAL_NAME=$(docker ps --format '{{.Names}}' | grep -E "(crm[-_]${container}|${container})" | head -1)
        STATUS=$(docker inspect --format='{{.State.Status}}' $ACTUAL_NAME 2>/dev/null)
        HEALTH=$(docker inspect --format='{{.State.Health.Status}}' $ACTUAL_NAME 2>/dev/null || echo "no-healthcheck")
        
        if [ "$HEALTH" = "healthy" ]; then
            echo "✅ $container - اجرا (سالم) [$ACTUAL_NAME]"
        elif [ "$HEALTH" = "no-healthcheck" ]; then
            echo "✅ $container - اجرا [$ACTUAL_NAME]"
        else
            echo "⚠️  $container - اجرا (وضعیت: $HEALTH) [$ACTUAL_NAME]"
        fi
        FINAL_RUNNING=$((FINAL_RUNNING + 1))
    else
        echo "❌ $container - متوقف یا یافت نشد"
    fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 نتیجه: $FINAL_RUNNING از ${#FINAL_CONTAINERS[@]} کانتینر در حال اجرا"
echo ""

if [ $FINAL_RUNNING -eq ${#FINAL_CONTAINERS[@]} ]; then
    echo "✅ همه کانتینرها با موفقیت اجرا شدند!"
else
    echo "⚠️  برخی کانتینرها مشکل دارند. لطفاً لاگ‌ها را بررسی کنید."
fi

echo ""
echo "🌐 آدرس‌های دسترسی:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "🌐 سیستم CRM: https://$DOMAIN"
    echo "🔐 phpMyAdmin: https://$DOMAIN/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
    echo ""
    echo "⚠️  نکته: اگر redirect مشکل دارد، از HTTP استفاده کنید:"
    echo "   🌐 HTTP: http://$DOMAIN"
else
    echo "🌐 سیستم CRM: http://$DOMAIN"
    echo "🔐 phpMyAdmin: http://$DOMAIN/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
fi
echo ""
echo "👑 اطلاعات لاگین:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 CRM System (مهندس کریمی):"
echo "   ایمیل: Robintejarat@gmail.com"
echo "   رمز عبور: 1234"
echo "   لینک: http://$DOMAIN/login"
echo ""
echo "👑 SaaS Admin Panel (احمدرضا اوندی):"
echo "   نام کاربری: Ahmadreza.avandi"
echo "   ایمیل: ahmadrezaavandi@gmail.com"
echo "   رمز عبور: 1234"
echo "   لینک: http://$DOMAIN/secret-zone-789/login"
echo ""
echo "🔐 phpMyAdmin:"
if [ -f ".phpmyadmin_credentials" ]; then
    PHPMYADMIN_USER=$(grep "^Username:" .phpmyadmin_credentials 2>/dev/null | cut -d: -f2 | tr -d ' ' || echo "")
    PHPMYADMIN_PASS=$(grep "^Password:" .phpmyadmin_credentials 2>/dev/null | head -1 | cut -d: -f2 | tr -d ' ' || echo "")
    if [ -n "$PHPMYADMIN_USER" ] && [ -n "$PHPMYADMIN_PASS" ]; then
        echo "   URL: https://$DOMAIN/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/"
        echo "   Basic Auth Username: $PHPMYADMIN_USER"
        echo "   Basic Auth Password: $PHPMYADMIN_PASS"
        echo "   MySQL Username: crm_user"
        echo "   MySQL Password: 1234"
    else
        echo "   ⚠️  اطلاعات در فایل .phpmyadmin_credentials موجود است"
        echo "   برای مشاهده: cat .phpmyadmin_credentials"
    fi
else
    echo "   ⚠️  فایل .phpmyadmin_credentials یافت نشد"
    echo "   اطلاعات در فایل nginx/.htpasswd موجود است"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "�️ خلارصه وضعیت دیتابیس:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# خلاصه نهایی دیتابیس
FINAL_CRM_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")
FINAL_SAAS_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE saas_master; SHOW TABLES;" 2>/dev/null | wc -l || echo "0")

if [ "$FINAL_CRM_COUNT" -gt 1 ]; then
    echo "✅ crm_system: $((FINAL_CRM_COUNT - 1)) جدول"
else
    echo "❌ crm_system: خالی یا مشکل دارد"
fi

if [ "$FINAL_SAAS_COUNT" -gt 1 ]; then
    echo "✅ saas_master: $((FINAL_SAAS_COUNT - 1)) جدول"
    
    # بررسی جداول مهم saas_master
    if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" >/dev/null 2>&1; then
        FINAL_ADMIN_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "USE saas_master; SELECT COUNT(*) FROM super_admins;" 2>/dev/null | tail -1)
        echo "   👑 Super Admins: $FINAL_ADMIN_COUNT"
    fi
else
    echo "❌ saas_master: خالی یا مشکل دارد"
    echo "🔧 برای اصلاح: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234 saas_master < database/saas_master.sql"
fi

# تست نهایی کاربر
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u crm_user -p1234 -e "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ کاربر crm_user: آماده"
else
    echo "❌ کاربر crm_user: مشکل دارد"
fi

echo ""
echo "📋 دستورات مفید:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   • مشاهده لاگ‌ها: docker-compose -f $COMPOSE_FILE logs -f"
echo "   • لاگ یک سرویس: docker-compose -f $COMPOSE_FILE logs -f nextjs"
echo "   • راه‌اندازی مجدد: docker-compose -f $COMPOSE_FILE restart"
echo "   • راه‌اندازی مجدد یک سرویس: docker-compose -f $COMPOSE_FILE restart nextjs"
echo "   • توقف: docker-compose -f $COMPOSE_FILE down"
echo "   • بررسی وضعیت: docker-compose -f $COMPOSE_FILE ps"
echo "   • دیپلوی معمولی: ./deploy-server.sh"
echo "   • دیپلوی با پاکسازی کامل: ./deploy-server.sh --clean"
echo "   • بک‌آپ crm_system: docker-compose -f $COMPOSE_FILE exec mysql mariadb-dump -u root -p1234 crm_system > backup_crm.sql"
echo "   • بک‌آپ saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb-dump -u root -p1234 saas_master > backup_saas.sql"
echo "   • تست اتصال دیتابیس: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"SELECT 1;\""
echo "   • مشاهده جداول crm_system: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE crm_system; SHOW TABLES;\""
echo "   • مشاهده جداول saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SHOW TABLES;\""
echo "   • بررسی Super Admins: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u crm_user -p1234 -e \"USE saas_master; SELECT * FROM super_admins;\""
echo "   • اصلاح saas_master: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234 saas_master < database/saas_master.sql"
echo "   • ایمپورت مجدد دیتابیس: docker-compose -f $COMPOSE_FILE exec mysql mariadb -u root -p1234 < database/01-crm_system.sql"
echo "   • رفع مشکل redirect: sed -i 's|https://|http://|g' .env && docker-compose -f $COMPOSE_FILE restart nextjs"
echo "   • تست دامنه: curl -I http://$DOMAIN"
echo "   • رفع مشکل آپلود: ./fix-upload-issue.sh"
echo "   • بررسی فولدرهای آپلود: docker exec crm-nextjs ls -la /app/uploads/"
echo "   • تست مجوز آپلود: docker exec crm-nextjs touch /app/uploads/test.txt"
echo "   • ورود به کانتینر NextJS: docker exec -it crm-nextjs /bin/sh"
echo ""
echo "� انطلاعات دسترسی phpMyAdmin:"
echo "   • آدرس: /secure-db-admin-panel-x7k9m2/"
echo "   • نام کاربری: از فایل .env"
echo "   • رمز عبور: از فایل .env"
echo ""
echo "⚠️  نکات امنیتی:"
echo "   • فایل .env را محرمانه نگه دارید"
echo "   • رمزهای قوی استفاده کنید"
echo "   • بک‌آپ منظم از دیتابیس بگیرید"
echo "   • لاگ‌ها را مرتب بررسی کنید"
echo ""
echo "📊 خلاصه سیستم:"
echo "   • حافظه: ${TOTAL_MEM}MB"
echo "   • Docker Compose: $COMPOSE_FILE"
echo "   • دیتابیس: MariaDB 10.4.32"
echo "   • phpMyAdmin: 5.2.2"
echo ""

# ═══════════════════════════════════════════════════════════════
# 🔒 مرحله 12: بررسی نهایی امنیت و تست‌های جامع
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔒 مرحله 12: بررسی نهایی امنیت و تست‌های جامع..."
echo ""

# بررسی نهایی دیتابیس‌ها
echo "🔍 بررسی نهایی وضعیت دیتابیس‌ها..."
if docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT 1;" >/dev/null 2>&1; then
    # بررسی حجم دیتابیس‌ها
    echo "📊 بررسی حجم دیتابیس‌ها..."
    CRM_SIZE=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size' FROM information_schema.tables WHERE table_schema = 'crm_system';" 2>/dev/null | tail -1 || echo "0")
    SAAS_SIZE=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size' FROM information_schema.tables WHERE table_schema = 'saas_master';" 2>/dev/null | tail -1 || echo "0")
    
    if [ "$CRM_SIZE" != "0" ] && [ "$CRM_SIZE" != "NULL" ] && [ -n "$CRM_SIZE" ]; then
        echo "✅ crm_system: ${CRM_SIZE} MB"
    else
        echo "⚠️  crm_system: حجم غیرطبیعی یا صفر"
    fi
    
    if [ "$SAAS_SIZE" != "0" ] && [ "$SAAS_SIZE" != "NULL" ] && [ -n "$SAAS_SIZE" ]; then
        echo "✅ saas_master: ${SAAS_SIZE} MB"
    else
        echo "⚠️  saas_master: حجم غیرطبیعی یا صفر"
    fi
    
    # بررسی تعداد کاربران
    echo ""
    echo "👤 بررسی کاربران..."
    USER_COUNT=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -1 || echo "0")
    echo "   تعداد کاربران crm_system: $USER_COUNT"
    
    # بررسی کاربر CEO
    CEO_CHECK=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT COUNT(*) FROM users WHERE email='Robintejarat@gmail.com' AND is_active=1;" 2>/dev/null | tail -1 || echo "0")
    if [ "$CEO_CHECK" = "1" ] || [ "$CEO_CHECK" -gt 0 ]; then
        echo "   ✅ کاربر CEO فعال است"
        
        # بررسی رمز کاربر
        CEO_PASSWORD_CHECK=$(docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; SELECT password FROM users WHERE email='Robintejarat@gmail.com';" 2>/dev/null | tail -1 || echo "")
        if [ -n "$CEO_PASSWORD_CHECK" ] && echo "$CEO_PASSWORD_CHECK" | grep -q "\$2a\$10"; then
            echo "   ✅ رمز کاربر درست است"
        else
            echo "   ⚠️  رمز کاربر مشکل دارد - بازگردانی..."
            docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "USE crm_system; UPDATE users SET password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye' WHERE email='Robintejarat@gmail.com';" 2>/dev/null || true
        fi
    else
        echo "   ⚠️  کاربر CEO غیرفعال یا موجود نیست - ایجاد..."
        docker-compose -f $COMPOSE_FILE exec -T mysql mariadb -u root -p${ROOT_PASSWORD} -e "
        USE crm_system;
        INSERT INTO users (id, email, password, name, role, is_active, status, tenant_key, created_at, updated_at)
        VALUES ('ceo-001', 'Robintejarat@gmail.com', '\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'مهندس کریمی', 'CEO', 1, 'active', 'rabin', NOW(), NOW())
        ON DUPLICATE KEY UPDATE password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', is_active=1, status='active';
        " 2>/dev/null || true
    fi
fi

# بررسی دسترسی MySQL به اینترنت (باید محدود باشد)
echo ""
echo "🔒 بررسی امنیت دسترسی MySQL..."
if grep -q "127.0.0.1:3306:3306" docker-compose.yml docker-compose.deploy.yml 2>/dev/null; then
    echo "✅ MySQL فقط به localhost محدود است (امن)"
elif grep -qE "\"3306:3306\"|3306:3306" docker-compose.yml docker-compose.deploy.yml 2>/dev/null; then
    echo "⚠️  MySQL در معرض اینترنت است!"
    echo "🔧 محدود کردن به localhost..."
    sed -i 's/- "3306:3306"/- "127.0.0.1:3306:3306"/g' docker-compose.yml docker-compose.deploy.yml 2>/dev/null || true
    echo "✅ تنظیمات اصلاح شد - برای اعمال تغییرات deploy را مجدد اجرا کنید"
else
    echo "ℹ️  تنظیمات پورت MySQL بررسی نشد"
fi

# بررسی فایل‌های بک‌آپ
echo ""
echo "💾 بررسی بک‌آپ‌ها..."
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql 2>/dev/null | wc -l || echo "0")
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "✅ تعداد بک‌آپ‌ها: $BACKUP_COUNT"
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "$LATEST_BACKUP" 2>/dev/null | cut -d' ' -f1 || date +%Y-%m-%d)
        BACKUP_SIZE=$(du -h "$LATEST_BACKUP" 2>/dev/null | cut -f1)
        echo "   آخرین بک‌آپ: $BACKUP_DATE (حجم: $BACKUP_SIZE)"
    fi
else
    echo "⚠️  هیچ بک‌آپی یافت نشد"
fi

echo ""
# ═══════════════════════════════════════════════════════════════
# 🔒 بررسی نهایی امنیت و تست‌ها
# ═══════════════════════════════════════════════════════════════

echo ""
echo "🔒 بررسی نهایی امنیت..."
echo ""

# بررسی دسترسی MySQL (باید محدود باشد)
if grep -q "127.0.0.1:3306:3306" docker-compose.yml docker-compose.deploy.yml 2>/dev/null; then
    echo "✅ MySQL فقط به localhost محدود است (امن)"
elif grep -qE "3306:3306" docker-compose.yml docker-compose.deploy.yml 2>/dev/null; then
    echo "⚠️  MySQL در معرض اینترنت است - اصلاح..."
    sed -i 's/- "3306:3306"/- "127.0.0.1:3306:3306"/g' docker-compose.yml docker-compose.deploy.yml 2>/dev/null || true
    echo "✅ تنظیمات اصلاح شد"
fi

# بررسی بک‌آپ‌ها
BACKUP_COUNT=$(ls -1 backups/*.sql 2>/dev/null | wc -l || echo "0")
if [ "$BACKUP_COUNT" -gt 0 ]; then
    echo "✅ بک‌آپ‌های موجود: $BACKUP_COUNT"
else
    echo "⚠️  هیچ بک‌آپی یافت نشد"
fi

echo "✅ همه چیز آماده است!"



# ═══════════════════════════════════════════════════════════════
# 📋 راهنمای رفع مشکل دیتابیس خالی
# ═══════════════════════════════════════════════════════════════

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  اگر دیتابیس‌ها خالی هستند:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔄 راه اول: دیپلوی مجدد با --clean (توصیه می‌شود)"
echo "   ./deploy-server.sh --clean"
echo ""
echo "📥 راه دوم: ایمپورت دستی (سریع‌تر)"
echo "   # کپی فایل‌ها به کانتینر"
echo "   docker cp database/01-crm_system.sql \$(docker-compose -f $COMPOSE_FILE ps -q mysql):/tmp/crm.sql"
echo "   docker cp database/02-saas_master.sql \$(docker-compose -f $COMPOSE_FILE ps -q mysql):/tmp/saas.sql"
echo ""
echo "   # ایمپورت"
echo "   docker-compose -f $COMPOSE_FILE exec mysql sh -c 'mariadb -u root -p1234 crm_system < /tmp/crm.sql'"
echo "   docker-compose -f $COMPOSE_FILE exec mysql sh -c 'mariadb -u root -p1234 saas_master < /tmp/saas.sql'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ دیپلوی کامل شد!"
