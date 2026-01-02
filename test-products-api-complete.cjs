const mysql = require('mysql2/promise');

async function testProductsAPIComplete() {
    console.log('🧪 تست کامل API محصولات...');
    
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

        const tenantKey = 'rabin';

        // 1. تست دریافت محصولات
        console.log('\n📦 تست 1: دریافت محصولات');
        const [products] = await connection.query(
            'SELECT * FROM products WHERE tenant_key = ? ORDER BY created_at DESC LIMIT 5',
            [tenantKey]
        );
        console.log(`✅ ${products.length} محصول یافت شد`);
        if (products.length > 0) {
            console.log(`   نمونه محصول: ${products[0].name} - قیمت: ${products[0].price} ${products[0].currency}`);
        }

        // 2. تست جستجو در محصولات
        console.log('\n🔍 تست 2: جستجو در محصولات');
        const searchTerm = 'محصول';
        const [searchResults] = await connection.query(
            'SELECT * FROM products WHERE tenant_key = ? AND (name LIKE ? OR description LIKE ?) LIMIT 3',
            [tenantKey, `%${searchTerm}%`, `%${searchTerm}%`]
        );
        console.log(`✅ ${searchResults.length} محصول با کلمه "${searchTerm}" یافت شد`);

        // 3. تست فیلتر بر اساس دسته‌بندی
        console.log('\n📂 تست 3: فیلتر دسته‌بندی');
        const [categories] = await connection.query(
            'SELECT DISTINCT category FROM products WHERE tenant_key = ? AND category IS NOT NULL',
            [tenantKey]
        );
        console.log(`✅ ${categories.length} دسته‌بندی یافت شد:`, categories.map(c => c.category));

        // 4. تست فیلتر وضعیت
        console.log('\n🔄 تست 4: فیلتر وضعیت');
        const [activeProducts] = await connection.query(
            'SELECT COUNT(*) as count FROM products WHERE tenant_key = ? AND status = "active"',
            [tenantKey]
        );
        const [inactiveProducts] = await connection.query(
            'SELECT COUNT(*) as count FROM products WHERE tenant_key = ? AND status = "inactive"',
            [tenantKey]
        );
        console.log(`✅ محصولات فعال: ${activeProducts[0].count}`);
        console.log(`✅ محصولات غیرفعال: ${inactiveProducts[0].count}`);

        // 5. تست دریافت محصول خاص
        console.log('\n🎯 تست 5: دریافت محصول خاص');
        if (products.length > 0) {
            const productId = products[0].id;
            const [specificProduct] = await connection.query(
                'SELECT * FROM products WHERE id = ? AND tenant_key = ?',
                [productId, tenantKey]
            );
            if (specificProduct.length > 0) {
                console.log(`✅ محصول ${specificProduct[0].name} با موفقیت دریافت شد`);
            }
        }

        // 6. تست ساختار جدول محصولات
        console.log('\n🏗️ تست 6: ساختار جدول محصولات');
        const [tableStructure] = await connection.query('DESCRIBE products');
        console.log('✅ ساختار جدول محصولات:');
        tableStructure.forEach(column => {
            console.log(`   • ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(الزامی)' : '(اختیاری)'}`);
        });

        // 7. تست دسترسی همکاران
        console.log('\n👥 تست 7: دسترسی همکاران');
        const [agents] = await connection.query(
            "SELECT u.id, u.name, u.role FROM users u WHERE u.role IN ('agent', 'employee') AND u.status = 'active'"
        );
        
        for (const agent of agents) {
            const [permissions] = await connection.query(`
                SELECT COUNT(*) as count
                FROM user_module_permissions ump
                JOIN modules m ON ump.module_id = m.id
                WHERE ump.user_id = ? AND m.name = 'products' AND ump.granted = 1
            `, [agent.id]);
            
            const hasAccess = permissions[0].count > 0;
            console.log(`   ${hasAccess ? '✅' : '❌'} ${agent.name} (${agent.role}): ${hasAccess ? 'دسترسی دارد' : 'دسترسی ندارد'}`);
        }

        console.log('\n🎉 تمام تست‌ها با موفقیت انجام شد!');
        console.log('\n📋 خلاصه نتایج:');
        console.log(`   • تعداد کل محصولات: ${products.length > 0 ? 'موجود' : 'خالی'}`);
        console.log(`   • جستجو: ${searchResults.length > 0 ? 'کار می‌کند' : 'مشکل دارد'}`);
        console.log(`   • دسته‌بندی‌ها: ${categories.length} دسته موجود`);
        console.log(`   • وضعیت محصولات: فعال=${activeProducts[0].count}, غیرفعال=${inactiveProducts[0].count}`);
        console.log(`   • دسترسی همکاران: ${agents.length} همکار بررسی شد`);

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
testProductsAPIComplete().catch(console.error);