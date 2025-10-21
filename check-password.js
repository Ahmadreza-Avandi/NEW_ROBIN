#!/usr/bin/env node

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

dotenv.config();

async function checkPassword() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DATABASE_HOST || 'localhost',
            user: process.env.DATABASE_USER || 'crm_user',
            password: process.env.DATABASE_PASSWORD || '1234',
            database: process.env.DATABASE_NAME || 'crm_system',
        });

        console.log('\n🔐 بررسی رمز عبور کاربر Robintejarat@gmail.com:\n');

        const [users] = await connection.query(
            'SELECT id, name, email, password, role, tenant_key FROM users WHERE email = ?',
            ['Robintejarat@gmail.com']
        );

        if (users.length === 0) {
            console.log('❌ کاربر یافت نشد');
            return;
        }

        const user = users[0];
        console.log('✅ کاربر یافت شد:');
        console.log('  نام:', user.name);
        console.log('  ایمیل:', user.email);
        console.log('  نقش:', user.role);
        console.log('  تنانت:', user.tenant_key);
        console.log('  رمز (hash):', user.password.substring(0, 30) + '...');

        // تست رمز admin123
        const testPassword = 'admin123';
        console.log('\n🔍 تست رمز عبور "admin123":');

        const isMatch = await bcrypt.compare(testPassword, user.password);
        console.log('  نتیجه:', isMatch ? '✅ صحیح' : '❌ نادرست');

        if (!isMatch) {
            console.log('\n💡 رمز عبور صحیح نیست. آیا میخواهید رمز جدید تنظیم کنید؟');
            console.log('   برای تنظیم رمز جدید: node reset-password.js');
        }

        await connection.end();
    } catch (error) {
        console.error('❌ خطا:', error.message);
    }
}

checkPassword();
