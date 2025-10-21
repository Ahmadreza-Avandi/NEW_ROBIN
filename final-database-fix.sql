-- حل نهایی مشکلات دیتابیس
-- این فایل تمام مشکلات را حل می‌کند

-- مرحله 1: تنظیم charset و collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- مرحله 2: ایجاد جدول محصولات
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100),
  `price` decimal(15,2),
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive') DEFAULT 'active',
  `sku` varchar(100),
  `tags` longtext DEFAULT NULL,
  `specifications` longtext DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- مرحله 3: ایجاد جدول علاقه‌مندی مشتری-محصول
DROP TABLE IF EXISTS `customer_product_interests`;
CREATE TABLE `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_product` (`customer_id`, `product_id`),
  KEY `idx_customer_interests` (`customer_id`),
  KEY `idx_product_interests` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- مرحله 4: تنظیم collation جدول customers
ALTER TABLE `customers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- مرحله 5: تنظیم collation جدول users
ALTER TABLE `users` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

-- مرحله 6: اضافه کردن فیلد source (اگر وجود نداشته باشد)
ALTER TABLE `customers` 
ADD COLUMN `source` varchar(100) DEFAULT NULL COMMENT 'منبع کسب مشتری';

-- مرحله 7: اضافه کردن محصولات نمونه
INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `currency`, `status`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه کامل تولید خوراک دام با ظرفیت 1 تن در ساعت', 'ماشین‌آلات کشاورزی', 500000000.00, 'IRR', 'active', 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'میکسر خوراک دام', 'میکسر صنعتی برای ترکیب مواد خوراکی', 'ماشین‌آلات کشاورزی', 150000000.00, 'IRR', 'active', 'MIXER-001', 'ceo-001'),
('prod-003', 'آسیاب خوراک', 'آسیاب چکشی برای آسیاب کردن غلات', 'ماشین‌آلات کشاورزی', 80000000.00, 'IRR', 'active', 'MILL-001', 'ceo-001'),
('prod-004', 'سیستم انتقال مواد', 'نوار نقاله و سیستم انتقال مواد', 'ماشین‌آلات کشاورزی', 200000000.00, 'IRR', 'active', 'CONVEYOR-001', 'ceo-001'),
('prod-005', 'دستگاه بسته‌بندی', 'دستگاه اتوماتیک بسته‌بندی خوراک', 'ماشین‌آلات کشاورزی', 300000000.00, 'IRR', 'active', 'PACKING-001', 'ceo-001');

-- مرحله 8: اضافه کردن علاقه‌مندی‌های نمونه
INSERT INTO `customer_product_interests` (`id`, `customer_id`, `product_id`, `interest_level`, `notes`) VALUES
('int-001', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-001', 'high', 'علاقه‌مند به خرید خط کامل تولید'),
('int-002', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-004', 'medium', 'نیاز به سیستم انتقال'),
('int-003', '13876975-2160-4903-acb0-53102d194d77', 'prod-002', 'high', 'نیاز فوری به میکسر'),
('int-004', '13876975-2160-4903-acb0-53102d194d77', 'prod-003', 'medium', 'آسیاب فعلی کارایی ندارد'),
('int-005', '18f05b00-f033-479d-b824-ceeb580377da', 'prod-002', 'low', 'در حال بررسی گزینه‌ها');

-- مرحله 9: بروزرسانی assigned_to برای مشتریان بدون مسئول
UPDATE customers 
SET assigned_to = 'ceo-001' 
WHERE assigned_to IS NULL OR assigned_to = '';

-- مرحله 10: اضافه کردن ایندکس‌های مفید
ALTER TABLE `customers` ADD INDEX IF NOT EXISTS `idx_customers_assigned_to` (`assigned_to`);
ALTER TABLE `customers` ADD INDEX IF NOT EXISTS `idx_customers_city` (`city`);
ALTER TABLE `customers` ADD INDEX IF NOT EXISTS `idx_customers_source` (`source`);
ALTER TABLE `customers` ADD INDEX IF NOT EXISTS `idx_customers_status_priority` (`status`, `priority`);
ALTER TABLE `customers` ADD INDEX IF NOT EXISTS `idx_customers_segment` (`segment`);

-- مرحله 11: حذف View قدیمی و ایجاد View جدید بدون مشکل collation
DROP VIEW IF EXISTS `customer_summary_view`;

-- پایان اسکریپت
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as products_count FROM products;
SELECT COUNT(*) as interests_count FROM customer_product_interests;