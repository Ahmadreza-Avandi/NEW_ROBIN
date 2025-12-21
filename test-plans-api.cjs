const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// ایجاد توکن تست
const testToken = jwt.sign(
  { id: 1, email: 'ahmadrezaavandi@gmail.com', name: 'احمدرضا اوندی', role: 'super_admin' },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('🧪 تست API endpoint برای plans...\n');
console.log('🔐 Test Token:', testToken.substring(0, 50) + '...\n');

// شبیه‌سازی درخواست HTTP
async function testPlansAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/admin/plans', {
      method: 'GET',
      headers: {
        'Cookie': `admin_token=${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 Response Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.text();
      console.log('❌ API Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Network Error:', error.message);
    console.log('\n💡 نکته: مطمئن شوید که سرور Next.js در حال اجرا است:');
    console.log('   npm run dev');
  }
}

testPlansAPI();