-- حل مشکلات collation و جداول موجود
-- این فایل مشکلات گزارش شده را حل می‌کند

-- مرحله 1: بررسی وجود جدول products و ایجاد در صورت عدم وجود
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100),
  `price` decimal(15,2),
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive') DEFAULT 'active',
  `sku` varchar(100),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL CHECK (json_valid(`tags`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL CHECK (json_valid(`specifications`)),
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`),
  INDEX `idx_products_name` (`name`),
  INDEX `idx_products_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 2: بررسی وجود جدول customer_product_interests و ایجاد در صورت عدم وجود
CREATE TABLE IF NOT EXISTS `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_product` (`customer_id`, `product_id`),
  INDEX `idx_customer_interests` (`customer_id`),
  INDEX `idx_product_interests` (`product_id`),
  CONSTRAINT `fk_customer_interests` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_product_interests` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- مرحله 3: اضافه کردن ایندکس‌های مفید (فقط اگر وجود نداشته باشند)
-- ایندکس برای دسته‌بندی محصولات
CREATE INDEX IF NOT EXISTS `idx_products_category` ON `products` (`category`);

-- ایندکس برای قیمت محصولات
CREATE INDEX IF NOT EXISTS `idx_products_price` ON `products` (`price`);

-- ایندکس برای تاریخ ایجاد محصولات
CREATE INDEX IF NOT EXISTS `idx_products_created_at` ON `products` (`created_at`);

-- مرحله 4: بررسی وجود فیلد source در جدول customers و اضافه کردن در صورت عدم وجود
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
    AND TABLE_NAME = 'customers' 
    AND COLUMN_NAME = 'source'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL COMMENT ''منبع کسب مشتری''', 
  'SELECT "Column source already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- مرحله 5: تنظیم collation یکسان برای جداول مرتبط
-- تغییر collation جدول users به utf8mb4_unicode_ci
ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- تغییر collation جدول customers به utf8mb4_unicode_ci
ALTER TABLE `customers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- مرحله 6: حذف View قدیمی و ایجاد مجدد با collation درست
DROP VIEW IF EXISTS `customer_summary_view`;

CREATE VIEW `customer_summary_view` AS
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
  c.assigned_to,
  COALESCE(u.name, 'تخصیص نیافته') as assigned_to_name,
  c.created_at,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT a.id) as activities_count,
  GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ', ') as interested_products
FROM customers c 
LEFT JOIN users u ON c.assigned_to = u.id COLLATE utf8mb4_unicode_ci
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id 
LEFT JOIN products p ON cpi.product_id = p.id 
LEFT JOIN activities a ON c.id = a.customer_id 
GROUP BY c.id, c.name, c.email, c.phone, c.city, c.state, c.industry, c.status, c.priority, c.segment, c.source, c.assigned_to, u.name, c.created_at;

-- مرحله 7: اضافه کردن چند محصول نمونه برای تست
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category`, `price`, `currency`, `status`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه کامل تولید خوراک دام با ظرفیت 1 تن در ساعت', 'ماشین‌آلات کشاورزی', 500000000.00, 'IRR', 'active', 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'میکسر خوراک دام', 'میکسر صنعتی برای ترکیب مواد خوراکی', 'ماشین‌آلات کشاورزی', 150000000.00, 'IRR', 'active', 'MIXER-001', 'ceo-001'),
('prod-003', 'آسیاب خوراک', 'آسیاب چکشی برای آسیاب کردن غلات', 'ماشین‌آلات کشاورزی', 80000000.00, 'IRR', 'active', 'MILL-001', 'ceo-001'),
('prod-004', 'سیستم انتقال مواد', 'نوار نقاله و سیستم انتقال مواد', 'ماشین‌آلات کشاورزی', 200000000.00, 'IRR', 'active', 'CONVEYOR-001', 'ceo-001'),
('prod-005', 'دستگاه بسته‌بندی', 'دستگاه اتوماتیک بسته‌بندی خوراک', 'ماشین‌آلات کشاورزی', 300000000.00, 'IRR', 'active', 'PACKING-001', 'ceo-001');

-- مرحله 8: اضافه کردن علاقه‌مندی‌های نمونه برای چند مشتری
INSERT IGNORE INTO `customer_product_interests` (`id`, `customer_id`, `product_id`, `interest_level`, `notes`) VALUES
('int-001', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-001', 'high', 'علاقه‌مند به خرید خط کامل تولید'),
('int-002', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-004', 'medium', 'نیاز به سیستم انتقال'),
('int-003', '13876975-2160-4903-acb0-53102d194d77', 'prod-002', 'high', 'نیاز فوری به میکسر'),
('int-004', '13876975-2160-4903-acb0-53102d194d77', 'prod-003', 'medium', 'آسیاب فعلی کارایی ندارد'),
('int-005', '18f05b00-f033-479d-b824-ceeb580377da', 'prod-002', 'low', 'در حال بررسی گزینه‌ها');

-- مرحله 9: بروزرسانی فیلد assigned_to برای مشتریان بدون مسئول
UPDATE customers 
SET assigned_to = 'ceo-001' 
WHERE assigned_to IS NULL OR assigned_to = '';

-- مرحله 10: اضافه کردن ایندکس‌های بهینه‌سازی
CREATE INDEX IF NOT EXISTS `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX IF NOT EXISTS `idx_customers_city` ON `customers` (`city`);
CREATE INDEX IF NOT EXISTS `idx_customers_source` ON `customers` (`source`);
CREATE INDEX IF NOT EXISTS `idx_customers_status_priority` ON `customers` (`status`, `priority`);
CREATE INDEX IF NOT EXISTS `idx_customers_segment` ON `customers` (`segment`);

-- پایان اسکریپت
SELECT 'Database structure updated successfully!' as message;