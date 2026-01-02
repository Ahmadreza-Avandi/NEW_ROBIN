const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function testTenantFixFinal() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. بررسی کاربر aghbanushop
    console.log('\n👤 بررسی کاربر aghbanushop...');
    const [aghbanushopUser] = await connection.execute(`
      SELECT id, name, email, role, tenant_key, status
      FROM users 
      WHERE email = 'info@aghbanushop.ir'
    `);
    
    if (aghbanushopUser.length > 0) {
      const user = aghbanushopUser[0];
      console.log(`✅ کاربر: ${user.name} - Tenant: ${user.tenant_key}`);
      
      // 2. شمارش وظایف هر tenant
      console.log('\n📊 آمار وظایف بر اساس tenant...');
      const [taskStats] = await connection.execute(`
        SELECT tenant_key, COUNT(*) as count 
        FROM tasks 
        GROUP BY tenant_key 
        ORDER BY tenant_key
      `);
      
      taskStats.forEach(stat => {
        console.log(`   - ${stat.tenant_key || 'NULL'}: ${stat.count} وظیفه`);
      });
      
      // 3. شمارش گزارشات هر tenant
      console.log('\n📊 آمار گزارشات بر اساس tenant...');
      const [reportStats] = await connection.execute(`
        SELECT tenant_key, COUNT(*) as count 
        FROM daily_reports 
        GROUP BY tenant_key 
        ORDER BY tenant_key
      `);
      
      reportStats.forEach(stat => {
        console.log(`   - ${stat.tenant_key || 'NULL'}: ${stat.count} گزارش`);
      });
      
      // 4. تست query که API باید اجرا کنه
      console.log('\n🔍 تست query برای tenant aghbanushop...');
      const [aghbanushopTasks] = await connection.execute(`
        SELECT 
          t.*,
          u1.name as assigned_to_name,
          u2.name as assigned_by_name
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.assigned_by = u2.id
        WHERE t.tenant_key = ?
        ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
      `, ['aghbanushop']);
      
      console.log(`📋 وظایف aghbanushop: ${aghbanushopTasks.length}`);
      aghbanushopTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title} (${task.status}) - ${task.priority}`);
      });
      
      // 5. تست query برای tenant rabin
      console.log('\n🔍 تست query برای tenant rabin...');
      const [rabinTasks] = await connection.execute(`
        SELECT 
          t.*,
          u1.name as assigned_to_name,
          u2.name as assigned_by_name
        FROM tasks t
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.assigned_by = u2.id
        WHERE t.tenant_key = ?
        ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
        LIMIT 5
      `, ['rabin']);
      
      console.log(`📋 وظایف rabin (نمونه): ${rabinTasks.length}`);
      rabinTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. ${task.title} (${task.status}) - ${task.priority}`);
      });
      
    } else {
      console.log('❌ کاربر aghbanushop پیدا نشد');
    }

    console.log('\n✅ تست کامل شد!');
    console.log('\n💡 اگر هنوز مشکل دارید:');
    console.log('1. NextJS server را restart کنید');
    console.log('2. Browser cache را پاک کنید');
    console.log('3. دوباره login کنید');

  } catch (error) {
    console.error('❌ خطا در تست:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTenantFixFinal();