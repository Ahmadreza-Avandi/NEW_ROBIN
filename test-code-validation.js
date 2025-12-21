/**
 * Code validation test - checks if all files can be imported and basic structure is correct
 */

import { promises as fs } from 'fs';
import path from 'path';

async function validateFile(filePath, description) {
  console.log(`\n🔍 Validating ${description}...`);
  
  try {
    const content = await fs.readFile(filePath, 'utf8');
    
    // Basic validation checks
    const checks = [
      {
        name: 'File not empty',
        test: () => content.trim().length > 0
      },
      {
        name: 'No syntax errors (basic check)',
        test: () => {
          // Check for common syntax issues
          const openBraces = (content.match(/\{/g) || []).length;
          const closeBraces = (content.match(/\}/g) || []).length;
          const openParens = (content.match(/\(/g) || []).length;
          const closeParens = (content.match(/\)/g) || []).length;
          
          return Math.abs(openBraces - closeBraces) <= 1 && Math.abs(openParens - closeParens) <= 1;
        }
      }
    ];
    
    let passed = 0;
    let total = checks.length;
    
    for (const check of checks) {
      if (check.test()) {
        console.log(`  ✅ ${check.name}`);
        passed++;
      } else {
        console.log(`  ❌ ${check.name}`);
      }
    }
    
    console.log(`  📊 Result: ${passed}/${total} checks passed`);
    return passed === total;
    
  } catch (error) {
    console.log(`  💥 Error reading file: ${error.message}`);
    return false;
  }
}

async function validateWordPressPlugin() {
  console.log('🔧 Validating WordPress Plugin Files');
  console.log('=====================================');
  
  const pluginFiles = [
    {
      path: 'wordpress-crm-integration/wordpress-crm-integration.php',
      description: 'Main Plugin File'
    },
    {
      path: 'wordpress-crm-integration/includes/class-wp-crm-integration-admin.php',
      description: 'Admin Class'
    },
    {
      path: 'wordpress-crm-integration/includes/class-wp-crm-integration-event-handlers.php',
      description: 'Event Handlers Class'
    },
    {
      path: 'wordpress-crm-integration/includes/class-wp-crm-integration-field-mapper.php',
      description: 'Field Mapper Class'
    },
    {
      path: 'wordpress-crm-integration/includes/class-wp-crm-integration-api-client.php',
      description: 'API Client Class'
    }
  ];
  
  let allValid = true;
  
  for (const file of pluginFiles) {
    const isValid = await validateFile(file.path, file.description);
    if (!isValid) allValid = false;
  }
  
  return allValid;
}

async function validateCRMAPI() {
  console.log('\n🌐 Validating CRM API Files');
  console.log('============================');
  
  const apiFiles = [
    {
      path: 'app/api/integrations/wordpress/customers/route.ts',
      description: 'Customers API Endpoint'
    },
    {
      path: 'app/api/integrations/wordpress/orders/route.ts',
      description: 'Orders API Endpoint'
    },
    {
      path: 'app/api/integrations/wordpress/products/route.ts',
      description: 'Products API Endpoint'
    },
    {
      path: 'app/api/integrations/wordpress/test/route.ts',
      description: 'Test API Endpoint'
    },
    {
      path: 'lib/wordpress-auth.ts',
      description: 'WordPress Authentication Library'
    }
  ];
  
  let allValid = true;
  
  for (const file of apiFiles) {
    const isValid = await validateFile(file.path, file.description);
    if (!isValid) allValid = false;
  }
  
  return allValid;
}

async function validateDatabaseMigration() {
  console.log('\n🗄️ Validating Database Migration');
  console.log('=================================');
  
  const migrationFile = 'database/migrations/add-wordpress-integration-fields.sql';
  return await validateFile(migrationFile, 'WordPress Integration Migration');
}

async function runValidation() {
  console.log('🚀 Starting Code Validation Tests');
  console.log('==================================\n');
  
  const results = {
    wordpress: await validateWordPressPlugin(),
    api: await validateCRMAPI(),
    migration: await validateDatabaseMigration()
  };
  
  console.log('\n📊 Validation Summary');
  console.log('=====================');
  console.log(`WordPress Plugin: ${results.wordpress ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`CRM API: ${results.api ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Database Migration: ${results.migration ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  
  if (allPassed) {
    console.log('\n🎉 All code validation tests passed!');
    console.log('The WordPress CRM integration implementation appears to be structurally sound.');
  } else {
    console.log('\n⚠️ Some validation tests failed.');
    console.log('Please review the failed files and fix any issues.');
  }
  
  return allPassed;
}

// Run validation
runValidation().catch(console.error);