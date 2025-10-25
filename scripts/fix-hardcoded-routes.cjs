#!/usr/bin/env node

/**
 * اصلاح خودکار لینک‌های hardcoded
 */

const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // بررسی اینکه آیا فایل در پوشه [tenant_key] است
  const isTenantAware = filePath.includes('[tenant_key]');

  if (!isTenantAware) {
    // این فایل‌ها نباید استفاده شوند، skip می‌کنیم
    return false;
  }

  // بررسی اینکه آیا از useParams استفاده می‌کند
  const hasUseParams = content.includes('useParams');
  const hasTenantKey = content.includes('tenantKey');

  // اگر useParams نداره، اضافه کن
  if (!hasUseParams && content.includes("'use client'")) {
    content = content.replace(
      /(import.*from ['"]next\/navigation['"];)/,
      "$1\nimport { useParams } from 'next/navigation';"
    );
    modified = true;
  }

  // اگر tenantKey تعریف نشده، اضافه کن
  if (!hasTenantKey && hasUseParams) {
    // پیدا کردن اولین function component
    const functionMatch = content.match(/(export default function \w+\([^)]*\) \{)/);
    if (functionMatch) {
      const insertPoint = functionMatch.index + functionMatch[0].length;
      const before = content.substring(0, insertPoint);
      const after = content.substring(insertPoint);
      
      content = before + "\n  const params = useParams();\n  const tenantKey = (params?.tenant_key as string) || '';" + after;
      modified = true;
    }
  }

  // اصلاح router.push
  content = content.replace(
    /router\.push\(['"]\/dashboard([^'"]*)['"]\)/g,
    (match, path) => {
      modified = true;
      return `router.push(\`/\${tenantKey}/dashboard${path}\`)`;
    }
  );

  // اصلاح href
  content = content.replace(
    /href=["']\/dashboard([^"']*)['"]/g,
    (match, path) => {
      modified = true;
      return `href={\`/\${tenantKey}/dashboard${path}\`}`;
    }
  );

  // اصلاح redirect
  content = content.replace(
    /redirect\(['"]\/dashboard([^'"]*)['"]\)/g,
    (match, path) => {
      modified = true;
      return `redirect(\`/\${tenantKey}/dashboard${path}\`)`;
    }
  );

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function fixHardcodedRoutes() {
  console.log('🔧 اصلاح خودکار لینک‌های hardcoded...\n');

  const tenantDir = path.join(process.cwd(), 'app', '[tenant_key]');
  
  if (!fs.existsSync(tenantDir)) {
    console.log('❌ پوشه [tenant_key] یافت نشد');
    return;
  }

  let fixedCount = 0;
  const filesToFix = [];

  function processDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        processDir(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        
        // بررسی اینکه آیا لینک hardcoded دارد
        if (content.match(/href=["']\/dashboard/) || 
            content.match(/router\.push\(['"]\/dashboard/) ||
            content.match(/redirect\(['"]\/dashboard/)) {
          filesToFix.push(filePath);
        }
      }
    }
  }

  processDir(tenantDir);

  console.log(`📋 ${filesToFix.length} فایل نیاز به اصلاح دارند\n`);

  for (const filePath of filesToFix) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
      if (fixFile(filePath)) {
        console.log(`✅ ${relativePath}`);
        fixedCount++;
      } else {
        console.log(`⏭️  ${relativePath} (نیازی به تغییر نداشت)`);
      }
    } catch (error) {
      console.log(`❌ ${relativePath}: ${error.message}`);
    }
  }

  console.log(`\n✨ ${fixedCount} فایل اصلاح شد!`);
  
  if (fixedCount > 0) {
    console.log('\n💡 توصیه:');
    console.log('   1. فایل‌های اصلاح شده را بررسی کنید');
    console.log('   2. مطمئن شوید که همه چیز درست کار می‌کند');
    console.log('   3. سرور را restart کنید');
  }
}

fixHardcodedRoutes();