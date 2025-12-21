#!/usr/bin/env node

/**
 * WordPress CRM Integration Quick Setup Script
 * اسکریپت راه‌اندازی سریع یکپارچه‌سازی WordPress CRM
 */

const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// تنظیمات
const DB_CONFIG = {
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'crm_system'
};

const API_KEY = 'wp_crm_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';

class WordPressCRMSetup {
    constructor() {
        this.connection = null;
    }

    async setup() {
        console.log('🚀 راه‌اندازی سریع یکپارچه‌سازی WordPress CRM');
        console.log('=' .repeat(50));
        
        try {
            // 1. اتصال به پایگاه داده
            await this.connectDatabase();
            
            // 2. ایجاد جداول مورد نیاز
            await this.createTables();
            
            // 3. درج کلید API
            await this.insertApiKey();
            
            // 4. بررسی فایل‌های افزونه
            await this.checkPluginFiles();
            
            // 5. نمایش اطلاعات نهایی
            await this.showFinalInfo();
            
            console.log('\n✅ راه‌اندازی با موفقیت تکمیل شد!');
            
        } catch (error) {
            console.error('❌ خطا در راه‌اندازی:', error.message);
            process.exit(1);
        } finally {
            if (this.connection) {
                await this.connection.end();
            }
        }
    }

    async connectDatabase() {
        console.log('📊 اتصال به پایگاه داده...');
        try {
            this.connection = await mysql.createConnection(DB_CONFIG);
            console.log('✅ اتصال برقرار شد');
        } catch (error) {
            throw new Error(`خطا در اتصال: ${error.message}`);
        }
    }

    async createTables() {
        console.log('🗄️ ایجاد جداول...');
        
        const tables = [
            {
                name: 'wordpress_api_keys',
                sql: `
                    CREATE TABLE IF NOT EXISTS wordpress_api_keys (
                        id VARCHAR(36) PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        api_key VARCHAR(255) NOT NULL UNIQUE,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        last_used_at TIMESTAMP NULL,
                        is_active BOOLEAN DEFAULT TRUE,
                        usage_count INT DEFAULT 0,
                        INDEX idx_api_key (api_key),
                        INDEX idx_is_active (is_active)
                    )
                `
            }
        ];
        
        for (const table of tables) {
            try {
                await this.connection.execute(table.sql);
                console.log(`✅ جدول ${table.name} ایجاد شد`);
            } catch (error) {
                console.log(`⚠️ خطا در ایجاد جدول ${table.name}: ${error.message}`);
            }
        }
    }

    async insertApiKey() {
        console.log('🔑 درج کلید API...');
        
        try {
            const sql = `
                INSERT INTO wordpress_api_keys (
                    id, name, api_key, created_at, is_active
                ) VALUES (
                    UUID(),
                    'WordPress Plugin - Default Key',
                    ?,
                    NOW(),
                    TRUE
                ) ON DUPLICATE KEY UPDATE 
                    name = 'WordPress Plugin - Default Key',
                    updated_at = NOW()
            `;
            
            await this.connection.execute(sql, [API_KEY]);
            console.log('✅ کلید API درج شد');
            
        } catch (error) {
            console.log(`⚠️ خطا در درج کلید API: ${error.message}`);
        }
    }

    async checkPluginFiles() {
        console.log('📁 بررسی فایل‌های افزونه...');
        
        const requiredFiles = [
            'wordpress-crm-integration/wordpress-crm-integration.php',
            'wordpress-crm-integration/assets/js/admin-fa.js',
            'wordpress-crm-integration/assets/css/admin-rtl.css',
            'wordpress-crm-integration/languages/wordpress-crm-integration-fa_IR.po'
        ];
        
        for (const file of requiredFiles) {
            try {
                await fs.access(file);
                console.log(`✅ ${path.basename(file)}`);
            } catch {
                console.log(`❌ ${path.basename(file)} - یافت نشد`);
            }
        }
    }

    async showFinalInfo() {
        console.log('\n📋 اطلاعات راه‌اندازی:');
        console.log('=' .repeat(50));
        
        const info = {
            'آدرس CRM': 'http://localhost:3000',
            'پنل مدیریت': 'http://localhost:3000/secret-zone-789/admin-panel',
            'کلید API': API_KEY,
            'مسیر افزونه': './wordpress-crm-integration/',
            'فایل ZIP': './wordpress-crm-integration/build/wordpress-crm-integration-v1.0.0.zip'
        };
        
        Object.entries(info).forEach(([key, value]) => {
            console.log(`${key}: ${value}`);
        });
        
        console.log('\n📝 مراحل نصب افزونه در WordPress:');
        console.log('1. وارد پنل مدیریت WordPress شوید');
        console.log('2. به بخش افزونه‌ها > افزودن جدید بروید');
        console.log('3. فایل ZIP افزونه را آپلود کنید');
        console.log('4. افزونه را فعال کنید');
        console.log('5. به تنظیمات > CRM Integration بروید');
        console.log('6. اطلاعات زیر را وارد کنید:');
        console.log(`   - آدرس CRM: http://localhost:3000`);
        console.log(`   - کلید API: ${API_KEY}`);
        console.log('7. اتصال را تست کنید');
        console.log('8. نگاشت فیلدها را تنظیم کنید');
        console.log('9. همگام‌سازی را فعال کنید');
        
        // ذخیره اطلاعات در فایل
        await fs.writeFile(
            'wordpress-crm-setup-info.json',
            JSON.stringify({
                ...info,
                setup_date: new Date().toISOString(),
                instructions: [
                    'Upload plugin ZIP to WordPress',
                    'Activate plugin',
                    'Configure CRM settings',
                    'Test connection',
                    'Setup field mapping',
                    'Enable synchronization'
                ]
            }, null, 2)
        );
        
        console.log('\n💾 اطلاعات در فایل wordpress-crm-setup-info.json ذخیره شد');
    }
}

// اجرای راه‌اندازی
async function main() {
    const setup = new WordPressCRMSetup();
    await setup.setup();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = WordPressCRMSetup;