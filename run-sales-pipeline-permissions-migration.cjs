const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function runMigration() {
  let connection;
  
  try {
    console.log('🔄 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    
    // Read migration file
    const migrationPath = path.join(__dirname, 'database/migrations/add-sales-pipeline-module.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📝 اجرای migration برای افزودن ماژول sales_pipeline...');
    
    // Execute migration
    await connection.execute(migrationSQL);
    
    console.log('✅ ماژول sales_pipeline با موفقیت اضافه شد');
    
    // Verify the module was added
    const [modules] = await connection.execute(
      'SELECT * FROM modules WHERE name = ?',
      ['sales_pipeline']
    );
    
    if (modules.length > 0) {
      console.log('✅ تایید: ماژول sales_pipeline در دیتابیس موجود است');
      console.log('📋 اطلاعات ماژول:', modules[0]);
    } else {
      console.log('❌ خطا: ماژول sales_pipeline در دیتابیس یافت نشد');
    }
    
    // Check if we need to grant permissions to existing users
    console.log('🔍 بررسی کاربران موجود برای اعطای دسترسی...');
    
    const [users] = await connection.execute(`
      SELECT id, name, role FROM users 
      WHERE role IN ('ceo', 'sales_manager', 'sales_specialist') 
      AND status = 'active'
    `);
    
    console.log(`📊 ${users.length} کاربر مجاز یافت شد`);
    
    // Get module ID
    const moduleId = modules[0]?.id;
    if (moduleId) {
      for (const user of users) {
        // Check if permission already exists
        const [existingPermissions] = await connection.execute(
          'SELECT id FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
          [user.id, moduleId]
        );
        
        if (existingPermissions.length === 0) {
          // Grant permission
          const permissionId = 'ump-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
          await connection.execute(
            'INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, 1, NOW(), NOW())',
            [permissionId, user.id, moduleId]
          );
          console.log(`✅ دسترسی sales_pipeline به کاربر ${user.name} (${user.role}) اعطا شد`);
        } else {
          console.log(`ℹ️  کاربر ${user.name} قبلاً دسترسی sales_pipeline دارد`);
        }
      }
    }
    
    console.log('🎉 Migration کامل شد!');
    
  } catch (error) {
    console.error('❌ خطا در اجرای migration:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
runMigration();