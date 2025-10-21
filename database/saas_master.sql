-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2025 at 02:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `saas_master`
--

-- --------------------------------------------------------

--
-- Stand-in structure for view `active_tenants_summary`
-- (See below for the actual view)
--
CREATE TABLE `active_tenants_summary` (
`id` int(11)
,`tenant_key` varchar(50)
,`company_name` varchar(255)
,`admin_email` varchar(255)
,`subscription_status` enum('active','expired','suspended','trial')
,`subscription_plan` enum('basic','professional','enterprise','custom')
,`subscription_end` date
,`days_remaining` int(7)
,`max_users` int(11)
,`created_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `expired_tenants`
-- (See below for the actual view)
--
CREATE TABLE `expired_tenants` (
`id` int(11)
,`tenant_key` varchar(50)
,`company_name` varchar(255)
,`admin_email` varchar(255)
,`subscription_end` date
,`days_expired` int(7)
);

-- --------------------------------------------------------

--
-- Table structure for table `subscription_history`
--

CREATE TABLE `subscription_history` (
  `id` int(11) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `plan_key` varchar(50) NOT NULL,
  `subscription_type` enum('monthly','yearly','custom') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'مبلغ پرداختی (تومان)',
  `status` enum('active','expired','cancelled','refunded') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'ID super admin که ایجاد کرده'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_history`
--

INSERT INTO `subscription_history` (`id`, `tenant_id`, `plan_key`, `subscription_type`, `start_date`, `end_date`, `amount`, `status`, `notes`, `created_at`, `created_by`) VALUES
(1, 1, 'professional', 'yearly', '2025-10-13', '2026-10-13', 15000000.00, '', NULL, '2025-10-13 17:00:20', NULL),
(2, 4, 'professional', 'monthly', '2025-10-13', '2026-04-13', 1500000.00, '', NULL, '2025-10-13 17:35:23', NULL),
(3, 5, 'basic', 'yearly', '2025-10-13', '2026-10-13', 5000000.00, '', NULL, '2025-10-13 17:39:19', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plans`
--

CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL,
  `plan_key` varchar(50) NOT NULL COMMENT 'کلید یکتا (basic, pro, enterprise)',
  `plan_name` varchar(100) NOT NULL COMMENT 'نام فارسی پلن',
  `plan_name_en` varchar(100) DEFAULT NULL COMMENT 'نام انگلیسی پلن',
  `price_monthly` decimal(15,2) DEFAULT 0.00 COMMENT 'قیمت ماهانه (تومان)',
  `price_yearly` decimal(15,2) DEFAULT 0.00 COMMENT 'قیمت سالانه (تومان)',
  `max_users` int(11) DEFAULT 10,
  `max_customers` int(11) DEFAULT 1000,
  `max_storage_mb` int(11) DEFAULT 1024,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'لیست ویژگی‌های پلن' CHECK (json_valid(`features`)),
  `description` text DEFAULT NULL COMMENT 'توضیحات پلن',
  `is_active` tinyint(1) DEFAULT 1,
  `display_order` int(11) DEFAULT 0 COMMENT 'ترتیب نمایش',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscription_plans`
--

INSERT INTO `subscription_plans` (`id`, `plan_key`, `plan_name`, `plan_name_en`, `price_monthly`, `price_yearly`, `max_users`, `max_customers`, `max_storage_mb`, `features`, `description`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'basic', 'پایه', 'Basic', 500000.00, 5000000.00, 5, 500, 512, '[\"crm_basic\", \"customer_management\", \"task_management\"]', 'پلن پایه برای کسب‌وکارهای کوچک', 1, 1, '2025-10-13 15:20:25', '2025-10-13 15:20:25'),
(2, 'professional', 'حرفه‌ای', 'Professional', 1500000.00, 15000000.00, 20, 5000, 2048, '[\"crm_basic\", \"customer_management\", \"task_management\", \"advanced_reports\", \"api_access\"]', 'پلن حرفه‌ای برای کسب‌وکارهای متوسط', 1, 2, '2025-10-13 15:20:25', '2025-10-13 15:20:25'),
(3, 'enterprise', 'سازمانی', 'Enterprise', 5000000.00, 50000000.00, 100, 50000, 10240, '[\"crm_basic\", \"customer_management\", \"task_management\", \"advanced_reports\", \"api_access\", \"voice_assistant\", \"custom_integration\", \"priority_support\"]', 'پلن سازمانی برای شرکت‌های بزرگ', 1, 3, '2025-10-13 15:20:25', '2025-10-13 15:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `super_admins`
--

CREATE TABLE `super_admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'bcrypt hash',
  `full_name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` enum('super_admin','admin','support') DEFAULT 'admin',
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'دسترسی‌های خاص' CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `super_admins`
--

INSERT INTO `super_admins` (`id`, `username`, `email`, `password_hash`, `full_name`, `phone`, `role`, `permissions`, `is_active`, `last_login`, `created_at`, `updated_at`) VALUES
(1, 'Ahmadreza.avandi', 'ahmadrezaavandi@gmail.com', '$2b$10$LZwtbXyn2q1sIMV5ymNU7ujRHGJJbdPOu2PKf6jUs3wmE.syBxiKK', 'احمدرضا اوندی', NULL, 'super_admin', NULL, 1, '2025-10-13 19:42:14', '2025-10-13 15:20:25', '2025-10-13 19:42:14');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0 COMMENT 'قابل نمایش برای tenants',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'default_trial_days', '14', 'number', 'تعداد روزهای دوره آزمایشی پیش‌فرض', 0, '2025-10-13 15:20:25', '2025-10-13 15:20:25'),
(2, 'max_tenants', '1000', 'number', 'حداکثر تعداد tenants مجاز', 0, '2025-10-13 15:20:25', '2025-10-13 15:20:25'),
(3, 'maintenance_mode', 'false', 'boolean', 'حالت تعمیر و نگهداری', 0, '2025-10-13 15:20:25', '2025-10-13 15:20:25'),
(4, 'default_db_host', 'mysql', 'string', 'هاست پیش‌فرض دیتابیس', 0, '2025-10-13 15:20:25', '2025-10-13 15:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `tenants`
--

CREATE TABLE `tenants` (
  `id` int(11) NOT NULL,
  `tenant_key` varchar(50) NOT NULL COMMENT 'کلید یکتا برای شناسایی tenant (مثل: irankhodro, rabin)',
  `company_name` varchar(255) NOT NULL COMMENT 'نام شرکت',
  `db_name` varchar(100) NOT NULL COMMENT 'نام دیتابیس اختصاصی',
  `db_host` varchar(255) DEFAULT 'mysql' COMMENT 'هاست دیتابیس',
  `db_port` int(11) DEFAULT 3306 COMMENT 'پورت دیتابیس',
  `db_user` varchar(100) NOT NULL COMMENT 'کاربر دیتابیس',
  `db_password` varchar(255) NOT NULL COMMENT 'رمز دیتابیس (encrypted)',
  `admin_name` varchar(255) DEFAULT NULL COMMENT 'نام مدیر شرکت',
  `admin_email` varchar(255) NOT NULL COMMENT 'ایمیل مدیر',
  `admin_phone` varchar(20) DEFAULT NULL COMMENT 'تلفن مدیر',
  `subscription_status` enum('active','expired','suspended','trial') DEFAULT 'trial' COMMENT 'وضعیت اشتراک',
  `subscription_plan` enum('basic','professional','enterprise','custom') DEFAULT 'basic' COMMENT 'نوع پلن',
  `subscription_start` date DEFAULT NULL COMMENT 'تاریخ شروع اشتراک',
  `subscription_end` date DEFAULT NULL COMMENT 'تاریخ پایان اشتراک',
  `max_users` int(11) DEFAULT 10 COMMENT 'حداکثر تعداد کاربران',
  `max_customers` int(11) DEFAULT 1000 COMMENT 'حداکثر تعداد مشتریان',
  `max_storage_mb` int(11) DEFAULT 1024 COMMENT 'حداکثر فضای ذخیره‌سازی (MB)',
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'ویژگی‌های فعال (voice_assistant, advanced_reports, etc.)' CHECK (json_valid(`features`)),
  `settings` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'تنظیمات اختصاصی tenant' CHECK (json_valid(`settings`)),
  `is_active` tinyint(1) DEFAULT 1 COMMENT 'فعال/غیرفعال',
  `is_deleted` tinyint(1) DEFAULT 0 COMMENT 'حذف شده (soft delete)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenants`
--

INSERT INTO `tenants` (`id`, `tenant_key`, `company_name`, `db_name`, `db_host`, `db_port`, `db_user`, `db_password`, `admin_name`, `admin_email`, `admin_phone`, `subscription_status`, `subscription_plan`, `subscription_start`, `subscription_end`, `max_users`, `max_customers`, `max_storage_mb`, `features`, `settings`, `is_active`, `is_deleted`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'rabin', 'شرکت رابین تجارت', 'crm_system', 'localhost', 3306, 'root', 'e36e2202897c1684aa5e53c3d217fef6:c0d0a907cfb47e31099308c02a92a258:', 'احمدرضا اوندی', 'ahmadrezaavandi@gmail.com', '', 'active', 'professional', '2025-10-13', '2026-10-13', 20, 5000, 2048, '\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\", \\\"advanced_reports\\\", \\\"api_access\\\"]\"', NULL, 1, 0, '2025-10-13 17:00:20', '2025-10-17 10:24:26', NULL),
(4, 'samin', 'samin', 'crm_system', 'localhost', 3306, 'root', 'af03b9577c92f64a678d99cd73eb190b:c76545e0b3896dc3e842c4290cd0116f:', 'samin', 'samin@gmail.com', '09001234567', 'active', 'professional', '2025-10-13', '2026-04-13', 20, 5000, 2048, '\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\", \\\"advanced_reports\\\", \\\"api_access\\\"]\"', NULL, 1, 0, '2025-10-13 17:35:23', '2025-10-17 09:53:23', NULL),
(5, 'testcompany', 'شرکت تست', 'crm_system', 'localhost', 3306, 'root', '693011d4f215d8e3eead9d67d4dc51fd:94037994541b2ca22a452c3ca2cee3b4:', 'مدیر تست', 'admin@test.com', '', 'active', 'basic', '2025-10-13', '2026-10-13', 5, 500, 512, '\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\"]\"', NULL, 1, 0, '2025-10-13 17:39:19', '2025-10-17 09:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tenant_activity_logs`
--

CREATE TABLE `tenant_activity_logs` (
  `id` bigint(20) NOT NULL,
  `tenant_id` int(11) NOT NULL,
  `activity_type` enum('created','activated','suspended','expired','deleted','updated','login','other') NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'اطلاعات اضافی' CHECK (json_valid(`metadata`)),
  `performed_by` int(11) DEFAULT NULL COMMENT 'ID super admin',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tenant_activity_logs`
--

INSERT INTO `tenant_activity_logs` (`id`, `tenant_id`, `activity_type`, `description`, `metadata`, `performed_by`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 1, '', 'Tenant created: شرکت رابین تجارت', '{\"plan_key\":\"professional\",\"subscription_months\":12,\"admin_email\":\"ahmadrezaavandi@gmail.com\"}', NULL, NULL, NULL, '2025-10-13 17:00:20'),
(2, 4, '', 'Tenant created: samin', '{\"plan_key\":\"professional\",\"subscription_months\":6,\"admin_email\":\"samin@gmail.com\"}', NULL, NULL, NULL, '2025-10-13 17:35:23'),
(3, 5, '', 'Tenant created: شرکت تست', '{\"plan_key\":\"basic\",\"subscription_months\":12,\"admin_email\":\"admin@test.com\"}', NULL, NULL, NULL, '2025-10-13 17:39:19');

-- --------------------------------------------------------

--
-- Structure for view `active_tenants_summary`
--
DROP TABLE IF EXISTS `active_tenants_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `active_tenants_summary`  AS SELECT `t`.`id` AS `id`, `t`.`tenant_key` AS `tenant_key`, `t`.`company_name` AS `company_name`, `t`.`admin_email` AS `admin_email`, `t`.`subscription_status` AS `subscription_status`, `t`.`subscription_plan` AS `subscription_plan`, `t`.`subscription_end` AS `subscription_end`, to_days(`t`.`subscription_end`) - to_days(curdate()) AS `days_remaining`, `t`.`max_users` AS `max_users`, `t`.`created_at` AS `created_at` FROM `tenants` AS `t` WHERE `t`.`is_active` = 1 AND `t`.`is_deleted` = 0 ORDER BY `t`.`subscription_end` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `expired_tenants`
--
DROP TABLE IF EXISTS `expired_tenants`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `expired_tenants`  AS SELECT `t`.`id` AS `id`, `t`.`tenant_key` AS `tenant_key`, `t`.`company_name` AS `company_name`, `t`.`admin_email` AS `admin_email`, `t`.`subscription_end` AS `subscription_end`, to_days(curdate()) - to_days(`t`.`subscription_end`) AS `days_expired` FROM `tenants` AS `t` WHERE `t`.`subscription_status` = 'expired' AND `t`.`is_active` = 1 AND `t`.`is_deleted` = 0 ORDER BY `t`.`subscription_end` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_dates` (`start_date`,`end_date`);

--
-- Indexes for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `plan_key` (`plan_key`),
  ADD KEY `idx_plan_key` (`plan_key`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `super_admins`
--
ALTER TABLE `super_admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `tenants`
--
ALTER TABLE `tenants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `tenant_key` (`tenant_key`),
  ADD KEY `idx_tenant_key` (`tenant_key`),
  ADD KEY `idx_subscription_status` (`subscription_status`),
  ADD KEY `idx_is_active` (`is_active`),
  ADD KEY `idx_subscription_end` (`subscription_end`),
  ADD KEY `idx_db_name` (`db_name`);

--
-- Indexes for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_tenant_id` (`tenant_id`),
  ADD KEY `idx_activity_type` (`activity_type`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `subscription_history`
--
ALTER TABLE `subscription_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `subscription_plans`
--
ALTER TABLE `subscription_plans`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `super_admins`
--
ALTER TABLE `super_admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `tenants`
--
ALTER TABLE `tenants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `subscription_history`
--
ALTER TABLE `subscription_history`
  ADD CONSTRAINT `subscription_history_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `tenant_activity_logs`
--
ALTER TABLE `tenant_activity_logs`
  ADD CONSTRAINT `tenant_activity_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
