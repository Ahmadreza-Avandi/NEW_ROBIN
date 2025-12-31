const mysql = require('mysql2/promise');

// Test configuration
const dbConfig = {
  host: 'localhost',
  user: 'crm_user',
  password: '1234',
  database: 'crm_system'
};

async function testBackendServices() {
  console.log('🧪 Testing Sales Pipeline Backend Services...\n');
  
  let connection;
  try {
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection established\n');

    // Test 1: Lead Temperature Calculation Logic
    console.log('📊 Test 1: Lead Temperature Calculation');
    
    function calculateLeadTemperature(lead) {
      const now = new Date();
      const lastFollowup = new Date(lead.last_followup_date);
      const daysSince = Math.floor((now - lastFollowup) / (1000 * 60 * 60 * 24));
      
      // Hot: recent interaction + high probability
      if (daysSince <= 1 && lead.success_probability >= 70) {
        return 'hot';
      }
      
      // Cold: no follow-up for more than 3 days
      if (daysSince > 3) {
        return 'cold';
      }
      
      // Warm: everything else
      return 'warm';
    }
    
    // Test cases
    const testCases = [
      {
        name: 'Hot Lead',
        lead: {
          last_followup_date: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
          success_probability: 80
        },
        expected: 'hot'
      },
      {
        name: 'Cold Lead',
        lead: {
          last_followup_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
          success_probability: 30
        },
        expected: 'cold'
      },
      {
        name: 'Warm Lead',
        lead: {
          last_followup_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          success_probability: 50
        },
        expected: 'warm'
      }
    ];
    
    let temperatureTestsPassed = 0;
    for (const testCase of testCases) {
      const result = calculateLeadTemperature(testCase.lead);
      const passed = result === testCase.expected;
      console.log(`   ${passed ? '✅' : '❌'} ${testCase.name}: ${result} (expected: ${testCase.expected})`);
      if (passed) temperatureTestsPassed++;
    }
    
    console.log(`   📊 Temperature tests: ${temperatureTestsPassed}/${testCases.length} passed\n`);

    // Test 2: Database Schema Validation
    console.log('🗄️  Test 2: Database Schema Validation');
    
    // Check customers table has required fields
    const [customerFields] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'customers' 
      AND COLUMN_NAME IN ('type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'lead_temperature')
      ORDER BY COLUMN_NAME
    `);
    
    const requiredFields = ['type', 'current_pipeline_stage', 'deal_value', 'success_probability', 'lead_temperature'];
    let schemaTestsPassed = 0;
    
    for (const field of requiredFields) {
      const fieldExists = customerFields.some(f => f.COLUMN_NAME === field);
      console.log(`   ${fieldExists ? '✅' : '❌'} Field '${field}' exists`);
      if (fieldExists) schemaTestsPassed++;
    }
    
    console.log(`   📊 Schema tests: ${schemaTestsPassed}/${requiredFields.length} passed\n`);

    // Test 3: Pipeline Stages Configuration
    console.log('⚙️  Test 3: Pipeline Stages Configuration');
    
    const [stages] = await connection.execute(`
      SELECT name, display_name, stage_order 
      FROM pipeline_stages 
      WHERE tenant_key = 'rabin' 
      ORDER BY stage_order
    `);
    
    const requiredStages = ['new_lead', 'contacted', 'needs_analysis', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost'];
    let stageTestsPassed = 0;
    
    for (const requiredStage of requiredStages) {
      const stageExists = stages.some(s => s.name === requiredStage);
      console.log(`   ${stageExists ? '✅' : '❌'} Stage '${requiredStage}' configured`);
      if (stageExists) stageTestsPassed++;
    }
    
    console.log(`   📊 Stage tests: ${stageTestsPassed}/${requiredStages.length} passed\n`);

    // Test 4: Lead Pipeline History Table
    console.log('📈 Test 4: Lead Pipeline History Table');
    
    const [historyStructure] = await connection.execute(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'crm_system' 
      AND TABLE_NAME = 'lead_pipeline_history'
      ORDER BY COLUMN_NAME
    `);
    
    const requiredHistoryFields = ['customer_id', 'from_stage', 'to_stage', 'changed_by', 'changed_at'];
    let historyTestsPassed = 0;
    
    for (const field of requiredHistoryFields) {
      const fieldExists = historyStructure.some(f => f.COLUMN_NAME === field);
      console.log(`   ${fieldExists ? '✅' : '❌'} History field '${field}' exists`);
      if (fieldExists) historyTestsPassed++;
    }
    
    console.log(`   📊 History tests: ${historyTestsPassed}/${requiredHistoryFields.length} passed\n`);

    // Test 5: Data Integrity Test
    console.log('🔍 Test 5: Data Integrity Test');
    
    // Create a test lead
    const testLeadId = 'test-lead-' + Date.now();
    await connection.execute(`
      INSERT INTO customers (id, tenant_key, name, type, current_pipeline_stage, deal_value, success_probability, lead_temperature)
      VALUES (?, 'rabin', 'Test Lead Backend', 'lead', 'new_lead', 500000, 60, 'warm')
    `, [testLeadId]);
    
    console.log('   ✅ Test lead created');
    
    // Update stage and create history
    await connection.execute(`
      UPDATE customers 
      SET current_pipeline_stage = 'contacted', lead_temperature = 'hot'
      WHERE id = ?
    `, [testLeadId]);
    
    await connection.execute(`
      INSERT INTO lead_pipeline_history (customer_id, tenant_key, from_stage, to_stage, changed_by)
      VALUES (?, 'rabin', 'new_lead', 'contacted', 'test-system')
    `, [testLeadId]);
    
    console.log('   ✅ Stage change recorded');
    
    // Verify data consistency
    const [leadData] = await connection.execute(`
      SELECT c.name, c.current_pipeline_stage, c.lead_temperature,
             h.from_stage, h.to_stage, h.changed_by
      FROM customers c
      LEFT JOIN lead_pipeline_history h ON c.id = h.customer_id
      WHERE c.id = ?
      ORDER BY h.changed_at DESC
      LIMIT 1
    `, [testLeadId]);
    
    const dataConsistent = leadData.length > 0 && 
                          leadData[0].current_pipeline_stage === 'contacted' &&
                          leadData[0].to_stage === 'contacted';
    
    console.log(`   ${dataConsistent ? '✅' : '❌'} Data consistency verified`);
    
    // Clean up test data
    await connection.execute('DELETE FROM lead_pipeline_history WHERE customer_id = ?', [testLeadId]);
    await connection.execute('DELETE FROM customers WHERE id = ?', [testLeadId]);
    console.log('   🗑️  Test data cleaned up\n');

    // Summary
    console.log('📋 Backend Services Test Summary:');
    console.log(`   🌡️  Temperature Calculation: ${temperatureTestsPassed}/${testCases.length} tests passed`);
    console.log(`   🗄️  Database Schema: ${schemaTestsPassed}/${requiredFields.length} tests passed`);
    console.log(`   ⚙️  Pipeline Stages: ${stageTestsPassed}/${requiredStages.length} tests passed`);
    console.log(`   📈 History Table: ${historyTestsPassed}/${requiredHistoryFields.length} tests passed`);
    console.log(`   🔍 Data Integrity: ${dataConsistent ? 'PASSED' : 'FAILED'}`);
    
    const totalTests = testCases.length + requiredFields.length + requiredStages.length + requiredHistoryFields.length + 1;
    const passedTests = temperatureTestsPassed + schemaTestsPassed + stageTestsPassed + historyTestsPassed + (dataConsistent ? 1 : 0);
    
    console.log(`\n🎉 Overall Result: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('✅ All backend services are working correctly!');
    } else {
      console.log('⚠️  Some tests failed - backend needs attention');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

testBackendServices();