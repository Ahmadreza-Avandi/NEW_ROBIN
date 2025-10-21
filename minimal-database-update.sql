-- اسکریپت حداقلی بروزرسانی دیتابیس
-- هر خط رو جداگانه اجرا کنید

-- 1. حذف جدول products اگر وجود دارد (احتیاط کنید!)
DROP TABLE IF EXISTS `products`;

-- 2. ایجاد جدول products با ساختار کامل
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

-- 3. ایجاد جدول علاقه‌مندی
CREATE TABLE IF NOT EXISTS `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text,
  `created_at` timestamp DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY (`customer_id`, `product_id`)
);

-- 4. درج محصولات نمونه
INSERT INTO `products` VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام', 'ماشین‌آلات', 50000000, 'IRR', 'active', 'FEED-001', 'ceo-001', NOW(), NOW()),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر', 'ماشین‌آلات', 25000000, 'IRR', 'active', 'MILL-001', 'ceo-001', NOW(), NOW()),
('prod-003', 'سیستم CRM', 'نرم‌افزار مدیریت مشتری', 'نرم‌افزار', 10000000, 'IRR', 'active', 'CRM-001', 'ceo-001', NOW(), NOW());

-- 5. اضافه کردن فیلد source به customers (اگر خطا داد، نادیده بگیرید)
ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL;

-- تمام!