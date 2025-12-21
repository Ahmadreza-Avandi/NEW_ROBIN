const mysql = require('mysql2/promise');

async function checkPermissionsStructure() {
  console.log('🔍 بررسی ساختار جداول دسترسی...\n');
  
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });
    
    // بررسی جداول موجود
    console.log('1️⃣ بررسی جداول موجود...');
    const [tables] = await connection.execute(`SHOW TABLES`);
    
    console.log('جداول مرتبط با دسترسی:');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      if (tableName.includes('permission') || tableName.includes('role') || tableName.includes('module')) {
        console.log(`   - ${tableName}`);
      }
    });
    
    // بررسی ساختار جدول modules
    console.log('\n2️⃣ ساختار جدول modules:');
    const [moduleColumns] = await connection.execute('DESCRIBE modules');
    moduleColumns.forEach(col => {
      console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // بررسی وجود جداول دسترسی
    const permissionTables = ['user_permissions', 'role_permissions', 'user_roles'];
    
    for (const tableName of permissionTables) {
      console.log(`\n3️⃣ بررسی جدول ${tableName}:`);
      try {
        const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
        console.log(`   ✅ جدول ${tableName} موجود است:`);
        columns.forEach(col => {
          console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } catch (error) {
        console.log(`   ❌ جدول ${tableName} وجود ندارد`);
      }
    }
    
    // بررسی API sidebar menu
    console.log('\n4️⃣ تست API sidebar menu...');
    try {
      const response = await fetch('http://localhost:3000/api/sidebar-menu', {
        headers: {
          'X-Tenant-Key': 'rabin',
          'x-user-id': '1337dd2e-aba8-4d95-ac96-a540979a17cd',
          'x-user-role': 'ceo'
        }
      });
      
      console.log(`   📡 Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('   ✅ Sidebar Menu API Response:');
        console.log(`   📊 تعداد آیتم‌های منو: ${data.data?.length || 0}`);
        if (data.data && data.data.length > 0) {
          data.data.forEach(item => {
            console.log(`   - ${item.display_name} (${item.route})`);
          });
        }
      } else {
        const errorText = await response.text();
        console.log('   ❌ API Error:', errorText);
      }
    } catch (fetchError) {
      console.log('   ❌ Fetch Error:', fetchError.message);
    }
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

checkPermissionsStructure();