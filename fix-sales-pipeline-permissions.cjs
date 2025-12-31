const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function fixPermissions() {
  let connection;
  
  try {
    console.log('🔄 اتصال به دیتابیس...');
    connection = await mysql.createConnection(dbConfig);
    
    console.log('🔧 اصلاح دسترسی‌های sales_pipeline...');
    
    // Get sales_pipeline module ID
    const [modules] = await connection.execute(
      'SELECT id FROM modules WHERE name = ?',
      ['sales_pipeline']
    );
    
    if (modules.length === 0) {
      console.log('❌ ماژول sales_pipeline یافت نشد');
      return;
    }
    
    const moduleId = modules[0].id;
    
    // Remove permissions from unauthorized roles
    const unauthorizedRoles = ['agent', 'technical_specialist', 'team_manager', 'sales_agent'];
    
    for (const role of unauthorizedRoles) {
      const [users] = await connection.execute(
        'SELECT id, name FROM users WHERE role = ? AND status = "active"',
        [role]
      );
      
      for (const user of users) {
        const [result] = await connection.execute(
          'DELETE FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
          [user.id, moduleId]
        );
        
        if (result.affectedRows > 0) {
          console.log(`🗑️  دسترسی sales_pipeline از کاربر ${user.name} (${role}) حذف شد`);
        }
      }
    }
    
    // Ensure authorized roles have permissions
    const authorizedRoles = ['ceo', 'sales_manager', 'sales_specialist'];
    
    for (const role of authorizedRoles) {
      const [users] = await connection.execute(
        'SELECT id, name FROM users WHERE role = ? AND status = "active"',
        [role]
      );
      
      for (const user of users) {
        // Check if permission exists
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
          console.log(`✅ دسترسی sales_pipeline به کاربر ${user.name} (${role}) اعطا شد`);
        } else {
          console.log(`ℹ️  کاربر ${user.name} (${role}) قبلاً دسترسی دارد`);
        }
      }
    }
    
    console.log('\n🎉 اصلاح دسترسی‌ها کامل شد!');
    
    // Verify final state
    console.log('\n📊 وضعیت نهایی دسترسی‌ها:');
    
    const allRoles = ['ceo', 'sales_manager', 'sales_specialist', 'technical_specialist', 'team_manager', 'sales_agent', 'agent'];
    
    for (const role of allRoles) {
      const [users] = await connection.execute(
        'SELECT u.id, u.name, u.role FROM users u WHERE u.role = ? AND u.status = "active" LIMIT 1',
        [role]
      );
      
      if (users.length > 0) {
        const user = users[0];
        
        const [permissions] = await connection.execute(
          'SELECT granted FROM user_module_permissions WHERE user_id = ? AND module_id = ?',
          [user.id, moduleId]
        );
        
        const hasPermission = permissions.length > 0 && permissions[0].granted === 1;
        const shouldHavePermission = authorizedRoles.includes(role);
        
        const status = hasPermission === shouldHavePermission ? '✅' : '❌';
        console.log(`${status} ${role} (${user.name}): ${hasPermission ? 'دارد' : 'ندارد'}`);
      }
    }
    
  } catch (error) {
    console.error('❌ خطا در اصلاح دسترسی‌ها:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run fix
fixPermissions();