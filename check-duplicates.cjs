const XLSX = require('xlsx');
const path = require('path');

const filePath = path.join(__dirname, 'دیتا', 'sample-customers(1) (1).xlsx');
console.log('🔍 بررسی تکراری‌ها در فایل اکسل');
console.log('');

try {
    const workbook = XLSX.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    const headers = data[0];
    const rows = data.slice(1);
    
    const nameIndex = headers.findIndex(h => h.includes('نام و نام خانوادگی'));
    const phoneIndex = headers.findIndex(h => h.includes('تلفن'));
    
    // بررسی تکراری بر اساس نام
    const nameMap = new Map();
    const phoneMap = new Map();
    const duplicateNames = [];
    const duplicatePhones = [];
    
    rows.forEach((row, index) => {
        if (!row || row.every(cell => !cell)) return;
        
        const name = row[nameIndex];
        const phone = row[phoneIndex];
        const rowNum = index + 2;
        
        if (name) {
            const trimmedName = String(name).trim();
            if (nameMap.has(trimmedName)) {
                duplicateNames.push({
                    name: trimmedName,
                    rows: [nameMap.get(trimmedName), rowNum]
                });
            } else {
                nameMap.set(trimmedName, rowNum);
            }
        }
        
        if (phone) {
            const trimmedPhone = String(phone).trim();
            if (phoneMap.has(trimmedPhone)) {
                duplicatePhones.push({
                    phone: trimmedPhone,
                    rows: [phoneMap.get(trimmedPhone), rowNum]
                });
            } else {
                phoneMap.set(trimmedPhone, rowNum);
            }
        }
    });
    
    console.log('📊 نتایج:');
    console.log('─'.repeat(80));
    console.log(`تعداد نام‌های یکتا: ${nameMap.size}`);
    console.log(`تعداد شماره‌های یکتا: ${phoneMap.size}`);
    console.log(`تعداد نام‌های تکراری: ${duplicateNames.length}`);
    console.log(`تعداد شماره‌های تکراری: ${duplicatePhones.length}`);
    console.log('');
    
    if (duplicateNames.length > 0) {
        console.log('⚠️  نام‌های تکراری (20 مورد اول):');
        console.log('─'.repeat(80));
        duplicateNames.slice(0, 20).forEach(dup => {
            console.log(`"${dup.name}" - ردیف‌های: ${dup.rows.join(', ')}`);
        });
        if (duplicateNames.length > 20) {
            console.log(`... و ${duplicateNames.length - 20} مورد دیگر`);
        }
        console.log('');
    }
    
    if (duplicatePhones.length > 0) {
        console.log('⚠️  شماره‌های تکراری (20 مورد اول):');
        console.log('─'.repeat(80));
        duplicatePhones.slice(0, 20).forEach(dup => {
            console.log(`"${dup.phone}" - ردیف‌های: ${dup.rows.join(', ')}`);
        });
        if (duplicatePhones.length > 20) {
            console.log(`... و ${duplicatePhones.length - 20} مورد دیگر`);
        }
        console.log('');
    }
    
    console.log('💡 نتیجه‌گیری:');
    console.log('─'.repeat(80));
    const uniqueRecords = nameMap.size;
    const totalValid = rows.filter(row => row && !row.every(cell => !cell)).length;
    console.log(`از ${totalValid} ردیف معتبر، ${uniqueRecords} ردیف یکتا هستند.`);
    console.log(`تعداد تکراری: ${totalValid - uniqueRecords}`);
    
} catch (error) {
    console.error('❌ خطا:', error.message);
}
