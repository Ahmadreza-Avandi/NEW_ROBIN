// تست رمز عبور و ایجاد کاربران جدید
const bcrypt = require('bcryptjs');

// هش موجود در دیتابیس
const existingHash = '$2a$10$j/KCE2ssT13HxS505UR7HecVmy53oekUg.2k5/8omY6CDoFEvYgU2';

// تست رمزهای مختلف
const passwords = ['1', '123', '1234', 'admin', 'password'];

console.log('🔍 تست رمزهای عبور:\n');

passwords.forEach(password => {
  const isMatch = bcrypt.compareSync(password, existingHash);
  console.log(`رمز "${password}": ${isMatch ? '✅ صحیح' : '❌ نادرست'}`);
});

console.log('\n📝 ایجاد هش برای رمزهای جدید:\n');

// ایجاد هش برای رمزهای جدید
const newPasswords = {
  'admin': bcrypt.hashSync('admin', 10),
  '1234': bcrypt.hashSync('1234', 10),
  'teacher': bcrypt.hashSync('teacher', 10),
};

Object.entries(newPasswords).forEach(([password, hash]) => {
  console.log(`رمز "${password}":`);
  console.log(`Hash: ${hash}\n`);
});

console.log('\n📋 SQL برای آپدیت/اضافه کردن کاربران:\n');

console.log(`-- آپدیت رمز مدیر به "admin"
UPDATE user SET password = '${newPasswords['admin']}' WHERE id = 1;

-- اضافه کردن معلم با کد ملی "2" و رمز "teacher"
INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId)
VALUES ('معلم تست', '2', '09123456789', '${newPasswords['teacher']}', 2, 1, NULL, NULL);

-- اضافه کردن معلم دیگر با کد ملی "teacher" و رمز "1234"
INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId, majorId, gradeId, classId)
VALUES ('علی احمدی', 'teacher', '09123456788', '${newPasswords['1234']}', 2, 1, NULL, NULL);
`);
