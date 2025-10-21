import { 
  getEmployees, 
  getCustomers, 
  getSalesReport, 
  getTasks, 
  getProjects 
} from './database';

/**
 */
const KEYWORD_MAPPINGS: Record<string, any> = {
    'همکاران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'همکار': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمندان': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمند': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'پرسنل': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'تیم': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربر': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },


    'مشتریان': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'مشتری': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'کلاینت': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'خریدار': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },

    'فروش': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'فروشات': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'درآمد': { action: 'getSalesReport', params: ['month'], description: 'گزارش درآمد ماهانه' },
    'معاملات': { action: 'getSalesReport', params: ['week'], description: 'گزارش معاملات هفتگی' },
    'معامله': { action: 'getSalesReport', params: ['week'], description: 'گزارش معاملات هفتگی' },

    'فعالیت': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'فعالیت‌ها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'وظایف': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'وظیفه': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },

    'پروژه': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'پروژه‌ها': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'پروژه های': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' }
};

/**
 */
export function detectKeywords(text: string) {
    const foundKeywords: any[] = [];
    const normalizedText = text.toLowerCase().trim();

    console.log('🔍 Detecting keywords in:', normalizedText);

    for (const [keyword, config] of Object.entries(KEYWORD_MAPPINGS)) {
        if (normalizedText.includes(keyword)) {
            console.log('✅ Keyword detected:', keyword);

            foundKeywords.push({
                keyword,
                action: config.action,
                params: config.params || [],
                description: config.description
            });
        }
    }

    console.log(`📊 Total keywords found: ${foundKeywords.length}`);
    return foundKeywords;
}

/**
 */
export async function executeAction(action: string, params: any[] = []) {
    try {
        console.log(`⚡ Executing action: ${action}`, params);

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

            default:
                console.warn(`⚠️ Unknown action: ${action}`);
                return { success: false, error: 'عملکرد نامشخص' };
        }

        console.log(`✅ Action ${action} completed successfully`, { recordCount: result.length });

        return {
            success: true,
            action,
            data: result,
            count: result.length,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error(`❌ Error executing action ${action}:`, error.message);
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
 */
export async function processUserText(userText: string) {
    try {
        console.log('🎯 Processing user text:', userText.substring(0, 50) + '...');

        // تشخیص کلمات کلیدی
        const keywords = detectKeywords(userText);

        if (keywords.length === 0) {
            console.log('ℹ️ No keywords detected');
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
            console.warn('⚠️ Some database queries failed:', failedResults.length);
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

    } catch (error: any) {
        console.error('❌ Error processing user text:', error.message);
        return {
            hasKeywords: false,
            error: error.message
        };
    }
}

/**
 * تولید خلاصه‌ای از داده‌های دریافت شده
 */
function generateDataSummary(results: any[]) {
    if (results.length === 0) {
        return 'هیچ داده‌ای از دیتابیس دریافت نشد.';
    }

    let summary = '';

    for (const result of results) {
        if (result.count === 0) {
            summary += `${result.description}: هیچ رکوردی یافت نشد. `;
            continue;
        }

        switch (result.action) {
            case 'getEmployees':
                summary += `${result.count} همکار فعال یافت شد. `;
                if (result.data && result.data.length > 0) {
                    const names = result.data.slice(0, 3).map((emp: any) => emp.name).filter(Boolean);
                    if (names.length > 0) {
                        summary += `نمونه: ${names.join(', ')}. `;
                    }
                    const roles = Array.from(new Set(result.data.map((emp: any) => emp.role).filter(Boolean)));
                    if (roles.length > 0) {
                        summary += `نقش‌ها: ${roles.slice(0, 3).join(', ')}. `;
                    }
                }
                break;

            case 'getCustomers':
                summary += `${result.count} مشتری یافت شد. `;
                if (result.data && result.data.length > 0) {
                    const activeCount = result.data.filter((c: any) => c.status === 'active').length;
                    summary += `فعال: ${activeCount}. `;
                }
                break;

            case 'getSalesReport':
                if (result.data && result.data.length > 0) {
                    const totalAmount = result.data.reduce((sum: number, sale: any) => sum + (parseFloat(sale.total_amount) || 0), 0);
                    const totalDeals = result.data.reduce((sum: number, sale: any) => sum + (parseInt(sale.total_deals) || 0), 0);
                    summary += `${totalDeals} معامله به ارزش ${totalAmount.toLocaleString('fa-IR')} تومان. `;
                }
                break;

            case 'getTasks':
                summary += `${result.count} فعالیت یافت شد. `;
                break;

            case 'getProjects':
                summary += `${result.count} پروژه/معامله یافت شد. `;
                break;
        }
    }

    return summary.trim() || 'داده‌هایی از دیتابیس دریافت شد.';
}

/**
 * فرمت کردن داده‌ها برای AI
 */
export function formatDataForAI(results: any[]) {
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
                formattedData += result.data.slice(0, 10).map((emp: any) => 
                    `• ${emp.name} - نقش: ${emp.role || 'نامشخص'} - بخش: ${emp.department || 'نامشخص'} - وضعیت: ${emp.status}`
                ).join('\n');
                if (result.count > 10) formattedData += `\n... و ${result.count - 10} همکار دیگر`;
                break;

            case 'getCustomers':
                formattedData += result.data.slice(0, 8).map((cust: any) => 
                    `• ${cust.name} - ${cust.industry || 'صنعت نامشخص'} - وضعیت: ${cust.status} - اولویت: ${cust.priority}`
                ).join('\n');
                if (result.count > 8) formattedData += `\n... و ${result.count - 8} مشتری دیگر`;
                break;

            case 'getSalesReport':
                const totalAmount = result.data.reduce((sum: number, sale: any) => sum + (parseFloat(sale.total_amount) || 0), 0);
                const totalDeals = result.data.reduce((sum: number, sale: any) => sum + (parseInt(sale.total_deals) || 0), 0);
                formattedData += `• تعداد کل معاملات: ${totalDeals}\n`;
                formattedData += `• مجموع مبلغ: ${totalAmount.toLocaleString('fa-IR')} تومان`;
                break;

            case 'getTasks':
                formattedData += result.data.slice(0, 5).map((task: any) => 
                    `• ${task.title} - انجام‌دهنده: ${task.performed_by} - نتیجه: ${task.outcome}`
                ).join('\n');
                if (result.count > 5) formattedData += `\n... و ${result.count - 5} وظیفه دیگر`;
                break;

            case 'getProjects':
                formattedData += result.data.slice(0, 5).map((proj: any) => 
                    `• ${proj.name} - مشتری: ${proj.customer_name || 'نامشخص'} - ارزش: ${(proj.total_value || 0).toLocaleString('fa-IR')} تومان`
                ).join('\n');
                if (result.count > 5) formattedData += `\n... و ${result.count - 5} پروژه دیگر`;
                break;
        }

        formattedData += '\n\n';
    }

    return formattedData.trim();
}