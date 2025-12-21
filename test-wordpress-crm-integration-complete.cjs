const mysql = require('mysql2/promise');
const fetch = require('node-fetch');

// Configuration
const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

const API_BASE = 'http://localhost:3000';
const API_KEY = 'wp_crm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';

console.log('🚀 شروع تست کامل WordPress CRM Integration');
console.log('=' .repeat(60));

async function createConnection() {
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        console.log('✅ اتصال به دیتابیس برقرار شد');
        return connection;
    } catch (error) {
        console.error('❌ خطا در اتصال به دیتابیس:', error.message);
        throw error;
    }
}

async function setupApiKeysTable(connection) {
    console.log('\n📋 ایجاد جدول کلیدهای API...');
    
    try {
        // Create API keys table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS wordpress_api_keys (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                api_key VARCHAR(255) NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP NULL,
                is_active BOOLEAN DEFAULT TRUE,
                usage_count INT DEFAULT 0,
                INDEX idx_api_key (api_key),
                INDEX idx_is_active (is_active),
                INDEX idx_created_at (created_at)
            )
        `);
        
        // Insert default API key
        await connection.execute(`
            INSERT INTO wordpress_api_keys (
                id, 
                name, 
                api_key, 
                created_at, 
                is_active
            ) VALUES (
                UUID(),
                'WordPress Plugin Default Key',
                ?,
                NOW(),
                TRUE
            ) ON DUPLICATE KEY UPDATE name = name
        `, [API_KEY]);
        
        console.log('✅ جدول کلیدهای API ایجاد شد');
        console.log('✅ کلید API پیش‌فرض اضافه شد');
        
    } catch (error) {
        console.error('❌ خطا در ایجاد جدول کلیدهای API:', error.message);
        throw error;
    }
}

async function testApiKeyManagement() {
    console.log('\n🔑 تست مدیریت کلیدهای API...');
    
    try {
        // Test API keys endpoint
        const response = await fetch(`${API_BASE}/api/admin/api-keys`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ دریافت لیست کلیدهای API موفق');
            console.log(`📊 تعداد کلیدهای API: ${data.data?.keys?.length || 0}`);
        } else {
            console.log('⚠️  API کلیدها در دسترس نیست (نیاز به احراز هویت ادمین)');
        }
        
    } catch (error) {
        console.log('⚠️  خطا در تست API کلیدها:', error.message);
    }
}

async function testWordPressIntegrationEndpoints() {
    console.log('\n🔌 تست endpoint های WordPress Integration...');
    
    const endpoints = [
        { name: 'Test Connection', path: '/api/integrations/wordpress/test' },
        { name: 'Customers', path: '/api/integrations/wordpress/customers' },
        { name: 'Orders', path: '/api/integrations/wordpress/orders' },
        { name: 'Products', path: '/api/integrations/wordpress/products' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            console.log(`\n🧪 تست ${endpoint.name}...`);
            
            if (endpoint.path.includes('/test')) {
                // Test connection endpoint
                const response = await fetch(`${API_BASE}${endpoint.path}`, {
                    method: 'GET',
                    headers: {
                        'X-WP-API-Key': API_KEY,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint.name}: ${data.message || 'موفق'}`);
                    if (data.data?.endpoints) {
                        console.log('📋 Endpoints موجود:');
                        Object.keys(data.data.endpoints).forEach(ep => {
                            console.log(`   - ${ep}: ${data.data.endpoints[ep]}`);
                        });
                    }
                } else {
                    console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
                }
            } else {
                // Test data endpoints with sample data
                const sampleData = getSampleData(endpoint.path);
                
                const response = await fetch(`${API_BASE}${endpoint.path}`, {
                    method: 'POST',
                    headers: {
                        'X-WP-API-Key': API_KEY,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(sampleData)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`✅ ${endpoint.name}: ${data.message || 'داده با موفقیت پردازش شد'}`);
                    if (data.data) {
                        console.log(`📊 ID ایجاد شده: ${data.data.customer_id || data.data.order_id || data.data.product_id || 'نامشخص'}`);
                    }
                } else {
                    const errorData = await response.text();
                    console.log(`❌ ${endpoint.name}: ${response.status} ${response.statusText}`);
                    console.log(`   خطا: ${errorData}`);
                }
            }
            
        } catch (error) {
            console.log(`❌ خطا در تست ${endpoint.name}:`, error.message);
        }
    }
}

function getSampleData(path) {
    if (path.includes('/customers')) {
        return {
            source: 'wordpress',
            wordpress_user_id: Math.floor(Math.random() * 10000) + 1000,
            email: `test${Date.now()}@example.com`,
            first_name: 'علی',
            last_name: 'احمدی',
            phone: '+98912345678',
            company_name: 'شرکت تست',
            address: 'تهران، خیابان آزادی',
            city: 'تهران',
            state: 'تهران',
            country: 'ایران',
            postal_code: '1234567890',
            registration_date: new Date().toISOString(),
            metadata: {
                test_sync: true,
                generated_at: new Date().toISOString()
            }
        };
    } else if (path.includes('/orders')) {
        return {
            source: 'wordpress',
            wordpress_order_id: Math.floor(Math.random() * 10000) + 1000,
            customer_email: `customer${Date.now()}@example.com`,
            total_amount: 150000,
            currency: 'IRR',
            status: 'completed',
            order_date: new Date().toISOString(),
            billing_info: {
                first_name: 'محمد',
                last_name: 'رضایی',
                address: 'اصفهان، خیابان چهارباغ',
                city: 'اصفهان',
                state: 'اصفهان',
                country: 'ایران',
                postal_code: '8765432109'
            },
            line_items: [
                {
                    product_name: 'محصول تستی',
                    quantity: 2,
                    unit_price: 75000,
                    total_price: 150000,
                    sku: 'TEST-SKU-001'
                }
            ],
            metadata: {
                test_sync: true,
                generated_at: new Date().toISOString()
            }
        };
    } else if (path.includes('/products')) {
        return {
            source: 'wordpress',
            wordpress_product_id: Math.floor(Math.random() * 10000) + 1000,
            name: 'محصول تستی ' + Date.now(),
            description: 'این یک محصول تستی برای آزمایش همگام‌سازی است.',
            sku: 'TEST-SKU-' + Date.now(),
            price: 99000,
            currency: 'IRR',
            category: 'دسته تست',
            status: 'active',
            metadata: {
                test_sync: true,
                generated_at: new Date().toISOString()
            }
        };
    }
    
    return {};
}

async function testDatabaseIntegration(connection) {
    console.log('\n💾 تست یکپارچگی دیتابیس...');
    
    try {
        // Check if test data was inserted
        const [customers] = await connection.execute(`
            SELECT COUNT(*) as count FROM customers WHERE source = 'wordpress'
        `);
        
        console.log(`✅ تعداد مشتریان WordPress: ${customers[0].count}`);
        
        // Check recent entries
        const [recentCustomers] = await connection.execute(`
            SELECT id, name, email, created_at 
            FROM customers 
            WHERE source = 'wordpress' 
            ORDER BY created_at DESC 
            LIMIT 3
        `);
        
        if (recentCustomers.length > 0) {
            console.log('📋 آخرین مشتریان WordPress:');
            recentCustomers.forEach(customer => {
                console.log(`   - ${customer.name} (${customer.email}) - ${customer.created_at}`);
            });
        }
        
        // Check API keys
        const [apiKeys] = await connection.execute(`
            SELECT name, is_active, usage_count, created_at 
            FROM wordpress_api_keys 
            ORDER BY created_at DESC
        `);
        
        console.log(`\n🔑 تعداد کلیدهای API: ${apiKeys.length}`);
        apiKeys.forEach(key => {
            const status = key.is_active ? 'فعال' : 'غیرفعال';
            console.log(`   - ${key.name}: ${status} (استفاده: ${key.usage_count})`);
        });
        
    } catch (error) {
        console.error('❌ خطا در تست دیتابیس:', error.message);
    }
}

async function testAdminPanel() {
    console.log('\n🎛️  تست پنل ادمین...');
    
    try {
        // Test admin panel access
        const response = await fetch(`${API_BASE}/secret-zone-789/admin-panel`);
        
        if (response.ok) {
            console.log('✅ پنل ادمین در دسترس است');
            console.log(`📍 آدرس: ${API_BASE}/secret-zone-789/admin-panel`);
        } else {
            console.log(`⚠️  پنل ادمین: ${response.status} ${response.statusText}`);
        }
        
    } catch (error) {
        console.log('❌ خطا در دسترسی به پنل ادمین:', error.message);
    }
}

async function testWordPressPlugin() {
    console.log('\n🔌 بررسی افزونه WordPress...');
    
    try {
        const fs = require('fs');
        const path = require('path');
        
        // Check if plugin files exist
        const pluginPath = './wordpress-crm-integration';
        const mainFile = path.join(pluginPath, 'wordpress-crm-integration.php');
        const adminFile = path.join(pluginPath, 'includes/class-wp-crm-integration-admin.php');
        const persianJS = path.join(pluginPath, 'assets/js/admin-fa.js');
        const rtlCSS = path.join(pluginPath, 'assets/css/admin-rtl.css');
        const persianPO = path.join(pluginPath, 'languages/wordpress-crm-integration-fa_IR.po');
        
        const files = [
            { name: 'فایل اصلی افزونه', path: mainFile },
            { name: 'کلاس ادمین', path: adminFile },
            { name: 'JavaScript فارسی', path: persianJS },
            { name: 'CSS راست به چپ', path: rtlCSS },
            { name: 'فایل ترجمه فارسی', path: persianPO }
        ];
        
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                const stats = fs.statSync(file.path);
                const sizeKB = Math.round(stats.size / 1024);
                console.log(`✅ ${file.name}: موجود (${sizeKB} KB)`);
            } else {
                console.log(`❌ ${file.name}: یافت نشد`);
            }
        });
        
        // Check if ZIP package exists
        const zipPath = path.join(pluginPath, 'build/wordpress-crm-integration-v1.0.0.zip');
        if (fs.existsSync(zipPath)) {
            const stats = fs.statSync(zipPath);
            const sizeMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
            console.log(`📦 بسته نصب افزونه: موجود (${sizeMB} MB)`);
        } else {
            console.log('📦 بسته نصب افزونه: یافت نشد');
        }
        
    } catch (error) {
        console.log('❌ خطا در بررسی افزونه WordPress:', error.message);
    }
}

async function generateTestReport(connection) {
    console.log('\n📊 گزارش نهایی تست...');
    console.log('=' .repeat(60));
    
    try {
        // Database statistics
        const [customerCount] = await connection.execute(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN source = 'wordpress' THEN 1 ELSE 0 END) as wordpress_customers
            FROM customers
        `);
        
        const [apiKeyCount] = await connection.execute(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_keys
            FROM wordpress_api_keys
        `);
        
        console.log('📈 آمار دیتابیس:');
        console.log(`   - کل مشتریان: ${customerCount[0].total}`);
        console.log(`   - مشتریان WordPress: ${customerCount[0].wordpress_customers}`);
        console.log(`   - کل کلیدهای API: ${apiKeyCount[0].total}`);
        console.log(`   - کلیدهای فعال: ${apiKeyCount[0].active_keys}`);
        
        console.log('\n🔗 لینک‌های مهم:');
        console.log(`   - پنل ادمین CRM: ${API_BASE}/secret-zone-789/admin-panel`);
        console.log(`   - مدیریت کلیدهای API: ${API_BASE}/secret-zone-789/admin-panel (تب کلیدهای API)`);
        console.log(`   - تست اتصال WordPress: ${API_BASE}/api/integrations/wordpress/test`);
        
        console.log('\n📋 مراحل نصب افزونه WordPress:');
        console.log('   1. فایل wordpress-crm-integration-v1.0.0.zip را در WordPress آپلود کنید');
        console.log('   2. افزونه را فعال کنید');
        console.log('   3. به تنظیمات > CRM Integration بروید');
        console.log(`   4. آدرس CRM را وارد کنید: ${API_BASE}`);
        console.log(`   5. کلید API را وارد کنید: ${API_KEY}`);
        console.log('   6. اتصال را تست کنید');
        console.log('   7. نگاشت فیلدها را تنظیم کنید');
        console.log('   8. همگام‌سازی را فعال کنید');
        
        console.log('\n✅ تست کامل WordPress CRM Integration تکمیل شد!');
        
    } catch (error) {
        console.error('❌ خطا در تولید گزارش:', error.message);
    }
}

async function main() {
    let connection;
    
    try {
        // Create database connection
        connection = await createConnection();
        
        // Setup API keys table
        await setupApiKeysTable(connection);
        
        // Test API key management
        await testApiKeyManagement();
        
        // Test WordPress integration endpoints
        await testWordPressIntegrationEndpoints();
        
        // Test database integration
        await testDatabaseIntegration(connection);
        
        // Test admin panel
        await testAdminPanel();
        
        // Test WordPress plugin
        await testWordPressPlugin();
        
        // Generate final report
        await generateTestReport(connection);
        
    } catch (error) {
        console.error('❌ خطای کلی در تست:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 اتصال دیتابیس بسته شد');
        }
    }
}

// Run the test
main().catch(console.error);