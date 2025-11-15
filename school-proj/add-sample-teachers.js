const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function addSampleTeachers() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'crm_user',
      password: '1234',
      database: 'school'
    });

    console.log('✅ اتصال به دیتابیس برقرار شد');

    // هش کردن رمز عبور
    const password = 'teacher123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // معلمان نمونه
    const teachers = [
      { fullName: 'احمد محمدی', nationalCode: '1234567890', phoneNumber: '09121234567' },
      { fullName: 'فاطمه احمدی', nationalCode: '0987654321', phoneNumber: '09129876543' },
      { fullName: 'علی رضایی', nationalCode: '1122334455', phoneNumber: '09111223344' },
    ];

    console.log('\n📝 در حال افزودن معلمان...\n');

    for (const teacher of teachers) {
      try {
        await connection.execute(
          `INSERT INTO user (fullName, nationalCode, phoneNumber, password, roleId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 2, NOW(), NOW())`,
          [teacher.fullName, teacher.nationalCode, teacher.phoneNumber, hashedPassword]
        );
        console.log(`✅ ${teacher.fullName} - کد ملی: ${teacher.nationalCode}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  ${teacher.fullName} قبلاً ثبت شده`);
        } else {
          console.error(`❌ خطا در افزودن ${teacher.fullName}:`, err.message);
        }
      }
    }

    // نمایش لیست معلمان
    const [allTeachers] = await connection.execute(
      `SELECT id, fullName, nationalCode, phoneNumber FROM user WHERE roleId = 2`
    );

    console.log('\n📋 لیست معلمان:');
    console.table(allTeachers);

    console.log('\n🔑 اطلاعات ورود:');
    console.log('رمز عبور همه معلمان: teacher123');
    console.log('\nمثال:');
    console.log('کد ملی: 1234567890');
    console.log('رمز عبور: teacher123');

    await connection.end();
    console.log('\n✅ عملیات با موفقیت انجام شد');

  } catch (error) {
    console.error('❌ خطا:', error.message);
    process.exit(1);
  }
}

addSampleTeachers();
