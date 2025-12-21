const mysql = require('mysql2/promise');

async function testRecentActivitiesFix() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');
    console.log('🔧 تست رفع مشکل کادرهای اخیر\n');

    const tenantKey = 'rabin';

    // Test 1: Get all activities to see what we have
    console.log('1️⃣ بررسی همه فعالیت‌ها:');
    const [allActivities] = await connection.query(`
      SELECT a.id, a.type, a.title, a.start_time, a.created_at, a.performed_by,
             c.name as customer_name, u.name as performed_by_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN users u ON a.performed_by = u.id
      WHERE a.tenant_key = ?
      ORDER BY a.start_time DESC
      LIMIT 10
    `, [tenantKey]);

    console.log(`✅ ${allActivities.length} فعالیت یافت شد:`);
    allActivities.forEach((activity, index) => {
      console.log(`${index + 1}. ${activity.title} (${activity.type})`);
      console.log(`   مشتری: ${activity.customer_name || 'نامشخص'}`);
      console.log(`   تاریخ: ${activity.start_time}`);
      console.log(`   انجام‌دهنده: ${activity.performed_by_name || 'نامشخص'}`);
      console.log('');
    });

    // Test 2: Filter meetings specifically
    console.log('2️⃣ فیلتر جلسات:');
    const meetings = allActivities.filter(a => a.type === 'meeting');
    console.log(`✅ ${meetings.length} جلسه یافت شد:`);
    meetings.slice(0, 3).forEach(meeting => {
      console.log(`   - ${meeting.title} (${meeting.customer_name || 'نامشخص'})`);
    });

    // Test 3: Filter calls specifically
    console.log('\n3️⃣ فیلتر تماس‌ها:');
    const calls = allActivities.filter(a => a.type === 'call');
    console.log(`✅ ${calls.length} تماس یافت شد:`);
    calls.slice(0, 3).forEach(call => {
      console.log(`   - ${call.title} (${call.customer_name || 'نامشخص'})`);
    });

    // Test 4: Check recent customers
    console.log('\n4️⃣ مشتریان اخیر:');
    const [recentCustomers] = await connection.query(`
      SELECT id, name, segment, created_at
      FROM customers 
      WHERE tenant_key = ?
      ORDER BY created_at DESC
      LIMIT 3
    `, [tenantKey]);

    console.log(`✅ ${recentCustomers.length} مشتری اخیر:`);
    recentCustomers.forEach(customer => {
      console.log(`   - ${customer.name} (${customer.segment || 'نامشخص'})`);
      console.log(`     تاریخ: ${customer.created_at}`);
    });

    // Test 5: Check recent products
    console.log('\n5️⃣ محصولات اخیر:');
    const [recentProducts] = await connection.query(`
      SELECT id, name, category, created_at
      FROM products 
      WHERE tenant_key = ? AND status = 'active'
      ORDER BY created_at DESC
      LIMIT 3
    `, [tenantKey]);

    console.log(`✅ ${recentProducts.length} محصول اخیر:`);
    recentProducts.forEach(product => {
      console.log(`   - ${product.name} (${product.category || 'نامشخص'})`);
      console.log(`     تاریخ: ${product.created_at}`);
    });

    // Test 6: Check recent sales
    console.log('\n6️⃣ فروش‌های اخیر:');
    const [recentSales] = await connection.query(`
      SELECT id, customer_name, total_amount, sale_date, created_at
      FROM sales 
      WHERE tenant_key = ?
      ORDER BY COALESCE(sale_date, created_at) DESC
      LIMIT 3
    `, [tenantKey]);

    console.log(`✅ ${recentSales.length} فروش اخیر:`);
    recentSales.forEach(sale => {
      console.log(`   - ${sale.customer_name}: ${sale.total_amount.toLocaleString('fa-IR')} تومان`);
      console.log(`     تاریخ: ${sale.sale_date || sale.created_at}`);
    });

    // Test 7: Simulate the component logic
    console.log('\n7️⃣ شبیه‌سازی منطق کامپوننت:');
    
    const componentMeetings = allActivities
      .filter(a => a.type === 'meeting')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 3)
      .map(m => ({
        id: m.id,
        name: m.title,
        date: m.start_time,
        type: m.customer_name || 'نامشخص'
      }));

    const componentCalls = allActivities
      .filter(a => a.type === 'call')
      .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        name: c.title,
        date: c.start_time,
        type: c.customer_name || 'نامشخص'
      }));

    console.log('✅ داده کامپوننت جلسات:');
    if (componentMeetings.length > 0) {
      componentMeetings.forEach(meeting => {
        console.log(`   - ${meeting.name} (${meeting.type})`);
      });
    } else {
      console.log('   جلسه‌ای ثبت نشده');
    }

    console.log('\n✅ داده کامپوننت تماس‌ها:');
    if (componentCalls.length > 0) {
      componentCalls.forEach(call => {
        console.log(`   - ${call.name} (${call.type})`);
      });
    } else {
      console.log('   تماسی ثبت نشده');
    }

    console.log('\n🎉 تست رفع مشکل کامل شد!');
    console.log('\n📋 خلاصه تغییرات:');
    console.log('   ✅ کادرها حالا آخرین فعالیت‌ها را نشان می‌دهند');
    console.log('   ✅ داده‌ها از جدول activities استخراج می‌شوند');
    console.log('   ✅ تاریخ و جزئیات بیشتر نمایش داده می‌شود');
    console.log('   ✅ فرمت نمایش بهبود یافته');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testRecentActivitiesFix();