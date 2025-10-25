#!/usr/bin/env node

/**
 * لیست همه APIهایی که باید tenant filtering داشته باشند
 */

const fs = require('fs');
const path = require('path');

const apisToCheck = [
  // APIs که باید چک بشن
  'app/api/tenant/sales/route.ts',
  'app/api/tenant/deals/route.ts',
  'app/api/tenant/contacts/route.ts',
  'app/api/tenant/products/route.ts',
  'app/api/tenant/activities/route.ts',
  'app/api/tenant/tasks/route.ts',
  'app/api/tenant/customers/route.ts',
  'app/api/tenant/users/route.ts',
  'app/api/tenant/coworkers/route.ts',
  'app/api/chat/users/route.ts',
  'app/api/dashboard/stats/route.ts',
];

function checkApis() {
  console.log('🔍 بررسی APIها برای tenant filtering...\n');

  const results = {
    exists: [],
    notExists: [],
    hasTenantFiltering: [],
    needsFixing: []
  };

  for (const apiPath of apisToCheck) {
    const fullPath = path.join(__dirname, '..', apiPath);
    
    if (fs.existsSync(fullPath)) {
      results.exists.push(apiPath);
      
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // بررسی وجود tenant filtering
      const hasTenantKey = content.includes('tenant_key') || content.includes('tenantKey');
      const hasWhereClause = content.includes('WHERE') && content.includes('tenant_key');
      
      if (hasTenantKey && hasWhereClause) {
        results.hasTenantFiltering.push(apiPath);
      } else {
        results.needsFixing.push(apiPath);
      }
    } else {
      results.notExists.push(apiPath);
    }
  }

  console.log('✅ APIهای موجود با tenant filtering:');
  results.hasTenantFiltering.forEach(api => {
    console.log(`   ✓ ${api}`);
  });

  console.log('\n⚠️  APIهای موجود که نیاز به اصلاح دارند:');
  results.needsFixing.forEach(api => {
    console.log(`   ! ${api}`);
  });

  console.log('\n❌ APIهای موجود نیست:');
  results.notExists.forEach(api => {
    console.log(`   ✗ ${api}`);
  });

  console.log('\n📊 خلاصه:');
  console.log(`   کل: ${apisToCheck.length}`);
  console.log(`   موجود: ${results.exists.length}`);
  console.log(`   با tenant filtering: ${results.hasTenantFiltering.length}`);
  console.log(`   نیاز به اصلاح: ${results.needsFixing.length}`);
  console.log(`   موجود نیست: ${results.notExists.length}`);

  return results;
}

checkApis();