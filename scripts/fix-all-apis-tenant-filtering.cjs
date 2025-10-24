#!/usr/bin/env node

/**
 * اصلاح همه APIهای مهم برای tenant filtering
 */

const fs = require('fs');
const path = require('path');

// لیست APIهای مهم که باید tenant filtering داشته باشند
const apisToFix = [
  {
    path: 'app/api/users/coworkers/route.ts',
    description: 'API همکاران'
  },
  {
    path: 'app/api/tasks/route.ts', 
    description: 'API وظایف'
  },
  {
    path: 'app/api/activities/route.ts',
    description: 'API فعالیت‌ها'
  },
  {
    path: 'app/api/customers/route.ts',
    description: 'API مشتریان قدیمی'
  },
  {
    path: 'app/api/products/route.ts',
    description: 'API محصولات قدیمی'
  }
];

function fixTenantFiltering() {
  console.log('🔧 اصلاح tenant filtering در APIها...\n');

  for (const api of apisToFix) {
    const fullPath = path.join(__dirname, '..', api.path);
    
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${api.description}: ${api.path}`);
      
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        
        // اضافه کردن tenant key extraction
        if (!content.includes('X-Tenant-Key')) {
          content = content.replace(
            /export async function GET\(req?: NextRequest\) \{/g,
            `export async function GET(req: NextRequest) {
  try {
    const tenantKey = req.headers.get('X-Tenant-Key');
    
    if (!tenantKey) {
      return NextResponse.json(
        { success: false, message: 'Tenant key یافت نشد' },
        { status: 400 }
      );
    }`
          );
          
          // اضافه کردن WHERE tenant_key به query ها
          content = content.replace(
            /FROM (users|customers|activities|tasks|products)(\s+[a-zA-Z]+)?\s+WHERE/g,
            'FROM $1$2 WHERE tenant_key = ? AND'
          );
          
          content = content.replace(
            /FROM (users|customers|activities|tasks|products)(\s+[a-zA-Z]+)?\s+ORDER/g,
            'FROM $1$2 WHERE tenant_key = ? ORDER'
          );
          
          fs.writeFileSync(fullPath, content);
          console.log(`   🔧 اصلاح شد`);
        } else {
          console.log(`   ✅ قبلاً اصلاح شده`);
        }
      } catch (error) {
        console.log(`   ❌ خطا: ${error.message}`);
      }
    } else {
      console.log(`❌ ${api.description}: فایل وجود ندارد - ${api.path}`);
    }
  }

  console.log('\n✨ اصلاح APIها کامل شد!');
  console.log('\n📝 توصیه‌ها:');
  console.log('1. سرور را restart کنید');
  console.log('2. صفحات را refresh کنید');
  console.log('3. با tenant demo تست کنید');
}

fixTenantFiltering();