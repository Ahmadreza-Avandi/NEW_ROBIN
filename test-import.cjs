const XLSX = require('xlsx');
const path = require('path');

// خواندن فایل اکسل
const filePath = path.join(__dirname, 'دیتا', 'sample-customers(1) (1).xlsx');
console.log('📂 در حال تست ایمپورت فایل:', filePath);
console.log('');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = data[0].map(h => String(h).trim());
    const rows = data.slice(1);
    
    console.log('📋 هدرهای فایل:', headers);
    console.log('📊 تعداد کل ردیف‌ها:', rows.length);
    console.log('');
    
    // شبیه‌سازی validation
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const validSegments = ['enterprise', 'small_business', 'individual', 'medium_business'];
    const validPriorities = ['low', 'medium', 'high'];
    
    // پیدا کردن ایندکس ستون‌ها
    const nameIndex = headers.findIndex(h => h.includes('نام و نام خانوادگی'));
    const companyIndex = headers.findIndex(h => h.includes('نام شرکت'));
    const segmentIndex = headers.findIndex(h => h.includes('بخش'));
    const priorityIndex = headers.findIndex(h => h.includes('اولویت'));
    
    console.log('🔍 ایندکس ستون‌ها:');
    console.log(`  نام و نام خانوادگی: ${nameIndex}`);
    console.log(`  نام شرکت: ${companyIndex}`);
    console.log(`  بخش: ${segmentIndex}`);
    console.log(`  اولویت: ${priorityIndex}`);
    console.log('');
    
    const errorDetails = {
        emptyRows: 0,
        missingName: 0,
        invalidSegment: 0,
        invalidPriority: 0,
        otherErrors: 0
    };
    
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNum = i + 2;
        
        // Skip empty rows
        if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
            errorDetails.emptyRows++;
            continue;
        }
        
        try {
            // بررسی نام
            const name = row[nameIndex];
            if (!name || String(name).trim() === '') {
                errors.push(`ردیف ${rowNum}: نام و نام خانوادگی الزامی است`);
                errorDetails.missingName++;
                errorCount++;
                continue;
            }
            
            // بررسی segment
            let segment = row[segmentIndex];
            const companyName = row[companyIndex];
            
            if (!segment || String(segment).trim() === '') {
                segment = companyName ? 'small_business' : 'individual';
            }
            
            if (!validSegments.includes(segment)) {
                errors.push(`ردیف ${rowNum}: بخش نامعتبر "${segment}" - باید یکی از: ${validSegments.join(', ')}`);
                errorDetails.invalidSegment++;
                errorCount++;
                continue;
            }
            
            // بررسی priority
            const priority = row[priorityIndex];
            if (priority && !validPriorities.includes(priority)) {
                errors.push(`ردیف ${rowNum}: اولویت نامعتبر "${priority}" - باید یکی از: ${validPriorities.join(', ')}`);
                errorDetails.invalidPriority++;
                errorCount++;
                continue;
            }
            
            successCount++;
            
        } catch (error) {
            errors.push(`ردیف ${rowNum}: ${error.message}`);
            errorDetails.otherErrors++;
            errorCount++;
        }
    }
    
    console.log('📊 نتایج تست ایمپورت:');
    console.log('─'.repeat(80));
    console.log(`✅ موفق: ${successCount}`);
    console.log(`❌ ناموفق: ${errorCount}`);
    console.log(`📉 کل: ${successCount + errorCount}`);
    console.log('');
    
    console.log('📋 جزئیات خطاها:');
    console.log('─'.repeat(80));
    console.log(`  ردیف‌های خالی: ${errorDetails.emptyRows}`);
    console.log(`  بدون نام: ${errorDetails.missingName}`);
    console.log(`  بخش نامعتبر: ${errorDetails.invalidSegment}`);
    console.log(`  اولویت نامعتبر: ${errorDetails.invalidPriority}`);
    console.log(`  خطاهای دیگر: ${errorDetails.otherErrors}`);
    console.log('');
    
    if (errors.length > 0) {
        console.log('⚠️  نمونه خطاها (20 مورد اول):');
        console.log('─'.repeat(80));
        errors.slice(0, 20).forEach(err => console.log(err));
        
        if (errors.length > 20) {
            console.log(`... و ${errors.length - 20} خطای دیگر`);
        }
        console.log('');
    }
    
    // بررسی مقادیر segment در فایل
    console.log('🔍 بررسی مقادیر بخش (segment) در فایل:');
    console.log('─'.repeat(80));
    const segmentValues = {};
    rows.forEach(row => {
        if (row && !row.every(cell => !cell)) {
            const segment = row[segmentIndex];
            if (segment) {
                segmentValues[segment] = (segmentValues[segment] || 0) + 1;
            }
        }
    });
    
    Object.entries(segmentValues).forEach(([segment, count]) => {
        const isValid = validSegments.includes(segment);
        const status = isValid ? '✅' : '❌';
        console.log(`  ${status} ${segment}: ${count} مورد`);
    });
    console.log('');
    
    // بررسی مقادیر priority در فایل
    console.log('🔍 بررسی مقادیر اولویت (priority) در فایل:');
    console.log('─'.repeat(80));
    const priorityValues = {};
    rows.forEach(row => {
        if (row && !row.every(cell => !cell)) {
            const priority = row[priorityIndex];
            if (priority) {
                priorityValues[priority] = (priorityValues[priority] || 0) + 1;
            }
        }
    });
    
    Object.entries(priorityValues).forEach(([priority, count]) => {
        const isValid = validPriorities.includes(priority);
        const status = isValid ? '✅' : '❌';
        console.log(`  ${status} ${priority}: ${count} مورد`);
    });
    console.log('');
    
    console.log('💡 نتیجه‌گیری:');
    console.log('─'.repeat(80));
    console.log(`از ${rows.length} ردیف، ${successCount} ردیف قابل ایمپورت هستند.`);
    console.log(`تفاوت با 340 مشتری ایمپورت شده: ${successCount - 340}`);
    
    if (errorDetails.invalidSegment > 0) {
        console.log('');
        console.log('⚠️  مشکل اصلی: مقادیر نامعتبر در ستون "بخش"');
        console.log('   مقادیر مجاز: enterprise, small_business, individual');
        console.log('   برای رفع مشکل، باید مقادیر نامعتبر را تصحیح کنید یا validation را تغییر دهید.');
    }
    
} catch (error) {
    console.error('❌ خطا:', error.message);
}
