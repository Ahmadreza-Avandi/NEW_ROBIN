const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function testApiDirect() {
  try {
    console.log('🔍 تست مستقیم API...');

    // 1. ایجاد token برای کاربر aghbanushop
    const token = jwt.sign(
      {
        id: '7e30fdaa-afb1-4cbc-ba92-da2a34dbdf36',
        userId: '7e30fdaa-afb1-4cbc-ba92-da2a34dbdf36',
        email: 'info@aghbanushop.ir',
        role: 'ceo',
        tenantKey: 'aghbanushop',
        timestamp: Date.now()
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Token ایجاد شد');

    // 2. تست API tasks
    console.log('\n📋 تست API /api/tasks...');
    const tasksResponse = await fetch('http://localhost:3000/api/tasks', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:3000/aghbanushop/dashboard/tasks'
      }
    });

    if (tasksResponse.ok) {
      const tasksData = await tasksResponse.json();
      console.log(`📊 Tasks API Response: ${tasksData.success ? 'موفق' : 'ناموفق'}`);
      
      if (tasksData.success && tasksData.data) {
        console.log(`📊 تعداد وظایف: ${tasksData.data.length}`);
        tasksData.data.forEach((task, index) => {
          console.log(`   ${index + 1}. ${task.title} - Tenant: ${task.tenant_key || 'NULL'}`);
        });
      } else {
        console.log('❌ خطا در دریافت وظایف:', tasksData.message);
      }
    } else {
      console.log(`❌ خطای HTTP: ${tasksResponse.status}`);
      const errorText = await tasksResponse.text();
      console.log('Error:', errorText);
    }

    // 3. تست API reports
    console.log('\n📊 تست API /api/reports...');
    const reportsResponse = await fetch('http://localhost:3000/api/reports', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Referer': 'http://localhost:3000/aghbanushop/dashboard/reports'
      }
    });

    if (reportsResponse.ok) {
      const reportsData = await reportsResponse.json();
      console.log(`📊 Reports API Response: ${reportsData.success ? 'موفق' : 'ناموفق'}`);
      
      if (reportsData.success && reportsData.data) {
        console.log(`📊 تعداد گزارشات: ${reportsData.data.length}`);
        reportsData.data.forEach((report, index) => {
          console.log(`   ${index + 1}. ${report.persian_date} - User: ${report.user_name}`);
        });
      } else {
        console.log('❌ خطا در دریافت گزارشات:', reportsData.message);
      }
    } else {
      console.log(`❌ خطای HTTP: ${reportsResponse.status}`);
      const errorText = await reportsResponse.text();
      console.log('Error:', errorText);
    }

  } catch (error) {
    console.error('❌ خطا در تست API:', error);
  }
}

testApiDirect();