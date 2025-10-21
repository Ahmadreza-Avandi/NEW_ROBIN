#!/bin/bash

# ===========================================
# 🗄️ CRM Database Import Script
# ===========================================

set -e

echo "🗄️ Importing CRM database..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Step 1: Check if MySQL container is running
if ! docker-compose ps mysql | grep -q "Up"; then
    print_error "MySQL container is not running!"
    print_status "Starting MySQL container..."
    docker-compose up -d mysql
    sleep 20
fi

# Step 2: Create database and user
print_status "Setting up database and user..."
docker-compose exec -T mysql mysql -u root -p1234_ROOT << 'EOF'
-- Create database
CREATE DATABASE IF NOT EXISTS crm_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
DROP USER IF EXISTS 'crm_app_user'@'%';
CREATE USER 'crm_app_user'@'%' IDENTIFIED BY '1234';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_app_user'@'%';
FLUSH PRIVILEGES;

-- Show created user
SELECT User, Host FROM mysql.user WHERE User = 'crm_app_user';
EOF

if [ $? -eq 0 ]; then
    print_success "Database and user created successfully"
else
    print_error "Failed to create database and user"
    exit 1
fi

# Step 3: Import database structure and data
print_status "Importing database structure and data..."
if [ -f "database/crm_system.sql" ]; then
    docker-compose exec -T mysql mysql -u crm_app_user -p1234 crm_system < database/crm_system.sql
    
    if [ $? -eq 0 ]; then
        print_success "Database imported successfully"
    else
        print_error "Failed to import database"
        print_status "Trying with root user..."
        docker-compose exec -T mysql mysql -u root -p1234_ROOT crm_system < database/crm_system.sql
        
        if [ $? -eq 0 ]; then
            print_success "Database imported with root user"
        else
            print_error "Failed to import database even with root"
            exit 1
        fi
    fi
else
    print_error "Database file database/crm_system.sql not found!"
    exit 1
fi

# Step 4: Verify import
print_status "Verifying database import..."
USER_COUNT=$(docker-compose exec -T mysql mysql -u crm_app_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;" 2>/dev/null | tail -n 1)

if [ ! -z "$USER_COUNT" ] && [ "$USER_COUNT" -gt 0 ]; then
    print_success "Database verification successful - Found $USER_COUNT users"
    
    # Show available users
    print_status "Available users for login:"
    docker-compose exec -T mysql mysql -u crm_app_user -p1234 -e "USE crm_system; SELECT email, role FROM users WHERE status = 'active';" 2>/dev/null
else
    print_error "Database verification failed"
    exit 1
fi

# Step 5: Restart Next.js to refresh database connection
print_status "Restarting Next.js application..."
docker-compose restart nextjs

print_success "Database import completed successfully!"
print_status "You can now login with:"
print_status "  Email: Robintejarat@gmail.com"
print_status "  Password: admin123"
print_status ""
print_status "phpMyAdmin URL: https://ahmadreza-avandi.ir/secure-db-admin-panel-x7k9m2/"
print_status "phpMyAdmin Login: root / 1234_ROOT"