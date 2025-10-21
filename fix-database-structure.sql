-- اسکریپت تصحیح ساختار دیتابیس
-- ابتدا این کوئری رو اجرا کنید تا ساختار جدول products رو ببینید:
-- DESCRIBE products;

-- اگر جدول products وجود داره ولی ساختارش اشتباهه، ابتدا آن را حذف کنید:
DROP TABLE IF EXISTS `products`;

-- حالا جدول products رو با ساختار صحیح ایجاد کنید:
CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100),
  `price` decimal(15,2),
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive') DEFAULT 'active',
  `sku` varchar(100),
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
);

-- اضافه کردن ایندکس‌ها:
ALTER TABLE `products` ADD INDEX `idx_products_category` (`category`);
ALTER TABLE `products` ADD INDEX `idx_products_status` (`status`);
ALTER TABLE `products` ADD INDEX `idx_products_created_by` (`created_by`);

-- ایجاد جدول علاقه‌مندی مشتری به محصولات:
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
  INDEX `idx_customer_interests` (`customer_id`),
  INDEX `idx_product_interests` (`product_id`)
);

-- بررسی اینکه آیا فیلدهای جدید در جدول customers وجود دارند:
-- اگر خطا دادند، یعنی قبلاً اضافه شده‌اند
ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `last_activity_date` timestamp NULL DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `lead_score` int DEFAULT 0;

-- ایجاد ایندکس‌های مفید (اگر وجود نداشته باشند):
CREATE INDEX `idx_customers_industry` ON `customers` (`industry`);
CREATE INDEX `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX `idx_customers_city` ON `customers` (`city`);
CREATE INDEX `idx_customers_source` ON `customers` (`source`);

-- درج نمونه محصولات:
INSERT INTO `products` (`id`, `name`, `description`, `category`, `price`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام با ظرفیت بالا', 'ماشین‌آلات کشاورزی', 50000000.00, 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر برای تولید خوراک', 'ماشین‌آلات کشاورزی', 25000000.00, 'MILL-MIX-001', 'ceo-001'),
('prod-003', 'سیستم مدیریت CRM', 'نرم‌افزار مدیریت ارتباط با مشتری', 'نرم‌افزار', 10000000.00, 'CRM-SYS-001', 'ceo-001'),
('prod-004', 'تجهیزات دامداری', 'تجهیزات کامل دامداری', 'تجهیزات دامی', 30000000.00, 'FARM-EQ-001', 'ceo-001');

-- بروزرسانی منبع مشتریان موجود:
UPDATE `customers` SET `source` = 'تماس تلفنی' WHERE (`industry` LIKE '%دام%' OR `industry` LIKE '%پرورش%') AND `source` IS NULL;
UPDATE `customers` SET `source` = 'وب‌سایت' WHERE `priority` = 'high' AND `source` IS NULL;

-- تست نهایی - نمایش ساختار جداول:
-- DESCRIBE products;
-- DESCRIBE customer_product_interests;
-- SHOW INDEX FROM customers;