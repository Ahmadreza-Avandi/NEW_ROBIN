const mysql = require('mysql2/promise');

async function killConnections() {
  let connection;
  
  try {
    // اتصال مستقیم به MySQL
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mysql'
    });

    console.log('✅ اتصال به MySQL برقرار شد');

    // نمایش اتصالات فعلی
    const [processes] = await connection.query('SHOW PROCESSLIST');
    console.log(`📊 تعداد اتصالات فعلی: ${processes.length}`);

    // Kill کردن اتصالات crm_user
    let killedCount = 0;
    for (const process of processes) {
      if (process.User === 'crm_user' && process.Id !== connection.threadId) {
        try {
          await connection.query(`KILL ${process.Id}`);
          killedCount++;
        } catch (error) {
          // ممکنه اتصال از قبل بسته شده باشه
        }
      }
    }

    console.log(`🔪 ${killedCount} اتصال بسته شد`);

    // نمایش اتصالات باقی‌مانده
    const [remainingProcesses] = await connection.query('SHOW PROCESSLIST');
    console.log(`📊 اتصالات باقی‌مانده: ${remainingProcesses.length}`);

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال بسته شد');
    }
  }
}

killConnections();