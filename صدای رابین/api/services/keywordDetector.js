const {
    getEmployees,
    getCustomers,
    getSalesReport,
    getTasks,
    getProjects,
    getDailyReports,
    getFeedback,
    getCalendarEvents,
    getDocuments
} = require('./database');

const { createLogger } = require('../utils/logger');
const logger = createLogger('KEYWORD_DETECTOR');

/**
 * کلمات کلیدی و عملکردهای مربوطه
 */
const KEYWORD_MAPPINGS = {
    // همکاران و کاربران
    'همکاران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'همکار': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمندان': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمند': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'پرسنل': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'تیم': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربر': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },

    // مشتریان
    'مشتریان': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'مشتری': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'کلاینت': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'خریدار': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'مراجع': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },

    // فروش و معاملات
    'فروش': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'فروشات': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'درآمد': { action: 'getSalesReport', params: ['month'], description: 'گزارش درآمد ماهانه' },
    'معاملات': { action: 'getSalesReport', params: ['week'], description: 'گزارش معاملات هفتگی' },
    'معامله': { action: 'getSalesReport', params: ['week'], description: 'گزارش معاملات هفتگی' },
    'سفارش': { action: 'getSalesReport', params: ['week'], description: 'گزارش سفارشات هفتگی' },
    'سفارشات': { action: 'getSalesReport', params: ['week'], description: 'گزارش سفارشات هفتگی' },

    // فعالیت‌ها و وظایف
    'فعالیت': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'فعالیت‌ها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'وظایف': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'وظیفه': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'تسک': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'تسک‌ها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'کار': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'کارها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },

    // پروژه‌ها و معاملات
    'پروژه': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'پروژه‌ها': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'پروژه های': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'پرژه': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },

    // گزارشات روزانه
    'گزارش': { action: 'getDailyReports', description: 'دریافت گزارشات روزانه' },
    'گزارشات': { action: 'getDailyReports', description: 'دریافت گزارشات روزانه' },
    'گزارش روزانه': { action: 'getDailyReports', description: 'دریافت گزارشات روزانه' },
    'گزارشات روزانه': { action: 'getDailyReports', description: 'دریافت گزارشات روزانه' },

    // بازخوردها و نظرات
    'بازخورد': { action: 'getFeedback', params: ['month'], description: 'دریافت بازخوردهای مشتریان' },
    'بازخوردها': { action: 'getFeedback', params: ['month'], description: 'دریافت بازخوردهای مشتریان' },
    'نظرات': { action: 'getFeedback', params: ['month'], description: 'دریافت نظرات مشتریان' },
    'نظر': { action: 'getFeedback', params: ['month'], description: 'دریافت نظرات مشتریان' },
    'رضایت': { action: 'getFeedback', params: ['month'], description: 'دریافت نظرسنجی رضایت' },

    // رویدادها و تقویم
    'رویداد': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت رویدادهای تقویم' },
    'رویدادها': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت رویدادهای تقویم' },
    'جلسه': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت جلسات' },
    'جلسات': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت جلسات' },
    'تقویم': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت رویدادهای تقویم' },
    'قرار': { action: 'getCalendarEvents', params: ['week'], description: 'دریافت قرارهای ملاقات' },

    // اسناد و مدارک
    'سند': { action: 'getDocuments', description: 'دریافت اسناد' },
    'اسناد': { action: 'getDocuments', description: 'دریافت اسناد' },
    'مدرک': { action: 'getDocuments', description: 'دریافت مدارک' },
    'مدارک': { action: 'getDocuments', description: 'دریافت مدارک' },
    'فایل': { action: 'getDocuments', description: 'دریافت فایل‌ها' },
    'فایل‌ها': { action: 'getDocuments', description: 'دریافت فایل‌ها' }
};

/**
 * کلمات زمانی برای تشخیص دوره
 */
const TIME_KEYWORDS = {
    'امروز': 'today',
    'روز': 'today',
    'هفته': 'week',
    'هفتگی': 'week',
    'ماه': 'month',
    'ماهانه': 'month',
    'ماه گذشته': 'month',
    'هفته گذشته': 'week'
};

/**
 * تشخیص کلمات کلیدی در متن
 * @param {string} text - متن ورودی کاربر
 * @returns {Array} - لیست کلمات کلیدی یافت شده
 */
function detectKeywords(text) {
    const foundKeywords = [];
    const normalizedText = text.toLowerCase().trim();

    logger.keywordProcessing(text, 0);

    // جستجوی کلمات کلیدی
    for (const [keyword, config] of Object.entries(KEYWORD_MAPPINGS)) {
        if (normalizedText.includes(keyword)) {
            logger.keywordDetected(keyword, config.action);

            // تشخیص دوره زمانی اگر مربوط به فروش باشد
            let timeParam = config.params ? config.params[0] : null;

            if (config.action === 'getSalesReport') {
                for (const [timeKeyword, timePeriod] of Object.entries(TIME_KEYWORDS)) {
                    if (normalizedText.includes(timeKeyword)) {
                        timeParam = timePeriod;
                        logger.debug(`⏰ Detected time period: ${timePeriod} for keyword: ${timeKeyword}`);
                        break;
                    }
                }
            }

            // تشخیص نام همکار برای فعالیت‌ها
            let assigneeParam = null;
            if (config.action === 'getTasks' || config.action === 'getDailyReports') {
                const names = ['احمد', 'احمدرضا', 'علی', 'سارا', 'محمد', 'فاطمه', 'حسن', 'مریم', 'آوندی', 'کریمی'];
                for (const name of names) {
                    if (normalizedText.includes(name)) {
                        assigneeParam = name;
                        logger.debug(`👤 Detected assignee: ${name}`);
                        break;
                    }
                }
            }

            foundKeywords.push({
                keyword,
                action: config.action,
                params: timeParam ? [timeParam] : (assigneeParam ? [assigneeParam] : (config.params || [])),
                description: config.description
            });
        }
    }

    logger.info(`📊 Total keywords found: ${foundKeywords.length}`, { keywords: foundKeywords.map(k => k.keyword) });
    return foundKeywords;
}

/**
 * اجرای عملکرد مربوط به کلمه کلیدی
 * @param {string} action - نام عملکرد
 * @param {Array} params - پارامترهای عملکرد
 * @returns {Promise<Object>} - نتیجه عملکرد
 */
async function executeAction(action, params = []) {
    try {
        logger.info(`⚡ Executing action: ${action}`, { params });

        let result;

        switch (action) {
            case 'getEmployees':
                result = await getEmployees();
                break;

            case 'getCustomers':
                result = await getCustomers();
                break;

            case 'getSalesReport':
                const period = params[0] || 'today';
                result = await getSalesReport(period);
                break;

            case 'getTasks':
                const assignee = params[0] || null;
                result = await getTasks(assignee);
                break;

            case 'getProjects':
                result = await getProjects();
                break;

            case 'getDailyReports':
                const userId = params[0] || null;
                result = await getDailyReports(userId);
                break;

            case 'getFeedback':
                const feedbackPeriod = params[0] || 'month';
                result = await getFeedback(feedbackPeriod);
                break;

            case 'getCalendarEvents':
                const eventPeriod = params[0] || 'week';
                result = await getCalendarEvents(eventPeriod);
                break;

            case 'getDocuments':
                const category = params[0] || null;
                result = await getDocuments(category);
                break;

            default:
                logger.warn(`⚠️ Unknown action: ${action}`);
                return { success: false, error: 'عملکرد نامشخص' };
        }

        logger.info(`✅ Action ${action} completed successfully`, { recordCount: result.length });

        return {
            success: true,
            action,
            data: result,
            count: result.length,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        logger.error(`❌ Error executing action ${action}`, { error: error.message });
        return {
            success: false,
            action,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

/**
 * پردازش متن و دریافت داده‌های مرتبط
 * @param {string} userText - متن کاربر
 * @returns {Promise<Object>} - نتیجه پردازش
 */
async function processUserText(userText) {
    try {
        logger.info('🎯 Processing user text', { textLength: userText.length, preview: userText.substring(0, 50) + '...' });

        // تشخیص کلمات کلیدی
        const keywords = detectKeywords(userText);

        if (keywords.length === 0) {
            logger.info('ℹ️ No keywords detected, proceeding without database data');
            return {
                hasKeywords: false,
                message: 'هیچ کلمه کلیدی یافت نشد'
            };
        }

        // اجرای عملکردها
        const results = [];

        for (const keywordInfo of keywords) {
            const result = await executeAction(keywordInfo.action, keywordInfo.params);
            results.push({
                keyword: keywordInfo.keyword,
                description: keywordInfo.description,
                ...result
            });
        }

        // فیلتر کردن نتایج موفق
        const successfulResults = results.filter(r => r.success);
        const failedResults = results.filter(r => !r.success);

        if (failedResults.length > 0) {
            logger.warn('⚠️ Some database queries failed', {
                failedCount: failedResults.length,
                errors: failedResults.map(r => r.error)
            });
        }

        return {
            hasKeywords: true,
            keywordsFound: keywords.length,
            successfulQueries: successfulResults.length,
            failedQueries: failedResults.length,
            results: successfulResults,
            errors: failedResults,
            summary: generateDataSummary(successfulResults)
        };

    } catch (error) {
        logger.error('❌ Error processing user text', { error: error.message });
        return {
            hasKeywords: false,
            error: error.message
        };
    }
}

/**
 * تولید خلاصه‌ای از داده‌های دریافت شده
 * @param {Array} results - نتایج موفق
 * @returns {string} - خلاصه داده‌ها
 */
function generateDataSummary(results) {
    if (results.length === 0) {
        return 'هیچ داده‌ای از دیتابیس دریافت نشد.';
    }

    let summary = '';
    let totalRecords = 0;

    for (const result of results) {
        if (result.count === 0) {
            summary += `${result.description}: هیچ رکوردی یافت نشد. `;
            continue;
        }

        totalRecords += result.count;

        switch (result.action) {
            case 'getEmployees':
                summary += `${result.count} همکار فعال یافت شد. `;
                if (result.data.length > 0) {
                    const roles = [...new Set(result.data.map(emp => emp.role).filter(Boolean))];
                    if (roles.length > 0) {
                        summary += `نقش‌ها: ${roles.slice(0, 3).join(', ')}. `;
                    }
                }
                break;

            case 'getCustomers':
                summary += `${result.count} مشتری یافت شد. `;
                if (result.data.length > 0) {
                    const activeCount = result.data.filter(c => c.status === 'active').length;
                    const prospectCount = result.data.filter(c => c.status === 'prospect').length;
                    summary += `فعال: ${activeCount}, احتمالی: ${prospectCount}. `;
                }
                break;

            case 'getSalesReport':
                if (result.data.length > 0) {
                    const totalAmount = result.data.reduce((sum, sale) => sum + (parseFloat(sale.total_amount) || 0), 0);
                    const totalDeals = result.data.reduce((sum, sale) => sum + (parseInt(sale.total_deals) || 0), 0);
                    summary += `${totalDeals} معامله به ارزش ${totalAmount.toLocaleString('fa-IR')} تومان. `;
                }
                break;

            case 'getTasks':
                summary += `${result.count} فعالیت یافت شد. `;
                if (result.data.length > 0) {
                    const completed = result.data.filter(t => t.outcome === 'completed').length;
                    const successful = result.data.filter(t => t.outcome === 'successful').length;
                    summary += `تکمیل شده: ${completed}, موفق: ${successful}. `;
                }
                break;

            case 'getProjects':
                summary += `${result.count} پروژه/معامله یافت شد. `;
                if (result.data.length > 0) {
                    const totalValue = result.data.reduce((sum, proj) => sum + (parseFloat(proj.total_value) || 0), 0);
                    summary += `مجموع ارزش: ${totalValue.toLocaleString('fa-IR')} تومان. `;
                }
                break;

            case 'getDailyReports':
                summary += `${result.count} گزارش روزانه یافت شد. `;
                if (result.data.length > 0) {
                    const latestDate = result.data[0].persian_date || result.data[0].report_date;
                    summary += `آخرین گزارش: ${latestDate}. `;
                }
                break;

            case 'getFeedback':
                summary += `${result.count} بازخورد یافت شد. `;
                if (result.data.length > 0) {
                    const avgScore = result.data.reduce((sum, fb) => sum + (parseFloat(fb.score) || 0), 0) / result.data.length;
                    const positiveCount = result.data.filter(fb => fb.sentiment === 'positive').length;
                    summary += `میانگین امتیاز: ${avgScore.toFixed(1)}, مثبت: ${positiveCount}. `;
                }
                break;

            case 'getCalendarEvents':
                summary += `${result.count} رویداد آینده یافت شد. `;
                if (result.data.length > 0) {
                    const confirmedCount = result.data.filter(e => e.status === 'confirmed').length;
                    summary += `تأیید شده: ${confirmedCount}. `;
                }
                break;

            case 'getDocuments':
                summary += `${result.count} سند یافت شد. `;
                if (result.data.length > 0) {
                    const totalSize = result.data.reduce((sum, doc) => sum + (doc.file_size || 0), 0);
                    summary += `حجم کل: ${Math.round(totalSize / 1024 / 1024)} مگابایت. `;
                }
                break;
        }
    }

    return summary.trim() || 'داده‌هایی از دیتابیس دریافت شد اما قابل خلاصه‌سازی نیستند.';
}

module.exports = {
    detectKeywords,
    executeAction,
    processUserText,
    generateDataSummary,
    KEYWORD_MAPPINGS,
    TIME_KEYWORDS
};