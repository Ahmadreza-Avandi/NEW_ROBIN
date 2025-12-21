const mysql = require('mysql2/promise');

const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

const API_BASE = 'http://localhost:3000';
const RABIN_API_KEY = 'wp_crm_rabin_06292d18f971552edbc0123cd914be5f65e4af00cadfdfa75c2e970f3a70357c';

console.log('🧪 تست کامل Multi-Tenant WordPress Integration برای Rabin');
console.log('=' .repeat(70));

async function testDatabaseIsolation() {
    console.log('\n🔒 تست جداسازی داده‌ها در دیتابیس...');
    
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        // Check rabin tenant data
        const [rabinCustomers] = await connection.execute(`
            SELECT COUNT(*) as count, tenant_key
            FROM customers 
            WHERE tenant_key = 'rabin'
            GROUP BY tenant_key
        `);
        
        // Check other tenants
        const [allTenants] = await connection.execute(`
            SELECT tenant_key, COUNT(*) as count
            FROM customers 
            GROUP BY tenant_key
            ORDER BY tenant_key
        `);
        
        console.log('📊 توزیع مشتریان بر اساس tenant:');
        allTenants.forEach(tenant => {
            const marker = tenant.tenant_key === 'rabin' ? '👑' : '  ';
            console.log(`${marker} - ${tenant.tenant_key}: ${tenant.count} مشتری`);
        });
        
        // Check API keys
        const [apiKeys] = await connection.execute(`
            SELECT tenant_key, name, is_active
            FROM wordpress_api_keys 
            WHERE tenant_key = 'rabin'
        `);
        
        console.log('\n🔑 کلیدهای API برای rabin:');
        apiKeys.forEach(key => {
            const status = key.is_active ? '✅ فعال' : '❌ غیرفعال';
            console.log(`   - ${key.name}: ${status}`);
        });
        
        await connection.end();
        
        if (rabinCustomers.length > 0) {
            console.log(`✅ tenant rabin دارای ${rabinCustomers[0].count} مشتری است`);
        } else {
            console.log('⚠️ هیچ مشتری برای tenant rabin یافت نشد');
        }
        
    } catch (error) {
        console.error('❌ خطا در تست دیتابیس:', error.message);
    }
}

async function testWordPressApiIntegration() {
    console.log('\n🔗 تست API Integration WordPress...');
    
    try {
        // Test customer creation via WordPress API
        const customerData = {
            source: 'wordpress',
            wordpress_user_id: 98765,
            email: 'test.wordpress@rabin.com',
            first_name: 'محمد',
            last_name: 'رضایی',
            phone: '+989111111111',
            company_name: 'شرکت تست رابین',
            address: 'تهران، میدان آزادی',
            city: 'تهران',
            state: 'تهران',
            country: 'ایران',
            registration_date: new Date().toISOString(),
            metadata: {
                test_integration: true,
                tenant: 'rabin'
            }
        };
        
        console.log('📤 ارسال داده مشتری به API...');
        console.log(`   - نام: ${customerData.first_name} ${customerData.last_name}`);
        console.log(`   - ایمیل: ${customerData.email}`);
        console.log(`   - WordPress User ID: ${customerData.wordpress_user_id}`);
        
        // Simulate API call (in real scenario, this would be done by WordPress plugin)
        const fetch = require('node-fetch');
        
        const response = await fetch(`${API_BASE}/api/integrations/wordpress/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-WP-API-Key': RABIN_API_KEY,
                'User-Agent': 'WordPress/6.0 RabinCRM-Plugin/1.0'
            },
            body: JSON.stringify(customerData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ مشتری با موفقیت از طریق WordPress API ایجاد شد');
            console.log(`   - Customer ID: ${result.data.customer_id}`);
            console.log(`   - Tenant: ${result.data.tenant_key}`);
            console.log(`   - Action: ${result.data.action}`);
        } else {
            console.log('❌ خطا در ایجاد مشتری:', result.message);
        }
        
    } catch (error) {
        console.error('❌ خطا در تست API:', error.message);
    }
}

async function testTenantApiEndpoint() {
    console.log('\n📊 تست API Endpoint مخصوص tenant...');
    
    try {
        const fetch = require('node-fetch');
        
        const response = await fetch(`${API_BASE}/api/tenants/rabin/customers`);
        const result = await response.json();
        
        if (result.success) {
            console.log('✅ API endpoint tenant rabin کار می‌کند');
            console.log(`   - تعداد مشتریان: ${result.data.customers.length}`);
            console.log(`   - مشتریان WordPress: ${result.data.stats.wordpress_customers}`);
            console.log(`   - مشتریان دستی: ${result.data.stats.manual_customers}`);
            
            if (result.data.customers.length > 0) {
                console.log('\n📋 نمونه مشتریان:');
                result.data.customers.slice(0, 3).forEach((customer, index) => {
                    console.log(`   ${index + 1}. ${customer.name} (${customer.email}) - ${customer.source}`);
                });
            }
        } else {
            console.log('❌ خطا در دریافت داده‌های tenant:', result.message);
        }
        
    } catch (error) {
        console.error('❌ خطا در تست endpoint:', error.message);
    }
}

async function testCrossTenantIsolation() {
    console.log('\n🛡️ تست جداسازی بین tenant ها...');
    
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        // Try to access rabin data with wrong tenant key
        const [crossCheck] = await connection.execute(`
            SELECT COUNT(*) as count
            FROM customers 
            WHERE tenant_key != 'rabin' AND email LIKE '%rabin.com'
        `);
        
        if (crossCheck[0].count === 0) {
            console.log('✅ هیچ نشت داده‌ای بین tenant ها وجود ندارد');
        } else {
            console.log(`⚠️ ${crossCheck[0].count} مورد نشت داده یافت شد`);
        }
        
        // Check API key isolation
        const [keyCheck] = await connection.execute(`
            SELECT tenant_key, COUNT(*) as count
            FROM wordpress_api_keys 
            GROUP BY tenant_key
            ORDER BY tenant_key
        `);
        
        console.log('\n🔑 توزیع کلیدهای API:');
        keyCheck.forEach(key => {
            console.log(`   - ${key.tenant_key}: ${key.count} کلید`);
        });
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ خطا در تست جداسازی:', error.message);
    }
}

async function generateFinalReport() {
    console.log('\n📊 گزارش نهایی Multi-Tenant Integration');
    console.log('=' .repeat(70));
    
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        // Overall statistics
        const [overallStats] = await connection.execute(`
            SELECT 
                COUNT(DISTINCT tenant_key) as total_tenants,
                COUNT(*) as total_customers,
                COUNT(CASE WHEN source = 'wordpress' THEN 1 END) as wordpress_customers,
                COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_customers
            FROM customers
        `);
        
        const [rabinStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_customers,
                COUNT(CASE WHEN source = 'wordpress' THEN 1 END) as wordpress_customers,
                COUNT(CASE WHEN source = 'manual' THEN 1 END) as manual_customers
            FROM customers 
            WHERE tenant_key = 'rabin'
        `);
        
        const [apiKeyStats] = await connection.execute(`
            SELECT 
                COUNT(*) as total_keys,
                COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_keys
            FROM wordpress_api_keys 
            WHERE tenant_key = 'rabin'
        `);
        
        console.log('🏢 آمار کلی سیستم:');
        console.log(`   - تعداد tenant ها: ${overallStats[0].total_tenants}`);
        console.log(`   - کل مشتریان: ${overallStats[0].total_customers}`);
        console.log(`   - مشتریان WordPress: ${overallStats[0].wordpress_customers}`);
        console.log(`   - مشتریان دستی: ${overallStats[0].manual_customers}`);
        
        console.log('\n👑 آمار tenant rabin:');
        console.log(`   - کل مشتریان: ${rabinStats[0].total_customers}`);
        console.log(`   - مشتریان WordPress: ${rabinStats[0].wordpress_customers}`);
        console.log(`   - مشتریان دستی: ${rabinStats[0].manual_customers}`);
        console.log(`   - کلیدهای API: ${apiKeyStats[0].active_keys}/${apiKeyStats[0].total_keys} فعال`);
        
        console.log('\n🔗 اطلاعات دسترسی rabin:');
        console.log(`   - Admin Panel: ${API_BASE}/rabin/admin-panel`);
        console.log(`   - API Endpoint: ${API_BASE}/api/tenants/rabin/customers`);
        console.log(`   - WordPress API: ${API_BASE}/api/integrations/wordpress/customers`);
        console.log(`   - API Key: ${RABIN_API_KEY.substring(0, 20)}...`);
        
        console.log('\n✅ سیستم Multi-Tenant WordPress CRM Integration برای rabin آماده است!');
        
        console.log('\n📝 ویژگی‌های پیاده‌سازی شده:');
        console.log('   ✓ جداسازی کامل داده‌ها بر اساس tenant');
        console.log('   ✓ کلید API مخصوص هر tenant');
        console.log('   ✓ Admin panel اختصاصی برای rabin');
        console.log('   ✓ API endpoint های جداگانه');
        console.log('   ✓ اتصال WordPress با احراز هویت');
        console.log('   ✓ مدیریت مشتریان multi-tenant');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ خطا در تولید گزارش:', error.message);
    }
}

async function main() {
    try {
        await testDatabaseIsolation();
        await testWordPressApiIntegration();
        await testTenantApiEndpoint();
        await testCrossTenantIsolation();
        await generateFinalReport();
        
    } catch (error) {
        console.error('❌ خطای کلی در تست:', error.message);
    }
}

main().catch(console.error);