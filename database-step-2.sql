-- مرحله 2: ایجاد جدول علاقه‌مندی مشتری-محصول
-- این مرحله رو بعد از مرحله 1 اجرا کنید

-- ایجاد جدول علاقه‌مندی مشتری به محصولات
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

-- بررسی نتیجه
SELECT 'مرحله 2 تکمیل شد - جدول علاقه‌مندی ایجاد شد' as message;
DESCRIBE customer_product_interests;