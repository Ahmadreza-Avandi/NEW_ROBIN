const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function testTenantFiltering() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. بررسی ساختار جدول users برای tenant_key
    console.log('\n📋 بررسی ساختار جدول users...');
    const [userColumns] = await connection.execute('DESCRIBE users');
    const hasTenantKey = userColumns.some(col => col.Field === 'tenant_key');
    console.log('✅ فیلد tenant_key در جدول users:', hasTenantKey ? 'موجود' : 'موجود نیست');

    // 2. بررسی ساختار جدول daily_reports برای tenant_key
    console.log('\n📋 بررسی ساختار جدول daily_reports...');
    const [reportColumns] = await connection.execute('DESCRIBE daily_reports');
    const hasReportTenantKey = reportColumns.some(col => col.Field === 'tenant_key');
    console.log('✅ فیلد tenant_key در جدول daily_reports:', hasReportTenantKey ? 'موجود' : 'موجود نیست');

    // 3. بررسی ساختار جدول tasks برای tenant_key
    console.log('\n📋 بررسی ساختار جدول tasks...');
    const [taskColumns] = await connection.execute('DESCRIBE tasks');
    const hasTaskTenantKey = taskColumns.some(col => col.Field === 'tenant_key');
    console.log('✅ فیلد tenant_key در جدول tasks:', hasTaskTenantKey ? 'موجود' : 'موجود نیست');

    // 4. بررسی کاربران موجود و tenant_key آنها
    console.log('\n👥 بررسی کاربران موجود...');
    const [users] = await connection.execute(`
      SELECT id, name, email, role, tenant_key 
      FROM users 
      WHERE status = 'active' 
      ORDER BY tenant_key, name
    `);
    
    console.log('کاربران موجود:');
    users.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - Role: ${user.role} - Tenant: ${user.tenant_key || 'NULL'}`);
    });

    // 5. بررسی توزیع داده‌ها بر اساس tenant
    console.log('\n📊 آمار داده‌ها بر اساس tenant...');
    
    // آمار مشتریان
    const [customerStats] = await connection.execute(`
      SELECT tenant_key, COUNT(*) as count 
      FROM customers 
      GROUP BY tenant_key 
      ORDER BY tenant_key
    `);
    console.log('مشتریان:');
    customerStats.forEach(stat => {
      console.log(`  - ${stat.tenant_key || 'NULL'}: ${stat.count} مشتری`);
    });

    // آمار tasks
    if (hasTaskTenantKey) {
      const [taskStats] = await connection.execute(`
        SELECT tenant_key, COUNT(*) as count 
        FROM tasks 
        GROUP BY tenant_key 
        ORDER BY tenant_key
      `);
      console.log('وظایف:');
      taskStats.forEach(stat => {
        console.log(`  - ${stat.tenant_key || 'NULL'}: ${stat.count} وظیفه`);
      });
    }

    // آمار گزارشات
    if (hasReportTenantKey) {
      const [reportStats] = await connection.execute(`
        SELECT tenant_key, COUNT(*) as count 
        FROM daily_reports 
        GROUP BY tenant_key 
        ORDER BY tenant_key
      `);
      console.log('گزارشات روزانه:');
      reportStats.forEach(stat => {
        console.log(`  - ${stat.tenant_key || 'NULL'}: ${stat.count} گزارش`);
      });
    }

    // 6. پیشنهاد اصلاحات
    console.log('\n🔧 پیشنهادات اصلاح:');
    
    if (!hasTenantKey) {
      console.log('❌ فیلد tenant_key در جدول users موجود نیست - باید اضافه شود');
      console.log('   SQL: ALTER TABLE users ADD COLUMN tenant_key VARCHAR(50) DEFAULT "rabin";');
    }
    
    if (!hasTaskTenantKey) {
      console.log('❌ فیلد tenant_key در جدول tasks موجود نیست - باید اضافه شود');
      console.log('   SQL: ALTER TABLE tasks ADD COLUMN tenant_key VARCHAR(50) DEFAULT "rabin";');
    }
    
    if (!hasReportTenantKey) {
      console.log('❌ فیلد tenant_key در جدول daily_reports موجود نیست - باید اضافه شود');
      console.log('   SQL: ALTER TABLE daily_reports ADD COLUMN tenant_key VARCHAR(50) DEFAULT "rabin";');
    }

    // 7. بررسی کاربران بدون tenant_key
    if (hasTenantKey) {
      const [usersWithoutTenant] = await connection.execute(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE tenant_key IS NULL OR tenant_key = ''
      `);
      
      if (usersWithoutTenant[0].count > 0) {
        console.log(`⚠️  ${usersWithoutTenant[0].count} کاربر بدون tenant_key وجود دارد`);
        console.log('   SQL: UPDATE users SET tenant_key = "rabin" WHERE tenant_key IS NULL OR tenant_key = "";');
      }
    }

    console.log('\n✅ بررسی کامل شد!');

  } catch (error) {
    console.error('❌ خطا در بررسی:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testTenantFiltering();