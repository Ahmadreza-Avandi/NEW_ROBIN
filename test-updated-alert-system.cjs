/**
 * Test Updated Alert System
 * 
 * This script tests the updated alert system with the existing database structure
 */

const mysql = require('mysql2/promise');

const DB_CONFIG = {
  host: 'localhost',
  user: 'crm_user',
  password: '1234',
  database: 'crm_system'
};

async function testUpdatedAlertSystem() {
  let connection;

  try {
    console.log('🔄 شروع تست سیستم هشدار به‌روزرسانی شده...');
    
    connection = await mysql.createConnection(DB_CONFIG);

    // 1. Create test alerts
    console.log('\n1️⃣ ایجاد هشدارهای تست...');
    
    const testAlerts = [
      {
        type: 'warning',
        title: 'سرنخ نیاز به پیگیری دارد',
        message: 'علی احمدی بیش از 3 روز پیگیری نشده است',
        priority: 'high',
        customer_id: null
      },
      {
        type: 'error',
        title: 'سرنخ داغ عقب‌افتاده',
        message: 'شرکت رابین (سرنخ داغ) بیش از 5 روز پیگیری نشده است',
        priority: 'high',
        customer_id: null
      },
      {
        type: 'info',
        title: 'مرحله جدید',
        message: 'سرنخ جدید در مرحله تماس اولیه قرار گرفت',
        priority: 'medium',
        customer_id: null
      }
    ];

    const alertIds = [];
    for (const alert of testAlerts) {
      const [result] = await connection.query(`
        INSERT INTO alerts (
          type, title, message, priority, customer_id,
          is_read, is_dismissed, created_at
        ) VALUES (?, ?, ?, ?, ?, FALSE, FALSE, NOW())
      `, [
        alert.type, alert.title, alert.message, 
        alert.priority, alert.customer_id
      ]);
      
      alertIds.push(result.insertId);
      console.log(`✅ هشدار ایجاد شد: ${alert.title}`);
    }

    // 2. Test reading alerts
    console.log('\n2️⃣ تست خواندن هشدارها...');
    
    const [allAlerts] = await connection.query(`
      SELECT * FROM alerts 
      WHERE id IN (?, ?, ?)
      ORDER BY 
        CASE priority 
          WHEN 'high' THEN 1 
          WHEN 'medium' THEN 2 
          WHEN 'low' THEN 3 
        END,
        created_at DESC
    `, alertIds);

    console.log(`📋 ${allAlerts.length} هشدار دریافت شد:`);
    allAlerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. [${alert.priority.toUpperCase()}] ${alert.title}`);
      console.log(`      نوع: ${alert.type}, خوانده شده: ${alert.is_read ? 'بله' : 'خیر'}`);
    });

    // 3. Test unread count
    console.log('\n3️⃣ تست شمارش هشدارهای خوانده نشده...');
    
    const [unreadCount] = await connection.query(`
      SELECT COUNT(*) as count FROM alerts 
      WHERE id IN (?, ?, ?) AND is_read = FALSE AND is_dismissed = FALSE
    `, alertIds);

    console.log(`🔢 تعداد هشدارهای خوانده نشده: ${unreadCount[0].count}`);

    // 4. Test marking as read
    console.log('\n4️⃣ تست علامت‌گذاری به عنوان خوانده شده...');
    
    await connection.query(`
      UPDATE alerts 
      SET is_read = TRUE, read_at = NOW() 
      WHERE id = ?
    `, [alertIds[0]]);

    console.log(`✅ هشدار ${alertIds[0]} به عنوان خوانده شده علامت‌گذاری شد`);

    // 5. Test dismissing alert
    console.log('\n5️⃣ تست رد کردن هشدار...');
    
    await connection.query(`
      UPDATE alerts 
      SET is_dismissed = TRUE 
      WHERE id = ?
    `, [alertIds[1]]);

    console.log(`✅ هشدار ${alertIds[1]} رد شد`);

    // 6. Test filtering
    console.log('\n6️⃣ تست فیلتر کردن هشدارها...');
    
    // Get only unread, non-dismissed alerts
    const [activeAlerts] = await connection.query(`
      SELECT * FROM alerts 
      WHERE id IN (?, ?, ?) AND is_dismissed = FALSE
      ORDER BY created_at DESC
    `, alertIds);

    console.log(`📊 هشدارهای فعال: ${activeAlerts.length}`);
    activeAlerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. ${alert.title} (خوانده شده: ${alert.is_read ? 'بله' : 'خیر'})`);
    });

    // 7. Test high priority alerts
    console.log('\n7️⃣ تست هشدارهای اولویت بالا...');
    
    const [highPriorityAlerts] = await connection.query(`
      SELECT * FROM alerts 
      WHERE id IN (?, ?, ?) AND priority = 'high' AND is_dismissed = FALSE
      ORDER BY created_at DESC
    `, alertIds);

    console.log(`🚨 هشدارهای اولویت بالا: ${highPriorityAlerts.length}`);
    highPriorityAlerts.forEach((alert, index) => {
      console.log(`   ${index + 1}. ${alert.title} (${alert.type})`);
    });

    // 8. Test with customer association
    console.log('\n8️⃣ تست هشدار مرتبط با مشتری...');
    
    // Get a customer ID for testing
    const [customers] = await connection.query(`
      SELECT id, name FROM customers WHERE type = 'lead' LIMIT 1
    `);

    if (customers.length > 0) {
      const customerId = customers[0].id;
      const customerName = customers[0].name;

      const [result] = await connection.query(`
        INSERT INTO alerts (
          type, title, message, priority, customer_id,
          is_read, is_dismissed, created_at
        ) VALUES (?, ?, ?, ?, ?, FALSE, FALSE, NOW())
      `, [
        'warning', 
        'پیگیری سرنخ', 
        `سرنخ ${customerName} نیاز به پیگیری دارد`,
        'medium',
        customerId
      ]);

      alertIds.push(result.insertId);
      console.log(`✅ هشدار مرتبط با مشتری ایجاد شد: ${customerName}`);
    } else {
      console.log('⚠️ مشتری برای تست یافت نشد');
    }

    // 9. Final status check
    console.log('\n9️⃣ بررسی وضعیت نهایی...');
    
    const [finalStatus] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = TRUE THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN is_dismissed = TRUE THEN 1 ELSE 0 END) as dismissed_count,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
      FROM alerts 
      WHERE id IN (${alertIds.map(() => '?').join(', ')})
    `, alertIds);

    const status = finalStatus[0];
    console.log('📊 خلاصه وضعیت:');
    console.log(`   - کل هشدارها: ${status.total}`);
    console.log(`   - خوانده شده: ${status.read_count}`);
    console.log(`   - رد شده: ${status.dismissed_count}`);
    console.log(`   - اولویت بالا: ${status.high_priority_count}`);

    // Cleanup
    console.log('\n🧹 پاک‌سازی داده‌های تست...');
    
    await connection.query(`
      DELETE FROM alerts WHERE id IN (${alertIds.map(() => '?').join(', ')})
    `, alertIds);
    
    console.log('✅ داده‌های تست پاک شدند');

    console.log('\n🎉 تست سیستم هشدار به‌روزرسانی شده تکمیل شد!');
    console.log('\n📋 ویژگی‌های تست شده:');
    console.log('✅ ایجاد هشدار با ساختار جدید');
    console.log('✅ خواندن و مرتب‌سازی هشدارها');
    console.log('✅ شمارش هشدارهای خوانده نشده');
    console.log('✅ علامت‌گذاری به عنوان خوانده شده');
    console.log('✅ رد کردن هشدار');
    console.log('✅ فیلتر کردن بر اساس وضعیت');
    console.log('✅ فیلتر کردن بر اساس اولویت');
    console.log('✅ ارتباط با مشتریان');

  } catch (error) {
    console.error('❌ خطا در تست سیستم هشدار:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// اجرای تست
testUpdatedAlertSystem();