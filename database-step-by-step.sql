-- اسکریپت مرحله‌ای بهبود دیتابیس CRM
-- هر بخش رو جداگانه اجرا کنید

-- مرحله 1: ایجاد جدول محصولات
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive','discontinued') DEFAULT 'active',
  `sku` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `specifications` json DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 2: اضافه کردن ایندکس‌ها به جدول محصولات
ALTER TABLE `products` ADD INDEX `idx_products_category` (`category`);
ALTER TABLE `products` ADD INDEX `idx_products_status` (`status`);
ALTER TABLE `products` ADD INDEX `idx_products_created_by` (`created_by`);

-- مرحله 3: ایجاد جدول علاقه‌مندی مشتری-محصول
CREATE TABLE IF NOT EXISTS `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 4: اضافه کردن ایندکس‌ها به جدول علاقه‌مندی
ALTER TABLE `customer_product_interests` ADD UNIQUE KEY `unique_customer_product` (`customer_id`, `product_id`);
ALTER TABLE `customer_product_interests` ADD INDEX `idx_customer_interests` (`customer_id`);
ALTER TABLE `customer_product_interests` ADD INDEX `idx_product_interests` (`product_id`);

-- مرحله 5: اضافه کردن فیلدهای جدید به جدول customers
ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL COMMENT 'منبع کسب مشتری';
ALTER TABLE `customers` ADD COLUMN `tags` json DEFAULT NULL COMMENT 'برچسب‌های مشتری';
ALTER TABLE `customers` ADD COLUMN `custom_fields` json DEFAULT NULL COMMENT 'فیلدهای سفارشی';
ALTER TABLE `customers` ADD COLUMN `last_activity_date` timestamp NULL DEFAULT NULL COMMENT 'آخرین فعالیت';
ALTER TABLE `customers` ADD COLUMN `lead_score` int DEFAULT 0 COMMENT 'امتیاز مشتری';
ALTER TABLE `customers` ADD COLUMN `lifecycle_stage` enum('subscriber','lead','marketing_qualified_lead','sales_qualified_lead','opportunity','customer','evangelist','other') DEFAULT 'lead' COMMENT 'مرحله چرخه حیات مشتری';

-- مرحله 6: ایجاد ایندکس‌های بهتر برای فیلترها
CREATE INDEX IF NOT EXISTS `idx_customers_industry` ON `customers` (`industry`);
CREATE INDEX IF NOT EXISTS `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX IF NOT EXISTS `idx_customers_status` ON `customers` (`status`);
CREATE INDEX IF NOT EXISTS `idx_customers_priority` ON `customers` (`priority`);
CREATE INDEX IF NOT EXISTS `idx_customers_segment` ON `customers` (`segment`);
CREATE INDEX IF NOT EXISTS `idx_customers_city` ON `customers` (`city`);
CREATE INDEX IF NOT EXISTS `idx_customers_state` ON `customers` (`state`);
CREATE INDEX IF NOT EXISTS `idx_customers_source` ON `customers` (`source`);
CREATE INDEX IF NOT EXISTS `idx_customers_lifecycle_stage` ON `customers` (`lifecycle_stage`);
CREATE INDEX IF NOT EXISTS `idx_customers_created_at` ON `customers` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_customers_last_activity` ON `customers` (`last_activity_date`);

-- مرحله 7: ایجاد جدول برچسب‌های مشتری
CREATE TABLE IF NOT EXISTS `customer_tags_system` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `description` text DEFAULT NULL,
  `usage_count` int DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_name` (`name`),
  KEY `idx_tags_usage` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 8: ایجاد جدول رابطه مشتری-برچسب
CREATE TABLE IF NOT EXISTS `customer_tag_relations` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_tag` (`customer_id`, `tag_id`),
  KEY `idx_customer_tags` (`customer_id`),
  KEY `idx_tag_customers` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 9: درج نمونه محصولات
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category`, `price`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام با ظرفیت بالا', 'ماشین‌آلات کشاورزی', 50000000.00, 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر برای تولید خوراک', 'ماشین‌آلات کشاورزی', 25000000.00, 'MILL-MIX-001', 'ceo-001'),
('prod-003', 'سیستم مدیریت CRM', 'نرم‌افزار مدیریت ارتباط با مشتری', 'نرم‌افزار', 10000000.00, 'CRM-SYS-001', 'ceo-001'),
('prod-004', 'تجهیزات دامداری', 'تجهیزات کامل دامداری', 'تجهیزات دامی', 30000000.00, 'FARM-EQ-001', 'ceo-001');

-- مرحله 10: درج نمونه برچسب‌ها
INSERT IGNORE INTO `customer_tags_system` (`id`, `name`, `color`, `description`, `created_by`) VALUES
('tag-001', 'دامدار', '#10B981', 'مشتریان دامدار', 'ceo-001'),
('tag-002', 'کشاورز', '#F59E0B', 'مشتریان کشاورز', 'ceo-001'),
('tag-003', 'VIP', '#EF4444', 'مشتریان ویژه', 'ceo-001'),
('tag-004', 'پیگیری فوری', '#8B5CF6', 'نیاز به پیگیری فوری', 'ceo-001'),
('tag-005', 'مشتری جدید', '#06B6D4', 'مشتریان جدید', 'ceo-001');

-- مرحله 11: بروزرسانی برخی از مشتریان موجود
UPDATE `customers` SET 
  `source` = 'تماس تلفنی',
  `lifecycle_stage` = 'lead',
  `lead_score` = 50
WHERE `industry` LIKE '%دام%' OR `industry` LIKE '%پرورش%';

UPDATE `customers` SET 
  `source` = 'وب‌سایت',
  `lifecycle_stage` = 'marketing_qualified_lead',
  `lead_score` = 75
WHERE `priority` = 'high';

-- مرحله 12: ایجاد View برای گزارش‌گیری
CREATE OR REPLACE VIEW `customer_summary_view` AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.city,
  c.state,
  c.industry,
  c.status,
  c.priority,
  c.segment,
  c.source,
  c.lifecycle_stage,
  c.lead_score,
  c.assigned_to,
  c.created_at,
  c.last_activity_date,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT a.id) as activities_count
FROM customers c
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id
LEFT JOIN activities a ON c.id = a.customer_id
GROUP BY c.id;