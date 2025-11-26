import { 
  getEmployees, 
  getCustomers, 
  getSalesReport, 
  getTasks, 
  getProjects,
  getProducts 
} from './database';

const KEYWORD_MAPPINGS: Record<string, any> = {
    // کلمات کلیدی همکاران و کاربران
    'همکاران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'همکار': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمندان': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کارمند': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'پرسنل': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'تیم': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربران': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },
    'کاربر': { action: 'getEmployees', description: 'دریافت اطلاعات کاربران' },

    // کلمات کلیدی مشتریان
    'مشتریان': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'مشتری': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'کلاینت': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'خریدار': { action: 'getCustomers', description: 'دریافت اطلاعات مشتریان' },
    'می‌شناسی': { action: 'getCustomers', description: 'جستجوی مشتری' },
    'میشناسی': { action: 'getCustomers', description: 'جستجوی مشتری' },
    'می شناسی': { action: 'getCustomers', description: 'جستجوی مشتری' },
    'شناسایی': { action: 'getCustomers', description: 'شناسایی مشتری' },

    // کلمات کلیدی فروش و درآمد
    'فروش': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'فروشات': { action: 'getSalesReport', params: ['today'], description: 'گزارش فروش امروز' },
    'درآمد': { action: 'getSalesReport', params: ['month'], description: 'گزارش درآمد ماهانه' },
    'معاملات': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },
    'معامله': { action: 'getProjects', description: 'دریافت اطلاعات معاملات' },

    // کلمات کلیدی فعالیت‌ها و گزارش‌ها
    'فعالیت': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'فعالیت‌ها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'فعالیتها': { action: 'getTasks', description: 'دریافت لیست فعالیت‌ها' },
    'وظایف': { action: 'getTasks', description: 'دریافت لیست وظایف' },
    'وظیفه': { action: 'getTasks', description: 'دریافت لیست وظایف' },
    'تسک': { action: 'getTasks', description: 'دریافت لیست تسک‌ها' },
    'تسک‌ها': { action: 'getTasks', description: 'دریافت لیست تسک‌ها' },
    
    // کلمات کلیدی گزارش
    'گزارش': { action: 'getTasks', description: 'دریافت گزارش فعالیت‌ها' },
    'گزارشات': { action: 'getTasks', description: 'دریافت گزارش فعالیت‌ها' },
    'گزارش کار': { action: 'getTasks', description: 'دریافت گزارش کار' },
    'گزارش‌ها': { action: 'getTasks', description: 'دریافت گزارش‌ها' },
    'گزارشها': { action: 'getTasks', description: 'دریافت گزارش‌ها' },
    'ریپورت': { action: 'getTasks', description: 'دریافت ریپورت فعالیت‌ها' },
    'کارها': { action: 'getTasks', description: 'دریافت لیست کارها' },
    'کار': { action: 'getTasks', description: 'دریافت اطلاعات کار' },

    // کلمات کلیدی پروژه
    'پروژه': { action: 'getProjects', description: 'دریافت اطلاعات پروژه‌ها' },
    'پروژه‌ها': { action: 'getProjects', description: 'دریافت اطلاعات پروژه‌ها' },
    'پروژه های': { action: 'getProjects', description: 'دریافت اطلاعات پروژه‌ها' },
    'پروژه ها': { action: 'getProjects', description: 'دریافت اطلاعات پروژه‌ها' },
    'پروژها': { action: 'getProjects', description: 'دریافت اطلاعات پروژه‌ها' },
    'دیل': { action: 'getProjects', description: 'دریافت اطلاعات دیل‌ها' },
    'دیل‌ها': { action: 'getProjects', description: 'دریافت اطلاعات دیل‌ها' },

    // کلمات کلیدی محصولات
    'محصولات': { action: 'getProducts', description: 'دریافت اطلاعات محصولات' },
    'محصول': { action: 'getProducts', description: 'دریافت اطلاعات محصولات' },
    'کالا': { action: 'getProducts', description: 'دریافت اطلاعات کالاها' },
    'کالاها': { action: 'getProducts', description: 'دریافت اطلاعات کالاها' },
    'کالاهای': { action: 'getProducts', description: 'دریافت اطلاعات کالاها' },
    'آیتم': { action: 'getProducts', description: 'دریافت اطلاعات آیتم‌ها' },
    'آیتم‌ها': { action: 'getProducts', description: 'دریافت اطلاعات آیتم‌ها' },
    'آیتمها': { action: 'getProducts', description: 'دریافت اطلاعات آیتم‌ها' }
};

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

export async function executeAction(action: string, params: any[] = [], tenantKey: string = 'rabin') {
    try {
        console.log(`⚡ Executing action: ${action}`, { params, tenantKey });

        let result;

        switch (action) {
            case 'getEmployees':
                console.log('👥 Fetching employees for tenant:', tenantKey);
                result = await getEmployees(tenantKey);
                break;

            case 'getCustomers':
                console.log('🏢 Fetching customers for tenant:', tenantKey);
                result = await getCustomers(tenantKey);
                break;

            case 'getSalesReport':
                const period = params[0] || 'today';
                console.log('💰 Fetching sales report for period:', period, 'tenant:', tenantKey);
                result = await getSalesReport(period, tenantKey);
                break;

            case 'getTasks':
                const assignee = params[0] || null;
                console.log('📋 Fetching tasks for tenant:', tenantKey, 'assignee:', assignee);
                result = await getTasks(assignee, tenantKey);
                break;

            case 'getProjects':
                console.log('📁 Fetching projects for tenant:', tenantKey);
                result = await getProjects(tenantKey);
                break;

            case 'getProducts':
                console.log('📦 Fetching products for tenant:', tenantKey);
                result = await getProducts(tenantKey);
                break;

            default:
                console.warn(`⚠️ Unknown action: ${action}`);
                return { success: false, error: 'عملکرد نامشخص' };
        }

        console.log(`✅ Action ${action} completed successfully`, { 
            recordCount: result.length,
            tenant: tenantKey 
        });

        return {
            success: true,
            action,
            data: result,
            count: result.length,
            timestamp: new Date().toISOString()
        };

    } catch (error: any) {
        console.error(`❌ Error executing action ${action}:`, error.message);
        console.error(`❌ Stack trace:`, error.stack);
        return {
            success: false,
            action,
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

export async function processUserText(userText: string, tenantKey: string = 'rabin') {
    try {
        console.log('🎯 Processing user text:', userText.substring(0, 50) + '...', 'tenant:', tenantKey);

        const keywords = detectKeywords(userText);

        if (keywords.length === 0) {
            console.log('ℹ️ No keywords detected');
            return {
                hasKeywords: false,
                message: 'هیچ کلمه کلیدی یافت نشد'
            };
        }

        const results = [];

        for (const keywordInfo of keywords) {
            const result = await executeAction(keywordInfo.action, keywordInfo.params, tenantKey);
            results.push({
                keyword: keywordInfo.keyword,
                description: keywordInfo.description,
                ...result
            });
        }

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

            case 'getProducts':
                summary += `${result.count} محصول فعال یافت شد. `;
                if (result.data && result.data.length > 0) {
                    const names = result.data.slice(0, 3).map((prod: any) => prod.name).filter(Boolean);
                    if (names.length > 0) {
                        summary += `نمونه: ${names.join(', ')}. `;
                    }
                }
                break;
        }
    }

    return summary.trim() || 'داده‌هایی از دیتابیس دریافت شد.';
}

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
                    `• ${emp.name} - نقش: ${emp.role || 'نامشخص'} - وضعیت: ${emp.status}`
                ).join('\n');
                if (result.count > 10) formattedData += `\n... و ${result.count - 10} همکار دیگر`;
                break;

            case 'getCustomers':
                formattedData += result.data.slice(0, 8).map((cust: any) => 
                    `• ${cust.name} - وضعیت: ${cust.status} - اولویت: ${cust.priority}`
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

            case 'getProducts':
                formattedData += result.data.slice(0, 10).map((prod: any) => {
                    let productInfo = `• ${prod.name}`;
                    if (prod.category) productInfo += ` - دسته: ${prod.category}`;
                    if (prod.price) {
                        const price = parseFloat(prod.price) || 0;
                        productInfo += ` - قیمت: ${price.toLocaleString('fa-IR')} ${prod.currency || 'IRR'}`;
                    }
                    if (prod.sku) productInfo += ` - کد: ${prod.sku}`;
                    if (prod.status) productInfo += ` - وضعیت: ${prod.status}`;
                    return productInfo;
                }).join('\n');
                if (result.count > 10) formattedData += `\n... و ${result.count - 10} محصول دیگر`;
                break;
        }

        formattedData += '\n\n';
    }

    return formattedData.trim();
}
