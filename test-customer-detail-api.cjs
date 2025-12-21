const mysql = require('mysql2/promise');

async function testCustomerDetailAPI() {
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

    // پیدا کردن یک مشتری نمونه
    const [customers] = await connection.query(`
      SELECT id, name FROM customers WHERE tenant_key = 'rabin' LIMIT 1
    `);

    if (customers.length === 0) {
      console.log('❌ مشتری نمونه‌ای یافت نشد');
      return;
    }

    const customerId = customers[0].id;
    const customerName = customers[0].name;
    console.log(`🔍 تست برای مشتری: ${customerName} (${customerId})`);

    // تست کوئری اصلی مشتری
    const [customerDetails] = await connection.query(`
      SELECT c.*, u.name as assigned_user_name, u.email as assigned_user_email
      FROM customers c 
      LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
      WHERE c.id = ? AND c.tenant_key = ?
    `, [customerId, 'rabin']);

    console.log('✅ اطلاعات اصلی مشتری:', {
      name: customerDetails[0]?.name,
      email: customerDetails[0]?.email,
      phone: customerDetails[0]?.phone,
      status: customerDetails[0]?.status,
      segment: customerDetails[0]?.segment,
      assigned_user: customerDetails[0]?.assigned_user_name
    });

    // تست محصولات علاقه‌مند
    const [interestedProducts] = await connection.query(`
      SELECT p.id, p.name, p.description, p.price, p.category,
             cpi.interest_level, cpi.notes as interest_notes, cpi.created_at as interest_date
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, 'rabin']);

    console.log('✅ محصولات علاقه‌مند:', interestedProducts.length, 'مورد');
    interestedProducts.forEach(product => {
      console.log(`  - ${product.name} (${product.interest_level || 'medium'})`);
    });

    // تست آمار فروش
    const [salesStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_sales,
        SUM(total_amount) as total_sales_amount,
        SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END) as paid_amount,
        SUM(CASE WHEN payment_status = 'pending' THEN total_amount ELSE 0 END) as pending_amount,
        MAX(sale_date) as last_sale_date
      FROM sales 
      WHERE customer_id = ? AND tenant_key = ?
    `, [customerId, 'rabin']);

    console.log('✅ آمار فروش:', {
      total_sales: salesStats[0]?.total_sales || 0,
      total_amount: (salesStats[0]?.total_sales_amount || 0) / 1000000 + ' میلیون تومان',
      paid_amount: (salesStats[0]?.paid_amount || 0) / 1000000 + ' میلیون تومان'
    });

    // تست آمار فعالیت‌ها
    const [activityStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_activities,
        COUNT(CASE WHEN type = 'call' THEN 1 END) as total_calls,
        COUNT(CASE WHEN type = 'meeting' THEN 1 END) as total_meetings,
        COUNT(CASE WHEN type = 'email' THEN 1 END) as total_emails,
        MAX(created_at) as last_activity_date
      FROM activities 
      WHERE customer_id = ? AND tenant_key = ?
    `, [customerId, 'rabin']);

    console.log('✅ آمار فعالیت‌ها:', {
      total: activityStats[0]?.total_activities || 0,
      calls: activityStats[0]?.total_calls || 0,
      meetings: activityStats[0]?.total_meetings || 0,
      emails: activityStats[0]?.total_emails || 0
    });

    // تست مخاطبین (از طریق company_id)
    const [contacts] = await connection.query(`
      SELECT id, first_name, last_name, email, phone, job_title, is_primary, created_at
      FROM contacts 
      WHERE company_id = ? AND tenant_key = ?
      ORDER BY is_primary DESC, created_at DESC
    `, [customerId, 'rabin']);

    console.log('✅ مخاطبین:', contacts.length, 'مورد');

    console.log('\n🎉 همه کوئری‌ها موفقیت‌آمیز بودند!');
    console.log(`💡 حالا می‌تونی صفحه http://localhost:3000/rabin/dashboard/customers/${customerId} رو باز کنی`);

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

testCustomerDetailAPI();