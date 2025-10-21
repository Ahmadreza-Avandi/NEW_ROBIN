-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 17, 2025 at 02:25 PM
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
-- Table structure for table `activities`
--

CREATE TABLE `activities` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `customer_id` varchar(36) NOT NULL,
  `deal_id` varchar(36) DEFAULT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'call',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `performed_by` varchar(36) NOT NULL,
  `outcome` varchar(50) DEFAULT 'completed',
  `location` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `activities`
--

INSERT INTO `activities` (`id`, `tenant_key`, `customer_id`, `deal_id`, `type`, `title`, `description`, `start_time`, `end_time`, `duration`, `performed_by`, `outcome`, `location`, `notes`, `created_at`, `updated_at`) VALUES
('6b942cfe-b8ad-45d9-8c75-6aa04bcadc07', 'rabin', 'bebf1a00-4bb3-459c-9661-b1587038c6ce', NULL, 'call', 'تماس تلفنی جهت فروش و ارائه خط تولید خوراک دام', 'ایشان نیز دامداری سنتی و برای خرید خوراک از پنجشنبه بازار و برای میکس خوراک نیز به صورت دستی انجام می شود، توضیحات کامل به ایشان داده و اطلاعات نیز در واتس اپ خدمت ایشان ارسال گردید', '2025-09-08 09:12:29', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 09:12:29', '2025-09-08 09:12:29'),
('844ca0d9-d6e3-45cb-959c-1528c247cd12', 'rabin', '15147929-6e36-42c5-b2bf-a6b2b1413292', NULL, 'meeting', 'جلسه ارائه طرح توجیهی', 'جلسه گرفته شد و پیشنهاد فروش 1200 میلیونی بش داده شد و نیاز به ارائه در جلسه شرکای خودش داشت.', '2025-09-08 07:07:47', NULL, NULL, 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'follow_up_needed', NULL, NULL, '2025-09-08 07:07:47', '2025-09-08 07:07:47'),
('9a4b9aec-c16f-464b-90b1-21eda3a9ce9b', 'rabin', 'bb568c99-e785-4a1b-b29f-d307ae1a4679', NULL, 'call', 'تماس تلفنی جهت ارائه و فروش خط تولید خوراک دام', 'ایشان از توضیحات استقبال کردند و گفتند که یک کارگر برای ایشان 25 میلیون هزینه دارد و ایشان با دست خودشان و زن و بچه شان دامداری رو می گردانند و همچنین به دلیل افزایش قیمت ها دام سبک را دارند پرورش می دهند و همچنین 5 هکتار زمین یونجه دارند.', '2025-09-08 08:24:25', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 08:24:25', '2025-09-08 08:24:25'),
('a1fe7f56-9740-4312-af95-89ccaab8fed9', 'rabin', '13876975-2160-4903-acb0-53102d194d77', NULL, 'call', 'تماس تلفنی جهت ارائه و فروش خط تولید خوراک دام', 'ایشان گفتند که در دامداری ایشان تولید خوراک به صورت دستی انجام می شود و نیاز به دستگاه دارند و گفتند که فیلم دستگاه را برای ایشان در واتس اپ ارسال کنم.', '2025-09-08 07:46:34', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 07:46:34', '2025-09-08 07:46:34'),
('cb55c828-fe5e-4783-907c-e0e0b4b1082d', 'rabin', '18f05b00-f033-479d-b824-ceeb580377da', NULL, 'call', 'ارائه محصول و تماس برای فروش محصول', 'ایشان گفتند که آسیاب و میکسری که دارند به خوبی عمل نمی کند و به فکر جایگزینی آن هستند و گفتند که عکس دستگاه و قیمت رو براشون ارسال کنم/واتس اپ نداشتن و در تماس دوباره ایشان جوابگو نبودند', '2025-09-08 07:04:21', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 07:04:21', '2025-09-08 07:04:21'),
('dbadde5a-8204-4ee4-9560-32f0f04cfaee', 'rabin', '0095c921-5a12-4e0b-bcbe-3f3b4810c40b', NULL, 'call', 'تماس تلفنی جهت ارائه و فروش خط تولید خوراک دام', 'ایشان گفتند که دامداری ایشان نیز به صورت دستی اداره می شود و گفتند که فیلم دستگاه هارا برایشان ارسال کنم و توضیحات لازم به ایشان ارائه گردید', '2025-09-08 08:29:23', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 08:29:23', '2025-09-08 08:29:23'),
('f4a04127-5875-4d64-85de-8c47263cd6d9', 'rabin', '453f1ac1-c89b-412a-bc17-b68440e726f9', NULL, 'call', 'تماس جهت فروش و ارائه خط تولید خوراک دام', 'ایشان گفتند که دامداری ایشان دچار حریق شده و دست های ایشان دچار سوختگی شده و بعد از توضیحاتی که به ایشان داده شد درباره تسهیلات و مزایای دستگاه ها ایشان گفتند که باید به دفتر ما تشریف بیاورند و رودرو درباره این موضوع صحبت کنیم.', '2025-09-08 07:28:58', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 07:28:58', '2025-09-08 07:28:58'),
('fce5a0c6-2720-4ab3-b4f7-a5e810cdf06f', 'rabin', '2251af62-ba42-4836-b902-6151bd19e830', NULL, 'call', 'تماس تلفنی جهت فروش', 'ایشان بعد از تماس و توضیحات داده شده گفتند که باید مشورت کنم و دوباره با شماه تماس خواهم گرفت', '2025-09-08 07:10:43', NULL, NULL, 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'follow_up_needed', NULL, NULL, '2025-09-08 07:10:43', '2025-09-08 07:10:43'),
('c0f6c68e-364a-46a7-97ec-5d2b6d9485a4', 'rabin', 'a463ed0b-f1df-4804-b896-7cd48f707b78', NULL, 'call', 'بازم هیچی', 'هیچی', '2025-10-11 17:31:30', NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-11 17:31:30', '2025-10-11 17:31:30'),
('33021aae-28a2-4fa0-a229-22163243037e', 'rabin', 'f7edb9b0-0d85-4782-9743-bc688816d1b6', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-14 18:54:15', '2025-10-14 18:54:15'),
('6412cbdf-fe43-4829-bb9d-ee9761ee1eb2', 'rabin', 'f016ce54-973b-4b56-9275-3b454d699ff6', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-14 18:59:17', '2025-10-14 18:59:17'),
('53d6acf4-8a37-4875-a913-9705f9a79930', 'rabin', 'f016ce54-973b-4b56-9275-3b454d699ff6', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'completed', NULL, NULL, '2025-10-14 18:59:25', '2025-10-14 18:59:25'),
('88e70a6c-023b-470e-b217-472ad6124c50', 'rabin', '815f4c0c-b27c-4a4b-a598-518d47cb5027', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-14 19:03:12', '2025-10-14 19:03:12'),
('41ba934e-4e92-4961-afa5-dce520617501', 'rabin', '815f4c0c-b27c-4a4b-a598-518d47cb5027', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'completed', NULL, NULL, '2025-10-14 19:03:29', '2025-10-14 19:03:29'),
('348a5251-4354-41ce-9a5e-1fca70707de6', 'rabin', '146690b0-5551-47aa-bdbd-1a0b1da20442', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-14 19:04:51', '2025-10-14 19:04:51'),
('ea01974e-3136-499a-8330-9f8622cdab22', 'rabin', '146690b0-5551-47aa-bdbd-1a0b1da20442', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'completed', NULL, NULL, '2025-10-14 19:05:04', '2025-10-14 19:05:04'),
('22273f81-3e24-4199-a7b6-185921519561', 'rabin', 'bb4af0df-a466-46e6-9e99-3cc4e40a8b6e', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'ceo-001', 'completed', NULL, NULL, '2025-10-14 19:06:05', '2025-10-14 19:06:05'),
('aa0cbecc-7c23-4694-bf02-d3c1455c285e', 'rabin', 'bb4af0df-a466-46e6-9e99-3cc4e40a8b6e', NULL, 'call', 'تماس تستی', 'توضیحات تماس', NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'completed', NULL, NULL, '2025-10-14 19:06:12', '2025-10-14 19:06:12');

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `resource_type` varchar(50) NOT NULL,
  `resource_id` varchar(36) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alerts`
--

CREATE TABLE `alerts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `type` enum('info','warning','error','success') NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `user_id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `deal_id` varchar(36) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `is_dismissed` tinyint(1) DEFAULT 0,
  `action_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `backup_history`
--

CREATE TABLE `backup_history` (
  `id` int(11) NOT NULL,
  `type` enum('manual','automatic') NOT NULL,
  `status` enum('in_progress','completed','failed') NOT NULL,
  `file_path` text DEFAULT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `error_message` text DEFAULT NULL,
  `email_recipient` varchar(255) DEFAULT NULL,
  `initiated_by` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendar_events`
--

CREATE TABLE `calendar_events` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `all_day` tinyint(1) DEFAULT 0,
  `type` enum('meeting','call','reminder','task') DEFAULT 'meeting',
  `location` varchar(255) DEFAULT NULL,
  `status` enum('confirmed','tentative','cancelled') DEFAULT 'confirmed',
  `customer_id` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `calendar_events`
--

INSERT INTO `calendar_events` (`id`, `tenant_key`, `title`, `description`, `start_date`, `end_date`, `all_day`, `type`, `location`, `status`, `customer_id`, `created_by`, `created_at`, `updated_at`) VALUES
('ecd5d77b-e251-4d44-96dc-d970c04d1497', 'rabin', 'تست', NULL, '2025-10-05 18:01:00', '2025-10-05 19:01:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-04 18:01:32', '2025-10-04 18:01:32'),
('1cb21aa2-07f9-481d-a615-705584e86da5', 'rabin', 'تست', NULL, '2025-10-04 18:01:00', '2025-10-04 19:01:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-04 18:01:37', '2025-10-04 18:01:37'),
('fb6210b0-49b2-4f11-a5f6-ba67a4103d3b', 'rabin', 'تستس', NULL, '2025-10-13 17:35:00', '2025-10-13 18:35:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-11 17:35:13', '2025-10-11 17:35:13'),
('82c805f2-5ba9-4134-b16b-2a546854bd05', 'rabin', 'متشز', NULL, '2025-10-13 17:35:00', '2025-10-13 18:35:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-11 17:35:21', '2025-10-11 17:35:21'),
('0a068c78-5825-4af2-9c68-4f5b956b492c', 'rabin', 'سب', NULL, '2025-09-30 17:35:00', '2025-09-30 18:35:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-11 17:35:39', '2025-10-11 17:35:39'),
('2b9277e1-9e39-486d-961c-702bb521f5a7', 'rabin', 'تقویم', NULL, '2025-10-15 17:55:00', '2025-10-15 18:55:00', 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-10-11 17:55:22', '2025-10-11 17:55:22');

-- --------------------------------------------------------

--
-- Table structure for table `chat_conversations`
--

CREATE TABLE `chat_conversations` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `title` varchar(255) DEFAULT NULL,
  `type` enum('direct','group','support') DEFAULT 'direct',
  `description` text DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_message_id` varchar(36) DEFAULT NULL,
  `last_message` text DEFAULT NULL,
  `last_message_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(36) NOT NULL,
  `participant_1_id` varchar(36) DEFAULT NULL,
  `participant_2_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_groups`
--

CREATE TABLE `chat_groups` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_group_members`
--

CREATE TABLE `chat_group_members` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `group_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chat_messages`
--

CREATE TABLE `chat_messages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `conversation_id` varchar(36) NOT NULL,
  `sender_id` varchar(36) NOT NULL,
  `receiver_id` varchar(36) NOT NULL,
  `message` text NOT NULL,
  `message_type` enum('text','image','file','system') DEFAULT 'text',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `read_at` timestamp NULL DEFAULT NULL,
  `is_edited` tinyint(1) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `edited_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT current_timestamp(),
  `reply_to_id` varchar(36) DEFAULT NULL,
  `file_url` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_messages`
--

INSERT INTO `chat_messages` (`id`, `tenant_key`, `conversation_id`, `sender_id`, `receiver_id`, `message`, `message_type`, `created_at`, `read_at`, `is_edited`, `is_deleted`, `edited_at`, `sent_at`, `reply_to_id`, `file_url`, `file_name`, `file_size`) VALUES
('fd32c952-ef7f-4a7b-a593-1e42dc8603b0', 'rabin', 'conv-9f6b90b9-0723-4261-82c3-cd54e21', 'ceo-001', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'درود بر شما', 'text', '2025-10-01 16:17:28', NULL, 0, 0, NULL, '2025-10-01 16:17:28', NULL, NULL, NULL, NULL),
('1bb41325-68b7-4cd1-a847-f951a540b91b', 'rabin', 'conv-9f6b90b9-0723-4261-82c3-cd54e21', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'ceo-001', 'سلام و درود', 'text', '2025-10-01 16:26:41', NULL, 0, 0, NULL, '2025-10-01 16:26:41', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_participants`
--

CREATE TABLE `chat_participants` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `conversation_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp(),
  `last_seen_at` timestamp NULL DEFAULT current_timestamp(),
  `last_seen_message_id` varchar(36) DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chat_participants`
--

INSERT INTO `chat_participants` (`id`, `tenant_key`, `conversation_id`, `user_id`, `role`, `joined_at`, `last_seen_at`, `last_seen_message_id`, `is_muted`) VALUES
('0f80e757-75b9-11f0-9338-e4580b2fcc71', 'rabin', 'cnv-me5cge1q', 'ceo-001', 'admin', '2025-08-10 07:10:13', '2025-08-10 07:10:13', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `chat_reactions`
--

CREATE TABLE `chat_reactions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `companies`
--

CREATE TABLE `companies` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `size` enum('startup','small','medium','large','enterprise') DEFAULT 'small',
  `website` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'ایران',
  `postal_code` varchar(20) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `logo_url` varchar(500) DEFAULT NULL,
  `status` enum('active','inactive','prospect','customer','partner') DEFAULT 'prospect',
  `rating` decimal(2,1) DEFAULT 0.0,
  `annual_revenue` decimal(15,2) DEFAULT NULL,
  `employee_count` int(11) DEFAULT NULL,
  `founded_year` year(4) DEFAULT NULL,
  `tags` longtext DEFAULT NULL CHECK (json_valid(`tags`)),
  `custom_fields` longtext DEFAULT NULL CHECK (json_valid(`custom_fields`)),
  `assigned_to` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `contacts`
--

CREATE TABLE `contacts` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
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

INSERT INTO `contacts` (`id`, `tenant_key`, `company_id`, `first_name`, `last_name`, `job_title`, `department`, `email`, `phone`, `mobile`, `linkedin_url`, `twitter_url`, `address`, `city`, `country`, `postal_code`, `birth_date`, `notes`, `tags`, `custom_fields`, `avatar_url`, `status`, `is_primary`, `source`, `last_contact_date`, `assigned_to`, `created_by`, `created_at`, `updated_at`) VALUES
('cnt-mg9gtlhu', 'rabin', NULL, 'تستی', 'تاستی', 'شی', 'یش', 'شی@m.com', '23', '432', 'شی', 'شی', 'شی', 'شی', 'اشییران', NULL, NULL, 'شی', NULL, NULL, NULL, 'active', 0, 'other', NULL, '9f6b90b9-0723-4261-82c3-cd54e21d3995', '9f6b90b9-0723-4261-82c3-cd54e21d3995', '2025-10-02 10:12:57', '2025-10-02 10:12:57'),
('67e878ad-2083-459a-87fc-af3441d4e99a', 'rabin', NULL, 'علی', 'علی', 'مدیر عامل', 'مدیریت', 'ali.ahmadi@tejarat-pars.com', '02188776655', '09121234567', 'https://linkedin.com/in/ali-ahmadi', NULL, 'خیابان ولیعصر پلاک 123', 'تهران', 'Iran', NULL, NULL, 'تصمیم‌گیرنده اصلی شرکت', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('f2997f8a-5f76-49c3-b87e-72aeb27b0e2d', 'rabin', NULL, 'سارا', 'سارا', 'مدیر فروش', 'فروش', 'sara.mohammadi@fanavar-novin.ir', '02177665544', '09123456789', 'https://linkedin.com/in/sara-mohammadi', NULL, 'خیابان آزادی پلاک 456', 'تهران', 'Iran', NULL, NULL, 'مسئول خرید نرم‌افزار', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('2596a750-28c3-4608-a60a-4c48d1ff9954', 'rabin', NULL, 'رضا', 'رضا', 'مدیر خرید', 'خرید', 'reza.karimi@petro-sanat.com', '07632221100', '09171234567', NULL, NULL, 'شهرک صنعتی شیراز', 'شیراز', 'Iran', NULL, NULL, 'نیاز به پیگیری مستمر', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('2b7161a9-2673-4e56-927d-d48360c3b377', 'rabin', NULL, 'مریم', 'مریم', 'مدیر بازاریابی', 'بازاریابی', 'maryam.rezaei@aseman-market.ir', '02155443322', '09122223333', 'https://linkedin.com/in/maryam-rezaei', 'https://twitter.com/maryam_rezaei', 'میدان ونک', 'تهران', 'Iran', NULL, NULL, 'علاقه‌مند به کمپین‌های تبلیغاتی', NULL, NULL, NULL, 'active', 0, 'social_media', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('7bb535f5-97f8-4722-8e35-608d5d7d58ce', 'rabin', NULL, 'حسین', 'حسین', 'مهندس پروژه', 'فنی', 'hosein.nouri@bonyan-sazeh.com', '03133445566', '09131112222', NULL, NULL, 'خیابان چهارباغ', 'اصفهان', 'Iran', NULL, NULL, 'متخصص در پروژه‌های بزرگ', NULL, NULL, NULL, 'active', 0, 'trade_show', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('e00b3478-5ba4-4a65-a13a-f14eb592dff1', 'rabin', NULL, 'فاطمه', 'فاطمه', 'مدیر مالی', 'مالی', 'fateme.hosseini@sepehr-trade.ir', '02166778899', '09124445555', 'https://linkedin.com/in/fateme-hosseini', NULL, 'خیابان انقلاب پلاک 789', 'تهران', 'Iran', NULL, NULL, 'مسئول تصمیمات مالی', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('896e3aab-f278-4f3c-97bf-6e356ffb076e', 'rabin', NULL, 'محمد', 'محمد', 'مدیر تولید', 'تولید', 'mohammad.alizadeh@noavaran.com', '05138887766', '09155556666', NULL, NULL, 'شهرک صنعتی مشهد', 'مشهد', 'Iran', NULL, NULL, 'متخصص بهینه‌سازی تولید', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('85a5cc2c-ba0c-4583-bbb9-426d05185cad', 'rabin', NULL, 'زهرا', 'زهرا', 'کارشناس فنی', 'پشتیبانی', 'zahra.kazemi@pars-service.ir', '02144556677', '09127778888', 'https://linkedin.com/in/zahra-kazemi', NULL, 'خیابان شریعتی پلاک 321', 'تهران', 'Iran', NULL, NULL, 'کارشناس ارشد فنی', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('d2868619-56a5-43ee-8509-d4bfe973ba91', 'rabin', NULL, 'امیر', 'امیر', 'مهندس طراحی', 'طراحی', 'amir.mahmoudi@arya-eng.com', '03155667788', '09138889999', NULL, NULL, 'خیابان هزار جریب', 'اصفهان', 'Iran', NULL, NULL, 'متخصص طراحی صنعتی', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('0a9d474b-99f3-4bcc-a5bb-99bb5de07f80', 'rabin', NULL, 'نرگس', 'نرگس', 'مدیر لجستیک', 'لجستیک', 'narges.sadeghi@iran-distribution.ir', '02133445566', '09121110000', 'https://linkedin.com/in/narges-sadeghi', NULL, 'خیابان جمهوری پلاک 555', 'تهران', 'Iran', NULL, NULL, 'مسئول زنجیره تامین', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('3db536dc-52c0-4f70-ad31-183be2d91094', 'rabin', NULL, 'پویا', 'پویا', 'مدیر IT', 'فناوری اطلاعات', 'pouya.rahimi@tejarat-pars.com', '02188776655', '09122221111', NULL, NULL, 'خیابان ولیعصر پلاک 123', 'تهران', 'Iran', NULL, NULL, 'مسئول زیرساخت IT', NULL, NULL, NULL, 'active', 0, 'website', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('68618510-3980-4271-9cb7-9d9ff3f5c844', 'rabin', NULL, 'لیلا', 'لیلا', 'کارشناس منابع انسانی', 'منابع انسانی', 'leila.jafari@fanavar-novin.ir', '02177665544', '09123332222', 'https://linkedin.com/in/leila-jafari', NULL, 'خیابان آزادی پلاک 456', 'تهران', 'Iran', NULL, NULL, 'مسئول استخدام', NULL, NULL, NULL, 'active', 0, 'social_media', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('693b044d-c600-4d26-b2bf-ac16259daab6', 'rabin', NULL, 'سعید', 'سعید', 'مدیر کیفیت', 'کنترل کیفیت', 'saeed.mousavi@petro-sanat.com', '07632221100', '09174443333', NULL, NULL, 'شهرک صنعتی شیراز', 'شیراز', 'Iran', NULL, NULL, 'مسئول استانداردهای کیفی', NULL, NULL, NULL, 'active', 0, 'trade_show', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('aaac23d1-8fed-485e-b8bb-0115fafd52a2', 'rabin', NULL, 'نازنین', 'نازنین', 'مدیر فروش منطقه‌ای', 'فروش', 'nazanin.amini@aseman-market.ir', '02155443322', '09125554444', 'https://linkedin.com/in/nazanin-amini', NULL, 'میدان ونک', 'تهران', 'Iran', NULL, NULL, 'مسئول فروش شمال تهران', NULL, NULL, NULL, 'active', 0, 'referral', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('84559171-b78e-4256-96ab-265d8fd3a135', 'rabin', NULL, 'کامران', 'کامران', 'مدیر پروژه', 'مدیریت پروژه', 'kamran.safari@bonyan-sazeh.com', '03133445566', '09136667777', NULL, NULL, 'خیابان چهارباغ', 'اصفهان', 'Iran', NULL, NULL, 'مدیر پروژه‌های ساختمانی', NULL, NULL, NULL, 'active', 0, 'cold_call', NULL, 'ceo-001', 'ceo-001', '2025-10-02 14:34:38', '2025-10-02 14:34:38'),
('cnt-mgqx84jw', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468054479@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-10-14 15:24:14', '2025-10-14 15:24:14'),
('cnt-mgqxemek', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468357560@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-10-14 15:29:17', '2025-10-14 15:29:17'),
('cnt-mgqxes2n', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468364914@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 15:29:24', '2025-10-14 15:29:25'),
('cnt-mgqxjmu5', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468591389@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-10-14 15:33:11', '2025-10-14 15:33:11'),
('cnt-mgqxk096', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468608789@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 15:33:28', '2025-10-14 15:33:28'),
('cnt-mgqxlria', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468690759@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-10-14 15:34:50', '2025-10-14 15:34:50'),
('cnt-mgqxm1na', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468703911@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 15:35:03', '2025-10-14 15:35:04'),
('cnt-mgqxnco7', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468764843@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-10-14 15:36:04', '2025-10-14 15:36:04'),
('cnt-mgqxni65', 'rabin', NULL, 'علی', 'احمدی', 'مدیر ارشد فروش', NULL, 'contact1760468771980@example.com', '09123456789', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 15:36:12', '2025-10-14 15:36:12');

-- --------------------------------------------------------

--
-- Table structure for table `contact_activities`
--

CREATE TABLE `contact_activities` (
  `id` varchar(36) NOT NULL,
  `contact_id` varchar(36) NOT NULL,
  `company_id` varchar(36) DEFAULT NULL,
  `activity_type` enum('call','email','meeting','note','task','deal','support') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('completed','pending','cancelled') DEFAULT 'completed',
  `priority` enum('low','medium','high','urgent') DEFAULT 'medium',
  `due_date` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `duration_minutes` int(11) DEFAULT NULL,
  `outcome` enum('successful','no_answer','follow_up_needed','not_interested','other') DEFAULT NULL,
  `next_action` text DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `company_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT 'Iran',
  `postal_code` varchar(20) DEFAULT NULL,
  `industry` varchar(100) DEFAULT NULL,
  `company_size` enum('1-10','11-50','51-200','201-1000','1000+') DEFAULT NULL,
  `annual_revenue` decimal(15,2) DEFAULT NULL,
  `status` enum('active','inactive','follow_up','rejected','prospect','customer') DEFAULT 'prospect',
  `segment` enum('enterprise','small_business','individual') DEFAULT 'small_business',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `assigned_to` varchar(36) DEFAULT NULL,
  `total_tickets` int(11) DEFAULT 0,
  `satisfaction_score` decimal(3,2) DEFAULT NULL,
  `potential_value` decimal(15,2) DEFAULT NULL,
  `actual_value` decimal(15,2) DEFAULT 0.00,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_interaction` timestamp NULL DEFAULT NULL,
  `last_contact_date` timestamp NULL DEFAULT NULL,
  `contact_attempts` int(11) DEFAULT 0,
  `source` varchar(100) DEFAULT NULL COMMENT 'منبع کسب مشتری',
  `tags` longtext DEFAULT NULL COMMENT 'برچسب‌های مشتری' CHECK (json_valid(`tags`)),
  `custom_fields` longtext DEFAULT NULL COMMENT 'فیلدهای سفارشی' CHECK (json_valid(`custom_fields`)),
  `last_activity_date` timestamp NULL DEFAULT NULL COMMENT 'آخرین فعالیت',
  `lead_score` int(11) DEFAULT 0 COMMENT 'امتیاز مشتری',
  `lifecycle_stage` enum('subscriber','lead','marketing_qualified_lead','sales_qualified_lead','opportunity','customer','evangelist','other') DEFAULT 'lead' COMMENT 'مرحله چرخه حیات مشتری'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `tenant_key`, `first_name`, `last_name`, `company_name`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`, `source`, `tags`, `custom_fields`, `last_activity_date`, `lead_score`, `lifecycle_stage`) VALUES
('96d410bd-772e-49b5-b7bb-c251f04b3d1a', 'rabin', NULL, NULL, 'امین سلیمانی', 'امین سلیمانی', NULL, '9172081370', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cb45c845-070c-40cc-9cf1-8010477c42e1', 'rabin', NULL, NULL, 'علی ملاحی کلاهی', 'علی ملاحی کلاهی', NULL, '9382931877', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('153264f4-f90b-4f65-8a81-f225d37696d5', 'rabin', NULL, NULL, 'حسن دلاوری', 'حسن دلاوری', NULL, '9173659632', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c6d58108-17b8-4f10-82d4-31487a22ada5', 'rabin', NULL, NULL, 'شرکت تعاونی غاز بروران تم بابل', 'غاز پروران تم بابل', NULL, '9217611619', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bc07db63-bd52-4928-b883-e26736606437', 'rabin', NULL, NULL, 'مهدی زائری', 'مهدی زائری', NULL, '9170302971', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5e5c00f5-b71a-4710-a6e2-7526262ecad0', 'rabin', NULL, NULL, 'ابراهیم درویشی', 'ابراهیم درویشی نخل ابراهیمی', NULL, '9335990201', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('105207dd-1493-4a73-b233-566e736e29e5', 'rabin', NULL, NULL, 'محمد درویشی ماشهران', 'محمد درویشی', NULL, '9171651684', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4e71fd01-4b9d-4f00-96c4-0f3fc0433fa3', 'rabin', NULL, NULL, 'محمد علی سلیمانی', 'محمدعلی سلیمانی', NULL, '9173650220', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2bff6984-d93c-4625-bf90-1bbbe987f3ad', 'rabin', NULL, NULL, 'هدایت اله شعبانی', 'هدایت اله شعبانی شمیلی', NULL, '9173651032', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('50e2aeee-6247-4bf3-ab0f-3084c977021d', 'rabin', NULL, NULL, 'حجر هرمزی', 'حجر هرمزی', NULL, '9171654326', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a00d000d-2095-4349-9627-0fa9c93e7f4c', 'rabin', NULL, NULL, 'حسن دلاوری فرد باغی', 'حسن دلاوری فردباغی', NULL, '9394674818', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f57e2672-90ae-45e5-af7a-ed021bd3fc6f', 'rabin', NULL, NULL, 'شهریار زاهدی', 'شهریار زاهدی دهوئی', NULL, '9037314736', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7f443ccd-58b6-4007-9bc5-504b09ab1efe', 'rabin', NULL, NULL, 'خلیل خرمی', 'خلیل خرمی', NULL, '9177654990', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c58f214c-386b-46ec-ac43-76b2fd201043', 'rabin', NULL, NULL, 'محمودی1', 'محمودی', NULL, '9367101365', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ef2d72cd-d014-4bb5-a302-298841b797be', 'rabin', NULL, NULL, 'ابراهیم غفوری عباسی', 'ابراهیم غفوری عباسی', NULL, '9171976056', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f6ab4418-968a-43bf-a098-c67490031ab6', 'rabin', NULL, NULL, 'آقای حیدری', 'آقای حیدری', NULL, '9177651904', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8b39aa10-7b08-4bc3-a772-fe6522139ace', 'rabin', NULL, NULL, 'زهرا خرمی', 'زهرا خرمی', NULL, '9171668421', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('734c05a6-2725-4614-9aee-9601306d2a59', 'rabin', NULL, NULL, 'عبدالرسول حاتمی مازغی', 'عبدالرسول حاتمی مازغی', NULL, '9173658099', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('be3212ae-8231-4fac-ad25-72efa1a66ff1', 'rabin', NULL, NULL, 'علیرضا میرزایی', 'علیرضا میرزایی', NULL, '9173650213', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3b9fa86b-a7bd-4fa3-8cbb-83f728370d61', 'rabin', NULL, NULL, 'قدرت قسمتی شعار', 'قدرت قسمتی شعار', NULL, '9930126110', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c01ae1a4-a94a-43a1-8f74-3be8991c1f09', 'rabin', NULL, NULL, 'امین شاکری بلیلی', 'امین شاکری بلیلی', NULL, '9156407076', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('997771fd-828e-4f1d-8d93-4c6aedfe40e4', 'rabin', NULL, NULL, 'حسین پور هادی', 'حسین پور هادی', NULL, '9171975009', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('35b05080-219e-42e9-8c2f-86053e4f0bdc', 'rabin', NULL, NULL, 'صالح سالاری', 'صالح سالاری', NULL, '9172081082', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0b455be5-aab3-4a59-a2af-87487198a8ca', 'rabin', NULL, NULL, 'فرامرز بهرامی', 'فرامز بهرامی', NULL, '9171651332', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fe582af3-7e3c-4f4a-9fbf-5e9126bb0921', 'rabin', NULL, NULL, 'فاطمه اسلامی نخلی', 'محمد اسلامی نخلی', NULL, '9173609030', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4abdf630-bd58-4b2b-bfd6-c76fee73ac4f', 'rabin', NULL, NULL, 'مصطفی ذاکری نیا', 'مصطفی ذاکرانی نیا', NULL, '9173654595', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ab7b51e1-eba8-459f-9bee-e63b104bebb4', 'rabin', NULL, NULL, 'عبداله رنجر', 'عبداله رنجبر', NULL, '9179752047', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3953e0f1-193b-4771-aa17-eee88a1fe128', 'rabin', NULL, NULL, 'مرغداری متین', 'عباس گلزاری', NULL, '9373691545', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('207d91f7-9a91-4d54-a1b7-eadb6c9d58f5', 'rabin', NULL, NULL, 'عمره صمیمی دهوئی', 'عمره صمیمی دهوئی', NULL, '9176567282', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('397f9ef3-9858-4379-9b14-ca3ac51f97cc', 'rabin', NULL, NULL, 'حسین درویشی نخل ابراهیمی', 'حسین درویشی نخل ابراهیمی', NULL, '9381610442', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d79afde4-7b7d-4984-b535-ce2ae17a6840', 'rabin', NULL, NULL, 'عباس کریمی', 'عباس کریمی', NULL, '9177654431', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0802e844-9169-4e47-824f-ef964f988284', 'rabin', NULL, NULL, 'ذبیح اله هرمزی', 'ذبیح اله هرمزی', NULL, '9173650131', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('435de88e-8d8a-4315-b794-b4cb40543eeb', 'rabin', NULL, NULL, 'حسین اسماعیل نژاد', 'حسین اسماعیل نژاد', NULL, '9171668213', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3934f965-a39b-4d29-a19f-d0ab081ce397', 'rabin', NULL, NULL, 'علیرضا میرزایی فارم دمشهر', 'علیرضا میرزایی', NULL, '9365524460', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('76b7026b-47a4-4fd4-8893-73b9eee00112', 'rabin', NULL, NULL, 'افسانه رفیعی بندری', 'افسانه رفیعی بندری', NULL, '9171676890', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('03f9077c-e7ee-424d-893e-9ed43164d2e3', 'rabin', NULL, NULL, 'سید مرتضی موسوی سید محمد', 'سیدمرتضی موسوی حکمی', NULL, '9173679675', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3737aaa3-5bbc-49e4-8e9d-b5a95f6cb9ae', 'rabin', NULL, NULL, 'فرشید ابفشان', 'فرشید آبفشان', NULL, '9173655706', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3047e107-6d50-4a63-9a0f-5ecabb9deb39', 'rabin', NULL, NULL, 'ابوذر درویشی نخل ابراهیمی', 'ابوذر درویشی نخل ابراهیمی', NULL, '9171977306', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a84201c7-779e-45b3-903f-5012fbef2d53', 'rabin', NULL, NULL, 'مریم مرادی بنذرکی', 'مریم مرادی بنذرکی', NULL, '9171654298', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('72831aed-671b-4010-90f0-2b3a5bc1083b', 'rabin', NULL, NULL, 'محمد شادابی', 'محمد شادابی', NULL, '9173650797', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bd1f4523-4f95-4b14-92dc-e19210120272', 'rabin', NULL, NULL, 'بهرام امیری', 'بهرام امیری نژاد', NULL, '9171651378', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('65876f48-c3e4-4f42-8ded-5a9c29420899', 'rabin', NULL, NULL, 'احمد رمضانی پور', 'رامین رمضانی پور', NULL, '9177652716', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('61ac0c9b-172f-4c50-9c31-3f10124c86ea', 'rabin', NULL, NULL, 'بهنام قاسمی', 'بهنام قاسمی', NULL, '9171973285', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9a36d9b4-a137-4b10-848c-ed07f5bc2911', 'rabin', NULL, NULL, 'کورش اسدی', 'کورش اسدی', NULL, '9177653643', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cc2b6486-d0a0-4151-acd3-68ace5e9a91a', 'rabin', NULL, NULL, 'محمد امین ذاکری فارم کریان', 'محمد امین ذاکری حکمی', NULL, '9371812929', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bb0d8241-30d7-46ee-a647-ede5740f74d0', 'rabin', NULL, NULL, 'محمد امین ذاکری', 'محمد امین ذاکری حکمی', NULL, '9173657069', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ee414aa8-890d-4033-9772-0fc423063775', 'rabin', NULL, NULL, 'مرغداری گمشادپور', 'صفورا گمشادپور', NULL, 'Aa09171654122', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d6515261-1e78-4eac-82f7-65bb5850e141', 'rabin', NULL, NULL, 'رضا درویشی نخل ابراهیمی', 'رضا درویشی نخل ابراهیمی', NULL, '9171665081', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8a8eacdf-3a07-45f1-8f0b-65e8af4ae102', 'rabin', NULL, NULL, 'اسلامی', 'حسین اسلامی', NULL, '9389434747', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f7845f76-0261-4399-bf5d-b95c30ffa37a', 'rabin', NULL, NULL, 'مرغداری محمد زرنگاری', 'محمد زرنگاری', NULL, 'm09173650020', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('23f39c4b-05bd-46d9-95ae-69b6cf88784e', 'rabin', NULL, NULL, 'معصومه رنجبری کلوئی', 'معصومه رنجبری کلوئی', NULL, 'A09171669728', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('34366f51-c257-46e8-ab28-0450d4c99908', 'rabin', NULL, NULL, 'محمد رنجبری پازیارتی مرغ گوشتی', 'محمد رنجبری پازیارتی', NULL, '9171630704', NULL, NULL, 'میناب', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('93f303af-89b0-4e87-a105-81d80bfba590', 'rabin', NULL, NULL, 'امین چمل پور', 'امین چمل پور', NULL, '9171654306', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('db527049-09c9-41e0-8d62-3ad28c23b0fd', 'rabin', NULL, NULL, 'مرغداری شهرام رستمی', 'شهرام رستمی', NULL, '9361650715', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3c0d430-30b9-45fe-bfd9-1e3aeaf1b079', 'rabin', NULL, NULL, 'مصطفی قلندری', 'مصطفی قلندری', NULL, '9171970815', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3342a00f-2da0-4244-ae62-306702536621', 'rabin', NULL, NULL, 'جواد اسمعیلی نژاد', 'جواد اسماعیلی نژاد', NULL, '9171654523', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('939c69c6-f91f-4a19-964f-798f752d8216', 'rabin', NULL, NULL, 'محمد قلندری', 'محمد قلندری', NULL, '9173669120', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6e7c9c5e-6797-4f33-969f-4f8983b09487', 'rabin', NULL, NULL, 'درویش فولادی', 'درویش فولادی', NULL, '9171654589', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e399d5c3-414f-4d68-b949-a6a100b20ac5', 'rabin', NULL, NULL, 'خالد ریئسی', 'خالد رئیسی', NULL, '9164193911', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5c2438f6-8ca3-4234-b1eb-bec785c87788', 'rabin', NULL, NULL, 'حمید میرزائی', 'حمید میرزائی', NULL, '9904608142', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bda9db98-1c4a-44d9-b059-0d1d7e932c40', 'rabin', NULL, NULL, 'عنایت اله شعبانی', 'عنایت اله شعبانی شمیلی', NULL, '9173651420', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6a344999-a56b-4996-b25d-845b5a513aaa', 'rabin', NULL, NULL, 'محمد(حسن) قلندری', 'محمد قلندری', NULL, '9917239569', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ddd5bda2-4140-4d5f-b41a-0e38018c385f', 'rabin', NULL, NULL, 'محمد دریانوردی کوهستک', 'محمد دریانوردی کوهستک', NULL, '9023033232', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6da8cef5-5b0c-495e-875a-17fc39228234', 'rabin', NULL, NULL, 'شرکت تعاونی تولیدی توزیعی نوآوران کشت و صنعت بسیج شهرستان سیریک', 'آقای ذاکری', NULL, '9171660473', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('998568e0-ea2a-4a61-811e-4f5bea4614d4', 'rabin', NULL, NULL, 'مزرعه مرغ گوشتی طاهرزاده', 'هاشم طاهرزاده', NULL, '9383664010', NULL, NULL, 'سیریک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('486ba42f-4a05-48ce-8de0-f0bd95b6feb4', 'rabin', NULL, NULL, 'محمد شمالی هرمزی', 'محمد شمالی هرمزی', NULL, '9173657218', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0330eadd-072b-47ce-80c1-8038d0464c3f', 'rabin', NULL, NULL, 'ایرج رهبری', 'ایرج رهبری', NULL, '9171663038', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('63be91bb-a6fe-4615-8dfa-6f575587b346', 'rabin', NULL, NULL, 'سید جواد علوی', 'سید جواد علوی', NULL, '9179789137', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('564506ce-75fd-4255-be55-b514a10176e4', 'rabin', NULL, NULL, 'احمد محمودی نودژ', 'احمد محمودی نودژ', NULL, '9173654548', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5dcf789b-b345-434b-800c-59f5f352e468', 'rabin', NULL, NULL, 'نسرین ذاکری', 'نسرین ذاکری', NULL, '9366304705', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('66c29975-3931-406b-a1a8-0f57353ecafc', 'rabin', NULL, NULL, 'جعفر جنگانی پور', 'جعفر جنگانی پور', NULL, 'g09175786471', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6bf9fa21-be97-4940-80d0-6911aca51774', 'rabin', NULL, NULL, 'فرید ساعدپناه', 'فرید ساعدپناه', NULL, '9171660042', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0b83d61b-3246-4c2a-9a53-4cd05b04b7fc', 'rabin', NULL, NULL, 'مصطفی احمدی', 'مصطفی احمدی', NULL, '9171669824', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('37fd8018-5c14-488a-a1e1-7d91b3f1d33b', 'rabin', NULL, NULL, 'محمد ارجمند', 'محمد ارجمند', NULL, '9173652159', NULL, NULL, 'رودان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0a6ccc35-78f3-4650-9936-69ae618526d8', 'rabin', NULL, NULL, 'علی مرادی (خمیر)', 'علی مرادی', NULL, '9173616144', NULL, NULL, 'خمیر', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9c94d967-a7a9-4005-90ad-1cd78634c5b6', 'rabin', NULL, NULL, 'محمد درویشی', 'محمد درویشی', NULL, '9171595587', NULL, NULL, 'خمیر', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7a38580e-aaf6-4333-b794-f4ae1b8fb6f7', 'rabin', NULL, NULL, 'نساء سیار', 'نساء سیار', NULL, '9174677301', NULL, NULL, 'خمیر', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9fff39a1-cf1c-4402-9aef-bea742be964e', 'rabin', NULL, NULL, 'غلامرضا قزاآنی', 'محمد توفیقی سورو', NULL, '9176255294', NULL, NULL, 'خمیر', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('03bc09e2-ac5c-453b-880b-64fad092b272', 'rabin', NULL, NULL, 'شرکت مرغداری رنگین کمان باغات', 'شرکت مرغداری رنگین کمان باغات', NULL, '9172894027', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f49a2cd7-56e7-4dcc-8c8c-67e8afe17dba', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری نگین', 'عباسی', NULL, '9909613767', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3baaa614-ea79-4c0c-9fe5-a5272957a095', 'rabin', NULL, NULL, 'شرکت مرغداری هرمز طیور', 'شرکت مرغداری هرمز طیور شمیل', NULL, '9365443818', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('90ffe3b1-c8dc-47b4-8096-e1fc2a6e94e3', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری 333', 'حسن زاده', NULL, '9176461937', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1579b06f-65a8-4df0-8c9b-d8205dd40221', 'rabin', NULL, NULL, 'محمد بذرکار', 'محمد بذرکار', NULL, '9131452274', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a28dbd8d-7319-4a92-9f6c-6bf01872480a', 'rabin', NULL, NULL, 'منظر شمسایی گهکانی', 'منظر شمسائی گهکانی', NULL, '9173616419', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3a43adb7-c422-4bd2-9f6f-01e8292b1a46', 'rabin', NULL, NULL, 'عبدالرحمن آشوری', 'عبدالرحمن آشوری', NULL, '933539944', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ea6c5910-549c-42c8-ae3d-8478253064be', 'rabin', NULL, NULL, 'غلامرضا ناظری', 'غلامرضا ناظری', NULL, '9172867036', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2702b39f-313d-41f5-8670-008af5b722e2', 'rabin', NULL, NULL, 'شرکت تعاونی چکاوک فارغان', 'ترابی', NULL, '9173615897', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('caca96aa-c3e6-4247-8ab0-41e26e852082', 'rabin', NULL, NULL, 'علی شریفی زاده شمیلی', 'علی شریفی زاده شمیلی', NULL, '9171574088', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('69ca2220-3d50-49e8-bb99-0578a9afb14d', 'rabin', NULL, NULL, 'محسنی باغستانی', 'محسن محسنی باغستانی', NULL, '9178324540', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cd7e5ea6-3c8b-4791-a34e-5cdcb78dcd97', 'rabin', NULL, NULL, 'عباس میرحسینی', 'عباس میرحسینی', NULL, '9176555992', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('57f76999-dfb9-45f6-b5b5-8b3d83919f12', 'rabin', NULL, NULL, 'محمد علی بهروزی نسب', 'محمدعلی بهروزی نسب', NULL, '9171320143', NULL, NULL, 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('96dcfdb9-5e79-4aa1-a725-9ee489f7ba43', 'rabin', NULL, NULL, 'محمد نور نوابی سورکی', 'محمدنور نوابی سورکی', NULL, '9177650844', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('81fc0d5e-7e57-4820-b6ac-09cbba5fa477', 'rabin', NULL, NULL, 'علی قربان پور', 'علی قربان پور', NULL, '9171612259', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ea8f2734-2552-4bb8-bfb2-e9fa2d6e509b', 'rabin', NULL, NULL, 'مسعود داوری', 'مسعود داوری', NULL, '9171635062', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9f6ee5b0-b667-4ad3-a4fa-063324a946d9', 'rabin', NULL, NULL, 'یاسین میهن خواه', 'یاسین میهن خواه', NULL, '9171970954', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7d8b2c5d-e82a-4437-b1f9-f182331559e5', 'rabin', NULL, NULL, 'سید رضوان قتالی', 'سید رضوان قتالی', NULL, '9173661019', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d513e82a-0ae6-432e-ae14-a602ca834b96', 'rabin', NULL, NULL, 'ابراهیم میهن خواه', 'ابراهیم میهن خواه', NULL, '9177682041', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5b0396b6-4a6e-45b9-bcc7-68464c36cbf2', 'rabin', NULL, NULL, 'رحمت پاخیره', 'رحمت پاخیره', NULL, '9171654027', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('edfd443c-3af9-41bf-8b8f-721c15bd253f', 'rabin', NULL, NULL, 'تولید مرغ گوشتی امدادی', 'تاج فیروز', NULL, '9929542055', NULL, NULL, 'جاسک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3a1ba434-09e0-4872-ba3f-df8ec3591ba7', 'rabin', NULL, NULL, 'مرغداری گوشتی ناصربلوچی', 'ناصر بلوچی', NULL, '9173641840', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('70764bcb-091f-4575-a7ea-f83ffdc405a4', 'rabin', NULL, NULL, 'مرغداری علی محمدیان', 'محمود کاظم زاده', NULL, '9177822065', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('68ce1ec3-9b27-4315-a9be-3ca1a7c22b90', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری گوهر بهده', 'بلوچی', NULL, '9179478851', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('49714fe4-e3b6-454e-b53c-b7ef23033436', 'rabin', NULL, NULL, 'محد رضا دسترس', 'محمدرضا دست رس', NULL, '9172984866', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('21de9ff4-9928-429f-9ec7-bac980446246', 'rabin', NULL, NULL, 'شرکت تعاونی بهاران ساحل', 'افشار', NULL, '9171622565', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3adcc0c-14c9-4f95-b80a-9f4ff133fd95', 'rabin', NULL, NULL, 'محمد رئوف دهقان', 'محمد رئوف دهقان', NULL, 'd09173648857', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5465f816-a5a4-4520-82ec-d1ceda162d33', 'rabin', NULL, NULL, 'راشد رشیدی', 'راشد رشیدی', NULL, 'a09177620331', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('54142d84-3872-4b96-8633-aa8175cb71a0', 'rabin', NULL, NULL, 'فاطمه یوسف پاک', 'بهرامی', NULL, '9177627046', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7ffcfc19-cb79-4ea3-83d6-511f299950cb', 'rabin', NULL, NULL, 'حسن حمیرانی', 'حسن حمیرانی', NULL, '9177624204', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('11faffb0-e67a-42ac-b23b-3a14ebe0b607', 'rabin', NULL, NULL, 'یونس حاجی پور', 'یونس حاجی پور', NULL, '9173626788', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('81fc2b8d-f5ae-4dff-9c54-6461998aea0b', 'rabin', NULL, NULL, 'محمود بردبار', 'محمود بردبار', NULL, '9177818903', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8e250979-a6eb-43ef-b04b-0846464fc3c5', 'rabin', NULL, NULL, 'عبدالعزیز حمیرانی', 'عبدالعزیز حمیرانی', NULL, '9175500447', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('496854f0-2e4b-4ffe-8252-12191321fd38', 'rabin', NULL, NULL, 'حامد اسلامی', 'حامد اسلامی', NULL, '9173641700', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('04777d16-6d5a-4e15-b7df-a9bc32463b03', 'rabin', NULL, NULL, 'یوسف جعفری پور', 'یوسف جعفری پور', NULL, '9177625650', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a1e1f5b3-85bc-4d40-b189-eb3040eec307', 'rabin', NULL, NULL, 'حمد دلگرم', 'حامد دل گرم', NULL, '9170310725', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('584c4b1c-1a9d-4732-bfd9-9c02361108d9', 'rabin', NULL, NULL, 'رقیه محمدی', 'رقیه محمدی', NULL, '9173640740', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a9944013-f97b-4590-a219-cd55c17d00d3', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری جناغ', 'آقای زارعی', NULL, '9173096979', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d1580c98-7a20-4b74-a513-aeba0319ab5d', 'rabin', NULL, NULL, 'ابراهیم اویژگان', 'ابراهیم اویژگان', NULL, '9014399175', NULL, NULL, 'پارسیان', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('187acc35-fcbe-4444-93d3-d366590f282b', 'rabin', NULL, NULL, 'غلام خیراندیش', 'غلام خیراندیش', NULL, '9173626492', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7478d1d3-3145-4808-ad85-e43ab59a9f86', 'rabin', NULL, NULL, 'آمنه بحرپیما', 'آمنه بحرپیما', NULL, '9177620094', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8a6a3237-d578-4a78-9f67-72333bfa1303', 'rabin', NULL, NULL, 'شرکت تعاونی گلسار', 'خسروانی', NULL, '9303490837', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ebf9f815-1530-4909-8eba-d936eb54d887', 'rabin', NULL, NULL, 'محمود مبارکی', 'محمود مبارکی', NULL, '9171621395', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('54467e2f-7d6e-416f-9970-7eaab714b07d', 'rabin', NULL, NULL, 'عبدالله ابراهیمی', 'عبداله ابراهیمی', NULL, '9904197015', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6ca61961-9f5d-46b2-b38c-04b0451849c9', 'rabin', NULL, NULL, 'عبدالحمید رحیمی', 'عبدالحمید رحیمی', NULL, '9171621147', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('50df5157-175d-4ed0-a3f5-da57ba069062', 'rabin', NULL, NULL, 'سعید مسلم زاده', 'سعید مسلم زاده', NULL, '9171679822', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5a902bd2-b348-4ab1-addf-deb09766e9e7', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری گلشن', 'مرغداری گلشن', NULL, '9176540762', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ca959de7-e57b-43f4-bd8e-1ac9f7a77388', 'rabin', NULL, NULL, 'حسین مراغی زاده', 'حسین مراغی زاده', NULL, '9173620654', NULL, NULL, 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('188b093a-7a9d-4442-84fd-6f6278d04436', 'rabin', NULL, NULL, 'حسین حاجبی', 'حسین حاجبی', NULL, '9306300585', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f8192dfb-01c2-4c86-8160-7b9fb266c102', 'rabin', NULL, NULL, 'حمید سایبانی', 'حمید سایه بانی', NULL, '9173694297', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1aa5abc3-58ee-4090-b4f2-f53bf2549e7d', 'rabin', NULL, NULL, 'عباس سلیم پور فینی', 'عباس سلیم پور فینی', NULL, '9177615935', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8a7edb08-c74d-4733-82b2-13e37c4a9bc7', 'rabin', NULL, NULL, 'عبدالعزیز کرمستجی', 'عبدالعزیز کرمستجی', NULL, '9177613610', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2429deff-a6dc-4dae-a81c-c5584c0afb0d', 'rabin', NULL, NULL, 'مهیا پیشدار', 'مهیا پیشدار', NULL, '9027954766', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('64302148-3e11-4ee9-8c68-4d14e1b02d9f', 'rabin', NULL, NULL, 'محمود داودی', 'محمود داودی', NULL, '9177635091', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c5726600-7c60-42ed-a5e3-8da9d04ad126', 'rabin', NULL, NULL, 'معصومه زارعی حاجی آبادی', 'معصومه زارعی حاجی آبادی', NULL, '9177616601', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4e80b8a0-d8d9-4d91-8f21-5bb31f96189e', 'rabin', NULL, NULL, 'عیسی بیژن زاده', 'عیسی بیژن زاده', NULL, '9906981701', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7a829ce1-ec30-427a-b9d1-efc5c9efeeac', 'rabin', NULL, NULL, 'اسحاق شکوهی', 'اسحاق شکوهی', NULL, '9171617024', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('80fa3baa-2b94-4f96-af10-3291cdd42477', 'rabin', NULL, NULL, 'شرکت تعاونی نسیم بندر', 'مرغداری نسیم بندر', NULL, '9177613631', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ec791736-6936-4441-b318-372a678a8e2c', 'rabin', NULL, NULL, 'شرکت تعاونی دریا مرغ بندر', 'پوراشرف', NULL, '9333614910', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('73cc230e-418d-4b0a-acfd-4ef0da38d5ae', 'rabin', NULL, NULL, 'عیسی عباس زاده', 'عیسی عباس زاده', NULL, '9179049004', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9140079e-782c-4983-bf00-fff9795b2874', 'rabin', NULL, NULL, 'عیسی رنجبر سرنی', 'عیسی رنجبرسرنی', NULL, '9171587717', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead');
INSERT INTO `customers` (`id`, `tenant_key`, `first_name`, `last_name`, `company_name`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`, `source`, `tags`, `custom_fields`, `last_activity_date`, `lead_score`, `lifecycle_stage`) VALUES
('846c7017-e9f3-4dde-a06b-fff178535c40', 'rabin', NULL, NULL, 'حسین محمد امینی', 'رضا محمدامینی', NULL, '9177979568', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c747be97-dde7-4b13-b21b-2e1c95506c6b', 'rabin', NULL, NULL, 'صالح پور احمدی گربندی', 'صالح پوراحمدی گربندی', NULL, 'p09171606929', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('96e52cc0-14ad-45ba-b698-344fed7d95ed', 'rabin', NULL, NULL, 'جلال خواجه', 'جلال خواجه', NULL, '9171611107', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:06', '2025-10-12 20:08:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('76e89f13-70d0-4541-b35d-5dbcc763c587', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری رضوان', 'سروش سایه بانی', NULL, '9171635265', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6617ce38-caa0-4d3a-8b78-64df485f58d6', 'rabin', NULL, NULL, 'حمید حاجبی', 'حمید حاجبی', NULL, 'h09177631459', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('da7f30a2-ae48-44b5-b254-56aeaf030397', 'rabin', NULL, NULL, 'شرکت تولیدی مرغ گهر بندر', 'شرکت تولیدی مرغ گهر بندر', NULL, '9171615332', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a7344429-387b-4c7d-9ab9-1df5981d7b1c', 'rabin', NULL, NULL, 'محمد رضایی تازیانی', 'محمد رضائی تازیانی', NULL, '9177674468', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6ccbfae9-3f56-42e6-9e9b-808994ea772a', 'rabin', NULL, NULL, 'آقای غایبی', 'آقای غایبی', NULL, '9177693093', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e58b3547-9d7d-462b-99d6-bf38544ffe7e', 'rabin', NULL, NULL, 'علی ره گوی', 'علی ره گوی', NULL, '9178611299', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a28206f1-79c5-47e9-8f58-5628ebbea335', 'rabin', NULL, NULL, 'محسن مرادی سرخونی', 'محسن مرادی سرخونی', NULL, '9171617073', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f392faee-da59-440b-a8a6-57179cb2982a', 'rabin', NULL, NULL, 'احمد پلاسی', 'احمد پلاسی زاده', NULL, '9171583817', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b3cccd27-926c-4696-ae64-83e7e3481e10', 'rabin', NULL, NULL, 'عباس پورتیماس', 'عباس پورتیماس', NULL, '9177613320', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6e997ecb-b5b6-4448-8540-cdc3a4ee173c', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری اشکان', 'داوودی', NULL, '9171617051', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d4fbd417-ea40-4089-8cb3-45ecb77ebac2', 'rabin', NULL, NULL, 'سعید منتظری', 'سعید منتظری', NULL, '9177678243', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0d977de5-4b9f-4d22-a383-52aa7d937569', 'rabin', NULL, NULL, 'شرکت تعاونی مارم', 'مرغداری مارم', NULL, '9380878218', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9f7d40d9-60db-4717-9d19-2a4625d31131', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری274', 'عالی زاده', NULL, '9171635031', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ac4534b3-f623-4a02-a440-0760f5f7ae12', 'rabin', NULL, NULL, 'محمدرضا فتاحی', 'محمدرضا فتاحی', NULL, '9173678238', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('84fd9596-5057-4a5d-8fad-1466572b2ecc', 'rabin', NULL, NULL, 'مرغداری موسی خارا', 'موسی خارا', NULL, '9176251800', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3be4d42-95c3-4d66-b59c-e3650b251fc1', 'rabin', NULL, NULL, 'سرنی رنجبر', 'عیسی رنجبرسرنی', NULL, '9173614855', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7a9fb449-8318-473f-8453-9df1cc66ff71', 'rabin', NULL, NULL, 'غلامرضا عیدی میرزائی', 'غلامرضا عیدی مرزائی', NULL, '9336435336', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('367a8fe1-d2f4-4f79-b7a5-ef2f51bd0e8f', 'rabin', NULL, NULL, 'جمشید پارسا', 'جمشید پارسا', NULL, '9171616939', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4bd18c19-b592-4cc4-b7be-0e016ace9fac', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری 320', 'عامری', NULL, '9171617910', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c5818a9b-42b0-4197-91b1-731815d216da', 'rabin', NULL, NULL, 'مرتضی داوری', 'مرتضی داوری', NULL, 'md0225', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fb0902c7-aa37-47d2-bc00-e6d1d1c00549', 'rabin', NULL, NULL, 'حسن زارعی', 'حسن زارعی', NULL, '9171631656', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f3960193-b766-4203-8830-9a20edc8cd72', 'rabin', NULL, NULL, 'رضا حافظی', 'رضا حافظی', NULL, '9173619587', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0da634bc-03d0-492b-aee3-34b52a9a7b51', 'rabin', NULL, NULL, 'حبیب دبیری نژاد', 'حبیب دبیری نژاد', NULL, '9179550917', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3d7f87c0-18c1-4ab3-baa6-69ce5459a402', 'rabin', NULL, NULL, 'علی عباس زاده', 'علی عباس زاده', NULL, '9173697399', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5d72a1ee-e855-4096-9752-c5af569a09ff', 'rabin', NULL, NULL, 'علیرضا جهانگیری', 'علیرضا جهانگیری زرکانی', NULL, '9173683641', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e96a2e04-e353-4490-b534-d7048f5c65e8', 'rabin', NULL, NULL, 'مرغداری امین دهنو', 'طاهری', NULL, '9176254109', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d57daf37-2694-417a-aa63-4b6112d912bc', 'rabin', NULL, NULL, 'سید عبدالمجید کاظمی شهروئی', 'سید عبدالمجید کاظمی شهروئی', NULL, '9171612668', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('79c6f899-17e3-46de-8fcc-1488284266df', 'rabin', NULL, NULL, 'تعاونی مرغداری نایبند طیور', 'سماوی', NULL, '9933714070', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('09896468-fad5-42a3-b60e-aab84c040eaa', 'rabin', NULL, NULL, 'داوری', 'مسعود داوری', NULL, 'd09171635062', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('96381619-3317-456c-941f-125dae663173', 'rabin', NULL, NULL, 'شراره بیجاد', 'شراره بیجاد', NULL, '9179003945', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('acd6f151-248a-4131-858a-4867febab514', 'rabin', NULL, NULL, 'مرغداری نیک روان', 'سهیلا نیک روان', NULL, '9308493052', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('79d3e793-1adb-4991-9b64-d3307fc7026e', 'rabin', NULL, NULL, 'جعفر داودی', 'جعفر داوودی', NULL, '9171614082', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3afc798-0e4a-4fb1-ab90-5b70c0544544', 'rabin', NULL, NULL, 'منصور نیکخواه خواجه عطائی', 'منصور نیکخواه خواجه عطائی', NULL, 'a09172867704', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('445f8919-eac6-4289-888d-61d1387f2137', 'rabin', NULL, NULL, 'زهرا آمری', 'عباس زاده', NULL, '9173675763', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ee0196cf-38b9-4ecc-8cd2-5d5e2257e959', 'rabin', NULL, NULL, 'محمد شریف حسین پور چاهوئی', 'محمد شریف حسین پور چاهوئی', NULL, '9176258127', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b9e233a2-053b-4487-b4e9-ef3151edf2b3', 'rabin', NULL, NULL, 'سهراب زینلی', 'سهراب زینلی', NULL, '9173615724', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8459af92-804a-44bb-b960-2ce4693b850f', 'rabin', NULL, NULL, 'ابراهیم دورانی نیا', 'ابراهیم دورانی نیا', NULL, '9173606535', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ebc9add6-ecce-4e01-a69a-89fcef10cd03', 'rabin', NULL, NULL, 'مرغداری دشت امام', 'کمالی', NULL, '9177689160', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('15686805-696e-42d1-8946-e6c470e59420', 'rabin', NULL, NULL, 'پروانه بهره برداری مرغ گوشتی دزک', 'اسماعیل داوودی پور', NULL, '9171614575', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2e190677-63bc-4024-b652-fb569c2b268c', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری میلاد چاه فعله', 'وثوقی', NULL, '9388796024', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('88c63c92-cbd3-43af-a5c6-8a2d54d210a8', 'rabin', NULL, NULL, 'محمد علی عزیزی', 'محمد علی عزیزی', NULL, '9177611705', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e72f6f72-5ffd-4255-81df-c86f311328a9', 'rabin', NULL, NULL, 'جلال پوینده', 'جلال پوینده', NULL, '9179540917', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b42dd19f-13ab-4e8e-af9f-0ee9bb5d33e7', 'rabin', NULL, NULL, 'سید عبدالمجید کاظمی', 'سید عبدالمجید کاظمی شهروئی', NULL, '9173611707', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('390dbd61-9084-4c5a-9c9b-40119b7add2f', 'rabin', NULL, NULL, 'اسمعیل داوودی پور', 'اسماعیل داوودی پور', NULL, '9179451790', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f95a6924-d5ba-45a5-ad05-bbc4cd3f58e3', 'rabin', NULL, NULL, 'شریفه حسین زاده', 'شریفه حسین زاده', NULL, '9178630862', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('64f6c922-c4dc-45ad-9bef-889331e1e0ca', 'rabin', NULL, NULL, 'شرکت مرغداری سینه سرخ سیاهو', 'خانم افسایی', NULL, '9175485903', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bd3f5b6c-b14b-4ffb-b6c4-da2d3cbdd1b7', 'rabin', NULL, NULL, 'زکاله اصغر', 'اصغر زکاله', NULL, '9173620372', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('95821f5b-a039-49c1-bbeb-d96ccdd89daa', 'rabin', NULL, NULL, 'ذالفقار دانشمند', 'ذوالفقار دانشمند', NULL, '9171577173', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ca2f722f-5e99-40cc-bf61-0f1794968838', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری گامبرون', 'احمدی', NULL, '9171616734', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8b975513-d515-48b7-8a40-656eb731211b', 'rabin', NULL, NULL, 'جعفر محمد حسینی تختی', 'جعفر محمد حسینی تختی', NULL, '9019162936', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0a9c4971-46f6-48aa-9df1-9c1946990a12', 'rabin', NULL, NULL, 'شرکت تعاونی مرغداری طاووس', 'ذاکری', NULL, '9172852696', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('58a26938-8e25-4f4a-936a-1be6c364e978', 'rabin', NULL, NULL, 'محمد امین پیک', 'محمدامین پیک', NULL, '9179531263', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ab1332c8-716d-4909-ba2d-7c4105a62875', 'rabin', NULL, NULL, 'ناصر ناصریان', 'ناصر ناصریان', NULL, '9173697300', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cd8454ba-c548-4dfd-b976-86475d44dfd5', 'rabin', NULL, NULL, 'گرگعلی عسکری زاده کووئی', 'گرگعلی عسکری زاده کووئی', NULL, '9179040662', NULL, NULL, 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6a192cad-266c-4112-a051-b3ea1a11bcfc', 'rabin', NULL, NULL, 'مرغداری گوشتی 20000 قطعه ای بشکرد طیور', 'حسن کریمی', NULL, '9173651992', NULL, NULL, 'بشاگرد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('73273f29-6c64-42b3-8a5d-37a4ab29d2ab', 'rabin', NULL, NULL, 'سورنا طیور بشاگرد', 'بنیامین قنبری دهوئی', NULL, 'b09177651834', NULL, NULL, 'بشاگرد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('eb371e51-2476-4e6f-98f0-5eca5607fa1f', 'rabin', NULL, NULL, 'پروانه بهره برداری مرغ گوشتی', 'حسن علی زاده', NULL, '9917061152', NULL, NULL, 'بشاگرد', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('26808b4b-09a7-4ad9-b063-6ddbbfda0c4c', 'rabin', NULL, NULL, 'مرغداری رحمانی', 'راشده رحمانی', NULL, '9171982621', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b30d8714-4ea0-4b65-8627-2baaff2addea', 'rabin', NULL, NULL, 'مرغداری گوشتی شاهی', 'عبداله محمدشاهی', NULL, '9171644027', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6cf9518b-bd91-4136-aeca-f0f6f78efd7f', 'rabin', NULL, NULL, 'مرغداری میلاد بستک', 'فاطمه احمدی', NULL, '9171980133', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fc9cc140-b816-4d68-b4ed-05eb63977c83', 'rabin', NULL, NULL, 'مرغداری نیما هاشمی', 'نیما هاشمی', NULL, '9173640366', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c236443f-6390-4c5a-84d3-3af9b4634bf2', 'rabin', NULL, NULL, 'نادر لطیفی', 'نادر لطیفی', NULL, '9171644144', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a9566db3-47ec-4a6f-a627-eb5a38aa6a33', 'rabin', NULL, NULL, 'مرغداری گوشتی آرا', 'مباشری', NULL, '9171981485', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e05dca72-ba04-4de5-8424-fc4d4f2152ab', 'rabin', NULL, NULL, 'اسحق محمدپور', 'احمدنور حاجی نیا', NULL, '9171987009', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b34c1d10-27bb-46d8-8c61-06a42408591d', 'rabin', NULL, NULL, 'احمد احمدنیا', 'احمد احمدنیا', NULL, '9173640481', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8b071300-0cf0-4c1c-bf11-a275764b2843', 'rabin', NULL, NULL, 'سفید مرغ بستک', 'غلامانی', NULL, '9179620124', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e1ee1049-d80a-4970-a2e2-66a7244172be', 'rabin', NULL, NULL, 'حسن محمدپور', 'بیان بانگرد', NULL, '9173626233', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('67dc297f-b93b-4856-97fc-94317f36ec3d', 'rabin', NULL, NULL, 'یوسف قدرتی زاده', 'یوسف قدرتی زاده', NULL, '9332517874', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c223b43c-2f91-4b90-bab6-f792759d48ec', 'rabin', NULL, NULL, 'مرغداری تک', 'غفوری', NULL, '9178876397', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('74817a83-a690-4ba9-967c-75c9d1caae29', 'rabin', NULL, NULL, 'مرغداری صبحان', 'جمال جامه دار', NULL, '9171643459', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('28f37514-c0f9-41c0-ab67-90d8c692debc', 'rabin', NULL, NULL, 'مرغداری رشید', 'داود رشید', NULL, '9177646500', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8e2f4b60-4057-44b4-bca3-b4b3b8cf75d4', 'rabin', NULL, NULL, 'مرغداری هاشمی فتویه', 'محمد هاشمی', NULL, '9177620742', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d444a011-bd25-4181-88d1-ec7154284957', 'rabin', NULL, NULL, 'مرغداری پورمحمد', 'عبدالکریم پورمحمد', NULL, '9179481992', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('231f3680-83d8-4c6d-a535-e927464915cf', 'rabin', NULL, NULL, 'مرغداری محمودی', 'سید احمد حسینی', NULL, '9171643402', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('802a119b-fff9-4af0-ad30-ac2519c1952e', 'rabin', NULL, NULL, 'عبدالرزاق مرتضوی 2', 'عبدالرزاق مرتضوی', NULL, '9173641143', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('765b3dcb-6c29-47f7-826b-f9c77998dae6', 'rabin', NULL, NULL, 'مرغداری اصغری', 'رحمت اله اصغری', NULL, '9177623933', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('19124e6f-b137-4f0b-a04e-bdb9873ba477', 'rabin', NULL, NULL, 'مرغداری ماشالله حاجی نیا', 'ماشااله حاجی نیا', NULL, '9177626569', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ed483e35-c187-4ce0-a09a-b10b569f501d', 'rabin', NULL, NULL, 'مرغداری عزت الله ترکی', 'عزت الله ترکی', NULL, 'morghdaritorki', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fc413889-39af-4485-8292-5179d9fddc03', 'rabin', NULL, NULL, 'مرغداری میری', 'ابراهیم میری', NULL, 'ya5564', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('724603c7-c98c-485d-af06-7ad2dde9d89d', 'rabin', NULL, NULL, 'مرغداری نعمت نیا', 'محمدصالح نعمت نیاء', NULL, '9171643492', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5ee21e64-61f3-4760-9880-3cfa652b7ba9', 'rabin', NULL, NULL, 'مرغداری فیض الله محمودی', 'فیض الله محمودی', NULL, '9171980647', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('319ff0d7-9d5c-4133-9213-98b4129d9c62', 'rabin', NULL, NULL, 'مرغداری پاینده2', 'مهرداد پاینده', NULL, '9171980712', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8fc64145-86e7-4c19-a8fa-72a19d7c96df', 'rabin', NULL, NULL, 'مرغداری تنگه بستک', 'ماشاءاله حاجی نیا', NULL, '9168571121', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('376bd17f-1bc1-4391-b290-a0319cb73623', 'rabin', NULL, NULL, 'مرغداری فخرایی', 'یونس فخرائی', NULL, '9173640390', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7cfc70ca-99cc-44e1-bc67-2d21bcd7dd04', 'rabin', NULL, NULL, 'مرغداری محمد سدهی', 'محمد سدهی', NULL, '9177648100', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0d7b181a-4ba9-483d-a4ef-d884ae7189e8', 'rabin', NULL, NULL, 'مرغداری عبدالله عبداللهی', 'عبداله عبداللهی', NULL, '9179621587', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7f61f0cd-d106-4a35-a73e-544486139e4c', 'rabin', NULL, NULL, 'سید مرتضی علی معصومی', 'سید مرتضی علی معصومی', NULL, '9171643208', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d64bc3ec-158b-45fc-b5e3-780a0d185693', 'rabin', NULL, NULL, 'مرغداری آل علی', 'محمد نجاری', NULL, '9171998110', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('db29eab0-9603-4a11-ad7c-7cd383b7abc3', 'rabin', NULL, NULL, 'مرغداری ستوده نیا', 'عبدالرحمن ستوده نیا', NULL, '9179620338', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a3f20c02-6f84-462a-8770-bfefacf425ec', 'rabin', NULL, NULL, 'آشیان مرغ کمشک', 'مختاری', NULL, '9173624750', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('569190fb-7de4-4dfa-8602-fea351cdab3e', 'rabin', NULL, NULL, 'مرغداری حیرت', 'محمد حیرت', NULL, '9393640048', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9297cbff-6639-43b6-8ea1-43eb6ea49d93', 'rabin', NULL, NULL, 'مرغداری علی رشت', 'علی رشت', NULL, '9173625063', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('98d4bf62-57c7-4968-adec-91acf2eb1ee7', 'rabin', NULL, NULL, 'مرغداری خاوران', 'محمد درخور', NULL, '9173624202', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('00e8bd06-ec62-4b75-a719-862e394fa5f0', 'rabin', NULL, NULL, 'مرغداری عبدالکریم حفیظی', 'عبدالکریم حفیظی', NULL, '9171644055', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d26e7be4-094f-4b2b-9e6e-17926ea17296', 'rabin', NULL, NULL, 'مرغداری حلیمه آزاری', 'حلیمه آزاری', NULL, '9164198612', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d4c5d616-3ee3-4a8a-9f4e-6b436b6a80a8', 'rabin', NULL, NULL, 'مرغداری قطبی', 'عبدالله دامن افشان', NULL, '9173640596', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('94581b07-4fcb-4f04-8f7d-61459046ca2c', 'rabin', NULL, NULL, 'مرغداری آسو', 'عبدالجلیل مؤذنی', NULL, '9177621813', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1e971de7-f113-4a3b-b0e2-c89c7d1193e8', 'rabin', NULL, NULL, 'مرغداری پورمحمدی', 'هاشمی', NULL, '9171990089', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2e32f000-4321-48cd-85c7-7d9463a48977', 'rabin', NULL, NULL, 'مرغداری لیلی مصلحی', 'لیلی مصلحی', NULL, 'morghdarimoslehi', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0e93920c-44e9-4071-8f14-3501f4ae6bdd', 'rabin', NULL, NULL, 'رفیعه بهروزی', 'رفیعه بهروزی', NULL, '9171987433', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f2beceb7-3821-4263-8a0c-acb7c80c75a7', 'rabin', NULL, NULL, 'مرغداراری هانا', 'فاطمه محمدی', NULL, '9177621072', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1cfa2150-f419-49df-bed1-0f62a0d9c4ab', 'rabin', NULL, NULL, 'مرغداری عبدالرزاق مرتضوی', 'عبدالرزاق مرتضوی', NULL, '9171643057', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9fb59396-781b-4c8a-84b5-35adfae3649c', 'rabin', NULL, NULL, 'مرغداری علی بابا آوخ', 'علی بابا آوخ', NULL, '9171644134', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3bfedd38-19c4-45be-9250-16a03f73c186', 'rabin', NULL, NULL, 'مرغداری راشدی', 'رحمت راشدی', NULL, '9164250637', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6fcfd889-f798-47f0-9045-206c02dcd33a', 'rabin', NULL, NULL, 'مرغداری مشتاق', 'فرامرز مشتاق', NULL, '9173640398', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('be402cad-d26b-438e-91b9-1728fdfe2a16', 'rabin', NULL, NULL, 'مرغداری رحیمی کوهیج', 'ایمانه باقریان', NULL, '9171651126', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6d5cc22f-43e1-4de0-8500-13f2a37f2286', 'rabin', NULL, NULL, 'مرغداری عارف عالی پور', 'عارف عالی پور', NULL, '9171982137', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('09128d1d-a32b-4419-bd85-2be8d4f8fda1', 'rabin', NULL, NULL, 'مرغداری رحمانی دهنگ', 'عبداللطیف رحمانی', NULL, '9173640358', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('66e68243-6374-4cc4-b9c0-2daf1c11cb47', 'rabin', NULL, NULL, 'مرغداری عباس زاده', 'محمد عباس زاده', NULL, '9173628157', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3d7266e5-e551-47a2-b509-4c9095a5db3f', 'rabin', NULL, NULL, 'مرغداری عادل حاجی نیا', 'محمدرسول پورمحمد', NULL, '9173649550', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('045c6eb8-1688-4a97-9569-85282dc957ae', 'rabin', NULL, NULL, 'مرغداری لطیفی', 'عبداله لطیفی', NULL, '9390648518', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('39144e05-1fd9-4fcb-924f-d4c393adeb0f', 'rabin', NULL, NULL, 'مرغداری بدخشان', 'احمد بدخشان', NULL, '9171643488', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fb61add7-af1c-44ba-afe3-792f4e3106d1', 'rabin', NULL, NULL, 'مرغداری محمد رشید مرتضوی', 'محمدرشید مرتضوی', NULL, '9171643291', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6fc3c91f-f292-401c-94f2-07b7d969011c', 'rabin', NULL, NULL, 'مرغداری علی لطیفی', 'علی لطیفی', NULL, '9382252781', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ba2cf54c-0e37-4d4b-8f49-ca9607b63f1a', 'rabin', NULL, NULL, 'سید عبدالرزاق حسینی', 'سید عبدالرزاق حسینی', NULL, 'S09177641520', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('78deb8d5-f04d-441c-aaf2-9a81ce33f5f3', 'rabin', NULL, NULL, 'سید یوسف حسینی', 'سید یوسف حسینی', NULL, '9901861850', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e3545860-6a1e-417d-b9a9-e035976544a7', 'rabin', NULL, NULL, 'مرغداری امین', 'جمیل احمدپور', NULL, '9915203626', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cc82416e-f61e-4c13-b870-e4e9652ade89', 'rabin', NULL, NULL, 'مرغداری احمدی -کنارسیاه', 'محمود احمدی', NULL, '9173648400', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('84e36440-fb02-4e06-a542-bbf1f1449385', 'rabin', NULL, NULL, 'مرغداری چهارفصل', 'سیدمحمد حسینی', NULL, '9177641520', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d54fd98e-f820-4449-9eed-3dd8d5711b9b', 'rabin', NULL, NULL, 'مرغداری کوثر فتویه (محمدی زاده)', 'محمد محمدی زاده', NULL, '9171643514', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('dcfe48e5-c326-4abf-9923-7e72839c47ad', 'rabin', NULL, NULL, 'مرغداری حسام احمدی', 'حسام احمدی', NULL, '9171980671', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a8d9c03f-128b-4e73-a2b3-36ac1df05893', 'rabin', NULL, NULL, 'تدرو طیور', 'محمد رسول حسین پور', NULL, '9373799113', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a30b8b9e-965d-4912-82b4-35c0cff95021', 'rabin', NULL, NULL, 'مرغداری محمد نژاد', 'بهروز محمدنژاد', NULL, '9177626627', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('77836aa5-52ab-4b5e-bc30-a6c9f0eb7b90', 'rabin', NULL, NULL, 'مرغداری نامی تدرویه', 'عبداله نامی', NULL, '9171981548', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('90a26e0d-e2a5-492c-8526-d24d39974418', 'rabin', NULL, NULL, 'زرین بال جناح', 'زرین بال جناح', NULL, '9173641176', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9ff401a1-763f-4080-8355-4375bb14d19a', 'rabin', NULL, NULL, 'مرغداری احمد نور حاجی نیا', 'احمدنور حاجی نیا', NULL, '9173640446', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3cd435bd-5b84-4c85-b959-9a06e50932c3', 'rabin', NULL, NULL, 'مرغداری محمدشریف محمدپور', 'محمدشریف محمدپور', NULL, '9171980728', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1a5d01dd-affd-46d7-9f89-586fd45764bd', 'rabin', NULL, NULL, 'نبیل خنجی', 'نبیل خنجی', NULL, '9171643310', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8498f191-ee73-441d-bbe8-ab5087fe98e2', 'rabin', NULL, NULL, 'مرغداری گوشتی احمد', 'جاسم مباشری', NULL, '9171815624', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('82c1c25f-f448-4bcb-93a0-8cf42af15c3b', 'rabin', NULL, NULL, 'مرغداری حسن نیا', 'عبدالعزیز حسن نیا', NULL, '9179460085', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e8c0aa56-8ace-46aa-86c6-76221f9fbcb8', 'rabin', NULL, NULL, 'مرغداری محمد جباری', 'محمد جباری', NULL, '9171643069', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('164091ea-749a-46a4-86c7-04038935a9a9', 'rabin', NULL, NULL, 'مرغداری پورمحمد فتویه', 'عبدالله پورمحمد', NULL, '9171644097', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a5754e2c-dda9-4912-914a-78f651e8c97c', 'rabin', NULL, NULL, 'مرغداری محمد احمدی تدرویه', 'محمد احمدی', NULL, '9173640496', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cfdd66e9-92ad-4742-9738-341a796dad99', 'rabin', NULL, NULL, 'مرغداری محمد محمد احمدی', 'محمد محمداحمدی', NULL, '9171980434', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cc1e2d3c-ac92-4086-adc9-159496a8beb3', 'rabin', NULL, NULL, 'مرغداری زبیر عالی پور', 'زبیر عالی پور', NULL, '9177620783', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6beb2c87-3500-4955-b96d-5d11f39dd4a5', 'rabin', NULL, NULL, 'مرغداری گوشتی افروغ', 'سیدمصطفی افروغ', NULL, '9173640048', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead');
INSERT INTO `customers` (`id`, `tenant_key`, `first_name`, `last_name`, `company_name`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`, `source`, `tags`, `custom_fields`, `last_activity_date`, `lead_score`, `lifecycle_stage`) VALUES
('0ba05d1b-70c8-4e5f-a658-dc108febb27f', 'rabin', NULL, NULL, 'طنین', 'فائز سلمانی', NULL, '9173640602', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f7880105-1245-4541-a9c4-1090ce0d68a0', 'rabin', NULL, NULL, 'مرغداری عبدالعزیز خسروی', 'لطیفی', NULL, '9173623549', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1e3edf93-089b-402c-856a-7c4ff4167da4', 'rabin', NULL, NULL, 'مرغداری نوید دهنگ', 'محمدکامل مرتضوی', NULL, '9171996583', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('14db3cf4-6c3a-44c8-973d-b1c48bf3b3bb', 'rabin', NULL, NULL, 'مرغداری محمد رسول عمادی', 'محمدرسول عمادی', NULL, '9173646650', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0fb1b875-b469-45f8-a60c-e15eaa774030', 'rabin', NULL, NULL, 'مرغداری زرین مرغ فاریاب', 'زرین مرغ فاریاب', NULL, '9179959505', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0838dd7f-33ef-4772-a14e-4f91c80af128', 'rabin', NULL, NULL, 'شرکت حرای سبز جنوب', 'شرکت حرای سبز جنوب', NULL, '9173640520', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f8a5205c-ac4b-41a6-898e-e92965d27cc4', 'rabin', NULL, NULL, 'مرغداری عبداللهی گتاو', 'ولید بوالقاسمی', NULL, '9391640053', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b7481851-db25-45ce-83f5-01375de9109a', 'rabin', NULL, NULL, 'مرغداری حسینی تدرویه', 'عبداله حسینی', NULL, '9171980757', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('998106e5-73f4-41c7-9b2b-7be616ae60fa', 'rabin', NULL, NULL, 'مرغداری محمد عزیز صدیقی', 'محمدعزیز صدیقی', NULL, '9177640122', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('063f071f-20ea-4934-b58a-30191bfd229f', 'rabin', NULL, NULL, 'موسی میری', 'موسی میری', NULL, '9919951669', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7c83ea61-ab3c-41ed-9d4d-7f7b49cf98b8', 'rabin', NULL, NULL, 'مرغداری براکوه', 'عبدالله براکوه', NULL, '9171643482', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2da28354-908d-4d73-b98b-f6044775739b', 'rabin', NULL, NULL, 'مرغداری عدنان احمدپور -کوهیج', 'عدنان احمدپور', NULL, '9120398599', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('729ce381-b967-4941-bd22-d7e99d03d734', 'rabin', NULL, NULL, 'مرغداری فرهاد احمدی', 'عبدالنور حاجی قاسمی', NULL, '9173372004', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a9c76f8d-aece-4e1a-9aa2-2fa266c0a0cb', 'rabin', NULL, NULL, 'مرغداری عبدالغفور دهنگی', 'آهن جان', NULL, '9175228596', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5b329598-1e2a-41d0-808d-c61c77b96436', 'rabin', NULL, NULL, 'مرغداری محمدامین آوخ', 'محمد امین آوخ', NULL, '9392751230', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ca440a4e-b764-4a83-97c7-36e268174473', 'rabin', NULL, NULL, 'زینب جوادی', 'زینب جوادی', NULL, '9177620766', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('03a47b1c-729d-4d94-9b65-a6dc9b721d20', 'rabin', NULL, NULL, 'واحد پرورش مرغ گوشتی بدخشان', 'محمد بدخشان', NULL, '9173595107', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1e277529-9355-4ec0-8a13-1accd81cf94c', 'rabin', NULL, NULL, 'سید محمد حسینی', 'سیدمحمد حسینی', NULL, '9306040432', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2e1ffa8c-b67f-47f3-94e6-de5529653cd0', 'rabin', NULL, NULL, 'مرغداری قلات طیور', 'یاسین حسین پور', NULL, '9177643101', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b93b2175-8538-4ad3-98b8-ad599ddefa89', 'rabin', NULL, NULL, 'مرغداری بیسه', 'پورمحمد', NULL, '9173641101', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5059b3b2-448e-498b-8b46-005f62f0eb59', 'rabin', NULL, NULL, 'مهرداد لطیفی', 'مهرداد لطیفی', NULL, '9172222171', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d5cd557e-4adf-422f-b034-a071af530516', 'rabin', NULL, NULL, 'مرغداری معصومی', 'احمدی', NULL, '9170323160', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('781496a0-d273-445d-b9d0-7bd97943cd31', 'rabin', NULL, NULL, 'نیمچه گوشتی عبدالله ابراهیمی', 'عبدالله ابراهیمی', NULL, '9173640491', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('21dcde1f-ce42-4b59-8ff5-f954c5c66cc5', 'rabin', NULL, NULL, 'خورشید محمدی', 'کمیل محمدی', NULL, '9171644075', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d85733eb-f580-4c8e-bc23-4ce11335b1c3', 'rabin', NULL, NULL, 'نیمچه گوشتی محمد علوی', 'محمد علوی', NULL, '9941251565', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cb1b5691-28a5-4418-9066-e29dc4674f9d', 'rabin', NULL, NULL, 'مرغداری عبدالواحد واحدی', 'عبدالواحد واحدی', NULL, '9353640875', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c0996da2-1f98-4c57-a3a9-e15199de8290', 'rabin', NULL, NULL, 'مرغداری عدنان احمدپور 2', 'عدنان احمدپور', NULL, '9179470636', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5a3f5b33-f747-4030-8bfb-dc5e048bb9e8', 'rabin', NULL, NULL, 'مرغداری خالد طاهری', 'احمدنور حاجی نیا', NULL, '9039423910', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b9763ebb-32a2-446b-903a-a591ff4c437e', 'rabin', NULL, NULL, 'مرغداری طالبی', 'طالبی', NULL, '9179648969', NULL, NULL, 'بستک', 'هرمزگان', 'Iran', NULL, 'مرغ گوشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('23b9511e-cb92-4382-852b-6dec3f8c5ca1', 'rabin', NULL, NULL, NULL, 'عبدالله حاجیانی', NULL, '9179640529', NULL, 'کوخرد , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a15833f7-5b92-4458-be8f-f3bf354433a2', 'rabin', NULL, NULL, NULL, 'خالد ابراهیمی', NULL, '9179640146', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ac7ae5f1-c1f0-44f1-967a-d21881205a45', 'rabin', NULL, NULL, NULL, 'محمدطیب فیروزی', NULL, '9176560082', NULL, 'گوده , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('60ce9f16-1646-4714-9bfb-30446b5a92ec', 'rabin', NULL, NULL, NULL, 'عبدالسلام حقیقت', NULL, '9177683650', NULL, 'ده تل , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('07947f38-96c7-4c6c-8c9f-a13027a07d0e', 'rabin', NULL, NULL, NULL, 'عبداله احمدی', NULL, '9107080084', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ba90419a-7319-44d6-a3af-6f6f4ecd0e41', 'rabin', NULL, NULL, NULL, 'عبداله راحت جو', NULL, '9904335079', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1bd0ebcd-934f-4c09-a22e-a0413bd423bf', 'rabin', NULL, NULL, NULL, 'یاسر محمدی', NULL, '9171992291', NULL, 'جناح , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('877310b7-c406-4951-b53f-d35f37098dbe', 'rabin', NULL, NULL, NULL, 'احمد پیلوار', NULL, '9173641080', NULL, 'جناح , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0c1678ca-e50c-43f1-8930-301c763163a0', 'rabin', NULL, NULL, NULL, 'عبداله حسینی نیا', NULL, '9179491723', NULL, 'گوده , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('99e9c21d-ab3e-4aca-83da-2a429fdc58f2', 'rabin', NULL, NULL, NULL, 'محمدشریف اقلیما', NULL, '9179620636', NULL, 'فتویه , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ea2d5d78-c47a-4fc9-900d-030b998c8716', 'rabin', NULL, NULL, NULL, 'ناصر طاهری', NULL, '9173641267', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6c77fd0c-a461-4ca7-8ab7-899b47bf9b0b', 'rabin', NULL, NULL, NULL, 'احمد پورپهلوان', NULL, '9397271797', NULL, 'فتویه , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1ac18abd-a6a3-435b-8b64-4fb3f4b2ec87', 'rabin', NULL, NULL, NULL, 'حمید رحمان شناس', NULL, '9399648239', NULL, 'فتویه , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6cf96c19-8dd9-4fda-8a42-75b3b854e214', 'rabin', NULL, NULL, NULL, 'مریم واحدی', NULL, '9173623749', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e0078ec1-700f-4532-96b4-945105ceb956', 'rabin', NULL, NULL, NULL, 'احمد حسین پور', NULL, '9179480181', NULL, 'گوده , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:07', '2025-10-12 20:08:07', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2ef40ad3-8435-4420-826a-e76bb406671a', 'rabin', NULL, NULL, NULL, 'محمد فرزین', NULL, '9179648936', NULL, 'گوده , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2d4d2e55-b4c7-40c0-898a-50eb0b62e258', 'rabin', NULL, NULL, NULL, 'احمد کمشکیانی', NULL, '9177625234', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1a804d48-2905-468d-a678-d143359c0330', 'rabin', NULL, NULL, NULL, 'حسن حاجی محمدی', NULL, '9173641288', NULL, 'فتویه , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('42c77a25-0331-4a26-b2f0-93a73f488357', 'rabin', NULL, NULL, NULL, 'علی حاجی حسینی', NULL, '9177685568', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7d23d075-ac94-4411-ad56-084845456ee5', 'rabin', NULL, NULL, NULL, 'مجتمع دامپروری پیشتاز دهنگ بستک محمدی', NULL, '9171643439', NULL, 'گوده , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0e60f4ab-ad5b-4520-ac91-64eb7ba7f573', 'rabin', NULL, NULL, NULL, 'الیاس قلندرو', NULL, '917625479', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fcef23a9-c5ba-430e-8976-9fffe976d743', 'rabin', NULL, NULL, NULL, 'رقیه حسن پور', NULL, '9171992205', NULL, 'فتویه , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5277c13e-d9a5-4ee5-aca0-7d1d49835368', 'rabin', NULL, NULL, NULL, 'عبدالقادر فعله زاد', NULL, '9177626616', NULL, 'جناح , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی شتر', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d48235fb-c134-41d9-abb4-a8000c01ed07', 'rabin', NULL, NULL, NULL, 'عبدالجلیل دست بس', NULL, '9171982278', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('99c7105b-694b-4dc7-80da-21791e2c2c5c', 'rabin', NULL, NULL, NULL, 'محمدعزیز فرح بخش', NULL, '9171644023', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('cba24499-1c7a-4690-acfe-592cff66deff', 'rabin', NULL, NULL, NULL, 'عبدی', NULL, '9170676474', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9b73bea8-7c6c-4ec6-842a-13b997b76f94', 'rabin', NULL, NULL, NULL, 'سیدعبدالرحمن قتالی', NULL, '9177640152', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('feb589b6-01b2-4d3b-814c-d70567087c48', 'rabin', NULL, NULL, NULL, 'یوسف تیزهوش', NULL, '9170697599', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('84f24ea6-7fcd-425a-87d7-d45c24bab90e', 'rabin', NULL, NULL, NULL, 'جلال الدین داودی', NULL, '9171980987', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('585f1908-aa4a-4eca-8e16-9d503b179c0d', 'rabin', NULL, NULL, NULL, 'جهانگیر اعتصامی', NULL, '9171987329', NULL, 'هرنگ , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('02c44070-c8a6-4c44-93cb-28b6c91cf1fb', 'rabin', NULL, NULL, NULL, 'عبدالله رویان', NULL, '9173623595', NULL, 'فرامرزان , بستک', 'بستک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9256aeef-f8aa-4fed-9e95-12248a50a263', 'rabin', NULL, NULL, NULL, 'حوا الهام نیا', NULL, '9172061554', NULL, 'جکدان , بشاگرد', 'بشاگرد', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2b89c39b-4a6b-43f8-b413-dfda81c09349', 'rabin', NULL, NULL, NULL, 'مریم دیوان زاده', NULL, '9031880614', NULL, 'درآبسر , بشاگرد', 'بشاگرد', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c02ec7f3-bed3-4b51-93ae-e37e56b7d160', 'rabin', NULL, NULL, NULL, 'مریم بهمن زاده', NULL, '9177611444', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ea3590a4-df3f-49da-b322-0ff2e06b8c12', 'rabin', NULL, NULL, NULL, 'محمد جامعی', NULL, '9217301858', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('aba8136b-88c5-4c75-b406-61ed1eed4fbf', 'rabin', NULL, NULL, NULL, 'علی سنگرزاده', NULL, '9091795349', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5e34b8f3-d0b6-450f-8fe2-c135604fbebc', 'rabin', NULL, NULL, NULL, 'حسن قاسمی پورتختی', NULL, '9173689967', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('be7ff58b-6166-4ba3-8798-cc81dca209ef', 'rabin', NULL, NULL, NULL, 'علی اکبر جلال زاده', NULL, '9173689378', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f8a3a21e-4490-4e2b-bfcc-4e105ef69ec2', 'rabin', NULL, NULL, NULL, 'سودابه نظری نانگی', NULL, '9177638151', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('21cba536-41ba-4231-879c-f48e56b01a2d', 'rabin', NULL, NULL, NULL, 'منصور حسن زاده نخلی', NULL, '9332956030', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4ed855df-0274-4854-a206-1a7b79aadabe', 'rabin', NULL, NULL, NULL, 'حمید رکیده', NULL, '9177636695', NULL, 'فین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e2b8fe29-1352-48f2-936e-f9fdb3bd1681', 'rabin', NULL, NULL, NULL, 'محمد رئوفی منش', NULL, '9177632944', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a9343a9e-1c56-472b-9959-352a99c46e47', 'rabin', NULL, NULL, NULL, 'اسماعیل زاهدی', NULL, '9171976068', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a57667f6-9844-4840-a262-646895a35fb0', 'rabin', NULL, NULL, NULL, 'محمد خلیلی تازیانی', NULL, 'NoMobile', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d924c0ed-7b0a-4587-b1ed-66f451314fa9', 'rabin', NULL, NULL, NULL, 'مهدی رضائی تختی', NULL, '9173617267', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0272802b-23aa-4bbf-9c96-33befaae6177', 'rabin', NULL, NULL, NULL, 'محمدرضا احمدی', NULL, '9308261183', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1add100a-b8ad-41a4-8deb-cde33e06db2d', 'rabin', NULL, NULL, NULL, 'مریم غریبی تختی', NULL, '9179019228', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1b76c5e6-f01b-4155-a315-dfa7d365c2dd', 'rabin', NULL, NULL, NULL, 'غلام احسانی', NULL, '9176400871', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bb7016fc-f9c9-4c77-8c2f-78f0607f577a', 'rabin', NULL, NULL, NULL, 'علیرضا حاجبی', NULL, '9178651197', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('971f8d06-2f5d-4ece-bd0e-a6dc8b70af2d', 'rabin', NULL, NULL, NULL, 'مجید مرادی سرخونی', NULL, '9173614970', NULL, 'سرخون , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش گوسفند داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bbd02e9e-1929-4fb4-98f6-454a140e5ccb', 'rabin', NULL, NULL, NULL, 'عبدل رهبری', NULL, '9906485782', NULL, 'جلابی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5de51198-a9a7-43af-beb4-d65cc12144b1', 'rabin', NULL, NULL, NULL, 'عبدالمجید بدرقه', NULL, '9173687457', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1f52b16d-862e-46bf-bb2d-641c8d2805b4', 'rabin', NULL, NULL, NULL, 'اردشیر صفری زاده', NULL, '9164180218', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('35a777dd-fd69-4b39-8576-8c6baf1833cc', 'rabin', NULL, NULL, NULL, 'عبداله زاهدزاده', NULL, '9172102900', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f224c3bf-22b3-403f-a7bf-b02485f6915d', 'rabin', NULL, NULL, NULL, 'زینب دست زن', NULL, '9175079341', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4634c2a4-8651-4ad5-996e-358d74792a93', 'rabin', NULL, NULL, NULL, 'مسلم یدآلهی', NULL, '9171586702', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('731608db-542c-40c0-aed5-a324c3ce1caa', 'rabin', NULL, NULL, NULL, 'الیاس زرنگاربندری', NULL, '9037466002', NULL, 'شمیل , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8b3b875c-fd6a-4aad-8aa8-870289329cde', 'rabin', NULL, NULL, NULL, 'مهدی خوشوقت', NULL, '9024246986', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f5bcb8ab-2775-44f3-a74f-70d2e06601a9', 'rabin', NULL, NULL, NULL, 'احمد سجادی پور', NULL, '9179019976', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('48341300-b941-4037-8b5c-edc4bc9b1d0e', 'rabin', NULL, NULL, NULL, 'حسن اکرم نسب', NULL, '9172816038', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c15d3457-d88b-45ad-93a3-584f8d2f13aa', 'rabin', NULL, NULL, NULL, 'فائزه زمین پیما', NULL, '9171584464', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('03f954e2-8bc4-4c2f-9f2f-e232f540c43c', 'rabin', NULL, NULL, NULL, 'اشرف گچینی پورشقوئی', NULL, '9356686472', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3f991add-7501-4c4c-8072-3fdfd2ec4121', 'rabin', NULL, NULL, NULL, 'حیدر کرم پور', NULL, '9177613227', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('07704dde-077d-4556-acd9-5764eb5f307f', 'rabin', NULL, NULL, NULL, 'پلاسی زاده', NULL, '9177637275', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ce8f0db7-3212-4636-857b-a600c6536ff8', 'rabin', NULL, NULL, NULL, 'جمشید صفادرگیری', NULL, '9173614572', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ff324151-1b39-4daa-9da2-99c95caa4eef', 'rabin', NULL, NULL, NULL, 'تعاونی توسعه روستایی یاران همبستگی طاهری', NULL, NULL, NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('59564e19-9f0e-4cea-afe5-f1694a21cb40', 'rabin', NULL, NULL, NULL, 'حسین رضائی', NULL, '9171612834', NULL, 'تازیان , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('725d78cb-fd5f-44e7-b155-e073556b660b', 'rabin', NULL, NULL, NULL, 'هادی رزاق پور', NULL, '9177690820', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('492a1633-87a6-40fe-99f1-6d6687e5f724', 'rabin', NULL, NULL, NULL, 'محمد قنبری نیا', NULL, '9179540148', NULL, 'گچین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d09ad58b-4650-4991-a9c6-e16f478f8810', 'rabin', NULL, NULL, NULL, 'خیری قریشی', NULL, '9173687468', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6d86eedc-f9c9-4153-99f5-d22138824d47', 'rabin', NULL, NULL, NULL, 'حبیب اله یدالهی', NULL, '9367054968', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('05932411-92c5-442a-b91b-7e470ed2e48e', 'rabin', NULL, NULL, NULL, 'غلامحسن اعتمادی', NULL, '9173695895', NULL, 'شمیل , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('15fce12f-bd71-4452-be5b-1b5a7cff02fb', 'rabin', NULL, NULL, NULL, 'محمد بلارک', NULL, '9171616671', NULL, 'حسن لنگی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4d423435-2a39-48fd-9ecc-34827d720484', 'rabin', NULL, NULL, NULL, 'فاطمه گنجی پورشقوئی', NULL, '9177635676', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('596a46d2-d31f-428a-8523-15be7ba0b32a', 'rabin', NULL, NULL, NULL, 'حسن تارخ', NULL, '9177635404', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2f788c13-29f8-4ed6-950d-c9f31eda1cf7', 'rabin', NULL, NULL, NULL, 'حیدر تقی زاده', NULL, '935482036', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1132ecce-08d6-457c-87a5-8238dd987ca2', 'rabin', NULL, NULL, NULL, 'گوهر ابلق', NULL, '9332711595', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2ca2a085-2982-4884-b944-ea613f916118', 'rabin', NULL, NULL, NULL, 'عبداله آبیار', NULL, '9050504218', NULL, 'حسن لنگی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a3d19f5c-7844-4a2d-a4c0-f090c6e72439', 'rabin', NULL, NULL, NULL, 'قنبر دهقانی نخلی', NULL, '9177083834', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c2bde58f-3c1c-4d11-981d-7fdeff7fbf73', 'rabin', NULL, NULL, NULL, 'مریم غریبی تختی', NULL, '9179019228', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9460e852-c044-4714-966d-dda6feb233f3', 'rabin', NULL, NULL, NULL, 'ابوطالب دیرینه', NULL, '9171594846', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1fe0dbb7-30e1-4045-a4db-438b094bd5f4', 'rabin', NULL, NULL, NULL, 'عبداله مرودی زاده', NULL, '9179540131', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1875ee40-7ca5-448f-acaf-542c6ee4aa84', 'rabin', NULL, NULL, NULL, 'زهرا خدادادزاده', NULL, '9171582174', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('33fa1109-92a9-4653-8437-17eac41f1e16', 'rabin', NULL, NULL, NULL, 'موسی گرگی', NULL, '9051646046', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4820c43d-21db-4366-80fe-792ee790bbcf', 'rabin', NULL, NULL, NULL, 'فاطمه بیگلری تختی', NULL, '9177692899', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6c8f6c29-52c2-4fac-aa40-43ad117201d0', 'rabin', NULL, NULL, NULL, 'یعقوب تب', NULL, '9175210904', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('13c2df4a-bbd1-44c6-9d89-336077f18b30', 'rabin', NULL, NULL, NULL, 'کریم داج', NULL, '9172834146', NULL, 'جلابی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('155376f0-901d-4ba6-9d9a-ffa431f1ec7f', 'rabin', NULL, NULL, NULL, 'ابراهیم روان تاب', NULL, '9179019266', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('09671f43-6f16-4e96-babb-e0254587c21e', 'rabin', NULL, NULL, NULL, 'مرغداری تیز منقار بندر', NULL, NULL, NULL, 'سیاهو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3d41e350-2b27-4b1e-8113-a1a770d426b4', 'rabin', NULL, NULL, NULL, 'طیب پاآهو', NULL, '9176400415', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e3c21530-2bf2-40ed-a8fd-f3e9cdcf713c', 'rabin', NULL, NULL, NULL, 'پیمان حسن زاده', NULL, '9173607602', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ebc6474d-d5ba-46d6-b731-79eb52ca2584', 'rabin', NULL, NULL, NULL, 'نصرت احترامی کلوچانی', NULL, '9172110145', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a6fe6a14-d00e-4937-960c-2282c498cb1f', 'rabin', NULL, NULL, NULL, 'محمد پرمر', NULL, '9171603126', NULL, 'حسن لنگی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fcc76176-8ca6-4120-935b-d08f53e06ba6', 'rabin', NULL, NULL, NULL, 'بهرام زاهدی', NULL, '9351670598', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ee67678a-87fe-4c6f-a00b-89093aadb49d', 'rabin', NULL, NULL, NULL, 'صالح پروار', NULL, '9172317816', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d57d72f0-a436-45a0-9e43-d5288e420a26', 'rabin', NULL, NULL, NULL, 'قنبرعلی نصیری', NULL, '9178611644', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9e9d75d4-c40a-4d8e-b096-9fe8bb00a19b', 'rabin', NULL, NULL, NULL, 'سهیلا صدقیانی قارویری', NULL, '9179596272', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('dcdd09cb-4898-482d-b60a-dd075b4b0142', 'rabin', NULL, NULL, NULL, 'علی جعفرپور', NULL, '9171630986', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a172ab24-3a70-47a0-ba5d-d9ae39ba2029', 'rabin', NULL, NULL, NULL, 'فاطمه احترامی کلوچانی', NULL, '9175749450', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('407d123b-9503-415e-b841-19b48c771a14', 'rabin', NULL, NULL, NULL, 'علی نورالهی', NULL, '9177638867', NULL, 'سیاهو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f072d09e-8b08-4792-be9f-503c2ffa6b9f', 'rabin', NULL, NULL, NULL, 'فاضل تبریک', NULL, '9387341083', NULL, 'شمیل , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('65d3f604-a7cc-430a-bb15-83fb1208f3cb', 'rabin', NULL, NULL, NULL, 'آذردخت محمودی', NULL, '9171616842', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('48840c93-d025-4405-88b4-0d6c85559b03', 'rabin', NULL, NULL, NULL, 'موسی جلال زاده', NULL, '9177611472', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('40bfd0db-11ea-4d14-b818-983830a65d95', 'rabin', NULL, NULL, NULL, 'علی رئیسی پورچاه خرگی', NULL, '9171630439', NULL, 'حسن لنگی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('105ad0ae-d50b-414f-8a57-7cabafb2b620', 'rabin', NULL, NULL, NULL, 'هادی درخش بندری', NULL, '9178774360', NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9fab14cf-4390-48ce-88c4-71c1b3bbfa4d', 'rabin', NULL, NULL, NULL, 'زهرا تارخ', NULL, '9382420600', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b6239d68-8067-433f-8b57-f8094fd0cd40', 'rabin', NULL, NULL, NULL, 'آزاده حسین پورکوهشاهی', NULL, '9173580851', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4b07eb0e-6c26-492d-a90e-6998ec5a0221', 'rabin', NULL, NULL, NULL, 'ناصر غلامپورجغانی', NULL, '9176549886', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead');
INSERT INTO `customers` (`id`, `tenant_key`, `first_name`, `last_name`, `company_name`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`, `source`, `tags`, `custom_fields`, `last_activity_date`, `lead_score`, `lifecycle_stage`) VALUES
('e65898bb-ce74-48ec-8401-a842f1435a69', 'rabin', NULL, NULL, NULL, 'مهدی برخورداری احمدی', NULL, '9385063171', NULL, 'تازیان , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5c28d661-f762-47e8-9319-f7da1cee5c7f', 'rabin', NULL, NULL, NULL, 'محمد نهنگ', NULL, '9177616718', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9c72ba2a-85f9-4855-a784-b005cb430dcb', 'rabin', NULL, NULL, NULL, 'محسن اخلاص وند', NULL, '9173695576', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1656f1bc-dbe0-4421-902e-d29a37d5e916', 'rabin', NULL, NULL, NULL, 'مرضیه زارعی', NULL, '9399795022', NULL, 'قلعه قاضی , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3d5b313e-926e-4c2e-b587-9b09fe937d4b', 'rabin', NULL, NULL, NULL, 'گوهر عالی زاده', NULL, '9371377311', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a97f84d1-ef5a-411c-8467-9c188fb57433', 'rabin', NULL, NULL, NULL, 'هدایت کمالی زرکانی', NULL, '9179543550', NULL, 'سیاهو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8747fc4e-e9a1-48ae-aa8f-aa4e712a2d98', 'rabin', NULL, NULL, NULL, 'محمد احمدی پناه نخلی', NULL, '9171613579', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6c1b78aa-0ed2-4733-9ec2-415d88a9c711', 'rabin', NULL, NULL, NULL, 'سعید رسولی', NULL, '9177636091', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6be31c4c-ae64-44db-913a-fd18ddc9dd96', 'rabin', NULL, NULL, NULL, 'آذردخت محمودی', NULL, '9171616842', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'تکثیر و پرورش اسب', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2c35a70b-ef5c-428a-88b1-13f186f71b17', 'rabin', NULL, NULL, NULL, 'کوشا طیور هرمزگان', NULL, NULL, NULL, 'تخت , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e9820688-4158-4888-be52-b4d8b565283c', 'rabin', NULL, NULL, NULL, 'حسن تارخ', NULL, '9177635404', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6da28e85-bf50-4155-bf49-a3b0e9ca6088', 'rabin', NULL, NULL, NULL, 'داود ماندگاری', NULL, '9302518915', NULL, 'ایسین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d05a2fb9-491c-485c-a95f-7eabba4a5cff', 'rabin', NULL, NULL, NULL, 'سیدسجاد موسوی نژاد', NULL, '9015717621', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('02dd645d-e918-4f24-8f53-aae2dc90c656', 'rabin', NULL, NULL, NULL, 'محمدرضا احمدی', NULL, '9308261183', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('10c3e79f-42fa-457b-a2ee-10c105a71a48', 'rabin', NULL, NULL, NULL, 'حسین شریفی', NULL, '9179838424', NULL, 'گچین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7fc1d4d4-2919-4abb-8b6b-284dedcd4ea1', 'rabin', NULL, NULL, NULL, 'علی چاشنی گر', NULL, '9177972337', NULL, 'دهنو , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3aabadd7-1068-4adf-8547-042f18424369', 'rabin', NULL, NULL, NULL, 'محمد جماتی پور', NULL, '9367181025', NULL, 'تازیان پایین , بندرعباس', 'بندرعباس', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7fbba2bb-4f11-4c47-b587-5125fccbb6eb', 'rabin', NULL, NULL, NULL, 'نسیبه سالاری فرد', NULL, '9177628806', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3f4c6df7-ae5c-4a21-84f5-8b06d879a002', 'rabin', NULL, NULL, NULL, 'لطیفه پرمود', NULL, '9016299616', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ae514c4f-ffa7-4928-ae3b-7eaade0f16d6', 'rabin', NULL, NULL, NULL, 'مسعود بحری لنگه', NULL, '9391622011', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرورش شتر داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ecf0b3a4-108f-40ad-9173-6ea00d739717', 'rabin', NULL, NULL, NULL, 'صغری حسین پور', NULL, '9053826886', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('544eb32c-98d2-4ee7-afd0-38231577f943', 'rabin', NULL, NULL, NULL, 'حسین بحری', NULL, '9173620390', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('de58f0ad-3d8d-48c2-9def-6d06294783b3', 'rabin', NULL, NULL, NULL, 'دریانورد', NULL, '9177620181', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('137bd7ad-7b4b-41df-aeee-da6001c6279c', 'rabin', NULL, NULL, NULL, 'بوران کوهین جنوب هوشمندنژاد', NULL, '9177622596', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2b6b02a9-fc0c-462d-b3f2-37e34a98aba7', 'rabin', NULL, NULL, NULL, 'یعقوب اسماعیلی', NULL, '9333571177', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8296a40c-a0c7-4399-a585-de64143ad492', 'rabin', NULL, NULL, NULL, 'صالح بردغونی', NULL, '9179938734', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fd21391a-becf-4646-8928-22e1ccfd30bc', 'rabin', NULL, NULL, NULL, 'داود بحری', NULL, '9173622744', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d112ba90-ce9e-403f-9dec-482bc5cfa176', 'rabin', NULL, NULL, NULL, 'صالح شیخ', NULL, '9171984569', NULL, 'دژگان , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرورش گوسفند داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0270a07d-821f-4418-9003-4d827e818d69', 'rabin', NULL, NULL, NULL, 'محمدصدیق پوریوسف', NULL, '9173625719', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('29c984e0-4fca-428c-92c3-d1dbd8a51e1c', 'rabin', NULL, NULL, NULL, 'محمد اسماعیلی', NULL, '9171621546', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('24dde397-1731-46ca-b415-80b905816857', 'rabin', NULL, NULL, NULL, 'ابراهیم زارعی', NULL, '9177629958', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b5c3015c-666a-465c-8ef2-318dfbbeebf0', 'rabin', NULL, NULL, NULL, 'محمد شتربان', NULL, '9179627369', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ef216fbb-6df9-47ff-81bb-dd712ff6276f', 'rabin', NULL, NULL, NULL, 'مبارکی', NULL, '9171621833', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('61d61b91-cd25-463e-bfa1-400fbb090e87', 'rabin', NULL, NULL, NULL, 'علیرضا فلاح', NULL, 'NoMobile', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3eea72a-7c2e-40dd-98b6-4d16dc0c158f', 'rabin', NULL, NULL, NULL, 'صفر شیرمحمدی', NULL, '9171607268', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('75062123-5679-4c74-995c-312c91c35376', 'rabin', NULL, NULL, NULL, 'محمدطاهر پوریوسف', NULL, '9377775883', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bb879bf5-5cff-4f63-bb0d-d23c64b98c66', 'rabin', NULL, NULL, NULL, 'علی پرقی', NULL, '9304741685', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5a6ecb2a-7527-48a7-becb-abd4d2c306c9', 'rabin', NULL, NULL, NULL, 'عبدالرحیم رحیمی', NULL, '9177621520', NULL, 'مهران , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('18880acd-97ca-4c7f-af3f-05f85d79da63', 'rabin', NULL, NULL, NULL, 'رضا رودانی', NULL, '9173622996', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0be60b41-1d65-4218-990a-646c4d03b2b8', 'rabin', NULL, NULL, NULL, 'آمنه آبنار', NULL, '9173620390', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e4e574e2-426e-4ca8-a294-ea092b4c74ec', 'rabin', NULL, NULL, NULL, 'سارا علوانیان سداوی', NULL, '9930219605', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('37cf7701-59ca-4fc1-83a2-7f4f14778b1c', 'rabin', NULL, NULL, NULL, 'نواب سالاری', NULL, '9916533810', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a00f980a-dddc-416d-97b4-c509ec84e917', 'rabin', NULL, NULL, NULL, 'عبدالرحمان کوه رولشتغانی', NULL, '9179474070', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('122d6ed2-e7f8-4de6-aec7-15b897b19ca5', 'rabin', NULL, NULL, NULL, 'احمدپور', NULL, '9171622177', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('239135d6-2f0a-4736-b8ba-ca339076a108', 'rabin', NULL, NULL, NULL, 'محمد کارستانی', NULL, '9173620353', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8ca6d18d-cc09-4334-80e1-2bcf781a7a6b', 'rabin', NULL, NULL, NULL, 'صفر کارگری', NULL, '9029953053', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('dd183c00-417e-4fef-a0af-71bde23898a4', 'rabin', NULL, NULL, NULL, 'عبداله شیرین زبان', NULL, '9171985039', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2744e1b5-77e9-40d9-8f9a-1523ed89bbfa', 'rabin', NULL, NULL, NULL, 'بی بی خدیجه آذری', NULL, '9177620443', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a3acbb08-7b53-4b03-aebf-9d410ce4d8bf', 'rabin', NULL, NULL, NULL, 'احمد فریدی', NULL, '9177622077', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('78c323b5-4bbc-4543-835d-d03b42c8efee', 'rabin', NULL, NULL, NULL, 'راشد خدادادزاده', NULL, '9384607222', NULL, 'مغویه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('49570838-d711-4a72-922b-e36e636e2ca0', 'rabin', NULL, NULL, NULL, 'محمود مبارکی', NULL, '9901935360', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bd09c32b-0ac3-4085-afb0-822451199501', 'rabin', NULL, NULL, NULL, 'ناصر شرف نیا', NULL, '9171992659', NULL, 'مقام , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('620d4c73-a82e-428c-b7f2-5e6ac9570cba', 'rabin', NULL, NULL, NULL, 'ناصر امیدی', NULL, '9177628626', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d3f29779-3fe5-42c1-b149-ee52fdd2afd2', 'rabin', NULL, NULL, NULL, 'لطیفه پوریوسف', NULL, '9173625719', NULL, 'حومه , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('220384b9-683c-442a-87fa-70a4e1d1e3ea', 'rabin', NULL, NULL, NULL, 'محمد اسماعیلی خمیری', NULL, '9177630191', NULL, 'دژگان , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fddf3930-c998-4398-99b2-960d5b0b5bf9', 'rabin', NULL, NULL, NULL, 'مسعود بارانی', NULL, '9177629098', NULL, 'چارک , بندرلنگه', 'بندرلنگه', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('6024ab9e-1017-4b31-8b90-c24b7c4495a8', 'rabin', NULL, NULL, NULL, 'گل مهر بندر', NULL, NULL, NULL, 'مهرگان , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2d08d32c-8eb7-4b07-8848-5afc1058d513', 'rabin', NULL, NULL, NULL, 'حسن حمیرانی', NULL, '9177625075', NULL, 'بوچیر , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8ded286c-5e72-4b45-9c13-5bfad6099d82', 'rabin', NULL, NULL, NULL, 'سهراب عبدی', NULL, '9177623178', NULL, 'مهرگان , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c93b05a3-31ef-4c6f-aae5-0d663d2eb569', 'rabin', NULL, NULL, NULL, 'محمد غواصی', NULL, '9177623182', NULL, 'مهرگان , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3d0f03ae-3eab-4804-bc02-9999fb052e06', 'rabin', NULL, NULL, NULL, 'محمد یوسفی', NULL, '9170347486', NULL, 'پارسیان , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2cd00cbb-50cf-422d-9eb6-3e9fbcbb927f', 'rabin', NULL, NULL, NULL, 'محمد برزگری', NULL, '9173640669', NULL, 'کوشکنار , پارسیان', 'پارسیان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bcb71c8b-6f82-40f1-9992-747eeb444fa9', 'rabin', NULL, NULL, NULL, 'علی هوت', NULL, '9171654007', NULL, 'گابریک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('45d73e86-7388-41c2-9475-1fbf3c26ff6e', 'rabin', NULL, NULL, NULL, 'حسنیه صبوری جاسکی', NULL, '9394660041', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('296f8782-4c1e-4e0e-b908-56fa87c7c087', 'rabin', NULL, NULL, NULL, 'قادر جنگی زهی', NULL, '9177663343', NULL, 'گابریک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c919e336-e639-4ff9-b785-1888df7eae06', 'rabin', NULL, NULL, NULL, 'ابراهیم محمدی', NULL, '9014568834', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('32021918-52e7-4fef-8594-98e2824b7e2e', 'rabin', NULL, NULL, NULL, 'حمید رحماندوست', NULL, '9387640438', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('daf0d919-3104-430e-b870-279051aab44c', 'rabin', NULL, NULL, NULL, 'پیربخش پابرجا', NULL, '9173652060', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b72daba0-b964-436b-a645-f83a0a34d874', 'rabin', NULL, NULL, NULL, 'وحید داوری', NULL, '9391443265', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e7652bb5-ec45-44b4-87f2-eb4764555530', 'rabin', NULL, NULL, NULL, 'مراد رحیمی', NULL, '9179836203', NULL, 'جاسک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ad3dd768-8fc8-4d7c-b3e2-8646fb2cf5dc', 'rabin', NULL, NULL, NULL, 'سلیم زومکی جاشکی', NULL, '9179440069', NULL, 'گابریک , جاسک', 'جاسک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7dce6514-ef6b-4ac8-ab96-644bfb6a8474', 'rabin', NULL, NULL, NULL, 'مهدی دهقانی', NULL, '9179592857', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d20538b5-ff09-4991-a935-697ac59322cb', 'rabin', NULL, NULL, NULL, 'پروش شتر زادمحمود حاجی آباد', NULL, NULL, NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی شتر', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e94640e0-8687-40da-a976-1db010bbedbf', 'rabin', NULL, NULL, NULL, 'کبری علی محمدی معدنوئی', NULL, '9173634188', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e6158c0e-80df-4166-ba04-1b89dfa7e502', 'rabin', NULL, NULL, NULL, 'علی هاشمی پورپتکوئی', NULL, '9367635003', NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرورش گوسفند داشتی', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('89ced23f-c00a-45af-8cc8-d58be072454c', 'rabin', NULL, NULL, NULL, 'اباسلت قاسمی نژادراینی', NULL, '9171681711', NULL, 'حاجی اباد , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ceea6f8a-b88a-474c-ad16-5fad3b10b1de', 'rabin', NULL, NULL, NULL, 'حسین سالاری باکانی', NULL, '9171652134', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('02fdbd04-6e14-421a-a783-0aef8e703348', 'rabin', NULL, NULL, NULL, 'مرضیه امیری', NULL, 'NoMobile', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e866363c-3f05-4c1a-b49c-9ea1acdc2bb2', 'rabin', NULL, NULL, NULL, 'اکرم ناطقی', NULL, '9021464755', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ff31cdfc-76df-471d-a47b-44e9579b099f', 'rabin', NULL, NULL, NULL, 'خجسته دهقانی', NULL, '9933343847', NULL, 'احمدئ , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('15742f7d-a01a-44a4-b002-2172da2966e7', 'rabin', NULL, NULL, NULL, 'عبدالله حجتی', NULL, '9138552364', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a56a6b19-25c5-40b1-ad3b-51a7730da4cb', 'rabin', NULL, NULL, NULL, 'معین شمسائی طارمی', NULL, '9178599590', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d19ac2f9-871b-4c9a-9a8c-d2c3be32635a', 'rabin', NULL, NULL, NULL, 'حسن زاده', NULL, '9173604560', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2361d2eb-5971-4d7c-8e90-82760e67f50b', 'rabin', NULL, NULL, NULL, 'پرویز توسلی سیرمندی', NULL, '9174183574', NULL, 'فارغان , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('02f721e7-879e-43a2-a166-bad25886b1ea', 'rabin', NULL, NULL, NULL, 'رضا برخورداری', NULL, '9173593160', NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('71d07783-65e9-4a41-aaf4-ce9cba38a35a', 'rabin', NULL, NULL, NULL, 'علی فدائی', NULL, '9372017449', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f523a17b-80d0-4907-9072-e1d5e6c9d008', 'rabin', NULL, NULL, NULL, 'داور باوقارزعمی', NULL, '9121099218', NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('73ea373e-a513-4db3-aff5-7dec90a3605e', 'rabin', NULL, NULL, NULL, 'حسن سالارحسینی', NULL, '9173639896', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3b37c130-1e6a-47f9-9c16-6f29270ec696', 'rabin', NULL, NULL, NULL, 'رقیه رستمی', NULL, '9173593365', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0fa443de-98e5-47cd-a0b9-e72a463f7692', 'rabin', NULL, NULL, NULL, 'نعیمه بیگلری پور', NULL, '9171572631', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('74590835-d0d6-46f9-855e-347e3e33b1a8', 'rabin', NULL, NULL, NULL, 'حسن مقدسی', NULL, '9171681406', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c8036c70-67e4-4560-b6e5-f30aa403a7fa', 'rabin', NULL, NULL, NULL, 'شهریار طهماسب پورافشار', NULL, '9171634037', NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c2ffcb18-bd6a-4767-9b2b-05d9492c9e63', 'rabin', NULL, NULL, NULL, 'رضا هرچگانی', NULL, '9114335874', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a5eac178-1328-4c2d-8d01-f576cce80251', 'rabin', NULL, NULL, NULL, 'زهرا صفرپور', NULL, '9175924525', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8ced1571-a3d8-4c91-8e03-7bd8094bda42', 'rabin', NULL, NULL, NULL, 'محسن سالاری سیرمندی', NULL, '9171674776', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c69d0a8f-1568-4c86-a2a3-2aa6a01e3f96', 'rabin', NULL, NULL, NULL, 'الهه رستمی', NULL, '9171573037', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:08', '2025-10-12 20:08:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('113ee00f-9f01-4e34-a3c7-ac24ffa4ceca', 'rabin', NULL, NULL, NULL, 'لیلا سالاری', NULL, '9171681934', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('68a9c73b-94af-4829-a2f0-66fd9ece5905', 'rabin', NULL, NULL, NULL, 'شهرام برخورداری احمدی', NULL, '9173611072', NULL, 'طارم , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9a532a2d-74c4-45c2-8924-a99c51d0b211', 'rabin', NULL, NULL, NULL, 'ذبیح اله حقجو', NULL, '9179568337', NULL, 'فارغان , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8c2a4045-740f-436c-badc-8f5ecc0a8c19', 'rabin', NULL, NULL, NULL, 'خداداد جعفری', NULL, '9177632962', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('056d9692-4c6c-4edc-87f4-a65d0b5d0375', 'rabin', NULL, NULL, NULL, 'گل جان محمودی گوغری', NULL, '9120776005', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('00e624b9-898a-4c57-b591-805c111bf0c1', 'rabin', NULL, NULL, NULL, 'علی سلیمانی', NULL, '9171617938', NULL, 'احمدئ , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('10a21222-8ba5-49da-938a-eb94ba0e3845', 'rabin', NULL, NULL, NULL, 'مسلم فدائی', NULL, '9367630010', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('faa221d4-e6c3-4138-bef6-a172c4afc1c4', 'rabin', NULL, NULL, NULL, 'کیامرز شریفی شمیلی', NULL, '9902078548', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7462383f-cd56-4701-b3de-f47baa629495', 'rabin', NULL, NULL, NULL, 'حمیدرضا حسن زاده حاجی آبادی', NULL, '9177632400', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bf340757-d7bb-433a-88e8-e6a12e1fc5a4', 'rabin', NULL, NULL, NULL, 'حمیدرضا فرامرزی نژادحاجی آبادی', NULL, '9937859294', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('84d91a5b-9ff8-4205-9f24-1b9ed970bac7', 'rabin', NULL, NULL, NULL, 'حسین علی محمدی', NULL, '9176928398', NULL, 'حاجی اباد , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('07651278-95b1-475f-b708-63bb990ff7ed', 'rabin', NULL, NULL, NULL, 'حامد پورابراهیم آبادی', NULL, '9176463065', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3436887a-6340-4600-b47f-72d75d002819', 'rabin', NULL, NULL, NULL, 'علیرضا مجنون پور', NULL, '9173604560', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرورش گاو شیری', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9dc8bb7b-8330-4258-af7c-fa94e4899c4f', 'rabin', NULL, NULL, NULL, 'ضرغام عالی پوراحمدی', NULL, '9179002413', NULL, 'احمدئ , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('11ce5e8f-204d-42c3-abae-2145b09535b8', 'rabin', NULL, NULL, NULL, 'آقای امیری', NULL, '9179547256', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5e32f0ff-0f41-4ea9-bbf9-a6a131229285', 'rabin', NULL, NULL, NULL, 'حسین توسلی سیرمندی', NULL, '9171681315', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('088ac40a-c23a-4fe5-93be-0684ca56a853', 'rabin', NULL, NULL, NULL, 'موسی پور', NULL, '9171682712', NULL, 'درآگاه , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a1cfc26b-5fc3-4f6e-a799-f3db7cd8f4a0', 'rabin', NULL, NULL, NULL, 'رضا نبوی', NULL, '9171682529', NULL, 'آشکارا , حاجی آباد', 'حاجی آباد', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'low', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('83bf3a82-c5a8-4858-8ed8-01be0cb1a970', 'rabin', NULL, NULL, NULL, 'احمد چراغ سحر', NULL, '9037163040', NULL, 'پل , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0529b0ef-0eb8-4b03-90d3-e8a503fe8eed', 'rabin', NULL, NULL, NULL, 'محمدامین درسی', NULL, '9176251488', NULL, 'کهورستان , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b308a737-44b4-4f83-be46-6d8197632e15', 'rabin', NULL, NULL, NULL, 'آرزو موسوی', NULL, '9177697039', NULL, 'خمیر , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ebc7e1ec-8c6c-4f5e-a618-d368a828b512', 'rabin', NULL, NULL, NULL, 'یوسف درخوار', NULL, '9179447902', NULL, 'رودبار , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('200a51df-8410-4edb-a283-4b79879fe697', 'rabin', NULL, NULL, NULL, 'علی نظری', NULL, '9173670338', NULL, 'کهورستان , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7eeaa5c0-16ba-446d-a95c-a8ed73ee71e3', 'rabin', NULL, NULL, NULL, 'احمد درا', NULL, '9175452845', NULL, 'کهورستان , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8687a3c5-a322-4eaa-b600-9cb148fe0f06', 'rabin', NULL, NULL, NULL, 'حسین روح زاد', NULL, '9178634941', NULL, 'رودبار , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('05adbeb7-b3e4-4ede-a01c-cfccbf120e0e', 'rabin', NULL, NULL, NULL, 'عاطفه آسریس', NULL, '9371677402', NULL, 'خمیر , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c97c2525-0ed0-4390-97d7-d54f8dd13260', 'rabin', NULL, NULL, NULL, 'عبداله راینی', NULL, '9171680754', NULL, 'خمیر , خمیر', 'خمیر', 'هرمزگان', 'Iran', NULL, 'پرورش شتر داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('930f2156-de33-4ca9-bf57-794423d11518', 'rabin', NULL, NULL, NULL, 'فریبا سالاری', NULL, '9179021837', NULL, 'راهدار , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f977ea32-6953-4f51-8218-05d7495ebc73', 'rabin', NULL, NULL, NULL, 'چنگیز اعتصام', NULL, '9172880138', NULL, 'رودخانه بر , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ec2e70a4-2f53-45a0-a3c3-e9c3cbccc81a', 'rabin', NULL, NULL, NULL, 'امین فیروززاده', NULL, '9026416526', NULL, 'بیکاء , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('402e8d22-5c52-49ef-8913-1224950956aa', 'rabin', NULL, NULL, NULL, 'احمد سالاری', NULL, '9024749099', NULL, 'برنطین , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('26800ccf-7c16-4535-a0fc-9a58d708344f', 'rabin', NULL, NULL, NULL, 'ایرج حاجبی', NULL, '9179947084', NULL, 'راهدار , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('71f11060-81b0-4dc5-9169-7b8073ff3cd4', 'rabin', NULL, NULL, NULL, 'علی گردخانی', NULL, '9179444700', NULL, 'اسلام آباد , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2f3502eb-9d23-438d-a741-e28f36fd279a', 'rabin', NULL, NULL, NULL, 'مظفر نجفی', NULL, '9177660072', NULL, 'فاریاب , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1159bf67-c0c4-4327-8ab8-bfb94e77a345', 'rabin', NULL, NULL, NULL, 'فاطمه جاودان', NULL, '9176910515', NULL, 'برنطین , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c91e70ea-25dd-455d-925d-5f9118e675fc', 'rabin', NULL, NULL, NULL, 'حسین شریف زاده', NULL, '9179657233', NULL, 'آب نما , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d07d1fb0-2b8b-49c5-91f3-4f9ed1282cd7', 'rabin', NULL, NULL, NULL, 'مرتضی پوریان', NULL, '9173676505', NULL, 'دهبارز , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c84e7188-97d5-44d1-8d95-9b9d83007ae7', 'rabin', NULL, NULL, NULL, 'امین شاکری', NULL, '9176471678', NULL, 'راهدار , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('83985881-4a17-4e37-bcc8-89966ed59d9b', 'rabin', NULL, NULL, NULL, 'تولیدی امید جغین', NULL, NULL, NULL, 'جغین جنوبی , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('38add8e1-5b14-45a5-932d-0dc6be6dbeff', 'rabin', NULL, NULL, NULL, 'گاوداری گلستان رودان', NULL, NULL, NULL, 'اسلام آباد , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead');
INSERT INTO `customers` (`id`, `tenant_key`, `first_name`, `last_name`, `company_name`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`, `source`, `tags`, `custom_fields`, `last_activity_date`, `lead_score`, `lifecycle_stage`) VALUES
('f8d09c82-82bc-49f1-98c3-e4266bd2d765', 'rabin', NULL, NULL, NULL, 'غلامرضا انباز', NULL, '9173661250', NULL, 'مسافرآباد , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:45', '2025-10-12 20:08:45', NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9aaeda61-705a-4028-abe6-a55bb6b1fff1', 'rabin', NULL, NULL, NULL, 'اسماء مارزی', NULL, '9178644628', NULL, 'راهدار , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('10e1447a-b806-42db-9517-9e336401a01a', 'rabin', NULL, NULL, NULL, 'ابراهیم خالصی', NULL, '9175786606', NULL, 'رودخانه بر , رودان', 'رودان', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('69da9e46-f92e-4ad2-a1e3-6d550f0c9684', 'rabin', NULL, NULL, NULL, 'ابراهیم جمالدینی', NULL, '9173650078', NULL, 'گروک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('2edc493e-72d7-4ddd-b0eb-cb86eae09f29', 'rabin', NULL, NULL, NULL, 'احمد آرسته', NULL, '9179658850', NULL, 'گروک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ea120875-bc0a-4433-9719-6635883af102', 'rabin', NULL, NULL, NULL, 'حمید میرزائی', NULL, '9351976505', NULL, 'سیریک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('998e3c73-2bd2-48dc-8f55-aa20206f2fc4', 'rabin', NULL, NULL, NULL, 'موسی پرستش', NULL, '9179660273', NULL, 'بیابان , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4723bd4c-8300-4fb1-9dd5-94d12851ae20', 'rabin', NULL, NULL, NULL, 'یونس شاهی زاده میشی', NULL, '9960865402', NULL, 'سیریک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرورش شتر داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('d6c21ca9-b29e-4a87-8b09-a12bc2bbf4c6', 'rabin', NULL, NULL, NULL, 'یوسف حسینی پور', NULL, '9173662311', NULL, 'سیریک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('605e38d1-3b81-44ae-9d90-cfe5f7892b8c', 'rabin', NULL, NULL, NULL, 'مسعود حسینی زاده سیریک', NULL, '9375776585', NULL, 'سیریک , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e238fa57-b204-418f-9a53-96fecf765156', 'rabin', NULL, NULL, NULL, 'احمد خاکی زاده', NULL, '9021650120', NULL, 'بمانی , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ec2b64c9-b18d-4d6d-9b2b-0b01b93d47a1', 'rabin', NULL, NULL, NULL, 'ابراهیم عبادی نژاد', NULL, '9177653268', NULL, 'بیابان , سیریک', 'سیریک', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('5fe36a38-ebf7-469f-a541-42fd0dc0e22d', 'rabin', NULL, NULL, NULL, 'نام نام خانوادگی', NULL, 'موبایل', NULL, 'دهستان , شهرستان', 'شهرستان', 'هرمزگان', 'Iran', NULL, 'نام محصول', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('b8293e60-5922-4044-bcfa-c1c7f537a87d', 'rabin', NULL, NULL, NULL, 'زیبا حسین پور', NULL, '9177672513', NULL, 'رمکان , قشم', 'قشم', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fa3ebd49-e907-4532-a575-a505f9ae73ee', 'rabin', NULL, NULL, NULL, 'الهام شهدوستی', NULL, '9179850821', NULL, 'توکهور , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e5967a4b-df5f-45b9-b119-2c0232b5867a', 'rabin', NULL, NULL, NULL, 'علی زاهدی', NULL, '9212915745', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('57b251f2-3d3f-437d-99f4-1530c75ed04c', 'rabin', NULL, NULL, NULL, 'عباس جعفری نسب نصیرائی نیا', NULL, '9301351498', NULL, 'توکهور , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fb45d423-3bb4-4fa6-8e8d-bca7db5a1a20', 'rabin', NULL, NULL, NULL, 'مرتضی رنجبر', NULL, '9385801480', NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('68cf8379-02e0-47f8-8dbc-787b99554812', 'rabin', NULL, NULL, NULL, 'عبدالحمید زارعی', NULL, '9171654284', NULL, 'بندر , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('761717c2-b862-41bc-87b3-543e73ec0421', 'rabin', NULL, NULL, NULL, 'محسن رنجبر', NULL, '9176307793', NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ee342afb-0a9e-4f2d-b014-3556a6c37fcb', 'rabin', NULL, NULL, NULL, 'اسحق احمدی', NULL, '9179479635', NULL, 'بندزرک , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('18ed0610-785c-4e61-abda-55bfdcad004a', 'rabin', NULL, NULL, NULL, 'محمدرضا مهدی حسینی', NULL, '9177653393', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('c222cb34-614d-43a2-847f-54bdf9466ae6', 'rabin', NULL, NULL, NULL, 'عبداله حاتمی', NULL, '9021650018', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('70977069-bddd-4a8b-ac3d-cb08109774d2', 'rabin', NULL, NULL, NULL, 'عباس صادقی', NULL, '9171661189', NULL, 'تیاب , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('8294e666-9f8d-44a2-b9ee-5b73e23ea3af', 'rabin', NULL, NULL, NULL, 'عباس احمدی سولقانی', NULL, '9171651500', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی بره', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('fbd19313-d386-49d3-8e75-30d94cd8762f', 'rabin', NULL, NULL, NULL, 'مهدی زارعی', NULL, '9177656618', NULL, 'تیرور , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('56207a8e-7430-49b5-9a6b-33f66d0612b3', 'rabin', NULL, NULL, NULL, 'زینب امینی دومشهری', NULL, '9101896110', NULL, 'گوربند , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3e1daff8-1849-4a96-96ae-a717b57cf449', 'rabin', NULL, NULL, NULL, 'دامداران مکران آنامیس', NULL, NULL, NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('33f9fc3f-867c-4d53-b7fe-a40fd743bc27', 'rabin', NULL, NULL, NULL, 'عبداله شهریاری میناب', NULL, '9171651191', NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('feb08474-b076-45a6-9b2f-fd70e0aac25f', 'rabin', NULL, NULL, NULL, 'شهربان رنجبریان', NULL, '9177655237', NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('16f6441b-ea20-4145-ae19-39b6d2eadc4e', 'rabin', NULL, NULL, NULL, 'حسن دلاوری فردباغی', NULL, '9394674818', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('1aba6e8c-aba3-4a9b-9cc6-5907b8753615', 'rabin', NULL, NULL, NULL, 'محمد زاکری', NULL, '9132487402', NULL, 'چراغ آباد , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ee36e68c-5bb6-4311-b547-2beb75ffa6a5', 'rabin', NULL, NULL, NULL, 'زینت گرگین زاده', NULL, '9179664534', NULL, 'سندرک , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('7ccefa3f-1796-4589-a52b-5d672b13af8d', 'rabin', NULL, NULL, NULL, 'مسیحا اسلامی', NULL, '9179534941', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('3aaabc79-7296-4ccd-b920-e194797f17bc', 'rabin', NULL, NULL, NULL, 'محمد ذاکری درباغی', NULL, '9176236858', NULL, 'بندزرک , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('4534b3fc-3ebc-4e1b-bed0-6335e7e618a6', 'rabin', NULL, NULL, NULL, 'محمدرضا مهدی حسینی', NULL, '9177653393', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a76bfbca-bd86-4ff0-9e08-76569e5559d2', 'rabin', NULL, NULL, NULL, 'پرواربندی گوساله احسان تلنگ', NULL, NULL, NULL, 'کریان , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f8d9f943-3976-46ec-9d43-69a27f0ea499', 'rabin', NULL, NULL, NULL, 'مرضیه سلطانی', NULL, '9309265375', NULL, 'حومه , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرورش بز داشتی', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('ed402821-6239-438e-9c4a-880e2bbf8b8b', 'rabin', NULL, NULL, NULL, 'خذیف غفوری عباسی', NULL, '9171668395', NULL, 'تیاب , میناب', 'میناب', 'هرمزگان', 'Iran', NULL, 'پرواربندی گوساله', '', 0.00, 'prospect', 'small_business', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-12 20:08:09', '2025-10-12 20:08:09', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('914e8646-b9cf-4abb-bb0a-cd1ac7e5e5f3', 'rabin', NULL, NULL, NULL, 'مشتری تستی', 'test1760466215783@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'individual', 'medium', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 18:23:35', '2025-10-14 18:23:35', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f7edb9b0-0d85-4782-9743-bc688816d1b6', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468048855', 'test1760468045688@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 18:54:05', '2025-10-14 18:54:08', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('f016ce54-973b-4b56-9275-3b454d699ff6', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468356771', 'test1760468356559@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 18:59:16', '2025-10-14 18:59:16', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('e690df57-d31a-499b-84bb-4e14874cc28f', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468364081', 'test1760468363926@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'd497a492-f183-4452-86c1-961e5a0e3e22', 0, NULL, NULL, 0.00, '2025-10-14 18:59:23', '2025-10-14 18:59:24', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('815f4c0c-b27c-4a4b-a598-518d47cb5027', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468586569', 'test1760468584019@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 19:03:04', '2025-10-14 19:03:06', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('0c2a79f8-e27b-4299-bd27-2c6e01f4436f', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468607984', 'test1760468607784@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'd497a492-f183-4452-86c1-961e5a0e3e22', 0, NULL, NULL, 0.00, '2025-10-14 19:03:27', '2025-10-14 19:03:28', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('146690b0-5551-47aa-bdbd-1a0b1da20442', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468690103', 'test1760468689869@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 19:04:49', '2025-10-14 19:04:50', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('9f3e2b3f-605e-4c4f-b511-acda0949c46b', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468703158', 'test1760468702975@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'd497a492-f183-4452-86c1-961e5a0e3e22', 0, NULL, NULL, 0.00, '2025-10-14 19:05:03', '2025-10-14 19:05:03', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('bb4af0df-a466-46e6-9e99-3cc4e40a8b6e', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468764180', 'test1760468764021@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-10-14 19:06:04', '2025-10-14 19:06:04', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead'),
('a28cd576-d887-4255-a271-85d02fcfc029', 'rabin', NULL, NULL, 'شرکت تستی', 'مشتری به‌روز شده 1760468771165', 'test1760468770991@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'prospect', 'small_business', 'high', 'd497a492-f183-4452-86c1-961e5a0e3e22', 0, NULL, NULL, 0.00, '2025-10-14 19:06:11', '2025-10-14 19:06:11', NULL, NULL, 0, NULL, NULL, NULL, NULL, 0, 'lead');

-- --------------------------------------------------------

--
-- Table structure for table `customer_current_stage`
--

CREATE TABLE `customer_current_stage` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `current_stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_current_stage`
--

INSERT INTO `customer_current_stage` (`id`, `customer_id`, `current_stage_id`, `entered_at`, `updated_at`) VALUES
('d4ffabb0-91a7-11f0-9190-581122e4f0be', 'd44facc0-75b3-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d4ffcc0c-91a7-11f0-9190-581122e4f0be', 'd44fd871-75b3-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d4ffcce1-91a7-11f0-9190-581122e4f0be', 'fa490a71-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d4ffcd4e-91a7-11f0-9190-581122e4f0be', 'fa49480a-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d4ffcdb7-91a7-11f0-9190-581122e4f0be', 'fa49498b-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d4ffce4b-91a7-11f0-9190-581122e4f0be', 'fa4949df-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5000b76-91a7-11f0-9190-581122e4f0be', 'fa494b28-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5000c22-91a7-11f0-9190-581122e4f0be', 'fa494b85-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5000cb4-91a7-11f0-9190-581122e4f0be', 'fa494c4a-75b6-11f0-9306-e35500020927', 'stage-001', '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5000d2c-91a7-11f0-9190-581122e4f0be', 'fa494c98-75b6-11f0-9306-e35500020927', 'stage-003', '2025-09-14 20:17:26', '2025-09-15 18:43:15'),
('d5000da1-91a7-11f0-9190-581122e4f0be', '92df42e9-f691-4167-9358-2f9dfe41566d', 'stage-002', '2025-09-14 20:17:26', '2025-09-14 20:17:52'),
('a90ffd2e-9e96-11f0-9ce7-66471fedf601', '82ccda6c-5b96-49d5-a010-6446468f4cc3', 'stage-001', '2025-10-01 07:17:16', '2025-10-01 07:17:16'),
('41e4f021-a7a7-11f0-b1c0-581122e4f0be', 'f8d09c82-82bc-49f1-98c3-e4266bd2d765', 'stage-001', '2025-10-12 20:08:45', '2025-10-12 20:08:45');

-- --------------------------------------------------------

--
-- Table structure for table `customer_health`
--

CREATE TABLE `customer_health` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `overall_score` int(11) DEFAULT 50,
  `usage_score` int(11) DEFAULT 50,
  `satisfaction_score` int(11) DEFAULT 50,
  `financial_score` int(11) DEFAULT 50,
  `support_score` int(11) DEFAULT 50,
  `risk_level` enum('low','medium','high') DEFAULT 'medium',
  `risk_factors` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`risk_factors`)),
  `calculated_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_journey`
--

CREATE TABLE `customer_journey` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NULL DEFAULT current_timestamp(),
  `exited_at` timestamp NULL DEFAULT NULL,
  `interaction_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_journey_stages`
--

CREATE TABLE `customer_journey_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_pipeline_progress`
--

CREATE TABLE `customer_pipeline_progress` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `stage_id` varchar(36) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customer_pipeline_progress`
--

INSERT INTO `customer_pipeline_progress` (`id`, `customer_id`, `stage_id`, `is_completed`, `completed_at`, `completed_by`, `notes`, `created_at`, `updated_at`) VALUES
('d0d6fde8-9263-11f0-9c8f-581122e4f0be', 'fa494c98-75b6-11f0-9306-e35500020927', 'stage-002', 1, '2025-09-15 18:43:05', 'ceo-001', '', '2025-09-15 18:43:05', '2025-09-15 18:43:05'),
('d5028ad8-91a7-11f0-9190-581122e4f0be', 'fa490a71-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-01 06:30:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d50291e4-91a7-11f0-9190-581122e4f0be', 'fa49480a-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-02 08:00:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d50292ae-91a7-11f0-9190-581122e4f0be', 'fa49498b-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-03 10:45:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d502932a-91a7-11f0-9190-581122e4f0be', 'fa4949df-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-04 06:15:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d502939d-91a7-11f0-9190-581122e4f0be', 'fa494b28-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-05 12:50:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5029413-91a7-11f0-9190-581122e4f0be', 'fa494b85-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-06 05:00:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5029478-91a7-11f0-9190-581122e4f0be', 'fa494c4a-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-07 08:30:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d50294dd-91a7-11f0-9190-581122e4f0be', 'fa494c98-75b6-11f0-9306-e35500020927', 'stage-001', 1, '2024-12-08 12:15:00', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5029548-91a7-11f0-9190-581122e4f0be', 'd44facc0-75b3-11f0-9306-e35500020927', 'stage-001', 1, '2025-08-10 06:33:51', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d50295ac-91a7-11f0-9190-581122e4f0be', 'd44fd871-75b3-11f0-9306-e35500020927', 'stage-001', 1, '2025-08-10 06:33:51', NULL, NULL, '2025-09-14 20:17:26', '2025-09-14 20:17:26'),
('d5029611-91a7-11f0-9190-581122e4f0be', '92df42e9-f691-4167-9358-2f9dfe41566d', 'stage-001', 1, '2025-09-14 20:17:46', 'ceo-001', '', '2025-09-14 20:17:26', '2025-09-14 20:17:46'),
('d7257ad9-9263-11f0-9c8f-581122e4f0be', 'fa494c98-75b6-11f0-9306-e35500020927', 'stage-003', 1, '2025-09-15 18:43:15', 'ceo-001', '', '2025-09-15 18:43:15', '2025-09-15 18:43:15'),
('e4967d53-91a7-11f0-9190-581122e4f0be', '92df42e9-f691-4167-9358-2f9dfe41566d', 'stage-002', 1, '2025-09-14 20:17:52', 'ceo-001', '', '2025-09-14 20:17:52', '2025-09-14 20:17:52'),
('a90cd510-9e96-11f0-9ce7-66471fedf601', '82ccda6c-5b96-49d5-a010-6446468f4cc3', 'stage-001', 0, NULL, NULL, '', '2025-10-01 07:17:16', '2025-10-01 07:17:57'),
('41e1c86a-a7a7-11f0-b1c0-581122e4f0be', 'f8d09c82-82bc-49f1-98c3-e4266bd2d765', 'stage-001', 1, '2025-10-12 20:08:45', 'ceo-001', '', '2025-10-12 20:08:45', '2025-10-12 20:08:45');

-- --------------------------------------------------------

--
-- Table structure for table `customer_product_interests`
--

CREATE TABLE `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_product_interests`
--

INSERT INTO `customer_product_interests` (`id`, `customer_id`, `product_id`, `interest_level`, `notes`, `created_at`, `updated_at`) VALUES
('14970bef-d4a9-4a44-b21b-92b6999a5ce4', '0a1f7353-5dea-4250-ab6d-4c3997b2862e', 'ceb035fc-c022-4ed8-b040-50b342349522', 'medium', NULL, '2025-10-11 17:53:53', '2025-10-11 17:53:53'),
('e8e8bac9-1a55-44e9-959a-13f05d31a103', '92c0e90e-3a30-4a62-a092-0a7b20649252', 'prod-001', 'medium', NULL, '2025-10-11 16:31:45', '2025-10-11 16:31:45'),
('int-001', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-001', 'high', 'علاقه‌مند به خرید خط کامل تولید', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('int-002', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-004', 'medium', 'نیاز به سیستم انتقال', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('int-003', '13876975-2160-4903-acb0-53102d194d77', 'prod-002', 'high', 'نیاز فوری به میکسر', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('int-004', '13876975-2160-4903-acb0-53102d194d77', 'prod-003', 'medium', 'آسیاب فعلی کارایی ندارد', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('int-005', '18f05b00-f033-479d-b824-ceeb580377da', 'prod-002', 'low', 'در حال بررسی گزینه‌ها', '2025-10-11 16:12:51', '2025-10-11 16:12:51');

-- --------------------------------------------------------

--
-- Table structure for table `customer_tags`
--

CREATE TABLE `customer_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customer_tags_new`
--

CREATE TABLE `customer_tags_new` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='برچسب‌های مشتری جدید';

-- --------------------------------------------------------

--
-- Table structure for table `customer_tag_relations`
--

CREATE TABLE `customer_tag_relations` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='رابطه مشتری-برچسب';

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `user_id` varchar(36) NOT NULL,
  `report_date` date NOT NULL,
  `persian_date` varchar(20) NOT NULL,
  `work_description` text NOT NULL,
  `completed_tasks` text DEFAULT NULL,
  `working_hours` decimal(4,2) DEFAULT NULL,
  `challenges` text DEFAULT NULL,
  `achievements` text DEFAULT NULL,
  `status` enum('draft','submitted') DEFAULT 'submitted',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='گزارش‌های روزانه کاربران';

--
-- Dumping data for table `daily_reports`
--

INSERT INTO `daily_reports` (`id`, `tenant_key`, `user_id`, `report_date`, `persian_date`, `work_description`, `completed_tasks`, `working_hours`, `challenges`, `achievements`, `status`, `created_at`, `updated_at`) VALUES
('60927ef5-7b0e-4f99-bf6e-d888107dd9ce', 'rabin', '9f6b90b9-0723-4261-82c3-cd54e21d3995', '2025-10-01', '۱۴۰۴/۰۷/۰۹', 'تست نرم افزار تموم شده و وارد مراحل دیپلوی شدم', '[]', 5.00, NULL, 'حل مشکلات جزعی سیستم', 'submitted', '2025-10-01 16:27:33', '2025-10-01 16:27:33');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `customer_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `total_value` decimal(15,2) NOT NULL DEFAULT 0.00,
  `currency` varchar(3) DEFAULT 'IRR',
  `stage_id` varchar(36) NOT NULL,
  `probability` int(11) DEFAULT 50,
  `expected_close_date` date DEFAULT NULL,
  `actual_close_date` date DEFAULT NULL,
  `assigned_to` varchar(36) NOT NULL,
  `loss_reason` text DEFAULT NULL,
  `won_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `current_stage_entered_at` timestamp NULL DEFAULT current_timestamp(),
  `next_follow_up_date` timestamp NULL DEFAULT NULL,
  `sales_notes` text DEFAULT NULL,
  `customer_budget` decimal(15,2) DEFAULT NULL,
  `decision_maker` varchar(255) DEFAULT NULL,
  `competition_info` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deals`
--

INSERT INTO `deals` (`id`, `tenant_key`, `customer_id`, `title`, `description`, `total_value`, `currency`, `stage_id`, `probability`, `expected_close_date`, `actual_close_date`, `assigned_to`, `loss_reason`, `won_reason`, `created_at`, `updated_at`, `current_stage_entered_at`, `next_follow_up_date`, `sales_notes`, `customer_budget`, `decision_maker`, `competition_info`) VALUES
('deal-001', 'rabin', '0095c921-5a12-4e0b-bcbe-3f3b4810c40b', 'فروش نرم‌افزار CRM', NULL, 50000000.00, 'IRR', 'stage-005', 70, '2025-11-15', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:32', '2025-10-11 18:27:32', '2025-10-11 18:27:32', NULL, NULL, NULL, NULL, NULL),
('deal-002', 'rabin', '018442c8-46db-4f8c-b4a9-fa8ff9e844dc', 'پروژه پیاده‌سازی سیستم', NULL, 120000000.00, 'IRR', 'stage-004', 50, '2025-12-01', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:32', '2025-10-11 18:27:32', '2025-10-11 18:27:32', NULL, NULL, NULL, NULL, NULL),
('deal-003', 'rabin', '0da78725-536c-46f8-b7e7-3e704614066c', 'خرید محصولات', NULL, 80000000.00, 'IRR', 'stage-006', 100, '2025-10-05', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:32', '2025-10-11 18:27:32', '2025-10-11 18:27:32', NULL, NULL, NULL, NULL, NULL),
('deal-004', 'rabin', '13876975-2160-4903-acb0-53102d194d77', 'قرارداد نگهداری', NULL, 30000000.00, 'IRR', 'stage-001', 30, '2025-11-30', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:32', '2025-10-11 18:27:32', '2025-10-11 18:27:32', NULL, NULL, NULL, NULL, NULL),
('deal-005', 'rabin', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'فروش لایسنس', NULL, 45000000.00, 'IRR', 'stage-005', 60, '2025-11-20', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:32', '2025-10-11 18:27:32', '2025-10-11 18:27:32', NULL, NULL, NULL, NULL, NULL),
('deal-001', 'rabin', '0095c921-5a12-4e0b-bcbe-3f3b4810c40b', 'فروش نرم‌افزار CRM', NULL, 50000000.00, 'IRR', 'stage-005', 70, '2025-11-15', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:55', '2025-10-11 18:27:55', '2025-10-11 18:27:55', NULL, NULL, NULL, NULL, NULL),
('deal-002', 'rabin', '018442c8-46db-4f8c-b4a9-fa8ff9e844dc', 'پروژه پیاده‌سازی سیستم', NULL, 120000000.00, 'IRR', 'stage-004', 50, '2025-12-01', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:55', '2025-10-11 18:27:55', '2025-10-11 18:27:55', NULL, NULL, NULL, NULL, NULL),
('deal-003', 'rabin', '0da78725-536c-46f8-b7e7-3e704614066c', 'خرید محصولات', NULL, 80000000.00, 'IRR', 'stage-006', 100, '2025-10-05', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:55', '2025-10-11 18:27:55', '2025-10-11 18:27:55', NULL, NULL, NULL, NULL, NULL),
('deal-004', 'rabin', '13876975-2160-4903-acb0-53102d194d77', 'قرارداد نگهداری', NULL, 30000000.00, 'IRR', 'stage-001', 30, '2025-11-30', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:55', '2025-10-11 18:27:55', '2025-10-11 18:27:55', NULL, NULL, NULL, NULL, NULL),
('deal-005', 'rabin', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'فروش لایسنس', NULL, 45000000.00, 'IRR', 'stage-005', 60, '2025-11-20', NULL, 'ceo-001', NULL, NULL, '2025-10-11 18:27:55', '2025-10-11 18:27:55', '2025-10-11 18:27:55', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `deal_products`
--

CREATE TABLE `deal_products` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `deal_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `deal_stages`
--

CREATE TABLE `deal_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `probability_range_min` int(11) DEFAULT 0,
  `probability_range_max` int(11) DEFAULT 100,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deal_stages`
--

INSERT INTO `deal_stages` (`id`, `name`, `description`, `stage_order`, `probability_range_min`, `probability_range_max`, `color`, `is_active`, `created_at`) VALUES
('stage-001', 'لید جدید', 'مشتری جدید شناسایی شده', 1, 0, 20, '#6B7280', 1, '2025-10-11 17:08:38'),
('stage-002', 'تماس اولیه', 'اولین تماس با مشتری برقرار شده', 2, 20, 40, '#3B82F6', 1, '2025-10-11 17:08:38'),
('stage-003', 'نیازسنجی', 'نیازهای مشتری شناسایی شده', 3, 40, 60, '#F59E0B', 1, '2025-10-11 17:08:38'),
('stage-004', 'ارائه پیشنهاد', 'پیشنهاد قیمت ارائه شده', 4, 60, 80, '#10B981', 1, '2025-10-11 17:08:38'),
('stage-005', 'مذاکره', 'در حال مذاکره نهایی', 5, 80, 95, '#EF4444', 1, '2025-10-11 17:08:38'),
('stage-006', 'بسته شده - برنده', 'فروش موفق', 6, 100, 100, '#059669', 1, '2025-10-11 17:08:38'),
('stage-007', 'بسته شده - بازنده', 'فروش ناموفق', 7, 0, 0, '#DC2626', 1, '2025-10-11 17:08:38');

-- --------------------------------------------------------

--
-- Table structure for table `deal_stage_history`
--

CREATE TABLE `deal_stage_history` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `deal_id` varchar(36) NOT NULL,
  `stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NULL DEFAULT current_timestamp(),
  `exited_at` timestamp NULL DEFAULT NULL,
  `changed_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `original_filename` varchar(255) NOT NULL,
  `stored_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_extension` varchar(10) NOT NULL,
  `category_id` varchar(36) DEFAULT NULL,
  `access_level` enum('public','private','restricted','confidential') DEFAULT 'private',
  `status` enum('active','archived','deleted') DEFAULT 'active',
  `version` int(11) DEFAULT 1,
  `parent_document_id` varchar(36) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `persian_date` varchar(20) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `is_shared` tinyint(1) DEFAULT 0,
  `download_count` int(11) DEFAULT 0,
  `view_count` int(11) DEFAULT 0,
  `uploaded_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='اسناد اصلی';

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `tenant_key`, `title`, `description`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `mime_type`, `file_extension`, `category_id`, `access_level`, `status`, `version`, `parent_document_id`, `tags`, `metadata`, `persian_date`, `expiry_date`, `is_shared`, `download_count`, `view_count`, `uploaded_by`, `created_at`, `updated_at`) VALUES
('26b5a39a-2adb-4eff-903e-4fb1b89790cb', 'rabin', 'sample-contacts', NULL, 'sample-contacts.xlsx', '6194d5e9-33cf-4fad-bbbf-6101b45ae130.xlsx', '/uploads/documents/6194d5e9-33cf-4fad-bbbf-6101b45ae130.xlsx', 9614, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'xlsx', NULL, 'private', 'active', 1, NULL, NULL, NULL, '1404/10/11', NULL, 0, 1, 0, 'ceo-001', '2025-10-11 17:56:55', '2025-10-13 08:41:40');

-- --------------------------------------------------------

--
-- Table structure for table `document_activity_log`
--

CREATE TABLE `document_activity_log` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `action` enum('upload','view','download','edit','delete','share','rename','move','restore') NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='تاریخچه فعالیت‌های اسناد';

--
-- Dumping data for table `document_activity_log`
--

INSERT INTO `document_activity_log` (`id`, `document_id`, `user_id`, `action`, `details`, `ip_address`, `user_agent`, `created_at`) VALUES
('06b25997-8c0b-11f0-a568-2c3b705dd50b', 'bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-07 17:56:09'),
('0ec289de-9162-11f0-8060-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:57:58'),
('13965d80-915e-11f0-8060-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:29:29'),
('14c99465-9162-11f0-8060-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:58:09'),
('1c3923cb-a1ec-4372-9761-93205efc2be0', 'bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'ceo-001', 'upload', '{\"filename\":\"test-document.txt\",\"size\":35}', 'unknown', NULL, '2025-09-07 13:20:07'),
('207816ae-9acb-11f0-bc57-581122e4f0be', 'd05645ac-84be-49f7-b782-e83b240a48d7', 'ceo-001', 'upload', '{\"title\":\"medomics\",\"size\":15927,\"mime\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"}', 'unknown', NULL, '2025-09-26 11:22:46'),
('2b38e84f-915f-11f0-8060-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:37:18'),
('2b907b94-8cc2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 15:58:03'),
('2d9b3df6-8cab-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 12:36:10'),
('2e577a7e-8bfd-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل\"}', 'unknown', NULL, '2025-09-07 16:03:03'),
('3354f145-9161-11f0-8060-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:51:50'),
('3e40ef43-8c05-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ با سرویس ایمیل جدید ارسال شد\"}', 'unknown', NULL, '2025-09-07 17:14:45'),
('40cae408-8cc2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:58:38'),
('4523150a-8ca9-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 12:22:31'),
('45f69ff8-9d50-11f0-8e7a-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'share', '{\"emails\":[\"only.link086@gmail.com\",\"rockygardner89@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-29 16:20:54'),
('48f3484f-8cb5-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:25:49'),
('490c7fc4-8bfd-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد. این سند حاوی اطلاعات مهم آموزشی است.\"}', 'unknown', NULL, '2025-09-07 16:03:47'),
('4ff38873-90b5-11f0-b002-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'upload', '{\"title\":\"Screenshot 2025-09-13 131322\",\"size\":120058,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-13 15:21:25'),
('516d812d-918d-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:07:39'),
('51e5becf-918c-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:00:30'),
('55a8a091-8c1d-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-07 20:41:35'),
('55aee9c3-90b5-11f0-b002-581122e4f0be', '822362b3-4e9d-4bf2-836b-00a66fba997a', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-13 15:21:34'),
('58e8a2e2-9ad3-11f0-bc57-581122e4f0be', '8e38a856-f238-43bc-8a2c-471b68904f22', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-26 12:21:36'),
('5a5177be-9ad3-11f0-bc57-581122e4f0be', 'd05645ac-84be-49f7-b782-e83b240a48d7', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-26 12:21:39'),
('5ee42821-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:44:43'),
('5f20c275-8cb5-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:26:26'),
('611e0864-8bf9-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ - تست ارسال جدید\"}', 'unknown', NULL, '2025-09-07 15:35:50'),
('61ac337c-8cd2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-08 18:43:50'),
('624aadba-9276-11f0-a782-581122e4f0be', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-09-15 20:56:00'),
('6293fbe1-9bbb-11f0-bcf6-581122e4f0be', '70a05fb7-d83e-490a-a3c0-84d4bfd37d17', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-27 16:02:36'),
('64412651-9d50-11f0-8e7a-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'share', '{\"emails\":[\"only.link086@gmail.com\",\"rockygardner89@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-29 16:21:45'),
('6686eae4-918d-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:08:14'),
('68b0f3a2-97e1-11f0-8035-aa7c082d9aee', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-22 18:24:42'),
('7328a22d-1fee-409e-8133-7049a9ef656f', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'upload', '{\"filename\":\"Ausbildung-Fachinformatiker-Systemintegration.pdf\",\"size\":432889}', 'unknown', NULL, '2025-09-07 14:00:04'),
('76862666-8cbc-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:17:12'),
('77d6bcb1-9d51-11f0-8e7a-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-29 16:29:27'),
('77f59cd7-8cb6-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-09-08 14:34:17'),
('789176b4-926d-11f0-8402-581122e4f0be', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'upload', '{\"title\":\"پروفایل\",\"size\":13123,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-15 19:52:12'),
('7c80d8d1-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:45:33'),
('7d9eef2d-9d64-11f0-8e7a-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-29 18:45:37'),
('7ea4d504-918a-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:47:26'),
('82c80fd3-8cbb-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:10:23'),
('86e1ada0-9160-11f0-8060-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:47:01'),
('8d9a7786-8bed-11f0-a568-2c3b705dd50b', 'bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'ceo-001', 'share', '{\"emails\":[\"test@example.com\"],\"permissionType\":\"view\",\"message\":\"سند تست برای شما\"}', 'unknown', NULL, '2025-09-07 13:21:24'),
('8f5676ff-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\",\"only.link086@gmail.com\"],\"subject\":\"📄 سند MBTI با فایل ضمیمه\",\"message\":\"این سند نتیجه تست MBTI است که از طریق سیستم مدیریت اسناد ارسال شده است.\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:46:04'),
('934595ea-9188-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:33:42'),
('94ab3b07-9e16-11f0-8bc5-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-30 16:00:26'),
('9616fe45-8bf8-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ - Ausbildung Fachinformatiker Systemintegration\"}', 'unknown', NULL, '2025-09-07 15:30:09'),
('97606778-9161-11f0-8060-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:54:38'),
('97c78f82-8cb9-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\".\"}', 'unknown', NULL, '2025-09-08 14:56:39'),
('9c64b62d-8cb5-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"...\"}', 'unknown', NULL, '2025-09-08 14:28:09'),
('a16d9d15-8bfc-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد\"}', 'unknown', NULL, '2025-09-07 15:59:06'),
('a2e82c25-8c27-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-07 21:55:19'),
('a48017c1-8cbc-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\".\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 15:18:29'),
('a514301a-918b-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:55:40'),
('a775a876-9189-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:41:25'),
('a8189f4a-054b-416f-ac0e-9ec25cdae5ca', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'upload', '{\"filename\":\"نتیجه-تست-mbti-مایرز-بریگز _ 9-4-1404.pdf\",\"size\":257825}', 'unknown', NULL, '2025-09-07 21:55:34'),
('aba05320-8cb7-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"..\",\"message\":\"خختشرش\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:42:53'),
('adbc0c0b-8c27-11f0-a568-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-09-07 21:55:37'),
('afafcb79-8c1f-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"تپششش\"}', 'unknown', NULL, '2025-09-07 20:58:25'),
('b3267a28-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 12:47:04'),
('b360ed83-8c27-11f0-a568-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"کپشییرشی\"}', 'unknown', NULL, '2025-09-07 21:55:47'),
('ba4f4ab5-1d86-4e5b-a427-69ef45c19892', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'upload', '{\"filename\":\"testfile.txt\",\"size\":28}', 'unknown', NULL, '2025-09-08 18:44:16'),
('c6997509-9acc-11f0-bc57-581122e4f0be', '8e38a856-f238-43bc-8a2c-471b68904f22', 'ceo-001', 'upload', '{\"title\":\"medomics\",\"size\":15927,\"mime\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"}', 'unknown', NULL, '2025-09-26 11:34:34'),
('cda1318a-8cb8-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:51:00'),
('e1d67b43-8cbf-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 15:41:40'),
('e598b967-9ac6-11f0-bc57-581122e4f0be', '70a05fb7-d83e-490a-a3c0-84d4bfd37d17', 'ceo-001', 'upload', '{\"title\":\"Screenshot 2025-09-23 010128\",\"size\":69018,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-26 10:52:29'),
('e9dbb7a1-918a-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:50:26'),
('ef1c5a97-9ac6-11f0-bc57-581122e4f0be', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'upload', '{\"title\":\"_uploads_91_2023_Mar_07_وب بدون نمره\",\"size\":122689,\"mime\":\"application/pdf\"}', 'unknown', NULL, '2025-09-26 10:52:45'),
('f54b074b-8bf7-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ ارسال شده از سیستم CRM\"}', 'unknown', NULL, '2025-09-07 15:25:39'),
('fac8bd2c-290b-4950-b4da-64403c8d6123', '822362b3-4e9d-4bf2-836b-00a66fba997a', 'ceo-001', 'upload', '{\"filename\":\"download.pdf\",\"size\":152611}', 'unknown', NULL, '2025-09-09 07:10:55'),
('274c5add-9e3d-11f0-8ab2-a2d0d1a9e9d9', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-30 20:36:33'),
('290ac56d-9e3d-11f0-8ab2-a2d0d1a9e9d9', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-30 20:36:36'),
('3f5aad4a-9e3d-11f0-8ab2-a2d0d1a9e9d9', '8b3620b6-9cab-4e62-b099-69d7b0406574', 'ceo-001', 'upload', '{\"title\":\"Screenshot 2025-09-15 192617\",\"size\":13123,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-30 20:37:14'),
('d7e7aa00-9e3d-11f0-8ab2-a2d0d1a9e9d9', '633b416f-90d0-4c01-8360-0583e7b48609', 'ceo-001', 'upload', '{\"title\":\"_uploads_91_2023_Mar_07_وب بدون نمره\",\"size\":122689,\"mime\":\"application/pdf\"}', 'unknown', NULL, '2025-09-30 20:41:30'),
('3ecf897b-9e8e-11f0-9ce7-66471fedf601', '2c5c04d0-8062-4391-88b0-43888435343d', 'ceo-001', 'upload', '{\"title\":\"تفاهم نامه بسیج سازندگی 1docx\",\"size\":227737,\"mime\":\"application/pdf\"}', 'unknown', NULL, '2025-10-01 06:17:02'),
('acdc16bb-a6cb-11f0-aea0-581122e4f0be', '26b5a39a-2adb-4eff-903e-4fb1b89790cb', 'ceo-001', 'upload', '{\"title\":\"sample-contacts\",\"size\":9614,\"mime\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\"}', 'unknown', NULL, '2025-10-11 17:56:55'),
('708e150a-a810-11f0-9c30-581122e4f0be', '26b5a39a-2adb-4eff-903e-4fb1b89790cb', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-10-13 08:41:40');

-- --------------------------------------------------------

--
-- Table structure for table `document_categories`
--

CREATE TABLE `document_categories` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `icon` varchar(50) DEFAULT 'folder',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='دسته‌بندی اسناد';

--
-- Dumping data for table `document_categories`
--

INSERT INTO `document_categories` (`id`, `name`, `description`, `parent_id`, `color`, `icon`, `sort_order`, `is_active`, `created_by`, `created_at`, `updated_at`) VALUES
('cat-contracts', 'قراردادها', 'قراردادهای مختلف شرکت', NULL, '#10B981', 'file-contract', 1, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-images', 'تصاویر', 'تصاویر و عکس‌ها', NULL, '#06B6D4', 'photograph', 6, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-invoices', 'فاکتورها', 'فاکتورهای فروش و خرید', NULL, '#F59E0B', 'receipt', 2, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-other', 'سایر', 'سایر اسناد', NULL, '#6B7280', 'document', 7, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-policies', 'سیاست‌ها', 'سیاست‌ها و رویه‌های شرکت', NULL, '#8B5CF6', 'shield-check', 4, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-presentations', 'ارائه‌ها', 'فایل‌های ارائه و پرزنتیشن', NULL, '#EF4444', 'presentation-chart-bar', 5, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08'),
('cat-reports', 'گزارشات', 'گزارشات مختلف', NULL, '#3B82F6', 'chart-bar', 3, 1, 'ceo-001', '2025-09-06 18:24:08', '2025-09-06 18:24:08');

-- --------------------------------------------------------

--
-- Table structure for table `document_comments`
--

CREATE TABLE `document_comments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `comment` text NOT NULL,
  `parent_comment_id` varchar(36) DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='نظرات اسناد';

-- --------------------------------------------------------

--
-- Table structure for table `document_files`
--

CREATE TABLE `document_files` (
  `id` int(11) NOT NULL,
  `document_id` varchar(255) NOT NULL,
  `content` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `document_permissions`
--

CREATE TABLE `document_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role` varchar(50) DEFAULT NULL,
  `permission_type` enum('view','download','edit','delete','share','admin') NOT NULL,
  `granted_by` varchar(36) NOT NULL,
  `granted_at` timestamp NULL DEFAULT current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='مجوزهای دسترسی اسناد';

-- --------------------------------------------------------

--
-- Table structure for table `document_shares`
--

CREATE TABLE `document_shares` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `shared_by` varchar(36) NOT NULL,
  `shared_with_email` varchar(255) NOT NULL,
  `shared_with_user_id` varchar(36) DEFAULT NULL,
  `share_token` varchar(100) NOT NULL,
  `permission_type` enum('view','download') DEFAULT 'view',
  `message` text DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `access_count` int(11) DEFAULT 0,
  `last_accessed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='اشتراک‌گذاری اسناد';

--
-- Dumping data for table `document_shares`
--

INSERT INTO `document_shares` (`id`, `document_id`, `shared_by`, `shared_with_email`, `shared_with_user_id`, `share_token`, `permission_type`, `message`, `expires_at`, `is_active`, `access_count`, `last_accessed_at`, `created_at`) VALUES
('0190ed71-a555-4c32-b87b-b0f4fffcf995', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '0ae12288-a2be-4028-b68c-d222f39f7ebb', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 11:58:08'),
('05baeecb-0c50-494e-91e7-0dcb9f997905', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '6b41a509-33e5-40d4-b695-d84d83ad4b36', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 11:37:18'),
('0a957531-38ba-4a8a-88a5-47ce99b54a31', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '83483f27-0923-4a23-bf94-b61f47c0d497', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 16:33:32'),
('1f3ed7c2-ad66-4dff-8c4b-5026b4b2c997', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '775d8a10-3628-4b80-a73a-6c1d2ef45172', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 17:08:05'),
('2099abd8-8ec7-46d5-a7be-d1158c5258f1', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '4506012a-8715-4148-aa6f-51fad9f83398', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 17:00:22'),
('25a317a8-4af9-422e-8a67-44620ed6952e', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'f9f7bf9b-f03b-4635-ab8a-2117a65662e9', 'view', NULL, NULL, 1, 0, NULL, '2025-09-08 15:10:19'),
('2a454546-86a9-4583-82bf-7c5625ede53f', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'a45a1f03-a753-464e-8199-445296e18720', 'view', '.', NULL, 1, 0, NULL, '2025-09-08 14:34:50'),
('2d90b8e5-5237-4571-8ae8-83ba296e7261', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'cfb239d7-8509-403a-924c-bcf7ccf950ac', 'view', NULL, NULL, 1, 0, NULL, '2025-09-08 12:36:08'),
('2fff8475-32cb-4962-9a28-626db766dda6', 'bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'ceo-001', 'test@example.com', NULL, 'bdd2ae25-5183-492d-9164-13b0bf6d792d', 'view', 'سند تست برای شما', '2025-09-14 13:21:24', 1, 0, NULL, '2025-09-07 13:21:24'),
('41389036-e526-4a69-8d8f-27b6c2e1b2d1', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'c30355d8-0058-467f-a653-b68b2b1a0756', 'view', NULL, '2025-09-15 11:29:27', 1, 0, NULL, '2025-09-14 11:29:27'),
('4e8858ba-6efa-4c67-89dd-f7774e01fb6b', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '5f2240e3-0031-4d8d-b503-3a882be4ea6a', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 16:20:52'),
('574ca028-d726-4caf-9894-ce6fa47ebb41', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'only.link086@gmail.com', NULL, 'd4cf29ac-f09d-4f7b-9c02-43545e4403ef', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 16:21:40'),
('69f99523-82b1-4d4a-a287-81daede2a77a', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '7acb20a0-bfb1-4771-9285-dba1b750aac7', 'view', '...', NULL, 1, 0, NULL, '2025-09-08 14:28:06'),
('6a6510a2-79bb-49b5-a994-2713726131c3', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '065ec468-4f7f-47e8-96e0-3b544e159013', 'download', NULL, NULL, 1, 0, NULL, '2025-09-08 15:17:09'),
('70d9e140-6df9-4021-9e62-40b2553c8ec4', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '1354a556-e89e-40d1-ac8f-7f5224dd79e7', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 11:51:50'),
('73560bc2-65d1-4f7d-9ba8-be231d7413d8', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'b3b91c47-b41a-41ea-a2bb-edb5594f5943', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 18:45:32'),
('88dc7261-723d-45a3-aab7-1598335ec0e7', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '81e9c634-e5d6-4e41-bb36-2ae89c68df5b', 'view', NULL, NULL, 1, 0, NULL, '2025-09-07 20:41:32'),
('92ac81ab-35fe-421a-92e6-ce8dbad32aea', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'ed087977-63ab-4f3c-a961-9676ce13555b', 'view', 'فایل آوسبیلدونگ - Ausbildung Fachinformatiker Systemintegration', '2025-10-07 15:30:09', 1, 0, NULL, '2025-09-07 15:30:09'),
('a4bfc410-a2b9-4d39-8cc3-8d24ce8ca7c9', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'c2b13558-9d5f-42ec-b033-08464d33dd7a', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 11:54:38'),
('a669d07b-2a50-4e8b-aea2-c0bee375c08f', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'c1a48149-7d6c-4842-9a05-a9914dd0ff3e', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 11:47:01'),
('a9233b87-4f84-4a1d-a865-41a85f3e1e53', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '9f89492e-0510-4fba-912d-42d5e6987710', 'download', 'سند آوسبیلدونگ برای شما ارسال شد. این سند حاوی اطلاعات مهم آموزشی است.', '2025-10-07 16:03:46', 1, 0, NULL, '2025-09-07 16:03:46'),
('b64837b2-3ae0-4c0a-b65a-22723d532fd4', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '08d401d2-b616-487d-b617-dfc5ba0dfac1', 'view', NULL, NULL, 1, 0, NULL, '2025-09-08 12:22:27'),
('b8133df4-543b-4a0f-8771-2718467ab4b5', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '32dd1984-72cf-49db-83db-f432bb701e00', 'download', 'سند آوسبیلدونگ برای شما ارسال شد', '2025-10-07 15:59:06', 1, 0, NULL, '2025-09-07 15:59:06'),
('b9feee4a-4478-45b7-8139-add3f639a291', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '39b44473-e39f-4a35-939e-376c9d0edc4f', 'view', 'کپشییرشی', NULL, 1, 0, NULL, '2025-09-07 21:55:46'),
('bd9a84b8-78dd-4e3b-b03e-b0e5e5fff053', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'e3b22ff6-dabc-4c56-903c-2c72ca5219e5', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 16:41:19'),
('bde9bc51-c4f1-4c3d-bf65-f491a155a397', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'dec6d666-f2de-45b5-b178-9d078d003b5a', 'download', 'سند آوسبیلدونگ با سرویس ایمیل جدید ارسال شد', '2025-10-07 17:14:42', 1, 0, NULL, '2025-09-07 17:14:42'),
('c05591e4-dd22-4c9e-be56-b3726d757155', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'd9c2f40c-5134-4a74-8afb-abf543067607', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 11:57:58'),
('c1179a3e-690d-4823-9941-859bbb385ff7', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'only.link086@gmail.com', NULL, '7c4a9c09-8b46-4313-afe3-795da7f654cf', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 16:20:50'),
('c56ada7b-d2d2-4973-ad7b-b7d7bf6e25cc', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '73466602-5be9-46de-bafd-276c57e26a6f', 'download', '.', NULL, 1, 0, NULL, '2025-09-08 14:56:36'),
('cc40e406-15b5-4e07-8b6f-3510239e9f54', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '9ef7aa86-470b-4764-91e2-efdd7098d4be', 'view', 'فایل آوسبیلدونگ ارسال شده از سیستم CRM', '2025-10-07 15:25:39', 1, 0, NULL, '2025-09-07 15:25:39'),
('d10d492d-3a35-448b-800a-9091870d1efb', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '801b428e-95f9-4a45-ba0a-335b410289d7', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 16:46:40'),
('d3c25558-e4e5-444e-ba72-03aa1e899fb9', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '44284160-206e-4ab5-9c02-dc4dc849eb8b', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 16:55:13'),
('d86520ef-444b-4bcb-ae0d-105274e174e8', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '51561b67-4a3f-4552-86b7-d8d980228865', 'download', 'سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل', '2025-10-07 16:03:01', 1, 0, NULL, '2025-09-07 16:03:01'),
('da9ec7ed-f570-4fc5-99e6-7388a98089e0', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '54e167b2-d33e-450b-87cf-c6e98be41737', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 16:21:43'),
('de814991-2782-4104-b18e-e02765b69399', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '49588e33-19f7-4e78-a44f-a6900faa3f5c', 'view', 'تپششش', NULL, 1, 0, NULL, '2025-09-07 20:58:22'),
('df094f9b-fb75-4f62-b0c7-db2158cee714', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'efab8b0c-0b50-48bf-97f3-1a69ab69ef16', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 17:07:24'),
('e93159d8-69e2-4420-935d-4db6dd0eef03', '2883b968-dfdf-4912-bc7e-9196e9371e45', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'aaf93496-558f-4a8e-b9fd-db4ef31f57f9', 'view', NULL, NULL, 1, 0, NULL, '2025-09-29 16:29:00'),
('ed7deef5-52e1-4903-bfe9-0ed3b4b8f35f', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '586af2da-ba6d-4640-929a-a1b47b3587d2', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 16:50:18'),
('efcc139c-fe17-4a25-943a-31cf8bbcd0da', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '521e8c33-9af1-46e0-9548-99a8b830f3c0', 'download', NULL, NULL, 1, 0, NULL, '2025-09-08 12:47:02'),
('f2dfe286-ad5e-4691-8648-9a73d08c1337', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '0853725b-5691-4953-b746-7106884e1ddb', 'view', NULL, NULL, 1, 0, NULL, '2025-09-08 15:58:36'),
('f396785e-3be5-4f14-b937-cf2c4507d46a', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '3200b59c-427c-48d1-a42b-8116f4c8371d', 'view', 'فایل آوسبیلدونگ - تست ارسال جدید', '2025-10-07 15:35:49', 1, 0, NULL, '2025-09-07 15:35:49');

-- --------------------------------------------------------

--
-- Table structure for table `document_tags`
--

CREATE TABLE `document_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#6B7280',
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='برچسب‌های اسناد';

--
-- Dumping data for table `document_tags`
--

INSERT INTO `document_tags` (`id`, `name`, `color`, `description`, `usage_count`, `created_by`, `created_at`) VALUES
('tag-approved', 'تایید شده', '#10B981', 'اسناد تایید شده', 0, 'ceo-001', '2025-09-06 18:24:08'),
('tag-archived', 'بایگانی', '#6B7280', 'اسناد بایگانی شده', 0, 'ceo-001', '2025-09-06 18:24:08'),
('tag-confidential', 'محرمانه', '#7C2D12', 'اسناد محرمانه', 0, 'ceo-001', '2025-09-06 18:24:08'),
('tag-draft', 'پیش‌نویس', '#F59E0B', 'اسناد در حال تدوین', 0, 'ceo-001', '2025-09-06 18:24:08'),
('tag-urgent', 'فوری', '#EF4444', 'اسناد فوری', 0, 'ceo-001', '2025-09-06 18:24:08');

-- --------------------------------------------------------

--
-- Table structure for table `document_tag_relations`
--

CREATE TABLE `document_tag_relations` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='رابطه اسناد و برچسب‌ها';

-- --------------------------------------------------------

--
-- Table structure for table `event_attendees`
--

CREATE TABLE `event_attendees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `event_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `contact_id` varchar(36) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `response` enum('pending','accepted','declined','maybe') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `event_participants`
--

CREATE TABLE `event_participants` (
  `id` varchar(36) NOT NULL,
  `event_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `response` enum('pending','accepted','declined','tentative') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_participants`
--

INSERT INTO `event_participants` (`id`, `event_id`, `user_id`, `response`, `created_at`) VALUES
('part-001', 'event-001', 'ceo-001', 'accepted', '2025-09-10 22:41:11'),
('part-002', 'event-002', 'ceo-001', 'accepted', '2025-09-10 22:41:11'),
('part-003', 'event-004', 'ceo-001', 'pending', '2025-09-10 22:41:11');

-- --------------------------------------------------------

--
-- Table structure for table `event_reminders`
--

CREATE TABLE `event_reminders` (
  `id` varchar(36) NOT NULL,
  `event_id` varchar(36) NOT NULL,
  `method` enum('popup','email','sms') DEFAULT 'popup',
  `minutes_before` int(11) NOT NULL DEFAULT 15,
  `sent` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `event_reminders`
--

INSERT INTO `event_reminders` (`id`, `event_id`, `method`, `minutes_before`, `sent`, `sent_at`, `created_at`) VALUES
('483de9b3-b005-4bd3-8e18-40f20f59d5d8', '8cffe079-c60e-4357-b9da-a40462590e74', 'popup', 15, 0, NULL, '2025-09-30 17:05:26'),
('53467a21-e69e-4ae2-bf42-85c8b5b84450', '5e1dd51e-12eb-48d5-91bc-9366f05b4088', 'popup', 15, 0, NULL, '2025-09-22 16:10:39'),
('576284fd-e8bb-43ea-80a5-8e2aa7deb656', '4abe30c7-797b-4eeb-b607-23b53868c44e', 'popup', 15, 0, NULL, '2025-09-22 16:08:02'),
('82b9f6b4-5dd2-4222-b96e-0966507c5bae', '4ce6e3e1-39b9-46d7-a58a-ece70e4f3657', 'popup', 15, 0, NULL, '2025-09-30 15:59:11'),
('8409c21d-44fb-4ea8-94b5-7a17521f4094', '2c436379-aca5-4ad0-ad18-5403bf435f2e', 'popup', 15, 0, NULL, '2025-09-22 16:08:25'),
('8f3392a9-4cd1-4fd6-8e82-29e8dafd4ffc', 'cedb2b33-c814-427c-8c4f-2447b932753d', 'popup', 15, 0, NULL, '2025-09-15 19:51:10'),
('b5f51ffa-88cb-4f4f-b2e6-fa143bcaa0c7', '99ce4b59-5d11-4ed2-985b-6c6ae0396302', 'popup', 15, 0, NULL, '2025-09-26 11:34:46'),
('c19fde0f-c03f-42f8-8b15-0faaf08c5687', 'fa205095-d854-42ce-a2c2-3d6006052a44', 'popup', 15, 0, NULL, '2025-09-29 17:26:18'),
('fc23b85c-4a3f-4cee-8f5b-3136f04a0285', 'e5fffdb7-8b16-475f-92da-36a1d24f68d7', 'popup', 15, 0, NULL, '2025-09-25 12:07:40'),
('rem-001', 'event-001', 'popup', 15, 0, NULL, '2025-09-10 22:41:11'),
('rem-002', 'event-001', 'email', 60, 0, NULL, '2025-09-10 22:41:11'),
('rem-003', 'event-002', 'popup', 10, 0, NULL, '2025-09-10 22:41:11'),
('rem-004', 'event-003', 'popup', 5, 0, NULL, '2025-09-10 22:41:11'),
('rem-005', 'event-004', 'popup', 30, 0, NULL, '2025-09-10 22:41:11'),
('e106aef9-8d59-43b8-addf-ec7d8ebb53b6', 'ecd5d77b-e251-4d44-96dc-d970c04d1497', 'popup', 15, 0, NULL, '2025-10-04 18:01:32'),
('943f5a16-04a7-421a-9c11-497d072d0e8d', '1cb21aa2-07f9-481d-a615-705584e86da5', 'popup', 15, 0, NULL, '2025-10-04 18:01:37'),
('51ad96c9-f27f-4766-9629-a51e927a8d67', 'fb6210b0-49b2-4f11-a5f6-ba67a4103d3b', 'popup', 15, 0, NULL, '2025-10-11 17:35:13'),
('4f63bd2a-131a-4251-a7a9-bcda665dcafc', '82c805f2-5ba9-4134-b16b-2a546854bd05', 'popup', 15, 0, NULL, '2025-10-11 17:35:21'),
('7578c29f-4fd6-4af7-aad3-aae22906e9ab', '0a068c78-5825-4af2-9c68-4f5b956b492c', 'popup', 15, 0, NULL, '2025-10-11 17:35:39'),
('95fa244f-aecc-4e0c-86d9-8032fc8c12c4', '2b9277e1-9e39-486d-961c-702bb521f5a7', 'popup', 15, 0, NULL, '2025-10-11 17:55:22');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `customer_id` varchar(36) NOT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `resolved_by` varchar(36) DEFAULT NULL,
  `type` enum('csat','nps','ces','complaint','suggestion','praise') NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `score` decimal(3,2) DEFAULT NULL,
  `product` varchar(255) DEFAULT NULL,
  `channel` enum('email','website','phone','chat','sms','survey') DEFAULT 'website',
  `category` varchar(100) DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','dismissed') DEFAULT 'pending',
  `sentiment` enum('positive','neutral','negative') DEFAULT NULL,
  `sentiment_score` decimal(3,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `resolved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback`
--

INSERT INTO `feedback` (`id`, `tenant_key`, `customer_id`, `assigned_to`, `resolved_by`, `type`, `title`, `comment`, `score`, `product`, `channel`, `category`, `priority`, `status`, `sentiment`, `sentiment_score`, `created_at`, `resolved_at`) VALUES
('fb-001', 'rabin', '0095c921-5a12-4e0b-bcbe-3f3b4810c40b', 'ceo-001', NULL, 'suggestion', 'پیشنهاد بهبود رابط کاربری', 'رابط کاربری سیستم می‌تواند ساده‌تر و کاربرپسندتر باشد', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:32', NULL),
('fb-002', 'rabin', '018442c8-46db-4f8c-b4a9-fa8ff9e844dc', 'ceo-001', NULL, 'complaint', 'مشکل در سرعت سیستم', 'سیستم در ساعات شلوغ کند می‌شود', 2.00, NULL, 'website', NULL, 'high', 'in_progress', NULL, NULL, '2025-10-11 18:27:32', NULL),
('fb-003', 'rabin', '0da78725-536c-46f8-b7e7-3e704614066c', 'ceo-001', NULL, 'praise', 'تشکر از پشتیبانی', 'تیم پشتیبانی بسیار حرفه‌ای و مفید بودند', 5.00, NULL, 'website', NULL, 'low', 'completed', NULL, NULL, '2025-10-11 18:27:32', NULL),
('fb-004', 'rabin', '13876975-2160-4903-acb0-53102d194d77', 'ceo-001', NULL, 'csat', 'نظرسنجی رضایت', 'به طور کلی از سیستم راضی هستم', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:32', NULL),
('fb-005', 'rabin', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'ceo-001', NULL, 'suggestion', 'افزودن گزارش‌های بیشتر', 'نیاز به گزارش‌های تحلیلی بیشتری داریم', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:32', NULL),
('fb-001', 'rabin', '0095c921-5a12-4e0b-bcbe-3f3b4810c40b', 'ceo-001', NULL, 'suggestion', 'پیشنهاد بهبود رابط کاربری', 'رابط کاربری سیستم می‌تواند ساده‌تر و کاربرپسندتر باشد', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:55', NULL),
('fb-002', 'rabin', '018442c8-46db-4f8c-b4a9-fa8ff9e844dc', 'ceo-001', NULL, 'complaint', 'مشکل در سرعت سیستم', 'سیستم در ساعات شلوغ کند می‌شود', 2.00, NULL, 'website', NULL, 'high', 'in_progress', NULL, NULL, '2025-10-11 18:27:55', NULL),
('fb-003', 'rabin', '0da78725-536c-46f8-b7e7-3e704614066c', 'ceo-001', NULL, 'praise', 'تشکر از پشتیبانی', 'تیم پشتیبانی بسیار حرفه‌ای و مفید بودند', 5.00, NULL, 'website', NULL, 'low', 'completed', NULL, NULL, '2025-10-11 18:27:55', NULL),
('fb-004', 'rabin', '13876975-2160-4903-acb0-53102d194d77', 'ceo-001', NULL, 'csat', 'نظرسنجی رضایت', 'به طور کلی از سیستم راضی هستم', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:55', NULL),
('fb-005', 'rabin', '15147929-6e36-42c5-b2bf-a6b2b1413292', 'ceo-001', NULL, 'suggestion', 'افزودن گزارش‌های بیشتر', 'نیاز به گزارش‌های تحلیلی بیشتری داریم', 4.00, NULL, 'website', NULL, 'medium', 'pending', NULL, NULL, '2025-10-11 18:27:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `feedback_forms`
--

CREATE TABLE `feedback_forms` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('sales','product') NOT NULL,
  `template` varchar(50) DEFAULT 'default',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback_forms`
--

INSERT INTO `feedback_forms` (`id`, `title`, `description`, `type`, `template`, `status`, `created_at`, `updated_at`) VALUES
('form-001', 'نظرسنجی رضایت از فرآیند فروش', 'لطفا درباره تجربه خرید خود از ما نظر دهید', 'sales', 'default', 'active', '2025-08-09 20:22:16', '2025-08-09 20:22:16'),
('form-002', 'نظرسنجی کیفیت محصول', 'نظر شما درباره کیفیت محصولات ما چیست؟', 'product', 'default', 'active', '2025-08-09 20:22:16', '2025-08-09 20:22:16');

-- --------------------------------------------------------

--
-- Table structure for table `feedback_form_questions`
--

CREATE TABLE `feedback_form_questions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `form_id` varchar(36) NOT NULL,
  `question` text NOT NULL,
  `type` enum('text','rating','choice','textarea') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `required` tinyint(1) DEFAULT 0,
  `question_order` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback_form_questions`
--

INSERT INTO `feedback_form_questions` (`id`, `form_id`, `question`, `type`, `options`, `required`, `question_order`, `created_at`) VALUES
('q-001', 'form-001', 'چقدر از فرآیند فروش ما رضایت دارید؟', 'rating', '{\"max\": 5}', 1, 1, '2025-08-09 20:22:46'),
('q-002', 'form-001', 'چه چیزی در فرآیند فروش ما نیاز به بهبود دارد؟', 'textarea', NULL, 1, 2, '2025-08-09 20:22:46'),
('q-003', 'form-002', 'چقدر از کیفیت محصول ما رضایت دارید؟', 'rating', '{\"max\": 5}', 1, 1, '2025-08-09 20:22:46'),
('q-004', 'form-002', 'چه ویژگیهایی به محصول ما اضافه شود؟', 'textarea', NULL, 0, 2, '2025-08-09 20:22:46'),
('q-product-3', 'form-002', 'آیا محصول با توضیحات ارائه شده مطابقت داشت؟', 'choice', '{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، متفاوت بود\"]}', 1, 3, '2025-08-10 06:13:02'),
('q-product-4', 'form-002', 'نسبت کیفیت به قیمت محصول را چگونه ارزیابی می‌کنید؟', 'choice', '{\"options\": [\"عالی\", \"خوب\", \"متوسط\", \"ضعیف\"]}', 1, 4, '2025-08-10 06:13:02'),
('q-product-5', 'form-002', 'آیا استفاده از محصول آسان بود؟', 'choice', '{\"options\": [\"بله، بسیار آسان\", \"نسبتاً آسان\", \"کمی دشوار\", \"بسیار دشوار\"]}', 1, 5, '2025-08-10 06:13:02'),
('q-product-6', 'form-002', 'آیا این محصول را به دیگران پیشنهاد می‌دهید؟', 'choice', '{\"options\": [\"بله، حتماً\", \"احتمالاً\", \"خیر\"]}', 1, 6, '2025-08-10 06:13:02'),
('q-sales-3', 'form-001', 'آیا کارشناس فروش اطلاعات کافی درباره محصولات داشت؟', 'choice', '{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، اطلاعات کافی نداشت\"]}', 1, 3, '2025-08-10 06:13:02'),
('q-sales-4', 'form-001', 'سرعت پاسخگویی تیم فروش به درخواست‌های شما چگونه بود؟', 'choice', '{\"options\": [\"بسیار سریع\", \"مناسب\", \"کند\", \"بسیار کند\"]}', 1, 4, '2025-08-10 06:13:02'),
('q-sales-5', 'form-001', 'آیا فرآیند خرید ساده و روان بود؟', 'choice', '{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، پیچیده بود\"]}', 1, 5, '2025-08-10 06:13:02'),
('q-sales-6', 'form-001', 'آیا مایل به خرید مجدد از ما هستید؟', 'choice', '{\"options\": [\"بله، حتماً\", \"احتمالاً\", \"خیر\"]}', 1, 6, '2025-08-10 06:13:02');

-- --------------------------------------------------------

--
-- Table structure for table `feedback_form_responses`
--

CREATE TABLE `feedback_form_responses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `submission_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback_form_responses`
--

INSERT INTO `feedback_form_responses` (`id`, `submission_id`, `question_id`, `response`, `created_at`) VALUES
('2e31c7fc-eaa9-48c2-8211-91445b46543f', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-sales-4', 'مناسب', '2025-09-15 18:06:17'),
('3f9d85c4-0003-416e-9513-1797512aeab0', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-001', '5', '2025-09-15 18:06:17'),
('4dab3981-f294-44ce-9b9b-3648d7851ca7', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-product-4', 'عالی', '2025-08-10 06:17:45'),
('5fcfa7b9-591a-4b03-9f47-b6bd14582ccf', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-002', 'هیچی', '2025-09-15 18:06:17'),
('79d828bb-6c76-4c5f-a82a-99a4cb5d2e82', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-004', 'نمیدونم', '2025-08-10 06:17:45'),
('7e8c62ba-707f-41d6-b7ac-914cf22e6359', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-product-5', 'نسبتاً آسان', '2025-08-10 06:17:45'),
('95070ea4-38d9-4956-9deb-75f9ad0d772f', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-sales-5', 'بله، کاملاً', '2025-09-15 18:06:17'),
('a4370be4-9fdb-4b87-9acc-97afa56b97b0', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-sales-6', 'بله، حتماً', '2025-09-15 18:06:17'),
('abd55c2b-9441-4681-8d8d-653f92590feb', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-product-6', 'احتمالاً', '2025-08-10 06:17:45'),
('dc4e8f3d-7c5c-494b-b91c-1318b7750cea', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-003', '5', '2025-08-10 06:17:45'),
('eb492db5-dace-4915-9a2c-4bbea269a220', '58e57e51-68fd-451c-b8f5-a5758c61620f', 'q-product-3', 'بله، کاملاً', '2025-08-10 06:17:45'),
('ec53c5a9-2516-4d4a-90c4-b0ff5503c2c4', '96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'q-sales-3', 'بله، کاملاً', '2025-09-15 18:06:17');

-- --------------------------------------------------------

--
-- Table structure for table `feedback_form_submissions`
--

CREATE TABLE `feedback_form_submissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `form_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `token` varchar(255) NOT NULL,
  `status` enum('pending','completed','expired') DEFAULT 'pending',
  `email_message_id` varchar(255) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback_form_submissions`
--

INSERT INTO `feedback_form_submissions` (`id`, `form_id`, `customer_id`, `token`, `status`, `email_message_id`, `submitted_at`, `created_at`, `updated_at`) VALUES
('06560a85-8a6d-40da-96ce-86505a8f943f', 'form-002', 'cnt-me4piwag', '7bc6a34b9c8d5f51acf0ef07bfa6d39252c6420b315925fecec8cb85ffe1b304', 'pending', NULL, NULL, '2025-08-10 05:00:53', '2025-08-10 05:00:53'),
('10295bb9-82c4-4a44-b8a5-d73f2d43d530', 'form-001', 'cnt-me4piwag', '2c9800fba3db1181d8a47a09aa0d6cc89630d2fdd62fe761ff2c21bd0136e37c', 'pending', '198924e9dbd96d1a', NULL, '2025-08-10 04:48:00', '2025-08-10 04:48:02'),
('2d45105d-f9c0-4f69-aa63-4abb8f531d2f', 'form-001', 'cnt-me4piwag', 'af039eff69857404297808b3af8d722a9afe55a07e49aed9433f987f23ba4a9d', 'pending', NULL, NULL, '2025-09-15 17:50:47', '2025-09-15 17:50:47'),
('31b6ec41-3a95-43bc-bcb6-eaacac4d6046', 'form-002', 'cnt-me4piwag', '31b6ec41-3a95-43bc-bcb6-eaacac4d6046', 'pending', NULL, NULL, '2025-09-29 18:44:42', '2025-09-29 18:44:42'),
('402b0d17-543b-4130-97e0-b33ba4006733', 'form-002', 'cnt-me4piwag', 'c45abaf2a8cbaaed0391528c8f90897d139d17226490238b3939c7cf26d3f83f', 'pending', NULL, NULL, '2025-09-22 18:28:21', '2025-09-22 18:28:21'),
('4882de58-5fe8-43e9-b42b-4ddad91e93ed', 'form-001', 'cnt-me4piwag', '10b30b796631a9f47e4f6b61e1eea66a76c4518215f9de74f4282831addfc040', 'pending', NULL, NULL, '2025-08-09 20:38:58', '2025-08-09 20:38:58'),
('4aa69f26-1376-443f-903b-17c705ca35c5', 'form-001', 'cnt-me4piwag', 'f79eff47a052a726540985bf743a4e9e82901bbd33a434572c632b9c56a321f1', 'pending', NULL, NULL, '2025-09-15 17:37:45', '2025-09-15 17:37:45'),
('58e57e51-68fd-451c-b8f5-a5758c61620f', 'form-002', 'cnt-me4piwag', '9bc5eb444348bf930de12b4f2a5b50802812cde3f6c7734179c202e2fe587ec7', 'completed', '198925c9024918f9', '2025-08-10 06:17:45', '2025-08-10 05:03:00', '2025-08-10 06:17:45'),
('6027377a-709a-4b14-83d4-54271cb57862', 'form-002', 'cnt-me4piwag', 'e90678cd116d6ea4eb9e334dda68283ee16ea39c856a65baf8ed001c63831980', 'pending', '198926f516b6b2c9', NULL, '2025-08-10 05:23:44', '2025-08-10 05:23:45'),
('7e99a2c8-fcc7-4ad3-88cc-547bee72b519', 'form-001', 'cnt-me4piwag', '27155ff33355143b1f077523ea6618a7b3c1e1f4d236ab8d1505ce60529ee664', 'pending', NULL, NULL, '2025-08-09 21:10:44', '2025-08-09 21:10:44'),
('9261de73-80f2-4f2b-ac72-67c97b952e01', 'form-001', 'cnt-me4piwag', 'a4f1602458af5150e5c7ba15a1bdc4c9390eac4dbad3f7623e618441379be383', 'pending', NULL, NULL, '2025-08-10 05:23:30', '2025-08-10 05:23:30'),
('96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'form-001', 'cnt-me4piwag', 'df9a7e537fc23eeed8c0f8af2bf5dedf8653a54f2be16ebebb0a23ab467591f4', 'completed', NULL, '2025-09-15 18:06:17', '2025-09-15 18:03:59', '2025-09-15 18:06:17'),
('96d90ad9-f5ec-40f5-859b-9fec1e249a2b', 'form-002', 'cnt-me4piwag', '5b4272473c28d668dd436e1cea096c3f3fd2e349735dc732b4f3d34d605cabbe', 'pending', NULL, NULL, '2025-09-22 18:22:55', '2025-09-22 18:22:55'),
('a45ab9eb-0614-449c-816c-f51a49b9ddd3', 'form-001', 'cnt-me4piwag', 'a45ab9eb-0614-449c-816c-f51a49b9ddd3', 'pending', NULL, NULL, '2025-09-29 16:47:28', '2025-09-29 16:47:28'),
('a96d0908-8f82-4a33-b4b5-1f2bbed2ff2c', 'form-001', 'cnt-me4piwag', '3d42013d7603a36524ab9a509d922d0d705daf00853c2a54d1c089f6e681e415', 'pending', '19890a654e931213', NULL, '2025-08-09 21:04:35', '2025-08-09 21:04:36'),
('c1354bda-62ed-474c-9652-ae61d47252ef', 'form-001', 'cnt-me4piwag', '8ec9a0dfad982b44a0483b1a40cc042e229c98a71802916dc0922a3d36dd7ffd', 'pending', NULL, NULL, '2025-08-09 20:28:48', '2025-08-09 20:28:48'),
('e38c216e-59b0-45f4-b8dd-d508b32547de', 'form-001', 'cnt-me4piwag', 'f6a480ad94c66fbd2661f9cae4a2b3fd0c5ee1ad7a391055239c4ebf48b152ee', 'pending', NULL, NULL, '2025-09-16 19:31:08', '2025-09-16 19:31:08'),
('e4b13463-6b41-4d39-bb4c-445e7ab0a6a1', 'form-001', 'cnt-me4piwag', '4d4737f89e3139977561b398058ca28163e24fa2866aabaec10ca2f346211cb4', 'pending', NULL, NULL, '2025-08-09 20:41:10', '2025-08-09 20:41:10'),
('e6d8b4cd-fb0c-4352-a7a5-3b612c24c9a4', 'form-001', 'cnt-me4piwag', '6421a3948aed9f76793119f3700e4faf68c465c3f1a76c462a8bb04d5cff6e8c', 'pending', '198926a4326761c0', NULL, '2025-08-10 05:18:13', '2025-08-10 05:18:14'),
('e9062285-658a-4676-b3f7-7ce8abfa70ab', 'form-001', 'cnt-me4piwag', 'f3f348cb843e09880cc61206f00903f6de6dba15b978062132fb0c5dfb95771b', 'pending', '19890952812a17b5', NULL, '2025-08-09 20:45:50', '2025-08-09 20:45:51'),
('test-submission-1', 'form-001', 'test-customer', 'test-token-123', 'pending', NULL, NULL, '2025-08-10 06:14:54', '2025-08-10 06:14:54'),
('22d95467-214c-4d1a-a593-25e7538ccd32', 'form-001', 'cnt-mfll6vr6', '22d95467-214c-4d1a-a593-25e7538ccd32', 'pending', NULL, NULL, '2025-09-30 19:27:57', '2025-09-30 19:27:57'),
('01ddb66d-c11d-41b9-9586-c5bcac6e02e3', 'form-002', 'cnt-me4piwag', '01ddb66d-c11d-41b9-9586-c5bcac6e02e3', 'pending', NULL, NULL, '2025-09-30 20:05:51', '2025-09-30 20:05:51');

-- --------------------------------------------------------

--
-- Table structure for table `feedback_responses`
--

CREATE TABLE `feedback_responses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `form_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_email` varchar(255) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `response_link` varchar(500) NOT NULL,
  `status` enum('pending','completed','expired') DEFAULT 'pending',
  `response_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`response_data`)),
  `submitted_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `feedback_responses`
--

INSERT INTO `feedback_responses` (`id`, `form_id`, `customer_id`, `customer_email`, `customer_name`, `response_link`, `status`, `response_data`, `submitted_at`, `created_at`, `updated_at`) VALUES
('13baad81-b06a-42e0-91f3-3356fb22ba71', 'form-001', 'cnt-me4piwag', 'only.link086@gmail.com', 'احمدرضا آوندی', 'https://crm.robintejarat.com/feedback/respond/13baad81-b06a-42e0-91f3-3356fb22ba71', 'pending', NULL, NULL, '2025-09-29 16:18:28', '2025-09-29 16:18:28'),
('3b366f39-4b67-4fd7-8b3b-d64f62b14b86', 'form-001', 'cnt-me4piwag', 'only.link086@gmail.com', 'احمدرضا آوندی', 'https://crm.robintejarat.com/feedback/respond/3b366f39-4b67-4fd7-8b3b-d64f62b14b86', 'pending', NULL, NULL, '2025-09-29 16:18:06', '2025-09-29 16:18:06'),
('d334729e-4957-4dd1-9126-fec1372bc847', 'form-001', 'cnt-me4piwag', 'only.link086@gmail.com', 'احمدرضا آوندی', 'https://crm.robintejarat.com/feedback/respond/d334729e-4957-4dd1-9126-fec1372bc847', 'pending', NULL, NULL, '2025-09-29 16:33:25', '2025-09-29 16:33:25');

-- --------------------------------------------------------

--
-- Table structure for table `interactions`
--

CREATE TABLE `interactions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `customer_id` varchar(36) NOT NULL,
  `type` enum('email','phone','chat','meeting','website','social') NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `direction` enum('inbound','outbound') NOT NULL,
  `channel` varchar(100) DEFAULT NULL,
  `date` timestamp NULL DEFAULT current_timestamp(),
  `duration` int(11) DEFAULT NULL,
  `outcome` text DEFAULT NULL,
  `sentiment` enum('positive','neutral','negative') DEFAULT NULL,
  `performed_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_attachments`
--

CREATE TABLE `interaction_attachments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `interaction_id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `mime_type` varchar(100) DEFAULT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_follow_ups`
--

CREATE TABLE `interaction_follow_ups` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `interaction_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` datetime DEFAULT NULL,
  `assigned_to` varchar(36) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_summary`
--

CREATE TABLE `interaction_summary` (
  `id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `description` mediumtext DEFAULT NULL,
  `direction` varchar(8) DEFAULT NULL,
  `interaction_date` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `duration` int(11) DEFAULT NULL,
  `outcome` varchar(50) DEFAULT NULL,
  `sentiment` varchar(8) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_tags`
--

CREATE TABLE `interaction_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `interaction_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `id` varchar(36) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `route` varchar(100) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `parent_id` varchar(36) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`id`, `name`, `display_name`, `description`, `route`, `icon`, `parent_id`, `sort_order`, `is_active`, `created_at`) VALUES
('mod-001', 'dashboard', 'داشبورد', 'صفحه اصلی سیستم', '/dashboard', 'LayoutDashboard', NULL, 1, 1, '2025-09-16 15:37:49'),
('mod-002', 'settings', 'تنظیمات سیستم', 'تنظیمات کلی سیستم', '/dashboard/settings', 'Settings', NULL, 2, 1, '2025-09-16 15:37:49'),
('mod-003', 'system-monitoring', 'مانیتورینگ سیستم', 'نظارت بر عملکرد سیستم', '/dashboard/system-monitoring', 'Monitor', NULL, 4, 1, '2025-09-16 15:37:49'),
('mod-004', 'customers', 'مشتریان', 'مدیریت مشتریان', '/dashboard/customers', 'Users', NULL, 10, 1, '2025-09-16 15:37:49'),
('mod-005', 'contacts', 'مخاطبین', 'مدیریت مخاطبین', '/dashboard/contacts', 'Contact', NULL, 11, 1, '2025-09-16 15:37:49'),
('mod-006', 'customer-club', 'باشگاه مشتریان', 'مدیریت باشگاه مشتریان', '/dashboard/customer-club', 'Users', NULL, 12, 1, '2025-09-16 15:37:49'),
('mod-007', 'feedback', 'بازخوردها', 'مدیریت بازخوردها', '/dashboard/feedback', 'MessageCircle', NULL, 13, 1, '2025-09-16 15:37:49'),
('mod-008', 'sales', 'فروش', 'مدیریت فروش', '/dashboard/sales', 'TrendingUp', NULL, 20, 1, '2025-09-16 15:37:49'),
('mod-009', 'products', 'محصولات', 'مدیریت محصولات', '/dashboard/products', 'Package', NULL, 21, 1, '2025-09-16 15:37:49'),
('mod-010', 'deals', 'معاملات', 'مدیریت معاملات', '/dashboard/deals', 'Briefcase', NULL, 22, 1, '2025-09-16 15:37:49'),
('mod-011', 'documents', 'مدیریت اسناد', 'مدیریت اسناد و مدارک', '/dashboard/documents', 'FileText', NULL, 23, 1, '2025-09-16 15:37:49'),
('mod-012', 'coworkers', 'همکاران', 'مدیریت همکاران', '/dashboard/coworkers', 'Users2', NULL, 30, 1, '2025-09-16 15:37:49'),
('mod-013', 'activities', 'فعالیت‌ها', 'مدیریت فعالیت‌ها', '/dashboard/activities', 'Activity', NULL, 31, 1, '2025-09-16 15:37:49'),
('mod-014', 'calendar', 'تقویم', 'مدیریت تقویم', '/dashboard/calendar', 'Calendar', NULL, 32, 1, '2025-09-16 15:37:49'),
('mod-015', 'chat', 'چت', 'سیستم پیام‌رسانی داخلی', '/dashboard/chat', 'MessageCircle', NULL, 33, 1, '2025-09-16 15:37:49'),
('mod-016', 'reports', 'گزارش‌ها', 'گزارشات سیستم', '/dashboard/reports', 'BarChart3', NULL, 40, 1, '2025-09-16 15:37:49'),
('mod-017', 'daily-reports', 'گزارش‌های روزانه', 'گزارشات روزانه', '/dashboard/daily-reports', 'FileText', NULL, 41, 1, '2025-09-16 15:37:49'),
('mod-018', 'reports-analysis', 'تحلیل گزارشات', 'تحلیل گزارشات', '/dashboard/insights/reports-analysis', 'BarChart3', NULL, 42, 1, '2025-09-16 15:37:49'),
('mod-019', 'feedback-analysis', 'تحلیل بازخوردها', 'تحلیل بازخوردها', '/dashboard/insights/feedback-analysis', 'MessageCircle', NULL, 43, 1, '2025-09-16 15:37:49'),
('mod-020', 'sales-analysis', 'تحلیل فروش', 'تحلیل فروش', '/dashboard/insights/sales-analysis', 'TrendingUp', NULL, 44, 1, '2025-09-16 15:37:49'),
('mod-021', 'audio-analysis', 'تحلیل صوتی', 'تحلیل صوتی مکالمات', '/dashboard/insights/audio-analysis', 'Mic2', NULL, 3, 1, '2025-09-16 15:37:49'),
('mod-022', 'tasks', 'وظایف', 'مدیریت وظایف', '/dashboard/tasks', 'CheckSquare', NULL, 46, 1, '2025-09-16 15:37:49'),
('mod-023', 'profile', 'پروفایل', 'پروفایل کاربری', '/dashboard/profile', 'User', NULL, 50, 1, '2025-09-16 15:37:49');

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) DEFAULT NULL,
  `deal_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` enum('customer_need','sales_tip','objection','general','technical','pricing') DEFAULT 'general',
  `is_private` tinyint(1) DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `note_tags`
--

CREATE TABLE `note_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `note_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `user_id` varchar(36) NOT NULL,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `related_id` varchar(36) DEFAULT NULL,
  `related_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `tenant_key`, `user_id`, `type`, `title`, `message`, `related_id`, `related_type`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
('01bc997f-da29-41b6-810a-98a1877cb478', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'chat_message', 'پیام جدید', 'پیام جدید از Robintejarat@gmail.com', NULL, NULL, 1, '2025-08-28 15:28:19', '2025-08-28 11:47:30', '2025-08-28 15:28:19'),
('09dff2d2-2ea8-4af2-985e-665295bed94c', 'rabin', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: af', 'وظیفه \"af\" توسط مهندس کریمی تکمیل شد', 'acb466e3-0cd3-49d5-8646-966cdb487c99', 'task', 1, '2025-09-15 20:58:22', '2025-09-15 17:27:42', '2025-09-15 20:58:22'),
('118dc133-4ebc-457e-a8ed-a21b8c795ebd', 'rabin', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: ,h,', 'وظیفه \",h,\" توسط مهندس کریمی تکمیل شد', 'da9b43c4-56c5-416a-9b2b-f8e5615fa213', 'task', 1, '2025-09-30 15:42:00', '2025-09-22 18:24:31', '2025-09-30 15:42:00'),
('1d3b0f55-75b1-4d18-9e74-f40052bad8b3', 'rabin', 'ceo-001', 'report_submitted', '📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۶/۰۶', 'گزارش \"گزارش روزانه ۱۴۰۴/۰۶/۰۶\" توسط خودم ارسال شد', 'e8e353bf-cbba-43c8-8753-ba0ea2ac2f72', 'report', 1, '2025-08-28 14:44:30', '2025-08-28 08:59:19', '2025-08-28 14:44:30'),
('6e2a3e84-d868-45b8-9121-a3e0c1b44fd7', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: af', 'وظیفه \"af\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'acb466e3-0cd3-49d5-8646-966cdb487c99', 'task', 0, NULL, '2025-09-15 16:20:51', '2025-09-15 19:50:51'),
('75b6a424-274a-4617-84d2-5a632ef237ff', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: ,h,', 'وظیفه \",h,\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'da9b43c4-56c5-416a-9b2b-f8e5615fa213', 'task', 0, NULL, '2025-09-16 16:03:23', '2025-09-16 19:33:23'),
('873de939-e65c-4da9-a773-4c9ab668387d', 'rabin', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: تست', 'وظیفه \"تست\" توسط احمد تکمیل شد', 'd1b1cda1-bdad-46c6-9d56-0b37f4ae7a35', 'task', 1, '2025-09-13 15:04:27', '2025-09-11 07:13:54', '2025-09-13 15:04:27'),
('88e5e1d7-88de-4a7d-a0da-5bfc61d64c35', 'rabin', 'ceo-001', 'task_assigned', '📋 وظیفه جدید: eds', 'وظیفه \"eds\" به شما اختصاص داده شد. اولویت: 🔴 بالا', '9e921e53-e460-46d4-bf4b-7808a285cc2f', 'task', 1, '2025-09-30 16:24:50', '2025-09-30 12:29:45', '2025-09-30 16:24:50'),
('8ba51ea7-ed72-4f57-bd04-e005f7857721', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: بسس', 'وظیفه \"بسس\" به شما اختصاص داده شد. اولویت: 🔴 بالا', 'c43e6bc0-449e-456e-98fd-e51d8017a5ca', 'task', 1, '2025-09-16 09:51:55', '2025-09-15 11:03:10', '2025-09-16 09:51:55'),
('8f37479c-8a78-4543-beeb-7106c8dc8eaa', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: تست', 'وظیفه \"تست\" به شما اختصاص داده شد. اولویت: 🔴 بالا', 'd1b1cda1-bdad-46c6-9d56-0b37f4ae7a35', 'task', 1, '2025-09-14 11:14:24', '2025-09-11 07:12:49', '2025-09-14 11:14:24'),
('9fbcf3ab-2e7e-438f-b34d-65aa5eca0ee8', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'chat_message', 'پیام جدید', 'پیام جدید از Robintejarat@gmail.com', NULL, NULL, 1, '2025-08-28 15:28:17', '2025-08-28 11:57:48', '2025-08-28 15:28:17'),
('b485934e-5829-472e-a8c0-cb9c47d9989b', 'rabin', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: بسس', 'وظیفه \"بسس\" توسط مهندس کریمی تکمیل شد', 'c43e6bc0-449e-456e-98fd-e51d8017a5ca', 'task', 1, '2025-09-15 19:50:58', '2025-09-15 16:20:40', '2025-09-15 19:50:58'),
('be9011f6-7b85-11f0-93d3-e55f2cbc2ba2', 'rabin', 'ceo-001', 'success', 'خوش آمدید', 'به سیستم مدیریت CRM خوش آمدید', NULL, NULL, 1, '2025-08-17 17:10:43', '2025-08-17 16:41:01', '2025-08-17 17:10:43'),
('be901491-7b85-11f0-93d3-e55f2cbc2ba2', 'rabin', 'ceo-001', 'info', 'گزارش فروش', 'گزارش فروش ماهانه آماده شده است', NULL, NULL, 1, '2025-08-17 17:10:43', '2025-08-17 16:41:01', '2025-08-17 17:10:43'),
('d67bdb14-d37c-41f5-a3c9-6c7290064700', 'rabin', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: eds', 'وظیفه \"eds\" به شما اختصاص داده شد. اولویت: 🔴 بالا', '9e921e53-e460-46d4-bf4b-7808a285cc2f', 'task', 0, NULL, '2025-09-30 12:29:45', '2025-09-30 15:59:45'),
('4e451381-07e1-44c2-a7b4-7753e1f7dcc3', 'rabin', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'task_assigned', '📋 وظیفه جدید: تست کامل و برسی نرم افزار CRM', 'وظیفه \"تست کامل و برسی نرم افزار CRM\" به شما اختصاص داده شد. اولویت: 🔴 بالا', '9cc572f5-8d9d-432e-a2ec-d81a0f63e1da', 'task', 1, '2025-10-01 16:27:53', '2025-10-01 12:53:41', '2025-10-01 16:27:53'),
('9f102268-b52d-4f23-9304-78e703581194', 'rabin', 'ceo-001', 'report_submitted', '📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۷/۰۹', 'گزارش \"گزارش روزانه ۱۴۰۴/۰۷/۰۹\" توسط احمدرضا آوندی ارسال شد', '60927ef5-7b0e-4f99-bf6e-d888107dd9ce', 'report', 1, '2025-10-03 18:01:09', '2025-10-01 12:57:33', '2025-10-03 18:01:09'),
('8c321a27-1f0f-43d2-981a-68a0f3315640', 'rabin', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'report_submitted', '📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۷/۰۹', 'گزارش \"گزارش روزانه ۱۴۰۴/۰۷/۰۹\" توسط احمدرضا آوندی ارسال شد', '60927ef5-7b0e-4f99-bf6e-d888107dd9ce', 'report', 0, NULL, '2025-10-01 12:57:33', '2025-10-01 16:27:33'),
('bc9e5730-3c17-4639-ac0f-6ff66124f61a', 'rabin', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'task_assigned', '📋 وظیفه جدید: احمدرضا آوندی تستی', 'وظیفه \"احمدرضا آوندی تستی\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'dcc6a51d-bd54-49f8-aeb0-b17af2545376', 'task', 0, NULL, '2025-10-11 14:26:02', '2025-10-11 17:56:02'),
('2b7c81fc-70a7-47a2-92db-891bc4197bb1', 'rabin', 'ceo-001', 'task_assigned', '📋 وظیفه جدید: وظیفه تستی 1760468765361', 'وظیفه \"وظیفه تستی 1760468765361\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', '73a8be37-d57e-4ed5-ae09-6530f71deabd', 'task', 0, NULL, '2025-10-14 15:36:05', '2025-10-14 19:06:05'),
('18748c9d-12bd-4acb-be53-a3fb16b6f64e', 'rabin', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'task_assigned', '📋 وظیفه جدید: وظیفه تستی 1760468772503', 'وظیفه \"وظیفه تستی 1760468772503\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'd666ecfe-239f-43ee-afda-e631f7a7120c', 'task', 0, NULL, '2025-10-14 15:36:12', '2025-10-14 19:06:12');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `display_name`, `description`, `created_at`) VALUES
('50d56977-653a-11f0-92b6-e251efb8cddb', 'read', 'مشاهده', NULL, '2025-07-20 07:22:38'),
('50d56c82-653a-11f0-92b6-e251efb8cddb', 'create', 'ایجاد', NULL, '2025-07-20 07:22:38'),
('50d56ce8-653a-11f0-92b6-e251efb8cddb', 'update', 'ویرایش', NULL, '2025-07-20 07:22:38'),
('50d56e9a-653a-11f0-92b6-e251efb8cddb', 'delete', 'حذف', NULL, '2025-07-20 07:22:38'),
('50d56ef8-653a-11f0-92b6-e251efb8cddb', 'manage', 'مدیریت', NULL, '2025-07-20 07:22:38'),
('a6be014e-70f7-11f0-9275-e24ee17dce91', 'view_all', 'مشاهده همه', 'دسترسی به مشاهده تمام بخش‌ها', '2025-08-04 05:55:41'),
('a6be02db-70f7-11f0-9275-e24ee17dce91', 'create_all', 'ایجاد همه', 'دسترسی به ایجاد در تمام بخش‌ها', '2025-08-04 05:55:41'),
('a6be0325-70f7-11f0-9275-e24ee17dce91', 'edit_all', 'ویرایش همه', 'دسترسی به ویرایش در تمام بخش‌ها', '2025-08-04 05:55:41'),
('a6be0346-70f7-11f0-9275-e24ee17dce91', 'delete_all', 'حذف همه', 'دسترسی به حذف در تمام بخش‌ها', '2025-08-04 05:55:41'),
('a6be0382-70f7-11f0-9275-e24ee17dce91', 'admin_access', 'دسترسی مدیر', 'دسترسی کامل مدیریتی', '2025-08-04 05:55:41');

-- --------------------------------------------------------

--
-- Table structure for table `pipeline_stages`
--

CREATE TABLE `pipeline_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `color` varchar(7) DEFAULT '#3B82F6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pipeline_stages`
--

INSERT INTO `pipeline_stages` (`id`, `name`, `code`, `description`, `stage_order`, `is_active`, `color`) VALUES
('stage-001', 'جذب', 'lead_generation', 'جذب مشتری و شناسایی فرصت فروش', 1, 1, '#10B981'),
('stage-002', 'نیازسنجی', 'needs_analysis', 'بررسی و تحلیل نیازهای مشتری', 2, 1, '#3B82F6'),
('stage-003', 'تماس و مشاوره اولیه', 'initial_consultation', 'برقراری تماس اولیه و ارائه مشاوره', 3, 1, '#8B5CF6'),
('stage-004', 'ارائه پیشنهاد', 'proposal_presentation', 'تهیه و ارائه پیشنهاد فنی و مالی', 4, 1, '#F59E0B'),
('stage-005', 'مذاکره و بستن قرارداد', 'negotiation_contract', 'مذاکره نهایی و امضای قرارداد', 5, 1, '#EF4444'),
('stage-006', 'فروش و تحویل محصول', 'sales_delivery', 'تکمیل فروش و تحویل محصول/خدمات', 6, 1, '#059669');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive') DEFAULT 'active',
  `sku` varchar(100) DEFAULT NULL,
  `tags` longtext DEFAULT NULL,
  `specifications` longtext DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `tenant_key`, `name`, `description`, `category`, `price`, `currency`, `status`, `sku`, `tags`, `specifications`, `created_by`, `created_at`, `updated_at`) VALUES
('020ec668-5f63-4487-ab45-22ccc7793e59', 'rabin', 'محصول به‌روز شده 1760468588563', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468587846', NULL, NULL, 'ceo-001', '2025-10-14 19:03:07', '2025-10-14 19:03:08'),
('05ec0ff6-6769-4d7b-982b-6b773be6c08e', 'rabin', 'محصول به‌روز شده 1760468608284', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468608141', NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 19:03:28', '2025-10-14 19:03:28'),
('4fdfbc89-b356-4402-8af0-09739f410f6a', 'rabin', 'محصول به‌روز شده 1760468771579', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468771356', NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 19:06:11', '2025-10-14 19:06:11'),
('5f8a39a3-8509-46c2-bf55-6619d0d64599', 'rabin', 'محصول به‌روز شده 1760468364549', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468364220', NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 18:59:24', '2025-10-14 18:59:24'),
('9e36dfa8-be00-4a8f-8201-0000c9f21e50', 'rabin', 'محصول به‌روز شده 1760468764423', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468764298', NULL, NULL, 'ceo-001', '2025-10-14 19:06:04', '2025-10-14 19:06:04'),
('adc9ada6-451d-470d-b776-b9f5701531fc', 'rabin', 'محصول به‌روز شده 1760468052482', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468049743', NULL, NULL, 'ceo-001', '2025-10-14 18:54:09', '2025-10-14 18:54:12'),
('ba4143ee-c5f6-49fa-afb2-1ce01ac9fe86', 'rabin', 'نرم افزار CRM', 'نرم افزار جامع CRM , CEM', 'نرم افزار', 3000000.00, 'IRR', 'active', '1386', NULL, NULL, 'ceo-001', '2025-10-11 16:50:05', '2025-10-11 16:50:05'),
('c909cf60-d688-4f49-b279-eddb8d1374bd', 'rabin', 'محصول به‌روز شده 1760468690367', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468690235', NULL, NULL, 'ceo-001', '2025-10-14 19:04:50', '2025-10-14 19:04:50'),
('ceb035fc-c022-4ed8-b040-50b342349522', 'rabin', 'یک محصول تستی', 'هیچی', 'نرم افزار', 200000000.00, 'IRR', 'active', '2323', NULL, NULL, 'ceo-001', '2025-10-11 17:53:16', '2025-10-11 17:53:16'),
('d4594aeb-ec15-4a51-98de-85c142aa035b', 'rabin', 'محصول به‌روز شده 1760468703443', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468703307', NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 19:05:03', '2025-10-14 19:05:03'),
('ea43727b-f4b1-4cf3-a501-3c6694bed68e', 'rabin', 'محصول به‌روز شده 1760468357100', 'توضیحات محصول', 'software', 1000000.00, 'IRR', 'active', 'SKU-1760468356926', NULL, NULL, 'ceo-001', '2025-10-14 18:59:17', '2025-10-14 18:59:17'),
('eaa05d03-5d6b-4801-9e3b-7909a1df2467', 'rabin', 'CRM', '..', 'نرم افزاری', NULL, 'IRR', 'active', NULL, NULL, NULL, 'ceo-001', '2025-10-11 16:08:13', '2025-10-11 16:08:13'),
('prod-001', 'rabin', 'خط تولید خوراک دام', 'دستگاه کامل تولید خوراک دام با ظرفیت 1 تن در ساعت', 'ماشین‌آلات کشاورزی', 500000000.00, 'IRR', 'active', 'FEED-LINE-001', NULL, NULL, 'ceo-001', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('prod-002', 'rabin', 'میکسر خوراک دام', 'میکسر صنعتی برای ترکیب مواد خوراکی', 'ماشین‌آلات کشاورزی', 150000000.00, 'IRR', 'active', 'MIXER-001', NULL, NULL, 'ceo-001', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('prod-003', 'rabin', 'آسیاب خوراک', 'آسیاب چکشی برای آسیاب کردن غلات', 'ماشین‌آلات کشاورزی', 80000000.00, 'IRR', 'active', 'MILL-001', NULL, NULL, 'ceo-001', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('prod-004', 'rabin', 'سیستم انتقال مواد', 'نوار نقاله و سیستم انتقال مواد', 'ماشین‌آلات کشاورزی', 200000000.00, 'IRR', 'active', 'CONVEYOR-001', NULL, NULL, 'ceo-001', '2025-10-11 16:12:51', '2025-10-11 16:12:51'),
('prod-005', 'rabin', 'دستگاه بسته‌بندی', 'دستگاه اتوماتیک بسته‌بندی خوراک', 'ماشین‌آلات کشاورزی', 300000000.00, 'IRR', 'active', 'PACKING-001', NULL, NULL, 'ceo-001', '2025-10-11 16:12:51', '2025-10-11 16:12:51');

-- --------------------------------------------------------

--
-- Table structure for table `product_discounts`
--

CREATE TABLE `product_discounts` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `product_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_quantity` int(11) DEFAULT 1,
  `valid_from` date DEFAULT NULL,
  `valid_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `projects`
--

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('planning','in_progress','review','completed','on_hold','cancelled') DEFAULT 'planning',
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `budget` decimal(15,2) DEFAULT NULL,
  `spent` decimal(15,2) DEFAULT 0.00,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `actual_start_date` date DEFAULT NULL,
  `actual_end_date` date DEFAULT NULL,
  `progress` decimal(5,2) DEFAULT 0.00,
  `manager_id` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `color` varchar(7) DEFAULT '#3B82F6',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_members`
--

CREATE TABLE `project_members` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('manager','member','viewer') DEFAULT 'member',
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_milestones`
--

CREATE TABLE `project_milestones` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `order_index` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_tags`
--

CREATE TABLE `project_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `project_team`
--

CREATE TABLE `project_team` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` varchar(100) DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `deal_id` varchar(36) DEFAULT NULL,
  `customer_id` varchar(36) NOT NULL,
  `customer_name` varchar(255) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `payment_status` enum('pending','partial','paid','refunded') DEFAULT 'pending',
  `payment_method` varchar(100) DEFAULT NULL,
  `sale_date` timestamp NULL DEFAULT current_timestamp(),
  `delivery_date` timestamp NULL DEFAULT NULL,
  `payment_due_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `invoice_number` varchar(100) DEFAULT NULL,
  `sales_person_id` varchar(36) NOT NULL,
  `sales_person_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `tenant_key`, `deal_id`, `customer_id`, `customer_name`, `total_amount`, `currency`, `payment_status`, `payment_method`, `sale_date`, `delivery_date`, `payment_due_date`, `notes`, `invoice_number`, `sales_person_id`, `sales_person_name`, `created_at`, `updated_at`) VALUES
('62099ca5-2cad-4ec8-86d5-2efd27972dc9', 'rabin', NULL, 'a463ed0b-f1df-4804-b896-7cd48f707b78', 'احمدرضا آوندی تست مشتری', 2000000.00, 'IRR', 'paid', 'نقد', '2025-10-01 12:54:53', '0000-00-00 00:00:00', NULL, NULL, '13213', 'ceo-001', 'مهندس کریمی', '2025-10-01 12:54:53', '2025-10-01 12:54:53'),
('b5c1684b-a76e-4489-8a7f-5ec07c7a1900', 'rabin', NULL, 'f7edb9b0-0d85-4782-9743-bc688816d1b6', 'مشتری به‌روز شده 1760468048855', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:24:13', NULL, NULL, NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-10-14 15:24:13', '2025-10-14 15:24:13'),
('c0ad08b9-5c24-49ec-bbbe-e3c811f7e189', 'rabin', NULL, 'f016ce54-973b-4b56-9275-3b454d699ff6', 'مشتری به‌روز شده 1760468356771', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:29:17', NULL, NULL, NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-10-14 15:29:17', '2025-10-14 15:29:17'),
('835cbf1b-094a-4912-aec0-8a7d652659d8', 'rabin', NULL, 'f016ce54-973b-4b56-9275-3b454d699ff6', 'مشتری به‌روز شده 1760468356771', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:29:24', NULL, NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'مدیر سامین', '2025-10-14 15:29:24', '2025-10-14 15:29:24'),
('fa4eb4ab-10a4-4d70-b341-53bc28cf74c0', 'rabin', NULL, '815f4c0c-b27c-4a4b-a598-518d47cb5027', 'مشتری به‌روز شده 1760468586569', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:33:10', NULL, NULL, NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-10-14 15:33:10', '2025-10-14 15:33:10'),
('cb7b1fd9-e3db-45c5-98de-3e7561174090', 'rabin', NULL, '815f4c0c-b27c-4a4b-a598-518d47cb5027', 'مشتری به‌روز شده 1760468586569', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:33:28', NULL, NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'مدیر سامین', '2025-10-14 15:33:28', '2025-10-14 15:33:28'),
('907aeeb8-2b4f-4a88-94f4-8610e9c271a3', 'rabin', NULL, '146690b0-5551-47aa-bdbd-1a0b1da20442', 'مشتری به‌روز شده 1760468690103', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:34:50', NULL, NULL, NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-10-14 15:34:50', '2025-10-14 15:34:50'),
('f26a5643-c11b-47c9-b86c-1decc35622dc', 'rabin', NULL, '146690b0-5551-47aa-bdbd-1a0b1da20442', 'مشتری به‌روز شده 1760468690103', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:35:03', NULL, NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'مدیر سامین', '2025-10-14 15:35:03', '2025-10-14 15:35:03'),
('289fbd44-a3a6-499c-be12-51f0f2cd5e00', 'rabin', NULL, 'bb4af0df-a466-46e6-9e99-3cc4e40a8b6e', 'مشتری به‌روز شده 1760468764180', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:36:04', NULL, NULL, NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-10-14 15:36:04', '2025-10-14 15:36:04'),
('083f1ed3-23a8-4506-81b2-ba96c0453f9e', 'rabin', NULL, 'bb4af0df-a466-46e6-9e99-3cc4e40a8b6e', 'مشتری به‌روز شده 1760468764180', 1000000.00, 'IRR', 'pending', NULL, '2025-10-14 15:36:11', NULL, NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'مدیر سامین', '2025-10-14 15:36:11', '2025-10-14 15:36:11');

-- --------------------------------------------------------

--
-- Table structure for table `sales_pipeline_report`
--

CREATE TABLE `sales_pipeline_report` (
  `deal_id` varchar(36) DEFAULT NULL,
  `deal_title` varchar(255) DEFAULT NULL,
  `deal_value` decimal(15,2) DEFAULT NULL,
  `probability` int(11) DEFAULT NULL,
  `expected_close_date` date DEFAULT NULL,
  `stage_id` varchar(36) DEFAULT NULL,
  `stage_name` varchar(100) DEFAULT NULL,
  `stage_order` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `assigned_to_name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_pipeline_stages`
--

CREATE TABLE `sales_pipeline_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales_pipeline_stages`
--

INSERT INTO `sales_pipeline_stages` (`id`, `name`, `description`, `stage_order`, `color`, `is_active`, `created_at`, `updated_at`) VALUES
('stage-001', 'مشتری بالقوه', 'مشتریان جدید که هنوز تماس اولیه برقرار نشده', 1, '#6B7280', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-002', 'تماس اولیه', 'اولین تماس با مشتری برقرار شده', 2, '#3B82F6', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-003', 'ارزیابی نیاز', 'نیازهای مشتری شناسایی شده', 3, '#F59E0B', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-004', 'ارائه پیشنهاد', 'پیشنهاد قیمت ارائه شده', 4, '#8B5CF6', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-005', 'مذاکره', 'در حال مذاکره با مشتری', 5, '#EF4444', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-006', 'بسته شده - برنده', 'معامله با موفقیت بسته شده', 6, '#10B981', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06'),
('stage-007', 'بسته شده - بازنده', 'معامله شکست خورده', 7, '#DC2626', 1, '2025-09-25 12:07:06', '2025-09-25 12:07:06');

-- --------------------------------------------------------

--
-- Table structure for table `sales_statistics`
--

CREATE TABLE `sales_statistics` (
  `sale_date` date DEFAULT NULL,
  `total_sales` bigint(21) DEFAULT NULL,
  `total_revenue` decimal(37,2) DEFAULT NULL,
  `avg_sale_value` decimal(19,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `sale_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `tenant_key`, `sale_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `discount_percentage`, `total_price`, `created_at`) VALUES
('1d56c615-5d83-493c-b4f3-507cca30b20d', 'rabin', 'dbed494f-bf49-4df8-86d1-f16982d36b6a', 'd66fe853-514d-4af7-adf9-5c3b14f91238', 'نمیدونم322', 1, 2000000.00, 0.00, 2000000.00, '2025-09-25 07:55:02'),
('25e5dcf3-63d3-4ed8-a02d-435fb5fcb160', 'rabin', 'fa808d21-34ab-4903-91ae-7887a095cb6c', 'd66fe853-514d-4af7-adf9-5c3b14f91238', 'نمیدونم', 1, 2000000.00, 0.00, 2000000.00, '2025-09-15 13:14:05'),
('7032bbc5-d623-40fc-9df7-89647fdc3517', 'rabin', '0645eaaf-906c-4a89-8672-7b9aab6bc736', 'dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344', 'نرم افزار CRM', 1, 20000000.00, 0.00, 20000000.00, '2025-09-15 13:55:22'),
('8c9b9610-ee5d-4db4-b75b-798f39de435c', 'rabin', '2390d8b6-2ae7-4d48-a7b1-67ac3b595041', 'd66fe853-514d-4af7-adf9-5c3b14f91238', 'نمیدونم322', 1, 2000000.00, 0.00, 2000000.00, '2025-09-25 10:51:44'),
('d2d291e8-82a7-484f-b2dc-3fb94539d287', 'rabin', 'ef99a69a-7ebd-4b59-be72-eccf9842d88b', 'prod-003', 'محصول نمونه 3', 1, 500000.00, 0.00, 500000.00, '2025-09-30 12:42:54'),
('ec4d0c1b-5cb6-4f29-b06d-4bc185e92003', 'rabin', '94ccee5c-773c-483f-adea-42db3691864a', 'dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344', 'نرم افزار CRM', 1, 30000000.00, 0.00, 30000000.00, '2025-09-15 16:17:44'),
('ed1de523-ecd9-4fff-8bb0-7fe789f84a89', 'rabin', '1e97f54c-c6c6-4907-8e11-ef815fa77e56', 'prod-003', 'محصول نمونه 3', 1, 500000.00, 0.00, 500000.00, '2025-09-30 12:22:24'),
('e4e3e0e6-e322-44b4-b2ed-0f49175c6e81', 'rabin', '7ee43685-3ac0-437d-8a4c-88304ec76220', '8ebd635c-8aa0-425a-98a0-f2ead098630e', 'تستی ***', 1, 234554232.00, 0.00, 234554232.00, '2025-09-30 19:27:00'),
('8dc14499-c5e3-4d42-8af7-99a2affc62ff', 'rabin', '62099ca5-2cad-4ec8-86d5-2efd27972dc9', '48d5ae2e-bbd2-4ee7-bab7-5a586bea8328', 'نرم افزار CRM', 1, 2000000.00, 0.00, 2000000.00, '2025-10-01 12:54:53'),
('8ca378ca-686c-4cfc-918f-2dd5b981a9b0', 'rabin', 'b5c1684b-a76e-4489-8a7f-5ec07c7a1900', 'adc9ada6-451d-470d-b776-b9f5701531fc', 'محصول به‌روز شده 1760468052482', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:24:13'),
('06b4f192-fe51-4b5e-bdc3-c7619b337020', 'rabin', 'c0ad08b9-5c24-49ec-bbbe-e3c811f7e189', 'ea43727b-f4b1-4cf3-a501-3c6694bed68e', 'محصول به‌روز شده 1760468357100', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:29:17'),
('77fed432-6aed-49b3-9851-a2ebf1bd4a25', 'rabin', '835cbf1b-094a-4912-aec0-8a7d652659d8', 'ea43727b-f4b1-4cf3-a501-3c6694bed68e', 'محصول به‌روز شده 1760468357100', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:29:24'),
('b01e595d-d79f-44a3-8a90-cb6c2af0eb2f', 'rabin', 'fa4eb4ab-10a4-4d70-b341-53bc28cf74c0', '020ec668-5f63-4487-ab45-22ccc7793e59', 'محصول به‌روز شده 1760468588563', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:33:10'),
('c8944152-3b75-4131-ad5f-12728d9c1284', 'rabin', 'cb7b1fd9-e3db-45c5-98de-3e7561174090', '020ec668-5f63-4487-ab45-22ccc7793e59', 'محصول به‌روز شده 1760468588563', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:33:28'),
('e07541f9-8720-438d-bd42-adaeca895bb5', 'rabin', '907aeeb8-2b4f-4a88-94f4-8610e9c271a3', 'c909cf60-d688-4f49-b279-eddb8d1374bd', 'محصول به‌روز شده 1760468690367', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:34:50'),
('fa90ed73-7e9d-471b-acc4-15e531b1c5ce', 'rabin', 'f26a5643-c11b-47c9-b86c-1decc35622dc', 'c909cf60-d688-4f49-b279-eddb8d1374bd', 'محصول به‌روز شده 1760468690367', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:35:03'),
('677cb561-cf13-4780-8905-558763369e61', 'rabin', '289fbd44-a3a6-499c-be12-51f0f2cd5e00', '9e36dfa8-be00-4a8f-8201-0000c9f21e50', 'محصول به‌روز شده 1760468764423', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:36:04'),
('43755233-6454-4e05-95ba-d8d59b9e1b3b', 'rabin', '083f1ed3-23a8-4506-81b2-ba96c0453f9e', '9e36dfa8-be00-4a8f-8201-0000c9f21e50', 'محصول به‌روز شده 1760468764423', 2, 500000.00, 0.00, 1000000.00, '2025-10-14 15:36:11');

-- --------------------------------------------------------

--
-- Table structure for table `surveys`
--

CREATE TABLE `surveys` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('csat','nps','custom','product','employee') DEFAULT 'csat',
  `status` enum('draft','active','paused','completed') DEFAULT 'draft',
  `target_responses` int(11) DEFAULT 100,
  `actual_responses` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `started_at` timestamp NULL DEFAULT NULL,
  `ended_at` timestamp NULL DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_questions`
--

CREATE TABLE `survey_questions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `survey_id` varchar(36) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('rating','text','multiple_choice','yes_no') NOT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `order_index` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `survey_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `response_text` text DEFAULT NULL,
  `response_value` decimal(3,2) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_logs`
--

CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `log_type` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_logs`
--

INSERT INTO `system_logs` (`id`, `log_type`, `status`, `details`, `user_id`, `created_at`) VALUES
(1, 'email_test', 'failed', '{\"testEmail\":\"ahmadreza.avandi@gmail.com\",\"error\":\"Email service not configured\",\"timestamp\":\"2025-09-08T08:39:53.721Z\"}', NULL, '2025-09-08 08:39:53'),
(2, 'setting_updated', 'success', '{\"settingKey\":\"email_config\",\"newValue\":{\"enabled\":true,\"smtp_host\":\"smtp.gmail.com\",\"smtp_port\":587,\"smtp_secure\":true,\"smtp_user\":\"Robintejarat@gmail.com\",\"smtp_password\":\"your-app-specific-password\"},\"timestamp\":\"2025-09-08T08:52:51.800Z\"}', NULL, '2025-09-08 08:52:51');

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `updated_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `updated_at`, `updated_by`) VALUES
('0b753b1b-6526-11f0-92b6-e251efb8cddb', 'company_name', 'شرکت رابین', 'string', 'رابین تجارت\r\n', 1, '2025-07-26 05:55:26', NULL),
('0b753ca1-6526-11f0-92b6-e251efb8cddb', 'currency', 'IRR', 'string', 'واحد پول پیش‌فرض', 1, '2025-07-20 04:57:32', NULL),
('0b753d16-6526-11f0-92b6-e251efb8cddb', 'timezone', 'Asia/Tehran', 'string', 'منطقه زمانی', 1, '2025-07-20 04:57:32', NULL),
('0b753d56-6526-11f0-92b6-e251efb8cddb', 'language', 'fa', 'string', 'زبان پیش‌فرض', 1, '2025-07-20 04:57:32', NULL),
('0b753d97-6526-11f0-92b6-e251efb8cddb', 'max_file_size', '10485760', 'number', 'حداکثر اندازه فایل (بایت)', 0, '2025-07-20 04:57:32', NULL),
('966fff18-7686-11f0-92d0-e353f4d03495', 'backup_config', '{\"enabled\": false, \"schedule\": \"daily\", \"time\": \"02:00\", \"emailRecipients\": [], \"retentionDays\": 30, \"compression\": true}', 'string', 'Backup configuration settings', 0, '2025-08-11 07:41:27', NULL),
('967004a7-7686-11f0-92d0-e353f4d03495', 'email_config', '{\"enabled\":true,\"smtp_host\":\"smtp.gmail.com\",\"smtp_port\":587,\"smtp_secure\":true,\"smtp_user\":\"Robintejarat@gmail.com\",\"smtp_password\":\"your-app-specific-password\"}', 'string', 'Email service configuration', 0, '2025-09-08 05:22:51', NULL),
('96700597-7686-11f0-92d0-e353f4d03495', 'system_monitoring', '{\"enabled\": true, \"checkInterval\": 300, \"alertThresholds\": {\"diskSpace\": 85, \"memory\": 90, \"cpu\": 80}}', 'string', 'System monitoring configuration', 0, '2025-08-11 07:41:27', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `deal_id` varchar(36) DEFAULT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `assigned_to` varchar(36) NOT NULL,
  `assigned_by` varchar(36) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `category` enum('call','meeting','follow_up','proposal','admin','other') DEFAULT 'follow_up',
  `due_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `completed_at` timestamp NULL DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `tenant_key`, `title`, `description`, `customer_id`, `deal_id`, `project_id`, `assigned_to`, `assigned_by`, `priority`, `status`, `category`, `due_date`, `created_at`, `updated_at`, `completed_at`, `completion_notes`, `attachments`) VALUES
('9cc572f5-8d9d-432e-a2ec-d81a0f63e1da', 'rabin', 'تست کامل و برسی نرم افزار CRM', 'همکار گرامی لطفا نرم افزار رو برسی کنید', NULL, NULL, NULL, '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'ceo-001', 'high', 'completed', 'follow_up', '0000-00-00 00:00:00', '2025-10-01 16:23:41', '2025-10-01 18:33:20', '2025-10-01 18:33:20', NULL, NULL),
('dcc6a51d-bd54-49f8-aeb0-b17af2545376', 'rabin', 'احمدرضا آوندی تستی', 'تستی', NULL, NULL, NULL, '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'ceo-001', 'medium', 'pending', 'follow_up', '0000-00-00 00:00:00', '2025-10-11 17:56:02', '2025-10-11 17:56:02', NULL, NULL, NULL),
('73a8be37-d57e-4ed5-ae09-6530f71deabd', 'rabin', 'وظیفه تستی 1760468765361', 'توضیحات وظیفه', NULL, NULL, NULL, 'ceo-001', 'ceo-001', 'medium', 'pending', 'follow_up', '2025-12-30 20:30:00', '2025-10-14 19:06:05', '2025-10-14 19:06:05', NULL, NULL, NULL),
('d666ecfe-239f-43ee-afda-e631f7a7120c', 'rabin', 'وظیفه تستی 1760468772503', 'توضیحات وظیفه', NULL, NULL, NULL, 'd497a492-f183-4452-86c1-961e5a0e3e22', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'medium', 'pending', 'follow_up', '2025-12-30 20:30:00', '2025-10-14 19:06:12', '2025-10-14 19:06:12', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_assignees`
--

CREATE TABLE `task_assignees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`id`, `tenant_key`, `task_id`, `user_id`, `assigned_at`, `assigned_by`) VALUES
('9eb5b91c-0c15-4c82-8bd0-8ab22cf3ad0a', 'rabin', '9e921e53-e460-46d4-bf4b-7808a285cc2f', 'ceo-001', '2025-09-30 15:59:45', 'ceo-001'),
('27c26e6d-07a1-41bb-b494-496641a2bddf', 'rabin', '9cc572f5-8d9d-432e-a2ec-d81a0f63e1da', '9f6b90b9-0723-4261-82c3-cd54e21d3995', '2025-10-01 16:23:41', 'ceo-001'),
('346494c5-a1de-4033-906a-ce429da895f5', 'rabin', 'dcc6a51d-bd54-49f8-aeb0-b17af2545376', '9f6b90b9-0723-4261-82c3-cd54e21d3995', '2025-10-11 17:56:02', 'ceo-001'),
('6b75afbe-c167-4875-bf29-4cfbf606a841', 'rabin', '73a8be37-d57e-4ed5-ae09-6530f71deabd', 'ceo-001', '2025-10-14 19:06:05', 'ceo-001'),
('5862d21f-62e7-4096-b04e-28a76237cfae', 'rabin', 'd666ecfe-239f-43ee-afda-e631f7a7120c', 'd497a492-f183-4452-86c1-961e5a0e3e22', '2025-10-14 19:06:12', 'd497a492-f183-4452-86c1-961e5a0e3e22');

-- --------------------------------------------------------

--
-- Table structure for table `task_comments`
--

CREATE TABLE `task_comments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_files`
--

CREATE TABLE `task_files` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `task_id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` int(11) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `task_steps`
--

CREATE TABLE `task_steps` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `task_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `order_index` int(11) NOT NULL DEFAULT 0,
  `status` enum('pending','in_progress','completed','skipped') DEFAULT 'pending',
  `due_date` timestamp NULL DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `customer_id` varchar(36) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('open','in_progress','waiting_customer','closed') DEFAULT 'open',
  `category` varchar(100) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `created_by` varchar(36) DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `resolution_time` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ticket_updates`
--

CREATE TABLE `ticket_updates` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `ticket_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `type` enum('comment','status_change','assignment_change','priority_change') DEFAULT 'comment',
  `content` text DEFAULT NULL,
  `old_value` varchar(255) DEFAULT NULL,
  `new_value` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ceo','sales_manager','sales_agent','agent') DEFAULT 'sales_agent',
  `department` varchar(100) DEFAULT NULL,
  `position` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive','away','online','offline') DEFAULT 'active',
  `avatar` varchar(500) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `team` varchar(100) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(36) DEFAULT NULL,
  `tenant_key` varchar(100) DEFAULT 'rabin' COMMENT 'کلید tenant که کاربر به آن تعلق دارد'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `full_name`, `name`, `email`, `password`, `role`, `department`, `position`, `status`, `avatar`, `avatar_url`, `phone`, `team`, `last_active`, `last_login`, `created_at`, `updated_at`, `created_by`, `tenant_key`) VALUES
('ceo-001', 'Robintejarat@gmail.com', 'مهندس کریمی', 'مهندس کریمی', 'Robintejarat@gmail.com', '$2b$10$/r0.PUBZw.x5nhGodAsuM.nEMoCVLMuzXFwEMj.VnsoixS780ZUhi', 'ceo', NULL, NULL, 'active', '/uploads/avatars/ceo-001-1755615503750.png', NULL, '', NULL, '2025-07-20 04:57:32', '2025-10-17 10:27:10', '2025-07-20 04:57:32', '2025-10-17 10:27:10', NULL, 'rabin'),
('362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'rameshk.kosar@gmail.com', 'کوثر رامشک', 'کوثر رامشک', 'rameshk.kosar@gmail.com', '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq', 'agent', NULL, NULL, 'active', NULL, NULL, '09172087848', NULL, '2025-09-08 06:54:26', '2025-09-08 07:34:19', '2025-09-08 06:54:26', '2025-10-14 18:56:10', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'rabin'),
('a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'alirezasahafi77@gmail.com', 'علیرضا صحافی', 'علیرضا صحافی', 'alirezasahafi77@gmail.com', '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq', 'sales_agent', NULL, NULL, 'active', NULL, NULL, '09332107233', NULL, '2025-09-08 06:53:13', '2025-09-13 05:59:44', '2025-09-08 06:53:13', '2025-10-14 18:56:10', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'rabin'),
('e820e817-eed0-40c0-9916-d23599e7e2ef', 'shamsaieensiye72@gmail.com', 'مهندس شمسایی', 'مهندس شمسایی', 'shamsaieensiye72@gmail.com', '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq', 'ceo', NULL, NULL, 'active', NULL, NULL, '09175456003', NULL, '2025-09-06 12:10:56', '2025-09-09 07:40:57', '2025-09-06 12:10:56', '2025-10-14 18:56:10', 'ceo-001', 'rabin'),
('9f6b90b9-0723-4261-82c3-cd54e21d3995', 'ahmadreza.avandi@gmail.com', 'احمدرضا آوندی', 'احمدرضا آوندی', 'ahmadreza.avandi@gmail.com', '$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq', 'agent', NULL, NULL, 'active', NULL, NULL, '09921386634', NULL, '2025-10-01 16:14:02', '2025-10-13 19:42:52', '2025-10-01 16:14:02', '2025-10-14 18:56:10', 'ceo-001', 'rabin'),
('fedb499b-23a8-4af7-9b9d-587724a0b4c7', NULL, NULL, 'مدیر تست', 'admin@test.com', '$2b$10$qu3hZpNbE1HhZEEEq5OUOeUn1tNtoRogGpDzSC/5hwWEtyURxfDrq', 'ceo', NULL, NULL, 'active', NULL, NULL, NULL, NULL, '2025-10-13 17:39:19', NULL, '2025-10-13 17:39:19', '2025-10-13 17:39:19', NULL, 'testcompany'),
('d497a492-f183-4452-86c1-961e5a0e3e22', NULL, NULL, 'مدیر سامین', 'admin@samin.com', '$2a$10$Mx.JpKc4q762x/0dL91GbeZbNsOkTK4ykiTW/eYWcQoFogG1QTfOG', 'ceo', NULL, NULL, 'active', NULL, NULL, NULL, NULL, '2025-10-13 17:53:59', NULL, '2025-10-13 17:53:59', '2025-10-14 18:57:27', NULL, 'samin');

-- --------------------------------------------------------

--
-- Table structure for table `user_activities`
--

CREATE TABLE `user_activities` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_activities`
--

INSERT INTO `user_activities` (`id`, `user_id`, `activity_type`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
('014dcc08-8c8f-11f0-9c70-2c3b705dd50b', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-09-08 08:37:07'),
('06d54811-9d50-11f0-8e7a-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 16:19:08'),
('0a4ff3b2-92f6-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-16 12:09:48'),
('0ae512b2-92f0-11f0-8687-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:26:52'),
('12942e58-7cf7-11f0-9093-dc377bc569bf', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 15:23:41'),
('179a0e03-9d5e-11f0-8e7a-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 17:59:49'),
('1e682c4c-9d64-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 18:42:58'),
('1fec73a9-7cfa-11f0-9093-dc377bc569bf', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 15:45:33'),
('25d0276b-9d50-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 16:20:00'),
('26c823c6-92ef-11f0-8687-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:20:29'),
('29c1b97f-92f8-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:24:59'),
('2d90f24f-92e4-11f0-8687-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 10:01:56'),
('3a6bfa4e-9272-11f0-8402-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-15 20:26:15'),
('3bc65529-92f7-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:18:20'),
('3bc6717e-92f7-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:18:20'),
('3e7eee6f-90bd-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:18:12'),
('410fc636-90c1-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:46:54'),
('43bbf259-9333-11f0-bdbd-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 19:28:03'),
('43da219a-9d64-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 18:44:00'),
('4b72a438-90c0-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:40:02'),
('4bc70ef0-9d61-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 18:22:45'),
('53c9bb36-7b87-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-17 16:52:21'),
('5f35f374-8408-11f0-902a-db316565c9c4', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 12:28:17'),
('62cce19d-9d5e-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 18:01:55'),
('62cd2ca6-9d5e-11f0-8e7a-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::ffff:127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 18:01:55'),
('670594ea-7b87-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-17 16:52:53'),
('6e90ad9f-9165-11f0-8060-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 12:22:08'),
('80289e05-92f2-11f0-8687-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:44:27'),
('81bffbff-8565-11f0-9365-e45a14587d68', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-30 05:52:26'),
('8a63e329-915c-11f0-8060-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 11:18:29'),
('8a663841-915c-11f0-8060-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 11:18:29'),
('902e0d1d-8408-11f0-902a-db316565c9c4', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 12:29:39'),
('91101670-843f-11f0-9067-dc34729cb9cc', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 18:48:19'),
('a33440db-9284-11f0-a782-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-15 22:38:01'),
('a42c1cfa-9165-11f0-8060-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 12:23:38'),
('ce1f27a2-92f6-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:15:16'),
('d311a5b2-84e2-11f0-901f-db31635ba116', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 14:16:58'),
('d33c0a21-84e2-11f0-901f-db31635ba116', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 14:16:58'),
('de2cd7d4-7b8a-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-17 17:17:41'),
('e55c9296-9187-11f0-9190-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-14 16:28:50'),
('f033bbc6-92e3-11f0-8687-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 10:00:13'),
('f5cc22f5-84e2-11f0-901f-db31635ba116', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-29 14:17:56'),
('f85838e7-92f1-11f0-8687-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:40:39'),
('f9a7c242-8411-11f0-902a-db316565c9c4', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 15:27:56'),
('fbde2b41-9d5d-11f0-8e7a-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-29 17:59:03'),
('0c86c733-9e34-11f0-9e95-0ae6df21f504', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '5.233.141.240', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 19:31:23'),
('c57e71ee-9e38-11f0-8ab2-a2d0d1a9e9d9', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '5.233.141.240', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-30 20:05:11'),
('44f84445-9ee3-11f0-a04a-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-01 16:25:40'),
('933c4c48-9f9c-11f0-b5f3-581122e4f0be', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-02 14:32:08'),
('51ed6dac-a08c-11f0-be7c-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-10-03 19:08:17'),
('d3650a5a-a85f-11f0-8cc3-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36', '2025-10-13 18:09:57');

-- --------------------------------------------------------

--
-- Table structure for table `user_interaction_performance`
--

CREATE TABLE `user_interaction_performance` (
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` varchar(255) DEFAULT NULL,
  `role` enum('ceo','sales_manager','sales_agent','agent') DEFAULT NULL,
  `total_interactions` bigint(21) DEFAULT NULL,
  `positive_interactions` bigint(21) DEFAULT NULL,
  `negative_interactions` bigint(21) DEFAULT NULL,
  `avg_interaction_duration` decimal(14,4) DEFAULT NULL,
  `phone_interactions` bigint(21) DEFAULT NULL,
  `email_interactions` bigint(21) DEFAULT NULL,
  `chat_interactions` bigint(21) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_modules`
--

CREATE TABLE `user_modules` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `granted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_modules`
--

INSERT INTO `user_modules` (`id`, `user_id`, `module_id`, `granted`, `created_at`, `created_by`) VALUES
('um-19e596cd-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-001', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a183-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-002', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a29b-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-003', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a33b-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-004', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a3d0-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-005', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a465-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-006', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a4e6-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-007', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a564-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-008', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a5ea-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-009', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a665-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-010', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a6df-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-011', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a75b-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-012', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a7dd-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-013', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a859-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-014', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a8d6-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-015', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a95f-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-016', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5a9e0-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-017', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5aa5e-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-018', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5aad9-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-019', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5ab56-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-020', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5abd6-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-021', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5ac52-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-022', 1, '2025-09-16 15:37:49', 'ceo-001'),
('um-19e5acd1-9313-11f0-bdbd-581122e4f', 'ceo-001', 'mod-023', 1, '2025-09-16 15:37:49', 'ceo-001');

-- --------------------------------------------------------

--
-- Table structure for table `user_module_permissions`
--

CREATE TABLE `user_module_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `granted` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_module_permissions`
--

INSERT INTO `user_module_permissions` (`id`, `user_id`, `module_id`, `granted`, `created_at`, `updated_at`) VALUES
('0c313dc2-69e3-11f0-92a7-e251ebaa91d8', 'b007b8be-1f2e-4364-88c2-856b76e77984', '3f68a634-75d5-4107-a6a8-a7fb664ab55c', 1, '2025-07-26 05:40:33', '2025-07-26 05:40:33'),
('0c313e9a-69e3-11f0-92a7-e251ebaa91d8', 'ceo-001', '3f68a634-75d5-4107-a6a8-a7fb664ab55c', 1, '2025-07-26 05:40:33', '2025-07-26 05:40:33'),
('0c313f56-69e3-11f0-92a7-e251ebaa91d8', 'fff87449-a074-4a50-a35e-ba15b70fd414', '3f68a634-75d5-4107-a6a8-a7fb664ab55c', 1, '2025-07-26 05:40:33', '2025-07-26 05:40:33'),
('5ea7005c-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 06:31:18'),
('5ea70a2d-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdc15-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 08:13:44'),
('5ea70ec9-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdcff-6678-11f0-9334-e4580a2bbc2b', 0, '2025-08-11 05:16:42', '2025-09-15 19:07:51'),
('5ea71433-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-08-11 05:16:42'),
('5ea717b6-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdc68-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 06:31:35'),
('5ea71b2d-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 06:31:19'),
('5eabfaa2-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdf55-6678-11f0-9334-e4580a2bbc2b', 0, '2025-08-11 05:16:42', '2025-09-15 19:07:25'),
('5eac05ad-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdf07-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 06:31:41'),
('5eac0cc7-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9be1e2-6678-11f0-9334-e4580a2bbc2b', 0, '2025-08-11 05:16:42', '2025-09-15 19:07:23'),
('5eac1552-7672-11f0-92eb-e354fae89e60', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bde49-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-11 05:16:42', '2025-09-16 06:31:31'),
('7aa1d0d3-68b9-11f0-92b6-e251eeb8cbd2', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9bdc15-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-24 18:10:29', '2025-07-24 18:10:29'),
('7aa1e2c1-68b9-11f0-92b6-e251eeb8cbd2', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9bdc68-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-24 18:10:29', '2025-07-24 18:10:29'),
('a2d3e5ed-70f1-11f0-9275-e24ee17dce91', 'c032caab-5d9b-4a9d-920f-ea9c7703a1fb', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-04 05:12:37', '2025-08-04 05:12:37'),
('a2d676c0-70f1-11f0-9275-e24ee17dce91', 'c032caab-5d9b-4a9d-920f-ea9c7703a1fb', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-04 05:12:37', '2025-08-04 05:12:37'),
('aa01365c-70f1-11f0-9275-e24ee17dce91', 'c032caab-5d9b-4a9d-920f-ea9c7703a1fb', '2f9be184-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-04 05:12:49', '2025-08-04 05:12:49'),
('aa05d049-70f1-11f0-9275-e24ee17dce91', 'c032caab-5d9b-4a9d-920f-ea9c7703a1fb', '2f9be1e2-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-04 05:12:49', '2025-08-04 05:12:49'),
('aa05f02f-70f1-11f0-9275-e24ee17dce91', 'c032caab-5d9b-4a9d-920f-ea9c7703a1fb', '2f9be1b4-6678-11f0-9334-e4580a2bbc2b', 1, '2025-08-04 05:12:49', '2025-08-04 05:12:49'),
('acd8bb9b-67f2-11f0-92f0-e354fbedb1ae', 'b007b8be-1f2e-4364-88c2-856b76e77984', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-23 18:27:22', '2025-07-23 18:27:22'),
('c4ab9216-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('c4afa278-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('c4afb6bf-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('c4b02dcf-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bdc15-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('c4b02f1f-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bdcff-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('c4b219fc-6c45-11f0-9309-e35501041456', 'cf95fa0d-c06d-45e6-ae06-f5e02126f436', '2f9bdc68-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-29 06:32:15', '2025-07-29 06:32:15'),
('e6f12f06-67f2-11f0-92f0-e354fbedb1ae', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-23 18:29:00', '2025-07-24 18:10:29'),
('e6f17384-67f2-11f0-92f0-e354fbedb1ae', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-23 18:29:00', '2025-07-24 18:10:29'),
('e6f1a24b-67f2-11f0-92f0-e354fbedb1ae', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-23 18:29:00', '2025-07-24 18:10:29'),
('e6f1e17e-67f2-11f0-92f0-e354fbedb1ae', 'fff87449-a074-4a50-a35e-ba15b70fd414', '2f9be20f-6678-11f0-9334-e4580a2bbc2b', 1, '2025-07-23 18:29:00', '2025-07-23 18:29:00'),
('ump-mfll2zvd', 'usr-mfll2ut0', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:05:46', '2025-09-15 17:05:46'),
('ump-mfll30gc', 'usr-mfll2ut0', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:05:47', '2025-09-15 17:05:47'),
('ump-mfll3199', 'usr-mfll2ut0', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:05:48', '2025-09-15 17:05:48'),
('ump-mfll35iz', 'usr-mfll2ut0', 'be98ee61-6ab9-11f0-9078-dc3575acfdef', 0, '2025-09-15 17:05:53', '2025-09-15 17:05:55'),
('ump-mfll3972', 'usr-mfll2ut0', '2f9be1b4-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:05:58', '2025-09-15 17:05:58'),
('ump-mfll39w6', 'usr-mfll2ut0', '2f9be184-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:05:59', '2025-09-15 17:24:05'),
('ump-mfll3kan', 'usr-mfll2ut0', '2f9bde49-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:06:13', '2025-09-15 17:06:13'),
('ump-mfll3ler', 'usr-mfll2ut0', '2f9bde98-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:06:14', '2025-09-15 17:06:14'),
('ump-mfllpv5p', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:33', '2025-09-15 17:23:33'),
('ump-mfllpvx0', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:34', '2025-09-15 17:23:34'),
('ump-mfllpwmn', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:35', '2025-09-15 17:23:35'),
('ump-mfllpx9g', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bdc15-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:36', '2025-09-15 17:23:36'),
('ump-mfllpyum', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bdc68-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:38', '2025-09-15 17:23:38'),
('ump-mfllq0t7', '95eb0cae-9ab1-43bb-ad85-8c77390f3d5a', '2f9bdcff-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:23:40', '2025-09-15 17:23:40'),
('ump-mfllqfpo', 'usr-mfll2ut0', '2f9be26b-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:00', '2025-09-15 17:24:00'),
('ump-mfllqghp', 'usr-mfll2ut0', '2f9be23b-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:01', '2025-09-15 17:24:01'),
('ump-mfllqh84', 'usr-mfll2ut0', '2f9be20f-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:02', '2025-09-15 17:24:02'),
('ump-mfllqhm9', 'usr-mfll2ut0', '2f9be1e2-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:02', '2025-09-15 17:24:02'),
('ump-mfllqk40', 'usr-mfll2ut0', '2f9be153-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:05', '2025-09-15 17:24:05'),
('ump-mfllql12', 'usr-mfll2ut0', '2f9be126-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:07', '2025-09-15 17:24:07'),
('ump-mfllqlz3', 'usr-mfll2ut0', '2f9be0f6-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-15 17:24:08', '2025-09-15 17:24:08'),
('ump-mfmdv0d9', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'mod-customer-club-001', 1, '2025-09-16 06:31:22', '2025-09-16 06:31:22'),
('ump-mfmdv7lf', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bde98-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 06:31:32', '2025-09-16 06:31:32'),
('ump-mfmdvbfu', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9bdd4b-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 06:31:37', '2025-09-16 06:31:37'),
('ump-mfmdvc28', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2f9be1b4-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 06:31:38', '2025-09-16 06:31:38'),
('ump-mfmdvgjg', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'mod-chat-001', 1, '2025-09-16 06:31:43', '2025-09-16 06:31:43'),
('ump-mfmid6fs', 'usr-mfmid2fs', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 08:37:28', '2025-09-16 08:37:28'),
('ump-mfmoletn', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bd793-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:31:50', '2025-09-16 11:31:50'),
('ump-mfmolgmb', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-monitoring-001', 1, '2025-09-16 11:31:53', '2025-09-16 11:31:53'),
('ump-mfmolhwf', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdb02-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:31:54', '2025-09-16 11:31:54'),
('ump-mfmoligq', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdbbe-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:31:55', '2025-09-16 11:31:55'),
('ump-mfmollhb', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-customer-club-001', 1, '2025-09-16 11:31:59', '2025-09-16 11:31:59'),
('ump-mfmolmon', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-customer-journey-001', 0, '2025-09-16 11:32:00', '2025-09-16 11:32:02'),
('ump-mfmolq7u', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bde49-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:05', '2025-09-16 11:32:05'),
('ump-mfmolqzm', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bde98-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:06', '2025-09-16 11:32:06'),
('ump-mfmols4o', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9be184-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:08', '2025-09-16 11:32:08'),
('ump-mfmoltqo', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-deals-001', 1, '2025-09-16 11:32:10', '2025-09-16 11:32:10'),
('ump-mfmolvl0', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdc15-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:12', '2025-09-16 11:32:12'),
('ump-mfmolwg1', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdc68-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:13', '2025-09-16 11:32:13'),
('ump-mfmolx1j', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdd4b-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:14', '2025-09-16 11:32:14'),
('ump-mfmolxw1', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9be1b4-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:15', '2025-09-16 11:32:15'),
('ump-mfmom2kc', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9bdf07-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:21', '2025-09-16 11:32:21'),
('ump-mfmom4d3', 'b9392a49-3288-4c27-848e-9f5753a3d698', '2f9be126-6678-11f0-9334-e4580a2bbc2b', 1, '2025-09-16 11:32:23', '2025-09-16 11:32:23'),
('ump-mfmom4vd', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-chat-001', 1, '2025-09-16 11:32:24', '2025-09-16 11:32:24'),
('ump-mfmom79z', 'b9392a49-3288-4c27-848e-9f5753a3d698', '3f68a634-75d5-4107-a6a8-a7fb664ab55c', 1, '2025-09-16 11:32:27', '2025-09-16 11:32:27'),
('ump-mfmomba8', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-documents-001', 1, '2025-09-16 11:32:32', '2025-09-16 11:32:32'),
('ump-mfmpeyk7', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-005', 1, '2025-09-16 11:54:49', '2025-09-16 11:57:21'),
('ump-mfmpi4mu', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-001', 1, '2025-09-16 11:57:17', '2025-09-16 11:57:17'),
('ump-mfmpi5kq', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-002', 0, '2025-09-16 11:57:18', '2025-09-16 11:57:19'),
('ump-mfmpi7b9', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-004', 1, '2025-09-16 11:57:20', '2025-09-16 11:57:20'),
('ump-mfmpi98m', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-008', 1, '2025-09-16 11:57:23', '2025-09-16 11:57:23'),
('ump-mfmpi9yk', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-009', 1, '2025-09-16 11:57:24', '2025-09-16 11:57:24'),
('ump-mfmpiba2', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-012', 1, '2025-09-16 11:57:25', '2025-09-16 11:57:25'),
('ump-mfmpibpr', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-013', 1, '2025-09-16 11:57:26', '2025-09-16 11:57:26'),
('ump-mfmpidla', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-014', 1, '2025-09-16 11:57:28', '2025-09-16 11:57:28'),
('ump-mfmpifke', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-007', 1, '2025-09-16 11:57:31', '2025-09-16 11:57:31'),
('ump-mfmpihhs', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-015', 1, '2025-09-16 11:57:33', '2025-09-16 11:57:33'),
('ump-mfmpijdg', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-016', 1, '2025-09-16 11:57:36', '2025-09-16 11:57:36'),
('ump-mg7ncg10', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-001', 1, '2025-10-01 07:10:02', '2025-10-01 07:10:02'),
('ump-mg7nch18', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-002', 1, '2025-10-01 07:10:03', '2025-10-01 07:10:03'),
('ump-mg7nci6z', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-004', 1, '2025-10-01 07:10:05', '2025-10-01 07:10:05'),
('ump-mg7nck3l', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-005', 1, '2025-10-01 07:10:07', '2025-10-01 07:10:07'),
('ump-mg7nclcp', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-008', 1, '2025-10-01 07:10:09', '2025-10-01 07:10:09'),
('ump-mg7ncm4z', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-009', 1, '2025-10-01 07:10:10', '2025-10-01 07:10:10'),
('ump-mg7ncn75', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-010', 1, '2025-10-01 07:10:11', '2025-10-01 07:10:11'),
('ump-mg7ncppl', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-012', 1, '2025-10-01 07:10:15', '2025-10-01 07:10:15'),
('ump-mg7ncqks', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-013', 1, '2025-10-01 07:10:16', '2025-10-01 07:10:16'),
('ump-mg7ncrs3', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-014', 1, '2025-10-01 07:10:17', '2025-10-01 07:10:17'),
('ump-mg7ncsty', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-022', 1, '2025-10-01 07:10:19', '2025-10-01 07:10:19'),
('ump-mg7nctv6', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-007', 1, '2025-10-01 07:10:20', '2025-10-01 07:10:20'),
('ump-mg7ncurb', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-015', 1, '2025-10-01 07:10:21', '2025-10-01 07:10:21'),
('ump-mg7ncw3p', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-016', 1, '2025-10-01 07:10:23', '2025-10-01 07:10:23'),
('ump-mg7ncxhi', '362bb74f-3810-4ae4-ab26-ef93fce6c05f', 'mod-011', 1, '2025-10-01 07:10:25', '2025-10-01 07:10:25'),
('ump-mg7vds8g', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-001', 1, '2025-10-01 10:55:01', '2025-10-01 10:55:01'),
('ump-mg7vdssg', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-002', 1, '2025-10-01 10:55:02', '2025-10-01 10:55:02'),
('ump-mg7vdtsl', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-004', 1, '2025-10-01 10:55:03', '2025-10-01 10:55:03'),
('ump-mg7vdugz', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-005', 1, '2025-10-01 10:55:04', '2025-10-01 10:55:04'),
('ump-mg7vdvk0', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-008', 1, '2025-10-01 10:55:06', '2025-10-01 10:55:06'),
('ump-mg7vdwbn', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-009', 1, '2025-10-01 10:55:07', '2025-10-01 10:55:07'),
('ump-mg7vdxzv', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-010', 1, '2025-10-01 10:55:09', '2025-10-01 10:55:09'),
('ump-mg7vdywm', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-012', 1, '2025-10-01 10:55:10', '2025-10-01 10:55:10'),
('ump-mg7vdzlv', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-013', 1, '2025-10-01 10:55:11', '2025-10-01 10:55:11'),
('ump-mg7ve0kn', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-014', 1, '2025-10-01 10:55:12', '2025-10-01 10:55:12'),
('ump-mg7ve1ua', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-022', 1, '2025-10-01 10:55:14', '2025-10-01 10:55:14'),
('ump-mg7ve35q', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-007', 1, '2025-10-01 10:55:16', '2025-10-01 10:55:16'),
('ump-mg7ve7dh', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-015', 1, '2025-10-01 10:55:21', '2025-10-01 10:55:21'),
('ump-mg7ve80u', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-016', 1, '2025-10-01 10:55:22', '2025-10-01 10:55:22'),
('ump-mg7ve9cg', 'a0389f14-6a2a-4ccc-b257-9c4ec2704c4f', 'mod-011', 1, '2025-10-01 10:55:24', '2025-10-01 10:55:24'),
('ump-mg874wew', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-001', 1, '2025-10-01 12:54:02', '2025-10-01 12:54:02'),
('ump-mg874wxf', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-002', 1, '2025-10-01 12:54:03', '2025-10-01 12:54:03'),
('ump-mg874xv1', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-004', 1, '2025-10-01 12:54:04', '2025-10-01 12:54:04'),
('ump-mg874yn6', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-005', 1, '2025-10-01 12:54:05', '2025-10-01 12:54:05'),
('ump-mg874zq7', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-008', 1, '2025-10-01 12:54:07', '2025-10-01 12:54:07'),
('ump-mg8750n5', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-009', 1, '2025-10-01 12:54:08', '2025-10-01 12:54:08'),
('ump-mg8751r1', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-010', 1, '2025-10-01 12:54:09', '2025-10-01 12:54:09'),
('ump-mg8752d1', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-012', 1, '2025-10-01 12:54:10', '2025-10-01 12:54:10'),
('ump-mg87533t', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-013', 1, '2025-10-01 12:54:11', '2025-10-01 12:54:11'),
('ump-mg875426', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-014', 1, '2025-10-01 12:54:12', '2025-10-01 12:54:12'),
('ump-mg8754q9', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-022', 1, '2025-10-01 12:54:13', '2025-10-01 12:54:13'),
('ump-mg8755lh', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-007', 1, '2025-10-01 12:54:14', '2025-10-01 12:54:14'),
('ump-mg87567b', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-015', 1, '2025-10-01 12:54:15', '2025-10-01 12:54:15'),
('ump-mg87575m', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-016', 1, '2025-10-01 12:54:16', '2025-10-01 12:54:16'),
('ump-mg8758fb', '9f6b90b9-0723-4261-82c3-cd54e21d3995', 'mod-011', 1, '2025-10-01 12:54:18', '2025-10-01 12:54:18'),
('5bd7444d-b316-4324-91b6-7701bcf70e46', 'ceo-001', 'mod-001', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('9e7acea0-05df-4097-8a98-42a1a82c302a', 'ceo-001', 'mod-002', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('e3ac49b6-6371-4fb2-a9dd-7f979b2d4a53', 'ceo-001', 'mod-021', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('57f86da2-b650-4eca-9cc0-7530b1a68039', 'ceo-001', 'mod-003', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('f9c88a03-930a-4f0f-ba89-4b867f466ca4', 'ceo-001', 'mod-004', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('c94a48bc-32a6-4caa-9ece-e2be238364a8', 'ceo-001', 'mod-005', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('cc235072-d084-4f3e-b11f-137616abea45', 'ceo-001', 'mod-006', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('8d5a85a5-85b5-480f-a5b0-ab928e4b5a6d', 'ceo-001', 'mod-007', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('ce5b360a-f6f6-4eef-a653-f199e8c834cd', 'ceo-001', 'mod-008', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('58ffbc82-0321-4502-9912-2b706bc5de9f', 'ceo-001', 'mod-009', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('7edab5bc-db3b-4a3c-ab79-b77cd88008ec', 'ceo-001', 'mod-010', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('b6e4ac3b-88f9-4fe1-97c9-a6b3e889cf9b', 'ceo-001', 'mod-011', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('34f5cf22-7d81-4b9f-8aa5-ac23765d2ceb', 'ceo-001', 'mod-012', 1, '2025-10-17 10:02:13', '2025-10-17 10:02:13'),
('e783e09c-8161-4124-8e66-b0e69848c44e', 'ceo-001', 'mod-013', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6f4fc2ed-6e16-4c8c-8c40-9cd945602b17', 'ceo-001', 'mod-014', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('88b8c4dd-adcb-4e3f-9960-8c1c0a7214e4', 'ceo-001', 'mod-015', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('41f3a947-a838-402e-87b8-09eba9d8b990', 'ceo-001', 'mod-016', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('a92610fc-d7f0-4155-92e3-e5e265bf37ca', 'ceo-001', 'mod-017', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cdbfbf62-6806-49c8-844b-b55fbf71549b', 'ceo-001', 'mod-018', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cd1a0aeb-a5fd-4ced-8e90-8afc2f3d67d7', 'ceo-001', 'mod-019', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('9f5615ed-314c-448b-835a-3771401bab14', 'ceo-001', 'mod-020', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('d7dce5af-d34e-4088-9206-26b508126c71', 'ceo-001', 'mod-022', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b0838163-278a-4be0-b6ab-0dac22a15acd', 'ceo-001', 'mod-023', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('7f2be08f-aa0e-4bbc-99a3-6158eb4e40bc', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-001', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('83ca7337-5ec4-48b6-831a-5c2e7144b1b2', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-002', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('42d51d35-8a1c-4707-85d6-1f440fa7d804', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-021', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cc02fc77-fdde-41a8-a722-7e19b987087f', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-003', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('a82452e9-903f-4c9e-b992-1ac95ff9a1b1', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-004', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6a6e21ae-81ee-4ab0-9aa9-2cdcc9cb9833', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-005', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('438aaa8d-3685-44c6-82be-33029a627d47', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-006', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('af8519b8-c4cf-46be-84f2-10dc11c86236', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-007', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6caa7e8d-98a3-4cb2-b8e0-5e8a5d0ca68d', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-008', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('ce3b38cc-adb4-42f8-9575-42fd587b70c9', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-009', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cc0bac19-c549-43bb-b19e-4ced8899b493', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-010', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('831334c1-d6bc-4ff7-adb6-c49ce7ee158b', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-011', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('35ffc5f7-8606-4f40-b9cd-2f18b434e477', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-012', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('762a2d4f-bc2b-4e46-9957-f68a0bd3ff56', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-013', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6a5f9284-3126-477f-bb74-806f6e0de2ef', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-014', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('47cb078b-13e4-4dc0-b35e-8ba9bf4201d2', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-015', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('a225b2d6-b27b-42bb-bac0-9858ad9f11e9', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-016', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('46873af0-9123-4c97-9a10-86ec5a48ebda', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-017', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('9bd06329-6907-4d9e-9cec-6c7162eaa7e9', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-018', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('92d98e0d-dfef-4a85-ad7d-841917727503', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-019', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6873357b-7274-4783-8aa6-56a289702f7e', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-020', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('de487f6c-7891-45e4-990e-4094a9037a26', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-022', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('183cbc79-a811-4c65-a83e-d7592a294205', 'e820e817-eed0-40c0-9916-d23599e7e2ef', 'mod-023', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('c52640f7-363d-476c-83d1-42dd4949f60a', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-001', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('dd44c5db-8669-408d-b041-6454eef502c6', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-002', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('93e18b5e-dee2-4fa1-be8f-3345c08bb10c', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-021', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('66f3fc52-08da-4094-9779-c35f59bab089', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-003', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b30b5e48-4f93-4fba-b9a6-4f75ce36252c', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-004', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('29711c00-730f-4bfb-8352-b7fcd03c76ae', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-005', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('42e39db0-4ef1-4089-ae6a-90da5251b7bc', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-006', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cb058913-dfd9-4a4c-96c5-2a97c1d74c87', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-007', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('3dc39fe3-e021-4834-97e6-a346073e5fc9', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-008', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('32d6222d-ea71-47e5-8b0b-9d350f0cad63', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-009', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b49e39ce-bd74-4eaf-9636-a438e9cf4a36', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-010', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('0946ec47-54a9-4b08-999e-820d855a6965', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-011', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2ac93588-ad6e-4de4-bfe7-9984a2f810a2', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-012', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('8b772e55-9562-4b4f-b194-b8890f367c2b', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-013', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2a80cc19-fe1d-48a7-8a82-18d28bf09698', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-014', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('a7da733f-c8c8-498e-825e-e117f5d24d18', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-015', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('4a5e0ee5-6c45-4146-9473-e4c113513fde', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-016', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('cb0b73f9-1aaa-4add-95ca-058c4848097d', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-017', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('be5d918c-4f38-4b25-bbc7-7af34d278b53', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-018', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2b6bbd6e-7f67-49ac-a97d-14952b662da3', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-019', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('1cb7efd3-6dba-4750-a13a-548a222da4fe', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-020', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('8652e22e-2855-4df2-bc16-662d3218f509', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-022', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('fdca5e8e-64be-4371-9e17-4dee3babdc13', 'fedb499b-23a8-4af7-9b9d-587724a0b4c7', 'mod-023', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('5de57883-a518-4a7a-8074-e3a6916fa8c3', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-001', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('08b49663-49d4-4099-94a8-262bdc4cddaa', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-002', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('6667d23d-a0f1-491c-91b8-346410333099', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-021', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2404b4d6-1e13-41dc-8684-b76fea4027ca', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-003', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('ba362dbf-6ca4-43e3-9ee7-ef5cf28c00b9', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-004', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('3f5020b5-608d-4441-9ed8-38a4960d55e6', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-005', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b10eda6b-7f68-4dc0-9759-8c06c3686cb5', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-006', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('86b25cd5-e7ee-4244-85cd-0552eadd1f61', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-007', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('69cb302c-4083-491d-818d-801296550e5b', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-008', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2a9104c5-1657-4877-b3b3-5ac7c2fb2b86', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-009', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('86fc669c-abb7-4f67-be1f-6d976703c614', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-010', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('40d6ebd0-7a60-49f6-9547-dfa58186d292', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-011', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b58d8763-6ffd-421f-86a2-2a02bfb6d7e4', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-012', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2a4b231e-2185-4481-8806-bb8a90c20d9d', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-013', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('2c3d39a9-5f13-4f80-a483-108ced3e50d7', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-014', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('c509d784-acd0-4e97-a4ba-be74341a3776', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-015', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('e10ecacd-1fd4-4e16-81bb-e28b530f2d12', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-016', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('779417b2-eb59-4a9b-bf2d-07193ea4a70d', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-017', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('af8e354f-2e9f-457f-bd4d-327dc372cfc8', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-018', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('e9dcf6a9-7737-4c0b-a764-1d4f519c819b', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-019', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('9bb95eee-f0f0-4b62-971f-96152a2700da', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-020', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('b14eddfd-785b-4d06-b51b-0f01c1766740', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-022', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14'),
('7a0bb3d4-0da3-453e-8301-37d43e70f339', 'd497a492-f183-4452-86c1-961e5a0e3e22', 'mod-023', 1, '2025-10-17 10:02:14', '2025-10-17 10:02:14');

-- --------------------------------------------------------

--
-- Table structure for table `user_permissions`
--

CREATE TABLE `user_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `granted` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user_permissions`
--

INSERT INTO `user_permissions` (`id`, `user_id`, `resource`, `action`, `granted`, `created_at`) VALUES
('0b74f520-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'users', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f67b-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'customers', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f6f2-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'deals', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f72d-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'products', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f761-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'tickets', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f792-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'feedback', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f7c6-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'projects', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f7f4-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'reports', 'manage', 1, '2025-07-20 04:57:32'),
('0b74f824-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'settings', 'manage', 1, '2025-07-20 04:57:32'),
('0b74fa00-6526-11f0-92b6-e251efb8cddb', 'ceo-001', 'analytics', 'manage', 1, '2025-07-20 04:57:32');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_targets`
--

CREATE TABLE `user_targets` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `period` enum('monthly','quarterly','yearly') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `sales_count_target` int(11) DEFAULT 0,
  `sales_amount_target` decimal(15,2) DEFAULT 0.00,
  `call_count_target` int(11) DEFAULT 0,
  `deal_count_target` int(11) DEFAULT 0,
  `meeting_count_target` int(11) DEFAULT 0,
  `current_sales_count` int(11) DEFAULT 0,
  `current_sales_amount` decimal(15,2) DEFAULT 0.00,
  `current_call_count` int(11) DEFAULT 0,
  `current_deal_count` int(11) DEFAULT 0,
  `current_meeting_count` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `voc_insights`
--

CREATE TABLE `voc_insights` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `impact` enum('low','medium','high') NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `status` enum('new','in_progress','completed','dismissed') DEFAULT 'new',
  `source` varchar(100) DEFAULT NULL,
  `frequency` int(11) DEFAULT 1,
  `keywords` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`keywords`)),
  `sentiment_trend` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`sentiment_trend`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activities`
--
ALTER TABLE `activities`
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_performed_by` (`performed_by`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD KEY `idx_company_id` (`company_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD KEY `idx_customers_industry` (`industry`),
  ADD KEY `idx_customers_assigned_to` (`assigned_to`),
  ADD KEY `idx_customers_status` (`status`),
  ADD KEY `idx_customers_priority` (`priority`),
  ADD KEY `idx_customers_segment` (`segment`),
  ADD KEY `idx_customers_city` (`city`),
  ADD KEY `idx_customers_state` (`state`),
  ADD KEY `idx_customers_source` (`source`),
  ADD KEY `idx_customers_lifecycle_stage` (`lifecycle_stage`),
  ADD KEY `idx_customers_created_at` (`created_at`),
  ADD KEY `idx_customers_last_activity` (`last_activity_date`),
  ADD KEY `idx_customers_status_priority` (`status`,`priority`),
  ADD KEY `idx_customers_first_name` (`first_name`),
  ADD KEY `idx_customers_last_name` (`last_name`),
  ADD KEY `idx_customers_company_name` (`company_name`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `customer_product_interests`
--
ALTER TABLE `customer_product_interests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_product` (`customer_id`,`product_id`),
  ADD KEY `idx_customer_interests` (`customer_id`),
  ADD KEY `idx_product_interests` (`product_id`);

--
-- Indexes for table `customer_tags_new`
--
ALTER TABLE `customer_tags_new`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tag_name` (`name`),
  ADD KEY `idx_tags_usage` (`usage_count`);

--
-- Indexes for table `customer_tag_relations`
--
ALTER TABLE `customer_tag_relations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_tag` (`customer_id`,`tag_id`),
  ADD KEY `idx_customer_tags` (`customer_id`),
  ADD KEY `idx_tag_customers` (`tag_id`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_stage_id` (`stage_id`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `deal_products`
--
ALTER TABLE `deal_products`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `deal_stages`
--
ALTER TABLE `deal_stages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_stages_order_index` (`stage_order`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `interactions`
--
ALTER TABLE `interactions`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku_unique` (`sku`),
  ADD KEY `idx_products_name` (`name`),
  ADD KEY `idx_products_status` (`status`),
  ADD KEY `idx_products_category` (`category`),
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD KEY `idx_tenant_key` (`tenant_key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD KEY `idx_tenant_key` (`tenant_key`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
