// تست API لاگین
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/login';

async function testLogin(nationalCode, password, description) {
  console.log(`\n🔐 تست: ${description}`);
  console.log(`   کد ملی: ${nationalCode}`);
  console.log(`   رمز: ${password}`);
  
  try {
    const response = await axios.post(API_URL, {
      nationalCode,
      password
    });
    
    console.log('   ✅ موفق!');
    console.log('   نام:', response.data.user.fullName);
    console.log('   نقش:', response.data.user.roleName);
    console.log('   توکن:', response.data.access_token.substring(0, 50) + '...');
    return true;
  } catch (error) {
    if (error.response) {
      console.log(`   ❌ خطا ${error.response.status}:`, error.response.data.message);
    } else {
      console.log('   ❌ خطا:', error.message);
    }
    return false;
  }
}

async function runTests() {
  console.log('🚀 شروع تست API لاگین\n');
  console.log('=' .repeat(50));
  
  // تست با رمز فعلی
  await testLogin('1', '1', 'مدیر با رمز فعلی (1)');
  
  // تست با رمز جدید
  await testLogin('1', 'admin123', 'مدیر با رمز جدید (admin123)');
  
  // تست با رمز اشتباه
  await testLogin('1', 'wrong', 'رمز اشتباه');
  
  // تست با کد ملی اشتباه
  await testLogin('999', '1', 'کد ملی اشتباه');
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ تست‌ها تمام شد');
}

runTests();
