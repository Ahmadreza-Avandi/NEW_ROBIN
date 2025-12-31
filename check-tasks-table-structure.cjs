const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crm_system',
  charset: 'utf8mb4'
};

async function checkTasksTableStructure() {
  let connection;

  try {
    connection = await mysql.createConnection(config);
    
    console.log('🔍 بررسی ساختار جدول tasks...');
    
    const [columns] = await connection.query('DESCRIBE tasks');
    
    console.log('\n📋 ستون‌های جدول tasks:');
    columns.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default !== null ? `default: ${column.Default}` : ''}`);
    });

    // Also check activities table
    console.log('\n🔍 بررسی ساختار جدول activities...');
    
    const [activityColumns] = await connection.query('DESCRIBE activities');
    
    console.log('\n📋 ستون‌های جدول activities:');
    activityColumns.forEach(column => {
      console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'YES' ? '(nullable)' : '(not null)'} ${column.Key ? `[${column.Key}]` : ''} ${column.Default !== null ? `default: ${column.Default}` : ''}`);
    });

  } catch (error) {
    console.error('❌ خطا در بررسی ساختار جدول:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkTasksTableStructure();