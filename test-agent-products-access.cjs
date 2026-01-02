const mysql = require('mysql2/promise');

async function testAgentProductsAccess() {
    console.log('🧪 تست دسترسی همکاران به محصولات...');
    
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

        // یافتن همکاران
        const [agents] = await connection.query(
            "SELECT id, name, role FROM users WHERE role IN ('agent', 'employee') AND status = 'active'"
        );

        console.log(`👥 ${agents.length} همکار یافت شد`);

        for (const agent of agents) {
            console.log(`\n🔍 بررسی دسترسی ${agent.name} (${agent.role}):`);

            // بررسی دسترسی به ماژول products
            const [permissions] = await connection.query(`
                SELECT m.name, m.display_name, ump.granted
                FROM user_module_permissions ump
                JOIN modules m ON ump.module_id = m.id
                WHERE ump.user_id = ? AND m.name = 'products'
            `, [agent.id]);

            if (permissions.length > 0) {
                const perm = permissions[0];
                if (perm.granted === 1) {
                    console.log(`  ✅ دسترسی به محصولات: فعال`);
                } else {
                    console.log(`  ❌ دسترسی به محصولات: غیرفعال`);
                }
            } else {
                console.log(`  ❌ دسترسی به محصولات: تعریف نشده`);
            }

            // لیست تمام دسترسی‌های کاربر
            const [allPermissions] = await connection.query(`
                SELECT m.name, m.display_name, ump.granted
                FROM user_module_permissions ump
                JOIN modules m ON ump.module_id = m.id
                WHERE ump.user_id = ? AND ump.granted = 1
                ORDER BY m.name
            `, [agent.id]);

            console.log(`  📋 تمام دسترسی‌ها (${allPermissions.length}):`);
            allPermissions.forEach(perm => {
                console.log(`    • ${perm.name} (${perm.display_name || perm.name})`);
            });
        }

        // تست API endpoint
        console.log('\n🌐 تست API endpoint محصولات...');
        
        // شبیه‌سازی درخواست API
        const tenantKey = 'rabin';
        const [products] = await connection.query(
            'SELECT COUNT(*) as count FROM products WHERE tenant_key = ?',
            [tenantKey]
        );

        console.log(`📦 تعداد محصولات موجود برای tenant ${tenantKey}: ${products[0].count}`);

        console.log('\n🎉 تست کامل شد!');

    } catch (error) {
        console.error('❌ خطا در تست:', error);
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

// اجرای تست
testAgentProductsAccess().catch(console.error);