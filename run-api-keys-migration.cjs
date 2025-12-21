const mysql = require('mysql2/promise');

async function runMigration() {
  console.log('🚀 شروع migration جدول API Keys...\n');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'crm_user',
    password: '1234',
    database: 'saas_master',
    multipleStatements: true
  });

  try {
    // جدول کلیدهای API
    console.log('📦 ایجاد جدول tenant_api_keys...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tenant_api_keys (
        id int(11) NOT NULL AUTO_INCREMENT,
        tenant_id int(11) NOT NULL,
        api_key varchar(64) NOT NULL COMMENT 'کلید API (sha256 hash)',
        api_key_prefix varchar(20) NOT NULL COMMENT 'پیشوند کلید برای شناسایی',
        name varchar(100) NOT NULL COMMENT 'نام کلید',
        description text DEFAULT NULL,
        permissions JSON DEFAULT NULL,
        rate_limit int(11) DEFAULT 1000,
        last_used_at timestamp NULL DEFAULT NULL,
        expires_at timestamp NULL DEFAULT NULL,
        is_active tinyint(1) DEFAULT 1,
        created_by int(11) DEFAULT NULL,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        updated_at timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_tenant_id (tenant_id),
        KEY idx_api_key_prefix (api_key_prefix),
        KEY idx_is_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ جدول tenant_api_keys ایجاد شد\n');

    // جدول لاگ استفاده
    console.log('📦 ایجاد جدول api_key_usage_logs...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS api_key_usage_logs (
        id bigint(20) NOT NULL AUTO_INCREMENT,
        api_key_id int(11) NOT NULL,
        endpoint varchar(255) NOT NULL,
        method varchar(10) NOT NULL,
        status_code int(11) DEFAULT NULL,
        ip_address varchar(45) DEFAULT NULL,
        user_agent text DEFAULT NULL,
        request_body_size int(11) DEFAULT 0,
        response_time_ms int(11) DEFAULT 0,
        created_at timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (id),
        KEY idx_api_key_id (api_key_id),
        KEY idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ جدول api_key_usage_logs ایجاد شد\n');

    // بررسی جداول
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = 'saas_master' AND TABLE_NAME LIKE '%api%'
    `);
    console.log('📋 جداول API موجود:');
    tables.forEach(t => console.log(`   - ${t.TABLE_NAME}`));

    console.log('\n✅ Migration با موفقیت انجام شد!');
  } catch (error) {
    console.error('❌ خطا:', error.message);
  } finally {
    await connection.end();
  }
}

runMigration();