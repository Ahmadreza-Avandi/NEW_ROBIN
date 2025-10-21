const XLSX = require('xlsx');
const path = require('path');

// خواندن فایل اکسل
const filePath = path.join(__dirname, 'دیتا', 'sample-customers(1) (1).xlsx');
console.log('📂 در حال خواندن فایل:', filePath);
console.log('');

try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // تبدیل به JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log('✅ فایل با موفقیت خوانده شد');
    console.log('📊 نام شیت:', sheetName);
    console.log('📏 تعداد کل ردیف‌ها:', data.length);
    console.log('');
    
    // نمایش هدرها (سطر اول)
    if (data.length > 0) {
        console.log('📋 هدرهای فایل (سطر اول):');
        console.log('─'.repeat(80));
        const headers = data[0];
        headers.forEach((header, index) => {
            console.log(`${index + 1}. ${header}`);
        });
        console.log('');
    }
    
    // نمایش 5 ردیف اول داده
    console.log('📝 نمونه 5 ردیف اول داده:');
    console.log('─'.repeat(80));
    for (let i = 1; i <= Math.min(5, data.length - 1); i++) {
        console.log(`\nردیف ${i}:`);
        const row = data[i];
        const headers = data[0];
        headers.forEach((header, index) => {
            if (row[index]) {
                console.log(`  ${header}: ${row[index]}`);
            }
        });
    }
    console.log('');
    
    // تحلیل داده‌ها
    console.log('🔍 تحلیل داده‌ها:');
    console.log('─'.repeat(80));
    
    const headers = data[0];
    const rows = data.slice(1);
    
    console.log(`📊 تعداد کل ردیف‌های داده: ${rows.length}`);
    
    // بررسی ردیف‌های خالی
    let emptyRows = 0;
    let validRows = 0;
    let missingNameRows = 0;
    
    const rowAnalysis = [];
    
    rows.forEach((row, index) => {
        const rowNum = index + 2; // +2 چون از ردیف 1 شروع میشه و ردیف 1 هدر هست
        
        // بررسی اینکه آیا ردیف کاملاً خالی است
        const isEmpty = row.every(cell => !cell || String(cell).trim() === '');
        
        if (isEmpty) {
            emptyRows++;
            rowAnalysis.push({ rowNum, status: 'خالی', reason: 'تمام سلول‌ها خالی هستند' });
            return;
        }
        
        // بررسی فیلد نام (فرض می‌کنیم اولین ستون نام است)
        const nameIndex = headers.findIndex(h => 
            h && (h.includes('نام') || h.toLowerCase().includes('name'))
        );
        
        if (nameIndex !== -1) {
            const name = row[nameIndex];
            if (!name || String(name).trim() === '') {
                missingNameRows++;
                rowAnalysis.push({ rowNum, status: 'نامعتبر', reason: 'فیلد نام خالی است' });
                return;
            }
        }
        
        validRows++;
        rowAnalysis.push({ rowNum, status: 'معتبر', reason: 'دارای داده‌های لازم' });
    });
    
    console.log(`✅ ردیف‌های معتبر: ${validRows}`);
    console.log(`❌ ردیف‌های خالی: ${emptyRows}`);
    console.log(`⚠️  ردیف‌های بدون نام: ${missingNameRows}`);
    console.log(`📉 ردیف‌های نامعتبر کل: ${emptyRows + missingNameRows}`);
    console.log('');
    
    // نمایش ردیف‌های نامعتبر
    const invalidRows = rowAnalysis.filter(r => r.status !== 'معتبر');
    if (invalidRows.length > 0) {
        console.log('⚠️  لیست ردیف‌های نامعتبر (20 مورد اول):');
        console.log('─'.repeat(80));
        invalidRows.slice(0, 20).forEach(r => {
            console.log(`ردیف ${r.rowNum}: ${r.reason}`);
        });
        
        if (invalidRows.length > 20) {
            console.log(`... و ${invalidRows.length - 20} ردیف نامعتبر دیگر`);
        }
        console.log('');
    }
    
    // بررسی ستون‌های مهم
    console.log('📊 بررسی ستون‌های مهم:');
    console.log('─'.repeat(80));
    
    const importantColumns = [
        'نام و نام خانوادگی',
        'نام شرکت',
        'بخش',
        'ایمیل',
        'تلفن',
        'اولویت',
        'شهر',
        'استان'
    ];
    
    importantColumns.forEach(colName => {
        const colIndex = headers.findIndex(h => 
            h && (h.includes(colName) || h === colName)
        );
        
        if (colIndex !== -1) {
            const filledCount = rows.filter(row => 
                row[colIndex] && String(row[colIndex]).trim() !== ''
            ).length;
            const percentage = ((filledCount / rows.length) * 100).toFixed(1);
            console.log(`${colName}: ${filledCount}/${rows.length} (${percentage}%)`);
        } else {
            console.log(`${colName}: ❌ ستون یافت نشد`);
        }
    });
    
    console.log('');
    console.log('💡 نتیجه‌گیری:');
    console.log('─'.repeat(80));
    console.log(`از ${rows.length} ردیف داده، ${validRows} ردیف معتبر و قابل ایمپورت هستند.`);
    console.log(`تفاوت با تعداد ایمپورت شده (340): ${validRows - 340}`);
    
    if (validRows > 340) {
        console.log('⚠️  احتمالاً برخی ردیف‌ها به دلیل خطاهای اعتبارسنجی ایمپورت نشده‌اند.');
    }
    
} catch (error) {
    console.error('❌ خطا در خواندن فایل:', error.message);
    console.error('');
    console.error('💡 راهنمایی:');
    console.error('- مطمئن شوید فایل در مسیر صحیح قرار دارد');
    console.error('- مطمئن شوید پکیج xlsx نصب شده است: npm install xlsx');
}
