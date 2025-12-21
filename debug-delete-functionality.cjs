const mysql = require('mysql2/promise');

async function debugDeleteFunctionality() {
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

    const customerId = '98dad6eb-d387-11f0-8d2c-581122e4f0be';
    const tenantKey = 'rabin';

    // Check current interests with their IDs
    console.log('\n📋 علاقه‌مندی‌های فعلی با ID:');
    const [currentInterests] = await connection.query(`
      SELECT cpi.id, cpi.interest_level, cpi.notes, cpi.created_at,
             p.name as product_name, p.category
      FROM customer_product_interests cpi
      JOIN products p ON cpi.product_id = p.id
      WHERE cpi.customer_id = ? AND p.tenant_key = ?
      ORDER BY cpi.created_at DESC
    `, [customerId, tenantKey]);

    if (currentInterests.length === 0) {
      console.log('❌ هیچ علاقه‌مندی یافت نشد');
      return;
    }

    console.log(`✅ ${currentInterests.length} علاقه‌مندی یافت شد:`);
    currentInterests.forEach((interest, index) => {
      console.log(`${index + 1}. ${interest.product_name} (${interest.interest_level})`);
      console.log(`   ID: ${interest.id}`);
      console.log(`   تاریخ: ${interest.created_at}`);
      if (interest.notes) {
        console.log(`   یادداشت: ${interest.notes}`);
      }
      console.log('');
    });

    // Test delete operation on the first interest
    if (currentInterests.length > 0) {
      const interestToDelete = currentInterests[0];
      console.log(`🗑️ تست حذف علاقه‌مندی: ${interestToDelete.product_name}`);
      console.log(`   ID برای حذف: ${interestToDelete.id}`);

      // Simulate the exact query from the API
      console.log('\n🔍 بررسی وجود علاقه‌مندی قبل از حذف:');
      const [checkResult] = await connection.query(`
        SELECT cpi.*, c.name as customer_name, p.name as product_name
        FROM customer_product_interests cpi
        JOIN customers c ON cpi.customer_id = c.id
        JOIN products p ON cpi.product_id = p.id
        WHERE cpi.id = ? AND cpi.customer_id = ? AND c.tenant_key = ?
      `, [interestToDelete.id, customerId, tenantKey]);

      if (checkResult.length === 0) {
        console.log('❌ علاقه‌مندی برای حذف یافت نشد (مشکل در کوئری)');
        
        // Check without tenant_key constraint
        console.log('\n🔍 بررسی بدون محدودیت tenant_key:');
        const [checkWithoutTenant] = await connection.query(`
          SELECT cpi.*, c.name as customer_name, p.name as product_name
          FROM customer_product_interests cpi
          JOIN customers c ON cpi.customer_id = c.id
          JOIN products p ON cpi.product_id = p.id
          WHERE cpi.id = ? AND cpi.customer_id = ?
        `, [interestToDelete.id, customerId]);

        if (checkWithoutTenant.length > 0) {
          console.log('✅ علاقه‌مندی بدون محدودیت tenant_key یافت شد');
          console.log(`   Customer tenant_key: ${checkWithoutTenant[0].tenant_key}`);
        } else {
          console.log('❌ علاقه‌مندی حتی بدون محدودیت tenant_key یافت نشد');
        }
        
        return;
      }

      console.log('✅ علاقه‌مندی برای حذف یافت شد');
      console.log(`   مشتری: ${checkResult[0].customer_name}`);
      console.log(`   محصول: ${checkResult[0].product_name}`);

      // Perform the delete operation
      console.log('\n🗑️ انجام عملیات حذف...');
      const deleteResult = await connection.query(
        'DELETE FROM customer_product_interests WHERE id = ? AND customer_id = ?',
        [interestToDelete.id, customerId]
      );

      console.log(`✅ نتیجه حذف: ${deleteResult[0].affectedRows} رکورد حذف شد`);

      // Check if it was actually deleted
      console.log('\n🔍 بررسی حذف موفقیت‌آمیز:');
      const [afterDelete] = await connection.query(`
        SELECT COUNT(*) as count FROM customer_product_interests 
        WHERE customer_id = ?
      `, [customerId]);

      console.log(`✅ تعداد علاقه‌مندی‌های باقی‌مانده: ${afterDelete[0].count}`);

      // Add it back for future tests
      console.log('\n↩️ بازگردانی علاقه‌مندی برای تست‌های آینده...');
      const { v4: uuidv4 } = require('uuid');
      const newId = uuidv4();
      
      await connection.query(`
        INSERT INTO customer_product_interests (id, customer_id, product_id, interest_level, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        newId,
        customerId,
        interestToDelete.product_id,
        interestToDelete.interest_level,
        interestToDelete.notes || null
      ]);

      console.log('✅ علاقه‌مندی بازگردانی شد');
    }

    // Test the API URL format
    console.log('\n🌐 تست فرمت URL برای API:');
    const testInterestId = currentInterests[0]?.id;
    if (testInterestId) {
      const apiUrl = `/api/tenant/customers/${customerId}/interests?interest_id=${testInterestId}`;
      console.log(`URL: ${apiUrl}`);
      
      // Parse URL like the API does
      const url = new URL(`http://localhost:3000${apiUrl}`);
      const pathParts = url.pathname.split('/');
      const extractedCustomerId = pathParts[pathParts.length - 2];
      const extractedInterestId = url.searchParams.get('interest_id');
      
      console.log(`✅ Customer ID استخراج شده: ${extractedCustomerId}`);
      console.log(`✅ Interest ID استخراج شده: ${extractedInterestId}`);
      console.log(`✅ مطابقت Customer ID: ${extractedCustomerId === customerId}`);
      console.log(`✅ مطابقت Interest ID: ${extractedInterestId === testInterestId}`);
    }

    console.log('\n🎉 تست‌های حذف تکمیل شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 اتصال بسته شد');
    }
  }
}

debugDeleteFunctionality();