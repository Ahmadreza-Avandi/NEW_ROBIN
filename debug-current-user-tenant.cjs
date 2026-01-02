const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function debugCurrentUserTenant() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. بررسی کاربر aghbanushop در دیتابیس
    console.log('\n👤 بررسی کاربر aghbanushop در دیتابیس...');
    const [aghbanushopUser] = await connection.execute(`
      SELECT id, name, email, role, tenant_key, status
      FROM users 
      WHERE email = 'info@aghbanushop.ir'
    `);
    
    if (aghbanushopUser.length > 0) {
      const user = aghbanushopUser[0];
      console.log(`✅ کاربر در دیتابیس: ${user.name}`);
      console.log(`   - ID: ${user.id}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Tenant Key: ${user.tenant_key}`);
      console.log(`   - Status: ${user.status}`);
      
      // 2. ایجاد JWT token جدید برای تست
      console.log('\n🔑 ایجاد JWT token جدید...');
      const newToken = jwt.sign(
        {
          id: user.id,
          userId: user.id,
          email: user.email,
          role: user.role,
          tenantKey: user.tenant_key,
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      console.log('✅ Token جدید ایجاد شد');
      console.log(`Token: ${newToken.substring(0, 50)}...`);
      
      // 3. تست decode کردن token
      console.log('\n🔍 تست decode token...');
      const decoded = jwt.verify(newToken, JWT_SECRET);
      console.log('Decoded token:');
      console.log(`   - ID: ${decoded.id}`);
      console.log(`   - Email: ${decoded.email}`);
      console.log(`   - Role: ${decoded.role}`);
      console.log(`   - Tenant Key: ${decoded.tenantKey}`);
      
      // 4. تست getCurrentUser simulation
      console.log('\n🔄 شبیه‌سازی getCurrentUser...');
      const userId = decoded.id || decoded.userId;
      const [users] = await connection.execute(
        'SELECT id, name, email, role, avatar_url, tenant_key FROM users WHERE id = ? AND status = "active"',
        [userId]
      );
      
      if (users.length > 0) {
        const currentUser = users[0];
        console.log('✅ getCurrentUser result:');
        console.log(`   - ID: ${currentUser.id}`);
        console.log(`   - Name: ${currentUser.name}`);
        console.log(`   - Email: ${currentUser.email}`);
        console.log(`   - Role: ${currentUser.role}`);
        console.log(`   - Tenant Key: ${currentUser.tenant_key}`);
        
        // 5. تست tasks query با tenant_key صحیح
        console.log('\n📋 تست tasks query...');
        const tenantKey = currentUser.tenant_key || 'rabin';
        console.log(`🔑 Using tenant_key: ${tenantKey}`);
        
        const [tasks] = await connection.execute(`
          SELECT 
            t.*,
            u1.name as assigned_to_name,
            u2.name as assigned_by_name
          FROM tasks t
          LEFT JOIN users u1 ON t.assigned_to = u1.id
          LEFT JOIN users u2 ON t.assigned_by = u2.id
          WHERE t.tenant_key = ?
          ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
          LIMIT 10
        `, [tenantKey]);
        
        console.log(`📊 Tasks found: ${tasks.length}`);
        tasks.forEach(task => {
          console.log(`   - ${task.title} (${task.status}) - Tenant: ${task.tenant_key}`);
        });
        
      } else {
        console.log('❌ getCurrentUser simulation failed - user not found');
      }
      
    } else {
      console.log('❌ کاربر aghbanushop در دیتابیس پیدا نشد');
    }

    // 6. بررسی همه وظایف و tenant_key آنها
    console.log('\n📊 بررسی همه وظایف...');
    const [allTasks] = await connection.execute(`
      SELECT id, title, tenant_key, assigned_to, created_at
      FROM tasks 
      ORDER BY created_at DESC
      LIMIT 15
    `);
    
    console.log('همه وظایف:');
    allTasks.forEach(task => {
      console.log(`   - ${task.title.substring(0, 40)}... - Tenant: ${task.tenant_key} - ID: ${task.id}`);
    });

  } catch (error) {
    console.error('❌ خطا در بررسی:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugCurrentUserTenant();