const mysql = require('mysql2/promise');

async function testProductActivity() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 بررسی فعالیت‌های محصول...');
    
    // نمایش آخرین فعالیت‌ها
    const [activities] = await connection.query(`
      SELECT a.id, a.type, a.title, a.description, a.created_at, a.performed_by, u.name as user_name
      FROM activities a
      LEFT JOIN users u ON a.performed_by = u.id
      WHERE a.tenant_key = 'rabin' 
      ORDER BY a.created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 آخرین فعالیت‌ها:');
    activities.forEach(activity => {
      console.log(`  - ${activity.type}: ${activity.title}`);
      console.log(`    توضیحات: ${activity.description || 'ندارد'}`);
      console.log(`    توسط: ${activity.user_name || activity.performed_by}`);
      console.log(`    تاریخ: ${activity.created_at}`);
      console.log('    ---');
    });

    // بررسی فعالیت‌های محصول
    const [productActivities] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM activities 
      WHERE tenant_key = 'rabin' AND type = 'product'
    `);
    
    console.log(`\n📊 تعداد فعالیت‌های محصول: ${productActivities[0].count}`);

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testProductActivity();