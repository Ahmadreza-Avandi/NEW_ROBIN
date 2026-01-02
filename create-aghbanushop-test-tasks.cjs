const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function createAghbanushopTestTasks() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. پیدا کردن کاربر aghbanushop
    const [aghbanushopUser] = await connection.execute(`
      SELECT id, name, email, role, tenant_key 
      FROM users 
      WHERE email = 'info@aghbanushop.ir'
    `);
    
    if (aghbanushopUser.length === 0) {
      console.log('❌ کاربر aghbanushop پیدا نشد');
      return;
    }
    
    const user = aghbanushopUser[0];
    console.log(`✅ کاربر پیدا شد: ${user.name} - Tenant: ${user.tenant_key}`);

    // 2. ایجاد وظایف تست برای tenant aghbanushop
    const testTasks = [
      {
        title: 'بررسی و تحلیل نیازهای مشتریان آقبانو شاپ',
        description: 'تحلیل کامل نیازهای مشتریان فروشگاه آقبانو شاپ و ارائه راهکارهای مناسب',
        priority: 'high',
        category: 'analysis',
        status: 'pending'
      },
      {
        title: 'طراحی استراتژی فروش برای محصولات آقبانو شاپ',
        description: 'تدوین استراتژی فروش مناسب برای افزایش فروش محصولات فروشگاه',
        priority: 'medium',
        category: 'strategy',
        status: 'pending'
      },
      {
        title: 'پیگیری مشتریان بالقوه آقبانو شاپ',
        description: 'تماس و پیگیری مشتریان بالقوه که علاقه به محصولات نشان داده‌اند',
        priority: 'high',
        category: 'follow_up',
        status: 'in_progress'
      },
      {
        title: 'آماده‌سازی گزارش عملکرد ماهانه',
        description: 'تهیه گزارش کامل از عملکرد فروش و بازاریابی ماه گذشته',
        priority: 'medium',
        category: 'reporting',
        status: 'pending'
      }
    ];

    console.log('\n📝 ایجاد وظایف تست...');
    
    for (const task of testTasks) {
      const taskId = uuidv4();
      
      await connection.execute(`
        INSERT INTO tasks (
          id, title, description, assigned_to, assigned_by, priority, 
          category, status, tenant_key, created_at, due_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
      `, [
        taskId,
        task.title,
        task.description,
        user.id,
        user.id,
        task.priority,
        task.category,
        task.status,
        'aghbanushop'
      ]);
      
      console.log(`✅ وظیفه ایجاد شد: ${task.title}`);
    }

    // 3. بررسی وظایف ایجاد شده
    console.log('\n📋 بررسی وظایف ایجاد شده...');
    const [createdTasks] = await connection.execute(`
      SELECT id, title, status, priority, tenant_key, created_at
      FROM tasks 
      WHERE tenant_key = 'aghbanushop'
      ORDER BY created_at DESC
    `);
    
    console.log(`📊 تعداد وظایف aghbanushop: ${createdTasks.length}`);
    createdTasks.forEach(task => {
      console.log(`  - ${task.title} (${task.status}) - Priority: ${task.priority}`);
    });

    // 4. تست API query
    console.log('\n🔍 تست query API...');
    const [apiResult] = await connection.execute(`
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
    
    console.log(`📊 نتیجه API query: ${apiResult.length} وظیفه`);
    apiResult.forEach(task => {
      console.log(`  - ${task.title} - Assigned to: ${task.assigned_to_name}`);
    });

    console.log('\n✅ وظایف تست با موفقیت ایجاد شدند!');
    console.log('🌐 حالا می‌توانید به http://localhost:3000/aghbanushop/dashboard/tasks بروید');

  } catch (error) {
    console.error('❌ خطا در ایجاد وظایف:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAghbanushopTestTasks();