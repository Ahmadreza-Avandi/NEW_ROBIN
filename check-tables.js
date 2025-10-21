import mysql from 'mysql2/promise';

async function checkDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'crm_system'
    });

    console.log('Connected to database\n');

    // Get all tables
    const [tables] = await conn.query('SHOW TABLES');
    console.log('=== TABLES IN DATABASE ===');
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      const [rows] = await conn.query(`SELECT COUNT(*) as count FROM \`${tableName}\``);
      console.log(`${tableName}: ${rows[0].count} rows`);
    }

    // Check specific tables for the issues
    console.log('\n=== CHECKING SPECIFIC TABLES ===');
    
    // Check sales/deals table
    try {
      const [deals] = await conn.query('SELECT COUNT(*) as count FROM deals');
      console.log(`\nDeals table: ${deals[0].count} rows`);
      if (deals[0].count > 0) {
        const [sample] = await conn.query('SELECT * FROM deals LIMIT 3');
        console.log('Sample deals:', JSON.stringify(sample, null, 2));
      }
    } catch (e) {
      console.log('Deals table error:', e.message);
    }

    // Check feedback table
    try {
      const [feedback] = await conn.query('SELECT COUNT(*) as count FROM feedback');
      console.log(`\nFeedback table: ${feedback[0].count} rows`);
      if (feedback[0].count > 0) {
        const [sample] = await conn.query('SELECT * FROM feedback LIMIT 3');
        console.log('Sample feedback:', JSON.stringify(sample, null, 2));
      }
    } catch (e) {
      console.log('Feedback table error:', e.message);
    }

    // Check coworkers/users table
    try {
      const [users] = await conn.query('SELECT COUNT(*) as count FROM users');
      console.log(`\nUsers table: ${users[0].count} rows`);
      if (users[0].count > 0) {
        const [sample] = await conn.query('SELECT id, username, email, role FROM users LIMIT 5');
        console.log('Sample users:', JSON.stringify(sample, null, 2));
      }
    } catch (e) {
      console.log('Users table error:', e.message);
    }

    // Check messages/chat table
    try {
      const [messages] = await conn.query('SELECT COUNT(*) as count FROM messages');
      console.log(`\nMessages table: ${messages[0].count} rows`);
      if (messages[0].count > 0) {
        const [sample] = await conn.query('SELECT * FROM messages LIMIT 3');
        console.log('Sample messages:', JSON.stringify(sample, null, 2));
      }
    } catch (e) {
      console.log('Messages table error:', e.message);
    }

    await conn.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkDatabase();
