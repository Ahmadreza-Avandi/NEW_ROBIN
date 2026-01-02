const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crm_system',
  charset: 'utf8mb4'
};

async function createAghbanushopTestReports() {
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('🔗 اتصال به دیتابیس برقرار شد');

    // 1. پیدا کردن کاربر aghbanushop
    const [aghbanushopUser] = await connection.execute(`
      SELECT id, name, email, role, tenant_key 
      FROM users 
      WHERE email = 'info@aghbanushop.ir'
    `);
    
    if (aghbanushopUser.length === 0) {
      console.log('❌ کاربر aghbanushop پیدا نشد');
      return;
    }
    
    const user = aghbanushopUser[0];
    console.log(`✅ کاربر پیدا شد: ${user.name} - Tenant: ${user.tenant_key}`);

    // 2. بررسی گزارشات موجود
    console.log('\n📋 بررسی گزارشات موجود...');
    const [existingReports] = await connection.execute(`
      SELECT id, report_date, persian_date, tenant_key, work_description
      FROM daily_reports 
      WHERE tenant_key = 'aghbanushop'
      ORDER BY report_date DESC
    `);
    
    console.log(`📊 تعداد گزارشات aghbanushop: ${existingReports.length}`);
    if (existingReports.length > 0) {
      existingReports.forEach(report => {
        console.log(`  - ${report.persian_date} - ${report.work_description.substring(0, 50)}...`);
      });
    }

    // 3. ایجاد گزارش تست اگر وجود نداشته باشد
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const testReports = [
      {
        date: today,
        persian_date: new Intl.DateTimeFormat('fa-IR').format(new Date()),
        work_description: 'بررسی و تحلیل عملکرد فروش آقبانو شاپ، پیگیری مشتریان جدید و آماده‌سازی گزارش ماهانه',
        working_hours: 8,
        challenges: 'کمبود زمان برای پیگیری همه مشتریان',
        achievements: 'تماس موفق با 5 مشتری جدید و دریافت 2 سفارش'
      },
      {
        date: yesterday,
        persian_date: new Intl.DateTimeFormat('fa-IR').format(new Date(Date.now() - 24 * 60 * 60 * 1000)),
        work_description: 'طراحی استراتژی بازاریابی جدید، تماس با مشتریان بالقوه و به‌روزرسانی اطلاعات محصولات',
        working_hours: 7,
        challenges: 'مشکل در ارتباط با برخی مشتریان',
        achievements: 'تکمیل طراحی استراتژی بازاریابی و ثبت 3 lead جدید'
      }
    ];

    console.log('\n📝 ایجاد گزارشات تست...');
    
    for (const report of testReports) {
      // بررسی اینکه آیا گزارش برای این تاریخ وجود دارد یا نه
      const [existing] = await connection.execute(`
        SELECT id FROM daily_reports 
        WHERE user_id = ? AND tenant_key = ? AND report_date = ?
      `, [user.id, 'aghbanushop', report.date]);
      
      if (existing.length === 0) {
        const reportId = uuidv4();
        
        await connection.execute(`
          INSERT INTO daily_reports (
            id, user_id, tenant_key, report_date, persian_date, work_description,
            working_hours, challenges, achievements, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
          reportId,
          user.id,
          'aghbanushop',
          report.date,
          report.persian_date,
          report.work_description,
          report.working_hours,
          report.challenges,
          report.achievements
        ]);
        
        console.log(`✅ گزارش ایجاد شد: ${report.persian_date}`);
      } else {
        console.log(`⚠️  گزارش برای تاریخ ${report.persian_date} قبلاً وجود دارد`);
      }
    }

    // 4. بررسی گزارشات ایجاد شده
    console.log('\n📋 بررسی گزارشات نهایی...');
    const [finalReports] = await connection.execute(`
      SELECT dr.*, u.name as user_name
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.tenant_key = 'aghbanushop'
      ORDER BY dr.report_date DESC
    `);
    
    console.log(`📊 تعداد کل گزارشات aghbanushop: ${finalReports.length}`);
    finalReports.forEach(report => {
      console.log(`  - ${report.persian_date} - ${report.user_name} - ${report.work_description.substring(0, 50)}...`);
    });

    // 5. تست API query
    console.log('\n🔍 تست query API گزارشات...');
    const [apiResult] = await connection.execute(`
      SELECT 
        dr.*,
        u.name as user_name,
        u.role as user_role
      FROM daily_reports dr
      LEFT JOIN users u ON dr.user_id = u.id
      WHERE dr.tenant_key = ?
      ORDER BY dr.report_date DESC, dr.created_at DESC
      LIMIT 10
    `, ['aghbanushop']);
    
    console.log(`📊 نتیجه API query: ${apiResult.length} گزارش`);
    apiResult.forEach(report => {
      console.log(`  - ${report.persian_date} - ${report.user_name} (${report.user_role})`);
    });

    console.log('\n✅ گزارشات تست با موفقیت ایجاد شدند!');
    console.log('🌐 حالا می‌توانید به http://localhost:3000/aghbanushop/dashboard/reports بروید');

  } catch (error) {
    console.error('❌ خطا در ایجاد گزارشات:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createAghbanushopTestReports();