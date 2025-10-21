import mysql from 'mysql2/promise';

async function testAPIs() {
  try {
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'crm_system'
    });

    console.log('=== بررسی داده‌های مورد نیاز APIها ===\n');

    // 1. بررسی Users برای صفحه همکاران
    console.log('1️⃣ کاربران (Users) - برای صفحه همکاران:');
    const [users] = await conn.query(`
      SELECT 
        id,
        username,
        COALESCE(name, username) as name,
        email,
        phone,
        role,
        team as department,
        status
      FROM users
      ORDER BY created_at DESC
    `);
    console.log(`   ✅ تعداد کاربران: ${users.length}`);
    if (users.length > 0) {
      console.log('   نمونه کاربر:', {
        name: users[0].name,
        email: users[0].email,
        role: users[0].role,
        status: users[0].status
      });
    }

    // 2. بررسی Chat Messages
    console.log('\n2️⃣ پیام‌های چت (Chat Messages):');
    const [chatMessages] = await conn.query('SELECT COUNT(*) as count FROM chat_messages');
    console.log(`   ✅ تعداد پیام‌ها: ${chatMessages[0].count}`);
    
    if (chatMessages[0].count > 0) {
      const [sampleMessages] = await conn.query(`
        SELECT 
          cm.*,
          u.username as sender_name
        FROM chat_messages cm
        LEFT JOIN users u ON cm.sender_id = u.id
        LIMIT 3
      `);
      console.log('   نمونه پیام‌ها:', sampleMessages.length);
    }

    // 3. بررسی Deals برای صفحه فروش
    console.log('\n3️⃣ معاملات (Deals) - برای صفحه فروش:');
    const [deals] = await conn.query(`
      SELECT 
        d.*,
        c.name as customer_name,
        ds.name as stage_name
      FROM deals d
      LEFT JOIN customers c ON d.customer_id = c.id
      LEFT JOIN deal_stages ds ON d.stage_id = ds.id
      LIMIT 5
    `);
    console.log(`   ✅ تعداد معاملات: ${deals.length}`);
    if (deals.length > 0) {
      console.log('   نمونه معامله:', {
        title: deals[0].title,
        customer: deals[0].customer_name,
        stage: deals[0].stage_name,
        value: deals[0].total_value
      });
    }

    // 4. بررسی Feedback
    console.log('\n4️⃣ بازخوردها (Feedback):');
    const [feedback] = await conn.query(`
      SELECT 
        f.*,
        c.name as customer_name
      FROM feedback f
      LEFT JOIN customers c ON f.customer_id = c.id
      LIMIT 5
    `);
    console.log(`   ✅ تعداد بازخوردها: ${feedback.length}`);
    if (feedback.length > 0) {
      console.log('   نمونه بازخورد:', {
        title: feedback[0].title,
        type: feedback[0].type,
        status: feedback[0].status,
        score: feedback[0].score
      });
    }

    // 5. خلاصه نهایی
    console.log('\n' + '='.repeat(50));
    console.log('📊 خلاصه وضعیت:');
    console.log('='.repeat(50));
    console.log(`✅ کاربران: ${users.length} نفر`);
    console.log(`${chatMessages[0].count > 0 ? '✅' : '⚠️'} پیام‌های چت: ${chatMessages[0].count} پیام`);
    console.log(`${deals.length > 0 ? '✅' : '⚠️'} معاملات: ${deals.length} معامله`);
    console.log(`${feedback.length > 0 ? '✅' : '⚠️'} بازخوردها: ${feedback.length} بازخورد`);
    
    console.log('\n📝 توصیه‌ها:');
    if (users.length === 0) {
      console.log('   ⚠️ هیچ کاربری وجود ندارد - صفحه همکاران خالی خواهد بود');
    }
    if (chatMessages[0].count === 0) {
      console.log('   ⚠️ هیچ پیامی وجود ندارد - چت خالی خواهد بود');
    }
    if (deals.length === 0) {
      console.log('   ⚠️ هیچ معامله‌ای وجود ندارد - صفحه فروش خالی خواهد بود');
    }
    if (feedback.length === 0) {
      console.log('   ⚠️ هیچ بازخوردی وجود ندارد - صفحه بازخورد خالی خواهد بود');
    }

    await conn.end();
  } catch (error) {
    console.error('❌ خطا:', error.message);
  }
}

testAPIs();
