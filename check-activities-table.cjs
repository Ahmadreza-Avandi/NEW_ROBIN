const mysql = require('mysql2/promise');

async function checkActivitiesTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔍 بررسی جدول activities...');
    
    // نمایش ساختار جدول
    const [columns] = await connection.query('DESCRIBE activities');
    console.log('\n📋 ستون‌های جدول activities:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(nullable)' : '(not null)'} ${col.Key ? `[${col.Key}]` : ''}`);
    });

    // نمایش آخرین فعالیت‌ها
    const [activities] = await connection.query(`
      SELECT id, type, title, description, created_at, performed_by 
      FROM activities 
      WHERE tenant_key = 'rabin' 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    console.log('\n📋 آخرین فعالیت‌ها:');
    activities.forEach(activity => {
      console.log(`  - ${activity.type}: ${activity.title} | ${activity.created_at} | توسط: ${activity.performed_by}`);
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

checkActivitiesTable();