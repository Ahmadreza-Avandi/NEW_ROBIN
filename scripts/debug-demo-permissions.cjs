#!/usr/bin/env node

/**
 * دیباگ مشکل permissions کاربر demo
 */

const mysql = require('mysql2/promise');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const DB_CONFIG = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306'),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD,
  database: 'crm_system'
};

async function debugPermissions() {
  let connection;
  
  try {
    console.log('🔍 دیباگ permissions کاربر demo...\n');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // پیدا کردن کاربر demo
    const [users] = await connection.query(
      'SELECT id, name, email, role, tenant_key FROM users WHERE email = ? OR tenant_key = ?',
      ['demo@gmail.com', 'demo']
    );

    if (users.length === 0) {
      console.log('❌ کاربر demo یافت نشد');
      return;
    }

    const demoUser = users[0];
    console.log(`✅ کاربر demo: ${demoUser.name} (ID: ${demoUser.id})`);

    // بررسی modules
    console.log('\n📋 Modules موجود:');
    const [modules] = await connection.query('SELECT id, name, display_name FROM modules ORDER BY sort_order');
    console.log(`   تعداد: ${modules.length}`);
    modules.forEach(m => {
      console.log(`   - ${m.id}: ${m.name} (${m.display_name})`);
    });

    // تلاش برای اضافه کردن یک permission تستی
    console.log('\n🧪 تست اضافه کردن permission...');
    
    if (modules.length > 0) {
      const firstModule = modules[0];
      console.log(`   تلاش برای اضافه کردن permission برای module: ${firstModule.name}`);
      
      try {
        const [result] = await connection.query(`
          INSERT INTO user_module_permissions (user_id, module_id, granted)
          VALUES (?, ?, TRUE)
          ON DUPLICATE KEY UPDATE granted = TRUE
        `, [demoUser.id, firstModule.id]);
        
        console.log(`   ✅ Permission اضافه شد. Affected rows: ${result.affectedRows}`);
        
        // بررسی
        const [check] = await connection.query(`
          SELECT * FROM user_module_permissions 
          WHERE user_id = ? AND module_id = ?
        `, [demoUser.id, firstModule.id]);
        
        console.log(`   بررسی: ${check.length} رکورد یافت شد`);
        if (check.length > 0) {
          console.log(`   - granted: ${check[0].granted}`);
        }
        
      } catch (error) {
        console.error(`   ❌ خطا در اضافه کردن permission: ${error.message}`);
      }
    }

    // بررسی کلی permissions
    console.log('\n📊 کل permissions کاربر demo:');
    const [permissions] = await connection.query(`
      SELECT 
        ump.id,
        ump.user_id,
        ump.module_id,
        ump.granted,
        m.name as module_name,
        m.display_name
      FROM user_module_permissions ump
      JOIN modules m ON ump.module_id = m.id
      WHERE ump.user_id = ?
    `, [demoUser.id]);

    console.log(`   تعداد: ${permissions.length}`);
    permissions.forEach(p => {
      console.log(`   - ${p.module_name}: ${p.granted ? 'مجاز' : 'غیرمجاز'}`);
    });

    // بررسی ساختار جداول
    console.log('\n🔧 بررسی ساختار جداول:');
    
    console.log('   جدول users:');
    const [userColumns] = await connection.query('DESCRIBE users');
    const userIdColumn = userColumns.find(c => c.Field === 'id');
    console.log(`   - id column type: ${userIdColumn?.Type}`);
    
    console.log('   جدول user_module_permissions:');
    const [permColumns] = await connection.query('DESCRIBE user_module_permissions');
    const userIdPermColumn = permColumns.find(c => c.Field === 'user_id');
    console.log(`   - user_id column type: ${userIdPermColumn?.Type}`);

    // مقایسه نوع داده
    if (userIdColumn?.Type !== userIdPermColumn?.Type) {
      console.log('   ⚠️  نوع داده user_id در دو جدول متفاوت است!');
      console.log(`   users.id: ${userIdColumn?.Type}`);
      console.log(`   user_module_permissions.user_id: ${userIdPermColumn?.Type}`);
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

debugPermissions();