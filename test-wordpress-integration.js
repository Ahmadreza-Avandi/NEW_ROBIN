/**
 * Test script for WordPress integration endpoints
 * Run this after setting up the database migration
 */

const API_BASE = 'http://localhost:3000/api/integrations/wordpress';
const API_KEY = 'wp-integration-key-change-me'; // Should match the one in .env or database

// Test data
const testCustomer = {
  source: 'wordpress',
  wordpress_user_id: 12345,
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '+1234567890',
  company_name: 'Test Company',
  address: '123 Test St',
  city: 'Test City',
  state: 'Test State',
  country: 'USA',
  postal_code: '12345',
  registration_date: new Date().toISOString(),
  tenant_key: 'rabin'
};

const testOrder = {
  source: 'wordpress',
  wordpress_order_id: 67890,
  customer_email: 'test@example.com',
  total_amount: 299.99,
  currency: 'USD',
  status: 'processing',
  order_date: new Date().toISOString(),
  billing_info: {
    first_name: 'John',
    last_name: 'Doe',
    company: 'Test Company',
    address_1: '123 Test St',
    city: 'Test City',
    state: 'Test State',
    country: 'USA',
    postcode: '12345',
    email: 'test@example.com',
    phone: '+1234567890'
  },
  line_items: [
    {
      product_name: 'Test Product 1',
      quantity: 2,
      unit_price: 99.99,
      total_price: 199.98,
      sku: 'TEST-001'
    },
    {
      product_name: 'Test Product 2',
      quantity: 1,
      unit_price: 100.01,
      total_price: 100.01,
      sku: 'TEST-002'
    }
  ],
  tenant_key: 'rabin'
};

const testProduct = {
  source: 'wordpress',
  wordpress_product_id: 11111,
  name: 'Test WordPress Product',
  description: 'This is a test product from WordPress',
  sku: 'WP-TEST-001',
  price: 149.99,
  currency: 'USD',
  category: 'Test Category',
  status: 'active',
  tenant_key: 'rabin'
};

async function testEndpoint(endpoint, data, description) {
  console.log(`\n🧪 Testing ${description}...`);
  
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-API-Key': API_KEY
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${description} - SUCCESS`);
      console.log('Response:', JSON.stringify(result, null, 2));
    } else {
      console.log(`❌ ${description} - FAILED`);
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.log(`💥 ${description} - ERROR`);
    console.log('Error:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting WordPress Integration Tests');
  console.log('API Base:', API_BASE);
  console.log('API Key:', API_KEY);
  
  // Test customer endpoint
  await testEndpoint('/customers', testCustomer, 'Customer Creation');
  
  // Test order endpoint
  await testEndpoint('/orders', testOrder, 'Order Creation');
  
  // Test product endpoint
  await testEndpoint('/products', testProduct, 'Product Creation');
  
  console.log('\n🏁 Tests completed!');
  console.log('\n📝 Notes:');
  console.log('- Make sure to run the database migration first');
  console.log('- Update the API_KEY if you changed it in your environment');
  console.log('- Check the database to verify data was created correctly');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}