const mysql = require('mysql2/promise');

async function debugActivityAPIError() {
  console.log('🔍 بررسی خطای 500 در API ثبت فعالیت‌ها...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system',
    charset: 'utf8mb4'
  });

  try {
    // 1. بررسی ساختار جدول activities
    console.log('1️⃣ بررسی ساختار جدول activities:');
    const [structure] = await connection.query('DESCRIBE activities');
    
    // بررسی فیلدهای مهم
    const requiredFields = ['id', 'tenant_key', 'customer_id', 'type', 'title', 'performed_by'];
    const existingFields = structure.map(field => field.Field);
    
    console.log('✅ فیلدهای موجود:', existingFields.join(', '));
    
    const missingFields = requiredFields.filter(field => !existingFields.includes(field));
    if (missingFields.length > 0) {
      console.log('❌ فیلدهای گمشده:', missingFields.join(', '));
    } else {
      console.log('✅ همه فیلدهای ضروری موجودند');
    }

    // 2. بررسی constraints و indexes
    console.log('\n2️⃣ بررسی constraints:');
    const [indexes] = await connection.query(`
      SHOW INDEX FROM activities
    `);
    console.table(indexes.map(idx => ({
      Key_name: idx.Key_name,
      Column_name: idx.Column_name,
      Non_unique: idx.Non_unique
    })));

    // 3. تست مستقیم INSERT با داده‌های واقعی
    console.log('\n3️⃣ تست مستقیم INSERT:');
    
    // گرفتن یک مشتری واقعی
    const [customers] = await connection.query(`
      SELECT id, name FROM customers WHERE tenant_key = 'rabin' LIMIT 1
    `);
    
    if (customers.length === 0) {
      console.log('❌ هیچ مشتری‌ای یافت نشد');
      return;
    }

    const testCustomer = customers[0];
    console.log('👤 مشتری تست:', testCustomer.name, '(', testCustomer.id, ')');

    // گرفتن یک کاربر واقعی
    const [users] = await connection.query(`
      SELECT id, name FROM users WHERE tenant_key = 'rabin' LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('❌ هیچ کاربری یافت نشد');
      return;
    }

    const testUser = users[0];
    console.log('👨‍💼 کاربر تست:', testUser.name, '(', testUser.id, ')');

    // تست INSERT با UUID() function
    try {
      console.log('\n🧪 تست 1: INSERT با UUID() function');
      const [result1] = await connection.query(`
        INSERT INTO activities (
          id, tenant_key, customer_id, type, title, description, 
          outcome, start_time, performed_by, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'rabin',
        testCustomer.id,
        'call',
        'تست API Debug 1',
        'تست برای بررسی خطای 500',
        'completed',
        new Date().toISOString(),
        testUser.id
      ]);
      console.log('✅ تست 1 موفق - insertId:', result1.insertId);
    } catch (error1) {
      console.log('❌ تست 1 ناموفق:', error1.message);
      console.log('SQL State:', error1.sqlState);
      console.log('Error Code:', error1.code);
    }

    // تست INSERT با manual UUID
    try {
      console.log('\n🧪 تست 2: INSERT با manual UUID');
      const manualUUID = require('crypto').randomUUID();
      const [result2] = await connection.query(`
        INSERT INTO activities (
          id, tenant_key, customer_id, type, title, description, 
          outcome, start_time, performed_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        manualUUID,
        'rabin',
        testCustomer.id,
        'call',
        'تست API Debug 2',
        'تست برای بررسی خطای 500',
        'completed',
        new Date().toISOString(),
        testUser.id
      ]);
      console.log('✅ تست 2 موفق - insertId:', result2.insertId);
    } catch (error2) {
      console.log('❌ تست 2 ناموفق:', error2.message);
      console.log('SQL State:', error2.sqlState);
      console.log('Error Code:', error2.code);
    }

    // 4. بررسی مشکلات احتمالی در API
    console.log('\n4️⃣ بررسی مشکلات احتمالی در API:');

    // بررسی session/auth
    console.log('🔐 بررسی sessions:');
    try {
      const [sessions] = await connection.query(`
        SELECT user_id, created_at, expires_at
        FROM user_sessions 
        WHERE user_id IN (SELECT id FROM users WHERE tenant_key = 'rabin')
        ORDER BY created_at DESC 
        LIMIT 3
      `);
      console.table(sessions);
    } catch (sessionError) {
      console.log('❌ خطا در بررسی sessions:', sessionError.message);
    }

    // بررسی charset و collation
    console.log('\n📝 بررسی charset و collation:');
    const [tableInfo] = await connection.query(`
      SELECT TABLE_COLLATION, TABLE_COMMENT
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'crm_system' AND TABLE_NAME = 'activities'
    `);
    console.table(tableInfo);

    // 5. شبیه‌سازی کامل API call
    console.log('\n5️⃣ شبیه‌سازی کامل API call:');
    
    const apiData = {
      customer_id: testCustomer.id,
      type: 'call',
      title: 'تست کامل API',
      description: 'شبیه‌سازی کامل درخواست از فرانت‌اند',
      outcome: 'completed',
      start_time: new Date().toISOString()
    };

    console.log('📤 داده‌های API:');
    console.log(JSON.stringify(apiData, null, 2));

    // Validation مانند API
    if (!apiData.customer_id || !apiData.title) {
      console.log('❌ Validation failed: customer_id یا title خالی است');
      return;
    }

    // INSERT مانند API
    try {
      const [apiResult] = await connection.query(`
        INSERT INTO activities (
          id, tenant_key, customer_id, type, title, description, 
          outcome, start_time, performed_by, created_at
        ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      `, [
        'rabin',
        apiData.customer_id,
        apiData.type || 'call',
        apiData.title,
        apiData.description || null,
        apiData.outcome || 'completed',
        apiData.start_time || new Date().toISOString(),
        testUser.id // userId from session
      ]);

      console.log('✅ شبیه‌سازی API موفق - insertId:', apiResult.insertId);

      // بررسی رکورد ثبت شده
      const [newRecord] = await connection.query(`
        SELECT a.*, c.name as customer_name, u.name as user_name
        FROM activities a
        LEFT JOIN customers c ON a.customer_id = c.id
        LEFT JOIN users u ON a.performed_by = u.id
        WHERE a.tenant_key = 'rabin'
        ORDER BY a.created_at DESC
        LIMIT 1
      `);
      
      console.log('\n📋 رکورد ثبت شده:');
      console.table(newRecord);

    } catch (apiError) {
      console.log('❌ شبیه‌سازی API ناموفق:', apiError.message);
      console.log('SQL State:', apiError.sqlState);
      console.log('Error Code:', apiError.code);
      console.log('SQL:', apiError.sql);
    }

    // 6. نکات مهم برای رفع مشکل
    console.log('\n6️⃣ نکات مهم برای رفع مشکل:');
    console.log('🔍 مراحل بررسی در production:');
    console.log('1. بررسی لاگ‌های سرور (console.error در API)');
    console.log('2. بررسی Network tab در Developer Tools');
    console.log('3. بررسی Request Headers (X-Tenant-Key, Authorization)');
    console.log('4. بررسی Request Body (JSON format)');
    console.log('5. بررسی Database connection در production');

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    await connection.end();
  }
}

debugActivityAPIError().catch(console.error);