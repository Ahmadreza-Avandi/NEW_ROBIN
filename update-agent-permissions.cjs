const mysql = require('mysql2/promise');

async function updateAgentPermissions() {
    console.log('🔧 شروع بروزرسانی مجوزهای همکاران...');
    
    let connection;
    try {
        // اتصال به دیتابیس
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'crm_system',
            charset: 'utf8mb4'
        });

        console.log('✅ اتصال به دیتابیس برقرار شد');

        // یافتن ماژول products
        const [productModules] = await connection.query(
            "SELECT id FROM modules WHERE name = 'products' AND is_active = 1"
        );

        if (productModules.length === 0) {
            console.log('❌ ماژول products یافت نشد');
            return;
        }

        const productModuleId = productModules[0].id;
        console.log('📦 شناسه ماژول products:', productModuleId);

        // یافتن کاربران با نقش agent یا employee
        const [users] = await connection.query(
            "SELECT id, name, role FROM users WHERE role IN ('agent', 'employee') AND status = 'active'"
        );

        console.log(`👥 ${users.length} همکار یافت شد:`, users.map(u => `${u.name} (${u.role})`));

        let updatedCount = 0;

        for (const user of users) {
            // بررسی اینکه آیا قبلاً دسترسی دارد یا نه
            const [existingPermissions] = await connection.query(
                "SELECT id FROM user_module_permissions WHERE user_id = ? AND module_id = ?",
                [user.id, productModuleId]
            );

            if (existingPermissions.length === 0) {
                // اضافه کردن دسترسی جدید
                const permissionId = 'ump-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

                await connection.query(
                    "INSERT INTO user_module_permissions (id, user_id, module_id, granted, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?)",
                    [permissionId, user.id, productModuleId, now, now]
                );

                console.log(`✅ دسترسی محصولات برای ${user.name} اضافه شد`);
                updatedCount++;
            } else {
                // بروزرسانی دسترسی موجود (در صورت نیاز)
                await connection.query(
                    "UPDATE user_module_permissions SET granted = 1, updated_at = NOW() WHERE user_id = ? AND module_id = ?",
                    [user.id, productModuleId]
                );
                console.log(`🔄 دسترسی محصولات برای ${user.name} بروزرسانی شد`);
                updatedCount++;
            }
        }

        console.log(`🎉 بروزرسانی کامل شد! ${updatedCount} همکار دسترسی به محصولات دریافت کردند`);

    } catch (error) {
        console.error('❌ خطا در بروزرسانی مجوزها:', error);
        console.error('جزئیات خطا:', {
            message: error.message,
            code: error.code,
            errno: error.errno
        });
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 اتصال دیتابیس بسته شد');
        }
    }
}

// اجرای اسکریپت
updateAgentPermissions().catch(console.error);