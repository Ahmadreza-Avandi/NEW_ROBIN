const mysql = require('mysql2/promise');

async function checkCEOPermissions() {
  console.log('🔍 بررسی دسترسی‌های مدیرعامل...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    // 1. بررسی کاربر مهندس کریمی
    console.log('1️⃣ بررسی کاربر مهندس کریمی...');
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE tenant_key = ? AND email = ?',
      ['rabin', 'Robintejarat@gmail.com']
    );
    
    if (users.length > 0) {
      const user = users[0];
      console.log(`✅ کاربر یافت شد:`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Status: ${user.status}`);
    }
    
    // 2. بررسی جدول modules
    console.log('\n2️⃣ بررسی ماژول‌های موجود...');
    const [modules] = await connection.execute(
      'SELECT * FROM modules WHERE is_active = 1 ORDER BY sort_order'
    );
    
    console.log(`✅ تعداد ماژول‌های فعال: ${modules.length}`);
    modules.forEach(module => {
      console.log(`   - ${module.display_name} (${module.name}) - Route: ${module.route}`);
    });
    
    // 3. بررسی جدول user_permissions
    console.log('\n3️⃣ بررسی دسترسی‌های کاربر...');
    const [permissions] = await connection.execute(`
      SELECT up.*, m.display_name, m.route 
      FROM user_permissions up 
      LEFT JOIN modules m ON up.module_id = m.id 
      WHERE up.user_id = ?
    `, [users[0]?.id]);
    
    if (permissions.length === 0) {
      console.log('❌ هیچ دسترسی‌ای برای این کاربر تعریف نشده');
    } else {
      console.log(`✅ تعداد دسترسی‌های تعریف شده: ${permissions.length}`);
      permissions.forEach(perm => {
        console.log(`   - ${perm.display_name}: ${perm.can_read ? '✅' : '❌'} خواندن, ${perm.can_write ? '✅' : '❌'} نوشتن, ${perm.can_delete ? '✅' : '❌'} حذف`);
      });
    }
    
    // 4. بررسی role_permissions
    console.log('\n4️⃣ بررسی دسترسی‌های نقش CEO...');
    const [rolePermissions] = await connection.execute(`
      SELECT rp.*, m.display_name, m.route 
      FROM role_permissions rp 
      LEFT JOIN modules m ON rp.module_id = m.id 
      WHERE rp.role = 'ceo'
    `);
    
    if (rolePermissions.length === 0) {
      console.log('❌ هیچ دسترسی‌ای برای نقش CEO تعریف نشده');
    } else {
      console.log(`✅ تعداد دسترسی‌های نقش CEO: ${rolePermissions.length}`);
      rolePermissions.forEach(perm => {
        console.log(`   - ${perm.display_name}: ${perm.can_read ? '✅' : '❌'} خواندن, ${perm.can_write ? '✅' : '❌'} نوشتن, ${perm.can_delete ? '✅' : '❌'} حذف`);
      });
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkCEOPermissions();