-- WordPress Integration Database Migration
-- Add fields needed for WordPress-to-CRM integration

-- Add wordpress_user_id to customers table
ALTER TABLE `customers` 
ADD COLUMN `wordpress_user_id` INT NULL COMMENT 'WordPress user ID for integration tracking' AFTER `source`;

-- Add wordpress_order_id to sales table
ALTER TABLE `sales` 
ADD COLUMN `wordpress_order_id` INT NULL COMMENT 'WordPress/WooCommerce order ID for integration tracking' AFTER `source`;

-- Add wordpress_product_id to products table
ALTER TABLE `products` 
ADD COLUMN `wordpress_product_id` INT NULL COMMENT 'WordPress product ID for integration tracking' AFTER `source`;

-- Add source field to products table if it doesn't exist
ALTER TABLE `products` 
ADD COLUMN `source` VARCHAR(100) NULL COMMENT 'Source of the product (wordpress, manual, etc.)' AFTER `status`;

-- Add tenant_key to products table if it doesn't exist
ALTER TABLE `products` 
ADD COLUMN `tenant_key` VARCHAR(50) DEFAULT 'rabin' COMMENT 'Multi-tenant key' AFTER `id`;

-- Create sale_items table if it doesn't exist (for order line items)
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `sale_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `sku` varchar(100) NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sale_items_sale_id` (`sale_id`),
  KEY `idx_sale_items_tenant` (`tenant_key`),
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create product_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS `product_categories` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_tenant` (`name`, `tenant_key`),
  KEY `idx_categories_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create WordPress sync log table for tracking integration operations
CREATE TABLE IF NOT EXISTS `wordpress_sync_log` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `wordpress_site_url` varchar(255) NULL,
  `entity_type` enum('customer', 'order', 'product') NOT NULL,
  `wordpress_entity_id` int(11) NOT NULL,
  `crm_entity_id` varchar(36) NULL,
  `sync_status` enum('success', 'failed', 'pending') NOT NULL DEFAULT 'pending',
  `error_message` text NULL,
  `request_data` longtext NULL COMMENT 'JSON data of the original request',
  `response_data` longtext NULL COMMENT 'JSON data of the response',
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_sync_log_entity` (`entity_type`, `wordpress_entity_id`),
  KEY `idx_sync_log_status` (`sync_status`),
  KEY `idx_sync_log_tenant` (`tenant_key`),
  KEY `idx_sync_log_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for WordPress integration fields
CREATE INDEX `idx_customers_wordpress_user_id` ON `customers` (`wordpress_user_id`);
CREATE INDEX `idx_sales_wordpress_order_id` ON `sales` (`wordpress_order_id`);
CREATE INDEX `idx_products_wordpress_product_id` ON `products` (`wordpress_product_id`);

-- Add unique constraints to prevent duplicate WordPress entities
ALTER TABLE `customers` 
ADD CONSTRAINT `unique_wordpress_user_tenant` UNIQUE (`wordpress_user_id`, `tenant_key`);

ALTER TABLE `sales` 
ADD CONSTRAINT `unique_wordpress_order_tenant` UNIQUE (`wordpress_order_id`, `tenant_key`);

ALTER TABLE `products` 
ADD CONSTRAINT `unique_wordpress_product_tenant` UNIQUE (`wordpress_product_id`, `tenant_key`);

-- Insert sample WordPress API configuration (optional)
INSERT IGNORE INTO `settings` (`key`, `value`, `description`, `tenant_key`) VALUES
('wordpress_api_key', 'wp-integration-key-change-me', 'API key for WordPress integration authentication', 'rabin'),
('wordpress_hmac_secret', '', 'HMAC secret for WordPress integration (optional)', 'rabin'),
('wordpress_rate_limit_window', '60000', 'Rate limit window in milliseconds', 'rabin'),
('wordpress_rate_limit_max', '100', 'Maximum requests per rate limit window', 'rabin');

SELECT 'WordPress integration database migration completed successfully!' as message;