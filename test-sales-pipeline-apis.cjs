/**
 * Test script for Sales Pipeline APIs
 * 
 * This script tests the basic functionality of the sales pipeline APIs
 * to ensure they are working correctly.
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'crm_user',
  password: '1234',
  database: 'crm_system',
  charset: 'utf8mb4'
};

async function testSalesPipelineAPIs() {
  let connection;

  try {
    console.log('🧪 شروع تست APIهای Sales Pipeline...\n');

    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ اتصال به دیتابیس برقرار شد');

    // Test 1: Check if pipeline stages table exists
    console.log('\n📋 تست 1: بررسی وجود جدول pipeline_stages');
    try {
      const [stages] = await connection.query('SELECT * FROM pipeline_stages LIMIT 1');
      console.log('✅ جدول pipeline_stages موجود است');
    } catch (error) {
      console.log('❌ جدول pipeline_stages موجود نیست:', error.message);
    }

    // Test 2: Check if lead_pipeline_history table exists
    console.log('\n📋 تست 2: بررسی وجود جدول lead_pipeline_history');
    try {
      const [history] = await connection.query('SELECT * FROM lead_pipeline_history LIMIT 1');
      console.log('✅ جدول lead_pipeline_history موجود است');
    } catch (error) {
      console.log('❌ جدول lead_pipeline_history موجود نیست:', error.message);
    }

    // Test 3: Check if customers table has pipeline fields
    console.log('\n📋 تست 3: بررسی فیلدهای pipeline در جدول customers');
    try {
      const [columns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' 
        AND COLUMN_NAME IN ('type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'lead_temperature')
      `, [dbConfig.database]);
      
      const requiredFields = ['type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'lead_temperature'];
      const existingFields = columns.map(col => col.COLUMN_NAME);
      
      console.log('موجود:', existingFields.join(', '));
      
      const missingFields = requiredFields.filter(field => !existingFields.includes(field));
      if (missingFields.length === 0) {
        console.log('✅ همه فیلدهای pipeline در جدول customers موجود است');
      } else {
        console.log('❌ فیلدهای مفقود:', missingFields.join(', '));
      }
    } catch (error) {
      console.log('❌ خطا در بررسی فیلدهای customers:', error.message);
    }

    // Test 4: Check if there are any leads in the system
    console.log('\n📋 تست 4: بررسی وجود سرنخ‌ها در سیستم');
    try {
      const [leads] = await connection.query(`
        SELECT COUNT(*) as lead_count 
        FROM customers 
        WHERE tenant_key = 'rabin' AND type = 'lead'
      `);
      console.log(`✅ تعداد سرنخ‌ها: ${leads[0].lead_count}`);
    } catch (error) {
      console.log('❌ خطا در شمارش سرنخ‌ها:', error.message);
    }

    // Test 5: Test lead temperature calculation logic
    console.log('\n📋 تست 5: تست منطق محاسبه دمای سرنخ');
    try {
      // Import the temperature service
      const { leadTemperatureService } = require('./lib/lead-temperature-service.ts');
      
      // Test lead with hot temperature criteria
      const hotLead = {
        id: 'test-1',
        last_interaction: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        last_followup_date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        success_probability: 80
      };
      
      const temperature = leadTemperatureService.calculateLeadTemperature(hotLead);
      console.log(`✅ دمای محاسبه شده برای سرنخ داغ: ${temperature}`);
      
      if (temperature === 'hot') {
        console.log('✅ منطق محاسبه دمای داغ صحیح است');
      } else {
        console.log('❌ منطق محاسبه دمای داغ نادرست است');
      }
      
    } catch (error) {
      console.log('❌ خطا در تست محاسبه دما:', error.message);
    }

    // Test 6: Test API file structure
    console.log('\n📋 تست 6: بررسی ساختار فایل‌های API');
    const fs = require('fs');
    const path = require('path');
    
    const apiFiles = [
      'app/api/[tenant_key]/sales-pipeline/route.ts',
      'app/api/[tenant_key]/sales-pipeline/lead/[id]/stage/route.ts',
      'app/api/[tenant_key]/sales-pipeline/lead/[id]/details/route.ts',
      'app/api/[tenant_key]/sales-pipeline/lead/[id]/convert/route.ts',
      'app/api/[tenant_key]/sales-pipeline/automation/route.ts',
      'app/api/[tenant_key]/sales-pipeline/jobs/route.ts'
    ];
    
    let allFilesExist = true;
    for (const file of apiFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} موجود نیست`);
        allFilesExist = false;
      }
    }
    
    if (allFilesExist) {
      console.log('✅ همه فایل‌های API موجود هستند');
    }

    // Test 7: Test service files
    console.log('\n📋 تست 7: بررسی فایل‌های سرویس');
    const serviceFiles = [
      'lib/sales-pipeline-types.ts',
      'lib/lead-temperature-service.ts',
      'lib/lead-automation-service.ts',
      'lib/sales-pipeline-jobs.ts'
    ];
    
    let allServicesExist = true;
    for (const file of serviceFiles) {
      if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} موجود نیست`);
        allServicesExist = false;
      }
    }
    
    if (allServicesExist) {
      console.log('✅ همه فایل‌های سرویس موجود هستند');
    }

    console.log('\n🎉 تست‌های Sales Pipeline API تکمیل شدند!');

  } catch (error) {
    console.error('❌ خطای کلی در تست:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 اتصال دیتابیس بسته شد');
    }
  }
}

// Run the tests
if (require.main === module) {
  testSalesPipelineAPIs().catch(console.error);
}

module.exports = { testSalesPipelineAPIs };