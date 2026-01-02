const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function debugAghbanushopTasks() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. بررسی کاربر aghbanushop
    console.log('\n👤 بررسی کاربر aghbanushop...');
    const [aghbanushopUser] = await connection.execute(`
      SELECT id, name, email, role, tenant_key 
      FROM users 
      WHERE email = 'info@aghbanushop.ir'
    `);
    
    if (aghbanushopUser.length > 0) {
      const user = aghbanushopUser[0];
      console.log(`✅ کاربر پیدا شد: ${user.name} - Tenant: ${user.tenant_key}`);
      
      // 2. بررسی وظایف این tenant
      console.log('\n📋 بررسی وظایف tenant aghbanushop...');
      const [aghbanushopTasks] = await connection.execute(`
        SELECT id, title, status, priority, assigned_to, tenant_key, created_at
        FROM tasks 
        WHERE tenant_key = 'aghbanushop'
        ORDER BY created_at DESC
      `);
      
      console.log(`📊 تعداد وظایف aghbanushop: ${aghbanushopTasks.length}`);
      if (aghbanushopTasks.length > 0) {
        aghbanushopTasks.forEach(task => {
          console.log(`  - ${task.title} (${task.status}) - ${task.tenant_key}`);
        });
      } else {
        console.log('❌ هیچ وظیفه‌ای برای tenant aghbanushop وجود ندارد');
      }
      
      // 3. بررسی وظایف rabin که ممکنه اشتباهی نمایش داده بشن
      console.log('\n📋 بررسی وظایف tenant rabin...');
      const [rabinTasks] = await connection.execute(`
        SELECT id, title, status, priority, assigned_to, tenant_key, created_at
        FROM tasks 
        WHERE tenant_key = 'rabin'
        ORDER BY created_at DESC
        LIMIT 5
      `);
      
      console.log(`📊 تعداد وظایف rabin: ${rabinTasks.length}`);
      rabinTasks.forEach(task => {
        console.log(`  - ${task.title} (${task.status}) - ${task.tenant_key}`);
      });
      
      // 4. شبیه‌سازی query که API tasks اجرا می‌کنه
      console.log('\n🔍 شبیه‌سازی query API tasks...');
      const tenantKey = user.tenant_key || 'rabin';
      console.log(`🔑 tenant_key استفاده شده: ${tenantKey}`);
      
      const [apiSimulation] = await connection.execute(`
        SELECT 
          t.*,
          c.name as customer_name,
          u1.name as assigned_to_name,
          u2.name as assigned_by_name
        FROM tasks t
        LEFT JOIN customers c ON t.customer_id = c.id
        LEFT JOIN users u1 ON t.assigned_to = u1.id
        LEFT JOIN users u2 ON t.assigned_by = u2.id
        WHERE t.tenant_key = ?
        ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
        LIMIT 10
      `, [tenantKey]);
      
      console.log(`📊 نتیجه شبیه‌سازی API: ${apiSimulation.length} وظیفه`);
      apiSimulation.forEach(task => {
        console.log(`  - ${task.title} (${task.status}) - Tenant: ${task.tenant_key} - Assigned: ${task.assigned_to_name || 'نامشخص'}`);
      });
      
      // 5. بررسی اینکه آیا وظایف به این کاربر assign شدن یا نه
      console.log('\n👥 بررسی وظایف assign شده به این کاربر...');
      const [assignedTasks] = await connection.execute(`
        SELECT t.id, t.title, t.status, t.tenant_key, t.assigned_to
        FROM tasks t
        WHERE t.assigned_to = ? OR EXISTS (
          SELECT 1 FROM task_assignees ta WHERE ta.task_id = t.id AND ta.user_id = ?
        )
        ORDER BY t.created_at DESC
      `, [user.id, user.id]);
      
      console.log(`📊 وظایف assign شده به این کاربر: ${assignedTasks.length}`);
      assignedTasks.forEach(task => {
        console.log(`  - ${task.title} (${task.status}) - Tenant: ${task.tenant_key}`);
      });
      
    } else {
      console.log('❌ کاربر aghbanushop پیدا نشد');
    }

    // 6. پیشنهاد حل مشکل
    console.log('\n💡 راه حل پیشنهادی:');
    console.log('1. ایجاد وظایف تست برای tenant aghbanushop');
    console.log('2. یا تغییر tenant_key وظایف موجود به aghbanushop');
    console.log('3. بررسی middleware و نحوه استخراج tenant_key');

  } catch (error) {
    console.error('❌ خطا در بررسی:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugAghbanushopTasks();