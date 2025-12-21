const mysql = require('mysql2/promise');

async function finalTestCustomers() {
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

    // تست کوئری آمار (مشابه API)
    console.log('📊 تست کوئری آمار...');
    const [totalStats] = await connection.query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_customers,
        COUNT(CASE WHEN status = 'follow_up' THEN 1 END) as follow_up_customers,
        COUNT(CASE WHEN segment = 'enterprise' THEN 1 END) as enterprise_customers,
        AVG(COALESCE(satisfaction_score, 0)) as avg_satisfaction,
        SUM(COALESCE(potential_value, 0)) as total_potential_value,
        SUM(COALESCE(actual_value, 0)) as total_actual_value
      FROM customers 
      WHERE tenant_key = ?
    `, ['rabin']);

    const [productStats] = await connection.query(`
      SELECT COUNT(DISTINCT customer_id) as customers_with_interests
      FROM customer_product_interests cpi
      WHERE EXISTS (
        SELECT 1 FROM customers c 
        WHERE c.id = cpi.customer_id AND c.tenant_key = ?
      )
    `, ['rabin']);

    const stats = totalStats[0];
    const productStat = productStats[0];

    console.log('✅ آمار مشتریان:');
    console.log(`  کل مشتریان: ${stats.total_customers}`);
    console.log(`  فعال: ${stats.active_customers}`);
    console.log(`  غیرفعال: ${stats.inactive_customers}`);
    console.log(`  نیاز به پیگیری: ${stats.follow_up_customers}`);
    console.log(`  سازمانی: ${stats.enterprise_customers}`);
    console.log(`  میانگین رضایت: ${parseFloat(stats.avg_satisfaction).toFixed(1)}`);
    console.log(`  ارزش کل بالقوه: ${(stats.total_potential_value / 1000000).toFixed(1)} میلیون تومان`);
    console.log(`  ارزش کل واقعی: ${(stats.total_actual_value / 1000000).toFixed(1)} میلیون تومان`);
    console.log(`  مشتریان با علاقه‌مندی: ${productStat.customers_with_interests}`);

    // تست کوئری لیست مشتریان (مشابه API)
    console.log('\n👥 تست کوئری لیست مشتریان...');
    const [customers] = await connection.query(`
      SELECT c.*, u.name as assigned_user_name
      FROM customers c 
      LEFT JOIN users u ON c.created_by = u.id AND c.tenant_key = u.tenant_key
      WHERE c.tenant_key = ?
      ORDER BY c.created_at DESC 
      LIMIT 5
    `, ['rabin']);

    console.log('✅ لیست مشتریان:');
    for (let customer of customers) {
      // دریافت محصولات علاقه‌مند
      const [interests] = await connection.query(`
        SELECT p.name
        FROM customer_product_interests cpi
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.customer_id = ? AND p.tenant_key = ?
      `, [customer.id, 'rabin']);
      
      const interestedProducts = interests.map(i => i.name).join(', ');
      
      console.log(`  - ${customer.name}`);
      console.log(`    وضعیت: ${customer.status}`);
      console.log(`    بخش: ${customer.segment}`);
      console.log(`    اولویت: ${customer.priority}`);
      console.log(`    رضایت: ${customer.satisfaction_score || 'ندارد'}`);
      console.log(`    ارزش بالقوه: ${customer.potential_value ? (customer.potential_value / 1000000).toFixed(1) + ' میلیون' : 'ندارد'}`);
      console.log(`    محصولات علاقه‌مند: ${interestedProducts || 'ندارد'}`);
      console.log(`    اضافه شده توسط: ${customer.assigned_user_name || 'نامشخص'}`);
      console.log('');
    }

    console.log('🎉 همه تست‌ها موفقیت‌آمیز بودند!');
    console.log('\n💡 حالا می‌تونی صفحه http://localhost:3000/rabin/dashboard/customers رو باز کنی');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

finalTestCustomers();