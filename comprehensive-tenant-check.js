#!/usr/bin/env node

import mysql from 'mysql2/promise';

async function comprehensiveTenantCheck() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'crm_user',
    password: process.env.DB_PASSWORD || '1234',
    database: process.env.DB_NAME || 'crm_system',
  });

  try {
    console.log('🔍 بررسی جامع Tenant Filtering\n');
    console.log('='.repeat(60));

    const tables = ['customers', 'sales', 'products', 'activities'];

    for (const table of tables) {
      console.log(`\n📋 جدول: ${table}`);
      console.log('-'.repeat(60));
      
      // شمارش کل رکوردها
      const [totalCount] = await connection.query(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`   کل رکوردها: ${totalCount[0].count}`);
      
      // شمارش بر اساس tenant_key
      const [tenantCounts] = await connection.query(`
        SELECT 
          COALESCE(tenant_key, 'NULL') as tenant,
          COUNT(*) as count 
        FROM ${table} 
        GROUP BY tenant_key
        ORDER BY count DESC
      `);
      
      console.log(`\n   توزیع بر اساس tenant_key:`);
      tenantCounts.forEach(row => {
        const emoji = row.tenant === 'rabin' ? '✅' : 
                     row.tenant === 'NULL' ? '⚠️' : '❌';
        console.log(`   ${emoji} ${row.tenant}: ${row.count} رکورد`);
      });
      
      // بررسی رکوردهای بدون tenant_key
      const [nullTenants] = await connection.query(`
        SELECT * FROM ${table} 
        WHERE tenant_key IS NULL 
        LIMIT 5
      `);
      
      if (nullTenants.length > 0) {
        console.log(`\n   ⚠️  رکوردهای بدون tenant_key:`);
        nullTenants.forEach((row, index) => {
          const name = row.name || row.title || row.customer_name || row.id;
          console.log(`      ${index + 1}. ${name} (ID: ${row.id})`);
        });
      }
      
      // بررسی رکوردهای tenant های دیگر (غیر از rabin)
      const [otherTenants] = await connection.query(`
        SELECT * FROM ${table} 
        WHERE tenant_key IS NOT NULL 
          AND tenant_key != 'rabin'
        LIMIT 5
      `);
      
      if (otherTenants.length > 0) {
        console.log(`\n   ❌ رکوردهای tenant های دیگر:`);
        otherTenants.forEach((row, index) => {
          const name = row.name || row.title || row.customer_name || row.id;
          console.log(`      ${index + 1}. ${name} (tenant: ${row.tenant_key})`);
        });
      }
    }

    // خلاصه نهایی
    console.log('\n' + '='.repeat(60));
    console.log('📊 خلاصه نهایی:');
    console.log('='.repeat(60));
    
    for (const table of tables) {
      const [counts] = await connection.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN tenant_key = 'rabin' THEN 1 ELSE 0 END) as rabin_count,
          SUM(CASE WHEN tenant_key != 'rabin' OR tenant_key IS NULL THEN 1 ELSE 0 END) as other_count
        FROM ${table}
      `);
      
      const { total, rabin_count, other_count } = counts[0];
      const status = other_count > 0 ? '⚠️' : '✅';
      
      console.log(`\n${status} ${table}:`);
      console.log(`   کل: ${total} | rabin: ${rabin_count} | دیگر: ${other_count}`);
      
      if (other_count > 0) {
        console.log(`   ⚠️  ${other_count} رکورد نیاز به بررسی دارد!`);
      }
    }

    console.log('\n' + '='.repeat(60));
    
    // نتیجه‌گیری
    const [allOtherCount] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM customers WHERE tenant_key != 'rabin' OR tenant_key IS NULL) +
        (SELECT COUNT(*) FROM sales WHERE tenant_key != 'rabin' OR tenant_key IS NULL) +
        (SELECT COUNT(*) FROM products WHERE tenant_key != 'rabin' OR tenant_key IS NULL) +
        (SELECT COUNT(*) FROM activities WHERE tenant_key != 'rabin' OR tenant_key IS NULL) as total
    `);
    
    const totalOther = allOtherCount[0].total;
    
    if (totalOther === 0) {
      console.log('\n✅ نتیجه: همه داده‌ها متعلق به tenant "rabin" هستند');
      console.log('   هیچ مشکل Tenant Filtering وجود ندارد!');
    } else {
      console.log(`\n⚠️  نتیجه: ${totalOther} رکورد نیاز به بررسی دارد`);
      console.log('   این رکوردها ممکن است متعلق به tenant های دیگر باشند');
    }
    
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

comprehensiveTenantCheck();
