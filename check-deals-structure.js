import mysql from 'mysql2/promise';

async function checkDealsStructure() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'crm_system'
    });

    console.log('=== DEALS TABLE STRUCTURE ===\n');
    
    const [columns] = await conn.query('DESCRIBE deals');
    console.log('Columns in deals table:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n=== FEEDBACK TABLE STRUCTURE ===\n');
    
    const [feedbackCols] = await conn.query('DESCRIBE feedback');
    console.log('Columns in feedback table:');
    feedbackCols.forEach(col => {
      console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    await conn.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDealsStructure();
