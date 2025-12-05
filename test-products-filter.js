// تست فیلتر محصولات
const testFilters = async () => {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing Products Filter API\n');
  
  // شما باید یک توکن معتبر داشته باشید
  // این را از localStorage مرورگر خود بگیرید
  const token = 'YOUR_TOKEN_HERE';
  
  const tests = [
    { name: 'همه محصولات', params: '' },
    { name: 'فیلتر دسته‌بندی: ماشین آلات', params: '?category=ماشین آلات' },
    { name: 'فیلتر دسته‌بندی: موتور', params: '?category=موتور' },
    { name: 'فیلتر وضعیت: فعال', params: '?status=active' },
    { name: 'فیلتر وضعیت: غیرفعال', params: '?status=inactive' },
    { name: 'جستجو: رابین', params: '?search=رابین' },
  ];
  
  for (const test of tests) {
    console.log(`\n📋 ${test.name}`);
    console.log(`URL: ${baseUrl}/api/products${test.params}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/products${test.params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ تعداد محصولات: ${data.data.length}`);
        if (data.data.length > 0) {
          console.log(`   نمونه: ${data.data[0].name} (${data.data[0].category})`);
        }
      } else {
        console.log(`❌ خطا: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ خطای شبکه: ${error.message}`);
    }
  }
  
  // تست دسته‌بندی‌ها
  console.log('\n\n📂 Testing Categories API');
  try {
    const response = await fetch(`${baseUrl}/api/products/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log(`✅ تعداد دسته‌بندی‌ها: ${data.data.length}`);
      console.log(`   دسته‌بندی‌ها: ${data.data.join(', ')}`);
    } else {
      console.log(`❌ خطا: ${data.message}`);
    }
  } catch (error) {
    console.log(`❌ خطای شبکه: ${error.message}`);
  }
};

console.log('⚠️  توجه: قبل از اجرا، توکن خود را در فایل وارد کنید');
console.log('💡 برای گرفتن توکن:');
console.log('   1. به http://localhost:3000 بروید');
console.log('   2. F12 را بزنید و به Console بروید');
console.log('   3. localStorage.getItem("token") را تایپ کنید\n');

// testFilters();
