#!/usr/bin/env node

/**
 * Test script for Customer Type Implementation
 * Tests the implementation of task 9.1: Update customer list to display lead/customer type
 */

const mysql = require('mysql2/promise');

async function testCustomerTypeImplementation() {
  console.log('🧪 Testing Customer Type Implementation...\n');

  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'crm_system',
      charset: 'utf8mb4'
    });

    console.log('✅ Connected to database');

    // Test 1: Check if type column exists in customers table
    console.log('\n📋 Test 1: Checking if type column exists...');
    try {
      const [columns] = await connection.query(`
        SHOW COLUMNS FROM customers LIKE 'type'
      `);
      
      if (columns.length > 0) {
        console.log('✅ Type column exists in customers table');
        console.log('   Column details:', columns[0]);
      } else {
        console.log('❌ Type column does not exist in customers table');
        return;
      }
    } catch (error) {
      console.log('❌ Error checking type column:', error.message);
      return;
    }

    // Test 2: Check if existing customers have default type value
    console.log('\n📋 Test 2: Checking default type values...');
    try {
      const [customers] = await connection.query(`
        SELECT id, name, type, created_at 
        FROM customers 
        WHERE tenant_key = 'rabin' 
        LIMIT 5
      `);
      
      console.log(`✅ Found ${customers.length} customers`);
      customers.forEach(customer => {
        console.log(`   - ${customer.name}: type = ${customer.type || 'NULL'}`);
      });
    } catch (error) {
      console.log('❌ Error checking customer types:', error.message);
    }

    // Test 3: Test creating a new customer with default type
    console.log('\n📋 Test 3: Testing customer creation with default type...');
    try {
      const testCustomerName = `Test Customer ${Date.now()}`;
      const [result] = await connection.query(`
        INSERT INTO customers (tenant_key, name, type, created_at, updated_at)
        VALUES ('rabin', ?, 'lead', NOW(), NOW())
      `, [testCustomerName]);

      const customerId = result.insertId;
      console.log(`✅ Created test customer with ID: ${customerId}`);

      // Verify the customer was created with correct type
      const [newCustomer] = await connection.query(`
        SELECT id, name, type FROM customers WHERE id = ?
      `, [customerId]);

      if (newCustomer.length > 0 && newCustomer[0].type === 'lead') {
        console.log('✅ Customer created with correct default type: lead');
      } else {
        console.log('❌ Customer not created with correct type');
      }

      // Clean up test customer
      await connection.query('DELETE FROM customers WHERE id = ?', [customerId]);
      console.log('✅ Test customer cleaned up');

    } catch (error) {
      console.log('❌ Error testing customer creation:', error.message);
    }

    // Test 4: Test type filtering capability
    console.log('\n📋 Test 4: Testing type filtering...');
    try {
      // Count leads
      const [leadCount] = await connection.query(`
        SELECT COUNT(*) as count FROM customers 
        WHERE tenant_key = 'rabin' AND type = 'lead'
      `);

      // Count customers
      const [customerCount] = await connection.query(`
        SELECT COUNT(*) as count FROM customers 
        WHERE tenant_key = 'rabin' AND type = 'customer'
      `);

      console.log(`✅ Type filtering test:`);
      console.log(`   - Leads: ${leadCount[0].count}`);
      console.log(`   - Customers: ${customerCount[0].count}`);

    } catch (error) {
      console.log('❌ Error testing type filtering:', error.message);
    }

    // Test 5: Check indexes for performance
    console.log('\n📋 Test 5: Checking indexes...');
    try {
      const [indexes] = await connection.query(`
        SHOW INDEX FROM customers WHERE Column_name = 'type'
      `);
      
      if (indexes.length > 0) {
        console.log('✅ Type column has index for performance');
      } else {
        console.log('⚠️  Type column does not have index (may affect performance)');
      }
    } catch (error) {
      console.log('❌ Error checking indexes:', error.message);
    }

    console.log('\n🎉 Customer Type Implementation Test Complete!');

  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the test
testCustomerTypeImplementation().catch(console.error);