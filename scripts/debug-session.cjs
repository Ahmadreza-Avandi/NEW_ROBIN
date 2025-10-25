#!/usr/bin/env node

/**
 * دیباگ session و token
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'local_jwt_secret_key_2024_secure_token_rabin_crm';

// Token از تست قبلی
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlZmZhYWZmMi01N2IxLTQ5M2UtOGQ0Ny04MzIxNzA2N2NmM2UiLCJlbWFpbCI6ImRlbW9AZ21haWwuY29tIiwicm9sZSI6ImNlbyIsInRlbmFudEtleSI6ImRlbW8iLCJuYW1lIjoiZGVtbyIsImlhdCI6MTc2MTQwODY1NSwiZXhwIjoxNzYyMDEzNDU1fQ.z607JCDGM2wjLc5UzYcUNxxIITlTOj_AWWH-DOViQno';

function debugSession() {
  console.log('🔍 دیباگ session و token...\n');

  try {
    // Decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('✅ Token معتبر است');
    console.log('📋 محتویات token:');
    console.log(JSON.stringify(decoded, null, 2));

    // بررسی فیلدهای مورد نیاز
    console.log('\n🔧 بررسی فیلدهای مورد نیاز:');
    console.log(`   userId: ${decoded.userId}`);
    console.log(`   tenantKey: ${decoded.tenantKey}`);
    console.log(`   email: ${decoded.email}`);
    console.log(`   role: ${decoded.role}`);

    // شبیه‌سازی session object که به handler پاس می‌شه
    console.log('\n📦 Session object:');
    const session = {
      ...decoded,
      tenant_key: decoded.tenantKey // این خط مهم است!
    };
    console.log(JSON.stringify(session, null, 2));

  } catch (error) {
    console.error('❌ خطا در decode token:', error.message);
  }
}

debugSession();