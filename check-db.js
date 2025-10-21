const mysql = require('mysql2/promise');

async function checkDatabase() {
    try {
        console.log('🔄 در حال اتصال به دیتابیس...');

        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'crm_user',
            password: '1234',
            database: 'crm_system'
        });

        console.log('✅ اتصال برقرار شد\n');

        // بررسی ساختار جدول users
        console.log('📋 ساختار جدول users:');
        const [columns] = await connection.execute('SHOW COLUMNS FROM users');
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

        // بررسی تعداد رکوردها
        console.log('\n📊 تعداد رکوردها:');
        const [usersCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
        console.log('Users:', usersCount[0].total);

        const [activitiesCount] = await connection.execute('SELECT COUNT(*) as total FROM activities');
        console.log('Activities:', activitiesCount[0].total);

        try {
            const [salesCount] = await connection.execute('SELECT COUNT(*) as total FROM sales');
            console.log('Sales:', salesCount[0].total);
        } catch (e) {
            console.log('Sales: جدول وجود ندارد');
        }

        try {
            const [feedbackCount] = await connection.execute('SELECT COUNT(*) as total FROM feedback');
            console.log('Feedback:', feedbackCount[0].total);
        } catch (e) {
            console.log('Feedback: جدول وجود ندارد');
        }

        try {
            const [chatCount] = await connection.execute('SELECT COUNT(*) as total FROM chat_conversations');
            console.log('Chat Conversations:', chatCount[0].total);
        } catch (e) {
            console.log('Chat Conversations: جدول وجود ندارد');
        }

        // بررسی نمونه داده
        console.log('\n👥 نمونه کاربران:');
        const [users] = await connection.execute('SELECT id, name, email, role FROM users LIMIT 3');
        console.table(users);

        // بررسی رکوردهای تکراری
        console.log('\n🔍 بررسی رکوردهای تکراری:');
        const [duplicates] = await connection.execute('SELECT id, COUNT(*) as count FROM users GROUP BY id HAVING count > 1');
        if (duplicates.length > 0) {
            console.log('⚠️ رکوردهای تکراری یافت شد:');
            console.table(duplicates);
        } else {
            console.log('✅ رکورد تکراری وجود ندارد');
        }

        await connection.end();
        console.log('\n✅ بررسی کامل شد');

    } catch (error) {
        console.error('❌ خطا:', error.message);
        process.exit(1);
    }
}

checkDatabase();