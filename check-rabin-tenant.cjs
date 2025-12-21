const mysql = require('mysql2/promise');

async function checkRabinTenant() {
  console.log('🔍 بررسی tenant rabin...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'saas_master'
    });
    
    // بررسی tenant rabin در جدول tenants
    console.log('1️⃣ بررسی جدول tenants...');
    const [tenants] = await connection.execute(
      'SELECT * FROM tenants WHERE tenant_key = ? OR tenant_key LIKE ?',
      ['rabin', '%rabin%']
    );
    
    if (tenants.length === 0) {
      console.log('❌ tenant rabin یافت نشد');
    } else {
      tenants.forEach(tenant => {
        console.log(`✅ Tenant یافت شد:`);
        console.log(`   ID: ${tenant.id}`);
        console.log(`   Tenant Key: "${tenant.tenant_key}"`);
        console.log(`   Company: ${tenant.company_name}`);
        console.log(`   Admin Email: ${tenant.admin_email}`);
        console.log(`   Status: ${tenant.subscription_status}`);
        console.log(`   Active: ${tenant.is_active}`);
        console.log(`   Deleted: ${tenant.is_deleted}`);
        console.log('');
      });
    }
    
    // بررسی کاربر admin در جدول users
    console.log('2️⃣ بررسی جدول users...');
    await connection.end();
    
    const crmConnection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    const [users] = await crmConnection.execute(
      'SELECT * FROM users WHERE tenant_key = ? OR tenant_key LIKE ?',
      ['rabin', '%rabin%']
    );
    
    if (users.length === 0) {
      console.log('❌ کاربر admin برای tenant rabin یافت نشد');
    } else {
      users.forEach(user => {
        console.log(`✅ کاربر یافت شد:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Tenant Key: "${user.tenant_key}"`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Status: ${user.status}`);
        console.log('');
      });
    }
    
    // تست API tenant info
    console.log('3️⃣ تست API tenant info...');
    try {
      const response = await fetch('http://localhost:3000/api/internal/tenant-info?tenant=rabin');
      console.log(`   📡 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ API Response:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('   ❌ API Error:', errorText);
      }
    } catch (fetchError) {
      console.log('   ❌ Fetch Error:', fetchError.message);
    }
    
    await crmConnection.end();
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkRabinTenant();