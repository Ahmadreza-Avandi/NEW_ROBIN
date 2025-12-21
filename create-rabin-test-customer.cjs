const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

async function createRabinTestCustomer() {
    console.log('👤 ایجاد مشتری تست برای tenant rabin...');
    
    try {
        const connection = await mysql.createConnection(DB_CONFIG);
        
        const customerId = uuidv4();
        const tenantKey = 'rabin';
        
        // Create a test customer
        await connection.execute(`
            INSERT INTO customers (
                id, tenant_key, name, email, phone, company_name, 
                address, city, state, country, segment, priority, 
                status, source, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            customerId,
            tenantKey,
            'علی احمدی',
            'ali.ahmadi@rabin.com',
            '+989123456789',
            'شرکت رابین',
            'تهران، خیابان ولیعصر',
            'تهران',
            'تهران',
            'ایران',
            'small_business',
            'high',
            'active',
            'manual'
        ]);
        
        console.log('✅ مشتری تست برای tenant rabin ایجاد شد:');
        console.log('- نام: علی احمدی');
        console.log('- ایمیل: ali.ahmadi@rabin.com');
        console.log('- شرکت: شرکت رابین');
        console.log('- Tenant: rabin');
        
        // Create a WordPress customer too
        const wpCustomerId = uuidv4();
        await connection.execute(`
            INSERT INTO customers (
                id, tenant_key, name, email, phone, company_name, 
                segment, priority, status, source, wordpress_user_id, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            wpCustomerId,
            tenantKey,
            'سارا محمدی',
            'sara.mohammadi@example.com',
            '+989987654321',
            'شرکت نمونه',
            'medium',
            'medium',
            'prospect',
            'wordpress',
            12345
        ]);
        
        console.log('✅ مشتری WordPress تست نیز ایجاد شد:');
        console.log('- نام: سارا محمدی');
        console.log('- ایمیل: sara.mohammadi@example.com');
        console.log('- منبع: WordPress');
        console.log('- WordPress User ID: 12345');
        
        await connection.end();
        
        console.log('\n📋 اطلاعات دسترسی:');
        console.log('- Admin Panel: http://localhost:3000/rabin/admin-panel');
        console.log('- API Endpoint: http://localhost:3000/api/tenants/rabin/customers');
        
    } catch (error) {
        console.error('❌ خطا در ایجاد مشتری تست:', error.message);
    }
}

createRabinTestCustomer().catch(console.error);