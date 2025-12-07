const mysql = require('mysql2/promise');

async function fixActivitiesTable() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system'
    });

    console.log('🔧 تغییر ساختار جدول activities...');
    
    // تغییر customer_id به nullable
    await connection.query('ALTER TABLE activities MODIFY COLUMN customer_id VARCHAR(36) NULL');
    console.log('✅ فیلد customer_id به nullable تغییر یافت');

    // نمایش ساختار جدید
    const [columns] = await connection.query('DESCRIBE activities');
    const customerIdColumn = columns.find(col => col.Field === 'customer_id');
    console.log(`📋 customer_id: ${customerIdColumn.Type} ${customerIdColumn.Null === 'YES' ? '(nullable)' : '(not null)'}`);

    await connection.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

fixActivitiesTable();