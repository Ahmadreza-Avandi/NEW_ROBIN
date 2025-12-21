const mysql = require('mysql2/promise');

async function testCustomerInterestsFunctionality() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // Test 1: Check customer data structure for detail page
    console.log('\n🔍 تست 1: بررسی ساختار داده مشتری برای صفحه جزئیات');
    
    const [customers] = await connection.query(`
      SELECT c.*, 
             u.name as assigned_user_name,
             u.email as assigned_user_email
      FROM customers c 
      LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
      WHERE c.tenant_key = 'rabin' 
      LIMIT 1
    `);

    if (customers.length === 0) {
      console.log('❌ هیچ مشتری‌ای یافت نشد');
      return;
    }

    const customer = customers[0];
    console.log(`✅ مشتری یافت شد: ${customer.name} (${customer.id})`);
    console.log(`   وضعیت: ${customer.status}`);
    console.log(`   ایجاد شده توسط: ${customer.assigned_user_name || 'نامشخص'}`);

    // Test 2: Check interested products structure
    console.log('\n💝 تست 2: بررسی ساختار محصولات علاقه‌مند');
    
    const [interests] = await connection.query(`
      SELECT cpi.id, cpi.product_id, cpi.interest_level, cpi.notes, cpi.created_at,
             p.name as product_name, p.description, p.price, p.category
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customer.id, 'rabin']);

    console.log(`✅ ${interests.length} محصول علاقه‌مند یافت شد`);
    interests.forEach(interest => {
      console.log(`   - ${interest.product_name} (${interest.interest_level})`);
      if (interest.notes) {
        console.log(`     یادداشت: ${interest.notes}`);
      }
    });

    // Test 3: Check sales stats
    console.log('\n💰 تست 3: بررسی آمار فروش');
    
    const [salesStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_sales_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END), 0) as pending_amount,
        MAX(created_at) as last_sale_date
      FROM sales 
      WHERE customer_id = ? AND tenant_key = ?
    `, [customer.id, 'rabin']);

    const sales = salesStats[0];
    console.log(`✅ آمار فروش:`);
    console.log(`   کل فروش: ${sales.total_sales} مورد`);
    console.log(`   مبلغ کل: ${sales.total_sales_amount} تومان`);
    console.log(`   پرداخت شده: ${sales.paid_amount} تومان`);
    console.log(`   در انتظار: ${sales.pending_amount} تومان`);

    // Test 4: Check activity stats
    console.log('\n📊 تست 4: بررسی آمار فعالیت‌ها');
    
    const [activityStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN type = 'call' THEN 1 END) as total_calls,
        COUNT(CASE WHEN type = 'meeting' THEN 1 END) as total_meetings,
        COUNT(CASE WHEN type = 'email' THEN 1 END) as total_emails,
        MAX(created_at) as last_activity_date
      FROM activities 
      WHERE customer_id = ? AND tenant_key = ?
    `, [customer.id, 'rabin']);

    const activity = activityStats[0];
    console.log(`✅ آمار فعالیت‌ها:`);
    console.log(`   کل فعالیت‌ها: ${activity.total_activities} مورد`);
    console.log(`   تماس‌ها: ${activity.total_calls} مورد`);
    console.log(`   جلسات: ${activity.total_meetings} مورد`);
    console.log(`   ایمیل‌ها: ${activity.total_emails} مورد`);

    // Test 5: Check recent activities
    console.log('\n🕐 تست 5: بررسی آخرین فعالیت‌ها');
    
    const [recentActivities] = await connection.query(`
      SELECT a.*, u.name as performed_by_name
      FROM activities a
      LEFT JOIN users u ON a.performed_by = u.id AND a.tenant_key = u.tenant_key
      WHERE a.customer_id = ? AND a.tenant_key = ?
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [customer.id, 'rabin']);

    console.log(`✅ ${recentActivities.length} فعالیت اخیر یافت شد`);
    recentActivities.forEach(activity => {
      console.log(`   - ${activity.title} (${activity.type})`);
      console.log(`     توسط: ${activity.performed_by_name || 'نامشخص'}`);
    });

    // Test 6: Check contacts
    console.log('\n👥 تست 6: بررسی مخاطبین');
    
    const [contacts] = await connection.query(`
      SELECT id, first_name, last_name, email, phone, job_title, is_primary, created_at
      FROM contacts 
      WHERE company_id = ? AND tenant_key = ?
      ORDER BY is_primary DESC, created_at ASC
    `, [customer.id, 'rabin']);

    console.log(`✅ ${contacts.length} مخاطب یافت شد`);
    contacts.forEach(contact => {
      console.log(`   - ${contact.first_name} ${contact.last_name} ${contact.is_primary ? '(اصلی)' : ''}`);
      if (contact.job_title) {
        console.log(`     سمت: ${contact.job_title}`);
      }
    });

    // Test 7: Simulate complete customer data for API
    console.log('\n🔄 تست 7: شبیه‌سازی داده کامل مشتری برای API');
    
    const completeCustomerData = {
      ...customer,
      interested_products: interests,
      sales_stats: sales,
      activity_stats: activity,
      recent_activities: recentActivities.slice(0, 3),
      contacts: contacts
    };

    console.log('✅ داده کامل مشتری آماده شد:');
    console.log(`   - اطلاعات پایه: ✓`);
    console.log(`   - محصولات علاقه‌مند: ${interests.length} مورد`);
    console.log(`   - آمار فروش: ✓`);
    console.log(`   - آمار فعالیت‌ها: ✓`);
    console.log(`   - فعالیت‌های اخیر: ${recentActivities.length} مورد`);
    console.log(`   - مخاطبین: ${contacts.length} مورد`);

    console.log('\n🎉 همه تست‌ها موفقیت‌آمیز بودند!');
    console.log('\n📝 نتیجه: ساختار داده برای صفحه جزئیات مشتری و مدیریت علاقه‌مندی‌ها آماده است');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testCustomerInterestsFunctionality();