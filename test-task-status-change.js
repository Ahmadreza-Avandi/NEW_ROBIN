#!/usr/bin/env node

/**
 * تست تغییر وضعیت وظیفه
 */

const BASE_URL = 'http://localhost:3000';
const TENANT_KEY = 'rabin';

async function testTaskStatusChange() {
  console.log('🔐 لاگین...');
  
  // لاگین
  const loginResponse = await fetch(`${BASE_URL}/api/tenant/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-Key': TENANT_KEY
    },
    body: JSON.stringify({
      email: 'Robintejarat@gmail.com',
      password: 'admin123',
      tenant_key: TENANT_KEY
    })
  });

  const loginData = await loginResponse.json();
  
  if (!loginData.success) {
    console.error('❌ لاگین ناموفق');
    return;
  }

  const token = loginData.token;
  console.log('✅ لاگین موفق');

  // دریافت لیست وظایف
  console.log('\n📋 دریافت لیست وظایف...');
  const tasksResponse = await fetch(`${BASE_URL}/api/tenant/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY
    }
  });

  const tasksData = await tasksResponse.json();
  
  if (!tasksData.success || !tasksData.data || tasksData.data.length === 0) {
    console.log('❌ هیچ وظیفه‌ای یافت نشد');
    return;
  }

  const task = tasksData.data[0];
  console.log(`✅ وظیفه یافت شد: ${task.title}`);
  console.log(`   وضعیت فعلی: ${task.status}`);

  // تغییر وضعیت به in_progress
  console.log('\n🔄 تغییر وضعیت به in_progress...');
  const updateResponse1 = await fetch(`${BASE_URL}/api/tenant/tasks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY
    },
    body: JSON.stringify({
      taskId: task.id,
      status: 'in_progress'
    })
  });

  const updateData1 = await updateResponse1.json();
  console.log('Status:', updateResponse1.status);
  console.log('Response:', JSON.stringify(updateData1, null, 2));

  if (updateData1.success) {
    console.log('✅ وضعیت به in_progress تغییر کرد');
  } else {
    console.log('❌ خطا:', updateData1.message);
  }

  // تغییر وضعیت به completed
  console.log('\n🔄 تغییر وضعیت به completed...');
  const updateResponse2 = await fetch(`${BASE_URL}/api/tenant/tasks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY
    },
    body: JSON.stringify({
      taskId: task.id,
      status: 'completed',
      completion_notes: 'تست تکمیل وظیفه'
    })
  });

  const updateData2 = await updateResponse2.json();
  console.log('Status:', updateResponse2.status);
  console.log('Response:', JSON.stringify(updateData2, null, 2));

  if (updateData2.success) {
    console.log('✅ وضعیت به completed تغییر کرد');
  } else {
    console.log('❌ خطا:', updateData2.message);
  }

  // بازگشت به pending
  console.log('\n🔄 بازگشت به pending...');
  const updateResponse3 = await fetch(`${BASE_URL}/api/tenant/tasks`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'X-Tenant-Key': TENANT_KEY
    },
    body: JSON.stringify({
      taskId: task.id,
      status: 'pending'
    })
  });

  const updateData3 = await updateResponse3.json();
  console.log('Status:', updateResponse3.status);
  console.log('Response:', JSON.stringify(updateData3, null, 2));

  if (updateData3.success) {
    console.log('✅ وضعیت به pending برگشت');
  } else {
    console.log('❌ خطا:', updateData3.message);
  }
}

testTaskStatusChange().catch(console.error);
