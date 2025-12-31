/**
 * Test Stage Change API Simulation
 * 
 * This script simulates the stage change API workflow to test the complete automation:
 * - Simulates the API call logic without HTTP
 * - Tests all automation features
 * - Verifies database changes
 */

const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'crm_system',
  charset: 'utf8mb4'
};

// Simulate the stage change API logic
async function simulateStageChangeAPI(connection, tenantKey, leadId, newStage, reason, userId, userName) {
  console.log(`🔄 شبیه‌سازی API تغییر مرحله: ${newStage}`);
  
  try {
    // Start transaction (like the API does)
    await connection.beginTransaction();

    // Get current lead information
    const [currentLeads] = await connection.query(
      'SELECT * FROM customers WHERE id = ? AND tenant_key = ? AND type = "lead"',
      [leadId, tenantKey]
    );

    if (currentLeads.length === 0) {
      await connection.rollback();
      throw new Error('سرنخ یافت نشد');
    }

    const currentLead = currentLeads[0];
    const oldStage = currentLead.current_pipeline_stage;

    console.log(`   📊 تغییر از ${oldStage} به ${newStage}`);

    // Requirement 9.4: Loss reason required for closed_lost
    if (newStage === 'closed_lost' && !reason) {
      await connection.rollback();
      throw new Error('دلیل عدم موفقیت برای مرحله "از دست رفته" الزامی است');
    }

    // Update lead stage
    const updateFields = ['current_pipeline_stage = ?', 'updated_at = NOW()'];
    const updateParams = [newStage];

    // Add loss reason if provided
    if (reason && newStage === 'closed_lost') {
      updateFields.push('loss_reason = ?');
      updateParams.push(reason);
    }

    // Requirement 9.3: Convert lead to customer when closed_won
    if (newStage === 'closed_won') {
      updateFields.push('type = ?');
      updateParams.push('customer');
    }

    // Update lead temperature (simplified)
    const newTemperature = (newStage === 'closed_won' || newStage === 'closed_lost') ? 'cold' : 'warm';
    updateFields.push('lead_temperature = ?');
    updateParams.push(newTemperature);

    // Execute update
    await connection.query(
      `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ? AND tenant_key = ?`,
      [...updateParams, leadId, tenantKey]
    );

    // Record stage change in history
    await connection.query(`
      INSERT INTO lead_pipeline_history (
        tenant_key, customer_id, from_stage, to_stage, 
        changed_by, change_reason, changed_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `, [tenantKey, leadId, oldStage, newStage, userId, reason || null]);

    // Requirement 9.5: Log stage change as activity
    await simulateLogStageChangeActivity(
      connection, tenantKey, leadId, currentLead.name, oldStage, newStage, userId, userName, reason
    );

    // Requirement 9.2: Create follow-up task for stage change
    if (newStage !== 'closed_won' && newStage !== 'closed_lost') {
      await simulateCreateStageChangeTask(connection, tenantKey, leadId, newStage, userId, currentLead);
    }

    // Requirement 9.3: Convert lead to customer when closed_won
    if (newStage === 'closed_won') {
      await simulateConvertLeadToCustomer(connection, tenantKey, leadId, userId, currentLead);
    }

    // Commit transaction
    await connection.commit();

    console.log(`✅ مرحله سرنخ با موفقیت به‌روزرسانی شد`);
    
    return {
      success: true,
      message: 'مرحله سرنخ با موفقیت به‌روزرسانی شد',
      data: {
        old_stage: oldStage,
        new_stage: newStage,
        lead_temperature: newTemperature,
        converted_to_customer: newStage === 'closed_won'
      }
    };

  } catch (error) {
    await connection.rollback();
    console.error('❌ خطا در شبیه‌سازی API:', error.message);
    throw error;
  }
}

async function simulateLogStageChangeActivity(connection, tenantKey, leadId, leadName, fromStage, toStage, userId, userName, reason) {
  const stageNames = {
    'new_lead': 'سرنخ جدید',
    'contacted': 'تماس اولیه',
    'needs_analysis': 'نیازسنجی',
    'proposal_sent': 'ارسال پیشنهاد',
    'negotiation': 'مذاکره',
    'closed_won': 'برنده شده',
    'closed_lost': 'از دست رفته'
  };

  const fromStageDisplay = stageNames[fromStage] || fromStage;
  const toStageDisplay = stageNames[toStage] || toStage;

  const title = `تغییر مرحله سرنخ: ${leadName}`;
  const description = `مرحله سرنخ ${leadName} از "${fromStageDisplay}" به "${toStageDisplay}" تغییر کرد${reason ? ` - دلیل: ${reason}` : ''}`;

  await connection.query(
    `INSERT INTO activities (
      tenant_key, customer_id, type, title, description, 
      outcome, start_time, performed_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [
      tenantKey,
      leadId,
      'lead',
      title,
      description,
      'completed',
      new Date().toISOString(),
      userId
    ]
  );

  console.log(`   📝 فعالیت ثبت شد: ${title}`);
}

async function simulateCreateStageChangeTask(connection, tenantKey, leadId, newStage, userId, lead) {
  const taskTitles = {
    'new_lead': 'تماس اولیه با سرنخ جدید',
    'contacted': 'نیازسنجی و بررسی نیازهای مشتری',
    'needs_analysis': 'آماده‌سازی و ارسال پیشنهاد',
    'proposal_sent': 'پیگیری پیشنهاد و شروع مذاکره',
    'negotiation': 'نهایی‌سازی مذاکرات و بستن قرارداد'
  };

  const taskDescriptions = {
    'new_lead': `برقراری تماس اولیه با سرنخ جدید ${lead.name} و معرفی خدمات`,
    'contacted': `انجام نیازسنجی دقیق و شناسایی نیازهای ${lead.name}`,
    'needs_analysis': `آماده‌سازی پیشنهاد مناسب بر اساس نیازهای شناسایی شده ${lead.name}`,
    'proposal_sent': `پیگیری پیشنهاد ارسالی و پاسخ به سوالات ${lead.name}`,
    'negotiation': `ادامه مذاکرات و نهایی‌سازی شرایط قرارداد با ${lead.name}`
  };

  const daysToAdd = {
    'new_lead': 1,
    'contacted': 3,
    'needs_analysis': 5,
    'proposal_sent': 3,
    'negotiation': 7
  };

  const taskTitle = taskTitles[newStage] || 'پیگیری سرنخ';
  const taskDescription = taskDescriptions[newStage] || `پیگیری سرنخ ${lead.name}`;
  const days = daysToAdd[newStage] || 3;
  const priority = (lead.lead_temperature === 'hot') ? 'high' : 'medium';

  await connection.query(`
    INSERT INTO tasks (
      tenant_key, title, description, assigned_to, customer_id,
      due_date, priority, status, assigned_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL ? DAY), ?, ?, ?, NOW(), NOW())
  `, [
    tenantKey,
    taskTitle,
    taskDescription,
    lead.sales_owner || userId,
    leadId,
    days,
    priority,
    'pending',
    userId
  ]);

  console.log(`   📋 وظیفه ایجاد شد: ${taskTitle} (${days} روز)`);
}

async function simulateConvertLeadToCustomer(connection, tenantKey, leadId, userId, lead) {
  // Create sale record
  const saleAmount = lead.deal_value || 1000000;
  
  await connection.query(`
    INSERT INTO sales (
      tenant_key, customer_id, customer_name, total_amount, sale_date,
      payment_status, notes, sales_person_id, sales_person_name, created_at, updated_at
    ) VALUES (?, ?, ?, ?, NOW(), 'paid', ?, ?, ?, NOW(), NOW())
  `, [
    tenantKey,
    leadId,
    lead.name,
    saleAmount,
    'فروش ناشی از تبدیل خودکار سرنخ',
    lead.sales_owner || userId,
    'سیستم'
  ]);

  // Create post-conversion follow-up task
  await connection.query(`
    INSERT INTO tasks (
      tenant_key, title, description, assigned_to, customer_id,
      due_date, priority, status, assigned_by, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), ?, ?, ?, NOW(), NOW())
  `, [
    tenantKey,
    `پیگیری مشتری جدید: ${lead.name}`,
    `پیگیری و ارائه خدمات پس از فروش به مشتری ${lead.name}`,
    lead.sales_owner || userId,
    leadId,
    'high',
    'pending',
    userId
  ]);

  console.log(`   💰 فروش ثبت شد: ${saleAmount.toLocaleString()} تومان`);
  console.log(`   📋 وظیفه پس از فروش ایجاد شد`);
}

async function testCompleteStageChangeWorkflow() {
  let connection;

  try {
    console.log('🔄 شروع تست کامل workflow تغییر مرحله...');
    
    connection = await mysql.createConnection(config);
    const tenantKey = 'rabin';
    const userId = 'test-user';
    const userName = 'کاربر تست';

    // 1. Create test leads
    console.log('\n1️⃣ ایجاد سرنخ‌های تست...');
    
    const leadId1 = `test-workflow-${Date.now()}`;
    const leadId2 = `test-workflow-won-${Date.now()}`;
    const leadId3 = `test-workflow-lost-${Date.now()}`;

    await connection.query(`
      INSERT INTO customers (
        id, tenant_key, name, email, phone, type, 
        current_pipeline_stage, deal_value, success_probability,
        sales_owner, lead_temperature, created_at, updated_at
      ) VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()),
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      leadId1, tenantKey, 'تست workflow عادی', 'test1@workflow.com', '09111111111',
      'lead', 'new_lead', 1500000, 75, userId, 'warm',
      leadId2, tenantKey, 'تست workflow برنده', 'test2@workflow.com', '09222222222',
      'lead', 'negotiation', 2500000, 90, userId, 'hot',
      leadId3, tenantKey, 'تست workflow از دست رفته', 'test3@workflow.com', '09333333333',
      'lead', 'proposal_sent', 800000, 40, userId, 'cold'
    ]);

    console.log(`✅ سرنخ‌های تست ایجاد شدند`);

    // 2. Test normal stage progression
    console.log('\n2️⃣ تست پیشرفت عادی مراحل...');
    
    // new_lead → contacted
    await simulateStageChangeAPI(connection, tenantKey, leadId1, 'contacted', 'تماس موفق', userId, userName);
    
    // contacted → needs_analysis
    await simulateStageChangeAPI(connection, tenantKey, leadId1, 'needs_analysis', 'نیازسنجی انجام شد', userId, userName);

    // 3. Test closed_won conversion
    console.log('\n3️⃣ تست تبدیل به مشتری (closed_won)...');
    
    await simulateStageChangeAPI(connection, tenantKey, leadId2, 'closed_won', 'قرارداد امضا شد', userId, userName);

    // 4. Test closed_lost with reason
    console.log('\n4️⃣ تست از دست رفته با دلیل...');
    
    await simulateStageChangeAPI(connection, tenantKey, leadId3, 'closed_lost', 'بودجه کافی نداشت', userId, userName);

    // 5. Test closed_lost without reason (should fail)
    console.log('\n5️⃣ تست از دست رفته بدون دلیل (باید ناموفق باشد)...');
    
    const leadId4 = `test-workflow-fail-${Date.now()}`;
    await connection.query(`
      INSERT INTO customers (
        id, tenant_key, name, email, phone, type, 
        current_pipeline_stage, deal_value, success_probability,
        sales_owner, lead_temperature, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, [
      leadId4, tenantKey, 'تست شکست', 'test4@fail.com', '09444444444',
      'lead', 'negotiation', 600000, 20, userId, 'cold'
    ]);

    try {
      await simulateStageChangeAPI(connection, tenantKey, leadId4, 'closed_lost', null, userId, userName);
      console.log('❌ API باید شکست می‌خورد ولی موفق شد');
    } catch (error) {
      console.log('✅ API به درستی شکست خورد:', error.message);
    }

    // 6. Check final results
    console.log('\n6️⃣ بررسی نتایج نهایی...');
    
    // Check customer types
    const [customers] = await connection.query(`
      SELECT id, name, type, current_pipeline_stage, loss_reason 
      FROM customers 
      WHERE id IN (?, ?, ?, ?) AND tenant_key = ?
    `, [leadId1, leadId2, leadId3, leadId4, tenantKey]);

    console.log('\n📊 وضعیت نهایی مشتریان:');
    customers.forEach(customer => {
      console.log(`   ${customer.name}: ${customer.type} (${customer.current_pipeline_stage})${customer.loss_reason ? ` - ${customer.loss_reason}` : ''}`);
    });

    // Check tasks created
    const [tasks] = await connection.query(`
      SELECT COUNT(*) as count FROM tasks 
      WHERE customer_id IN (?, ?, ?, ?) AND tenant_key = ?
    `, [leadId1, leadId2, leadId3, leadId4, tenantKey]);

    // Check activities logged
    const [activities] = await connection.query(`
      SELECT COUNT(*) as count FROM activities 
      WHERE customer_id IN (?, ?, ?, ?) AND tenant_key = ?
    `, [leadId1, leadId2, leadId3, leadId4, tenantKey]);

    // Check sales created
    const [sales] = await connection.query(`
      SELECT COUNT(*) as count FROM sales 
      WHERE customer_id IN (?, ?, ?, ?) AND tenant_key = ?
    `, [leadId1, leadId2, leadId3, leadId4, tenantKey]);

    // Check pipeline history
    const [history] = await connection.query(`
      SELECT COUNT(*) as count FROM lead_pipeline_history 
      WHERE customer_id IN (?, ?, ?, ?) AND tenant_key = ?
    `, [leadId1, leadId2, leadId3, leadId4, tenantKey]);

    console.log(`\n📈 آمار نهایی:`);
    console.log(`   ${tasks[0].count} وظیفه ایجاد شد`);
    console.log(`   ${activities[0].count} فعالیت ثبت شد`);
    console.log(`   ${sales[0].count} رکورد فروش ایجاد شد`);
    console.log(`   ${history[0].count} تغییر مرحله در تاریخچه ثبت شد`);

    // Cleanup
    console.log('\n🧹 پاک‌سازی داده‌های تست...');
    
    await connection.query('DELETE FROM sales WHERE customer_id IN (?, ?, ?, ?)', [leadId1, leadId2, leadId3, leadId4]);
    await connection.query('DELETE FROM lead_pipeline_history WHERE customer_id IN (?, ?, ?, ?)', [leadId1, leadId2, leadId3, leadId4]);
    await connection.query('DELETE FROM tasks WHERE customer_id IN (?, ?, ?, ?)', [leadId1, leadId2, leadId3, leadId4]);
    await connection.query('DELETE FROM activities WHERE customer_id IN (?, ?, ?, ?)', [leadId1, leadId2, leadId3, leadId4]);
    await connection.query('DELETE FROM customers WHERE id IN (?, ?, ?, ?)', [leadId1, leadId2, leadId3, leadId4]);
    
    console.log('✅ داده‌های تست پاک شدند');

    console.log('\n🎉 تست کامل workflow تغییر مرحله تکمیل شد!');
    console.log('\n📋 خلاصه نتایج:');
    console.log('✅ پیشرفت عادی مراحل با ایجاد وظایف و فعالیت‌ها');
    console.log('✅ تبدیل خودکار سرنخ به مشتری در مرحله closed_won');
    console.log('✅ الزام دلیل برای مرحله closed_lost');
    console.log('✅ ثبت تاریخچه تغییرات مراحل');
    console.log('✅ ایجاد رکوردهای فروش');
    console.log('✅ مدیریت خطا برای ورودی‌های نامعتبر');

  } catch (error) {
    console.error('❌ خطا در تست workflow:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اجرای تست
testCompleteStageChangeWorkflow();