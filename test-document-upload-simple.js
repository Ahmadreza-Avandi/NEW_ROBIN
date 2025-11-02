#!/usr/bin/env node

/**
 * تست ساده آپلود سند
 */

const BASE_URL = 'http://localhost:3000';
const TENANT_KEY = 'rabin';

async function testDocumentUpload() {
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
    console.error('❌ لاگین ناموفق:', loginData.message);
    return;
  }

  const token = loginData.token;
  console.log('✅ لاگین موفق');

  // تست آپلود به API اصلی (نه tenant)
  console.log('\n📄 تست آپلود به /api/documents...');
  
  const testContent = 'این یک فایل تستی است';
  const blob = new Blob([testContent], { type: 'text/plain' });
  const file = new File([blob], 'test.txt', { type: 'text/plain' });

  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', 'تست سند');
  formData.append('description', 'تست');
  formData.append('accessLevel', 'private');

  try {
    const response = await fetch(`${BASE_URL}/api/documents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData
    });

    console.log('Status:', response.status);
    const text = await response.text();
    console.log('Response:', text.substring(0, 500));

    try {
      const data = JSON.parse(text);
      if (data.success) {
        console.log('✅ آپلود موفق به /api/documents');
      } else {
        console.log('❌ خطا:', data.error);
      }
    } catch (e) {
      console.log('❌ پاسخ JSON نیست');
    }
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testDocumentUpload().catch(console.error);
