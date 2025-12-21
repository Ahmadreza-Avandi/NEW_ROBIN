const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkRabinPassword() {
  console.log('🔍 بررسی رمز عبور tenant rabin...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    // دریافت کاربر rabin
    const [users] = await connection.execute(
      'SELECT * FROM users WHERE tenant_key = ? AND email = ?',
      ['rabin', 'Robintejarat@gmail.com']
    );
    
    if (users.length === 0) {
      console.log('❌ کاربر یافت نشد');
      return;
    }
    
    const user = users[0];
    console.log('✅ کاربر یافت شد:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Status: ${user.status}`);
    console.log(`   Password Hash: ${user.password.substring(0, 20)}...`);
    
    // تست رمزهای عبور مختلف
    const possiblePasswords = [
      'مهندس کریمی',
      'مهندس کریمیRobintejarat@gmail.com', // نام کامل که در دیتابیس دیدیم
      'Robintejarat@gmail.com',
      'admin123',
      'password',
      '123456'
    ];
    
    console.log('\n🔐 تست رمزهای عبور مختلف:');
    
    for (const password of possiblePasswords) {
      try {
        const isValid = await bcrypt.compare(password, user.password);
        console.log(`   ${password}: ${isValid ? '✅ صحیح' : '❌ نادرست'}`);
        
        if (isValid) {
          console.log(`\n🎉 رمز عبور صحیح پیدا شد: "${password}"`);
          break;
        }
      } catch (error) {
        console.log(`   ${password}: ❌ خطا در بررسی`);
      }
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkRabinPassword();