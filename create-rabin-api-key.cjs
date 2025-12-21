const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

async function createRabinApiKey() {
    console.log('🔑 ایجاد کلید API برای tenant rabin...');
    
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        const apiKey = 'wp_crm_rabin_' + crypto.randomBytes(32).toString('hex');
        const keyId = uuidv4();
        
        await connection.execute(`
            INSERT INTO wordpress_api_keys (
                id, tenant_key, name, api_key, created_at, is_active
            ) VALUES (?, ?, ?, ?, NOW(), TRUE)
            ON DUPLICATE KEY UPDATE 
                api_key = VALUES(api_key)
        `, [keyId, 'rabin', 'WordPress Plugin - Rabin Tenant', apiKey]);
        
        console.log('✅ کلید API برای tenant rabin ایجاد شد:');
        console.log('Tenant Key: rabin');
        console.log('API Key:', apiKey);
        console.log('');
        console.log('📋 اطلاعات اتصال:');
        console.log('- CRM URL: http://localhost:3000');
        console.log('- Admin Panel: http://localhost:3000/rabin/admin-panel');
        console.log('- API Endpoint: http://localhost:3000/api/integrations/wordpress/customers');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ خطا در ایجاد کلید API:', error.message);
    }
}

createRabinApiKey().catch(console.error);