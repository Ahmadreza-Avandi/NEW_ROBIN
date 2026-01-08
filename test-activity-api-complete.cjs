const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

async function testActivityAPIComplete() {
  console.log('🔍 تست کامل API ثبت فعالیت‌ها...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system',
    charset: 'utf8mb4'
  });

  try {
    // 1. بررسی کاربران و sessions
    console.log('1️⃣ بررسی کاربران موجود:');
    const [users] = await connection.query(`
      SELECT id, name, email, role, tenant_key, status
      FROM users 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.table(users);

    if (users.length === 0) {
      console.log('❌ هیچ کاربری یافت نشد');
      return;
    }

    const testUser = users[0];
    console.log('👨‍💼 کاربر تست:', testUser.name, '(', testUser.id, ')');

    // 2. ایجاد JWT token برای تست
    console.log('\n2️⃣ ایجاد JWT token:');
    const JWT_SECRET = 'dH7c6ztueTpi0SrAt9TaMsqQfRrfi5HV2gTt9H7vxS3xusjbRKb4gIaqKud'; // از .env
    
    const tokenPayload = {
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role,
      tenantKey: 'rabin',
      name: testUser.name,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });
    console.log('🔑 Token ایجاد شد:', token.substring(0, 50) + '...');

    // تست تایید token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token معتبر است');
      console.log('📋 محتوای token:', JSON.stringify(decoded, null, 2));
    } catch (tokenError) {
      console.log('❌ Token نامعتبر:', tokenError.message);
      return;
    }

    // 3. بررسی مشتریان
    console.log('\n3️⃣ بررسی مشتریان:');
    const [customers] = await connection.query(`
      SELECT id, name, tenant_key
      FROM customers 
      WHERE tenant_key = 'rabin' 
      LIMIT 3
    `);
    console.table(customers);

    if (customers.length === 0) {
      console.log('❌ هیچ مشتری‌ای یافت نشد');
      return;
    }

    const testCustomer = customers[0];

    // 4. شبیه‌سازی کامل API request
    console.log('\n4️⃣ شبیه‌سازی کامل API request:');
    
    const requestData = {
      customer_id: testCustomer.id,
      type: 'call',
      title: 'تست کامل API - شبیه‌سازی',
      description: 'این تست کامل برای بررسی مشکل 500 است',
      outcome: 'completed',
      start_time: new Date().toISOString()
    };

    console.log('📤 Request data:');
    console.log(JSON.stringify(requestData, null, 2));

    console.log('\n📋 Headers:');
    console.log('X-Tenant-Key: rabin');
    console.log('Authorization: Bearer ' + token.substring(0, 30) + '...');
    console.log('Content-Type: application/json');

    // 5. تست validation مانند API
    console.log('\n5️⃣ تست validation:');
    
    if (!requestData.customer_id || !requestData.title) {
      console.log('❌ Validation failed: customer_id یا title خالی است');
      return;
    }
    console.log('✅ Validation passed');

    // 6. تست database operation مانند API
    console.log('\n6️⃣ تست database operation:');
    
    try {
      const [result] = await connection.query(`
        INSERT INTO activities (
          id, tenant_key, customer_id, type, title, description, 
          outcome, start_time, performed_by, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'rabin',
        requestData.customer_id,
        requestData.type || 'call',
        requestData.title,
        requestData.description || null,
        requestData.outcome || 'completed',
        requestData.start_time || new Date().toISOString(),
        testUser.id
      ]);

      console.log('✅ Database operation موفق - insertId:', result.insertId);

      // بررسی رکورد ثبت شده
      const [newActivity] = await connection.query(`
        SELECT a.*, c.name as customer_name, u.name as user_name
        FROM activities a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN users u ON a.performed_by = u.id
        WHERE a.tenant_key = 'rabin'
        ORDER BY a.created_at DESC
        LIMIT 1
      `);
      
      console.log('\n📋 رکورد ثبت شده:');
      console.table(newActivity);

    } catch (dbError) {
      console.log('❌ Database operation ناموفق:', dbError.message);
      console.log('SQL State:', dbError.sqlState);
      console.log('Error Code:', dbError.code);
    }

    // 7. بررسی مشکلات احتمالی
    console.log('\n7️⃣ بررسی مشکلات احتمالی:');

    // بررسی اتصال database
    try {
      await connection.query('SELECT 1');
      console.log('✅ Database connection سالم است');
    } catch (connError) {
      console.log('❌ Database connection مشکل دارد:', connError.message);
    }

    // بررسی charset
    const [charset] = await connection.query('SELECT @@character_set_database, @@collation_database');
    console.log('📝 Database charset:', charset[0]);

    // 8. راهنمای تست در production
    console.log('\n8️⃣ راهنمای تست در production:');
    console.log('🌐 URL: https://crm.robintejarat.com/api/tenant/activities');
    console.log('📋 Headers مورد نیاز:');
    console.log('   X-Tenant-Key: rabin');
    console.log('   Authorization: Bearer [your-token]');
    console.log('   Content-Type: application/json');
    
    console.log('\n📤 Sample request body:');
    console.log(JSON.stringify({
      customer_id: testCustomer.id,
      type: 'call',
      title: 'تست از production',
      description: 'تست برای بررسی مشکل',
      outcome: 'completed'
    }, null, 2));

    console.log('\n🔍 مراحل debug در production:');
    console.log('1. بررسی console.error در server logs');
    console.log('2. بررسی Network tab در Developer Tools');
    console.log('3. بررسی Response body برای جزئیات خطا');
    console.log('4. تست با Postman یا curl');

    console.log('\n🔧 نکات مهم:');
    console.log('- مطمئن شوید که لاگین کرده‌اید');
    console.log('- Token را از cookie auth-token بگیرید');
    console.log('- مشتری را از لیست انتخاب کنید');
    console.log('- عنوان را پر کنید');

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    await connection.end();
  }
}

testActivityAPIComplete().catch(console.error);