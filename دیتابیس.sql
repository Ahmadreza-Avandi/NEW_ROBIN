-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 11, 2025 at 07:51 PM
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
-- Database: `crm_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` varchar(36) NOT NULL,
  `company_id` varchar(36) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `full_name` varchar(255) GENERATED ALWAYS AS (concat(`first_name`,' ',`last_name`)) STORED,
  `job_title` varchar(150) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `linkedin_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'ایران',
  `postal_code` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tags` longtext DEFAULT NULL CHECK (json_valid(`tags`)),
  `custom_fields` longtext DEFAULT NULL CHECK (json_valid(`custom_fields`)),
  `avatar_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','do_not_contact') DEFAULT 'active',
  `is_primary` tinyint(1) DEFAULT 0,
  `source` varchar(50) DEFAULT NULL,
  `last_contact_date` date DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `contacts`
--

INSERT INTO `contacts` (`id`, `company_id`, `first_name`, `last_name`, `job_title`, `department`, `email`, `phone`, `mobile`, `linkedin_url`, `twitter_url`, `address`, `city`, `country`, `postal_code`, `birth_date`, `notes`, `tags`, `custom_fields`, `avatar_url`, `status`, `is_primary`, `source`, `last_contact_date`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
('cnt-mg9gtlhu', NULL, 'تستی', 'تاستی', 'شی', 'یش', 'شی@m.com', '23', '432', 'شی', 'شی', 'شی', 'شی', 'اشییران', NULL, NULL, 'شی', NULL, NULL, NULL, 'active', 0, 'other', NULL, '9f6b90b9-0723-4261-82c3-cd54e21d3995', '9f6b90b9-0723-4261-82c3-cd54e21d3995', '2025-10-02 10:12:57', '2025-10-02 10:12:57'),
('67e878ad-2083-459a-87fc-af3441d4e99a', NULL, 'علی', 'علی', 'مدیر عامل', 'مدیریت', 'ali.ahmadi@tejarat-pars.com', '02188776655', '09121234567', 'https://linkedin.com/in/ali-ahmadi', NULL, 'خیابان ولیعصر پلاک 123', 'تهران', 'Iran', NULL, NULL, 'تصمیم‌گیرنده اصلی شرکت', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('f2997f8a-5f76-49c3-b87e-72aeb27b0e2d', NULL, 'سارا', 'سارا', 'مدیر فروش', 'فروش', 'sara.mohammadi@fanavar-novin.ir', '02177665544', '09123456789', 'https://linkedin.com/in/sara-mohammadi', NULL, 'خیابان آزادی پلاک 456', 'تهران', 'Iran', NULL, NULL, 'مسئول خرید نرم‌افزار', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('2596a750-28c3-4608-a60a-4c48d1ff9954', NULL, 'رضا', 'رضا', 'مدیر خرید', 'خرید', 'reza.karimi@petro-sanat.com', '07632221100', '09171234567', NULL, NULL, 'شهرک صنعتی شیراز', 'شیراز', 'Iran', NULL, NULL, 'نیاز به پیگیری مستمر', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('2b7161a9-2673-4e56-927d-d48360c3b377', NULL, 'مریم', 'مریم', 'مدیر بازاریابی', 'بازاریابی', 'maryam.rezaei@aseman-market.ir', '02155443322', '09122223333', 'https://linkedin.com/in/maryam-rezaei', 'https://twitter.com/maryam_rezaei', 'میدان ونک', 'تهران', 'Iran', NULL, NULL, 'علاقه‌مند به کمپین‌های تبلیغاتی', NULL, NULL, NULL, 'active', 0, 'social_media', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('7bb535f5-97f8-4722-8e35-608d5d7d58ce', NULL, 'حسین', 'حسین', 'مهندس پروژه', 'فنی', 'hosein.nouri@bonyan-sazeh.com', '03133445566', '09131112222', NULL, NULL, 'خیابان چهارباغ', 'اصفهان', 'Iran', NULL, NULL, 'متخصص در پروژه‌های بزرگ', NULL, NULL, NULL, 'active', 0, 'trade_show', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('e00b3478-5ba4-4a65-a13a-f14eb592dff1', NULL, 'فاطمه', 'فاطمه', 'مدیر مالی', 'مالی', 'fateme.hosseini@sepehr-trade.ir', '02166778899', '09124445555', 'https://linkedin.com/in/fateme-hosseini', NULL, 'خیابان انقلاب پلاک 789', 'تهران', 'Iran', NULL, NULL, 'مسئول تصمیمات مالی', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('896e3aab-f278-4f3c-97bf-6e356ffb076e', NULL, 'محمد', 'محمد', 'مدیر تولید', 'تولید', 'mohammad.alizadeh@noavaran.com', '05138887766', '09155556666', NULL, NULL, 'شهرک صنعتی مشهد', 'مشهد', 'Iran', NULL, NULL, 'متخصص بهینه‌سازی تولید', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('85a5cc2c-ba0c-4583-bbb9-426d05185cad', NULL, 'زهرا', 'زهرا', 'کارشناس فنی', 'پشتیبانی', 'zahra.kazemi@pars-service.ir', '02144556677', '09127778888', 'https://linkedin.com/in/zahra-kazemi', NULL, 'خیابان شریعتی پلاک 321', 'تهران', 'Iran', NULL, NULL, 'کارشناس ارشد فنی', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('d2868619-56a5-43ee-8509-d4bfe973ba91', NULL, 'امیر', 'امیر', 'مهندس طراحی', 'طراحی', 'amir.mahmoudi@arya-eng.com', '03155667788', '09138889999', NULL, NULL, 'خیابان هزار جریب', 'اصفهان', 'Iran', NULL, NULL, 'متخصص طراحی صنعتی', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('0a9d474b-99f3-4bcc-a5bb-99bb5de07f80', NULL, 'نرگس', 'نرگس', 'مدیر لجستیک', 'لجستیک', 'narges.sadeghi@iran-distribution.ir', '02133445566', '09121110000', 'https://linkedin.com/in/narges-sadeghi', NULL, 'خیابان جمهوری پلاک 555', 'تهران', 'Iran', NULL, NULL, 'مسئول زنجیره تامین', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('3db536dc-52c0-4f70-ad31-183be2d91094', NULL, 'پویا', 'پویا', 'مدیر IT', 'فناوری اطلاعات', 'pouya.rahimi@tejarat-pars.com', '02188776655', '09122221111', NULL, NULL, 'خیابان ولیعصر پلاک 123', 'تهران', 'Iran', NULL, NULL, 'مسئول زیرساخت IT', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('68618510-3980-4271-9cb7-9d9ff3f5c844', NULL, 'لیلا', 'لیلا', 'کارشناس منابع انسانی', 'منابع انسانی', 'leila.jafari@fanavar-novin.ir', '02177665544', '09123332222', 'https://linkedin.com/in/leila-jafari', NULL, 'خیابان آزادی پلاک 456', 'تهران', 'Iran', NULL, NULL, 'مسئول استخدام', NULL, NULL, NULL, 'active', 0, 'social_media', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('693b044d-c600-4d26-b2bf-ac16259daab6', NULL, 'سعید', 'سعید', 'مدیر کیفیت', 'کنترل کیفیت', 'saeed.mousavi@petro-sanat.com', '07632221100', '09174443333', NULL, NULL, 'شهرک صنعتی شیراز', 'شیراز', 'Iran', NULL, NULL, 'مسئول استانداردهای کیفی', NULL, NULL, NULL, 'active', 0, 'trade_show', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('aaac23d1-8fed-485e-b8bb-0115fafd52a2', NULL, 'نازنین', 'نازنین', 'مدیر فروش منطقه‌ای', 'فروش', 'nazanin.amini@aseman-market.ir', '02155443322', '09125554444', 'https://linkedin.com/in/nazanin-amini', NULL, 'میدان ونک', 'تهران', 'Iran', NULL, NULL, 'مسئول فروش شمال تهران', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('84559171-b78e-4256-96ab-265d8fd3a135', NULL, 'کامران', 'کامران', 'مدیر پروژه', 'مدیریت پروژه', 'kamran.safari@bonyan-sazeh.com', '03133445566', '09136667777', NULL, NULL, 'خیابان چهارباغ', 'اصفهان', 'Iran', NULL, NULL, 'مدیر پروژه‌های ساختمانی', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assigned_to` (`assigned_to`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
