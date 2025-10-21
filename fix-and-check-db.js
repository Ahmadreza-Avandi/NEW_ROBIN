const mysql = require('mysql2/promise');

async function fixAndCheckDatabase() {
    let connection;
    try {
        console.log('🔄 در حال اتصال به دیتابیس...\n');

        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'crm_user',
            password: '1234',
            database: 'crm_system',
            multipleStatements: true
        });

        console.log('✅ اتصال برقرار شد\n');

        // ========================================
        // بخش 1: بررسی وضعیت فعلی
        // ========================================
        console.log('📊 بررسی وضعیت فعلی دیتابیس...\n');

        // بررسی ساختار جدول users
        console.log('1️⃣ ساختار جدول users:');
        const [columns] = await connection.execute('SHOW COLUMNS FROM users');
        const hasUsername = columns.some(c => c.Field === 'username');
        const hasFullName = columns.some(c => c.Field === 'full_name');
        console.log(`   - فیلد username: ${hasUsername ? '✅ موجود' : '❌ وجود ندارد'}`);
        console.log(`   - فیلد full_name: ${hasFullName ? '✅ موجود' : '❌ وجود ندارد'}\n`);

        // بررسی رکوردهای تکراری
        console.log('2️⃣ بررسی رکوردهای تکراری:');
        const [duplicates] = await connection.execute(
            'SELECT id, COUNT(*) as count FROM users GROUP BY id HAVING count > 1'
        );
        if (duplicates.length > 0) {
            console.log(`   ⚠️ ${duplicates.length} رکورد تکراری یافت شد`);
            duplicates.forEach(d => console.log(`      - ID: ${d.id} (${d.count} بار)`));
        } else {
            console.log('   ✅ رکورد تکراری وجود ندارد');
        }
        console.log('');

        // بررسی تعداد رکوردها
        console.log('3️⃣ تعداد رکوردها در جداول:');
        const [usersCount] = await connection.execute('SELECT COUNT(*) as total FROM users');
        console.log(`   - Users: ${usersCount[0].total}`);

        const [activitiesCount] = await connection.execute('SELECT COUNT(*) as total FROM activities');
        console.log(`   - Activities: ${activitiesCount[0].total}`);

        try {
            const [salesCount] = await connection.execute('SELECT COUNT(*) as total FROM sales');
            console.log(`   - Sales: ${salesCount[0].total}`);
        } catch (e) {
            console.log('   - Sales: ❌ جدول وجود ندارد');
        }

        try {
            const [feedbackCount] = await connection.execute('SELECT COUNT(*) as total FROM feedback');
            console.log(`   - Feedback: ${feedbackCount[0].total}`);
        } catch (e) {
            console.log('   - Feedback: ❌ جدول وجود ندارد');
        }

        try {
            const [chatCount] = await connection.execute('SELECT COUNT(*) as total FROM chat_conversations');
            console.log(`   - Chat Conversations: ${chatCount[0].total}`);
        } catch (e) {
            console.log('   - Chat Conversations: ❌ جدول وجود ندارد');
        }
        console.log('');

        // ========================================
        // بخش 2: رفع مشکلات
        // ========================================
        console.log('🔧 شروع رفع مشکلات...\n');

        // حذف رکوردهای تکراری
        if (duplicates.length > 0) {
            console.log('🗑️ حذف رکوردهای تکراری...');
            await connection.execute(`
                DELETE u1 FROM users u1
                INNER JOIN users u2 
                WHERE u1.id = u2.id AND u1.created_at > u2.created_at
            `);
            console.log('   ✅ رکوردهای تکراری حذف شدند\n');
        }

        // اضافه کردن فیلدهای مورد نیاز
        if (!hasUsername) {
            console.log('➕ اضافه کردن فیلد username...');
            await connection.execute('ALTER TABLE `users` ADD COLUMN `username` VARCHAR(100) NULL AFTER `id`');
            console.log('   ✅ فیلد username اضافه شد\n');
        }

        if (!hasFullName) {
            console.log('➕ اضافه کردن فیلد full_name...');
            await connection.execute('ALTER TABLE `users` ADD COLUMN `full_name` VARCHAR(255) NULL AFTER `username`');
            console.log('   ✅ فیلد full_name اضافه شد\n');
        }

        // به‌روزرسانی فیلدهای جدید
        console.log('🔄 به‌روزرسانی فیلدهای username و full_name...');
        await connection.execute(`
            UPDATE users 
            SET username = COALESCE(email, CONCAT('user_', id)),
                full_name = name
            WHERE username IS NULL OR full_name IS NULL
        `);
        console.log('   ✅ فیلدها به‌روزرسانی شدند\n');

        // رفع مشکل role های خالی
        console.log('🔄 رفع مشکل role های خالی...');
        const [emptyRoles] = await connection.execute(`
            SELECT COUNT(*) as count FROM users WHERE role = '' OR role IS NULL
        `);
        if (emptyRoles[0].count > 0) {
            await connection.execute(`
                UPDATE users SET role = 'sales_agent' WHERE role = '' OR role IS NULL
            `);
            console.log(`   ✅ ${emptyRoles[0].count} رکورد با role خالی رفع شد\n`);
        } else {
            console.log('   ✅ همه role ها معتبر هستند\n');
        }

        // رفع مشکل collation
        console.log('🔄 رفع مشکل collation...');
        try {
            await connection.execute(`
                ALTER TABLE activities 
                MODIFY COLUMN performed_by varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
            `);
            await connection.execute(`
                ALTER TABLE users 
                MODIFY COLUMN id varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
            `);
            console.log('   ✅ مشکل collation رفع شد\n');
        } catch (e) {
            console.log('   ⚠️ خطا در رفع collation (ممکن است قبلاً رفع شده باشد)\n');
        }

        // اضافه کردن فیلدهای chat
        console.log('🔄 بررسی و رفع مشکل جدول chat_conversations...');
        try {
            const [chatColumns] = await connection.execute('SHOW COLUMNS FROM chat_conversations');
            const hasParticipant1 = chatColumns.some(c => c.Field === 'participant_1_id');
            const hasParticipant2 = chatColumns.some(c => c.Field === 'participant_2_id');

            if (!hasParticipant1) {
                await connection.execute(`
                    ALTER TABLE chat_conversations 
                    ADD COLUMN participant_1_id varchar(36) NULL AFTER created_by
                `);
                console.log('   ✅ فیلد participant_1_id اضافه شد');
            }

            if (!hasParticipant2) {
                await connection.execute(`
                    ALTER TABLE chat_conversations 
                    ADD COLUMN participant_2_id varchar(36) NULL AFTER participant_1_id
                `);
                console.log('   ✅ فیلد participant_2_id اضافه شد');
            }

            if (hasParticipant1 || hasParticipant2) {
                console.log('');
            }
        } catch (e) {
            console.log('   ⚠️ خطا در رفع مشکل chat_conversations\n');
        }

        // ========================================
        // بخش 3: بررسی نهایی
        // ========================================
        console.log('✅ رفع مشکلات کامل شد!\n');
        console.log('📊 وضعیت نهایی:\n');

        // نمایش نمونه کاربران
        console.log('👥 نمونه کاربران:');
        const [users] = await connection.execute(`
            SELECT id, username, full_name, email, role 
            FROM users 
            LIMIT 5
        `);
        console.table(users);

        // تست کوئری coworkers
        console.log('\n👔 تست کوئری همکاران (coworkers):');
        try {
            const [coworkers] = await connection.execute(`
                SELECT DISTINCT
                    u.id,
                    u.username,
                    u.full_name,
                    u.email,
                    u.role,
                    u.status
                FROM users u
                INNER JOIN activities a ON u.id = a.performed_by
                WHERE u.status = 'active'
                ORDER BY u.full_name ASC
                LIMIT 5
            `);
            console.log(`   ✅ ${coworkers.length} همکار یافت شد`);
            if (coworkers.length > 0) {
                console.table(coworkers);
            } else {
                console.log('   ⚠️ هیچ همکاری یافت نشد (احتمالاً هیچ فعالیتی ثبت نشده)');
            }
        } catch (e) {
            console.log('   ❌ خطا در کوئری همکاران:', e.message);
        }

        // تست کوئری sales
        console.log('\n💰 تست کوئری فروش (sales):');
        try {
            const [sales] = await connection.execute(`
                SELECT id, customer_name, total_amount, payment_status, sale_date
                FROM sales
                ORDER BY created_at DESC
                LIMIT 5
            `);
            console.log(`   ✅ ${sales.length} فروش یافت شد`);
            if (sales.length > 0) {
                console.table(sales);
            } else {
                console.log('   ℹ️ هیچ فروشی ثبت نشده است');
            }
        } catch (e) {
            console.log('   ❌ خطا در کوئری فروش:', e.message);
        }

        // تست کوئری feedback
        console.log('\n📝 تست کوئری بازخورد (feedback):');
        try {
            const [feedback] = await connection.execute(`
                SELECT f.id, f.type, f.title, f.status, c.name as customer_name
                FROM feedback f
                LEFT JOIN customers c ON f.customer_id = c.id
                ORDER BY f.created_at DESC
                LIMIT 5
            `);
            console.log(`   ✅ ${feedback.length} بازخورد یافت شد`);
            if (feedback.length > 0) {
                console.table(feedback);
            } else {
                console.log('   ℹ️ هیچ بازخوردی ثبت نشده است');
            }
        } catch (e) {
            console.log('   ❌ خطا در کوئری بازخورد:', e.message);
        }

        // تست کوئری chat
        console.log('\n💬 تست کوئری چت (chat):');
        try {
            const [chats] = await connection.execute(`
                SELECT id, title, type, created_by, created_at
                FROM chat_conversations
                ORDER BY updated_at DESC
                LIMIT 5
            `);
            console.log(`   ✅ ${chats.length} مکالمه یافت شد`);
            if (chats.length > 0) {
                console.table(chats);
            } else {
                console.log('   ℹ️ هیچ مکالمه‌ای ثبت نشده است');
            }
        } catch (e) {
            console.log('   ❌ خطا در کوئری چت:', e.message);
        }

        console.log('\n✅ بررسی و رفع مشکلات با موفقیت انجام شد!');
        console.log('\n📌 توصیه‌ها:');
        console.log('   1. اگر جداول خالی هستند، باید داده‌های نمونه اضافه کنید');
        console.log('   2. سرور Next.js را ری‌استارت کنید: npm run dev');
        console.log('   3. صفحات را در مرورگر رفرش کنید (Ctrl+Shift+R)');

    } catch (error) {
        console.error('\n❌ خطای کلی:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 اتصال به دیتابیس بسته شد');
        }
    }
}

// اجرای اسکریپت
fixAndCheckDatabase();