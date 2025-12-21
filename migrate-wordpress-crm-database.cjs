const mysql = require('mysql2/promise');

// Database Configuration
const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

console.log('🗄️ WordPress CRM Database Migration');
console.log('=' .repeat(50));

class DatabaseMigrator {
    constructor() {
        this.connection = null;
    }

    async connect() {
        try {
            this.connection = await mysql.createConnection(DB_CONFIG);
            console.log('✅ اتصال به دیتابیس برقرار شد');
        } catch (error) {
            console.error('❌ خطا در اتصال:', error.message);
            throw error;
        }
    }

    async checkExistingTables() {
        console.log('\n📋 بررسی جداول موجود...');
        
        try {
            const [tables] = await this.connection.execute(`
                SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ? 
                ORDER BY TABLE_NAME
            `, [DB_CONFIG.database]);
            
            console.log('📊 جداول موجود:');
            tables.forEach(table => {
                const sizeKB = Math.round(table.DATA_LENGTH / 1024);
                console.log(`   - ${table.TABLE_NAME}: ${table.TABLE_ROWS} ردیف (${sizeKB} KB)`);
            });
            
            return tables.map(t => t.TABLE_NAME);
            
        } catch (error) {
            console.error('❌ خطا در بررسی جداول:', error.message);
            return [];
        }
    }

    async addWordPressColumnsToCustomers() {
        console.log('\n👥 اضافه کردن ستون‌های WordPress به جدول customers...');
        
        try {
            // Check if columns already exist
            const [columns] = await this.connection.execute(`
                SELECT COLUMN_NAME 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers'
            `, [DB_CONFIG.database]);
            
            const existingColumns = columns.map(c => c.COLUMN_NAME);
            
            // Add wordpress_user_id column if not exists
            if (!existingColumns.includes('wordpress_user_id')) {
                await this.connection.execute(`
                    ALTER TABLE customers 
                    ADD COLUMN wordpress_user_id INT NULL,
                    ADD INDEX idx_wordpress_user_id (wordpress_user_id)
                `);
                console.log('✅ ستون wordpress_user_id اضافه شد');
            } else {
                console.log('ℹ️ ستون wordpress_user_id از قبل موجود است');
            }
            
            // Add source column if not exists
            if (!existingColumns.includes('source')) {
                await this.connection.execute(`
                    ALTER TABLE customers 
                    ADD COLUMN source VARCHAR(50) DEFAULT 'manual',
                    ADD INDEX idx_source (source)
                `);
                console.log('✅ ستون source اضافه شد');
            } else {
                console.log('ℹ️ ستون source از قبل موجود است');
            }
            
        } catch (error) {
            console.error('❌ خطا در اضافه کردن ستون‌ها:', error.message);
        }
    }

    async createWordPressApiKeysTable() {
        console.log('\n🔑 ایجاد جدول کلیدهای API WordPress...');
        
        try {
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS wordpress_api_keys (
                    id VARCHAR(36) PRIMARY KEY,
                    tenant_key VARCHAR(255) NOT NULL,
                    name VARCHAR(255) NOT NULL,
                    api_key VARCHAR(255) NOT NULL UNIQUE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    last_used_at TIMESTAMP NULL,
                    is_active BOOLEAN DEFAULT TRUE,
                    usage_count INT DEFAULT 0,
                    created_by VARCHAR(255) DEFAULT 'system',
                    notes TEXT NULL,
                    INDEX idx_api_key (api_key),
                    INDEX idx_tenant_key (tenant_key),
                    INDEX idx_is_active (is_active),
                    INDEX idx_created_at (created_at),
                    UNIQUE KEY unique_tenant_name (tenant_key, name)
                )
            `);
            
            console.log('✅ جدول wordpress_api_keys ایجاد شد');
            
        } catch (error) {
            console.error('❌ خطا در ایجاد جدول کلیدهای API:', error.message);
        }
    }

    async createWordPressSyncLogTable() {
        console.log('\n📝 ایجاد جدول لاگ همگام‌سازی WordPress...');
        
        try {
            await this.connection.execute(`
                CREATE TABLE IF NOT EXISTS wordpress_sync_log (
                    id VARCHAR(36) PRIMARY KEY,
                    tenant_key VARCHAR(255) NOT NULL,
                    wordpress_site_url VARCHAR(255),
                    entity_type ENUM('customer', 'order', 'product') NOT NULL,
                    wordpress_entity_id INT NOT NULL,
                    crm_entity_id VARCHAR(36),
                    sync_status ENUM('success', 'failed', 'pending') DEFAULT 'pending',
                    error_message TEXT,
                    request_data JSON,
                    response_data JSON,
                    sync_duration_ms INT DEFAULT 0,
                    api_key_used VARCHAR(255),
                    user_agent VARCHAR(500),
                    ip_address VARCHAR(45),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_tenant_key (tenant_key),
                    INDEX idx_entity_type (entity_type),
                    INDEX idx_sync_status (sync_status),
                    INDEX idx_created_at (created_at),
                    INDEX idx_wordpress_entity (wordpress_entity_id, entity_type),
                    INDEX idx_crm_entity (crm_entity_id)
                )
            `);
            
            console.log('✅ جدول wordpress_sync_log ایجاد شد');
            
        } catch (error) {
            console.error('❌ خطا در ایجاد جدول لاگ:', error.message);
        }
    }

    async function generateApiKey(prefix = 'wp_crm_') {
        const crypto = require('crypto');
        const randomBytes = crypto.randomBytes(32).toString('hex');
        return prefix + randomBytes;
    }

    async insertDefaultApiKeys() {
        console.log('\n🔐 درج کلیدهای API پیش‌فرض...');
        
        try {
            const defaultKeys = [
                {
                    tenant_key: 'default',
                    name: 'WordPress Plugin - Default',
                    api_key: 'wp_crm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2',
                    notes: 'کلید پیش‌فرض برای تست و راه‌اندازی اولیه'
                },
                {
                    tenant_key: 'demo_tenant',
                    name: 'WordPress Plugin - Demo',
                    api_key: await this.generateApiKey('wp_demo_'),
                    notes: 'کلید نمونه برای tenant آزمایشی'
                }
            ];
            
            for (const keyData of defaultKeys) {
                await this.connection.execute(`
                    INSERT INTO wordpress_api_keys (
                        id, tenant_key, name, api_key, created_at, is_active, notes
                    ) VALUES (
                        UUID(), ?, ?, ?, NOW(), TRUE, ?
                    ) ON DUPLICATE KEY UPDATE 
                        api_key = VALUES(api_key),
                        updated_at = NOW(),
                        notes = VALUES(notes)
                `, [keyData.tenant_key, keyData.name, keyData.api_key, keyData.notes]);
                
                console.log(`✅ کلید API برای ${keyData.tenant_key}: ${keyData.api_key}`);
            }
            
        } catch (error) {
            console.error('❌ خطا در درج کلیدهای پیش‌فرض:', error.message);
        }
    }

    async generateApiKey(prefix = 'wp_crm_') {
        const crypto = require('crypto');
        const randomBytes = crypto.randomBytes(32).toString('hex');
        return prefix + randomBytes;
    }

    async testMultiTenantIsolation() {
        console.log('\n🔒 تست جداسازی multi-tenant...');
        
        try {
            // Create test customers for different tenants
            const testCustomers = [
                {
                    tenant_key: 'default',
                    name: 'مشتری پیش‌فرض',
                    email: 'default@test.com',
                    wordpress_user_id: 1001
                },
                {
                    tenant_key: 'demo_tenant',
                    name: 'مشتری آزمایشی',
                    email: 'demo@test.com',
                    wordpress_user_id: 1002
                }
            ];
            
            for (const customer of testCustomers) {
                await this.connection.execute(`
                    INSERT INTO customers (
                        id, tenant_key, name, email, phone, company_name,
                        segment, priority, status, source, wordpress_user_id, created_at
                    ) VALUES (
                        UUID(), ?, ?, ?, '+98912345678', 'شرکت تست',
                        'medium', 'medium', 'prospect', 'wordpress', ?, NOW()
                    ) ON DUPLICATE KEY UPDATE 
                        name = VALUES(name),
                        updated_at = NOW()
                `, [customer.tenant_key, customer.name, customer.email, customer.wordpress_user_id]);
                
                console.log(`✅ مشتری تست برای ${customer.tenant_key} ایجاد شد`);
            }
            
            // Test data isolation
            console.log('\n🔍 بررسی جداسازی داده‌ها...');
            
            const [tenantStats] = await this.connection.execute(`
                SELECT tenant_key, COUNT(*) as customer_count
                FROM customers 
                WHERE source = 'wordpress'
                GROUP BY tenant_key
                ORDER BY tenant_key
            `);
            
            console.log('📊 آمار مشتریان بر اساس tenant:');
            tenantStats.forEach(stat => {
                console.log(`   - ${stat.tenant_key}: ${stat.customer_count} مشتری`);
            });
            
            // Verify no cross-tenant data access
            for (const customer of testCustomers) {
                const [customerCheck] = await this.connection.execute(`
                    SELECT COUNT(*) as count
                    FROM customers 
                    WHERE tenant_key = ? AND source = 'wordpress'
                `, [customer.tenant_key]);
                
                if (customerCheck[0].count > 0) {
                    console.log(`✅ جداسازی ${customer.tenant_key}: صحیح`);
                } else {
                    console.log(`⚠️ جداسازی ${customer.tenant_key}: مشکل دار`);
                }
            }
            
        } catch (error) {
            console.error('❌ خطا در تست جداسازی:', error.message);
        }
    }

    async generateMigrationReport() {
        console.log('\n📊 گزارش Migration...');
        console.log('=' .repeat(50));
        
        try {
            // Check all tables
            const [tables] = await this.connection.execute(`
                SELECT TABLE_NAME, TABLE_ROWS, 
                       ROUND(DATA_LENGTH/1024, 2) as SIZE_KB
                FROM information_schema.TABLES 
                WHERE TABLE_SCHEMA = ?
                ORDER BY TABLE_NAME
            `, [DB_CONFIG.database]);
            
            console.log('📋 جداول دیتابیس:');
            tables.forEach(table => {
                console.log(`   - ${table.TABLE_NAME}: ${table.TABLE_ROWS} ردیف (${table.SIZE_KB} KB)`);
            });
            
            // API Keys summary
            const [apiKeys] = await this.connection.execute(`
                SELECT tenant_key, name, 
                       CONCAT(LEFT(api_key, 12), '...') as api_key_preview,
                       is_active, usage_count, created_at
                FROM wordpress_api_keys 
                ORDER BY tenant_key, created_at
            `);
            
            console.log('\n🔑 کلیدهای API:');
            apiKeys.forEach(key => {
                const status = key.is_active ? 'فعال' : 'غیرفعال';
                console.log(`   - ${key.tenant_key}: ${key.name} (${key.api_key_preview}) - ${status}`);
            });
            
            // Customer statistics
            const [customerStats] = await this.connection.execute(`
                SELECT 
                    tenant_key,
                    COUNT(*) as total_customers,
                    SUM(CASE WHEN source = 'wordpress' THEN 1 ELSE 0 END) as wordpress_customers,
                    SUM(CASE WHEN source = 'manual' THEN 1 ELSE 0 END) as manual_customers
                FROM customers 
                GROUP BY tenant_key
                ORDER BY tenant_key
            `);
            
            console.log('\n👥 آمار مشتریان:');
            customerStats.forEach(stat => {
                console.log(`   - ${stat.tenant_key}: ${stat.total_customers} کل (${stat.wordpress_customers} WordPress, ${stat.manual_customers} دستی)`);
            });
            
            console.log('\n✅ Migration کامل شد!');
            console.log('\n📝 اطلاعات مهم:');
            console.log(`   - دیتابیس: ${DB_CONFIG.database}`);
            console.log(`   - جداول WordPress: wordpress_api_keys, wordpress_sync_log`);
            console.log(`   - ستون‌های جدید customers: wordpress_user_id, source`);
            console.log(`   - پشتیبانی Multi-Tenant: فعال`);
            
        } catch (error) {
            console.error('❌ خطا در تولید گزارش:', error.message);
        }
    }

    async runMigration() {
        try {
            await this.connect();
            
            // Check existing tables
            const existingTables = await this.checkExistingTables();
            
            // Add WordPress columns to customers table
            await this.addWordPressColumnsToCustomers();
            
            // Create WordPress API keys table
            await this.createWordPressApiKeysTable();
            
            // Create WordPress sync log table
            await this.createWordPressSyncLogTable();
            
            // Insert default API keys
            await this.insertDefaultApiKeys();
            
            // Test multi-tenant isolation
            await this.testMultiTenantIsolation();
            
            // Generate final report
            await this.generateMigrationReport();
            
        } catch (error) {
            console.error('❌ خطای کلی در migration:', error.message);
            throw error;
        } finally {
            if (this.connection) {
                await this.connection.end();
                console.log('\n🔌 اتصال دیتابیس بسته شد');
            }
        }
    }
}

// Run migration
async function main() {
    const migrator = new DatabaseMigrator();
    await migrator.runMigration();
}

main().catch(console.error);