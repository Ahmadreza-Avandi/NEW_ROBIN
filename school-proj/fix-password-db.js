const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixPassword() {
  try {
    // اتصال به دیتابیس
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'school'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // هش کردن رمز عبور
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('🔐 رمز عبور هش شد:', hashedPassword);

    // آپدیت رمز عبور در دیتابیس
    const [result] = await connection.execute(
      'UPDATE user SET password = ? WHERE nationalCode = ?',
      [hashedPassword, '1']
    );

    console.log('✅ رمز عبور با موفقیت آپدیت شد');
    console.log('تعداد رکوردهای آپدیت شده:', result.affectedRows);

    // تست لاگین
    const [users] = await connection.execute(
      'SELECT id, fullName, nationalCode, password, roleId FROM user WHERE nationalCode = ?',
      ['1']
    );

    if (users.length > 0) {
      const user = users[0];
      const isValid = await bcrypt.compare(password, user.password);
      
      console.log('\n--- تست لاگین ---');
      console.log('کاربر:', user.fullName);
      console.log('کد ملی:', user.nationalCode);
      console.log('نقش:', user.roleId === 1 ? 'مدیر' : user.roleId === 2 ? 'معلم' : 'دانش‌آموز');
      console.log('رمز عبور معتبر:', isValid ? '✅ بله' : '❌ خیر');
    }

    await connection.end();
    console.log('\n✅ عملیات با موفقیت انجام شد');
    console.log('حالا می‌تونید با کد ملی "1" و رمز "admin123" لاگین کنید');

  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
}

fixPassword();
