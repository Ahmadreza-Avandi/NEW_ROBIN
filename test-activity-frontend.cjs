const mysql = require('mysql2/promise');

async function testActivityFrontend() {
  console.log('🔍 تست مشکل فرانت‌اند ثبت فعالیت‌ها...\n');

  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system',
    charset: 'utf8mb4'
  });

  try {
    // 1. بررسی مشتریان برای انتخاب در فرم
    console.log('1️⃣ مشتریان قابل انتخاب در فرم:');
    const [customers] = await connection.query(`
      SELECT id, name, phone, email, segment, tenant_key
      FROM customers 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    console.table(customers);

    // 2. شبیه‌سازی درخواست POST از فرانت‌اند
    console.log('\n2️⃣ شبیه‌سازی درخواست POST:');
    
    if (customers.length > 0) {
      const testCustomer = customers[0];
      
      // داده‌هایی که فرانت‌اند ارسال می‌کنه
      const activityData = {
        customer_id: testCustomer.id,
        type: 'call',
        title: 'تست فرانت‌اند - تماس با مشتری',
        description: 'این تست برای بررسی مشکل فرانت‌اند است',
        outcome: 'completed',
        start_time: new Date().toISOString()
      };

      console.log('📤 داده‌های ارسالی:');
      console.log(JSON.stringify(activityData, null, 2));

      // بررسی validation
      console.log('\n3️⃣ بررسی validation:');
      
      const validationErrors = [];
      
      if (!activityData.customer_id) {
        validationErrors.push('❌ customer_id الزامی است');
      }
      
      if (!activityData.title) {
        validationErrors.push('❌ title الزامی است');
      }

      if (validationErrors.length > 0) {
        console.log('❌ خطاهای validation:');
        validationErrors.forEach(error => console.log(error));
        return;
      }

      console.log('✅ validation موفق');

      // تست ثبت با داده‌های فرانت‌اند
      try {
        const [result] = await connection.query(`
          INSERT INTO activities (
            id, tenant_key, customer_id, type, title, description, 
            outcome, start_time, performed_by, created_at
          ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          'rabin',
          activityData.customer_id,
          activityData.type,
          activityData.title,
          activityData.description,
          activityData.outcome,
          activityData.start_time,
          'frontend-test-user'
        ]);

        console.log('✅ ثبت فعالیت از فرانت‌اند موفق:', result.insertId);

        // بررسی فعالیت ثبت شده
        const [newActivity] = await connection.query(`
          SELECT a.*, c.name as customer_name
          FROM activities a
          LEFT JOIN customers c ON a.customer_id = c.id
          WHERE a.tenant_key = 'rabin' 
          ORDER BY a.created_at DESC 
          LIMIT 1
        `);
        
        console.log('\n📝 فعالیت ثبت شده با اطلاعات مشتری:');
        console.table(newActivity);

      } catch (insertError) {
        console.error('❌ خطا در ثبت فعالیت:', insertError.message);
        console.error('SQL State:', insertError.sqlState);
        console.error('Error Code:', insertError.code);
      }
    }

    // 4. بررسی مشکلات احتمالی
    console.log('\n4️⃣ بررسی مشکلات احتمالی:');

    // بررسی customer_id های نامعتبر
    const [invalidCustomers] = await connection.query(`
      SELECT DISTINCT customer_id
      FROM activities 
      WHERE tenant_key = 'rabin' 
      AND customer_id NOT IN (
        SELECT id FROM customers WHERE tenant_key = 'rabin'
      )
      LIMIT 5
    `);

    if (invalidCustomers.length > 0) {
      console.log('⚠️ فعالیت‌هایی با customer_id نامعتبر:');
      console.table(invalidCustomers);
    } else {
      console.log('✅ همه customer_id ها معتبرند');
    }

    // بررسی performed_by های نامعتبر
    const [invalidUsers] = await connection.query(`
      SELECT DISTINCT performed_by
      FROM activities 
      WHERE tenant_key = 'rabin' 
      AND performed_by NOT IN (
        SELECT id FROM users WHERE tenant_key = 'rabin'
      )
      AND performed_by NOT LIKE '%test%'
      LIMIT 5
    `);

    if (invalidUsers.length > 0) {
      console.log('⚠️ فعالیت‌هایی با performed_by نامعتبر:');
      console.table(invalidUsers);
    } else {
      console.log('✅ همه performed_by ها معتبرند');
    }

    // 5. تست API endpoint مستقیم
    console.log('\n5️⃣ نکات مهم برای تست در مرورگر:');
    console.log('🌐 URL: http://localhost:3000/rabin/dashboard/activities');
    console.log('🔑 Headers مورد نیاز:');
    console.log('   - X-Tenant-Key: rabin');
    console.log('   - Authorization: Bearer [token]');
    console.log('   - Content-Type: application/json');
    
    console.log('\n📋 مراحل تست در مرورگر:');
    console.log('1. باز کردن Developer Tools (F12)');
    console.log('2. رفتن به تب Network');
    console.log('3. تلاش برای ثبت فعالیت جدید');
    console.log('4. بررسی درخواست POST به /api/tenant/activities');
    console.log('5. بررسی Response و خطاهای احتمالی');

  } catch (error) {
    console.error('❌ خطای کلی:', error);
  } finally {
    await connection.end();
  }
}

testActivityFrontend().catch(console.error);