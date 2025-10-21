-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: crm_mysql:3306
-- Generation Time: Sep 23, 2025 at 07:56 PM
-- Server version: 10.4.32-MariaDB-1:10.4.32+maria~ubu2004
-- PHP Version: 8.2.27

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

INSERT INTO `activities` (`id`, `customer_id`, `deal_id`, `type`, `title`, `description`, `start_time`, `end_time`, `duration`, `performed_by`, `outcome`, `location`, `notes`, `created_at`, `updated_at`) VALUES
('3502394c-bbdb-459e-a104-b503548ebec9', '92df42e9-f691-4167-9358-2f9dfe41566d', NULL, 'call', 'تستی', NULL, '2025-09-15 14:32:24', NULL, NULL, 'ceo-001', 'successful', NULL, NULL, '2025-09-15 11:02:24', '2025-09-15 14:32:24'),
('55d71a83-914e-42fb-8c91-0705453d5f3d', 'd44facc0-75b3-11f0-9306-e35500020927', NULL, 'email', 'dzzsdv', NULL, '2025-09-16 19:32:38', NULL, NULL, 'ceo-001', 'successful', NULL, NULL, '2025-09-16 16:02:38', '2025-09-16 19:32:38'),
('61008d85-5d43-4c13-a476-0adf6ea2111f', '92df42e9-f691-4167-9358-2f9dfe41566d', NULL, 'email', 'afa', NULL, '2025-09-15 19:50:22', NULL, NULL, 'ceo-001', 'successful', NULL, NULL, '2025-09-15 16:20:22', '2025-09-15 19:50:22'),
('843be73a-3267-4b8c-b191-be1e3b0e1014', 'fa494c98-75b6-11f0-9306-e35500020927', NULL, 'email', 'هیچ', NULL, '2025-09-10 20:22:17', NULL, NULL, 'ceo-001', 'successful', NULL, NULL, '2025-09-10 16:52:17', '2025-09-10 20:22:17'),
('b79d64ac-67f3-4171-ad94-c6858618577d', 'd44facc0-75b3-11f0-9306-e35500020927', NULL, 'email', 'dzzsdv', NULL, '2025-09-16 19:32:44', NULL, NULL, 'ceo-001', 'successful', NULL, NULL, '2025-09-16 16:02:44', '2025-09-16 19:32:44'),
('eca1828f-9467-448e-a229-ce70660f2d99', '92df42e9-f691-4167-9358-2f9dfe41566d', NULL, 'meeting', 'جلسه', NULL, '2025-09-11 10:42:26', NULL, NULL, 'ceo-001', 'follow_up_needed', NULL, NULL, '2025-09-11 07:12:26', '2025-09-11 10:42:26');

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

INSERT INTO `calendar_events` (`id`, `title`, `description`, `start_date`, `end_date`, `all_day`, `type`, `location`, `status`, `customer_id`, `created_by`, `created_at`, `updated_at`) VALUES
('2c436379-aca5-4ad0-ad18-5403bf435f2e', 'تست تر رویداد ', NULL, '2025-09-29 16:08:00', NULL, 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-22 16:08:25', '2025-09-22 16:08:25'),
('32758a0e-2ac5-408b-990b-5658865ac3a9', 'Test Event', NULL, '2025-09-11 10:00:00', NULL, 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-11 11:38:51', '2025-09-11 11:38:51'),
('4abe30c7-797b-4eeb-b607-23b53868c44e', 'تست رویداد', NULL, '2025-09-21 16:07:00', NULL, 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-22 16:08:02', '2025-09-22 16:08:02'),
('5e1dd51e-12eb-48d5-91bc-9366f05b4088', 'احمدرضا', NULL, '2025-09-26 16:10:00', NULL, 0, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-22 16:10:39', '2025-09-22 16:10:39'),
('81d63ba7-e9ea-4a51-8e64-1af0f20228e5', 'asfsf', 'sfs', '2025-09-16 08:30:00', '2025-09-16 20:30:00', 1, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-15 14:34:16', '2025-09-16 11:58:33'),
('cedb2b33-c814-427c-8c4f-2447b932753d', 'acfac', NULL, '2025-09-14 22:30:00', '2025-09-15 20:30:00', 1, 'meeting', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-15 19:51:10', '2025-09-15 19:51:10'),
('event-001', 'جلسه با تیم فروش', 'بررسی عملکرد ماهانه تیم فروش', '2025-09-12 09:00:00', '2025-09-12 10:30:00', 0, 'meeting', 'اتاق جلسات اول', 'confirmed', NULL, 'ceo-001', '2025-09-10 22:41:11', '2025-09-10 22:41:11'),
('event-002', 'تماس با مشتری جدید', 'معرفی محصولات و خدمات', '2025-09-12 14:00:00', '2025-09-12 14:30:00', 0, 'call', NULL, 'confirmed', 'fa490a71-75b6-11f0-9306-e35500020927', 'ceo-001', '2025-09-10 22:41:11', '2025-09-10 22:41:11'),
('event-003', 'یادآوری ارسال گزارش', 'ارسال گزارش ماهانه به مدیریت', '2025-09-13 16:00:00', NULL, 0, 'reminder', NULL, 'confirmed', NULL, 'ceo-001', '2025-09-10 22:41:11', '2025-09-10 22:41:11'),
('event-004', 'جلسه طراحی محصول', 'بررسی ویژگی‌های جدید محصول', '2025-09-14 10:00:00', '2025-09-14 12:00:00', 0, 'meeting', 'اتاق طراحی', 'tentative', NULL, 'ceo-001', '2025-09-10 22:41:11', '2025-09-10 22:41:11'),
('event-005', 'پیگیری پروژه', 'بررسی پیشرفت پروژه فعلی', '2025-09-15 11:00:00', '2025-09-15 11:30:00', 0, 'task', NULL, 'confirmed', 'fa49480a-75b6-11f0-9306-e35500020927', 'ceo-001', '2025-09-10 22:41:11', '2025-09-10 22:41:11');

-- --------------------------------------------------------

--
-- Table structure for table `chat_conversations`
--

CREATE TABLE `chat_conversations` (
  `id` varchar(36) NOT NULL,
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

--
-- Dumping data for table `chat_conversations`
--

INSERT INTO `chat_conversations` (`id`, `title`, `type`, `description`, `avatar_url`, `is_active`, `last_message_id`, `last_message`, `last_message_at`, `created_by`, `participant_1_id`, `participant_2_id`, `created_at`, `updated_at`) VALUES
('c0202cf2-f2b6-45e2-9f31-abf282333046', 'مکالمه ۱۴۰۴/۶/۲۰', 'direct', NULL, NULL, 1, NULL, NULL, '2025-09-11 11:50:33', 'ceo-001', 'ceo-001', 'ceo-001', '2025-09-11 11:50:33', '2025-09-11 11:50:33'),
('cnv-me5cge1q', NULL, 'direct', NULL, NULL, 1, 'msg-mebonxhd', '. م', '2025-08-10 07:10:13', 'ceo-001', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2025-08-10 07:10:13', '2025-09-14 12:05:09');

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

INSERT INTO `chat_messages` (`id`, `conversation_id`, `sender_id`, `receiver_id`, `message`, `message_type`, `created_at`, `read_at`, `is_edited`, `is_deleted`, `edited_at`, `sent_at`, `reply_to_id`, `file_url`, `file_name`, `file_size`) VALUES
('13e45f62-8f3e-4bab-8841-b272a9d4ede1', 'c0202cf2-f2b6-45e2-9f31-abf282333046', 'ceo-001', 'ceo-001', 'این یک پیام تست است', 'text', '2025-09-11 11:50:33', NULL, 0, 0, NULL, '2025-09-11 11:50:33', NULL, NULL, NULL, NULL),
('2134bad2-0d51-46ac-bd78-9b0645e2a903', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'تست', 'text', '2025-08-28 15:27:48', NULL, 0, 0, NULL, '2025-08-28 15:27:48', NULL, NULL, NULL, NULL),
('2f395708-2db0-4af5-84b1-6507d9c3ecc0', 'conv-50fdd768-8dbb-4161-a539-e9a4da4', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'شبلافثیدیذ سر', 'text', '2025-09-16 11:26:40', NULL, 0, 0, NULL, '2025-09-16 11:26:40', NULL, NULL, NULL, NULL),
('426623ee-4f49-4007-beaf-812e78a546ff', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'عه', 'text', '2025-09-14 12:05:09', NULL, 0, 0, NULL, '2025-09-14 12:05:09', NULL, NULL, NULL, NULL),
('45c4371b-143d-4881-a9c8-866527bf0a41', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'سلام! چت سیستم تست می‌شود.', 'text', '2025-08-28 15:17:30', NULL, 0, 0, NULL, '2025-08-28 15:17:30', NULL, NULL, NULL, NULL),
('66e3851f-2ffb-4dbb-8a56-2b980a2beae2', 'conv-50fdd768-8dbb-4161-a539-e9a4da4', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'affafaf', 'text', '2025-09-15 19:51:20', NULL, 0, 0, NULL, '2025-09-15 19:51:20', NULL, NULL, NULL, NULL),
('782874a8-6e36-4db6-8979-39a79854fe5e', 'conv-50fdd768-8dbb-4161-a539-e9a4da4', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'Screenshot 2025-09-15 192617.png', 'image', '2025-09-15 18:07:07', NULL, 0, 0, NULL, '2025-09-15 18:07:07', NULL, '/uploads/chat/1ab9ee25-995b-4b64-9968-0cd4b9bbdd98.png', 'Screenshot 2025-09-15 192617.png', 13123),
('c081ffe8-e032-4db0-b2c3-f3c761ac7fab', 'conv-50fdd768-8dbb-4161-a539-e9a4da4', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'شثیث', 'text', '2025-09-16 11:26:38', NULL, 0, 0, NULL, '2025-09-16 11:26:38', NULL, NULL, NULL, NULL),
('c2f7ff68-b9e5-4f80-a07c-b1dd37a8130e', 'conv-50fdd768-8dbb-4161-a539-e9a4da4', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'Screenshot 2025-09-13 131322.png', 'file', '2025-09-15 18:07:02', NULL, 0, 0, NULL, '2025-09-15 18:07:02', NULL, '/uploads/chat/b32a5f86-16d0-47ba-9713-af97de435311.png', 'Screenshot 2025-09-13 131322.png', 120058),
('msg-me5cge22', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'تست', 'text', '2025-08-10 07:10:13', NULL, 0, 0, NULL, '2025-08-10 07:10:13', NULL, NULL, NULL, NULL),
('msg-me6o8se9', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'سلام این پیام برای تسته', 'text', '2025-08-11 05:28:00', NULL, 0, 0, NULL, '2025-08-11 05:28:00', NULL, NULL, NULL, NULL),
('msg-me6ovwth', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'با سلام و درود خدمت آقای آوندی', 'text', '2025-08-11 05:45:59', NULL, 0, 0, NULL, '2025-08-11 05:45:59', NULL, NULL, NULL, NULL),
('msg-me6p128z', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'سلام تست \nتست \nتست', 'text', '2025-08-11 05:49:59', NULL, 0, 0, NULL, '2025-08-11 05:49:59', NULL, NULL, NULL, NULL),
('msg-me6qmj3g', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'جدی ؟؟', 'text', '2025-08-11 06:34:41', NULL, 0, 0, NULL, '2025-08-11 06:34:41', NULL, NULL, NULL, NULL),
('msg-me6qmkww', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'تست', 'text', '2025-08-11 06:34:43', NULL, 0, 0, NULL, '2025-08-11 06:34:43', NULL, NULL, NULL, NULL),
('msg-me6qva4v', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'اذلبتیطیظیلباتز رذ/مدنتورزفتد پود', 'text', '2025-08-11 06:41:29', NULL, 0, 0, NULL, '2025-08-11 06:41:29', NULL, NULL, NULL, NULL),
('msg-mebong2p', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'شرسریشری', 'text', '2025-08-14 17:38:15', NULL, 0, 0, NULL, '2025-08-14 17:38:15', NULL, NULL, NULL, NULL),
('msg-mebong2v', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'رشریکشپریش', 'text', '2025-08-14 17:38:15', NULL, 0, 0, NULL, '2025-08-14 17:38:15', NULL, NULL, NULL, NULL),
('msg-mebonxhd', 'cnv-me5cge1q', 'ceo-001', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '. م', 'text', '2025-08-14 17:38:38', NULL, 0, 0, NULL, '2025-08-14 17:38:38', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `chat_participants`
--

CREATE TABLE `chat_participants` (
  `id` varchar(36) NOT NULL,
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

INSERT INTO `chat_participants` (`id`, `conversation_id`, `user_id`, `role`, `joined_at`, `last_seen_at`, `last_seen_message_id`, `is_muted`) VALUES
('0f80e757-75b9-11f0-9338-e4580b2fcc71', 'cnv-me5cge1q', 'ceo-001', 'admin', '2025-08-10 07:10:13', '2025-08-10 07:10:13', NULL, 0);

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
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `custom_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_fields`)),
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
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `custom_fields` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`custom_fields`)),
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
('cnt-me4piwag', NULL, 'احمدرضا', 'آوندی', 'نمیدونم', 'هیچ', 'only.link086@gmail.com', '', '', '', '', '', '', 'ایران', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-08-09 16:58:19', '2025-08-09 16:58:19'),
('cnt-mffa1eqq', NULL, 'Ahmadrerza', 'Avandi', '', '', 'flmsv@gmail.com', '', '', '', '', '', '', 'ایران', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-09-11 07:09:59', '2025-09-11 07:09:59'),
('cnt-mfl82ktu', NULL, 'تست', 'تست', 'عیچ', 'شر', 'بش@gmail.com', '23', '42', '', '', '', '', 'ایران', NULL, NULL, NULL, NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-09-15 11:01:32', '2025-09-15 11:01:32'),
('cnt-mfll6vr6', NULL, 'احمدرضا', 'آوندی', '', '', 'ahmadandi@gmail.com', '334', '', '', '', '', '', 'ایران', NULL, NULL, '', NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-09-15 17:08:47', '2025-09-15 17:08:47'),
('cnt-mfllhgc1', NULL, 'a', 'آوندی', '', '', 'ahmadrdi@gmail.com', '', '', '', '', '', '', 'ایران', NULL, NULL, '', NULL, NULL, NULL, 'active', 0, 'other', NULL, 'ceo-001', 'ceo-001', '2025-09-15 17:17:01', '2025-09-15 17:17:01'),
('cnt-mfmhlwn4', NULL, 'Ah', 'Avandi', 'af', 'af', '', '432', '654', '', '', '', '', 'ایران', NULL, NULL, '', NULL, NULL, NULL, 'active', 0, 'other', NULL, '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2025-09-16 08:16:16', '2025-09-16 08:16:16');

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
  `contact_attempts` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `phone`, `website`, `address`, `city`, `state`, `country`, `postal_code`, `industry`, `company_size`, `annual_revenue`, `status`, `segment`, `priority`, `assigned_to`, `total_tickets`, `satisfaction_score`, `potential_value`, `actual_value`, `created_at`, `updated_at`, `last_interaction`, `last_contact_date`, `contact_attempts`) VALUES
('92df42e9-f691-4167-9358-2f9dfe41566d', 'هیچی', 'ahmadreza.avandi@gmail.com', '09921386634', '', 'سیزده هکتاری\nخواجه شمس الدین کیشی', 'بندرعباس', 'هرمزگان', 'Iran', NULL, '', '11-50', NULL, 'prospect', 'small_business', 'high', 'ceo-001', 0, NULL, NULL, 0.00, '2025-09-11 10:39:31', '2025-09-14 20:17:52', '2025-09-14 20:17:52', NULL, 0),
('d44facc0-75b3-11f0-9306-e35500020927', 'شرکت نمونه 1', 'test1@example.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'enterprise', 'medium', NULL, 0, NULL, NULL, 0.00, '2025-08-10 06:33:51', '2025-08-10 06:33:51', NULL, NULL, 0),
('d44fd871-75b3-11f0-9306-e35500020927', 'شرکت نمونه 2', 'test2@example.com', '09123456788', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'small_business', 'medium', NULL, 0, NULL, NULL, 0.00, '2025-08-10 06:33:51', '2025-08-10 06:33:51', NULL, NULL, 0),
('fa490a71-75b6-11f0-9306-e35500020927', 'شرکت تکنولوژی پارس', 'info@parstech.com', '02188776655', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'enterprise', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-01 06:30:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa49480a-75b6-11f0-9306-e35500020927', 'فروشگاه آنلاین رضا', 'reza@shop.com', '09121234567', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'small_business', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-02 08:00:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 'omid@trade.com', '02177889900', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'enterprise', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-03 10:45:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 'sina@cafe.com', '09359876543', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'small_business', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-04 06:15:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa494b28-75b6-11f0-9306-e35500020927', 'مهندس علی احمدی', 'ali@engineer.com', '09123456789', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'individual', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-05 12:50:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa494b85-75b6-11f0-9306-e35500020927', 'شرکت ساختمانی نوین', 'info@novin.com', '02166554433', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'enterprise', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-06 05:00:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa494c4a-75b6-11f0-9306-e35500020927', 'رستوران سنتی', 'info@restaurant.com', '09187654321', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'small_business', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-07 08:30:00', '2025-08-10 06:56:24', NULL, NULL, 0),
('fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 'maryam@clinic.com', '09198765432', NULL, NULL, NULL, NULL, 'Iran', NULL, NULL, NULL, NULL, 'active', 'individual', 'medium', NULL, 0, NULL, NULL, 0.00, '2024-12-08 12:15:00', '2025-09-15 18:43:15', '2025-09-15 18:43:15', NULL, 0);

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
('d5000da1-91a7-11f0-9190-581122e4f0be', '92df42e9-f691-4167-9358-2f9dfe41566d', 'stage-002', '2025-09-14 20:17:26', '2025-09-14 20:17:52');

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
('e4967d53-91a7-11f0-9190-581122e4f0be', '92df42e9-f691-4167-9358-2f9dfe41566d', 'stage-002', 1, '2025-09-14 20:17:52', 'ceo-001', '', '2025-09-14 20:17:52', '2025-09-14 20:17:52');

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
-- Stand-in structure for view `daily_interaction_stats`
-- (See below for the actual view)
--
CREATE TABLE `daily_interaction_stats` (
`interaction_date` date
,`type` enum('email','phone','chat','meeting','website','social')
,`direction` enum('inbound','outbound')
,`sentiment` enum('positive','neutral','negative')
,`interaction_count` bigint(21)
,`avg_duration` decimal(14,4)
);

-- --------------------------------------------------------

--
-- Table structure for table `daily_reports`
--

CREATE TABLE `daily_reports` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
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

INSERT INTO `daily_reports` (`id`, `user_id`, `report_date`, `persian_date`, `work_description`, `completed_tasks`, `working_hours`, `challenges`, `achievements`, `status`, `created_at`, `updated_at`) VALUES
('23ac4c60-840d-11f0-902a-db316565c9c4', 'ceo-001', '2025-01-28', '۱۴۰۴/۱۱/۰۸', 'مدیریت پروژه و بررسی گزارشات تیم', NULL, 8.00, 'هماهنگی بین تیم‌ها', 'بهبود فرآیندهای کاری', 'submitted', '2025-08-28 14:53:18', '2025-08-28 14:53:18');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
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

-- --------------------------------------------------------

--
-- Table structure for table `deal_products`
--

CREATE TABLE `deal_products` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `deal_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

INSERT INTO `documents` (`id`, `title`, `description`, `original_filename`, `stored_filename`, `file_path`, `file_size`, `mime_type`, `file_extension`, `category_id`, `access_level`, `status`, `version`, `parent_document_id`, `tags`, `metadata`, `persian_date`, `expiry_date`, `is_shared`, `download_count`, `view_count`, `uploaded_by`, `created_at`, `updated_at`) VALUES
('074241db-04a3-46cf-a903-322bceeb7d8c', 'نتیجه-تست-mbti-مایرز-بریگز _ 9-4-1404', 'هیچ', 'نتیجه-تست-mbti-مایرز-بریگز _ 9-4-1404.pdf', '797c0dc0-872e-4f2b-add7-81f1b840da94.pdf', '/uploads/documents/797c0dc0-872e-4f2b-add7-81f1b840da94.pdf', 257825, 'application/pdf', 'pdf', NULL, 'private', 'deleted', 1, NULL, '[\"تست\"]', NULL, '1404/09/08', NULL, 1, 2, 0, 'ceo-001', '2025-09-07 21:55:34', '2025-09-08 18:43:50'),
('36f5618a-c1b3-4e45-869f-d989de1298be', 'نمونه', 'هیچی', 'testfile.txt', '85b1ff96-b06d-4928-8103-14ea1f9db647.txt', '/uploads/documents/85b1ff96-b06d-4928-8103-14ea1f9db647.txt', 28, 'text/plain', 'txt', NULL, 'public', 'active', 1, NULL, '[\"نمونه\"]', NULL, '1404/09/08', NULL, 1, 0, 0, 'ceo-001', '2025-09-08 18:44:16', '2025-09-14 11:29:29'),
('484fec64-e334-42e9-9ba9-c3830eb871c3', 'پروفایل', 'ندارد', 'Screenshot 2025-09-15 192617.png', '19ec6d37-1af7-407b-8489-9fdae4916341.png', '/uploads/documents/19ec6d37-1af7-407b-8489-9fdae4916341.png', 13123, 'image/png', 'png', NULL, 'private', 'deleted', 1, NULL, '[\"/\"]', NULL, '1404/09/15', NULL, 0, 1, 0, 'ceo-001', '2025-09-15 19:52:12', '2025-09-22 18:24:42'),
('6442e412-19bd-460a-9786-716bf0f838fa', 'Screenshot 2025-09-13 131322', 'هیج', 'Screenshot 2025-09-13 131322.png', '5ada56ab-db97-48f0-aa92-d2ceb3cd9d82.png', '/uploads/documents/5ada56ab-db97-48f0-aa92-d2ceb3cd9d82.png', 120058, 'image/png', 'png', NULL, 'private', 'active', 1, NULL, NULL, NULL, '1404/09/13', NULL, 1, 0, 0, 'ceo-001', '2025-09-13 15:21:25', '2025-09-14 11:37:18'),
('822362b3-4e9d-4bf2-836b-00a66fba997a', 'download', NULL, 'download.pdf', '1ed9a622-c79d-4b13-a826-44b90c5325f1.pdf', '/uploads/documents/1ed9a622-c79d-4b13-a826-44b90c5325f1.pdf', 152611, 'application/pdf', 'pdf', NULL, 'private', 'deleted', 1, NULL, NULL, NULL, '1404/09/09', NULL, 0, 0, 0, 'ceo-001', '2025-09-09 07:10:55', '2025-09-13 15:21:34'),
('bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'سند تست', 'این یک سند تست است', 'test-document.txt', '38cf89cd-b056-43be-83d7-567089a90f79.txt', '/uploads/documents/38cf89cd-b056-43be-83d7-567089a90f79.txt', 35, 'text/plain', 'txt', 'cat-other', 'public', 'deleted', 1, NULL, NULL, NULL, '1404/09/07', NULL, 1, 0, 0, 'ceo-001', '2025-09-07 13:20:07', '2025-09-07 17:56:09'),
('e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'آوسبیلدونگ', '.', 'Ausbildung-Fachinformatiker-Systemintegration.pdf', 'e49eb8d7-3849-4eaf-8940-04645ea4fb62.pdf', '/uploads/documents/e49eb8d7-3849-4eaf-8940-04645ea4fb62.pdf', 432889, 'application/pdf', 'pdf', 'cat-contracts', 'public', 'deleted', 1, NULL, '[\"آوسبیلدونگ\"]', NULL, '1404/09/07', NULL, 1, 0, 0, 'ceo-001', '2025-09-07 14:00:04', '2025-09-07 21:55:19');

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
('2b38e84f-915f-11f0-8060-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:37:18'),
('2b907b94-8cc2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 15:58:03'),
('2d9b3df6-8cab-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 12:36:10'),
('2e577a7e-8bfd-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل\"}', 'unknown', NULL, '2025-09-07 16:03:03'),
('3354f145-9161-11f0-8060-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:51:50'),
('3e40ef43-8c05-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ با سرویس ایمیل جدید ارسال شد\"}', 'unknown', NULL, '2025-09-07 17:14:45'),
('40cae408-8cc2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:58:38'),
('4523150a-8ca9-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 12:22:31'),
('48f3484f-8cb5-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:25:49'),
('490c7fc4-8bfd-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد. این سند حاوی اطلاعات مهم آموزشی است.\"}', 'unknown', NULL, '2025-09-07 16:03:47'),
('4ff38873-90b5-11f0-b002-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'upload', '{\"title\":\"Screenshot 2025-09-13 131322\",\"size\":120058,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-13 15:21:25'),
('516d812d-918d-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:07:39'),
('51e5becf-918c-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:00:30'),
('55a8a091-8c1d-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-07 20:41:35'),
('55aee9c3-90b5-11f0-b002-581122e4f0be', '822362b3-4e9d-4bf2-836b-00a66fba997a', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-13 15:21:34'),
('5ee42821-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:44:43'),
('5f20c275-8cb5-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:26:26'),
('611e0864-8bf9-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ - تست ارسال جدید\"}', 'unknown', NULL, '2025-09-07 15:35:50'),
('61ac337c-8cd2-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'delete', NULL, 'unknown', NULL, '2025-09-08 18:43:50'),
('624aadba-9276-11f0-a782-581122e4f0be', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-09-15 20:56:00'),
('6686eae4-918d-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}', 'unknown', NULL, '2025-09-14 17:08:14'),
('68b0f3a2-97e1-11f0-8035-aa7c082d9aee', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'delete', '{\"reason\":\"user_request\"}', 'unknown', NULL, '2025-09-22 18:24:42'),
('7328a22d-1fee-409e-8133-7049a9ef656f', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'upload', '{\"filename\":\"Ausbildung-Fachinformatiker-Systemintegration.pdf\",\"size\":432889}', 'unknown', NULL, '2025-09-07 14:00:04'),
('76862666-8cbc-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:17:12'),
('77f59cd7-8cb6-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'download', NULL, 'unknown', NULL, '2025-09-08 14:34:17'),
('789176b4-926d-11f0-8402-581122e4f0be', '484fec64-e334-42e9-9ba9-c3830eb871c3', 'ceo-001', 'upload', '{\"title\":\"پروفایل\",\"size\":13123,\"mime\":\"image/png\"}', 'unknown', NULL, '2025-09-15 19:52:12'),
('7c80d8d1-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:45:33'),
('7ea4d504-918a-11f0-9190-581122e4f0be', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:47:26'),
('82c80fd3-8cbb-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-08 15:10:23'),
('86e1ada0-9160-11f0-8060-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 11:47:01'),
('8d9a7786-8bed-11f0-a568-2c3b705dd50b', 'bed2e46e-c58c-4bd0-9212-c5298faf47b0', 'ceo-001', 'share', '{\"emails\":[\"test@example.com\"],\"permissionType\":\"view\",\"message\":\"سند تست برای شما\"}', 'unknown', NULL, '2025-09-07 13:21:24'),
('8f5676ff-8cac-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\",\"only.link086@gmail.com\"],\"subject\":\"📄 سند MBTI با فایل ضمیمه\",\"message\":\"این سند نتیجه تست MBTI است که از طریق سیستم مدیریت اسناد ارسال شده است.\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 12:46:04'),
('934595ea-9188-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:33:42'),
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
('cda1318a-8cb8-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 14:51:00'),
('e1d67b43-8cbf-11f0-9c70-2c3b705dd50b', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}', 'unknown', NULL, '2025-09-08 15:41:40'),
('e9dbb7a1-918a-11f0-9190-581122e4f0be', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}', 'unknown', NULL, '2025-09-14 16:50:26'),
('f54b074b-8bf7-11f0-a568-2c3b705dd50b', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'share', '{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ ارسال شده از سیستم CRM\"}', 'unknown', NULL, '2025-09-07 15:25:39'),
('fac8bd2c-290b-4950-b4da-64403c8d6123', '822362b3-4e9d-4bf2-836b-00a66fba997a', 'ceo-001', 'upload', '{\"filename\":\"download.pdf\",\"size\":152611}', 'unknown', NULL, '2025-09-09 07:10:55');

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
('69f99523-82b1-4d4a-a287-81daede2a77a', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '7acb20a0-bfb1-4771-9285-dba1b750aac7', 'view', '...', NULL, 1, 0, NULL, '2025-09-08 14:28:06'),
('6a6510a2-79bb-49b5-a994-2713726131c3', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '065ec468-4f7f-47e8-96e0-3b544e159013', 'download', NULL, NULL, 1, 0, NULL, '2025-09-08 15:17:09'),
('70d9e140-6df9-4021-9e62-40b2553c8ec4', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'rockygardner89@gmail.com', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '1354a556-e89e-40d1-ac8f-7f5224dd79e7', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 11:51:50'),
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
('c56ada7b-d2d2-4973-ad7b-b7d7bf6e25cc', '074241db-04a3-46cf-a903-322bceeb7d8c', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '73466602-5be9-46de-bafd-276c57e26a6f', 'download', '.', NULL, 1, 0, NULL, '2025-09-08 14:56:36'),
('cc40e406-15b5-4e07-8b6f-3510239e9f54', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '9ef7aa86-470b-4764-91e2-efdd7098d4be', 'view', 'فایل آوسبیلدونگ ارسال شده از سیستم CRM', '2025-10-07 15:25:39', 1, 0, NULL, '2025-09-07 15:25:39'),
('d10d492d-3a35-448b-800a-9091870d1efb', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '801b428e-95f9-4a45-ba0a-335b410289d7', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 16:46:40'),
('d3c25558-e4e5-444e-ba72-03aa1e899fb9', '36f5618a-c1b3-4e45-869f-d989de1298be', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '44284160-206e-4ab5-9c02-dc4dc849eb8b', 'download', NULL, NULL, 1, 0, NULL, '2025-09-14 16:55:13'),
('d86520ef-444b-4bcb-ae0d-105274e174e8', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '51561b67-4a3f-4552-86b7-d8d980228865', 'download', 'سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل', '2025-10-07 16:03:01', 1, 0, NULL, '2025-09-07 16:03:01'),
('de814991-2782-4104-b18e-e02765b69399', 'e0c7e8c5-18ae-415b-90aa-d8f36e2244f2', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, '49588e33-19f7-4e78-a44f-a6900faa3f5c', 'view', 'تپششش', NULL, 1, 0, NULL, '2025-09-07 20:58:22'),
('df094f9b-fb75-4f62-b0c7-db2158cee714', '6442e412-19bd-460a-9786-716bf0f838fa', 'ceo-001', 'ahmadreza.avandi@gmail.com', NULL, 'efab8b0c-0b50-48bf-97f3-1a69ab69ef16', 'view', NULL, NULL, 1, 0, NULL, '2025-09-14 17:07:24'),
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
('53467a21-e69e-4ae2-bf42-85c8b5b84450', '5e1dd51e-12eb-48d5-91bc-9366f05b4088', 'popup', 15, 0, NULL, '2025-09-22 16:10:39'),
('576284fd-e8bb-43ea-80a5-8e2aa7deb656', '4abe30c7-797b-4eeb-b607-23b53868c44e', 'popup', 15, 0, NULL, '2025-09-22 16:08:02'),
('8409c21d-44fb-4ea8-94b5-7a17521f4094', '2c436379-aca5-4ad0-ad18-5403bf435f2e', 'popup', 15, 0, NULL, '2025-09-22 16:08:25'),
('8f3392a9-4cd1-4fd6-8e82-29e8dafd4ffc', 'cedb2b33-c814-427c-8c4f-2447b932753d', 'popup', 15, 0, NULL, '2025-09-15 19:51:10'),
('rem-001', 'event-001', 'popup', 15, 0, NULL, '2025-09-10 22:41:11'),
('rem-002', 'event-001', 'email', 60, 0, NULL, '2025-09-10 22:41:11'),
('rem-003', 'event-002', 'popup', 10, 0, NULL, '2025-09-10 22:41:11'),
('rem-004', 'event-003', 'popup', 5, 0, NULL, '2025-09-10 22:41:11'),
('rem-005', 'event-004', 'popup', 30, 0, NULL, '2025-09-10 22:41:11');

-- --------------------------------------------------------

--
-- Table structure for table `feedback`
--

CREATE TABLE `feedback` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
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

INSERT INTO `feedback` (`id`, `customer_id`, `type`, `title`, `comment`, `score`, `product`, `channel`, `category`, `priority`, `status`, `sentiment`, `sentiment_score`, `created_at`, `resolved_at`) VALUES
('2617166a-b388-4610-b30a-9e452351cf21', 'cnt-me4piwag', '', 'نظرسنجی رضایت از فرآیند فروش', 'چه چیزی در فرآیند فروش ما نیاز به بهبود دارد؟: هیچی', 5.00, NULL, 'email', NULL, 'medium', 'pending', NULL, NULL, '2025-09-15 18:06:17', NULL),
('4a6957d4-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'praise', 'خدمات عالی', 'بسیار راضی از خدمات شما هستیم', 4.80, NULL, 'email', 'خدمات', 'low', 'pending', 'positive', NULL, '2024-12-01 07:30:00', NULL),
('4a69607f-75b7-11f0-9306-e35500020927', 'fa49480a-75b6-11f0-9306-e35500020927', 'suggestion', 'بهبود سایت', 'پیشنهاد می‌کنم سایت را بهتر کنید', 3.50, NULL, 'website', 'وب‌سایت', 'medium', 'pending', 'neutral', NULL, '2024-12-02 12:00:00', NULL),
('4a6963e1-75b7-11f0-9306-e35500020927', 'fa49498b-75b6-11f0-9306-e35500020927', 'complaint', 'تاخیر در تحویل', 'سفارش ما با تاخیر تحویل داده شد', 2.10, NULL, 'phone', 'تحویل', 'high', 'pending', 'negative', NULL, '2024-12-03 05:45:00', NULL),
('4a696500-75b7-11f0-9306-e35500020927', 'fa4949df-75b6-11f0-9306-e35500020927', 'csat', 'نظرسنجی رضایت', 'به طور کلی راضی هستم', 4.20, NULL, 'survey', 'کلی', 'low', 'pending', 'positive', NULL, '2024-12-04 13:15:00', NULL),
('4a696657-75b7-11f0-9306-e35500020927', 'fa494b28-75b6-11f0-9306-e35500020927', 'praise', 'پشتیبانی سریع', 'پشتیبانی شما فوق‌العاده است', 4.90, NULL, 'chat', 'پشتیبانی', 'low', 'pending', 'positive', NULL, '2024-12-05 10:50:00', NULL),
('4a696751-75b7-11f0-9306-e35500020927', 'fa494b85-75b6-11f0-9306-e35500020927', 'complaint', 'مشکل فنی', 'مشکل فنی در محصول وجود دارد', 2.30, NULL, 'email', 'فنی', 'high', 'pending', 'negative', NULL, '2024-12-06 07:00:00', NULL),
('4a69685a-75b7-11f0-9306-e35500020927', 'fa494c4a-75b6-11f0-9306-e35500020927', 'suggestion', 'قیمت بهتر', 'اگر قیمت‌ها کمتر باشد بهتر است', 3.20, NULL, 'phone', 'قیمت', 'medium', 'pending', 'neutral', NULL, '2024-12-07 09:15:00', NULL),
('4a696953-75b7-11f0-9306-e35500020927', 'fa494c98-75b6-11f0-9306-e35500020927', 'praise', 'کیفیت بالا', 'کیفیت محصولات عالی است', 4.60, NULL, 'website', 'کیفیت', 'low', 'pending', 'positive', NULL, '2024-12-08 13:45:00', NULL),
('5520f68f-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی آبان', 'راضی هستم', 4.10, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-11-15 06:30:00', NULL),
('5520fd63-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی آبان', 'خوب بود', 3.80, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-11-20 11:00:00', NULL),
('5520fe54-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'csat', 'نظرسنجی آذر', 'عالی', 4.50, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-11-25 13:15:00', NULL),
('5520ff8b-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی آذر', 'متوسط', 3.20, NULL, 'website', NULL, 'medium', 'pending', 'neutral', NULL, '2024-10-10 05:45:00', NULL),
('55210090-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی مهر', 'خوب', 4.00, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-10-20 08:00:00', NULL),
('55210133-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'csat', 'نظرسنجی مهر', 'بد نبود', 3.50, NULL, 'website', NULL, 'medium', 'pending', 'neutral', NULL, '2024-10-25 10:15:00', NULL),
('552101e7-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی شهریور', 'راضی', 4.30, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-09-15 11:50:00', NULL),
('552102ae-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'csat', 'نظرسنجی شهریور', 'خیلی خوب', 4.70, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2024-09-25 13:40:00', NULL),
('f44bd1c7-75b3-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'complaint', 'مشکل در خدمات', 'خدمات شما خوب نیست', 2.50, NULL, 'website', NULL, 'medium', 'pending', 'negative', NULL, '2025-08-10 06:34:45', NULL),
('f44bd97e-75b3-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'praise', 'خدمات عالی', 'بسیار راضی هستم', 4.50, NULL, 'website', NULL, 'medium', 'pending', 'positive', NULL, '2025-08-10 06:34:45', NULL);

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
('402b0d17-543b-4130-97e0-b33ba4006733', 'form-002', 'cnt-me4piwag', 'c45abaf2a8cbaaed0391528c8f90897d139d17226490238b3939c7cf26d3f83f', 'pending', NULL, NULL, '2025-09-22 18:28:21', '2025-09-22 18:28:21'),
('4882de58-5fe8-43e9-b42b-4ddad91e93ed', 'form-001', 'cnt-me4piwag', '10b30b796631a9f47e4f6b61e1eea66a76c4518215f9de74f4282831addfc040', 'pending', NULL, NULL, '2025-08-09 20:38:58', '2025-08-09 20:38:58'),
('4aa69f26-1376-443f-903b-17c705ca35c5', 'form-001', 'cnt-me4piwag', 'f79eff47a052a726540985bf743a4e9e82901bbd33a434572c632b9c56a321f1', 'pending', NULL, NULL, '2025-09-15 17:37:45', '2025-09-15 17:37:45'),
('58e57e51-68fd-451c-b8f5-a5758c61620f', 'form-002', 'cnt-me4piwag', '9bc5eb444348bf930de12b4f2a5b50802812cde3f6c7734179c202e2fe587ec7', 'completed', '198925c9024918f9', '2025-08-10 06:17:45', '2025-08-10 05:03:00', '2025-08-10 06:17:45'),
('6027377a-709a-4b14-83d4-54271cb57862', 'form-002', 'cnt-me4piwag', 'e90678cd116d6ea4eb9e334dda68283ee16ea39c856a65baf8ed001c63831980', 'pending', '198926f516b6b2c9', NULL, '2025-08-10 05:23:44', '2025-08-10 05:23:45'),
('7e99a2c8-fcc7-4ad3-88cc-547bee72b519', 'form-001', 'cnt-me4piwag', '27155ff33355143b1f077523ea6618a7b3c1e1f4d236ab8d1505ce60529ee664', 'pending', NULL, NULL, '2025-08-09 21:10:44', '2025-08-09 21:10:44'),
('9261de73-80f2-4f2b-ac72-67c97b952e01', 'form-001', 'cnt-me4piwag', 'a4f1602458af5150e5c7ba15a1bdc4c9390eac4dbad3f7623e618441379be383', 'pending', NULL, NULL, '2025-08-10 05:23:30', '2025-08-10 05:23:30'),
('96ca27dd-6715-4f80-8e6e-7691138c2e4a', 'form-001', 'cnt-me4piwag', 'df9a7e537fc23eeed8c0f8af2bf5dedf8653a54f2be16ebebb0a23ab467591f4', 'completed', NULL, '2025-09-15 18:06:17', '2025-09-15 18:03:59', '2025-09-15 18:06:17'),
('96d90ad9-f5ec-40f5-859b-9fec1e249a2b', 'form-002', 'cnt-me4piwag', '5b4272473c28d668dd436e1cea096c3f3fd2e349735dc732b4f3d34d605cabbe', 'pending', NULL, NULL, '2025-09-22 18:22:55', '2025-09-22 18:22:55'),
('a96d0908-8f82-4a33-b4b5-1f2bbed2ff2c', 'form-001', 'cnt-me4piwag', '3d42013d7603a36524ab9a509d922d0d705daf00853c2a54d1c089f6e681e415', 'pending', '19890a654e931213', NULL, '2025-08-09 21:04:35', '2025-08-09 21:04:36'),
('c1354bda-62ed-474c-9652-ae61d47252ef', 'form-001', 'cnt-me4piwag', '8ec9a0dfad982b44a0483b1a40cc042e229c98a71802916dc0922a3d36dd7ffd', 'pending', NULL, NULL, '2025-08-09 20:28:48', '2025-08-09 20:28:48'),
('e38c216e-59b0-45f4-b8dd-d508b32547de', 'form-001', 'cnt-me4piwag', 'f6a480ad94c66fbd2661f9cae4a2b3fd0c5ee1ad7a391055239c4ebf48b152ee', 'pending', NULL, NULL, '2025-09-16 19:31:08', '2025-09-16 19:31:08'),
('e4b13463-6b41-4d39-bb4c-445e7ab0a6a1', 'form-001', 'cnt-me4piwag', '4d4737f89e3139977561b398058ca28163e24fa2866aabaec10ca2f346211cb4', 'pending', NULL, NULL, '2025-08-09 20:41:10', '2025-08-09 20:41:10'),
('e6d8b4cd-fb0c-4352-a7a5-3b612c24c9a4', 'form-001', 'cnt-me4piwag', '6421a3948aed9f76793119f3700e4faf68c465c3f1a76c462a8bb04d5cff6e8c', 'pending', '198926a4326761c0', NULL, '2025-08-10 05:18:13', '2025-08-10 05:18:14'),
('e9062285-658a-4676-b3f7-7ce8abfa70ab', 'form-001', 'cnt-me4piwag', 'f3f348cb843e09880cc61206f00903f6de6dba15b978062132fb0c5dfb95771b', 'pending', '19890952812a17b5', NULL, '2025-08-09 20:45:50', '2025-08-09 20:45:51'),
('test-submission-1', 'form-001', 'test-customer', 'test-token-123', 'pending', NULL, NULL, '2025-08-10 06:14:54', '2025-08-10 06:14:54');

-- --------------------------------------------------------

--
-- Table structure for table `interactions`
--

CREATE TABLE `interactions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
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
-- Stand-in structure for view `interaction_summary`
-- (See below for the actual view)
--
CREATE TABLE `interaction_summary` (
`id` varchar(36)
,`customer_id` varchar(36)
,`type` enum('email','phone','chat','meeting','website','social')
,`subject` varchar(255)
,`description` text
,`direction` enum('inbound','outbound')
,`channel` varchar(100)
,`date` timestamp
,`duration` int(11)
,`outcome` text
,`sentiment` enum('positive','neutral','negative')
,`performed_by` varchar(36)
,`customer_name` varchar(255)
,`customer_email` varchar(255)
,`customer_segment` enum('enterprise','small_business','individual')
,`performed_by_name` varchar(255)
,`attachment_count` bigint(21)
,`tag_count` bigint(21)
,`follow_up_count` bigint(21)
);

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

INSERT INTO `notifications` (`id`, `user_id`, `type`, `title`, `message`, `related_id`, `related_type`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
('01bc997f-da29-41b6-810a-98a1877cb478', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'chat_message', 'پیام جدید', 'پیام جدید از Robintejarat@gmail.com', NULL, NULL, 1, '2025-08-28 15:28:19', '2025-08-28 11:47:30', '2025-08-28 15:28:19'),
('09dff2d2-2ea8-4af2-985e-665295bed94c', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: af', 'وظیفه \"af\" توسط مهندس کریمی تکمیل شد', 'acb466e3-0cd3-49d5-8646-966cdb487c99', 'task', 1, '2025-09-15 20:58:22', '2025-09-15 17:27:42', '2025-09-15 20:58:22'),
('118dc133-4ebc-457e-a8ed-a21b8c795ebd', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: ,h,', 'وظیفه \",h,\" توسط مهندس کریمی تکمیل شد', 'da9b43c4-56c5-416a-9b2b-f8e5615fa213', 'task', 0, NULL, '2025-09-22 18:24:31', '2025-09-22 18:24:31'),
('1d3b0f55-75b1-4d18-9e74-f40052bad8b3', 'ceo-001', 'report_submitted', '📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۶/۰۶', 'گزارش \"گزارش روزانه ۱۴۰۴/۰۶/۰۶\" توسط خودم ارسال شد', 'e8e353bf-cbba-43c8-8753-ba0ea2ac2f72', 'report', 1, '2025-08-28 14:44:30', '2025-08-28 08:59:19', '2025-08-28 14:44:30'),
('6e2a3e84-d868-45b8-9121-a3e0c1b44fd7', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: af', 'وظیفه \"af\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'acb466e3-0cd3-49d5-8646-966cdb487c99', 'task', 0, NULL, '2025-09-15 16:20:51', '2025-09-15 19:50:51'),
('75b6a424-274a-4617-84d2-5a632ef237ff', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: ,h,', 'وظیفه \",h,\" به شما اختصاص داده شد. اولویت: 🟡 متوسط', 'da9b43c4-56c5-416a-9b2b-f8e5615fa213', 'task', 0, NULL, '2025-09-16 16:03:23', '2025-09-16 19:33:23'),
('873de939-e65c-4da9-a773-4c9ab668387d', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: تست', 'وظیفه \"تست\" توسط احمد تکمیل شد', 'd1b1cda1-bdad-46c6-9d56-0b37f4ae7a35', 'task', 1, '2025-09-13 15:04:27', '2025-09-11 07:13:54', '2025-09-13 15:04:27'),
('8ba51ea7-ed72-4f57-bd04-e005f7857721', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: بسس', 'وظیفه \"بسس\" به شما اختصاص داده شد. اولویت: 🔴 بالا', 'c43e6bc0-449e-456e-98fd-e51d8017a5ca', 'task', 1, '2025-09-16 09:51:55', '2025-09-15 11:03:10', '2025-09-16 09:51:55'),
('8f37479c-8a78-4543-beeb-7106c8dc8eaa', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'task_assigned', '📋 وظیفه جدید: تست', 'وظیفه \"تست\" به شما اختصاص داده شد. اولویت: 🔴 بالا', 'd1b1cda1-bdad-46c6-9d56-0b37f4ae7a35', 'task', 1, '2025-09-14 11:14:24', '2025-09-11 07:12:49', '2025-09-14 11:14:24'),
('9fbcf3ab-2e7e-438f-b34d-65aa5eca0ee8', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'chat_message', 'پیام جدید', 'پیام جدید از Robintejarat@gmail.com', NULL, NULL, 1, '2025-08-28 15:28:17', '2025-08-28 11:57:48', '2025-08-28 15:28:17'),
('b485934e-5829-472e-a8c0-cb9c47d9989b', 'ceo-001', 'task_completed', '✅ وظیفه تکمیل شد: بسس', 'وظیفه \"بسس\" توسط مهندس کریمی تکمیل شد', 'c43e6bc0-449e-456e-98fd-e51d8017a5ca', 'task', 1, '2025-09-15 19:50:58', '2025-09-15 16:20:40', '2025-09-15 19:50:58'),
('be9011f6-7b85-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'success', 'خوش آمدید', 'به سیستم مدیریت CRM خوش آمدید', NULL, NULL, 1, '2025-08-17 17:10:43', '2025-08-17 16:41:01', '2025-08-17 17:10:43'),
('be901491-7b85-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'info', 'گزارش فروش', 'گزارش فروش ماهانه آماده شده است', NULL, NULL, 1, '2025-08-17 17:10:43', '2025-08-17 16:41:01', '2025-08-17 17:10:43');

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
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `specifications` text DEFAULT NULL,
  `base_price` decimal(15,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `is_active` tinyint(1) DEFAULT 1,
  `inventory` int(11) DEFAULT 999,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `description`, `specifications`, `base_price`, `currency`, `is_active`, `inventory`, `created_at`, `updated_at`) VALUES
('49d686fb-9b59-457e-8b0a-7d66064ea96c', 'تست لمروز', 'تست', NULL, NULL, 2000000.00, 'IRR', 1, 999, '2025-09-09 06:24:25', '2025-09-09 06:24:25'),
('d66fe853-514d-4af7-adf9-5c3b14f91238', 'نمیدونم322', 'اینم نمیدونم', 'بازم نمیدونمیثث', 'تست', 2000000.00, 'IRR', 1, 999, '2025-08-16 06:37:35', '2025-09-15 19:48:24'),
('dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344', 'نرم افزار CRM', 'نرم افزار', 'خیلی عالیه', 'عالیع', 30000000.00, 'IRR', 1, 999, '2025-09-11 10:37:21', '2025-09-11 10:37:30');

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

INSERT INTO `sales` (`id`, `deal_id`, `customer_id`, `customer_name`, `total_amount`, `currency`, `payment_status`, `payment_method`, `sale_date`, `delivery_date`, `payment_due_date`, `notes`, `invoice_number`, `sales_person_id`, `sales_person_name`, `created_at`, `updated_at`) VALUES
('0645eaaf-906c-4a89-8672-7b9aab6bc736', NULL, 'fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 30000000.00, 'IRR', 'paid', 'نقد', '2025-09-15 13:55:22', '2025-09-14 20:30:00', '2025-09-16 20:30:00', NULL, '14171', 'ceo-001', 'مهندس کریمی', '2025-09-15 13:55:22', '2025-09-15 17:48:59'),
('0e4db699-ce1b-4aef-88d8-cd0cb9b632af', NULL, 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 2000000.00, 'IRR', 'paid', 'فروش', '2025-09-10 16:24:36', '2025-09-09 20:30:00', '2025-09-11 20:30:00', NULL, '۲۳', 'ceo-001', 'مهندس کریمی', '2025-09-10 16:24:36', '2025-09-10 16:24:36'),
('156434de-bcca-4093-8192-c1809116873c', NULL, 'd44fd871-75b3-11f0-9306-e35500020927', 'شرکت نمونه 2', 2000000.00, 'IRR', 'pending', 'شزش', '2025-09-10 19:42:15', '2025-09-10 20:30:00', NULL, NULL, '۲۲', 'ceo-001', 'مهندس کریمی', '2025-09-10 19:42:15', '2025-09-10 19:42:15'),
('2a2cab8b-75b7-11f0-9306-e35500020927', '2a2c975d-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'شرکت تکنولوژی پارس', 15000000.00, 'IRR', 'paid', NULL, '2024-12-01 07:00:00', NULL, NULL, NULL, NULL, '2a2cab07-75b7-11f0-9306-e35500020927', 'احمد رضایی', '2024-12-01 07:00:00', '2025-08-10 06:57:44'),
('2a2cb41e-75b7-11f0-9306-e35500020927', '2a2cb306-75b7-11f0-9306-e35500020927', 'fa49480a-75b6-11f0-9306-e35500020927', 'فروشگاه آنلاین رضا', 8500000.00, 'IRR', 'paid', NULL, '2024-12-02 10:50:00', NULL, NULL, NULL, NULL, '2a2cb401-75b7-11f0-9306-e35500020927', 'فاطمه کریمی', '2024-12-02 10:50:00', '2025-08-10 06:57:44'),
('2a2cb672-75b7-11f0-9306-e35500020927', '2a2cb51d-75b7-11f0-9306-e35500020927', 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 22000000.00, 'IRR', 'pending', NULL, '2024-12-03 13:15:00', NULL, NULL, NULL, NULL, '2a2cb650-75b7-11f0-9306-e35500020927', 'محمد حسینی', '2024-12-03 13:15:00', '2025-08-10 06:57:44'),
('2a2cb745-75b7-11f0-9306-e35500020927', '2a2cb6c7-75b7-11f0-9306-e35500020927', 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 4500000.00, 'IRR', 'paid', NULL, '2024-12-04 07:45:00', NULL, NULL, NULL, NULL, '2a2cb730-75b7-11f0-9306-e35500020927', 'سارا احمدی', '2024-12-04 07:45:00', '2025-08-10 06:57:44'),
('2a2cb815-75b7-11f0-9306-e35500020927', '2a2cb783-75b7-11f0-9306-e35500020927', 'fa494b28-75b6-11f0-9306-e35500020927', 'مهندس علی احمدی', 6700000.00, 'IRR', 'paid', NULL, '2024-12-05 06:00:00', NULL, NULL, NULL, NULL, '2a2cb7fa-75b7-11f0-9306-e35500020927', 'علی محمدی', '2024-12-05 06:00:00', '2025-08-10 06:57:44'),
('2a2cb8b4-75b7-11f0-9306-e35500020927', '2a2cb850-75b7-11f0-9306-e35500020927', 'fa494b85-75b6-11f0-9306-e35500020927', 'شرکت ساختمانی نوین', 35000000.00, 'IRR', 'partial', NULL, '2024-12-06 09:50:00', NULL, NULL, NULL, NULL, '2a2cb8a3-75b7-11f0-9306-e35500020927', 'مینا رضایی', '2024-12-06 09:50:00', '2025-08-10 06:57:44'),
('2a2cb96e-75b7-11f0-9306-e35500020927', '2a2cb8fa-75b7-11f0-9306-e35500020927', 'fa494c4a-75b6-11f0-9306-e35500020927', 'رستوران سنتی', 7200000.00, 'IRR', 'paid', NULL, '2024-12-07 12:15:00', NULL, NULL, NULL, NULL, '2a2cb95c-75b7-11f0-9306-e35500020927', 'حسن علیزاده', '2024-12-07 12:15:00', '2025-08-10 06:57:44'),
('2a2cba7d-75b7-11f0-9306-e35500020927', '2a2cb9a6-75b7-11f0-9306-e35500020927', 'fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 3800000.00, 'IRR', 'pending', NULL, '2024-12-08 06:40:00', NULL, NULL, NULL, NULL, '2a2cba64-75b7-11f0-9306-e35500020927', 'زهرا محمدی', '2024-12-08 06:40:00', '2025-08-10 06:57:44'),
('2f81864b-1c3c-4c06-b02a-a491d2d94a7b', NULL, 'fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 2000000.00, 'IRR', 'pending', 'نقد', '2025-09-10 20:11:58', '2025-09-09 20:30:00', '2025-09-10 20:30:00', NULL, '*1', 'ceo-001', 'مهندس کریمی', '2025-09-10 20:11:58', '2025-09-10 20:11:58'),
('34746a1b-885b-45b5-a30b-389b05616ed3', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:14', '2025-08-29 20:30:00', '2025-08-29 20:30:00', '.', '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:14', '2025-08-30 06:04:14'),
('35f347d4-75b7-11f0-9306-e35500020927', '35f1b579-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'شرکت نمونه 1', 12000000.00, 'IRR', 'paid', NULL, '2025-08-08 20:30:00', NULL, NULL, NULL, NULL, '35f346ca-75b7-11f0-9306-e35500020927', 'احمد رضایی', '2025-08-08 20:30:00', '2025-08-10 06:58:04'),
('35f34eff-75b7-11f0-9306-e35500020927', '35f34dda-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'شرکت نمونه 2', 8500000.00, 'IRR', 'paid', NULL, '2025-08-07 20:30:00', NULL, NULL, NULL, NULL, '35f34ec1-75b7-11f0-9306-e35500020927', 'فاطمه کریمی', '2025-08-07 20:30:00', '2025-08-10 06:58:04'),
('35f35083-75b7-11f0-9306-e35500020927', '35f34feb-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'شرکت تکنولوژی پارس', 15500000.00, 'IRR', 'pending', NULL, '2025-08-06 20:30:00', NULL, NULL, NULL, NULL, '35f35053-75b7-11f0-9306-e35500020927', 'محمد حسینی', '2025-08-06 20:30:00', '2025-08-10 06:58:04'),
('35f351aa-75b7-11f0-9306-e35500020927', '35f35116-75b7-11f0-9306-e35500020927', 'fa49480a-75b6-11f0-9306-e35500020927', 'فروشگاه آنلاین رضا', 6200000.00, 'IRR', 'paid', NULL, '2025-08-05 20:30:00', NULL, NULL, NULL, NULL, '35f3517e-75b7-11f0-9306-e35500020927', 'سارا احمدی', '2025-08-05 20:30:00', '2025-08-10 06:58:04'),
('35f352b6-75b7-11f0-9306-e35500020927', '35f3520d-75b7-11f0-9306-e35500020927', 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 9800000.00, 'IRR', 'paid', NULL, '2025-08-04 20:30:00', NULL, NULL, NULL, NULL, '35f35282-75b7-11f0-9306-e35500020927', 'علی محمدی', '2025-08-04 20:30:00', '2025-08-10 06:58:04'),
('35f3540a-75b7-11f0-9306-e35500020927', '35f3537d-75b7-11f0-9306-e35500020927', 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 4300000.00, 'IRR', 'paid', NULL, '2025-08-03 20:30:00', NULL, NULL, NULL, NULL, '35f353e2-75b7-11f0-9306-e35500020927', 'مینا رضایی', '2025-08-03 20:30:00', '2025-08-10 06:58:04'),
('3c71f48d-7414-47c6-91f4-e1ac8891885c', NULL, 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 2000000.00, 'IRR', 'paid', 'فروش', '2025-09-10 16:24:37', '2025-09-09 20:30:00', '2025-09-11 20:30:00', NULL, '۲۳', 'ceo-001', 'مهندس کریمی', '2025-09-10 16:24:37', '2025-09-10 16:24:37'),
('3ec34757-3f06-4edc-a83e-33c5781c189f', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:07', '2025-08-29 20:30:00', '2025-08-29 20:30:00', NULL, '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:07', '2025-08-30 06:04:07'),
('439ebb86-0dc8-49fc-9801-e9c57e039eb8', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:14', '2025-08-29 20:30:00', '2025-08-29 20:30:00', '.', '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:14', '2025-08-30 06:04:14'),
('486fe91c-1ca6-4900-9906-374bc08cd763', NULL, 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 2000000.00, 'IRR', 'partial', NULL, '2025-09-10 19:57:06', '2025-09-09 20:30:00', '2025-09-10 20:30:00', NULL, '۰۰۰۰', 'ceo-001', 'مهندس کریمی', '2025-09-10 19:57:06', '2025-09-10 19:57:06'),
('57e2065c-19db-44fd-8915-9e335a0f07e1', NULL, 'fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 2000000.00, 'IRR', 'pending', 'نقد', '2025-09-10 20:11:57', '2025-09-09 20:30:00', '2025-09-10 20:30:00', NULL, '*1', 'ceo-001', 'مهندس کریمی', '2025-09-10 20:11:57', '2025-09-10 20:11:57'),
('607e1a53-75b7-11f0-9306-e35500020927', '607e1752-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'فروش آبان 1', 18000000.00, 'IRR', 'paid', NULL, '2024-11-10 06:30:00', NULL, NULL, NULL, NULL, '607e1988-75b7-11f0-9306-e35500020927', 'احمد رضایی', '2024-11-10 06:30:00', '2025-08-10 06:59:15'),
('607e1f1f-75b7-11f0-9306-e35500020927', '607e1e4f-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'فروش آبان 2', 12500000.00, 'IRR', 'paid', NULL, '2024-11-15 11:00:00', NULL, NULL, NULL, NULL, '607e1ee6-75b7-11f0-9306-e35500020927', 'فاطمه کریمی', '2024-11-15 11:00:00', '2025-08-10 06:59:15'),
('607e2075-75b7-11f0-9306-e35500020927', '607e1fde-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'فروش آبان 3', 9800000.00, 'IRR', 'pending', NULL, '2024-11-20 13:15:00', NULL, NULL, NULL, NULL, '607e2051-75b7-11f0-9306-e35500020927', 'محمد حسینی', '2024-11-20 13:15:00', '2025-08-10 06:59:15'),
('607e2254-75b7-11f0-9306-e35500020927', '607e2152-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'فروش آذر 1', 25000000.00, 'IRR', 'paid', NULL, '2024-10-05 05:45:00', NULL, NULL, NULL, NULL, '607e222e-75b7-11f0-9306-e35500020927', 'سارا احمدی', '2024-10-05 05:45:00', '2025-08-10 06:59:15'),
('607e2372-75b7-11f0-9306-e35500020927', '607e22d1-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'فروش آذر 2', 14200000.00, 'IRR', 'paid', NULL, '2024-10-12 08:00:00', NULL, NULL, NULL, NULL, '607e2348-75b7-11f0-9306-e35500020927', 'علی محمدی', '2024-10-12 08:00:00', '2025-08-10 06:59:15'),
('607e244d-75b7-11f0-9306-e35500020927', '607e23de-75b7-11f0-9306-e35500020927', 'fa490a71-75b6-11f0-9306-e35500020927', 'فروش آذر 3', 8900000.00, 'IRR', 'partial', NULL, '2024-10-18 10:15:00', NULL, NULL, NULL, NULL, '607e242f-75b7-11f0-9306-e35500020927', 'مینا رضایی', '2024-10-18 10:15:00', '2025-08-10 06:59:15'),
('607e2535-75b7-11f0-9306-e35500020927', '607e24b0-75b7-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'فروش مهر 1', 16700000.00, 'IRR', 'paid', NULL, '2024-09-08 11:50:00', NULL, NULL, NULL, NULL, '607e2514-75b7-11f0-9306-e35500020927', 'حسن علیزاده', '2024-09-08 11:50:00', '2025-08-10 06:59:15'),
('607e263f-75b7-11f0-9306-e35500020927', '607e259e-75b7-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'فروش مهر 2', 11300000.00, 'IRR', 'paid', NULL, '2024-09-22 13:40:00', NULL, NULL, NULL, NULL, '607e261b-75b7-11f0-9306-e35500020927', 'زهرا محمدی', '2024-09-22 13:40:00', '2025-08-10 06:59:15'),
('6df1e92a-303f-4bc8-b1fb-801321588a86', NULL, 'fa494c98-75b6-11f0-9306-e35500020927', 'دکتر مریم صادقی', 2000000.00, 'IRR', 'pending', 'نقد', '2025-09-10 20:12:05', '2025-09-09 20:30:00', '2025-09-10 20:30:00', NULL, '*1', 'ceo-001', 'مهندس کریمی', '2025-09-10 20:12:05', '2025-09-10 20:12:05'),
('7769854a-8014-437c-a5eb-ac7c37decd3d', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:13', '2025-08-29 20:30:00', '2025-08-29 20:30:00', '.', '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:13', '2025-08-30 06:04:13'),
('8e5323a2-9aa8-42e3-92fb-9c874cab01a4', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:02', '2025-08-29 20:30:00', '2025-08-29 20:30:00', NULL, '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:02', '2025-08-30 06:04:02'),
('94ccee5c-773c-483f-adea-42db3691864a', NULL, '92df42e9-f691-4167-9358-2f9dfe41566d', 'هیچی', 50000000.00, 'IRR', 'paid', 'نقد', '2025-09-15 16:17:44', '2025-09-14 20:30:00', '2025-09-14 20:30:00', NULL, '3424', 'ceo-001', 'مهندس کریمی', '2025-09-15 16:17:44', '2025-09-15 19:48:11'),
('b1bc9cdb-5a67-4243-8f7f-e62f5be37d64', NULL, 'fa494b85-75b6-11f0-9306-e35500020927', 'شرکت ساختمانی نوین', 2000000.00, 'IRR', 'pending', 'خاترتش', '2025-09-10 16:28:22', '2025-09-10 20:30:00', '2025-09-12 20:30:00', 'فروش امذوز', '۳۴۳', 'ceo-001', 'مهندس کریمی', '2025-09-10 16:28:22', '2025-09-10 16:28:22'),
('ce0bb8d8-f3f2-4857-9417-92f11e13df95', NULL, 'd44fd871-75b3-11f0-9306-e35500020927', 'شرکت نمونه 2', 2000000.00, 'IRR', 'partial', '22', '2025-08-17 16:06:28', '2025-08-16 20:30:00', '2025-08-16 20:30:00', '..', '33', 'ceo-001', 'مهندس کریمی', '2025-08-17 16:06:28', '2025-08-17 16:06:28'),
('db0ef68f-eae0-4493-a51a-f2090e844168', NULL, 'fa494c4a-75b6-11f0-9306-e35500020927', 'رستوران سنتی', 2000000.00, 'IRR', 'paid', NULL, '2025-09-10 20:16:43', '2025-09-03 20:30:00', '2025-09-09 20:30:00', NULL, NULL, 'ceo-001', 'مهندس کریمی', '2025-09-10 20:16:43', '2025-09-10 20:16:43'),
('e6d4fc77-75b3-11f0-9306-e35500020927', 'e6d4fa29-75b3-11f0-9306-e35500020927', 'd44facc0-75b3-11f0-9306-e35500020927', 'شرکت نمونه 1', 5000000.00, 'IRR', 'paid', NULL, '2025-08-10 06:34:22', NULL, NULL, NULL, NULL, 'e6d4fc6a-75b3-11f0-9306-e35500020927', 'فروشنده نمونه', '2025-08-10 06:34:22', '2025-08-10 06:34:22'),
('e6d50630-75b3-11f0-9306-e35500020927', 'e6d504a7-75b3-11f0-9306-e35500020927', 'd44fd871-75b3-11f0-9306-e35500020927', 'شرکت نمونه 2', 3000000.00, 'IRR', 'pending', NULL, '2025-08-10 06:34:22', NULL, NULL, NULL, NULL, 'e6d50628-75b3-11f0-9306-e35500020927', 'فروشنده نمونه', '2025-08-10 06:34:22', '2025-08-10 06:34:22'),
('f805cb47-576a-4908-83db-acd1a0e50c6b', NULL, 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 2000000.00, 'IRR', 'paid', 'فروش', '2025-09-10 16:24:36', '2025-09-09 20:30:00', '2025-09-11 20:30:00', NULL, '۲۳', 'ceo-001', 'مهندس کریمی', '2025-09-10 16:24:36', '2025-09-10 16:24:36'),
('f8c88725-8123-42b7-8621-aaa02bf49490', NULL, 'fa49498b-75b6-11f0-9306-e35500020927', 'شرکت بازرگانی امید', 2000000.00, 'IRR', 'paid', 'فروش', '2025-09-10 16:24:35', '2025-09-09 20:30:00', '2025-09-11 20:30:00', NULL, '۲۳', 'ceo-001', 'مهندس کریمی', '2025-09-10 16:24:35', '2025-09-10 16:24:35'),
('fa808d21-34ab-4903-91ae-7887a095cb6c', NULL, '065b64dd-5b6e-4c16-a51e-6f752301c5c6', 'تست مشتری', 2000000.00, 'IRR', 'paid', 'ی', '2025-09-15 13:14:05', '2025-09-14 20:30:00', '2025-09-14 20:30:00', '..', '4432', 'ceo-001', 'مهندس کریمی', '2025-09-15 13:14:05', '2025-09-15 13:14:05'),
('feeab67f-c828-4d1e-bb71-541f3c21eeef', NULL, 'fa4949df-75b6-11f0-9306-e35500020927', 'کافه نت سینا', 2000000.00, 'IRR', 'paid', 'نقد', '2025-08-30 06:04:06', '2025-08-29 20:30:00', '2025-08-29 20:30:00', NULL, '۳۲', 'ceo-001', 'مهندس کریمی', '2025-08-30 06:04:06', '2025-08-30 06:04:06');

-- --------------------------------------------------------

--
-- Stand-in structure for view `sales_pipeline_report`
-- (See below for the actual view)
--
CREATE TABLE `sales_pipeline_report` (
`deal_id` varchar(36)
,`deal_title` varchar(255)
,`customer_name` varchar(255)
,`customer_segment` enum('enterprise','small_business','individual')
,`sales_person` varchar(255)
,`current_stage` varchar(100)
,`stage_order` int(11)
,`total_value` decimal(15,2)
,`probability` int(11)
,`expected_close_date` date
,`current_stage_entered_at` timestamp
,`next_follow_up_date` timestamp
,`days_in_current_stage` int(7)
,`status` varchar(8)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `sales_statistics`
-- (See below for the actual view)
--
CREATE TABLE `sales_statistics` (
`sale_date` date
,`total_sales` bigint(21)
,`total_revenue` decimal(37,2)
,`average_sale_value` decimal(19,6)
,`sales_person` varchar(255)
,`sales_person_id` varchar(36)
);

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
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

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `discount_percentage`, `total_price`, `created_at`) VALUES
('25e5dcf3-63d3-4ed8-a02d-435fb5fcb160', 'fa808d21-34ab-4903-91ae-7887a095cb6c', 'd66fe853-514d-4af7-adf9-5c3b14f91238', 'نمیدونم', 1, 2000000.00, 0.00, 2000000.00, '2025-09-15 13:14:05'),
('7032bbc5-d623-40fc-9df7-89647fdc3517', '0645eaaf-906c-4a89-8672-7b9aab6bc736', 'dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344', 'نرم افزار CRM', 1, 20000000.00, 0.00, 20000000.00, '2025-09-15 13:55:22'),
('ec4d0c1b-5cb6-4f29-b06d-4bc185e92003', '94ccee5c-773c-483f-adea-42db3691864a', 'dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344', 'نرم افزار CRM', 1, 30000000.00, 0.00, 30000000.00, '2025-09-15 16:17:44');

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

INSERT INTO `tasks` (`id`, `title`, `description`, `customer_id`, `deal_id`, `project_id`, `assigned_to`, `assigned_by`, `priority`, `status`, `category`, `due_date`, `created_at`, `updated_at`, `completed_at`, `completion_notes`, `attachments`) VALUES
('acb466e3-0cd3-49d5-8646-966cdb487c99', 'af', 'ada', NULL, NULL, NULL, '', 'ceo-001', 'medium', 'completed', 'follow_up', '2025-09-14 20:30:00', '2025-09-15 19:50:51', '2025-09-16 19:31:48', '2025-09-15 20:57:42', NULL, NULL),
('c43e6bc0-449e-456e-98fd-e51d8017a5ca', 'بسس', 'بسس', NULL, NULL, NULL, '', 'ceo-001', 'high', 'completed', 'follow_up', '2025-09-14 20:30:00', '2025-09-15 14:33:10', '2025-09-16 19:31:48', '2025-09-15 19:50:40', NULL, NULL),
('d1b1cda1-bdad-46c6-9d56-0b37f4ae7a35', 'تست', 'تست تر', NULL, NULL, NULL, '', 'ceo-001', 'high', 'completed', 'follow_up', '2025-09-12 20:30:00', '2025-09-11 10:42:49', '2025-09-16 19:31:48', '2025-09-11 10:43:54', 'بلع', NULL),
('da9b43c4-56c5-416a-9b2b-f8e5615fa213', ',h,', NULL, NULL, NULL, NULL, '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'ceo-001', 'medium', 'completed', 'follow_up', '2025-09-17 20:30:00', '2025-09-16 19:33:23', '2025-09-22 18:24:31', '2025-09-22 18:24:31', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task_assignees`
--

CREATE TABLE `task_assignees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `task_assignees`
--

INSERT INTO `task_assignees` (`id`, `task_id`, `user_id`, `assigned_at`, `assigned_by`) VALUES
('6509e89a-234f-4444-ab70-083ba915e4b0', 'da9b43c4-56c5-416a-9b2b-f8e5615fa213', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', '2025-09-16 19:33:23', 'ceo-001');

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
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('ceo','sales_manager','sales_agent','agent') DEFAULT 'sales_agent',
  `status` enum('active','inactive','away','online','offline') DEFAULT 'active',
  `avatar` varchar(500) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `team` varchar(100) DEFAULT NULL,
  `last_active` timestamp NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `status`, `avatar`, `avatar_url`, `phone`, `team`, `last_active`, `last_login`, `created_at`, `updated_at`, `created_by`) VALUES
('50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'احمد', 'rockygardner89@gmail.com', '$2a$12$M9MhJKMYNlxIJS/LSSpu8O75Sw.1Lg4i9CY1c0/on6MtKMHdTzLO2', 'agent', 'active', NULL, NULL, '123', NULL, '2025-08-10 07:09:41', '2025-08-29 14:17:28', '2025-08-10 07:09:41', '2025-08-29 14:17:53', 'ceo-001'),
('ceo-001', 'مهندس کریمی', 'Robintejarat@gmail.com', '$2a$10$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', 'ceo', 'active', '/uploads/avatars/ceo-001-1755615503750.png', NULL, '', NULL, '2025-07-20 04:57:32', '2025-09-08 10:30:05', '2025-07-20 04:57:32', '2025-09-08 10:30:05', NULL);

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
('0a4ff3b2-92f6-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0', '2025-09-16 12:09:48'),
('0ae512b2-92f0-11f0-8687-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:26:52'),
('12942e58-7cf7-11f0-9093-dc377bc569bf', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 15:23:41'),
('1fec73a9-7cfa-11f0-9093-dc377bc569bf', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-19 15:45:33'),
('26c823c6-92ef-11f0-8687-581122e4f0be', '50fdd768-8dbb-4161-a539-e9a4da40f6d2', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 11:20:29'),
('29c1b97f-92f8-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:24:59'),
('2d90f24f-92e4-11f0-8687-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 10:01:56'),
('3a6bfa4e-9272-11f0-8402-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-15 20:26:15'),
('3bc65529-92f7-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:18:20'),
('3bc6717e-92f7-11f0-b115-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 12:18:20'),
('3e7eee6f-90bd-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:18:12'),
('410fc636-90c1-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:46:54'),
('43bbf259-9333-11f0-bdbd-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-16 19:28:03'),
('4b72a438-90c0-11f0-b002-581122e4f0be', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36', '2025-09-13 16:40:02'),
('53c9bb36-7b87-11f0-93d3-e55f2cbc2ba2', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-17 16:52:21'),
('5f35f374-8408-11f0-902a-db316565c9c4', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 12:28:17'),
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
('f9a7c242-8411-11f0-902a-db316565c9c4', 'ceo-001', 'logout', 'کاربر از سیستم خارج شد', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36', '2025-08-28 15:27:56');

-- --------------------------------------------------------

--
-- Stand-in structure for view `user_interaction_performance`
-- (See below for the actual view)
--
CREATE TABLE `user_interaction_performance` (
`user_id` varchar(36)
,`user_name` varchar(255)
,`role` enum('ceo','sales_manager','sales_agent','agent')
,`total_interactions` bigint(21)
,`positive_interactions` bigint(21)
,`negative_interactions` bigint(21)
,`avg_interaction_duration` decimal(14,4)
,`phone_interactions` bigint(21)
,`email_interactions` bigint(21)
,`chat_interactions` bigint(21)
);

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
('ump-mfmpijdg', 'b9392a49-3288-4c27-848e-9f5753a3d698', 'mod-016', 1, '2025-09-16 11:57:36', '2025-09-16 11:57:36');

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
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer` (`customer_id`),
  ADD KEY `idx_performed_by` (`performed_by`),
  ADD KEY `idx_start_time` (`start_time`),
  ADD KEY `idx_type` (`type`);

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_resource_type` (`resource_type`),
  ADD KEY `idx_resource_id` (`resource_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `alerts`
--
ALTER TABLE `alerts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `deal_id` (`deal_id`);

--
-- Indexes for table `backup_history`
--
ALTER TABLE `backup_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_backup_status` (`status`),
  ADD KEY `idx_backup_type` (`type`),
  ADD KEY `idx_backup_created_at` (`created_at`);

--
-- Indexes for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_conversations_type` (`type`),
  ADD KEY `idx_conversations_last_message_at` (`last_message_at`),
  ADD KEY `idx_conversations_created_by` (`created_by`),
  ADD KEY `fk_last_message` (`last_message_id`),
  ADD KEY `fk_participant_1` (`participant_1_id`),
  ADD KEY `fk_participant_2` (`participant_2_id`);

--
-- Indexes for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `chat_group_members`
--
ALTER TABLE `chat_group_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_group_member` (`group_id`,`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_chat_sender` (`sender_id`),
  ADD KEY `idx_chat_receiver` (`receiver_id`);

--
-- Indexes for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_conversation_user` (`conversation_id`,`user_id`),
  ADD KEY `idx_participants_conversation_id` (`conversation_id`),
  ADD KEY `idx_participants_user_id` (`user_id`);

--
-- Indexes for table `chat_reactions`
--
ALTER TABLE `chat_reactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_message_user_emoji` (`message_id`,`user_id`,`emoji`),
  ADD KEY `idx_reactions_message_id` (`message_id`),
  ADD KEY `idx_reactions_user_id` (`user_id`);

--
-- Indexes for table `companies`
--
ALTER TABLE `companies`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_companies_name` (`name`),
  ADD KEY `idx_companies_status` (`status`),
  ADD KEY `idx_companies_assigned_to` (`assigned_to`),
  ADD KEY `idx_companies_created_by` (`created_by`);

--
-- Indexes for table `contacts`
--
ALTER TABLE `contacts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_contacts_company_id` (`company_id`),
  ADD KEY `idx_contacts_email` (`email`),
  ADD KEY `idx_contacts_full_name` (`full_name`),
  ADD KEY `idx_contacts_status` (`status`),
  ADD KEY `idx_contacts_assigned_to` (`assigned_to`),
  ADD KEY `idx_contacts_created_by` (`created_by`);
ALTER TABLE `contacts` ADD FULLTEXT KEY `full_name` (`full_name`,`email`,`notes`);

--
-- Indexes for table `contact_activities`
--
ALTER TABLE `contact_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_activities_contact_id` (`contact_id`),
  ADD KEY `idx_activities_company_id` (`company_id`),
  ADD KEY `idx_activities_type` (`activity_type`),
  ADD KEY `idx_activities_status` (`status`),
  ADD KEY `idx_activities_due_date` (`due_date`),
  ADD KEY `idx_activities_assigned_to` (`assigned_to`),
  ADD KEY `idx_activities_created_by` (`created_by`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_segment` (`segment`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `customer_current_stage`
--
ALTER TABLE `customer_current_stage`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer` (`customer_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_current_stage_id` (`current_stage_id`);

--
-- Indexes for table `customer_health`
--
ALTER TABLE `customer_health`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_health` (`customer_id`);

--
-- Indexes for table `customer_journey`
--
ALTER TABLE `customer_journey`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_stage_id` (`stage_id`),
  ADD KEY `idx_interaction_id` (`interaction_id`),
  ADD KEY `idx_entered_at` (`entered_at`);

--
-- Indexes for table `customer_journey_stages`
--
ALTER TABLE `customer_journey_stages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_stage_order` (`stage_order`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `customer_pipeline_progress`
--
ALTER TABLE `customer_pipeline_progress`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_stage` (`customer_id`,`stage_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_stage_id` (`stage_id`),
  ADD KEY `idx_completed_by` (`completed_by`);

--
-- Indexes for table `customer_tags`
--
ALTER TABLE `customer_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_customer_tag` (`customer_id`,`tag`);

--
-- Indexes for table `daily_reports`
--
ALTER TABLE `daily_reports`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_date` (`user_id`,`report_date`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_report_date` (`report_date`),
  ADD KEY `idx_persian_date` (`persian_date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_stage_id` (`stage_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_expected_close_date` (`expected_close_date`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `deal_products`
--
ALTER TABLE `deal_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_id` (`deal_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `deal_stage_history`
--
ALTER TABLE `deal_stage_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `deal_id` (`deal_id`),
  ADD KEY `stage_id` (`stage_id`),
  ADD KEY `changed_by` (`changed_by`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category_id` (`category_id`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`),
  ADD KEY `idx_parent_document_id` (`parent_document_id`),
  ADD KEY `idx_access_level` (`access_level`),
  ADD KEY `idx_status` (`status`);
ALTER TABLE `documents` ADD FULLTEXT KEY `idx_title_description` (`title`,`description`);

--
-- Indexes for table `document_activity_log`
--
ALTER TABLE `document_activity_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_action` (`action`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_parent_id` (`parent_id`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `document_comments`
--
ALTER TABLE `document_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_parent_comment_id` (`parent_comment_id`);

--
-- Indexes for table `document_permissions`
--
ALTER TABLE `document_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_document_permission` (`document_id`,`user_id`,`permission_type`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_granted_by` (`granted_by`);

--
-- Indexes for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_share_token` (`share_token`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_shared_by` (`shared_by`),
  ADD KEY `idx_shared_with_user_id` (`shared_with_user_id`);

--
-- Indexes for table `document_tags`
--
ALTER TABLE `document_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tag_name` (`name`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `document_tag_relations`
--
ALTER TABLE `document_tag_relations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_document_tag` (`document_id`,`tag_id`),
  ADD KEY `idx_document_id` (`document_id`),
  ADD KEY `idx_tag_id` (`tag_id`);

--
-- Indexes for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD PRIMARY KEY (`id`),
  ADD KEY `event_id` (`event_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `contact_id` (`contact_id`);

--
-- Indexes for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_event_participant` (`event_id`,`user_id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `event_reminders`
--
ALTER TABLE `event_reminders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_event_id` (`event_id`),
  ADD KEY `idx_method` (`method`),
  ADD KEY `idx_sent` (`sent`);

--
-- Indexes for table `feedback`
--
ALTER TABLE `feedback`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_sentiment` (`sentiment`);

--
-- Indexes for table `feedback_forms`
--
ALTER TABLE `feedback_forms`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `feedback_form_questions`
--
ALTER TABLE `feedback_form_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `form_id` (`form_id`);

--
-- Indexes for table `feedback_form_responses`
--
ALTER TABLE `feedback_form_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `submission_id` (`submission_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `feedback_form_submissions`
--
ALTER TABLE `feedback_form_submissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `token` (`token`);

--
-- Indexes for table `interactions`
--
ALTER TABLE `interactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_type` (`type`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_performed_by` (`performed_by`);

--
-- Indexes for table `interaction_attachments`
--
ALTER TABLE `interaction_attachments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_interaction_id` (`interaction_id`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `interaction_follow_ups`
--
ALTER TABLE `interaction_follow_ups`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_interaction_id` (`interaction_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `interaction_tags`
--
ALTER TABLE `interaction_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_interaction_tag` (`interaction_id`,`tag`),
  ADD KEY `idx_tag` (`tag`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `parent_id` (`parent_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_deal_id` (`deal_id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_created_by` (`created_by`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `note_tags`
--
ALTER TABLE `note_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_note_tag` (`note_id`,`tag`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_is_read` (`is_read`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_unread` (`user_id`,`is_read`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `pipeline_stages`
--
ALTER TABLE `pipeline_stages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `unique_stage_order` (`stage_order`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `product_discounts`
--
ALTER TABLE `product_discounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_manager_id` (`manager_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_start_date` (`start_date`),
  ADD KEY `projects_manager_id` (`manager_id`),
  ADD KEY `projects_created_by` (`created_by`),
  ADD KEY `projects_customer_id` (`customer_id`);

--
-- Indexes for table `project_members`
--
ALTER TABLE `project_members`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_member` (`project_id`,`user_id`),
  ADD KEY `project_members_project_id` (`project_id`),
  ADD KEY `project_members_user_id` (`user_id`),
  ADD KEY `project_members_assigned_by` (`assigned_by`);

--
-- Indexes for table `project_milestones`
--
ALTER TABLE `project_milestones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `project_id` (`project_id`);

--
-- Indexes for table `project_tags`
--
ALTER TABLE `project_tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_tag` (`project_id`,`tag`);

--
-- Indexes for table `project_team`
--
ALTER TABLE `project_team`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_project_user` (`project_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_deal_id` (`deal_id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_sales_person_id` (`sales_person_id`),
  ADD KEY `idx_sale_date` (`sale_date`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sale_id` (`sale_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `surveys`
--
ALTER TABLE `surveys`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `survey_questions`
--
ALTER TABLE `survey_questions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_id` (`survey_id`);

--
-- Indexes for table `survey_responses`
--
ALTER TABLE `survey_responses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `survey_id` (`survey_id`),
  ADD KEY `question_id` (`question_id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `system_logs`
--
ALTER TABLE `system_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_log_type` (`log_type`),
  ADD KEY `idx_log_created_at` (`created_at`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_deal_id` (`deal_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `tasks_project_id` (`project_id`);

--
-- Indexes for table `task_assignees`
--
ALTER TABLE `task_assignees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_task_user` (`task_id`,`user_id`),
  ADD KEY `idx_task_id` (`task_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `assigned_by` (`assigned_by`);

--
-- Indexes for table `task_comments`
--
ALTER TABLE `task_comments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task_id` (`task_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Indexes for table `task_files`
--
ALTER TABLE `task_files`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_task_id` (`task_id`),
  ADD KEY `idx_uploaded_by` (`uploaded_by`);

--
-- Indexes for table `task_steps`
--
ALTER TABLE `task_steps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `task_steps_task_id` (`task_id`),
  ADD KEY `task_steps_completed_by` (`completed_by`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`),
  ADD KEY `idx_assigned_to` (`assigned_to`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_priority` (`priority`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `ticket_updates`
--
ALTER TABLE `ticket_updates`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ticket_id` (`ticket_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_activities_user_id` (`user_id`),
  ADD KEY `idx_user_activities_type` (`activity_type`),
  ADD KEY `idx_user_activities_created` (`created_at`);

--
-- Indexes for table `user_modules`
--
ALTER TABLE `user_modules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_module` (`user_id`,`module_id`),
  ADD KEY `module_id` (`module_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `user_module_permissions`
--
ALTER TABLE `user_module_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_module` (`user_id`,`module_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_module_id` (`module_id`),
  ADD KEY `idx_granted` (`granted`);

--
-- Indexes for table `user_permissions`
--
ALTER TABLE `user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_permission` (`user_id`,`resource`,`action`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_targets`
--
ALTER TABLE `user_targets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_user_period` (`user_id`,`period`,`start_date`);

--
-- Indexes for table `voc_insights`
--
ALTER TABLE `voc_insights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_category` (`category`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_impact` (`impact`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `backup_history`
--
ALTER TABLE `backup_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_logs`
--
ALTER TABLE `system_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------

--
-- Structure for view `daily_interaction_stats`
--
DROP TABLE IF EXISTS `daily_interaction_stats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `daily_interaction_stats`  AS SELECT cast(`interactions`.`date` as date) AS `interaction_date`, `interactions`.`type` AS `type`, `interactions`.`direction` AS `direction`, `interactions`.`sentiment` AS `sentiment`, count(0) AS `interaction_count`, avg(`interactions`.`duration`) AS `avg_duration` FROM `interactions` WHERE `interactions`.`date` >= curdate() - interval 30 day GROUP BY cast(`interactions`.`date` as date), `interactions`.`type`, `interactions`.`direction`, `interactions`.`sentiment` ORDER BY cast(`interactions`.`date` as date) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `interaction_summary`
--
DROP TABLE IF EXISTS `interaction_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `interaction_summary`  AS SELECT `i`.`id` AS `id`, `i`.`customer_id` AS `customer_id`, `i`.`type` AS `type`, `i`.`subject` AS `subject`, `i`.`description` AS `description`, `i`.`direction` AS `direction`, `i`.`channel` AS `channel`, `i`.`date` AS `date`, `i`.`duration` AS `duration`, `i`.`outcome` AS `outcome`, `i`.`sentiment` AS `sentiment`, `i`.`performed_by` AS `performed_by`, `c`.`name` AS `customer_name`, `c`.`email` AS `customer_email`, `c`.`segment` AS `customer_segment`, `u`.`name` AS `performed_by_name`, count(`ia`.`id`) AS `attachment_count`, count(`it`.`id`) AS `tag_count`, count(`if2`.`id`) AS `follow_up_count` FROM (((((`interactions` `i` left join `customers` `c` on(`i`.`customer_id` = `c`.`id`)) left join `users` `u` on(`i`.`performed_by` = `u`.`id`)) left join `interaction_attachments` `ia` on(`i`.`id` = `ia`.`interaction_id`)) left join `interaction_tags` `it` on(`i`.`id` = `it`.`interaction_id`)) left join `interaction_follow_ups` `if2` on(`i`.`id` = `if2`.`interaction_id`)) GROUP BY `i`.`id` ;

-- --------------------------------------------------------

--
-- Structure for view `sales_pipeline_report`
--
DROP TABLE IF EXISTS `sales_pipeline_report`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `sales_pipeline_report`  AS SELECT `d`.`id` AS `deal_id`, `d`.`title` AS `deal_title`, `c`.`name` AS `customer_name`, `c`.`segment` AS `customer_segment`, `u`.`name` AS `sales_person`, `ps`.`name` AS `current_stage`, `ps`.`stage_order` AS `stage_order`, `d`.`total_value` AS `total_value`, `d`.`probability` AS `probability`, `d`.`expected_close_date` AS `expected_close_date`, `d`.`current_stage_entered_at` AS `current_stage_entered_at`, `d`.`next_follow_up_date` AS `next_follow_up_date`, to_days(current_timestamp()) - to_days(`d`.`current_stage_entered_at`) AS `days_in_current_stage`, CASE WHEN `d`.`expected_close_date` < current_timestamp() AND `ps`.`code` not in ('closed_won','closed_lost') THEN 'overdue' WHEN `d`.`expected_close_date` <= current_timestamp() + interval 7 day AND `ps`.`code` not in ('closed_won','closed_lost') THEN 'due_soon' ELSE 'on_track' END AS `status`, `d`.`created_at` AS `created_at`, `d`.`updated_at` AS `updated_at` FROM (((`deals` `d` left join `customers` `c` on(`d`.`customer_id` = `c`.`id`)) left join `users` `u` on(`d`.`assigned_to` = `u`.`id`)) left join `pipeline_stages` `ps` on(`d`.`stage_id` = `ps`.`id`)) ORDER BY `ps`.`stage_order` ASC, `d`.`created_at` ASC ;

-- --------------------------------------------------------

--
-- Structure for view `sales_statistics`
--
DROP TABLE IF EXISTS `sales_statistics`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `sales_statistics`  AS SELECT cast(`s`.`sale_date` as date) AS `sale_date`, count(0) AS `total_sales`, sum(`s`.`total_amount`) AS `total_revenue`, avg(`s`.`total_amount`) AS `average_sale_value`, `u`.`name` AS `sales_person`, `u`.`id` AS `sales_person_id` FROM (`sales` `s` left join `users` `u` on(`s`.`sales_person_id` = `u`.`id`)) GROUP BY cast(`s`.`sale_date` as date), `u`.`id`, `u`.`name` ORDER BY cast(`s`.`sale_date` as date) DESC ;

-- --------------------------------------------------------

--
-- Structure for view `user_interaction_performance`
--
DROP TABLE IF EXISTS `user_interaction_performance`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `user_interaction_performance`  AS SELECT `u`.`id` AS `user_id`, `u`.`name` AS `user_name`, `u`.`role` AS `role`, count(`i`.`id`) AS `total_interactions`, count(case when `i`.`sentiment` = 'positive' then 1 end) AS `positive_interactions`, count(case when `i`.`sentiment` = 'negative' then 1 end) AS `negative_interactions`, avg(`i`.`duration`) AS `avg_interaction_duration`, count(case when `i`.`type` = 'phone' then 1 end) AS `phone_interactions`, count(case when `i`.`type` = 'email' then 1 end) AS `email_interactions`, count(case when `i`.`type` = 'chat' then 1 end) AS `chat_interactions` FROM (`users` `u` left join `interactions` `i` on(`u`.`id` = `i`.`performed_by`)) WHERE `u`.`role` <> 'ceo' GROUP BY `u`.`id` ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `activity_log_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `alerts`
--
ALTER TABLE `alerts`
  ADD CONSTRAINT `alerts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alerts_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `alerts_ibfk_3` FOREIGN KEY (`deal_id`) REFERENCES `deals` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `calendar_events`
--
ALTER TABLE `calendar_events`
  ADD CONSTRAINT `calendar_events_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `calendar_events_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_conversations`
--
ALTER TABLE `chat_conversations`
  ADD CONSTRAINT `chat_conversations_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_last_message` FOREIGN KEY (`last_message_id`) REFERENCES `chat_messages` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_participant_1` FOREIGN KEY (`participant_1_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_participant_2` FOREIGN KEY (`participant_2_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `chat_groups`
--
ALTER TABLE `chat_groups`
  ADD CONSTRAINT `chat_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `chat_group_members`
--
ALTER TABLE `chat_group_members`
  ADD CONSTRAINT `chat_group_members_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `chat_groups` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_group_members_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_messages`
--
ALTER TABLE `chat_messages`
  ADD CONSTRAINT `chat_messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `chat_messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `chat_participants`
--
ALTER TABLE `chat_participants`
  ADD CONSTRAINT `chat_participants_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `chat_conversations` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `chat_reactions`
--
ALTER TABLE `chat_reactions`
  ADD CONSTRAINT `chat_reactions_ibfk_1` FOREIGN KEY (`message_id`) REFERENCES `chat_messages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chat_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `companies`
--
ALTER TABLE `companies`
  ADD CONSTRAINT `companies_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `companies_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `contacts`
--
ALTER TABLE `contacts`
  ADD CONSTRAINT `contacts_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `contacts_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `contact_activities`
--
ALTER TABLE `contact_activities`
  ADD CONSTRAINT `contact_activities_ibfk_1` FOREIGN KEY (`contact_id`) REFERENCES `contacts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `contact_activities_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `contact_activities_ibfk_3` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `contact_activities_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_current_stage`
--
ALTER TABLE `customer_current_stage`
  ADD CONSTRAINT `fk_ccs_current_stage_id` FOREIGN KEY (`current_stage_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ccs_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_health`
--
ALTER TABLE `customer_health`
  ADD CONSTRAINT `customer_health_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_journey`
--
ALTER TABLE `customer_journey`
  ADD CONSTRAINT `customer_journey_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `customer_journey_ibfk_2` FOREIGN KEY (`stage_id`) REFERENCES `customer_journey_stages` (`id`),
  ADD CONSTRAINT `customer_journey_ibfk_3` FOREIGN KEY (`interaction_id`) REFERENCES `interactions` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `customer_pipeline_progress`
--
ALTER TABLE `customer_pipeline_progress`
  ADD CONSTRAINT `fk_cpp_completed_by` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_cpp_customer_id` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cpp_stage_id` FOREIGN KEY (`stage_id`) REFERENCES `pipeline_stages` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `customer_tags`
--
ALTER TABLE `customer_tags`
  ADD CONSTRAINT `customer_tags_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `documents`
--
ALTER TABLE `documents`
  ADD CONSTRAINT `documents_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `documents_ibfk_3` FOREIGN KEY (`parent_document_id`) REFERENCES `documents` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `document_activity_log`
--
ALTER TABLE `document_activity_log`
  ADD CONSTRAINT `document_activity_log_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_activity_log_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_categories`
--
ALTER TABLE `document_categories`
  ADD CONSTRAINT `document_categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `document_categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `document_categories_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_comments`
--
ALTER TABLE `document_comments`
  ADD CONSTRAINT `document_comments_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_comments_ibfk_3` FOREIGN KEY (`parent_comment_id`) REFERENCES `document_comments` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_permissions`
--
ALTER TABLE `document_permissions`
  ADD CONSTRAINT `document_permissions_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_permissions_ibfk_3` FOREIGN KEY (`granted_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_shares`
--
ALTER TABLE `document_shares`
  ADD CONSTRAINT `document_shares_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_shares_ibfk_2` FOREIGN KEY (`shared_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_shares_ibfk_3` FOREIGN KEY (`shared_with_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `document_tags`
--
ALTER TABLE `document_tags`
  ADD CONSTRAINT `document_tags_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `document_tag_relations`
--
ALTER TABLE `document_tag_relations`
  ADD CONSTRAINT `document_tag_relations_ibfk_1` FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `document_tag_relations_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `document_tags` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_participants`
--
ALTER TABLE `event_participants`
  ADD CONSTRAINT `event_participants_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_participants_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `event_reminders`
--
ALTER TABLE `event_reminders`
  ADD CONSTRAINT `event_reminders_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `calendar_events` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `feedback_form_questions`
--
ALTER TABLE `feedback_form_questions`
  ADD CONSTRAINT `feedback_form_questions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `modules`
--
ALTER TABLE `modules`
  ADD CONSTRAINT `fk_module_parent` FOREIGN KEY (`parent_id`) REFERENCES `modules` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `user_activities`
--
ALTER TABLE `user_activities`
  ADD CONSTRAINT `fk_user_activities_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_modules`
--
ALTER TABLE `user_modules`
  ADD CONSTRAINT `fk_user_module_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_user_module_module` FOREIGN KEY (`module_id`) REFERENCES `modules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_user_module_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
