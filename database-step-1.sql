-- مرحله 1: ایجاد جدول محصولات
-- این مرحله رو اول اجرا کنید

-- ایجاد جدول محصولات
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

-- درج محصولات نمونه
INSERT INTO `products` VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام با ظرفیت بالا', 'ماشین‌آلات کشاورزی', 50000000, 'IRR', 'active', 'FEED-001', 'ceo-001', NOW(), NOW()),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر برای تولید خوراک', 'ماشین‌آلات کشاورزی', 25000000, 'IRR', 'active', 'MILL-001', 'ceo-001', NOW(), NOW()),
('prod-003', 'سیستم CRM', 'نرم‌افزار مدیریت مشتری', 'نرم‌افزار', 10000000, 'IRR', 'active', 'CRM-001', 'ceo-001', NOW(), NOW()),
('prod-004', 'تجهیزات دامداری', 'تجهیزات کامل دامداری', 'تجهیزات دامی', 30000000, 'IRR', 'active', 'FARM-001', 'ceo-001', NOW(), NOW());

-- بررسی نتیجه
SELECT 'مرحله 1 تکمیل شد - جدول محصولات ایجاد شد' as message;
SELECT COUNT(*) as total_products FROM products;