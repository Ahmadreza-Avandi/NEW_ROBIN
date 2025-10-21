-- حل مشکل collation - نسخه ساده
-- تغییر collation جدول customers به utf8mb4_unicode_ci

-- ابتدا جدول users را بررسی و ایجاد می‌کنیم اگر وجود ندارد
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','sales','support','user') DEFAULT 'user',
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `avatar_url` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- اضافه کردن کاربران پیش‌فرض اگر وجود ندارند
INSERT IGNORE INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`) VALUES
('ceo-001', 'مدیر عامل', 'ceo@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'active'),
('a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'کارشناس فروش 1', 'sales1@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales', 'active'),
('e820e817-eed0-40c0-9916-d23599e7e2ef', 'کارشناس فروش 2', 'sales2@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales', 'active'),
('362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'کارشناس فروش 3', 'sales3@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'sales', 'active'),
('9f6b90b9-0723-4261-82c3-cd54e21d3995', 'کاربر تست', 'test@company.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'user', 'active');

-- تغییر collation جدول customers به utf8mb4_unicode_ci
ALTER TABLE `customers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد جدول products اگر وجود ندارد
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `sku` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','discontinued') DEFAULT 'active',
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `products_sku_unique` (`sku`),
  KEY `products_category_index` (`category`),
  KEY `products_status_index` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- اضافه کردن محصولات نمونه
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category`, `price`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید کامل خوراک دام', 'خط تولید کامل شامل آسیاب، میکسر و سیستم انتقال', 'خط تولید', 1200000000.00, 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'میکسر خوراک دام', 'میکسر صنعتی برای تولید خوراک دام', 'میکسر', 350000000.00, 'MIXER-001', 'ceo-001'),
('prod-003', 'آسیاب خوراک', 'آسیاب صنعتی برای آسیاب کردن غلات', 'آسیاب', 280000000.00, 'MILL-001', 'ceo-001'),
('prod-004', 'سیستم انتقال', 'سیستم نوار نقاله و انتقال مواد', 'انتقال', 150000000.00, 'CONVEYOR-001', 'ceo-001'),
('prod-005', 'سیستم کنترل اتوماتیک', 'سیستم کنترل و اتوماسیون خط تولید', 'کنترل', 200000000.00, 'CONTROL-001', 'ceo-001');

-- ایجاد جدول deal_stages اگر وجود ندارد
CREATE TABLE IF NOT EXISTS `deal_stages` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `probability_range_min` int(11) DEFAULT 0,
  `probability_range_max` int(11) DEFAULT 100,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `deal_stages_order_index` (`stage_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- اضافه کردن مراحل فروش پیش‌فرض
INSERT IGNORE INTO `deal_stages` (`id`, `name`, `description`, `stage_order`, `probability_range_min`, `probability_range_max`, `color`) VALUES
('stage-001', 'لید جدید', 'مشتری جدید شناسایی شده', 1, 0, 20, '#6B7280'),
('stage-002', 'تماس اولیه', 'اولین تماس با مشتری برقرار شده', 2, 20, 40, '#3B82F6'),
('stage-003', 'نیازسنجی', 'نیازهای مشتری شناسایی شده', 3, 40, 60, '#F59E0B'),
('stage-004', 'ارائه پیشنهاد', 'پیشنهاد قیمت ارائه شده', 4, 60, 80, '#10B981'),
('stage-005', 'مذاکره', 'در حال مذاکره نهایی', 5, 80, 95, '#EF4444'),
('stage-006', 'بسته شده - برنده', 'فروش موفق', 6, 100, 100, '#059669'),
('stage-007', 'بسته شده - بازنده', 'فروش ناموفق', 7, 0, 0, '#DC2626');

-- بروزرسانی جدول deals برای اضافه کردن stage_id اگر وجود ندارد
ALTER TABLE `deals` 
ADD COLUMN `stage_id` varchar(36) DEFAULT 'stage-001' AFTER `currency`;

-- بروزرسانی deals موجود برای تنظیم stage_id بر اساس probability
UPDATE `deals` SET 
  `stage_id` = CASE 
    WHEN `probability` >= 100 THEN 'stage-006'
    WHEN `probability` >= 80 THEN 'stage-005'
    WHEN `probability` >= 60 THEN 'stage-004'
    WHEN `probability` >= 40 THEN 'stage-003'
    WHEN `probability` >= 20 THEN 'stage-002'
    ELSE 'stage-001'
  END
WHERE `stage_id` IS NULL OR `stage_id` = '';

-- نمایش وضعیت نهایی
SELECT 'Database collation fix completed successfully!' as status;