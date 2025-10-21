-- مرحله 5: ایجاد جدول users (اگر وجود ندارد)
-- این مرحله رو بعد از مرحله 4 اجرا کنید

-- بررسی وجود جدول users
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','manager','sales','support','user') DEFAULT 'user',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

-- درج کاربران نمونه (اگر وجود نداشته باشند)
INSERT IGNORE INTO `users` VALUES
('ceo-001', 'مدیر عامل', 'ceo@company.com', 'hashed_password', 'admin', 'active', NOW(), NOW()),
('a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'علی محمدی', 'ali@company.com', 'hashed_password', 'sales', 'active', NOW(), NOW()),
('e820e817-eed0-40c0-9916-d23599e7e2ef', 'سارا احمدی', 'sara@company.com', 'hashed_password', 'sales', 'active', NOW(), NOW()),
('362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'رضا کریمی', 'reza@company.com', 'hashed_password', 'manager', 'active', NOW(), NOW()),
('9f6b90b9-0723-4261-82c3-cd54e21d3995', 'مریم رضایی', 'maryam@company.com', 'hashed_password', 'support', 'active', NOW(), NOW());

-- بررسی نتیجه
SELECT 'مرحله 5 تکمیل شد - جدول users آماده است' as message;
SELECT COUNT(*) as total_users FROM users;