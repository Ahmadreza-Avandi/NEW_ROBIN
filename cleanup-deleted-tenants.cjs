const mysql = require('mysql2/promise');

async function cleanupDeletedTenants() {
  console.log('🧹 شروع پاکسازی tenant های حذف شده...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    multipleStatements: true
  });

  try {
    // پیدا کردن tenant های حذف شده یا غیرفعال
    console.log('🔍 جستجوی tenant های حذف شده...');
    const [deletedTenants] = await connection.execute(`
      SELECT tenant_key, company_name, id 
      FROM saas_master.tenants 
      WHERE is_deleted = 1 OR is_active = 0
    `);

    if (deletedTenants.length === 0) {
      console.log('✅ هیچ tenant حذف شده‌ای یافت نشد');
      return;
    }

    console.log(`📋 ${deletedTenants.length} tenant حذف شده یافت شد:\n`);
    
    for (const tenant of deletedTenants) {
      console.log(`🗑️ پاکسازی ${tenant.tenant_key} (${tenant.company_name})...`);
      
      const tenantKey = tenant.tenant_key;
      const tenantId = tenant.id;

      // حذف داده‌های CRM
      const tables = [
        'users', 'customers', 'products', 'sales', 'sale_items',
        'activities', 'tasks', 'feedback', 'calendar_events',
        'documents', 'chat_messages', 'reports', 'settings',
        'customer_interests'
      ];

      for (const table of tables) {
        try {
          const [result] = await connection.execute(
            `DELETE FROM crm_system.${table} WHERE tenant_key = ?`,
            [tenantKey]
          );
          if (result.affectedRows > 0) {
            console.log(`   ✓ ${table}: ${result.affectedRows} رکورد حذف شد`);
          }
        } catch (error) {
          console.log(`   ⚠️ ${table}: جدول وجود ندارد یا خطا - ${error.message}`);
        }
      }

      // حذف از master database
      await connection.execute(
        'DELETE FROM saas_master.tenant_api_keys WHERE tenant_id = ?',
        [tenantId]
      );
      
      await connection.execute(
        'DELETE FROM saas_master.subscription_history WHERE tenant_id = ?',
        [tenantId]
      );
      
      await connection.execute(
        'DELETE FROM saas_master.tenant_activity_logs WHERE tenant_id = ?',
        [tenantId]
      );
      
      await connection.execute(
        'DELETE FROM saas_master.tenants WHERE id = ?',
        [tenantId]
      );

      console.log(`   ✅ ${tenantKey} کاملاً پاک شد\n`);
    }

    console.log('🎉 پاکسازی با موفقیت انجام شد!');

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

cleanupDeletedTenants();