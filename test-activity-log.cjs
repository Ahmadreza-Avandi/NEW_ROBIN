const http = require('http');

// Test if activity is being logged when customer is created
async function testActivityLog() {
  console.log('🔍 Testing activity logging for customer creation...\n');

  // First, let's check recent activities
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/tenant/activities?limit=10',
    method: 'GET',
    headers: {
      'X-Tenant-Key': 'rabin',
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📋 Recent Activities:');
          if (result.success && result.data) {
            result.data.forEach((activity, index) => {
              console.log(`\n${index + 1}. ${activity.title}`);
              console.log(`   Type: ${activity.type}`);
              console.log(`   Customer: ${activity.customer_name || 'N/A'}`);
              console.log(`   Created: ${activity.created_at}`);
            });
            
            // Check for customer-related activities
            const customerActivities = result.data.filter(a => 
              a.type === 'customer' || a.title?.includes('مشتری')
            );
            console.log(`\n\n✅ Found ${customerActivities.length} customer-related activities`);
          } else {
            console.log('❌ No activities found or error:', result.message);
          }
          resolve();
        } catch (e) {
          console.error('❌ Parse error:', e.message);
          reject(e);
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.end();
  });
}

testActivityLog().catch(console.error);
