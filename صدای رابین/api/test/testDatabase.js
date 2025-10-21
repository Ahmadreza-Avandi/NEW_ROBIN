const { testConnection, getEmployees } = require('../services/database');
const { processUserText } = require('../services/keywordDetector');

async function runTests() {
  console.log('🧪 Starting database tests...\n');
  
  // تست اتصال
  console.log('1️⃣ Testing database connection...');
  const connected = await testConnection();
  console.log(`Connection result: ${connected ? '✅ Success' : '❌ Failed'}\n`);
  
  if (!connected) {
    console.log('❌ Cannot proceed with tests - database connection failed');
    return;
  }
  
  // تست دریافت همکاران
  console.log('2️⃣ Testing getEmployees...');
  try {
    const employees = await getEmployees();
    console.log(`✅ Employees fetched: ${employees.length} records\n`);
  } catch (error) {
    console.log(`❌ getEmployees failed: ${error.message}\n`);
  }
  
  // تست تشخیص کلمات کلیدی
  console.log('3️⃣ Testing keyword detection...');
  const testTexts = [
    'لیست همکاران رو نشون بده',
    'گزارش فروش امروز چطوره؟',
    'وظایف احمد رو بگو',
    'سلام چطوری؟' // بدون کلمه کلیدی
  ];
  
  for (const text of testTexts) {
    console.log(`\nTesting: "${text}"`);
    const result = await processUserText(text);
    console.log(`Keywords found: ${result.hasKeywords}`);
    if (result.hasKeywords) {
      console.log(`Successful queries: ${result.successfulQueries}`);
    }
  }
  
  console.log('\n🎉 Tests completed!');
}

// اجرای تست‌ها
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };