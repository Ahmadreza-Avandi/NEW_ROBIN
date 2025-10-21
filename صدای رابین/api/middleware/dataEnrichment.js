const { processUserText } = require('../services/keywordDetector');
const { testConnection } = require('../services/database');
const { createLogger } = require('../utils/logger');

const logger = createLogger('DATA_ENRICHMENT');

/**
 * Middleware برای غنی‌سازی پیام کاربر با داده‌های دیتابیس
 */
async function enrichUserMessage(req, res, next) {
  try {
    const { userMessage } = req.body;
    
    if (!userMessage) {
      return next(); // اگر پیامی نیست، ادامه بده
    }
    
    logger.info('🔄 Data enrichment middleware started', { messageLength: userMessage.length });
    
    // تست اتصال دیتابیس
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      logger.warn('⚠️ Database connection failed, proceeding without data enrichment');
      req.databaseData = {
        hasKeywords: false,
        error: 'اتصال به دیتابیس برقرار نشد'
      };
      return next();
    }
    
    // پردازش متن و دریافت داده‌ها
    const enrichmentResult = await processUserText(userMessage);
    
    // اضافه کردن نتیجه به request
    req.databaseData = enrichmentResult;
    
    if (enrichmentResult.hasKeywords && enrichmentResult.successfulQueries > 0) {
      logger.info(`✅ Data enrichment successful`, { 
        successfulQueries: enrichmentResult.successfulQueries,
        keywordsFound: enrichmentResult.keywordsFound 
      });
      
      // فرمت بهتر برای داده‌های سیستم
      const originalMessage = req.body.userMessage;
      const formattedData = formatDataForAI(enrichmentResult.results);
      
      req.body.enrichedMessage = `${originalMessage}\n\n[اطلاعات سیستم:\n${formattedData}]`;
      req.body.hasSystemData = true;
      
      logger.debug('📊 Message enriched with formatted database context');
      logger.debug(`📋 Data summary: ${enrichmentResult.summary.substring(0, 200)}...`);
    } else {
      logger.info('ℹ️ No relevant data found or no keywords detected');
      req.body.hasSystemData = false;
    }
    
    next();
    
  } catch (error) {
    logger.error('❌ Data enrichment middleware error', { error: error.message });
    
    // در صورت خطا، سیستم رو خراب نکن، فقط بدون داده ادامه بده
    req.databaseData = {
      hasKeywords: false,
      error: error.message
    };
    req.body.hasSystemData = false;
    
    next();
  }
}

/**
 * Helper function برای فرمت کردن داده‌ها برای AI
 * @param {Array} results - نتایج دیتابیس
 * @returns {string} - متن فرمت شده
 */
function formatDataForAI(results) {
  if (!results || results.length === 0) {
    return 'هیچ داده‌ای از دیتابیس یافت نشد.';
  }
  
  let formattedData = '';
  
  for (const result of results) {
    if (!result.success || !result.data || result.data.length === 0) {
      formattedData += `${result.description}: هیچ رکوردی یافت نشد\n\n`;
      continue;
    }
    
    formattedData += `${result.description} (${result.count} رکورد):\n`;
    
    switch (result.action) {
      case 'getEmployees':
        formattedData += result.data.slice(0, 10).map(emp => 
          `• ${emp.full_name || emp.username} - ${emp.role || 'نامشخص'} - وضعیت: ${emp.status}`
        ).join('\n');
        if (result.count > 10) formattedData += `\n... و ${result.count - 10} همکار دیگر`;
        break;
        
      case 'getCustomers':
        formattedData += result.data.slice(0, 8).map(cust => 
          `• ${cust.name} - ${cust.industry || 'صنعت نامشخص'} - وضعیت: ${cust.status} - اولویت: ${cust.priority}`
        ).join('\n');
        if (result.count > 8) formattedData += `\n... و ${result.count - 8} مشتری دیگر`;
        break;
        
      case 'getSalesReport':
        const totalAmount = result.data.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
        const totalDeals = result.data.reduce((sum, sale) => sum + (parseInt(sale.total_deals) || 0), 0);
        formattedData += `• تعداد کل معاملات: ${totalDeals}\n`;
        formattedData += `• مجموع مبلغ: ${totalAmount.toLocaleString('fa-IR')} تومان\n`;
        if (result.data.length > 0) {
          formattedData += `• میانگین هر معامله: ${(totalAmount / Math.max(totalDeals, 1)).toLocaleString('fa-IR')} تومان`;
        }
        break;
        
      case 'getTasks':
        const completedTasks = result.data.filter(task => task.outcome === 'completed').length;
        const pendingTasks = result.data.filter(task => task.outcome !== 'completed').length;
        formattedData += `• وظایف تکمیل شده: ${completedTasks}\n`;
        formattedData += `• وظایف در انتظار: ${pendingTasks}\n`;
        formattedData += result.data.slice(0, 5).map(task => 
          `• ${task.title} - انجام‌دهنده: ${task.performed_by} - نتیجه: ${task.outcome}`
        ).join('\n');
        if (result.count > 5) formattedData += `\n... و ${result.count - 5} وظیفه دیگر`;
        break;
        
      case 'getProjects':
        const totalValue = result.data.reduce((sum, proj) => sum + (parseFloat(proj.total_value) || 0), 0);
        formattedData += `• مجموع ارزش پروژه‌ها: ${totalValue.toLocaleString('fa-IR')} تومان\n`;
        formattedData += result.data.slice(0, 5).map(proj => 
          `• ${proj.name} - مشتری: ${proj.customer_name || 'نامشخص'} - ارزش: ${(proj.total_value || 0).toLocaleString('fa-IR')} تومان - احتمال: ${proj.probability}%`
        ).join('\n');
        if (result.count > 5) formattedData += `\n... و ${result.count - 5} پروژه دیگر`;
        break;
        
      case 'getDailyReports':
        formattedData += result.data.slice(0, 5).map(report => 
          `• ${report.user_name || 'کاربر نامشخص'} - تاریخ: ${report.persian_date || report.report_date} - ساعات کار: ${report.working_hours || 'نامشخص'}`
        ).join('\n');
        if (result.count > 5) formattedData += `\n... و ${result.count - 5} گزارش دیگر`;
        break;
        
      case 'getFeedback':
        const avgScore = result.data.reduce((sum, fb) => sum + (parseFloat(fb.score) || 0), 0) / result.data.length;
        const positiveCount = result.data.filter(fb => fb.sentiment === 'positive').length;
        formattedData += `• میانگین امتیاز: ${avgScore.toFixed(1)} از 5\n`;
        formattedData += `• بازخوردهای مثبت: ${positiveCount} از ${result.count}\n`;
        formattedData += result.data.slice(0, 3).map(fb => 
          `• ${fb.title} - امتیاز: ${fb.score} - احساس: ${fb.sentiment}`
        ).join('\n');
        break;
        
      case 'getCalendarEvents':
        formattedData += result.data.slice(0, 5).map(event => 
          `• ${event.title} - تاریخ: ${new Date(event.start_date).toLocaleDateString('fa-IR')} - نوع: ${event.type} - وضعیت: ${event.status}`
        ).join('\n');
        if (result.count > 5) formattedData += `\n... و ${result.count - 5} رویداد دیگر`;
        break;
        
      case 'getDocuments':
        formattedData += result.data.slice(0, 5).map(doc => 
          `• ${doc.title} - نوع: ${doc.mime_type || 'نامشخص'} - حجم: ${Math.round((doc.file_size || 0) / 1024)} KB`
        ).join('\n');
        if (result.count > 5) formattedData += `\n... و ${result.count - 5} سند دیگر`;
        break;
    }
    
    formattedData += '\n\n';
  }
  
  return formattedData.trim();
}

/**
 * Middleware برای لاگ کردن نتایج غنی‌سازی
 */
function logEnrichmentResults(req, res, next) {
  if (req.databaseData) {
    const { hasKeywords, successfulQueries, failedQueries, keywordsFound } = req.databaseData;
    
    logger.info('📈 Data Enrichment Summary', {
      keywordsFound: keywordsFound || 0,
      successfulQueries: successfulQueries || 0,
      failedQueries: failedQueries || 0,
      hasSystemData: req.body.hasSystemData || false
    });
  }
  
  next();
}

module.exports = {
  enrichUserMessage,
  formatDataForAI,
  logEnrichmentResults
};