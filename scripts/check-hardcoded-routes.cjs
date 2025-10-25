#!/usr/bin/env node

/**
 * بررسی لینک‌های hardcoded که باید tenant-aware باشند
 */

const fs = require('fs');
const path = require('path');

function findHardcodedRoutes(dir, results = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, .next, etc
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findHardcodedRoutes(filePath, results);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // بررسی لینک‌های hardcoded به /dashboard
      const hardcodedMatches = content.match(/href=["']\/dashboard[^"']*["']/g);
      const routerPushMatches = content.match(/router\.push\(["']\/dashboard[^"']*["']\)/g);
      const redirectMatches = content.match(/redirect\(["']\/dashboard[^"']*["']\)/g);
      
      if (hardcodedMatches || routerPushMatches || redirectMatches) {
        const relativePath = path.relative(process.cwd(), filePath);
        
        // فیلتر کردن موارد که از tenantKey استفاده می‌کنند
        const allMatches = [
          ...(hardcodedMatches || []),
          ...(routerPushMatches || []),
          ...(redirectMatches || [])
        ];
        
        // بررسی اینکه آیا در همان خط از tenantKey استفاده شده
        const problematicMatches = allMatches.filter(match => {
          // اگر در match از ${tenantKey} یا {tenantKey} استفاده شده، مشکلی نیست
          return !match.includes('${') && !match.includes('{tenantKey}');
        });
        
        if (problematicMatches.length > 0) {
          results.push({
            file: relativePath,
            matches: problematicMatches
          });
        }
      }
    }
  }

  return results;
}

function checkHardcodedRoutes() {
  console.log('🔍 بررسی لینک‌های hardcoded...\n');

  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');

  const results = [];
  
  if (fs.existsSync(appDir)) {
    findHardcodedRoutes(appDir, results);
  }
  
  if (fs.existsSync(componentsDir)) {
    findHardcodedRoutes(componentsDir, results);
  }

  if (results.length === 0) {
    console.log('✅ هیچ لینک hardcoded مشکل‌داری یافت نشد!');
    console.log('   همه لینک‌ها از tenantKey استفاده می‌کنند.\n');
    return;
  }

  console.log(`⚠️  ${results.length} فایل با لینک‌های hardcoded یافت شد:\n`);

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.file}`);
    result.matches.forEach(match => {
      console.log(`   - ${match}`);
    });
    console.log('');
  });

  console.log('💡 توصیه:');
  console.log('   این لینک‌ها باید از tenantKey استفاده کنند:');
  console.log('   href={`/${tenantKey}/dashboard/...`}');
  console.log('   یا');
  console.log('   router.push(`/${tenantKey}/dashboard/...`)');
}

checkHardcodedRoutes();