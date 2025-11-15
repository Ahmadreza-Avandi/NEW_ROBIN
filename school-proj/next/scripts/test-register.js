// تست API ثبت‌نام
const axios = require('axios');

const API_URL = 'http://localhost:3000/api/register-user';

async function testRegister() {
  console.log('🚀 شروع تست API ثبت‌نام\n');
  
  const testUser = {
    fullName: 'کاربر تست',
    nationalCode: '9999999999',
    phoneNumber: '09123456789',
    password: 'test123',
    roleId: 3,
    majorId: 1,
    gradeId: 1
  };
  
  console.log('📝 داده‌های ارسالی:');
  console.log(JSON.stringify(testUser, null, 2));
  console.log('\n');
  
  try {
    const response = await axios.post(API_URL, testUser);
    
    console.log('✅ ثبت‌نام موفق!');
    console.log('📊 پاسخ سرور:');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    if (error.response) {
      console.log('❌ خطا در ثبت‌نام');
      console.log('📊 وضعیت:', error.response.status);
      console.log('📊 پیام:', error.response.data.message);
      console.log('📊 جزئیات:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.log('❌ خطا در ارتباط با سرور:', error.message);
    }
  }
}

testRegister();
