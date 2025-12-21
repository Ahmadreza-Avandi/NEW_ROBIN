const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkAdminUser() {
  console.log('🔍 بررسی کاربر admin...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master'
  });

  try {
    // بررسی وجود کاربر admin
    const [admins] = await connection.execute(
      'SELECT * FROM super_admins WHERE username = ? OR email = ?',
      ['Ahmadreza.avandi', 'Ahmadreza.avandi']
    );
    
    if (admins.length === 0) {
      console.log('❌ کاربر admin یافت نشد. ایجاد کاربر جدید...\n');
      
      // ایجاد کاربر admin جدید
      const passwordHash = await bcrypt.hash('Ahmadreza.avandi', 10);
      
      await connection.execute(`
        INSERT INTO super_admins (
          username, email, full_name, password_hash, is_active, created_at
        ) VALUES (?, ?, ?, ?, 1, NOW())
      `, [
        'Ahmadreza.avandi',
        'ahmadreza.avandi@example.com',
        'احمدرضا اوندی',
        passwordHash
      ]);
      
      console.log('✅ کاربر admin ایجاد شد:');
      console.log('   Username: Ahmadreza.avandi');
      console.log('   Password: Ahmadreza.avandi');
      console.log('   Email: ahmadreza.avandi@example.com\n');
      
    } else {
      const admin = admins[0];
      console.log('✅ کاربر admin یافت شد:');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Full Name: ${admin.full_name}`);
      console.log(`   Active: ${admin.is_active ? 'بله' : 'خیر'}`);
      console.log(`   Last Login: ${admin.last_login || 'هرگز'}\n`);
      
      // تست رمز عبور
      const isPasswordValid = await bcrypt.compare('Ahmadreza.avandi', admin.password_hash);
      console.log(`🔐 رمز عبور Ahmadreza.avandi: ${isPasswordValid ? '✅ صحیح' : '❌ نادرست'}`);
      
      if (!isPasswordValid) {
        console.log('🔄 به‌روزرسانی رمز عبور...');
        const newPasswordHash = await bcrypt.hash('Ahmadreza.avandi', 10);
        await connection.execute(
          'UPDATE super_admins SET password_hash = ? WHERE id = ?',
          [newPasswordHash, admin.id]
        );
        console.log('✅ رمز عبور به Ahmadreza.avandi به‌روزرسانی شد');
      }
    }

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

checkAdminUser();