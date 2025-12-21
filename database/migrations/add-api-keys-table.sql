-- Migration: Add API Keys table for WordPress integration
-- Date: 2025-12-17

-- جدول کلیدهای API برای اتصال WordPress به CRM
CREATE TABLE IF NOT EXISTS `tenant_api_keys` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `api_key` varchar(64) NOT NULL COMMENT 'کلید API (sha256 hash)',
  `api_key_prefix` varchar(8) NOT NULL COMMENT 'پیشوند کلید برای شناسایی',
  `name` varchar(100) NOT NULL COMMENT 'نام کلید (مثلا: WordPress Site 1)',
  `description` text DEFAULT NULL COMMENT 'توضیحات',
  `permissions` JSON DEFAULT NULL COMMENT 'دسترسی‌های کلید',
  `rate_limit` int(11) DEFAULT 1000 COMMENT 'محدودیت درخواست در ساعت',
  `last_used_at` timestamp NULL DEFAULT NULL COMMENT 'آخرین استفاده',
  `expires_at` timestamp NULL DEFAULT NULL COMMENT 'تاریخ انقضا',
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL COMMENT 'ID super admin که ایجاد کرده',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_key` (`api_key`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_api_key_prefix` (`api_key_prefix`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_api_keys_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول لاگ استفاده از API Keys
CREATE TABLE IF NOT EXISTS `api_key_usage_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `api_key_id` int(11) NOT NULL,
  `endpoint` varchar(255) NOT NULL,
  `method` varchar(10) NOT NULL,
  `status_code` int(11) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `request_body_size` int(11) DEFAULT 0,
  `response_time_ms` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_api_key_id` (`api_key_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_usage_logs_api_key` FOREIGN KEY (`api_key_id`) REFERENCES `tenant_api_keys` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- نمونه داده برای تست
-- INSERT INTO `tenant_api_keys` (`tenant_id`, `api_key`, `api_key_prefix`, `name`, `description`, `permissions`) VALUES
-- (1, 'hashed_key_here', 'wp_rabin', 'WordPress Site', 'کلید برای سایت وردپرس اصلی', '["customers:write", "orders:write", "products:write"]');
