// آپدیت رمز عبور به admin123
const bcrypt = require('bcryptjs');

const newPassword = 'admin123';
const hash = bcrypt.hashSync(newPassword, 10);

console.log(`✅ هش جدید برای رمز "${newPassword}":\n`);
console.log(hash);
console.log('\n📋 SQL برای آپدیت:\n');
console.log(`UPDATE user SET password = '${hash}' WHERE nationalCode = '1';`);
