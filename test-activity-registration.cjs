const mysql = require('mysql2/promise');

async function testActivityRegistration() {
  console.log('🔍 تست ثبت فعالیت‌ها...\n');

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
    console.table(structure);

    // 2. بررسی فعالیت‌های موجود
    console.log('\n2️⃣ فعالیت‌های موجود:');
    const [activities] = await connection.query(`
      SELECT 
        id, tenant_key, customer_id, type, title, 
        start_time, performed_by, created_at
      FROM activities 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(activities);

    // 3. بررسی مشتریان موجود
    console.log('\n3️⃣ مشتریان موجود:');
    const [customers] = await connection.query(`
      SELECT id, name, tenant_key, created_at
      FROM customers 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.table(customers);

    // 4. تست ثبت فعالیت جدید
    console.log('\n4️⃣ تست ثبت فعالیت جدید:');
    
    if (customers.length > 0) {
      const testCustomer = customers[0];
      
      try {
        const [result] = await connection.query(`
          INSERT INTO activities (
            id, tenant_key, customer_id, type, title, description, 
            outcome, start_time, performed_by, created_at
          ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          'rabin',
          testCustomer.id,
          'call',
          'تست ثبت فعالیت',
          'این یک تست برای بررسی ثبت فعالیت است',
          'completed',
          new Date().toISOString(),
          'test-user'
        ]);

        console.log('✅ فعالیت تست با موفقیت ثبت شد:', result.insertId);

        // بررسی فعالیت ثبت شده
        const [newActivity] = await connection.query(`
          SELECT * FROM activities 
          WHERE tenant_key = 'rabin' 
          ORDER BY created_at DESC 
          LIMIT 1
        `);
        console.log('📝 فعالیت ثبت شده:');
        console.table(newActivity);

      } catch (insertError) {
        console.error('❌ خطا در ثبت فعالیت:', insertError.message);
        console.error('SQL State:', insertError.sqlState);
        console.error('Error Code:', insertError.code);
      }
    } else {
      console.log('⚠️ هیچ مشتری‌ای برای تست یافت نشد');
    }

    // 5. بررسی کاربران موجود
    console.log('\n5️⃣ کاربران موجود:');
    const [users] = await connection.query(`
      SELECT id, name, username, role, tenant_key
      FROM users 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.table(users);

    // 6. بررسی session و auth
    console.log('\n6️⃣ بررسی sessions:');
    const [sessions] = await connection.query(`
      SELECT user_id, tenant_key, created_at, expires_at
      FROM user_sessions 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.table(sessions);

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    await connection.end();
  }
}

testActivityRegistration().catch(console.error);