-- ایجاد جداول گمشده

-- 1. ایجاد جدول محصولات
CREATE TABLE IF NOT EXISTS `products` (
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

-- 2. ایجاد جدول علاقه‌مندی مشتری-محصول
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
  KEY `idx_customer_interests` (`customer_id`),
  KEY `idx_product_interests` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. اضافه کردن محصولات نمونه
INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `currency`, `status`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه کامل تولید خوراک دام با ظرفیت 1 تن در ساعت', 'ماشین‌آلات کشاورزی', 500000000.00, 'IRR', 'active', 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'میکسر خوراک دام', 'میکسر صنعتی برای ترکیب مواد خوراکی', 'ماشین‌آلات کشاورزی', 150000000.00, 'IRR', 'active', 'MIXER-001', 'ceo-001'),
('prod-003', 'آسیاب خوراک', 'آسیاب چکشی برای آسیاب کردن غلات', 'ماشین‌آلات کشاورزی', 80000000.00, 'IRR', 'active', 'MILL-001', 'ceo-001'),
('prod-004', 'سیستم انتقال مواد', 'نوار نقاله و سیستم انتقال مواد', 'ماشین‌آلات کشاورزی', 200000000.00, 'IRR', 'active', 'CONVEYOR-001', 'ceo-001'),
('prod-005', 'دستگاه بسته‌بندی', 'دستگاه اتوماتیک بسته‌بندی خوراک', 'ماشین‌آلات کشاورزی', 300000000.00, 'IRR', 'active', 'PACKING-001', 'ceo-001');

-- 4. اضافه کردن علاقه‌مندی‌های نمونه
INSERT INTO `customer_product_interests` (`id`, `customer_id`, `product_id`, `interest_level`, `notes`) VALUES
('int-001', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-001', 'high', 'علاقه‌مند به خرید خط کامل تولید'),
('int-002', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-004', 'medium', 'نیاز به سیستم انتقال'),
('int-003', '13876975-2160-4903-acb0-53102d194d77', 'prod-002', 'high', 'نیاز فوری به میکسر'),
('int-004', '13876975-2160-4903-acb0-53102d194d77', 'prod-003', 'medium', 'آسیاب فعلی کارایی ندارد'),
('int-005', '18f05b00-f033-479d-b824-ceeb580377da', 'prod-002', 'low', 'در حال بررسی گزینه‌ها');

-- 5. تست جداول
SELECT 'Products table created' as message, COUNT(*) as count FROM products;
SELECT 'Customer interests table created' as message, COUNT(*) as count FROM customer_product_interests;

SELECT 'Setup completed successfully!' as final_message;