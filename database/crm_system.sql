-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: crm_system
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB-1:10.4.32+maria~ubu2004

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activities`
--

DROP TABLE IF EXISTS `activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_performed_by` (`performed_by`),
  KEY `idx_type` (`type`),
  KEY `idx_start_time` (`start_time`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_activities_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activities`
--

LOCK TABLES `activities` WRITE;
/*!40000 ALTER TABLE `activities` DISABLE KEYS */;
INSERT INTO `activities` VALUES ('763f8be6-bc9b-11f0-8607-581122e4f0be','rabin','2cbd912e-bc9b-11f0-8607-581122e4f0be',NULL,'meeting','جلسه با مشتری رابین','.','2025-11-08 12:07:13',NULL,NULL,'ceo-001','completed',NULL,NULL,'2025-11-08 12:07:13','2025-11-08 12:07:13');
/*!40000 ALTER TABLE `activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `activity_log`
--

DROP TABLE IF EXISTS `activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_log`
--

LOCK TABLES `activity_log` WRITE;
/*!40000 ALTER TABLE `activity_log` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alerts`
--

DROP TABLE IF EXISTS `alerts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alerts`
--

LOCK TABLES `alerts` WRITE;
/*!40000 ALTER TABLE `alerts` DISABLE KEYS */;
/*!40000 ALTER TABLE `alerts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backup_history`
--

DROP TABLE IF EXISTS `backup_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backup_history`
--

LOCK TABLES `backup_history` WRITE;
/*!40000 ALTER TABLE `backup_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `backup_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_events`
--

DROP TABLE IF EXISTS `calendar_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_start_date` (`start_date`),
  KEY `idx_status` (`status`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_calendar_events_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_events`
--

LOCK TABLES `calendar_events` WRITE;
/*!40000 ALTER TABLE `calendar_events` DISABLE KEYS */;
INSERT INTO `calendar_events` VALUES ('ecd5d77b-e251-4d44-96dc-d970c04d1497','rabin','تست',NULL,'2025-10-05 18:01:00','2025-10-05 19:01:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-04 18:01:32','2025-10-04 18:01:32'),('1cb21aa2-07f9-481d-a615-705584e86da5','rabin','تست',NULL,'2025-10-04 18:01:00','2025-10-04 19:01:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-04 18:01:37','2025-10-04 18:01:37'),('fb6210b0-49b2-4f11-a5f6-ba67a4103d3b','rabin','تستس',NULL,'2025-10-13 17:35:00','2025-10-13 18:35:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-11 17:35:13','2025-10-11 17:35:13'),('82c805f2-5ba9-4134-b16b-2a546854bd05','rabin','متشز',NULL,'2025-10-13 17:35:00','2025-10-13 18:35:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-11 17:35:21','2025-10-11 17:35:21'),('0a068c78-5825-4af2-9c68-4f5b956b492c','rabin','سب',NULL,'2025-09-30 17:35:00','2025-09-30 18:35:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-11 17:35:39','2025-10-11 17:35:39'),('2b9277e1-9e39-486d-961c-702bb521f5a7','rabin','تقویم',NULL,'2025-10-15 17:55:00','2025-10-15 18:55:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-11 17:55:22','2025-10-11 17:55:22'),('2c5c4987-ac38-11f0-87d1-581122e4f0be','rabin','adwad',NULL,'2025-10-18 19:06:00','2025-10-18 20:06:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-18 15:36:11','2025-10-18 15:36:11'),('7dd007ee-f075-4dbb-8452-e11c8128af93','rabin','awd',NULL,'2025-10-24 16:15:00','2025-10-24 17:15:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-10-24 16:15:43','2025-10-24 16:15:43'),('88b6566f-bc9b-11f0-8607-581122e4f0be','rabin','رویداد رابین',NULL,'2025-11-08 15:37:00','2025-11-08 16:37:00',0,'meeting',NULL,'confirmed',NULL,'ceo-001','2025-11-08 12:07:44','2025-11-08 12:07:44'),('efa6be4f-bc9d-11f0-8607-581122e4f0be','demo','.',NULL,'2025-11-08 15:54:00','2025-11-08 16:54:00',0,'meeting',NULL,'confirmed',NULL,'effaaff2-57b1-493e-8d47-83217067cf3e','2025-11-08 12:24:56','2025-11-08 12:24:56');
/*!40000 ALTER TABLE `calendar_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_conversations`
--

DROP TABLE IF EXISTS `chat_conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_chat_conversations_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_conversations`
--

LOCK TABLES `chat_conversations` WRITE;
/*!40000 ALTER TABLE `chat_conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_group_members`
--

DROP TABLE IF EXISTS `chat_group_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_group_members` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `group_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_group_members`
--

LOCK TABLES `chat_group_members` WRITE;
/*!40000 ALTER TABLE `chat_group_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_group_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_groups`
--

DROP TABLE IF EXISTS `chat_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_groups` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_groups`
--

LOCK TABLES `chat_groups` WRITE;
/*!40000 ALTER TABLE `chat_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_messages`
--

DROP TABLE IF EXISTS `chat_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `file_size` int(11) DEFAULT NULL,
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_chat_messages_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_messages`
--

LOCK TABLES `chat_messages` WRITE;
/*!40000 ALTER TABLE `chat_messages` DISABLE KEYS */;
INSERT INTO `chat_messages` VALUES ('fd32c952-ef7f-4a7b-a593-1e42dc8603b0','rabin','conv-9f6b90b9-0723-4261-82c3-cd54e21','ceo-001','9f6b90b9-0723-4261-82c3-cd54e21d3995','درود بر شما','text','2025-10-01 16:17:28',NULL,0,0,NULL,'2025-10-01 16:17:28',NULL,NULL,NULL,NULL),('1bb41325-68b7-4cd1-a847-f951a540b91b','rabin','conv-9f6b90b9-0723-4261-82c3-cd54e21','9f6b90b9-0723-4261-82c3-cd54e21d3995','ceo-001','سلام و درود','text','2025-10-01 16:26:41',NULL,0,0,NULL,'2025-10-01 16:26:41',NULL,NULL,NULL,NULL),('3884bbe8-b5d4-4dc4-b671-17c13e2ec5bd','rabin','conv-7481ac8e-b1be-11f0-9386-581122e','effaaff2-57b1-493e-8d47-83217067cf3e','7481ac8e-b1be-11f0-9386-581122e4f0be','.','text','2025-11-08 09:13:00',NULL,0,0,NULL,'2025-11-08 12:43:00',NULL,NULL,NULL,NULL),('5ebdc9a7-2ee1-4ac4-9d2f-4a896cc8d0a6','rabin','conv-7481ac8e-b1be-11f0-9386-581122e','effaaff2-57b1-493e-8d47-83217067cf3e','7481ac8e-b1be-11f0-9386-581122e4f0be','.','text','2025-11-08 09:13:02',NULL,0,0,NULL,'2025-11-08 12:43:02',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `chat_messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_participants`
--

DROP TABLE IF EXISTS `chat_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_participants` (
  `id` varchar(36) NOT NULL,
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `conversation_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('admin','member') DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp(),
  `last_seen_at` timestamp NULL DEFAULT current_timestamp(),
  `last_seen_message_id` varchar(36) DEFAULT NULL,
  `is_muted` tinyint(1) DEFAULT 0,
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_participants`
--

LOCK TABLES `chat_participants` WRITE;
/*!40000 ALTER TABLE `chat_participants` DISABLE KEYS */;
INSERT INTO `chat_participants` VALUES ('0f80e757-75b9-11f0-9338-e4580b2fcc71','rabin','cnv-me5cge1q','ceo-001','admin','2025-08-10 07:10:13','2025-08-10 07:10:13',NULL,0);
/*!40000 ALTER TABLE `chat_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `chat_reactions`
--

DROP TABLE IF EXISTS `chat_reactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `chat_reactions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `chat_reactions`
--

LOCK TABLES `chat_reactions` WRITE;
/*!40000 ALTER TABLE `chat_reactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `chat_reactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `companies`
--

DROP TABLE IF EXISTS `companies`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `companies`
--

LOCK TABLES `companies` WRITE;
/*!40000 ALTER TABLE `companies` DISABLE KEYS */;
/*!40000 ALTER TABLE `companies` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_activities`
--

DROP TABLE IF EXISTS `contact_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_activities`
--

LOCK TABLES `contact_activities` WRITE;
/*!40000 ALTER TABLE `contact_activities` DISABLE KEYS */;
/*!40000 ALTER TABLE `contact_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacts`
--

DROP TABLE IF EXISTS `contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_company_id` (`company_id`),
  KEY `idx_status` (`status`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_contacts_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacts`
--

LOCK TABLES `contacts` WRITE;
/*!40000 ALTER TABLE `contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_current_stage`
--

DROP TABLE IF EXISTS `customer_current_stage`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_current_stage` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `current_stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_current_stage`
--

LOCK TABLES `customer_current_stage` WRITE;
/*!40000 ALTER TABLE `customer_current_stage` DISABLE KEYS */;
INSERT INTO `customer_current_stage` VALUES ('d4ffabb0-91a7-11f0-9190-581122e4f0be','d44facc0-75b3-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d4ffcc0c-91a7-11f0-9190-581122e4f0be','d44fd871-75b3-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d4ffcce1-91a7-11f0-9190-581122e4f0be','fa490a71-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d4ffcd4e-91a7-11f0-9190-581122e4f0be','fa49480a-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d4ffcdb7-91a7-11f0-9190-581122e4f0be','fa49498b-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d4ffce4b-91a7-11f0-9190-581122e4f0be','fa4949df-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5000b76-91a7-11f0-9190-581122e4f0be','fa494b28-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5000c22-91a7-11f0-9190-581122e4f0be','fa494b85-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5000cb4-91a7-11f0-9190-581122e4f0be','fa494c4a-75b6-11f0-9306-e35500020927','stage-001','2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5000d2c-91a7-11f0-9190-581122e4f0be','fa494c98-75b6-11f0-9306-e35500020927','stage-003','2025-09-14 20:17:26','2025-09-15 18:43:15'),('d5000da1-91a7-11f0-9190-581122e4f0be','92df42e9-f691-4167-9358-2f9dfe41566d','stage-002','2025-09-14 20:17:26','2025-09-14 20:17:52'),('a90ffd2e-9e96-11f0-9ce7-66471fedf601','82ccda6c-5b96-49d5-a010-6446468f4cc3','stage-001','2025-10-01 07:17:16','2025-10-01 07:17:16'),('41e4f021-a7a7-11f0-b1c0-581122e4f0be','f8d09c82-82bc-49f1-98c3-e4266bd2d765','stage-001','2025-10-12 20:08:45','2025-10-12 20:08:45'),('f94eff7d-c557-11f0-adb4-7a654ee49283','2cbd912e-bc9b-11f0-8607-581122e4f0be','stage-001','2025-11-19 14:56:48','2025-11-19 14:56:48');
/*!40000 ALTER TABLE `customer_current_stage` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_health`
--

DROP TABLE IF EXISTS `customer_health`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_health`
--

LOCK TABLES `customer_health` WRITE;
/*!40000 ALTER TABLE `customer_health` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_health` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_journey`
--

DROP TABLE IF EXISTS `customer_journey`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_journey` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NULL DEFAULT current_timestamp(),
  `exited_at` timestamp NULL DEFAULT NULL,
  `interaction_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_journey`
--

LOCK TABLES `customer_journey` WRITE;
/*!40000 ALTER TABLE `customer_journey` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_journey` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_journey_stages`
--

DROP TABLE IF EXISTS `customer_journey_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_journey_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_journey_stages`
--

LOCK TABLES `customer_journey_stages` WRITE;
/*!40000 ALTER TABLE `customer_journey_stages` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_journey_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_pipeline_progress`
--

DROP TABLE IF EXISTS `customer_pipeline_progress`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_pipeline_progress`
--

LOCK TABLES `customer_pipeline_progress` WRITE;
/*!40000 ALTER TABLE `customer_pipeline_progress` DISABLE KEYS */;
INSERT INTO `customer_pipeline_progress` VALUES ('d0d6fde8-9263-11f0-9c8f-581122e4f0be','fa494c98-75b6-11f0-9306-e35500020927','stage-002',1,'2025-09-15 18:43:05','ceo-001','','2025-09-15 18:43:05','2025-09-15 18:43:05'),('d5028ad8-91a7-11f0-9190-581122e4f0be','fa490a71-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-01 06:30:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d50291e4-91a7-11f0-9190-581122e4f0be','fa49480a-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-02 08:00:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d50292ae-91a7-11f0-9190-581122e4f0be','fa49498b-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-03 10:45:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d502932a-91a7-11f0-9190-581122e4f0be','fa4949df-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-04 06:15:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d502939d-91a7-11f0-9190-581122e4f0be','fa494b28-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-05 12:50:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5029413-91a7-11f0-9190-581122e4f0be','fa494b85-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-06 05:00:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5029478-91a7-11f0-9190-581122e4f0be','fa494c4a-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-07 08:30:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d50294dd-91a7-11f0-9190-581122e4f0be','fa494c98-75b6-11f0-9306-e35500020927','stage-001',1,'2024-12-08 12:15:00',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5029548-91a7-11f0-9190-581122e4f0be','d44facc0-75b3-11f0-9306-e35500020927','stage-001',1,'2025-08-10 06:33:51',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d50295ac-91a7-11f0-9190-581122e4f0be','d44fd871-75b3-11f0-9306-e35500020927','stage-001',1,'2025-08-10 06:33:51',NULL,NULL,'2025-09-14 20:17:26','2025-09-14 20:17:26'),('d5029611-91a7-11f0-9190-581122e4f0be','92df42e9-f691-4167-9358-2f9dfe41566d','stage-001',1,'2025-09-14 20:17:46','ceo-001','','2025-09-14 20:17:26','2025-09-14 20:17:46'),('d7257ad9-9263-11f0-9c8f-581122e4f0be','fa494c98-75b6-11f0-9306-e35500020927','stage-003',1,'2025-09-15 18:43:15','ceo-001','','2025-09-15 18:43:15','2025-09-15 18:43:15'),('e4967d53-91a7-11f0-9190-581122e4f0be','92df42e9-f691-4167-9358-2f9dfe41566d','stage-002',1,'2025-09-14 20:17:52','ceo-001','','2025-09-14 20:17:52','2025-09-14 20:17:52'),('a90cd510-9e96-11f0-9ce7-66471fedf601','82ccda6c-5b96-49d5-a010-6446468f4cc3','stage-001',0,NULL,NULL,'','2025-10-01 07:17:16','2025-10-01 07:17:57'),('41e1c86a-a7a7-11f0-b1c0-581122e4f0be','f8d09c82-82bc-49f1-98c3-e4266bd2d765','stage-001',1,'2025-10-12 20:08:45','ceo-001','','2025-10-12 20:08:45','2025-10-12 20:08:45'),('f94b153b-c557-11f0-adb4-7a654ee49283','2cbd912e-bc9b-11f0-8607-581122e4f0be','stage-001',1,'2025-11-19 14:56:48','ceo-001','','2025-11-19 14:56:48','2025-11-19 14:56:48');
/*!40000 ALTER TABLE `customer_pipeline_progress` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_product_interests`
--

DROP TABLE IF EXISTS `customer_product_interests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_product` (`customer_id`,`product_id`),
  KEY `idx_customer_interests` (`customer_id`),
  KEY `idx_product_interests` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_product_interests`
--

LOCK TABLES `customer_product_interests` WRITE;
/*!40000 ALTER TABLE `customer_product_interests` DISABLE KEYS */;
INSERT INTO `customer_product_interests` VALUES ('14970bef-d4a9-4a44-b21b-92b6999a5ce4','0a1f7353-5dea-4250-ab6d-4c3997b2862e','ceb035fc-c022-4ed8-b040-50b342349522','medium',NULL,'2025-10-11 17:53:53','2025-10-11 17:53:53'),('e8e8bac9-1a55-44e9-959a-13f05d31a103','92c0e90e-3a30-4a62-a092-0a7b20649252','prod-001','medium',NULL,'2025-10-11 16:31:45','2025-10-11 16:31:45'),('int-001','15147929-6e36-42c5-b2bf-a6b2b1413292','prod-001','high','علاقه‌مند به خرید خط کامل تولید','2025-10-11 16:12:51','2025-10-11 16:12:51'),('int-002','15147929-6e36-42c5-b2bf-a6b2b1413292','prod-004','medium','نیاز به سیستم انتقال','2025-10-11 16:12:51','2025-10-11 16:12:51'),('int-003','13876975-2160-4903-acb0-53102d194d77','prod-002','high','نیاز فوری به میکسر','2025-10-11 16:12:51','2025-10-11 16:12:51'),('int-004','13876975-2160-4903-acb0-53102d194d77','prod-003','medium','آسیاب فعلی کارایی ندارد','2025-10-11 16:12:51','2025-10-11 16:12:51'),('int-005','18f05b00-f033-479d-b824-ceeb580377da','prod-002','low','در حال بررسی گزینه‌ها','2025-10-11 16:12:51','2025-10-11 16:12:51');
/*!40000 ALTER TABLE `customer_product_interests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_tag_relations`
--

DROP TABLE IF EXISTS `customer_tag_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_tag_relations` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_tag` (`customer_id`,`tag_id`),
  KEY `idx_customer_tags` (`customer_id`),
  KEY `idx_tag_customers` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='رابطه مشتری-برچسب';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_tag_relations`
--

LOCK TABLES `customer_tag_relations` WRITE;
/*!40000 ALTER TABLE `customer_tag_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_tag_relations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_tags`
--

DROP TABLE IF EXISTS `customer_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `customer_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_tags`
--

LOCK TABLES `customer_tags` WRITE;
/*!40000 ALTER TABLE `customer_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer_tags_new`
--

DROP TABLE IF EXISTS `customer_tags_new`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_tags_new` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_name` (`name`),
  KEY `idx_tags_usage` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='برچسب‌های مشتری جدید';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer_tags_new`
--

LOCK TABLES `customer_tags_new` WRITE;
/*!40000 ALTER TABLE `customer_tags_new` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_tags_new` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `lifecycle_stage` enum('subscriber','lead','marketing_qualified_lead','sales_qualified_lead','opportunity','customer','evangelist','other') DEFAULT 'lead' COMMENT 'مرحله چرخه حیات مشتری',
  KEY `idx_customers_industry` (`industry`),
  KEY `idx_customers_assigned_to` (`assigned_to`),
  KEY `idx_customers_status` (`status`),
  KEY `idx_customers_priority` (`priority`),
  KEY `idx_customers_segment` (`segment`),
  KEY `idx_customers_city` (`city`),
  KEY `idx_customers_state` (`state`),
  KEY `idx_customers_source` (`source`),
  KEY `idx_customers_lifecycle_stage` (`lifecycle_stage`),
  KEY `idx_customers_created_at` (`created_at`),
  KEY `idx_customers_last_activity` (`last_activity_date`),
  KEY `idx_customers_status_priority` (`status`,`priority`),
  KEY `idx_customers_first_name` (`first_name`),
  KEY `idx_customers_last_name` (`last_name`),
  KEY `idx_customers_company_name` (`company_name`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_customers_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES ('2cbd912e-bc9b-11f0-8607-581122e4f0be','rabin',NULL,NULL,NULL,'مشتری رابین',NULL,NULL,NULL,NULL,NULL,NULL,'Iran',NULL,NULL,NULL,NULL,'prospect','individual','medium',NULL,0,NULL,NULL,0.00,'2025-11-08 12:05:10','2025-11-19 14:56:48','2025-11-19 14:56:48',NULL,0,NULL,NULL,NULL,NULL,0,'lead');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `daily_reports`
--

DROP TABLE IF EXISTS `daily_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='گزارش‌های روزانه کاربران';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `daily_reports`
--

LOCK TABLES `daily_reports` WRITE;
/*!40000 ALTER TABLE `daily_reports` DISABLE KEYS */;
INSERT INTO `daily_reports` VALUES ('60927ef5-7b0e-4f99-bf6e-d888107dd9ce','rabin','9f6b90b9-0723-4261-82c3-cd54e21d3995','2025-10-01','۱۴۰۴/۰۷/۰۹','تست نرم افزار تموم شده و وارد مراحل دیپلوی شدم','[]',5.00,NULL,'حل مشکلات جزعی سیستم','submitted','2025-10-01 16:27:33','2025-10-01 16:27:33');
/*!40000 ALTER TABLE `daily_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deal_products`
--

DROP TABLE IF EXISTS `deal_products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deal_products` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `deal_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(15,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT 0.00,
  `total_price` decimal(15,2) NOT NULL,
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deal_products`
--

LOCK TABLES `deal_products` WRITE;
/*!40000 ALTER TABLE `deal_products` DISABLE KEYS */;
/*!40000 ALTER TABLE `deal_products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deal_stage_history`
--

DROP TABLE IF EXISTS `deal_stage_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deal_stage_history` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `deal_id` varchar(36) NOT NULL,
  `stage_id` varchar(36) NOT NULL,
  `entered_at` timestamp NULL DEFAULT current_timestamp(),
  `exited_at` timestamp NULL DEFAULT NULL,
  `changed_by` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deal_stage_history`
--

LOCK TABLES `deal_stage_history` WRITE;
/*!40000 ALTER TABLE `deal_stage_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `deal_stage_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deal_stages`
--

DROP TABLE IF EXISTS `deal_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `deal_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deal_stages`
--

LOCK TABLES `deal_stages` WRITE;
/*!40000 ALTER TABLE `deal_stages` DISABLE KEYS */;
INSERT INTO `deal_stages` VALUES ('stage-001','لید جدید','مشتری جدید شناسایی شده',1,0,20,'#6B7280',1,'2025-10-11 17:08:38'),('stage-002','تماس اولیه','اولین تماس با مشتری برقرار شده',2,20,40,'#3B82F6',1,'2025-10-11 17:08:38'),('stage-003','نیازسنجی','نیازهای مشتری شناسایی شده',3,40,60,'#F59E0B',1,'2025-10-11 17:08:38'),('stage-004','ارائه پیشنهاد','پیشنهاد قیمت ارائه شده',4,60,80,'#10B981',1,'2025-10-11 17:08:38'),('stage-005','مذاکره','در حال مذاکره نهایی',5,80,95,'#EF4444',1,'2025-10-11 17:08:38'),('stage-006','بسته شده - برنده','فروش موفق',6,100,100,'#059669',1,'2025-10-11 17:08:38'),('stage-007','بسته شده - بازنده','فروش ناموفق',7,0,0,'#DC2626',1,'2025-10-11 17:08:38');
/*!40000 ALTER TABLE `deal_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `deals`
--

DROP TABLE IF EXISTS `deals`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `competition_info` text DEFAULT NULL,
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_assigned_to` (`assigned_to`),
  KEY `idx_stage_id` (`stage_id`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_deals_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `deals`
--

LOCK TABLES `deals` WRITE;
/*!40000 ALTER TABLE `deals` DISABLE KEYS */;
INSERT INTO `deals` VALUES ('deal-001','rabin','0095c921-5a12-4e0b-bcbe-3f3b4810c40b','فروش نرم‌افزار CRM',NULL,50000000.00,'IRR','stage-005',70,'2025-11-15',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:32','2025-10-11 18:27:32','2025-10-11 18:27:32',NULL,NULL,NULL,NULL,NULL),('deal-002','rabin','018442c8-46db-4f8c-b4a9-fa8ff9e844dc','پروژه پیاده‌سازی سیستم',NULL,120000000.00,'IRR','stage-004',50,'2025-12-01',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:32','2025-10-11 18:27:32','2025-10-11 18:27:32',NULL,NULL,NULL,NULL,NULL),('deal-003','rabin','0da78725-536c-46f8-b7e7-3e704614066c','خرید محصولات',NULL,80000000.00,'IRR','stage-006',100,'2025-10-05',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:32','2025-10-11 18:27:32','2025-10-11 18:27:32',NULL,NULL,NULL,NULL,NULL),('deal-004','rabin','13876975-2160-4903-acb0-53102d194d77','قرارداد نگهداری',NULL,30000000.00,'IRR','stage-001',30,'2025-11-30',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:32','2025-10-11 18:27:32','2025-10-11 18:27:32',NULL,NULL,NULL,NULL,NULL),('deal-005','rabin','15147929-6e36-42c5-b2bf-a6b2b1413292','فروش لایسنس',NULL,45000000.00,'IRR','stage-005',60,'2025-11-20',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:32','2025-10-11 18:27:32','2025-10-11 18:27:32',NULL,NULL,NULL,NULL,NULL),('deal-001','rabin','0095c921-5a12-4e0b-bcbe-3f3b4810c40b','فروش نرم‌افزار CRM',NULL,50000000.00,'IRR','stage-005',70,'2025-11-15',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:55','2025-10-11 18:27:55','2025-10-11 18:27:55',NULL,NULL,NULL,NULL,NULL),('deal-002','rabin','018442c8-46db-4f8c-b4a9-fa8ff9e844dc','پروژه پیاده‌سازی سیستم',NULL,120000000.00,'IRR','stage-004',50,'2025-12-01',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:55','2025-10-11 18:27:55','2025-10-11 18:27:55',NULL,NULL,NULL,NULL,NULL),('deal-003','rabin','0da78725-536c-46f8-b7e7-3e704614066c','خرید محصولات',NULL,80000000.00,'IRR','stage-006',100,'2025-10-05',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:55','2025-10-11 18:27:55','2025-10-11 18:27:55',NULL,NULL,NULL,NULL,NULL),('deal-004','rabin','13876975-2160-4903-acb0-53102d194d77','قرارداد نگهداری',NULL,30000000.00,'IRR','stage-001',30,'2025-11-30',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:55','2025-10-11 18:27:55','2025-10-11 18:27:55',NULL,NULL,NULL,NULL,NULL),('deal-005','rabin','15147929-6e36-42c5-b2bf-a6b2b1413292','فروش لایسنس',NULL,45000000.00,'IRR','stage-005',60,'2025-11-20',NULL,'ceo-001',NULL,NULL,'2025-10-11 18:27:55','2025-10-11 18:27:55','2025-10-11 18:27:55',NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `deals` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_activity_log`
--

DROP TABLE IF EXISTS `document_activity_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_activity_log`
--

LOCK TABLES `document_activity_log` WRITE;
/*!40000 ALTER TABLE `document_activity_log` DISABLE KEYS */;
INSERT INTO `document_activity_log` VALUES ('06b25997-8c0b-11f0-a568-2c3b705dd50b','bed2e46e-c58c-4bd0-9212-c5298faf47b0','ceo-001','delete',NULL,'unknown',NULL,'2025-09-07 17:56:09'),('0ec289de-9162-11f0-8060-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:57:58'),('13965d80-915e-11f0-8060-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:29:29'),('14c99465-9162-11f0-8060-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:58:09'),('1c3923cb-a1ec-4372-9761-93205efc2be0','bed2e46e-c58c-4bd0-9212-c5298faf47b0','ceo-001','upload','{\"filename\":\"test-document.txt\",\"size\":35}','unknown',NULL,'2025-09-07 13:20:07'),('207816ae-9acb-11f0-bc57-581122e4f0be','d05645ac-84be-49f7-b782-e83b240a48d7','ceo-001','upload','{\"title\":\"medomics\",\"size\":15927,\"mime\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"}','unknown',NULL,'2025-09-26 11:22:46'),('2b38e84f-915f-11f0-8060-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:37:18'),('2b907b94-8cc2-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 15:58:03'),('2d9b3df6-8cab-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-08 12:36:10'),('2e577a7e-8bfd-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل\"}','unknown',NULL,'2025-09-07 16:03:03'),('3354f145-9161-11f0-8060-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:51:50'),('3e40ef43-8c05-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ با سرویس ایمیل جدید ارسال شد\"}','unknown',NULL,'2025-09-07 17:14:45'),('40cae408-8cc2-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-08 15:58:38'),('4523150a-8ca9-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-08 12:22:31'),('45f69ff8-9d50-11f0-8e7a-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','share','{\"emails\":[\"only.link086@gmail.com\",\"rockygardner89@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-29 16:20:54'),('48f3484f-8cb5-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 14:25:49'),('490c7fc4-8bfd-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد. این سند حاوی اطلاعات مهم آموزشی است.\"}','unknown',NULL,'2025-09-07 16:03:47'),('4ff38873-90b5-11f0-b002-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','upload','{\"title\":\"Screenshot 2025-09-13 131322\",\"size\":120058,\"mime\":\"image/png\"}','unknown',NULL,'2025-09-13 15:21:25'),('516d812d-918d-11f0-9190-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-14 17:07:39'),('51e5becf-918c-11f0-9190-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-14 17:00:30'),('55a8a091-8c1d-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-07 20:41:35'),('55aee9c3-90b5-11f0-b002-581122e4f0be','822362b3-4e9d-4bf2-836b-00a66fba997a','ceo-001','delete',NULL,'unknown',NULL,'2025-09-13 15:21:34'),('58e8a2e2-9ad3-11f0-bc57-581122e4f0be','8e38a856-f238-43bc-8a2c-471b68904f22','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-26 12:21:36'),('5a5177be-9ad3-11f0-bc57-581122e4f0be','d05645ac-84be-49f7-b782-e83b240a48d7','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-26 12:21:39'),('5ee42821-8cac-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 12:44:43'),('5f20c275-8cb5-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 14:26:26'),('611e0864-8bf9-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ - تست ارسال جدید\"}','unknown',NULL,'2025-09-07 15:35:50'),('61ac337c-8cd2-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','delete',NULL,'unknown',NULL,'2025-09-08 18:43:50'),('624aadba-9276-11f0-a782-581122e4f0be','484fec64-e334-42e9-9ba9-c3830eb871c3','ceo-001','download',NULL,'unknown',NULL,'2025-09-15 20:56:00'),('6293fbe1-9bbb-11f0-bcf6-581122e4f0be','70a05fb7-d83e-490a-a3c0-84d4bfd37d17','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-27 16:02:36'),('64412651-9d50-11f0-8e7a-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','share','{\"emails\":[\"only.link086@gmail.com\",\"rockygardner89@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-29 16:21:45'),('6686eae4-918d-11f0-9190-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-14 17:08:14'),('68b0f3a2-97e1-11f0-8035-aa7c082d9aee','484fec64-e334-42e9-9ba9-c3830eb871c3','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-22 18:24:42'),('7328a22d-1fee-409e-8133-7049a9ef656f','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','upload','{\"filename\":\"Ausbildung-Fachinformatiker-Systemintegration.pdf\",\"size\":432889}','unknown',NULL,'2025-09-07 14:00:04'),('76862666-8cbc-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-08 15:17:12'),('77d6bcb1-9d51-11f0-8e7a-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-29 16:29:27'),('77f59cd7-8cb6-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','download',NULL,'unknown',NULL,'2025-09-08 14:34:17'),('789176b4-926d-11f0-8402-581122e4f0be','484fec64-e334-42e9-9ba9-c3830eb871c3','ceo-001','upload','{\"title\":\"پروفایل\",\"size\":13123,\"mime\":\"image/png\"}','unknown',NULL,'2025-09-15 19:52:12'),('7c80d8d1-8cac-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"تست ارسال سند از API\",\"message\":\"این سند از طریق API ارسال شده است\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 12:45:33'),('7d9eef2d-9d64-11f0-8e7a-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"message\":\"\"}','unknown',NULL,'2025-09-29 18:45:37'),('7ea4d504-918a-11f0-9190-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-14 16:47:26'),('82c80fd3-8cbb-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-08 15:10:23'),('86e1ada0-9160-11f0-8060-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:47:01'),('8d9a7786-8bed-11f0-a568-2c3b705dd50b','bed2e46e-c58c-4bd0-9212-c5298faf47b0','ceo-001','share','{\"emails\":[\"test@example.com\"],\"permissionType\":\"view\",\"message\":\"سند تست برای شما\"}','unknown',NULL,'2025-09-07 13:21:24'),('8f5676ff-8cac-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\",\"only.link086@gmail.com\"],\"subject\":\"📄 سند MBTI با فایل ضمیمه\",\"message\":\"این سند نتیجه تست MBTI است که از طریق سیستم مدیریت اسناد ارسال شده است.\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 12:46:04'),('934595ea-9188-11f0-9190-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 16:33:42'),('94ab3b07-9e16-11f0-8bc5-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-30 16:00:26'),('9616fe45-8bf8-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ - Ausbildung Fachinformatiker Systemintegration\"}','unknown',NULL,'2025-09-07 15:30:09'),('97606778-9161-11f0-8060-581122e4f0be','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','share','{\"emails\":[\"rockygardner89@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 11:54:38'),('97c78f82-8cb9-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\".\"}','unknown',NULL,'2025-09-08 14:56:39'),('9c64b62d-8cb5-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"...\"}','unknown',NULL,'2025-09-08 14:28:09'),('a16d9d15-8bfc-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"سند آوسبیلدونگ برای شما ارسال شد\"}','unknown',NULL,'2025-09-07 15:59:06'),('a2e82c25-8c27-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','delete',NULL,'unknown',NULL,'2025-09-07 21:55:19'),('a48017c1-8cbc-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\".\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 15:18:29'),('a514301a-918b-11f0-9190-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-14 16:55:40'),('a775a876-9189-11f0-9190-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-14 16:41:25'),('a8189f4a-054b-416f-ac0e-9ec25cdae5ca','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','upload','{\"filename\":\"نتیجه-تست-mbti-مایرز-بریگز _ 9-4-1404.pdf\",\"size\":257825}','unknown',NULL,'2025-09-07 21:55:34'),('aba05320-8cb7-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"..\",\"message\":\"خختشرش\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 14:42:53'),('adbc0c0b-8c27-11f0-a568-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','download',NULL,'unknown',NULL,'2025-09-07 21:55:37'),('afafcb79-8c1f-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"تپششش\"}','unknown',NULL,'2025-09-07 20:58:25'),('b3267a28-8cac-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"download\",\"message\":\"\"}','unknown',NULL,'2025-09-08 12:47:04'),('b360ed83-8c27-11f0-a568-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"کپشییرشی\"}','unknown',NULL,'2025-09-07 21:55:47'),('ba4f4ab5-1d86-4e5b-a427-69ef45c19892','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','upload','{\"filename\":\"testfile.txt\",\"size\":28}','unknown',NULL,'2025-09-08 18:44:16'),('c6997509-9acc-11f0-bc57-581122e4f0be','8e38a856-f238-43bc-8a2c-471b68904f22','ceo-001','upload','{\"title\":\"medomics\",\"size\":15927,\"mime\":\"application/vnd.openxmlformats-officedocument.wordprocessingml.document\"}','unknown',NULL,'2025-09-26 11:34:34'),('cda1318a-8cb8-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 14:51:00'),('e1d67b43-8cbf-11f0-9c70-2c3b705dd50b','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"subject\":\"ahmadreza.avandi@gmail.com\",\"message\":\"No message\",\"includeAttachment\":true,\"failedEmails\":[]}','unknown',NULL,'2025-09-08 15:41:40'),('e598b967-9ac6-11f0-bc57-581122e4f0be','70a05fb7-d83e-490a-a3c0-84d4bfd37d17','ceo-001','upload','{\"title\":\"Screenshot 2025-09-23 010128\",\"size\":69018,\"mime\":\"image/png\"}','unknown',NULL,'2025-09-26 10:52:29'),('e9dbb7a1-918a-11f0-9190-581122e4f0be','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"\"}','unknown',NULL,'2025-09-14 16:50:26'),('ef1c5a97-9ac6-11f0-bc57-581122e4f0be','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','upload','{\"title\":\"_uploads_91_2023_Mar_07_وب بدون نمره\",\"size\":122689,\"mime\":\"application/pdf\"}','unknown',NULL,'2025-09-26 10:52:45'),('f54b074b-8bf7-11f0-a568-2c3b705dd50b','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','share','{\"emails\":[\"ahmadreza.avandi@gmail.com\"],\"permissionType\":\"view\",\"message\":\"فایل آوسبیلدونگ ارسال شده از سیستم CRM\"}','unknown',NULL,'2025-09-07 15:25:39'),('fac8bd2c-290b-4950-b4da-64403c8d6123','822362b3-4e9d-4bf2-836b-00a66fba997a','ceo-001','upload','{\"filename\":\"download.pdf\",\"size\":152611}','unknown',NULL,'2025-09-09 07:10:55'),('274c5add-9e3d-11f0-8ab2-a2d0d1a9e9d9','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-30 20:36:33'),('290ac56d-9e3d-11f0-8ab2-a2d0d1a9e9d9','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','delete','{\"reason\":\"user_request\"}','unknown',NULL,'2025-09-30 20:36:36'),('3f5aad4a-9e3d-11f0-8ab2-a2d0d1a9e9d9','8b3620b6-9cab-4e62-b099-69d7b0406574','ceo-001','upload','{\"title\":\"Screenshot 2025-09-15 192617\",\"size\":13123,\"mime\":\"image/png\"}','unknown',NULL,'2025-09-30 20:37:14'),('d7e7aa00-9e3d-11f0-8ab2-a2d0d1a9e9d9','633b416f-90d0-4c01-8360-0583e7b48609','ceo-001','upload','{\"title\":\"_uploads_91_2023_Mar_07_وب بدون نمره\",\"size\":122689,\"mime\":\"application/pdf\"}','unknown',NULL,'2025-09-30 20:41:30'),('3ecf897b-9e8e-11f0-9ce7-66471fedf601','2c5c04d0-8062-4391-88b0-43888435343d','ceo-001','upload','{\"title\":\"تفاهم نامه بسیج سازندگی 1docx\",\"size\":227737,\"mime\":\"application/pdf\"}','unknown',NULL,'2025-10-01 06:17:02'),('acdc16bb-a6cb-11f0-aea0-581122e4f0be','26b5a39a-2adb-4eff-903e-4fb1b89790cb','ceo-001','upload','{\"title\":\"sample-contacts\",\"size\":9614,\"mime\":\"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\"}','unknown',NULL,'2025-10-11 17:56:55'),('708e150a-a810-11f0-9c30-581122e4f0be','26b5a39a-2adb-4eff-903e-4fb1b89790cb','ceo-001','download',NULL,'unknown',NULL,'2025-10-13 08:41:40'),('63f0ae18-ab92-11f0-81d2-581122e4f0be','9d539b43-03de-4572-94df-c6995704f233','ceo-001','upload','{\"title\":\"001-040-C211288\",\"size\":1548667,\"mime\":\"application/pdf\"}','unknown',NULL,'2025-10-17 19:49:27'),('17661b2c-b365-11f0-948c-581122e4f0be','9e06cb2c-998d-435c-8043-a6e556839d01','ceo-001','upload','{\"title\":\"سند تستی - ۱۴۰۴/۸/۵, ۲۲:۱۵:۲۱\",\"size\":63,\"mime\":\"text/plain\"}','unknown',NULL,'2025-10-27 18:45:21'),('c00c6ad8-b368-11f0-948c-581122e4f0be','117a3ac0-634e-456f-810b-3437067b1561','ceo-001','upload','{\"title\":\"تست سند\",\"size\":36,\"mime\":\"text/plain\"}','unknown',NULL,'2025-10-27 19:11:32'),('5d52c653-b417-11f0-9ee1-581122e4f0be','04b23c6d-33ed-46b8-9aa9-7e3e6b33ec91','ceo-001','upload','{\"title\":\"Screenshot 2025-10-27 125059\",\"size\":407289,\"mime\":\"image/png\"}','unknown',NULL,'2025-10-28 16:01:29');
/*!40000 ALTER TABLE `document_activity_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_categories`
--

DROP TABLE IF EXISTS `document_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_categories`
--

LOCK TABLES `document_categories` WRITE;
/*!40000 ALTER TABLE `document_categories` DISABLE KEYS */;
INSERT INTO `document_categories` VALUES ('cat-contracts','قراردادها','قراردادهای مختلف شرکت',NULL,'#10B981','file-contract',1,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-images','تصاویر','تصاویر و عکس‌ها',NULL,'#06B6D4','photograph',6,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-invoices','فاکتورها','فاکتورهای فروش و خرید',NULL,'#F59E0B','receipt',2,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-other','سایر','سایر اسناد',NULL,'#6B7280','document',7,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-policies','سیاست‌ها','سیاست‌ها و رویه‌های شرکت',NULL,'#8B5CF6','shield-check',4,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-presentations','ارائه‌ها','فایل‌های ارائه و پرزنتیشن',NULL,'#EF4444','presentation-chart-bar',5,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08'),('cat-reports','گزارشات','گزارشات مختلف',NULL,'#3B82F6','chart-bar',3,1,'ceo-001','2025-09-06 18:24:08','2025-09-06 18:24:08');
/*!40000 ALTER TABLE `document_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_comments`
--

DROP TABLE IF EXISTS `document_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_comments`
--

LOCK TABLES `document_comments` WRITE;
/*!40000 ALTER TABLE `document_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_files`
--

DROP TABLE IF EXISTS `document_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_files` (
  `id` int(11) NOT NULL,
  `document_id` varchar(255) NOT NULL,
  `content` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_files`
--

LOCK TABLES `document_files` WRITE;
/*!40000 ALTER TABLE `document_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_permissions`
--

DROP TABLE IF EXISTS `document_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_permissions`
--

LOCK TABLES `document_permissions` WRITE;
/*!40000 ALTER TABLE `document_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_shares`
--

DROP TABLE IF EXISTS `document_shares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_shares`
--

LOCK TABLES `document_shares` WRITE;
/*!40000 ALTER TABLE `document_shares` DISABLE KEYS */;
INSERT INTO `document_shares` VALUES ('0190ed71-a555-4c32-b87b-b0f4fffcf995','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','0ae12288-a2be-4028-b68c-d222f39f7ebb','view',NULL,NULL,1,0,NULL,'2025-09-14 11:58:08'),('05baeecb-0c50-494e-91e7-0dcb9f997905','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','6b41a509-33e5-40d4-b695-d84d83ad4b36','view',NULL,NULL,1,0,NULL,'2025-09-14 11:37:18'),('0a957531-38ba-4a8a-88a5-47ce99b54a31','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','ahmadreza.avandi@gmail.com',NULL,'83483f27-0923-4a23-bf94-b61f47c0d497','view',NULL,NULL,1,0,NULL,'2025-09-14 16:33:32'),('1f3ed7c2-ad66-4dff-8c4b-5026b4b2c997','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','ahmadreza.avandi@gmail.com',NULL,'775d8a10-3628-4b80-a73a-6c1d2ef45172','view',NULL,NULL,1,0,NULL,'2025-09-14 17:08:05'),('2099abd8-8ec7-46d5-a7be-d1158c5258f1','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','ahmadreza.avandi@gmail.com',NULL,'4506012a-8715-4148-aa6f-51fad9f83398','view',NULL,NULL,1,0,NULL,'2025-09-14 17:00:22'),('25a317a8-4af9-422e-8a67-44620ed6952e','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'f9f7bf9b-f03b-4635-ab8a-2117a65662e9','view',NULL,NULL,1,0,NULL,'2025-09-08 15:10:19'),('2a454546-86a9-4583-82bf-7c5625ede53f','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'a45a1f03-a753-464e-8199-445296e18720','view','.',NULL,1,0,NULL,'2025-09-08 14:34:50'),('2d90b8e5-5237-4571-8ae8-83ba296e7261','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'cfb239d7-8509-403a-924c-bcf7ccf950ac','view',NULL,NULL,1,0,NULL,'2025-09-08 12:36:08'),('2fff8475-32cb-4962-9a28-626db766dda6','bed2e46e-c58c-4bd0-9212-c5298faf47b0','ceo-001','test@example.com',NULL,'bdd2ae25-5183-492d-9164-13b0bf6d792d','view','سند تست برای شما','2025-09-14 13:21:24',1,0,NULL,'2025-09-07 13:21:24'),('41389036-e526-4a69-8d8f-27b6c2e1b2d1','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','c30355d8-0058-467f-a653-b68b2b1a0756','view',NULL,'2025-09-15 11:29:27',1,0,NULL,'2025-09-14 11:29:27'),('4e8858ba-6efa-4c67-89dd-f7774e01fb6b','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','5f2240e3-0031-4d8d-b503-3a882be4ea6a','view',NULL,NULL,1,0,NULL,'2025-09-29 16:20:52'),('574ca028-d726-4caf-9894-ce6fa47ebb41','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','only.link086@gmail.com',NULL,'d4cf29ac-f09d-4f7b-9c02-43545e4403ef','view',NULL,NULL,1,0,NULL,'2025-09-29 16:21:40'),('69f99523-82b1-4d4a-a287-81daede2a77a','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'7acb20a0-bfb1-4771-9285-dba1b750aac7','view','...',NULL,1,0,NULL,'2025-09-08 14:28:06'),('6a6510a2-79bb-49b5-a994-2713726131c3','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'065ec468-4f7f-47e8-96e0-3b544e159013','download',NULL,NULL,1,0,NULL,'2025-09-08 15:17:09'),('70d9e140-6df9-4021-9e62-40b2553c8ec4','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','1354a556-e89e-40d1-ac8f-7f5224dd79e7','download',NULL,NULL,1,0,NULL,'2025-09-14 11:51:50'),('73560bc2-65d1-4f7d-9ba8-be231d7413d8','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','b3b91c47-b41a-41ea-a2bb-edb5594f5943','view',NULL,NULL,1,0,NULL,'2025-09-29 18:45:32'),('88dc7261-723d-45a3-aab7-1598335ec0e7','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'81e9c634-e5d6-4e41-bb36-2ae89c68df5b','view',NULL,NULL,1,0,NULL,'2025-09-07 20:41:32'),('92ac81ab-35fe-421a-92e6-ce8dbad32aea','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'ed087977-63ab-4f3c-a961-9676ce13555b','view','فایل آوسبیلدونگ - Ausbildung Fachinformatiker Systemintegration','2025-10-07 15:30:09',1,0,NULL,'2025-09-07 15:30:09'),('a4bfc410-a2b9-4d39-8cc3-8d24ce8ca7c9','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','c2b13558-9d5f-42ec-b033-08464d33dd7a','view',NULL,NULL,1,0,NULL,'2025-09-14 11:54:38'),('a669d07b-2a50-4e8b-aea2-c0bee375c08f','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','c1a48149-7d6c-4842-9a05-a9914dd0ff3e','view',NULL,NULL,1,0,NULL,'2025-09-14 11:47:01'),('a9233b87-4f84-4a1d-a865-41a85f3e1e53','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','9f89492e-0510-4fba-912d-42d5e6987710','download','سند آوسبیلدونگ برای شما ارسال شد. این سند حاوی اطلاعات مهم آموزشی است.','2025-10-07 16:03:46',1,0,NULL,'2025-09-07 16:03:46'),('b64837b2-3ae0-4c0a-b65a-22723d532fd4','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'08d401d2-b616-487d-b617-dfc5ba0dfac1','view',NULL,NULL,1,0,NULL,'2025-09-08 12:22:27'),('b8133df4-543b-4a0f-8771-2718467ab4b5','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'32dd1984-72cf-49db-83db-f432bb701e00','download','سند آوسبیلدونگ برای شما ارسال شد','2025-10-07 15:59:06',1,0,NULL,'2025-09-07 15:59:06'),('b9feee4a-4478-45b7-8139-add3f639a291','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'39b44473-e39f-4a35-939e-376c9d0edc4f','view','کپشییرشی',NULL,1,0,NULL,'2025-09-07 21:55:46'),('bd9a84b8-78dd-4e3b-b03e-b0e5e5fff053','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','ahmadreza.avandi@gmail.com',NULL,'e3b22ff6-dabc-4c56-903c-2c72ca5219e5','download',NULL,NULL,1,0,NULL,'2025-09-14 16:41:19'),('bde9bc51-c4f1-4c3d-bf65-f491a155a397','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','dec6d666-f2de-45b5-b178-9d078d003b5a','download','سند آوسبیلدونگ با سرویس ایمیل جدید ارسال شد','2025-10-07 17:14:42',1,0,NULL,'2025-09-07 17:14:42'),('c05591e4-dd22-4c9e-be56-b3726d757155','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','d9c2f40c-5134-4a74-8afb-abf543067607','view',NULL,NULL,1,0,NULL,'2025-09-14 11:57:58'),('c1179a3e-690d-4823-9941-859bbb385ff7','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','only.link086@gmail.com',NULL,'7c4a9c09-8b46-4313-afe3-795da7f654cf','view',NULL,NULL,1,0,NULL,'2025-09-29 16:20:50'),('c56ada7b-d2d2-4973-ad7b-b7d7bf6e25cc','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'73466602-5be9-46de-bafd-276c57e26a6f','download','.',NULL,1,0,NULL,'2025-09-08 14:56:36'),('cc40e406-15b5-4e07-8b6f-3510239e9f54','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'9ef7aa86-470b-4764-91e2-efdd7098d4be','view','فایل آوسبیلدونگ ارسال شده از سیستم CRM','2025-10-07 15:25:39',1,0,NULL,'2025-09-07 15:25:39'),('d10d492d-3a35-448b-800a-9091870d1efb','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','ahmadreza.avandi@gmail.com',NULL,'801b428e-95f9-4a45-ba0a-335b410289d7','download',NULL,NULL,1,0,NULL,'2025-09-14 16:46:40'),('d3c25558-e4e5-444e-ba72-03aa1e899fb9','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','ahmadreza.avandi@gmail.com',NULL,'44284160-206e-4ab5-9c02-dc4dc849eb8b','download',NULL,NULL,1,0,NULL,'2025-09-14 16:55:13'),('d86520ef-444b-4bcb-ae0d-105274e174e8','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'51561b67-4a3f-4552-86b7-d8d980228865','download','سند آوسبیلدونگ برای شما ارسال شد - تست ایمیل','2025-10-07 16:03:01',1,0,NULL,'2025-09-07 16:03:01'),('da9ec7ed-f570-4fc5-99e6-7388a98089e0','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','54e167b2-d33e-450b-87cf-c6e98be41737','view',NULL,NULL,1,0,NULL,'2025-09-29 16:21:43'),('de814991-2782-4104-b18e-e02765b69399','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'49588e33-19f7-4e78-a44f-a6900faa3f5c','view','تپششش',NULL,1,0,NULL,'2025-09-07 20:58:22'),('df094f9b-fb75-4f62-b0c7-db2158cee714','6442e412-19bd-460a-9786-716bf0f838fa','ceo-001','ahmadreza.avandi@gmail.com',NULL,'efab8b0c-0b50-48bf-97f3-1a69ab69ef16','view',NULL,NULL,1,0,NULL,'2025-09-14 17:07:24'),('e93159d8-69e2-4420-935d-4db6dd0eef03','2883b968-dfdf-4912-bc7e-9196e9371e45','ceo-001','rockygardner89@gmail.com','50fdd768-8dbb-4161-a539-e9a4da40f6d2','aaf93496-558f-4a8e-b9fd-db4ef31f57f9','view',NULL,NULL,1,0,NULL,'2025-09-29 16:29:00'),('ed7deef5-52e1-4903-bfe9-0ed3b4b8f35f','36f5618a-c1b3-4e45-869f-d989de1298be','ceo-001','ahmadreza.avandi@gmail.com',NULL,'586af2da-ba6d-4640-929a-a1b47b3587d2','view',NULL,NULL,1,0,NULL,'2025-09-14 16:50:18'),('efcc139c-fe17-4a25-943a-31cf8bbcd0da','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'521e8c33-9af1-46e0-9548-99a8b830f3c0','download',NULL,NULL,1,0,NULL,'2025-09-08 12:47:02'),('f2dfe286-ad5e-4691-8648-9a73d08c1337','074241db-04a3-46cf-a903-322bceeb7d8c','ceo-001','ahmadreza.avandi@gmail.com',NULL,'0853725b-5691-4953-b746-7106884e1ddb','view',NULL,NULL,1,0,NULL,'2025-09-08 15:58:36'),('f396785e-3be5-4f14-b937-cf2c4507d46a','e0c7e8c5-18ae-415b-90aa-d8f36e2244f2','ceo-001','ahmadreza.avandi@gmail.com',NULL,'3200b59c-427c-48d1-a42b-8116f4c8371d','view','فایل آوسبیلدونگ - تست ارسال جدید','2025-10-07 15:35:49',1,0,NULL,'2025-09-07 15:35:49');
/*!40000 ALTER TABLE `document_shares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_tag_relations`
--

DROP TABLE IF EXISTS `document_tag_relations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_tag_relations` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `document_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='رابطه اسناد و برچسب‌ها';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_tag_relations`
--

LOCK TABLES `document_tag_relations` WRITE;
/*!40000 ALTER TABLE `document_tag_relations` DISABLE KEYS */;
/*!40000 ALTER TABLE `document_tag_relations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `document_tags`
--

DROP TABLE IF EXISTS `document_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `document_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#6B7280',
  `description` text DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='برچسب‌های اسناد';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_tags`
--

LOCK TABLES `document_tags` WRITE;
/*!40000 ALTER TABLE `document_tags` DISABLE KEYS */;
INSERT INTO `document_tags` VALUES ('tag-approved','تایید شده','#10B981','اسناد تایید شده',0,'ceo-001','2025-09-06 18:24:08'),('tag-archived','بایگانی','#6B7280','اسناد بایگانی شده',0,'ceo-001','2025-09-06 18:24:08'),('tag-confidential','محرمانه','#7C2D12','اسناد محرمانه',0,'ceo-001','2025-09-06 18:24:08'),('tag-draft','پیش‌نویس','#F59E0B','اسناد در حال تدوین',0,'ceo-001','2025-09-06 18:24:08'),('tag-urgent','فوری','#EF4444','اسناد فوری',0,'ceo-001','2025-09-06 18:24:08');
/*!40000 ALTER TABLE `document_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documents`
--

DROP TABLE IF EXISTS `documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_documents_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='اسناد اصلی';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documents`
--

LOCK TABLES `documents` WRITE;
/*!40000 ALTER TABLE `documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_attendees`
--

DROP TABLE IF EXISTS `event_attendees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_attendees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `event_id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `contact_id` varchar(36) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `response` enum('pending','accepted','declined','maybe') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_attendees`
--

LOCK TABLES `event_attendees` WRITE;
/*!40000 ALTER TABLE `event_attendees` DISABLE KEYS */;
/*!40000 ALTER TABLE `event_attendees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_participants`
--

DROP TABLE IF EXISTS `event_participants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_participants` (
  `id` varchar(36) NOT NULL,
  `event_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `response` enum('pending','accepted','declined','tentative') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_participants`
--

LOCK TABLES `event_participants` WRITE;
/*!40000 ALTER TABLE `event_participants` DISABLE KEYS */;
INSERT INTO `event_participants` VALUES ('part-001','event-001','ceo-001','accepted','2025-09-10 22:41:11'),('part-002','event-002','ceo-001','accepted','2025-09-10 22:41:11'),('part-003','event-004','ceo-001','pending','2025-09-10 22:41:11');
/*!40000 ALTER TABLE `event_participants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_reminders`
--

DROP TABLE IF EXISTS `event_reminders`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `event_reminders` (
  `id` varchar(36) NOT NULL,
  `event_id` varchar(36) NOT NULL,
  `method` enum('popup','email','sms') DEFAULT 'popup',
  `minutes_before` int(11) NOT NULL DEFAULT 15,
  `sent` tinyint(1) DEFAULT 0,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_reminders`
--

LOCK TABLES `event_reminders` WRITE;
/*!40000 ALTER TABLE `event_reminders` DISABLE KEYS */;
INSERT INTO `event_reminders` VALUES ('483de9b3-b005-4bd3-8e18-40f20f59d5d8','8cffe079-c60e-4357-b9da-a40462590e74','popup',15,0,NULL,'2025-09-30 17:05:26'),('53467a21-e69e-4ae2-bf42-85c8b5b84450','5e1dd51e-12eb-48d5-91bc-9366f05b4088','popup',15,0,NULL,'2025-09-22 16:10:39'),('576284fd-e8bb-43ea-80a5-8e2aa7deb656','4abe30c7-797b-4eeb-b607-23b53868c44e','popup',15,0,NULL,'2025-09-22 16:08:02'),('82b9f6b4-5dd2-4222-b96e-0966507c5bae','4ce6e3e1-39b9-46d7-a58a-ece70e4f3657','popup',15,0,NULL,'2025-09-30 15:59:11'),('8409c21d-44fb-4ea8-94b5-7a17521f4094','2c436379-aca5-4ad0-ad18-5403bf435f2e','popup',15,0,NULL,'2025-09-22 16:08:25'),('8f3392a9-4cd1-4fd6-8e82-29e8dafd4ffc','cedb2b33-c814-427c-8c4f-2447b932753d','popup',15,0,NULL,'2025-09-15 19:51:10'),('b5f51ffa-88cb-4f4f-b2e6-fa143bcaa0c7','99ce4b59-5d11-4ed2-985b-6c6ae0396302','popup',15,0,NULL,'2025-09-26 11:34:46'),('c19fde0f-c03f-42f8-8b15-0faaf08c5687','fa205095-d854-42ce-a2c2-3d6006052a44','popup',15,0,NULL,'2025-09-29 17:26:18'),('fc23b85c-4a3f-4cee-8f5b-3136f04a0285','e5fffdb7-8b16-475f-92da-36a1d24f68d7','popup',15,0,NULL,'2025-09-25 12:07:40'),('rem-001','event-001','popup',15,0,NULL,'2025-09-10 22:41:11'),('rem-002','event-001','email',60,0,NULL,'2025-09-10 22:41:11'),('rem-003','event-002','popup',10,0,NULL,'2025-09-10 22:41:11'),('rem-004','event-003','popup',5,0,NULL,'2025-09-10 22:41:11'),('rem-005','event-004','popup',30,0,NULL,'2025-09-10 22:41:11'),('e106aef9-8d59-43b8-addf-ec7d8ebb53b6','ecd5d77b-e251-4d44-96dc-d970c04d1497','popup',15,0,NULL,'2025-10-04 18:01:32'),('943f5a16-04a7-421a-9c11-497d072d0e8d','1cb21aa2-07f9-481d-a615-705584e86da5','popup',15,0,NULL,'2025-10-04 18:01:37'),('51ad96c9-f27f-4766-9629-a51e927a8d67','fb6210b0-49b2-4f11-a5f6-ba67a4103d3b','popup',15,0,NULL,'2025-10-11 17:35:13'),('4f63bd2a-131a-4251-a7a9-bcda665dcafc','82c805f2-5ba9-4134-b16b-2a546854bd05','popup',15,0,NULL,'2025-10-11 17:35:21'),('7578c29f-4fd6-4af7-aad3-aae22906e9ab','0a068c78-5825-4af2-9c68-4f5b956b492c','popup',15,0,NULL,'2025-10-11 17:35:39'),('95fa244f-aecc-4e0c-86d9-8032fc8c12c4','2b9277e1-9e39-486d-961c-702bb521f5a7','popup',15,0,NULL,'2025-10-11 17:55:22'),('352669bc-3c4a-403d-ae35-acf0eae11942','7dd007ee-f075-4dbb-8452-e11c8128af93','popup',15,0,NULL,'2025-10-24 16:15:44');
/*!40000 ALTER TABLE `event_reminders` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback`
--

DROP TABLE IF EXISTS `feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `resolved_at` timestamp NULL DEFAULT NULL,
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_feedback_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback`
--

LOCK TABLES `feedback` WRITE;
/*!40000 ALTER TABLE `feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_form_questions`
--

DROP TABLE IF EXISTS `feedback_form_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_form_questions`
--

LOCK TABLES `feedback_form_questions` WRITE;
/*!40000 ALTER TABLE `feedback_form_questions` DISABLE KEYS */;
INSERT INTO `feedback_form_questions` VALUES ('q-001','form-001','چقدر از فرآیند فروش ما رضایت دارید؟','rating','{\"max\": 5}',1,1,'2025-08-09 20:22:46'),('q-002','form-001','چه چیزی در فرآیند فروش ما نیاز به بهبود دارد؟','textarea',NULL,1,2,'2025-08-09 20:22:46'),('q-003','form-002','چقدر از کیفیت محصول ما رضایت دارید؟','rating','{\"max\": 5}',1,1,'2025-08-09 20:22:46'),('q-004','form-002','چه ویژگیهایی به محصول ما اضافه شود؟','textarea',NULL,0,2,'2025-08-09 20:22:46'),('q-product-3','form-002','آیا محصول با توضیحات ارائه شده مطابقت داشت؟','choice','{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، متفاوت بود\"]}',1,3,'2025-08-10 06:13:02'),('q-product-4','form-002','نسبت کیفیت به قیمت محصول را چگونه ارزیابی می‌کنید؟','choice','{\"options\": [\"عالی\", \"خوب\", \"متوسط\", \"ضعیف\"]}',1,4,'2025-08-10 06:13:02'),('q-product-5','form-002','آیا استفاده از محصول آسان بود؟','choice','{\"options\": [\"بله، بسیار آسان\", \"نسبتاً آسان\", \"کمی دشوار\", \"بسیار دشوار\"]}',1,5,'2025-08-10 06:13:02'),('q-product-6','form-002','آیا این محصول را به دیگران پیشنهاد می‌دهید؟','choice','{\"options\": [\"بله، حتماً\", \"احتمالاً\", \"خیر\"]}',1,6,'2025-08-10 06:13:02'),('q-sales-3','form-001','آیا کارشناس فروش اطلاعات کافی درباره محصولات داشت؟','choice','{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، اطلاعات کافی نداشت\"]}',1,3,'2025-08-10 06:13:02'),('q-sales-4','form-001','سرعت پاسخگویی تیم فروش به درخواست‌های شما چگونه بود؟','choice','{\"options\": [\"بسیار سریع\", \"مناسب\", \"کند\", \"بسیار کند\"]}',1,4,'2025-08-10 06:13:02'),('q-sales-5','form-001','آیا فرآیند خرید ساده و روان بود؟','choice','{\"options\": [\"بله، کاملاً\", \"تا حدودی\", \"خیر، پیچیده بود\"]}',1,5,'2025-08-10 06:13:02'),('q-sales-6','form-001','آیا مایل به خرید مجدد از ما هستید؟','choice','{\"options\": [\"بله، حتماً\", \"احتمالاً\", \"خیر\"]}',1,6,'2025-08-10 06:13:02');
/*!40000 ALTER TABLE `feedback_form_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_form_responses`
--

DROP TABLE IF EXISTS `feedback_form_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedback_form_responses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `submission_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `response` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_form_responses`
--

LOCK TABLES `feedback_form_responses` WRITE;
/*!40000 ALTER TABLE `feedback_form_responses` DISABLE KEYS */;
INSERT INTO `feedback_form_responses` VALUES ('2e31c7fc-eaa9-48c2-8211-91445b46543f','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-sales-4','مناسب','2025-09-15 18:06:17'),('3f9d85c4-0003-416e-9513-1797512aeab0','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-001','5','2025-09-15 18:06:17'),('4dab3981-f294-44ce-9b9b-3648d7851ca7','58e57e51-68fd-451c-b8f5-a5758c61620f','q-product-4','عالی','2025-08-10 06:17:45'),('5fcfa7b9-591a-4b03-9f47-b6bd14582ccf','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-002','هیچی','2025-09-15 18:06:17'),('79d828bb-6c76-4c5f-a82a-99a4cb5d2e82','58e57e51-68fd-451c-b8f5-a5758c61620f','q-004','نمیدونم','2025-08-10 06:17:45'),('7e8c62ba-707f-41d6-b7ac-914cf22e6359','58e57e51-68fd-451c-b8f5-a5758c61620f','q-product-5','نسبتاً آسان','2025-08-10 06:17:45'),('95070ea4-38d9-4956-9deb-75f9ad0d772f','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-sales-5','بله، کاملاً','2025-09-15 18:06:17'),('a4370be4-9fdb-4b87-9acc-97afa56b97b0','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-sales-6','بله، حتماً','2025-09-15 18:06:17'),('abd55c2b-9441-4681-8d8d-653f92590feb','58e57e51-68fd-451c-b8f5-a5758c61620f','q-product-6','احتمالاً','2025-08-10 06:17:45'),('dc4e8f3d-7c5c-494b-b91c-1318b7750cea','58e57e51-68fd-451c-b8f5-a5758c61620f','q-003','5','2025-08-10 06:17:45'),('eb492db5-dace-4915-9a2c-4bbea269a220','58e57e51-68fd-451c-b8f5-a5758c61620f','q-product-3','بله، کاملاً','2025-08-10 06:17:45'),('ec53c5a9-2516-4d4a-90c4-b0ff5503c2c4','96ca27dd-6715-4f80-8e6e-7691138c2e4a','q-sales-3','بله، کاملاً','2025-09-15 18:06:17');
/*!40000 ALTER TABLE `feedback_form_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_form_submissions`
--

DROP TABLE IF EXISTS `feedback_form_submissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_form_submissions`
--

LOCK TABLES `feedback_form_submissions` WRITE;
/*!40000 ALTER TABLE `feedback_form_submissions` DISABLE KEYS */;
INSERT INTO `feedback_form_submissions` VALUES ('06560a85-8a6d-40da-96ce-86505a8f943f','form-002','cnt-me4piwag','7bc6a34b9c8d5f51acf0ef07bfa6d39252c6420b315925fecec8cb85ffe1b304','pending',NULL,NULL,'2025-08-10 05:00:53','2025-08-10 05:00:53'),('10295bb9-82c4-4a44-b8a5-d73f2d43d530','form-001','cnt-me4piwag','2c9800fba3db1181d8a47a09aa0d6cc89630d2fdd62fe761ff2c21bd0136e37c','pending','198924e9dbd96d1a',NULL,'2025-08-10 04:48:00','2025-08-10 04:48:02'),('2d45105d-f9c0-4f69-aa63-4abb8f531d2f','form-001','cnt-me4piwag','af039eff69857404297808b3af8d722a9afe55a07e49aed9433f987f23ba4a9d','pending',NULL,NULL,'2025-09-15 17:50:47','2025-09-15 17:50:47'),('31b6ec41-3a95-43bc-bcb6-eaacac4d6046','form-002','cnt-me4piwag','31b6ec41-3a95-43bc-bcb6-eaacac4d6046','pending',NULL,NULL,'2025-09-29 18:44:42','2025-09-29 18:44:42'),('402b0d17-543b-4130-97e0-b33ba4006733','form-002','cnt-me4piwag','c45abaf2a8cbaaed0391528c8f90897d139d17226490238b3939c7cf26d3f83f','pending',NULL,NULL,'2025-09-22 18:28:21','2025-09-22 18:28:21'),('4882de58-5fe8-43e9-b42b-4ddad91e93ed','form-001','cnt-me4piwag','10b30b796631a9f47e4f6b61e1eea66a76c4518215f9de74f4282831addfc040','pending',NULL,NULL,'2025-08-09 20:38:58','2025-08-09 20:38:58'),('4aa69f26-1376-443f-903b-17c705ca35c5','form-001','cnt-me4piwag','f79eff47a052a726540985bf743a4e9e82901bbd33a434572c632b9c56a321f1','pending',NULL,NULL,'2025-09-15 17:37:45','2025-09-15 17:37:45'),('58e57e51-68fd-451c-b8f5-a5758c61620f','form-002','cnt-me4piwag','9bc5eb444348bf930de12b4f2a5b50802812cde3f6c7734179c202e2fe587ec7','completed','198925c9024918f9','2025-08-10 06:17:45','2025-08-10 05:03:00','2025-08-10 06:17:45'),('6027377a-709a-4b14-83d4-54271cb57862','form-002','cnt-me4piwag','e90678cd116d6ea4eb9e334dda68283ee16ea39c856a65baf8ed001c63831980','pending','198926f516b6b2c9',NULL,'2025-08-10 05:23:44','2025-08-10 05:23:45'),('7e99a2c8-fcc7-4ad3-88cc-547bee72b519','form-001','cnt-me4piwag','27155ff33355143b1f077523ea6618a7b3c1e1f4d236ab8d1505ce60529ee664','pending',NULL,NULL,'2025-08-09 21:10:44','2025-08-09 21:10:44'),('9261de73-80f2-4f2b-ac72-67c97b952e01','form-001','cnt-me4piwag','a4f1602458af5150e5c7ba15a1bdc4c9390eac4dbad3f7623e618441379be383','pending',NULL,NULL,'2025-08-10 05:23:30','2025-08-10 05:23:30'),('96ca27dd-6715-4f80-8e6e-7691138c2e4a','form-001','cnt-me4piwag','df9a7e537fc23eeed8c0f8af2bf5dedf8653a54f2be16ebebb0a23ab467591f4','completed',NULL,'2025-09-15 18:06:17','2025-09-15 18:03:59','2025-09-15 18:06:17'),('96d90ad9-f5ec-40f5-859b-9fec1e249a2b','form-002','cnt-me4piwag','5b4272473c28d668dd436e1cea096c3f3fd2e349735dc732b4f3d34d605cabbe','pending',NULL,NULL,'2025-09-22 18:22:55','2025-09-22 18:22:55'),('a45ab9eb-0614-449c-816c-f51a49b9ddd3','form-001','cnt-me4piwag','a45ab9eb-0614-449c-816c-f51a49b9ddd3','pending',NULL,NULL,'2025-09-29 16:47:28','2025-09-29 16:47:28'),('a96d0908-8f82-4a33-b4b5-1f2bbed2ff2c','form-001','cnt-me4piwag','3d42013d7603a36524ab9a509d922d0d705daf00853c2a54d1c089f6e681e415','pending','19890a654e931213',NULL,'2025-08-09 21:04:35','2025-08-09 21:04:36'),('c1354bda-62ed-474c-9652-ae61d47252ef','form-001','cnt-me4piwag','8ec9a0dfad982b44a0483b1a40cc042e229c98a71802916dc0922a3d36dd7ffd','pending',NULL,NULL,'2025-08-09 20:28:48','2025-08-09 20:28:48'),('e38c216e-59b0-45f4-b8dd-d508b32547de','form-001','cnt-me4piwag','f6a480ad94c66fbd2661f9cae4a2b3fd0c5ee1ad7a391055239c4ebf48b152ee','pending',NULL,NULL,'2025-09-16 19:31:08','2025-09-16 19:31:08'),('e4b13463-6b41-4d39-bb4c-445e7ab0a6a1','form-001','cnt-me4piwag','4d4737f89e3139977561b398058ca28163e24fa2866aabaec10ca2f346211cb4','pending',NULL,NULL,'2025-08-09 20:41:10','2025-08-09 20:41:10'),('e6d8b4cd-fb0c-4352-a7a5-3b612c24c9a4','form-001','cnt-me4piwag','6421a3948aed9f76793119f3700e4faf68c465c3f1a76c462a8bb04d5cff6e8c','pending','198926a4326761c0',NULL,'2025-08-10 05:18:13','2025-08-10 05:18:14'),('e9062285-658a-4676-b3f7-7ce8abfa70ab','form-001','cnt-me4piwag','f3f348cb843e09880cc61206f00903f6de6dba15b978062132fb0c5dfb95771b','pending','19890952812a17b5',NULL,'2025-08-09 20:45:50','2025-08-09 20:45:51'),('test-submission-1','form-001','test-customer','test-token-123','pending',NULL,NULL,'2025-08-10 06:14:54','2025-08-10 06:14:54'),('22d95467-214c-4d1a-a593-25e7538ccd32','form-001','cnt-mfll6vr6','22d95467-214c-4d1a-a593-25e7538ccd32','pending',NULL,NULL,'2025-09-30 19:27:57','2025-09-30 19:27:57'),('01ddb66d-c11d-41b9-9586-c5bcac6e02e3','form-002','cnt-me4piwag','01ddb66d-c11d-41b9-9586-c5bcac6e02e3','pending',NULL,NULL,'2025-09-30 20:05:51','2025-09-30 20:05:51');
/*!40000 ALTER TABLE `feedback_form_submissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_forms`
--

DROP TABLE IF EXISTS `feedback_forms`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_forms`
--

LOCK TABLES `feedback_forms` WRITE;
/*!40000 ALTER TABLE `feedback_forms` DISABLE KEYS */;
INSERT INTO `feedback_forms` VALUES ('form-001','نظرسنجی رضایت از فرآیند فروش','لطفا درباره تجربه خرید خود از ما نظر دهید','sales','default','active','2025-08-09 20:22:16','2025-08-09 20:22:16'),('form-002','نظرسنجی کیفیت محصول','نظر شما درباره کیفیت محصولات ما چیست؟','product','default','active','2025-08-09 20:22:16','2025-08-09 20:22:16');
/*!40000 ALTER TABLE `feedback_forms` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `feedback_responses`
--

DROP TABLE IF EXISTS `feedback_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedback_responses`
--

LOCK TABLES `feedback_responses` WRITE;
/*!40000 ALTER TABLE `feedback_responses` DISABLE KEYS */;
INSERT INTO `feedback_responses` VALUES ('13baad81-b06a-42e0-91f3-3356fb22ba71','form-001','cnt-me4piwag','only.link086@gmail.com','احمدرضا آوندی','https://crm.robintejarat.com/feedback/respond/13baad81-b06a-42e0-91f3-3356fb22ba71','pending',NULL,NULL,'2025-09-29 16:18:28','2025-09-29 16:18:28'),('3b366f39-4b67-4fd7-8b3b-d64f62b14b86','form-001','cnt-me4piwag','only.link086@gmail.com','احمدرضا آوندی','https://crm.robintejarat.com/feedback/respond/3b366f39-4b67-4fd7-8b3b-d64f62b14b86','pending',NULL,NULL,'2025-09-29 16:18:06','2025-09-29 16:18:06'),('d334729e-4957-4dd1-9126-fec1372bc847','form-001','cnt-me4piwag','only.link086@gmail.com','احمدرضا آوندی','https://crm.robintejarat.com/feedback/respond/d334729e-4957-4dd1-9126-fec1372bc847','pending',NULL,NULL,'2025-09-29 16:33:25','2025-09-29 16:33:25');
/*!40000 ALTER TABLE `feedback_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interaction_attachments`
--

DROP TABLE IF EXISTS `interaction_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interaction_attachments`
--

LOCK TABLES `interaction_attachments` WRITE;
/*!40000 ALTER TABLE `interaction_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `interaction_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interaction_follow_ups`
--

DROP TABLE IF EXISTS `interaction_follow_ups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interaction_follow_ups`
--

LOCK TABLES `interaction_follow_ups` WRITE;
/*!40000 ALTER TABLE `interaction_follow_ups` DISABLE KEYS */;
/*!40000 ALTER TABLE `interaction_follow_ups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interaction_summary`
--

DROP TABLE IF EXISTS `interaction_summary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interaction_summary`
--

LOCK TABLES `interaction_summary` WRITE;
/*!40000 ALTER TABLE `interaction_summary` DISABLE KEYS */;
/*!40000 ALTER TABLE `interaction_summary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interaction_tags`
--

DROP TABLE IF EXISTS `interaction_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `interaction_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `interaction_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interaction_tags`
--

LOCK TABLES `interaction_tags` WRITE;
/*!40000 ALTER TABLE `interaction_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `interaction_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `interactions`
--

DROP TABLE IF EXISTS `interactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `performed_by` varchar(36) DEFAULT NULL,
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `interactions`
--

LOCK TABLES `interactions` WRITE;
/*!40000 ALTER TABLE `interactions` DISABLE KEYS */;
/*!40000 ALTER TABLE `interactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `modules`
--

DROP TABLE IF EXISTS `modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `modules`
--

LOCK TABLES `modules` WRITE;
/*!40000 ALTER TABLE `modules` DISABLE KEYS */;
INSERT INTO `modules` VALUES ('mod-001','dashboard','داشبورد','صفحه اصلی سیستم','/dashboard','LayoutDashboard',NULL,1,1,'2025-09-16 15:37:49'),('mod-002','settings','تنظیمات سیستم','تنظیمات کلی سیستم','/dashboard/settings','Settings',NULL,2,1,'2025-09-16 15:37:49'),('mod-003','system-monitoring','مانیتورینگ سیستم','نظارت بر عملکرد سیستم','/dashboard/system-monitoring','Monitor',NULL,4,1,'2025-09-16 15:37:49'),('mod-004','customers','مشتریان','مدیریت مشتریان','/dashboard/customers','Users',NULL,10,1,'2025-09-16 15:37:49'),('mod-005','contacts','مخاطبین','مدیریت مخاطبین','/dashboard/contacts','Contact',NULL,11,1,'2025-09-16 15:37:49'),('mod-006','customer-club','باشگاه مشتریان','مدیریت باشگاه مشتریان','/dashboard/customer-club','Users',NULL,12,1,'2025-09-16 15:37:49'),('mod-007','feedback','بازخوردها','مدیریت بازخوردها','/dashboard/feedback','MessageCircle',NULL,13,1,'2025-09-16 15:37:49'),('mod-008','sales','فروش','مدیریت فروش','/dashboard/sales','TrendingUp',NULL,20,1,'2025-09-16 15:37:49'),('mod-009','products','محصولات','مدیریت محصولات','/dashboard/products','Package',NULL,21,1,'2025-09-16 15:37:49'),('mod-010','deals','معاملات','مدیریت معاملات','/dashboard/deals','Briefcase',NULL,22,1,'2025-09-16 15:37:49'),('mod-011','documents','مدیریت اسناد','مدیریت اسناد و مدارک','/dashboard/documents','FileText',NULL,23,1,'2025-09-16 15:37:49'),('mod-012','coworkers','همکاران','مدیریت همکاران','/dashboard/coworkers','Users2',NULL,30,1,'2025-09-16 15:37:49'),('mod-013','activities','فعالیت‌ها','مدیریت فعالیت‌ها','/dashboard/activities','Activity',NULL,31,1,'2025-09-16 15:37:49'),('mod-014','calendar','تقویم','مدیریت تقویم','/dashboard/calendar','Calendar',NULL,32,1,'2025-09-16 15:37:49'),('mod-015','chat','چت','سیستم پیام‌رسانی داخلی','/dashboard/chat','MessageCircle',NULL,33,1,'2025-09-16 15:37:49'),('mod-016','reports','گزارش‌ها','گزارشات سیستم','/dashboard/reports','BarChart3',NULL,40,1,'2025-09-16 15:37:49'),('mod-017','daily-reports','گزارش‌های روزانه','گزارشات روزانه','/dashboard/daily-reports','FileText',NULL,41,1,'2025-09-16 15:37:49'),('mod-018','reports-analysis','تحلیل گزارشات','تحلیل گزارشات','/dashboard/insights/reports-analysis','BarChart3',NULL,42,1,'2025-09-16 15:37:49'),('mod-019','feedback-analysis','تحلیل بازخوردها','تحلیل بازخوردها','/dashboard/insights/feedback-analysis','MessageCircle',NULL,43,1,'2025-09-16 15:37:49'),('mod-020','sales-analysis','تحلیل فروش','تحلیل فروش','/dashboard/insights/sales-analysis','TrendingUp',NULL,44,1,'2025-09-16 15:37:49'),('mod-021','audio-analysis','تحلیل صوتی','تحلیل صوتی مکالمات','/dashboard/insights/audio-analysis','Mic2',NULL,3,1,'2025-09-16 15:37:49'),('mod-022','tasks','وظایف','مدیریت وظایف','/dashboard/tasks','CheckSquare',NULL,46,1,'2025-09-16 15:37:49'),('mod-023','profile','پروفایل','پروفایل کاربری','/dashboard/profile','User',NULL,50,1,'2025-09-16 15:37:49'),('demo-001','dashboard','داشبورد',NULL,'/dashboard','LayoutDashboard',NULL,1,1,'2025-10-24 17:28:45'),('demo-002','customers','مشتریان',NULL,'/dashboard/customers','Users',NULL,2,1,'2025-10-24 17:28:45'),('demo-003','contacts','مخاطبین',NULL,'/dashboard/contacts','UserCheck',NULL,3,1,'2025-10-24 17:28:45'),('demo-004','activities','فعالیت‌ها',NULL,'/dashboard/activities','Activity',NULL,4,1,'2025-10-24 17:28:45'),('demo-005','coworkers','همکاران',NULL,'/dashboard/coworkers','Users2',NULL,5,1,'2025-10-24 17:28:45'),('demo-006','tasks','وظایف',NULL,'/dashboard/tasks','Target',NULL,6,1,'2025-10-24 17:28:45'),('demo-007','calendar','تقویم',NULL,'/dashboard/calendar','Calendar',NULL,7,1,'2025-10-24 17:28:45'),('demo-008','sales','فروش‌ها',NULL,'/dashboard/sales','TrendingUp',NULL,8,1,'2025-10-24 17:28:45'),('demo-009','deals','معاملات',NULL,'/dashboard/deals','Briefcase',NULL,9,1,'2025-10-24 17:28:45'),('demo-010','products','محصولات',NULL,'/dashboard/products','Package',NULL,10,1,'2025-10-24 17:28:45'),('demo-011','reports','گزارش‌ها',NULL,'/dashboard/reports','BarChart3',NULL,11,1,'2025-10-24 17:28:45'),('demo-012','documents','مدیریت اسناد',NULL,'/dashboard/documents','FileText',NULL,12,1,'2025-10-24 17:28:45'),('demo-013','chat','چت',NULL,'/dashboard/chat','MessageCircle',NULL,13,1,'2025-10-24 17:28:45'),('demo-014','customer-club','باشگاه مشتریان',NULL,'/dashboard/customer-club','Users',NULL,14,1,'2025-10-24 17:28:45'),('demo-015','feedback','بازخوردها',NULL,'/dashboard/feedback','MessageCircle2',NULL,15,1,'2025-10-24 17:28:45');
/*!40000 ALTER TABLE `modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `note_tags`
--

DROP TABLE IF EXISTS `note_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `note_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `note_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `note_tags`
--

LOCK TABLES `note_tags` WRITE;
/*!40000 ALTER TABLE `note_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `note_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notes`
--

DROP TABLE IF EXISTS `notes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notes`
--

LOCK TABLES `notes` WRITE;
/*!40000 ALTER TABLE `notes` DISABLE KEYS */;
/*!40000 ALTER TABLE `notes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
INSERT INTO `notifications` VALUES ('01bc997f-da29-41b6-810a-98a1877cb478','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','chat_message','پیام جدید','پیام جدید از Robintejarat@gmail.com',NULL,NULL,1,'2025-08-28 15:28:19','2025-08-28 11:47:30','2025-08-28 15:28:19'),('09dff2d2-2ea8-4af2-985e-665295bed94c','rabin','ceo-001','task_completed','✅ وظیفه تکمیل شد: af','وظیفه \"af\" توسط مهندس کریمی تکمیل شد','acb466e3-0cd3-49d5-8646-966cdb487c99','task',1,'2025-09-15 20:58:22','2025-09-15 17:27:42','2025-09-15 20:58:22'),('118dc133-4ebc-457e-a8ed-a21b8c795ebd','rabin','ceo-001','task_completed','✅ وظیفه تکمیل شد: ,h,','وظیفه \",h,\" توسط مهندس کریمی تکمیل شد','da9b43c4-56c5-416a-9b2b-f8e5615fa213','task',1,'2025-09-30 15:42:00','2025-09-22 18:24:31','2025-09-30 15:42:00'),('1d3b0f55-75b1-4d18-9e74-f40052bad8b3','rabin','ceo-001','report_submitted','📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۶/۰۶','گزارش \"گزارش روزانه ۱۴۰۴/۰۶/۰۶\" توسط خودم ارسال شد','e8e353bf-cbba-43c8-8753-ba0ea2ac2f72','report',1,'2025-08-28 14:44:30','2025-08-28 08:59:19','2025-08-28 14:44:30'),('6e2a3e84-d868-45b8-9121-a3e0c1b44fd7','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','task_assigned','📋 وظیفه جدید: af','وظیفه \"af\" به شما اختصاص داده شد. اولویت: 🟡 متوسط','acb466e3-0cd3-49d5-8646-966cdb487c99','task',0,NULL,'2025-09-15 16:20:51','2025-09-15 19:50:51'),('75b6a424-274a-4617-84d2-5a632ef237ff','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','task_assigned','📋 وظیفه جدید: ,h,','وظیفه \",h,\" به شما اختصاص داده شد. اولویت: 🟡 متوسط','da9b43c4-56c5-416a-9b2b-f8e5615fa213','task',0,NULL,'2025-09-16 16:03:23','2025-09-16 19:33:23'),('873de939-e65c-4da9-a773-4c9ab668387d','rabin','ceo-001','task_completed','✅ وظیفه تکمیل شد: تست','وظیفه \"تست\" توسط احمد تکمیل شد','d1b1cda1-bdad-46c6-9d56-0b37f4ae7a35','task',1,'2025-09-13 15:04:27','2025-09-11 07:13:54','2025-09-13 15:04:27'),('88e5e1d7-88de-4a7d-a0da-5bfc61d64c35','rabin','ceo-001','task_assigned','📋 وظیفه جدید: eds','وظیفه \"eds\" به شما اختصاص داده شد. اولویت: 🔴 بالا','9e921e53-e460-46d4-bf4b-7808a285cc2f','task',1,'2025-09-30 16:24:50','2025-09-30 12:29:45','2025-09-30 16:24:50'),('8ba51ea7-ed72-4f57-bd04-e005f7857721','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','task_assigned','📋 وظیفه جدید: بسس','وظیفه \"بسس\" به شما اختصاص داده شد. اولویت: 🔴 بالا','c43e6bc0-449e-456e-98fd-e51d8017a5ca','task',1,'2025-09-16 09:51:55','2025-09-15 11:03:10','2025-09-16 09:51:55'),('8f37479c-8a78-4543-beeb-7106c8dc8eaa','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','task_assigned','📋 وظیفه جدید: تست','وظیفه \"تست\" به شما اختصاص داده شد. اولویت: 🔴 بالا','d1b1cda1-bdad-46c6-9d56-0b37f4ae7a35','task',1,'2025-09-14 11:14:24','2025-09-11 07:12:49','2025-09-14 11:14:24'),('9fbcf3ab-2e7e-438f-b34d-65aa5eca0ee8','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','chat_message','پیام جدید','پیام جدید از Robintejarat@gmail.com',NULL,NULL,1,'2025-08-28 15:28:17','2025-08-28 11:57:48','2025-08-28 15:28:17'),('b485934e-5829-472e-a8c0-cb9c47d9989b','rabin','ceo-001','task_completed','✅ وظیفه تکمیل شد: بسس','وظیفه \"بسس\" توسط مهندس کریمی تکمیل شد','c43e6bc0-449e-456e-98fd-e51d8017a5ca','task',1,'2025-09-15 19:50:58','2025-09-15 16:20:40','2025-09-15 19:50:58'),('be9011f6-7b85-11f0-93d3-e55f2cbc2ba2','rabin','ceo-001','success','خوش آمدید','به سیستم مدیریت CRM خوش آمدید',NULL,NULL,1,'2025-08-17 17:10:43','2025-08-17 16:41:01','2025-08-17 17:10:43'),('be901491-7b85-11f0-93d3-e55f2cbc2ba2','rabin','ceo-001','info','گزارش فروش','گزارش فروش ماهانه آماده شده است',NULL,NULL,1,'2025-08-17 17:10:43','2025-08-17 16:41:01','2025-08-17 17:10:43'),('d67bdb14-d37c-41f5-a3c9-6c7290064700','rabin','50fdd768-8dbb-4161-a539-e9a4da40f6d2','task_assigned','📋 وظیفه جدید: eds','وظیفه \"eds\" به شما اختصاص داده شد. اولویت: 🔴 بالا','9e921e53-e460-46d4-bf4b-7808a285cc2f','task',0,NULL,'2025-09-30 12:29:45','2025-09-30 15:59:45'),('4e451381-07e1-44c2-a7b4-7753e1f7dcc3','rabin','9f6b90b9-0723-4261-82c3-cd54e21d3995','task_assigned','📋 وظیفه جدید: تست کامل و برسی نرم افزار CRM','وظیفه \"تست کامل و برسی نرم افزار CRM\" به شما اختصاص داده شد. اولویت: 🔴 بالا','9cc572f5-8d9d-432e-a2ec-d81a0f63e1da','task',1,'2025-10-01 16:27:53','2025-10-01 12:53:41','2025-10-01 16:27:53'),('9f102268-b52d-4f23-9304-78e703581194','rabin','ceo-001','report_submitted','📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۷/۰۹','گزارش \"گزارش روزانه ۱۴۰۴/۰۷/۰۹\" توسط احمدرضا آوندی ارسال شد','60927ef5-7b0e-4f99-bf6e-d888107dd9ce','report',1,'2025-10-03 18:01:09','2025-10-01 12:57:33','2025-10-03 18:01:09'),('8c321a27-1f0f-43d2-981a-68a0f3315640','rabin','e820e817-eed0-40c0-9916-d23599e7e2ef','report_submitted','📊 گزارش جدید: گزارش روزانه ۱۴۰۴/۰۷/۰۹','گزارش \"گزارش روزانه ۱۴۰۴/۰۷/۰۹\" توسط احمدرضا آوندی ارسال شد','60927ef5-7b0e-4f99-bf6e-d888107dd9ce','report',0,NULL,'2025-10-01 12:57:33','2025-10-01 16:27:33'),('bc9e5730-3c17-4639-ac0f-6ff66124f61a','rabin','9f6b90b9-0723-4261-82c3-cd54e21d3995','task_assigned','📋 وظیفه جدید: احمدرضا آوندی تستی','وظیفه \"احمدرضا آوندی تستی\" به شما اختصاص داده شد. اولویت: 🟡 متوسط','dcc6a51d-bd54-49f8-aeb0-b17af2545376','task',0,NULL,'2025-10-11 14:26:02','2025-10-11 17:56:02'),('2b7c81fc-70a7-47a2-92db-891bc4197bb1','rabin','ceo-001','task_assigned','📋 وظیفه جدید: وظیفه تستی 1760468765361','وظیفه \"وظیفه تستی 1760468765361\" به شما اختصاص داده شد. اولویت: 🟡 متوسط','73a8be37-d57e-4ed5-ae09-6530f71deabd','task',0,NULL,'2025-10-14 15:36:05','2025-10-14 19:06:05'),('18748c9d-12bd-4acb-be53-a3fb16b6f64e','rabin','d497a492-f183-4452-86c1-961e5a0e3e22','task_assigned','📋 وظیفه جدید: وظیفه تستی 1760468772503','وظیفه \"وظیفه تستی 1760468772503\" به شما اختصاص داده شد. اولویت: 🟡 متوسط','d666ecfe-239f-43ee-afda-e631f7a7120c','task',0,NULL,'2025-10-14 15:36:12','2025-10-14 19:06:12'),('cc1bef08-341d-4686-b8af-611a769c7dc2','rabin','ceo-001','task_assigned','📋 وظیفه جدید: تست وظیفه - ۱۴۰۴/۸/۵, ۲۲:۱۵:۱۹','وظیفه \"تست وظیفه - ۱۴۰۴/۸/۵, ۲۲:۱۵:۱۹\" به شما اختصاص داده شد. اولویت: 🔴 بالا','77726906-c425-48a7-9e97-dd7956fa17c7','task',0,NULL,'2025-10-27 15:15:19','2025-10-27 18:45:19');
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `permissions`
--

LOCK TABLES `permissions` WRITE;
/*!40000 ALTER TABLE `permissions` DISABLE KEYS */;
INSERT INTO `permissions` VALUES ('50d56977-653a-11f0-92b6-e251efb8cddb','read','مشاهده',NULL,'2025-07-20 07:22:38'),('50d56c82-653a-11f0-92b6-e251efb8cddb','create','ایجاد',NULL,'2025-07-20 07:22:38'),('50d56ce8-653a-11f0-92b6-e251efb8cddb','update','ویرایش',NULL,'2025-07-20 07:22:38'),('50d56e9a-653a-11f0-92b6-e251efb8cddb','delete','حذف',NULL,'2025-07-20 07:22:38'),('50d56ef8-653a-11f0-92b6-e251efb8cddb','manage','مدیریت',NULL,'2025-07-20 07:22:38'),('a6be014e-70f7-11f0-9275-e24ee17dce91','view_all','مشاهده همه','دسترسی به مشاهده تمام بخش‌ها','2025-08-04 05:55:41'),('a6be02db-70f7-11f0-9275-e24ee17dce91','create_all','ایجاد همه','دسترسی به ایجاد در تمام بخش‌ها','2025-08-04 05:55:41'),('a6be0325-70f7-11f0-9275-e24ee17dce91','edit_all','ویرایش همه','دسترسی به ویرایش در تمام بخش‌ها','2025-08-04 05:55:41'),('a6be0346-70f7-11f0-9275-e24ee17dce91','delete_all','حذف همه','دسترسی به حذف در تمام بخش‌ها','2025-08-04 05:55:41'),('a6be0382-70f7-11f0-9275-e24ee17dce91','admin_access','دسترسی مدیر','دسترسی کامل مدیریتی','2025-08-04 05:55:41');
/*!40000 ALTER TABLE `permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pipeline_stages`
--

DROP TABLE IF EXISTS `pipeline_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `pipeline_stages` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `name` varchar(100) NOT NULL,
  `code` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `stage_order` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `color` varchar(7) DEFAULT '#3B82F6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pipeline_stages`
--

LOCK TABLES `pipeline_stages` WRITE;
/*!40000 ALTER TABLE `pipeline_stages` DISABLE KEYS */;
INSERT INTO `pipeline_stages` VALUES ('stage-001','جذب','lead_generation','جذب مشتری و شناسایی فرصت فروش',1,1,'#10B981'),('stage-002','نیازسنجی','needs_analysis','بررسی و تحلیل نیازهای مشتری',2,1,'#3B82F6'),('stage-003','تماس و مشاوره اولیه','initial_consultation','برقراری تماس اولیه و ارائه مشاوره',3,1,'#8B5CF6'),('stage-004','ارائه پیشنهاد','proposal_presentation','تهیه و ارائه پیشنهاد فنی و مالی',4,1,'#F59E0B'),('stage-005','مذاکره و بستن قرارداد','negotiation_contract','مذاکره نهایی و امضای قرارداد',5,1,'#EF4444'),('stage-006','فروش و تحویل محصول','sales_delivery','تکمیل فروش و تحویل محصول/خدمات',6,1,'#059669');
/*!40000 ALTER TABLE `pipeline_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product_discounts`
--

DROP TABLE IF EXISTS `product_discounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product_discounts`
--

LOCK TABLES `product_discounts` WRITE;
/*!40000 ALTER TABLE `product_discounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `product_discounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `products`
--

DROP TABLE IF EXISTS `products`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`),
  KEY `idx_products_name` (`name`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_category` (`category`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_products_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `products`
--

LOCK TABLES `products` WRITE;
/*!40000 ALTER TABLE `products` DISABLE KEYS */;
INSERT INTO `products` VALUES ('146bdbbf-bc9b-11f0-8607-581122e4f0be','rabin','محصول رابین','نزیز','رابین',20000000.00,'IRR','active','432',NULL,NULL,'ceo-001','2025-11-08 12:04:29','2025-11-08 12:04:29'),('37a9326c-c5cc-11f0-adb4-7a654ee49283','rabin','میز کار الکترونیک',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:48:54','2025-11-20 04:48:54'),('47278702-c5cc-11f0-adb4-7a654ee49283','rabin','میزکار برق',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:49:20','2025-11-20 04:49:20'),('778fe834-c5e0-11f0-adb4-7a654ee49283','rabin','دستگاه تولید کراکت خرمایی',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 07:13:51','2025-11-20 07:13:51'),('83055a1e-c5e0-11f0-adb4-7a654ee49283','rabin','دستگاه تولید خمیر خرما',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 07:14:10','2025-11-20 07:14:10'),('8931f50b-c5cb-11f0-adb4-7a654ee49283','rabin','پهپاد سمپاش 10 لیتری',NULL,NULL,700000000.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:44:01','2025-11-20 04:44:01'),('9b769990-c5cb-11f0-adb4-7a654ee49283','rabin','پهپاد سمپاش 20 لیتری',NULL,NULL,1100000000.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:44:32','2025-11-20 04:44:32'),('abb035c9-c5cb-11f0-adb4-7a654ee49283','rabin','پهپاد سمپاش 30 لیتری',NULL,NULL,1499999900.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:44:59','2025-11-20 04:44:59'),('c6bfb079-c5d4-11f0-adb4-7a654ee49283','rabin','موتور دریفت تک نفره',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 05:50:10','2025-11-20 05:50:10'),('cc1d5c9e-c5cc-11f0-adb4-7a654ee49283','rabin','میز کار صنعتی',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:53:03','2025-11-20 04:53:03'),('d303285e-c5d4-11f0-adb4-7a654ee49283','rabin','موتور دریفت دو نفره',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 05:50:31','2025-11-20 05:50:31'),('d663bc3b-c5cc-11f0-adb4-7a654ee49283','rabin','صندلی صنعتی 1',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:53:20','2025-11-20 04:53:20'),('df631dee-c5cc-11f0-adb4-7a654ee49283','rabin','صندلی صنعتی 2',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:53:36','2025-11-20 04:53:36'),('e56fc855-c5ce-11f0-adb4-7a654ee49283','rabin','ترولی صنعتی',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 05:08:05','2025-11-20 05:08:05'),('e6d689ec-c5cc-11f0-adb4-7a654ee49283','rabin','صندلی صنعتی 3',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:53:48','2025-11-20 04:53:48'),('f4c5a90b-c5cc-11f0-adb4-7a654ee49283','rabin','میر کار مونتاژ',NULL,NULL,2.00,'IRR','active',NULL,NULL,NULL,'ceo-001','2025-11-20 04:54:11','2025-11-20 04:54:11');
/*!40000 ALTER TABLE `products` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_members`
--

DROP TABLE IF EXISTS `project_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_members` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` enum('manager','member','viewer') DEFAULT 'member',
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(36) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_members`
--

LOCK TABLES `project_members` WRITE;
/*!40000 ALTER TABLE `project_members` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_milestones`
--

DROP TABLE IF EXISTS `project_milestones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_milestones`
--

LOCK TABLES `project_milestones` WRITE;
/*!40000 ALTER TABLE `project_milestones` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_milestones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_tags`
--

DROP TABLE IF EXISTS `project_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_tags` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `tag` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_tags`
--

LOCK TABLES `project_tags` WRITE;
/*!40000 ALTER TABLE `project_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `project_team`
--

DROP TABLE IF EXISTS `project_team`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `project_team` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `project_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `role` varchar(100) DEFAULT 'member',
  `joined_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `project_team`
--

LOCK TABLES `project_team` WRITE;
/*!40000 ALTER TABLE `project_team` DISABLE KEYS */;
/*!40000 ALTER TABLE `project_team` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projects`
--

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projects`
--

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale_items`
--

DROP TABLE IF EXISTS `sale_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale_items`
--

LOCK TABLES `sale_items` WRITE;
/*!40000 ALTER TABLE `sale_items` DISABLE KEYS */;
INSERT INTO `sale_items` VALUES ('1d56c615-5d83-493c-b4f3-507cca30b20d','rabin','dbed494f-bf49-4df8-86d1-f16982d36b6a','d66fe853-514d-4af7-adf9-5c3b14f91238','نمیدونم322',1,2000000.00,0.00,2000000.00,'2025-09-25 07:55:02'),('25e5dcf3-63d3-4ed8-a02d-435fb5fcb160','rabin','fa808d21-34ab-4903-91ae-7887a095cb6c','d66fe853-514d-4af7-adf9-5c3b14f91238','نمیدونم',1,2000000.00,0.00,2000000.00,'2025-09-15 13:14:05'),('7032bbc5-d623-40fc-9df7-89647fdc3517','rabin','0645eaaf-906c-4a89-8672-7b9aab6bc736','dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344','نرم افزار CRM',1,20000000.00,0.00,20000000.00,'2025-09-15 13:55:22'),('8c9b9610-ee5d-4db4-b75b-798f39de435c','rabin','2390d8b6-2ae7-4d48-a7b1-67ac3b595041','d66fe853-514d-4af7-adf9-5c3b14f91238','نمیدونم322',1,2000000.00,0.00,2000000.00,'2025-09-25 10:51:44'),('d2d291e8-82a7-484f-b2dc-3fb94539d287','rabin','ef99a69a-7ebd-4b59-be72-eccf9842d88b','prod-003','محصول نمونه 3',1,500000.00,0.00,500000.00,'2025-09-30 12:42:54'),('ec4d0c1b-5cb6-4f29-b06d-4bc185e92003','rabin','94ccee5c-773c-483f-adea-42db3691864a','dbb663b2-ac9c-4a0e-ae0c-cc7ce7aa2344','نرم افزار CRM',1,30000000.00,0.00,30000000.00,'2025-09-15 16:17:44'),('ed1de523-ecd9-4fff-8bb0-7fe789f84a89','rabin','1e97f54c-c6c6-4907-8e11-ef815fa77e56','prod-003','محصول نمونه 3',1,500000.00,0.00,500000.00,'2025-09-30 12:22:24'),('e4e3e0e6-e322-44b4-b2ed-0f49175c6e81','rabin','7ee43685-3ac0-437d-8a4c-88304ec76220','8ebd635c-8aa0-425a-98a0-f2ead098630e','تستی ***',1,234554232.00,0.00,234554232.00,'2025-09-30 19:27:00'),('8dc14499-c5e3-4d42-8af7-99a2affc62ff','rabin','62099ca5-2cad-4ec8-86d5-2efd27972dc9','48d5ae2e-bbd2-4ee7-bab7-5a586bea8328','نرم افزار CRM',1,2000000.00,0.00,2000000.00,'2025-10-01 12:54:53'),('8ca378ca-686c-4cfc-918f-2dd5b981a9b0','rabin','b5c1684b-a76e-4489-8a7f-5ec07c7a1900','adc9ada6-451d-470d-b776-b9f5701531fc','محصول به‌روز شده 1760468052482',2,500000.00,0.00,1000000.00,'2025-10-14 15:24:13'),('06b4f192-fe51-4b5e-bdc3-c7619b337020','rabin','c0ad08b9-5c24-49ec-bbbe-e3c811f7e189','ea43727b-f4b1-4cf3-a501-3c6694bed68e','محصول به‌روز شده 1760468357100',2,500000.00,0.00,1000000.00,'2025-10-14 15:29:17'),('77fed432-6aed-49b3-9851-a2ebf1bd4a25','rabin','835cbf1b-094a-4912-aec0-8a7d652659d8','ea43727b-f4b1-4cf3-a501-3c6694bed68e','محصول به‌روز شده 1760468357100',2,500000.00,0.00,1000000.00,'2025-10-14 15:29:24'),('b01e595d-d79f-44a3-8a90-cb6c2af0eb2f','rabin','fa4eb4ab-10a4-4d70-b341-53bc28cf74c0','020ec668-5f63-4487-ab45-22ccc7793e59','محصول به‌روز شده 1760468588563',2,500000.00,0.00,1000000.00,'2025-10-14 15:33:10'),('c8944152-3b75-4131-ad5f-12728d9c1284','rabin','cb7b1fd9-e3db-45c5-98de-3e7561174090','020ec668-5f63-4487-ab45-22ccc7793e59','محصول به‌روز شده 1760468588563',2,500000.00,0.00,1000000.00,'2025-10-14 15:33:28'),('e07541f9-8720-438d-bd42-adaeca895bb5','rabin','907aeeb8-2b4f-4a88-94f4-8610e9c271a3','c909cf60-d688-4f49-b279-eddb8d1374bd','محصول به‌روز شده 1760468690367',2,500000.00,0.00,1000000.00,'2025-10-14 15:34:50'),('fa90ed73-7e9d-471b-acc4-15e531b1c5ce','rabin','f26a5643-c11b-47c9-b86c-1decc35622dc','c909cf60-d688-4f49-b279-eddb8d1374bd','محصول به‌روز شده 1760468690367',2,500000.00,0.00,1000000.00,'2025-10-14 15:35:03'),('677cb561-cf13-4780-8905-558763369e61','rabin','289fbd44-a3a6-499c-be12-51f0f2cd5e00','9e36dfa8-be00-4a8f-8201-0000c9f21e50','محصول به‌روز شده 1760468764423',2,500000.00,0.00,1000000.00,'2025-10-14 15:36:04'),('43755233-6454-4e05-95ba-d8d59b9e1b3b','rabin','083f1ed3-23a8-4506-81b2-ba96c0453f9e','9e36dfa8-be00-4a8f-8201-0000c9f21e50','محصول به‌روز شده 1760468764423',2,500000.00,0.00,1000000.00,'2025-10-14 15:36:11');
/*!40000 ALTER TABLE `sale_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales`
--

DROP TABLE IF EXISTS `sales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `title` varchar(255) DEFAULT NULL,
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
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_sales_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales`
--

LOCK TABLES `sales` WRITE;
/*!40000 ALTER TABLE `sales` DISABLE KEYS */;
INSERT INTO `sales` VALUES ('c443e1bb-bc9b-11f0-8607-581122e4f0be',NULL,'rabin',NULL,'2cbd912e-bc9b-11f0-8607-581122e4f0be','مشتری رابین',20000.00,'IRR','pending',NULL,'2025-11-08 12:09:24',NULL,NULL,NULL,NULL,'unknown','ناشناس','2025-11-08 12:09:24','2025-11-08 12:09:24');
/*!40000 ALTER TABLE `sales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_pipeline_report`
--

DROP TABLE IF EXISTS `sales_pipeline_report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_pipeline_report`
--

LOCK TABLES `sales_pipeline_report` WRITE;
/*!40000 ALTER TABLE `sales_pipeline_report` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_pipeline_report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_pipeline_stages`
--

DROP TABLE IF EXISTS `sales_pipeline_stages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_pipeline_stages`
--

LOCK TABLES `sales_pipeline_stages` WRITE;
/*!40000 ALTER TABLE `sales_pipeline_stages` DISABLE KEYS */;
INSERT INTO `sales_pipeline_stages` VALUES ('stage-001','مشتری بالقوه','مشتریان جدید که هنوز تماس اولیه برقرار نشده',1,'#6B7280',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-002','تماس اولیه','اولین تماس با مشتری برقرار شده',2,'#3B82F6',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-003','ارزیابی نیاز','نیازهای مشتری شناسایی شده',3,'#F59E0B',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-004','ارائه پیشنهاد','پیشنهاد قیمت ارائه شده',4,'#8B5CF6',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-005','مذاکره','در حال مذاکره با مشتری',5,'#EF4444',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-006','بسته شده - برنده','معامله با موفقیت بسته شده',6,'#10B981',1,'2025-09-25 12:07:06','2025-09-25 12:07:06'),('stage-007','بسته شده - بازنده','معامله شکست خورده',7,'#DC2626',1,'2025-09-25 12:07:06','2025-09-25 12:07:06');
/*!40000 ALTER TABLE `sales_pipeline_stages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sales_statistics`
--

DROP TABLE IF EXISTS `sales_statistics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_statistics` (
  `sale_date` date DEFAULT NULL,
  `total_sales` bigint(21) DEFAULT NULL,
  `total_revenue` decimal(37,2) DEFAULT NULL,
  `avg_sale_value` decimal(19,6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sales_statistics`
--

LOCK TABLES `sales_statistics` WRITE;
/*!40000 ALTER TABLE `sales_statistics` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_statistics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_questions`
--

DROP TABLE IF EXISTS `survey_questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `survey_questions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `survey_id` varchar(36) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('rating','text','multiple_choice','yes_no') NOT NULL,
  `is_required` tinyint(1) DEFAULT 0,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `order_index` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_questions`
--

LOCK TABLES `survey_questions` WRITE;
/*!40000 ALTER TABLE `survey_questions` DISABLE KEYS */;
/*!40000 ALTER TABLE `survey_questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `survey_responses`
--

DROP TABLE IF EXISTS `survey_responses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `survey_responses` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `survey_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `response_text` text DEFAULT NULL,
  `response_value` decimal(3,2) DEFAULT NULL,
  `submitted_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `survey_responses`
--

LOCK TABLES `survey_responses` WRITE;
/*!40000 ALTER TABLE `survey_responses` DISABLE KEYS */;
/*!40000 ALTER TABLE `survey_responses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `surveys`
--

DROP TABLE IF EXISTS `surveys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `surveys`
--

LOCK TABLES `surveys` WRITE;
/*!40000 ALTER TABLE `surveys` DISABLE KEYS */;
/*!40000 ALTER TABLE `surveys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_logs`
--

DROP TABLE IF EXISTS `system_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL,
  `log_type` varchar(100) NOT NULL,
  `status` varchar(50) NOT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `user_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_logs`
--

LOCK TABLES `system_logs` WRITE;
/*!40000 ALTER TABLE `system_logs` DISABLE KEYS */;
INSERT INTO `system_logs` VALUES (1,'email_test','failed','{\"testEmail\":\"ahmadreza.avandi@gmail.com\",\"error\":\"Email service not configured\",\"timestamp\":\"2025-09-08T08:39:53.721Z\"}',NULL,'2025-09-08 08:39:53'),(2,'setting_updated','success','{\"settingKey\":\"email_config\",\"newValue\":{\"enabled\":true,\"smtp_host\":\"smtp.gmail.com\",\"smtp_port\":587,\"smtp_secure\":true,\"smtp_user\":\"Robintejarat@gmail.com\",\"smtp_password\":\"your-app-specific-password\"},\"timestamp\":\"2025-09-08T08:52:51.800Z\"}',NULL,'2025-09-08 08:52:51');
/*!40000 ALTER TABLE `system_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES ('0b753b1b-6526-11f0-92b6-e251efb8cddb','company_name','شرکت رابین','string','رابین تجارت\r\n',1,'2025-07-26 05:55:26',NULL),('0b753ca1-6526-11f0-92b6-e251efb8cddb','currency','IRR','string','واحد پول پیش‌فرض',1,'2025-07-20 04:57:32',NULL),('0b753d16-6526-11f0-92b6-e251efb8cddb','timezone','Asia/Tehran','string','منطقه زمانی',1,'2025-07-20 04:57:32',NULL),('0b753d56-6526-11f0-92b6-e251efb8cddb','language','fa','string','زبان پیش‌فرض',1,'2025-07-20 04:57:32',NULL),('0b753d97-6526-11f0-92b6-e251efb8cddb','max_file_size','10485760','number','حداکثر اندازه فایل (بایت)',0,'2025-07-20 04:57:32',NULL),('966fff18-7686-11f0-92d0-e353f4d03495','backup_config','{\"enabled\": false, \"schedule\": \"daily\", \"time\": \"02:00\", \"emailRecipients\": [], \"retentionDays\": 30, \"compression\": true}','string','Backup configuration settings',0,'2025-08-11 07:41:27',NULL),('967004a7-7686-11f0-92d0-e353f4d03495','email_config','{\"enabled\":true,\"smtp_host\":\"smtp.gmail.com\",\"smtp_port\":587,\"smtp_secure\":true,\"smtp_user\":\"Robintejarat@gmail.com\",\"smtp_password\":\"your-app-specific-password\"}','string','Email service configuration',0,'2025-09-08 05:22:51',NULL),('96700597-7686-11f0-92d0-e353f4d03495','system_monitoring','{\"enabled\": true, \"checkInterval\": 300, \"alertThresholds\": {\"diskSpace\": 85, \"memory\": 90, \"cpu\": 80}}','string','System monitoring configuration',0,'2025-08-11 07:41:27',NULL);
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_assignees`
--

DROP TABLE IF EXISTS `task_assignees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_assignees` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `tenant_key` varchar(50) DEFAULT 'rabin',
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  `assigned_by` varchar(36) NOT NULL,
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_assignees`
--

LOCK TABLES `task_assignees` WRITE;
/*!40000 ALTER TABLE `task_assignees` DISABLE KEYS */;
INSERT INTO `task_assignees` VALUES ('9eb5b91c-0c15-4c82-8bd0-8ab22cf3ad0a','rabin','9e921e53-e460-46d4-bf4b-7808a285cc2f','ceo-001','2025-09-30 15:59:45','ceo-001'),('27c26e6d-07a1-41bb-b494-496641a2bddf','rabin','9cc572f5-8d9d-432e-a2ec-d81a0f63e1da','9f6b90b9-0723-4261-82c3-cd54e21d3995','2025-10-01 16:23:41','ceo-001'),('346494c5-a1de-4033-906a-ce429da895f5','rabin','dcc6a51d-bd54-49f8-aeb0-b17af2545376','9f6b90b9-0723-4261-82c3-cd54e21d3995','2025-10-11 17:56:02','ceo-001'),('6b75afbe-c167-4875-bf29-4cfbf606a841','rabin','73a8be37-d57e-4ed5-ae09-6530f71deabd','ceo-001','2025-10-14 19:06:05','ceo-001'),('5862d21f-62e7-4096-b04e-28a76237cfae','rabin','d666ecfe-239f-43ee-afda-e631f7a7120c','d497a492-f183-4452-86c1-961e5a0e3e22','2025-10-14 19:06:12','d497a492-f183-4452-86c1-961e5a0e3e22'),('1be66e76-a0b5-4335-837c-f18549ec88bd','rabin','77726906-c425-48a7-9e97-dd7956fa17c7','ceo-001','2025-10-27 18:45:19','ceo-001');
/*!40000 ALTER TABLE `task_assignees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_comments`
--

DROP TABLE IF EXISTS `task_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `task_comments` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `comment` text NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_comments`
--

LOCK TABLES `task_comments` WRITE;
/*!40000 ALTER TABLE `task_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_files`
--

DROP TABLE IF EXISTS `task_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_files`
--

LOCK TABLES `task_files` WRITE;
/*!40000 ALTER TABLE `task_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_steps`
--

DROP TABLE IF EXISTS `task_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_steps`
--

LOCK TABLES `task_steps` WRITE;
/*!40000 ALTER TABLE `task_steps` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_tasks_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES ('a77dcb22-bc9d-11f0-8607-581122e4f0be','rabin','وظیفه رابین','/',NULL,NULL,NULL,'ceo-001','ceo-001','medium','completed','follow_up','0000-00-00 00:00:00','2025-11-08 12:22:55','2025-11-08 12:23:00','2025-11-08 12:23:00','',NULL);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_updates`
--

DROP TABLE IF EXISTS `ticket_updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_updates`
--

LOCK TABLES `ticket_updates` WRITE;
/*!40000 ALTER TABLE `ticket_updates` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_updates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `closed_at` timestamp NULL DEFAULT NULL,
  KEY `idx_tenant_key` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_activities`
--

DROP TABLE IF EXISTS `user_activities`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_activities` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `activity_type` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_activities`
--

LOCK TABLES `user_activities` WRITE;
/*!40000 ALTER TABLE `user_activities` DISABLE KEYS */;
INSERT INTO `user_activities` VALUES ('014dcc08-8c8f-11f0-9c70-2c3b705dd50b','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-09-08 08:37:07'),('06d54811-9d50-11f0-8e7a-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 16:19:08'),('0a4ff3b2-92f6-11f0-b115-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0','2025-09-16 12:09:48'),('0ae512b2-92f0-11f0-8687-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 11:26:52'),('12942e58-7cf7-11f0-9093-dc377bc569bf','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-19 15:23:41'),('179a0e03-9d5e-11f0-8e7a-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 17:59:49'),('1e682c4c-9d64-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 18:42:58'),('1fec73a9-7cfa-11f0-9093-dc377bc569bf','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-19 15:45:33'),('25d0276b-9d50-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 16:20:00'),('26c823c6-92ef-11f0-8687-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 11:20:29'),('29c1b97f-92f8-11f0-b115-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 12:24:59'),('2d90f24f-92e4-11f0-8687-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 10:01:56'),('3a6bfa4e-9272-11f0-8402-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 20:26:15'),('3bc65529-92f7-11f0-b115-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 12:18:20'),('3bc6717e-92f7-11f0-b115-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 12:18:20'),('3e7eee6f-90bd-11f0-b002-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-13 16:18:12'),('410fc636-90c1-11f0-b002-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-13 16:46:54'),('43bbf259-9333-11f0-bdbd-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 19:28:03'),('43da219a-9d64-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 18:44:00'),('4b72a438-90c0-11f0-b002-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-13 16:40:02'),('4bc70ef0-9d61-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 18:22:45'),('53c9bb36-7b87-11f0-93d3-e55f2cbc2ba2','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-17 16:52:21'),('5f35f374-8408-11f0-902a-db316565c9c4','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-28 12:28:17'),('62cce19d-9d5e-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 18:01:55'),('62cd2ca6-9d5e-11f0-8e7a-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::ffff:127.0.0.1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 18:01:55'),('670594ea-7b87-11f0-93d3-e55f2cbc2ba2','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-17 16:52:53'),('6e90ad9f-9165-11f0-8060-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-14 12:22:08'),('80289e05-92f2-11f0-8687-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 11:44:27'),('81bffbff-8565-11f0-9365-e45a14587d68','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-30 05:52:26'),('8a63e329-915c-11f0-8060-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-14 11:18:29'),('8a663841-915c-11f0-8060-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-14 11:18:29'),('902e0d1d-8408-11f0-902a-db316565c9c4','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-28 12:29:39'),('91101670-843f-11f0-9067-dc34729cb9cc','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-28 18:48:19'),('a33440db-9284-11f0-a782-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-15 22:38:01'),('a42c1cfa-9165-11f0-8060-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-14 12:23:38'),('ce1f27a2-92f6-11f0-b115-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 12:15:16'),('d311a5b2-84e2-11f0-901f-db31635ba116','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-29 14:16:58'),('d33c0a21-84e2-11f0-901f-db31635ba116','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-29 14:16:58'),('de2cd7d4-7b8a-11f0-93d3-e55f2cbc2ba2','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-17 17:17:41'),('e55c9296-9187-11f0-9190-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-14 16:28:50'),('f033bbc6-92e3-11f0-8687-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 10:00:13'),('f5cc22f5-84e2-11f0-901f-db31635ba116','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-29 14:17:56'),('f85838e7-92f1-11f0-8687-581122e4f0be','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-16 11:40:39'),('f9a7c242-8411-11f0-902a-db316565c9c4','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36','2025-08-28 15:27:56'),('fbde2b41-9d5d-11f0-8e7a-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-29 17:59:03'),('0c86c733-9e34-11f0-9e95-0ae6df21f504','ceo-001','logout','کاربر از سیستم خارج شد','5.233.141.240','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-30 19:31:23'),('c57e71ee-9e38-11f0-8ab2-a2d0d1a9e9d9','50fdd768-8dbb-4161-a539-e9a4da40f6d2','logout','کاربر از سیستم خارج شد','5.233.141.240','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-09-30 20:05:11'),('44f84445-9ee3-11f0-a04a-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-01 16:25:40'),('933c4c48-9f9c-11f0-b5f3-581122e4f0be','9f6b90b9-0723-4261-82c3-cd54e21d3995','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-02 14:32:08'),('51ed6dac-a08c-11f0-be7c-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36','2025-10-03 19:08:17'),('d3650a5a-a85f-11f0-8cc3-581122e4f0be','ceo-001','logout','کاربر از سیستم خارج شد','::1','Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36','2025-10-13 18:09:57');
/*!40000 ALTER TABLE `user_activities` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_interaction_performance`
--

DROP TABLE IF EXISTS `user_interaction_performance`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_interaction_performance`
--

LOCK TABLES `user_interaction_performance` WRITE;
/*!40000 ALTER TABLE `user_interaction_performance` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_interaction_performance` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_module_permissions`
--

DROP TABLE IF EXISTS `user_module_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_module_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `granted` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_module_permissions`
--

LOCK TABLES `user_module_permissions` WRITE;
/*!40000 ALTER TABLE `user_module_permissions` DISABLE KEYS */;
INSERT INTO `user_module_permissions` VALUES ('0c313dc2-69e3-11f0-92a7-e251ebaa91d8','b007b8be-1f2e-4364-88c2-856b76e77984','3f68a634-75d5-4107-a6a8-a7fb664ab55c',1,'2025-07-26 05:40:33','2025-07-26 05:40:33'),('0c313e9a-69e3-11f0-92a7-e251ebaa91d8','ceo-001','3f68a634-75d5-4107-a6a8-a7fb664ab55c',1,'2025-07-26 05:40:33','2025-07-26 05:40:33'),('0c313f56-69e3-11f0-92a7-e251ebaa91d8','fff87449-a074-4a50-a35e-ba15b70fd414','3f68a634-75d5-4107-a6a8-a7fb664ab55c',1,'2025-07-26 05:40:33','2025-07-26 05:40:33'),('5ea7005c-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 06:31:18'),('5ea70a2d-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdc15-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 08:13:44'),('5ea70ec9-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdcff-6678-11f0-9334-e4580a2bbc2b',0,'2025-08-11 05:16:42','2025-09-15 19:07:51'),('5ea71433-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-08-11 05:16:42'),('5ea717b6-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdc68-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 06:31:35'),('5ea71b2d-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 06:31:19'),('5eabfaa2-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdf55-6678-11f0-9334-e4580a2bbc2b',0,'2025-08-11 05:16:42','2025-09-15 19:07:25'),('5eac05ad-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdf07-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 06:31:41'),('5eac0cc7-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9be1e2-6678-11f0-9334-e4580a2bbc2b',0,'2025-08-11 05:16:42','2025-09-15 19:07:23'),('5eac1552-7672-11f0-92eb-e354fae89e60','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bde49-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-11 05:16:42','2025-09-16 06:31:31'),('7aa1d0d3-68b9-11f0-92b6-e251eeb8cbd2','fff87449-a074-4a50-a35e-ba15b70fd414','2f9bdc15-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-24 18:10:29','2025-07-24 18:10:29'),('7aa1e2c1-68b9-11f0-92b6-e251eeb8cbd2','fff87449-a074-4a50-a35e-ba15b70fd414','2f9bdc68-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-24 18:10:29','2025-07-24 18:10:29'),('a2d3e5ed-70f1-11f0-9275-e24ee17dce91','c032caab-5d9b-4a9d-920f-ea9c7703a1fb','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-04 05:12:37','2025-08-04 05:12:37'),('a2d676c0-70f1-11f0-9275-e24ee17dce91','c032caab-5d9b-4a9d-920f-ea9c7703a1fb','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-04 05:12:37','2025-08-04 05:12:37'),('aa01365c-70f1-11f0-9275-e24ee17dce91','c032caab-5d9b-4a9d-920f-ea9c7703a1fb','2f9be184-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-04 05:12:49','2025-08-04 05:12:49'),('aa05d049-70f1-11f0-9275-e24ee17dce91','c032caab-5d9b-4a9d-920f-ea9c7703a1fb','2f9be1e2-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-04 05:12:49','2025-08-04 05:12:49'),('aa05f02f-70f1-11f0-9275-e24ee17dce91','c032caab-5d9b-4a9d-920f-ea9c7703a1fb','2f9be1b4-6678-11f0-9334-e4580a2bbc2b',1,'2025-08-04 05:12:49','2025-08-04 05:12:49'),('acd8bb9b-67f2-11f0-92f0-e354fbedb1ae','b007b8be-1f2e-4364-88c2-856b76e77984','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-23 18:27:22','2025-07-23 18:27:22'),('c4ab9216-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('c4afa278-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('c4afb6bf-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('c4b02dcf-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bdc15-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('c4b02f1f-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bdcff-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('c4b219fc-6c45-11f0-9309-e35501041456','cf95fa0d-c06d-45e6-ae06-f5e02126f436','2f9bdc68-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-29 06:32:15','2025-07-29 06:32:15'),('e6f12f06-67f2-11f0-92f0-e354fbedb1ae','fff87449-a074-4a50-a35e-ba15b70fd414','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-23 18:29:00','2025-07-24 18:10:29'),('e6f17384-67f2-11f0-92f0-e354fbedb1ae','fff87449-a074-4a50-a35e-ba15b70fd414','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-23 18:29:00','2025-07-24 18:10:29'),('e6f1a24b-67f2-11f0-92f0-e354fbedb1ae','fff87449-a074-4a50-a35e-ba15b70fd414','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-23 18:29:00','2025-07-24 18:10:29'),('e6f1e17e-67f2-11f0-92f0-e354fbedb1ae','fff87449-a074-4a50-a35e-ba15b70fd414','2f9be20f-6678-11f0-9334-e4580a2bbc2b',1,'2025-07-23 18:29:00','2025-07-23 18:29:00'),('ump-mfll2zvd','usr-mfll2ut0','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:05:46','2025-09-15 17:05:46'),('ump-mfll30gc','usr-mfll2ut0','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:05:47','2025-09-15 17:05:47'),('ump-mfll3199','usr-mfll2ut0','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:05:48','2025-09-15 17:05:48'),('ump-mfll35iz','usr-mfll2ut0','be98ee61-6ab9-11f0-9078-dc3575acfdef',0,'2025-09-15 17:05:53','2025-09-15 17:05:55'),('ump-mfll3972','usr-mfll2ut0','2f9be1b4-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:05:58','2025-09-15 17:05:58'),('ump-mfll39w6','usr-mfll2ut0','2f9be184-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:05:59','2025-09-15 17:24:05'),('ump-mfll3kan','usr-mfll2ut0','2f9bde49-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:06:13','2025-09-15 17:06:13'),('ump-mfll3ler','usr-mfll2ut0','2f9bde98-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:06:14','2025-09-15 17:06:14'),('ump-mfllpv5p','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:33','2025-09-15 17:23:33'),('ump-mfllpvx0','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:34','2025-09-15 17:23:34'),('ump-mfllpwmn','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:35','2025-09-15 17:23:35'),('ump-mfllpx9g','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bdc15-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:36','2025-09-15 17:23:36'),('ump-mfllpyum','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bdc68-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:38','2025-09-15 17:23:38'),('ump-mfllq0t7','95eb0cae-9ab1-43bb-ad85-8c77390f3d5a','2f9bdcff-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:23:40','2025-09-15 17:23:40'),('ump-mfllqfpo','usr-mfll2ut0','2f9be26b-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:00','2025-09-15 17:24:00'),('ump-mfllqghp','usr-mfll2ut0','2f9be23b-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:01','2025-09-15 17:24:01'),('ump-mfllqh84','usr-mfll2ut0','2f9be20f-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:02','2025-09-15 17:24:02'),('ump-mfllqhm9','usr-mfll2ut0','2f9be1e2-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:02','2025-09-15 17:24:02'),('ump-mfllqk40','usr-mfll2ut0','2f9be153-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:05','2025-09-15 17:24:05'),('ump-mfllql12','usr-mfll2ut0','2f9be126-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:07','2025-09-15 17:24:07'),('ump-mfllqlz3','usr-mfll2ut0','2f9be0f6-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-15 17:24:08','2025-09-15 17:24:08'),('ump-mfmdv0d9','50fdd768-8dbb-4161-a539-e9a4da40f6d2','mod-customer-club-001',1,'2025-09-16 06:31:22','2025-09-16 06:31:22'),('ump-mfmdv7lf','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bde98-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 06:31:32','2025-09-16 06:31:32'),('ump-mfmdvbfu','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9bdd4b-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 06:31:37','2025-09-16 06:31:37'),('ump-mfmdvc28','50fdd768-8dbb-4161-a539-e9a4da40f6d2','2f9be1b4-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 06:31:38','2025-09-16 06:31:38'),('ump-mfmdvgjg','50fdd768-8dbb-4161-a539-e9a4da40f6d2','mod-chat-001',1,'2025-09-16 06:31:43','2025-09-16 06:31:43'),('ump-mfmid6fs','usr-mfmid2fs','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 08:37:28','2025-09-16 08:37:28'),('ump-mfmoletn','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bd793-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:31:50','2025-09-16 11:31:50'),('ump-mfmolgmb','b9392a49-3288-4c27-848e-9f5753a3d698','mod-monitoring-001',1,'2025-09-16 11:31:53','2025-09-16 11:31:53'),('ump-mfmolhwf','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdb02-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:31:54','2025-09-16 11:31:54'),('ump-mfmoligq','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdbbe-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:31:55','2025-09-16 11:31:55'),('ump-mfmollhb','b9392a49-3288-4c27-848e-9f5753a3d698','mod-customer-club-001',1,'2025-09-16 11:31:59','2025-09-16 11:31:59'),('ump-mfmolmon','b9392a49-3288-4c27-848e-9f5753a3d698','mod-customer-journey-001',0,'2025-09-16 11:32:00','2025-09-16 11:32:02'),('ump-mfmolq7u','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bde49-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:05','2025-09-16 11:32:05'),('ump-mfmolqzm','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bde98-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:06','2025-09-16 11:32:06'),('ump-mfmols4o','b9392a49-3288-4c27-848e-9f5753a3d698','2f9be184-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:08','2025-09-16 11:32:08'),('ump-mfmoltqo','b9392a49-3288-4c27-848e-9f5753a3d698','mod-deals-001',1,'2025-09-16 11:32:10','2025-09-16 11:32:10'),('ump-mfmolvl0','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdc15-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:12','2025-09-16 11:32:12'),('ump-mfmolwg1','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdc68-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:13','2025-09-16 11:32:13'),('ump-mfmolx1j','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdd4b-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:14','2025-09-16 11:32:14'),('ump-mfmolxw1','b9392a49-3288-4c27-848e-9f5753a3d698','2f9be1b4-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:15','2025-09-16 11:32:15'),('ump-mfmom2kc','b9392a49-3288-4c27-848e-9f5753a3d698','2f9bdf07-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:21','2025-09-16 11:32:21'),('ump-mfmom4d3','b9392a49-3288-4c27-848e-9f5753a3d698','2f9be126-6678-11f0-9334-e4580a2bbc2b',1,'2025-09-16 11:32:23','2025-09-16 11:32:23'),('ump-mfmom4vd','b9392a49-3288-4c27-848e-9f5753a3d698','mod-chat-001',1,'2025-09-16 11:32:24','2025-09-16 11:32:24'),('ump-mfmom79z','b9392a49-3288-4c27-848e-9f5753a3d698','3f68a634-75d5-4107-a6a8-a7fb664ab55c',1,'2025-09-16 11:32:27','2025-09-16 11:32:27'),('ump-mfmomba8','b9392a49-3288-4c27-848e-9f5753a3d698','mod-documents-001',1,'2025-09-16 11:32:32','2025-09-16 11:32:32'),('ump-mfmpeyk7','b9392a49-3288-4c27-848e-9f5753a3d698','mod-005',1,'2025-09-16 11:54:49','2025-09-16 11:57:21'),('ump-mfmpi4mu','b9392a49-3288-4c27-848e-9f5753a3d698','mod-001',1,'2025-09-16 11:57:17','2025-09-16 11:57:17'),('ump-mfmpi5kq','b9392a49-3288-4c27-848e-9f5753a3d698','mod-002',0,'2025-09-16 11:57:18','2025-09-16 11:57:19'),('ump-mfmpi7b9','b9392a49-3288-4c27-848e-9f5753a3d698','mod-004',1,'2025-09-16 11:57:20','2025-09-16 11:57:20'),('ump-mfmpi98m','b9392a49-3288-4c27-848e-9f5753a3d698','mod-008',1,'2025-09-16 11:57:23','2025-09-16 11:57:23'),('ump-mfmpi9yk','b9392a49-3288-4c27-848e-9f5753a3d698','mod-009',1,'2025-09-16 11:57:24','2025-09-16 11:57:24'),('ump-mfmpiba2','b9392a49-3288-4c27-848e-9f5753a3d698','mod-012',1,'2025-09-16 11:57:25','2025-09-16 11:57:25'),('ump-mfmpibpr','b9392a49-3288-4c27-848e-9f5753a3d698','mod-013',1,'2025-09-16 11:57:26','2025-09-16 11:57:26'),('ump-mfmpidla','b9392a49-3288-4c27-848e-9f5753a3d698','mod-014',1,'2025-09-16 11:57:28','2025-09-16 11:57:28'),('ump-mfmpifke','b9392a49-3288-4c27-848e-9f5753a3d698','mod-007',1,'2025-09-16 11:57:31','2025-09-16 11:57:31'),('ump-mfmpihhs','b9392a49-3288-4c27-848e-9f5753a3d698','mod-015',1,'2025-09-16 11:57:33','2025-09-16 11:57:33'),('ump-mfmpijdg','b9392a49-3288-4c27-848e-9f5753a3d698','mod-016',1,'2025-09-16 11:57:36','2025-09-16 11:57:36'),('ump-mg7ncg10','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-001',1,'2025-10-01 07:10:02','2025-10-01 07:10:02'),('ump-mg7nch18','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-002',1,'2025-10-01 07:10:03','2025-10-01 07:10:03'),('ump-mg7nci6z','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-004',1,'2025-10-01 07:10:05','2025-10-01 07:10:05'),('ump-mg7nck3l','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-005',1,'2025-10-01 07:10:07','2025-10-01 07:10:07'),('ump-mg7nclcp','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-008',1,'2025-10-01 07:10:09','2025-10-01 07:10:09'),('ump-mg7ncm4z','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-009',1,'2025-10-01 07:10:10','2025-10-01 07:10:10'),('ump-mg7ncn75','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-010',1,'2025-10-01 07:10:11','2025-10-01 07:10:11'),('ump-mg7ncppl','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-012',1,'2025-10-01 07:10:15','2025-10-01 07:10:15'),('ump-mg7ncqks','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-013',1,'2025-10-01 07:10:16','2025-10-01 07:10:16'),('ump-mg7ncrs3','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-014',1,'2025-10-01 07:10:17','2025-10-01 07:10:17'),('ump-mg7ncsty','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-022',1,'2025-10-01 07:10:19','2025-10-01 07:10:19'),('ump-mg7nctv6','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-007',1,'2025-10-01 07:10:20','2025-10-01 07:10:20'),('ump-mg7ncurb','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-015',1,'2025-10-01 07:10:21','2025-10-01 07:10:21'),('ump-mg7ncw3p','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-016',1,'2025-10-01 07:10:23','2025-10-01 07:10:23'),('ump-mg7ncxhi','362bb74f-3810-4ae4-ab26-ef93fce6c05f','mod-011',1,'2025-10-01 07:10:25','2025-10-01 07:10:25'),('ump-mg7vds8g','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-001',0,'2025-10-01 10:55:01','2025-11-19 08:23:53'),('ump-mg7vdssg','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-002',0,'2025-10-01 10:55:02','2025-11-19 08:23:55'),('ump-mg7vdtsl','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-004',0,'2025-10-01 10:55:03','2025-11-19 08:23:57'),('ump-mg7vdugz','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-005',0,'2025-10-01 10:55:04','2025-11-19 08:23:58'),('ump-mg7vdvk0','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-008',0,'2025-10-01 10:55:06','2025-11-19 08:24:02'),('ump-mg7vdwbn','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-009',0,'2025-10-01 10:55:07','2025-11-19 08:24:03'),('ump-mg7vdxzv','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-010',0,'2025-10-01 10:55:09','2025-11-19 08:24:04'),('ump-mg7vdywm','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-012',0,'2025-10-01 10:55:10','2025-11-19 08:24:10'),('ump-mg7vdzlv','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-013',0,'2025-10-01 10:55:11','2025-11-19 08:24:10'),('ump-mg7ve0kn','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-014',0,'2025-10-01 10:55:12','2025-11-19 08:24:12'),('ump-mg7ve1ua','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-022',0,'2025-10-01 10:55:14','2025-11-19 08:24:14'),('ump-mg7ve35q','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-007',0,'2025-10-01 10:55:16','2025-11-19 08:24:14'),('ump-mg7ve7dh','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-015',0,'2025-10-01 10:55:21','2025-11-19 08:24:16'),('ump-mg7ve80u','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-016',0,'2025-10-01 10:55:22','2025-11-19 08:24:17'),('ump-mg7ve9cg','a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','mod-011',0,'2025-10-01 10:55:24','2025-11-19 08:24:19'),('ump-mg874wew','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-001',1,'2025-10-01 12:54:02','2025-10-01 12:54:02'),('ump-mg874wxf','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-002',1,'2025-10-01 12:54:03','2025-10-01 12:54:03'),('ump-mg874xv1','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-004',1,'2025-10-01 12:54:04','2025-10-01 12:54:04'),('ump-mg874yn6','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-005',1,'2025-10-01 12:54:05','2025-10-01 12:54:05'),('ump-mg874zq7','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-008',1,'2025-10-01 12:54:07','2025-10-01 12:54:07'),('ump-mg8750n5','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-009',1,'2025-10-01 12:54:08','2025-10-01 12:54:08'),('ump-mg8751r1','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-010',1,'2025-10-01 12:54:09','2025-10-01 12:54:09'),('ump-mg8752d1','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-012',1,'2025-10-01 12:54:10','2025-10-01 12:54:10'),('ump-mg87533t','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-013',1,'2025-10-01 12:54:11','2025-10-01 12:54:11'),('ump-mg875426','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-014',1,'2025-10-01 12:54:12','2025-10-01 12:54:12'),('ump-mg8754q9','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-022',1,'2025-10-01 12:54:13','2025-10-01 12:54:13'),('ump-mg8755lh','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-007',1,'2025-10-01 12:54:14','2025-10-01 12:54:14'),('ump-mg87567b','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-015',1,'2025-10-01 12:54:15','2025-10-01 12:54:15'),('ump-mg87575m','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-016',1,'2025-10-01 12:54:16','2025-10-01 12:54:16'),('ump-mg8758fb','9f6b90b9-0723-4261-82c3-cd54e21d3995','mod-011',1,'2025-10-01 12:54:18','2025-10-01 12:54:18'),('5bd7444d-b316-4324-91b6-7701bcf70e46','ceo-001','mod-001',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('9e7acea0-05df-4097-8a98-42a1a82c302a','ceo-001','mod-002',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('e3ac49b6-6371-4fb2-a9dd-7f979b2d4a53','ceo-001','mod-021',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('57f86da2-b650-4eca-9cc0-7530b1a68039','ceo-001','mod-003',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('f9c88a03-930a-4f0f-ba89-4b867f466ca4','ceo-001','mod-004',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('c94a48bc-32a6-4caa-9ece-e2be238364a8','ceo-001','mod-005',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('cc235072-d084-4f3e-b11f-137616abea45','ceo-001','mod-006',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('8d5a85a5-85b5-480f-a5b0-ab928e4b5a6d','ceo-001','mod-007',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('ce5b360a-f6f6-4eef-a653-f199e8c834cd','ceo-001','mod-008',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('58ffbc82-0321-4502-9912-2b706bc5de9f','ceo-001','mod-009',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('7edab5bc-db3b-4a3c-ab79-b77cd88008ec','ceo-001','mod-010',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('b6e4ac3b-88f9-4fe1-97c9-a6b3e889cf9b','ceo-001','mod-011',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('34f5cf22-7d81-4b9f-8aa5-ac23765d2ceb','ceo-001','mod-012',1,'2025-10-17 10:02:13','2025-10-17 10:02:13'),('e783e09c-8161-4124-8e66-b0e69848c44e','ceo-001','mod-013',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6f4fc2ed-6e16-4c8c-8c40-9cd945602b17','ceo-001','mod-014',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('88b8c4dd-adcb-4e3f-9960-8c1c0a7214e4','ceo-001','mod-015',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('41f3a947-a838-402e-87b8-09eba9d8b990','ceo-001','mod-016',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('a92610fc-d7f0-4155-92e3-e5e265bf37ca','ceo-001','mod-017',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cdbfbf62-6806-49c8-844b-b55fbf71549b','ceo-001','mod-018',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cd1a0aeb-a5fd-4ced-8e90-8afc2f3d67d7','ceo-001','mod-019',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('9f5615ed-314c-448b-835a-3771401bab14','ceo-001','mod-020',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('d7dce5af-d34e-4088-9206-26b508126c71','ceo-001','mod-022',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b0838163-278a-4be0-b6ab-0dac22a15acd','ceo-001','mod-023',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('7f2be08f-aa0e-4bbc-99a3-6158eb4e40bc','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-001',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('83ca7337-5ec4-48b6-831a-5c2e7144b1b2','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-002',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('42d51d35-8a1c-4707-85d6-1f440fa7d804','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-021',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cc02fc77-fdde-41a8-a722-7e19b987087f','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-003',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('a82452e9-903f-4c9e-b992-1ac95ff9a1b1','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-004',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6a6e21ae-81ee-4ab0-9aa9-2cdcc9cb9833','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-005',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('438aaa8d-3685-44c6-82be-33029a627d47','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-006',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('af8519b8-c4cf-46be-84f2-10dc11c86236','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-007',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6caa7e8d-98a3-4cb2-b8e0-5e8a5d0ca68d','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-008',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('ce3b38cc-adb4-42f8-9575-42fd587b70c9','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-009',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cc0bac19-c549-43bb-b19e-4ced8899b493','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-010',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('831334c1-d6bc-4ff7-adb6-c49ce7ee158b','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-011',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('35ffc5f7-8606-4f40-b9cd-2f18b434e477','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-012',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('762a2d4f-bc2b-4e46-9957-f68a0bd3ff56','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-013',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6a5f9284-3126-477f-bb74-806f6e0de2ef','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-014',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('47cb078b-13e4-4dc0-b35e-8ba9bf4201d2','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-015',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('a225b2d6-b27b-42bb-bac0-9858ad9f11e9','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-016',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('46873af0-9123-4c97-9a10-86ec5a48ebda','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-017',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('9bd06329-6907-4d9e-9cec-6c7162eaa7e9','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-018',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('92d98e0d-dfef-4a85-ad7d-841917727503','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-019',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6873357b-7274-4783-8aa6-56a289702f7e','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-020',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('de487f6c-7891-45e4-990e-4094a9037a26','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-022',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('183cbc79-a811-4c65-a83e-d7592a294205','e820e817-eed0-40c0-9916-d23599e7e2ef','mod-023',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('c52640f7-363d-476c-83d1-42dd4949f60a','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-001',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('dd44c5db-8669-408d-b041-6454eef502c6','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-002',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('93e18b5e-dee2-4fa1-be8f-3345c08bb10c','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-021',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('66f3fc52-08da-4094-9779-c35f59bab089','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-003',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b30b5e48-4f93-4fba-b9a6-4f75ce36252c','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-004',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('29711c00-730f-4bfb-8352-b7fcd03c76ae','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-005',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('42e39db0-4ef1-4089-ae6a-90da5251b7bc','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-006',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cb058913-dfd9-4a4c-96c5-2a97c1d74c87','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-007',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('3dc39fe3-e021-4834-97e6-a346073e5fc9','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-008',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('32d6222d-ea71-47e5-8b0b-9d350f0cad63','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-009',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b49e39ce-bd74-4eaf-9636-a438e9cf4a36','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-010',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('0946ec47-54a9-4b08-999e-820d855a6965','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-011',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2ac93588-ad6e-4de4-bfe7-9984a2f810a2','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-012',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('8b772e55-9562-4b4f-b194-b8890f367c2b','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-013',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2a80cc19-fe1d-48a7-8a82-18d28bf09698','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-014',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('a7da733f-c8c8-498e-825e-e117f5d24d18','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-015',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('4a5e0ee5-6c45-4146-9473-e4c113513fde','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-016',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('cb0b73f9-1aaa-4add-95ca-058c4848097d','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-017',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('be5d918c-4f38-4b25-bbc7-7af34d278b53','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-018',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2b6bbd6e-7f67-49ac-a97d-14952b662da3','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-019',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('1cb7efd3-6dba-4750-a13a-548a222da4fe','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-020',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('8652e22e-2855-4df2-bc16-662d3218f509','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-022',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('fdca5e8e-64be-4371-9e17-4dee3babdc13','fedb499b-23a8-4af7-9b9d-587724a0b4c7','mod-023',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('5de57883-a518-4a7a-8074-e3a6916fa8c3','d497a492-f183-4452-86c1-961e5a0e3e22','mod-001',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('08b49663-49d4-4099-94a8-262bdc4cddaa','d497a492-f183-4452-86c1-961e5a0e3e22','mod-002',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('6667d23d-a0f1-491c-91b8-346410333099','d497a492-f183-4452-86c1-961e5a0e3e22','mod-021',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2404b4d6-1e13-41dc-8684-b76fea4027ca','d497a492-f183-4452-86c1-961e5a0e3e22','mod-003',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('ba362dbf-6ca4-43e3-9ee7-ef5cf28c00b9','d497a492-f183-4452-86c1-961e5a0e3e22','mod-004',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('3f5020b5-608d-4441-9ed8-38a4960d55e6','d497a492-f183-4452-86c1-961e5a0e3e22','mod-005',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b10eda6b-7f68-4dc0-9759-8c06c3686cb5','d497a492-f183-4452-86c1-961e5a0e3e22','mod-006',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('86b25cd5-e7ee-4244-85cd-0552eadd1f61','d497a492-f183-4452-86c1-961e5a0e3e22','mod-007',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('69cb302c-4083-491d-818d-801296550e5b','d497a492-f183-4452-86c1-961e5a0e3e22','mod-008',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2a9104c5-1657-4877-b3b3-5ac7c2fb2b86','d497a492-f183-4452-86c1-961e5a0e3e22','mod-009',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('86fc669c-abb7-4f67-be1f-6d976703c614','d497a492-f183-4452-86c1-961e5a0e3e22','mod-010',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('40d6ebd0-7a60-49f6-9547-dfa58186d292','d497a492-f183-4452-86c1-961e5a0e3e22','mod-011',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b58d8763-6ffd-421f-86a2-2a02bfb6d7e4','d497a492-f183-4452-86c1-961e5a0e3e22','mod-012',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2a4b231e-2185-4481-8806-bb8a90c20d9d','d497a492-f183-4452-86c1-961e5a0e3e22','mod-013',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('2c3d39a9-5f13-4f80-a483-108ced3e50d7','d497a492-f183-4452-86c1-961e5a0e3e22','mod-014',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('c509d784-acd0-4e97-a4ba-be74341a3776','d497a492-f183-4452-86c1-961e5a0e3e22','mod-015',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('e10ecacd-1fd4-4e16-81bb-e28b530f2d12','d497a492-f183-4452-86c1-961e5a0e3e22','mod-016',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('779417b2-eb59-4a9b-bf2d-07193ea4a70d','d497a492-f183-4452-86c1-961e5a0e3e22','mod-017',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('af8e354f-2e9f-457f-bd4d-327dc372cfc8','d497a492-f183-4452-86c1-961e5a0e3e22','mod-018',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('e9dcf6a9-7737-4c0b-a764-1d4f519c819b','d497a492-f183-4452-86c1-961e5a0e3e22','mod-019',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('9bb95eee-f0f0-4b62-971f-96152a2700da','d497a492-f183-4452-86c1-961e5a0e3e22','mod-020',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('b14eddfd-785b-4d06-b51b-0f01c1766740','d497a492-f183-4452-86c1-961e5a0e3e22','mod-022',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('7a0bb3d4-0da3-453e-8301-37d43e70f339','d497a492-f183-4452-86c1-961e5a0e3e22','mod-023',1,'2025-10-17 10:02:14','2025-10-17 10:02:14'),('e4a8ce4c-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-001',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4a99edf-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-002',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4a9ef51-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-003',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4aa5992-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-004',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4aaca5d-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-005',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ab2985-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-006',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ab8fa3-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-007',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4abdefd-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-008',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ac324c-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-009',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4acce5a-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-010',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ad1343-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-011',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ad5b67-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-012',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4adf099-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-013',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ae2ff9-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-014',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('e4ae863f-b0fe-11f0-b87f-581122e4f0be','effaaff2-57b1-493e-8d47-83217067cf3e','demo-015',1,'2025-10-24 17:28:45','2025-10-24 17:28:45'),('ump-mi64h1bu','3cbba416-c557-11f0-adb4-7a654ee49283','mod-001',1,'2025-11-19 14:53:22','2025-11-19 14:53:22'),('ump-mi64h28i','3cbba416-c557-11f0-adb4-7a654ee49283','demo-001',1,'2025-11-19 14:53:23','2025-11-19 14:53:23'),('ump-mi64h2qq','3cbba416-c557-11f0-adb4-7a654ee49283','mod-002',1,'2025-11-19 14:53:24','2025-11-19 14:53:24'),('ump-mi64h3u6','3cbba416-c557-11f0-adb4-7a654ee49283','demo-002',1,'2025-11-19 14:53:25','2025-11-19 14:53:25'),('ump-mi64h496','3cbba416-c557-11f0-adb4-7a654ee49283','demo-003',1,'2025-11-19 14:53:26','2025-11-19 14:53:26'),('ump-mi64h4rk','3cbba416-c557-11f0-adb4-7a654ee49283','mod-004',1,'2025-11-19 14:53:27','2025-11-19 14:53:27'),('ump-mi64h5o4','3cbba416-c557-11f0-adb4-7a654ee49283','mod-005',1,'2025-11-19 14:53:28','2025-11-19 14:53:28'),('ump-mi64h6xj','3cbba416-c557-11f0-adb4-7a654ee49283','demo-008',1,'2025-11-19 14:53:29','2025-11-19 14:53:29'),('ump-mi64h7r2','3cbba416-c557-11f0-adb4-7a654ee49283','demo-010',1,'2025-11-19 14:53:30','2025-11-19 14:53:30'),('ump-mi64h8e5','3cbba416-c557-11f0-adb4-7a654ee49283','mod-008',1,'2025-11-19 14:53:31','2025-11-19 14:53:31'),('ump-mi64h9jq','3cbba416-c557-11f0-adb4-7a654ee49283','mod-009',1,'2025-11-19 14:53:33','2025-11-19 14:53:33'),('ump-mi64haj0','3cbba416-c557-11f0-adb4-7a654ee49283','mod-010',1,'2025-11-19 14:53:34','2025-11-19 14:53:34'),('ump-mi64hck3','3cbba416-c557-11f0-adb4-7a654ee49283','demo-004',1,'2025-11-19 14:53:37','2025-11-19 14:53:37'),('ump-mi64hd53','3cbba416-c557-11f0-adb4-7a654ee49283','demo-005',1,'2025-11-19 14:53:37','2025-11-19 14:53:37'),('ump-mi64he30','3cbba416-c557-11f0-adb4-7a654ee49283','demo-006',1,'2025-11-19 14:53:39','2025-11-19 14:53:39'),('ump-mi64hewv','3cbba416-c557-11f0-adb4-7a654ee49283','demo-007',1,'2025-11-19 14:53:40','2025-11-19 14:53:40'),('ump-mi64hftk','3cbba416-c557-11f0-adb4-7a654ee49283','mod-012',1,'2025-11-19 14:53:41','2025-11-19 14:53:41'),('ump-mi64hha8','3cbba416-c557-11f0-adb4-7a654ee49283','mod-013',1,'2025-11-19 14:53:43','2025-11-19 14:53:43'),('ump-mi64hht3','3cbba416-c557-11f0-adb4-7a654ee49283','mod-014',1,'2025-11-19 14:53:43','2025-11-19 14:53:43'),('ump-mi64hj0l','3cbba416-c557-11f0-adb4-7a654ee49283','mod-022',1,'2025-11-19 14:53:45','2025-11-19 14:53:45'),('ump-mi64hk0f','3cbba416-c557-11f0-adb4-7a654ee49283','mod-007',1,'2025-11-19 14:53:46','2025-11-19 14:53:46'),('ump-mi64hky9','3cbba416-c557-11f0-adb4-7a654ee49283','demo-013',1,'2025-11-19 14:53:47','2025-11-19 14:53:47'),('ump-mi64hlqi','3cbba416-c557-11f0-adb4-7a654ee49283','demo-015',1,'2025-11-19 14:53:49','2025-11-19 14:53:49'),('ump-mi64hmc1','3cbba416-c557-11f0-adb4-7a654ee49283','mod-015',1,'2025-11-19 14:53:49','2025-11-19 14:53:49'),('ump-mi64hong','3cbba416-c557-11f0-adb4-7a654ee49283','demo-011',1,'2025-11-19 14:53:52','2025-11-19 14:53:52'),('ump-mi64hpn6','3cbba416-c557-11f0-adb4-7a654ee49283','mod-016',1,'2025-11-19 14:53:54','2025-11-19 14:53:54'),('ump-mi64hqn0','3cbba416-c557-11f0-adb4-7a654ee49283','demo-012',1,'2025-11-19 14:53:55','2025-11-19 14:53:55'),('ump-mi64hr6v','3cbba416-c557-11f0-adb4-7a654ee49283','mod-011',1,'2025-11-19 14:53:56','2025-11-19 14:53:56'),('ump-mi64i23g','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-001',1,'2025-11-19 14:54:10','2025-11-19 14:54:10'),('ump-mi64i35q','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-001',1,'2025-11-19 14:54:11','2025-11-19 14:54:11'),('ump-mi64i3mr','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-002',1,'2025-11-19 14:54:12','2025-11-19 14:54:12'),('ump-mi64i4bz','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-002',1,'2025-11-19 14:54:13','2025-11-19 14:54:13'),('ump-mi64i4v5','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-003',1,'2025-11-19 14:54:13','2025-11-19 14:54:13'),('ump-mi64i749','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-004',1,'2025-11-19 14:54:16','2025-11-19 14:54:16'),('ump-mi64i7xt','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-005',1,'2025-11-19 14:54:17','2025-11-19 14:54:17'),('ump-mi64i8vp','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-008',1,'2025-11-19 14:54:18','2025-11-19 14:54:18'),('ump-mi64i9f8','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-009',1,'2025-11-19 14:54:19','2025-11-19 14:54:19'),('ump-mi64i9zy','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-010',1,'2025-11-19 14:54:20','2025-11-19 14:54:20'),('ump-mi64ic40','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-008',1,'2025-11-19 14:54:23','2025-11-19 14:54:23'),('ump-mi64icjo','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-009',1,'2025-11-19 14:54:23','2025-11-19 14:54:23'),('ump-mi64idb3','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-010',1,'2025-11-19 14:54:24','2025-11-19 14:54:24'),('ump-mi64idw1','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-004',1,'2025-11-19 14:54:25','2025-11-19 14:54:25'),('ump-mi64ie6g','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-005',1,'2025-11-19 14:54:25','2025-11-19 14:54:25'),('ump-mi64if5p','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-006',1,'2025-11-19 14:54:27','2025-11-19 14:54:27'),('ump-mi64igy2','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-011',1,'2025-11-19 14:54:29','2025-11-19 14:54:29'),('ump-mi64ihr5','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-012',1,'2025-11-19 14:54:30','2025-11-19 14:54:30'),('ump-mi64iias','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-016',1,'2025-11-19 14:54:31','2025-11-19 14:54:31'),('ump-mi64ij6c','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-011',1,'2025-11-19 14:54:32','2025-11-19 14:54:32'),('ump-mi64ijwv','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-015',1,'2025-11-19 14:54:33','2025-11-19 14:54:33'),('ump-mi64iki5','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-015',1,'2025-11-19 14:54:34','2025-11-19 14:54:34'),('ump-mi64imjw','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-013',1,'2025-11-19 14:54:36','2025-11-19 14:54:36'),('ump-mi64inyq','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-007',1,'2025-11-19 14:54:38','2025-11-19 14:54:38'),('ump-mi64iop0','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-022',1,'2025-11-19 14:54:39','2025-11-19 14:54:39'),('ump-mi64ipms','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-014',1,'2025-11-19 14:54:40','2025-11-19 14:54:40'),('ump-mi64iq6e','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-013',1,'2025-11-19 14:54:41','2025-11-19 14:54:44'),('ump-mi64irdj','7ba67f8b-c557-11f0-adb4-7a654ee49283','demo-007',1,'2025-11-19 14:54:42','2025-11-19 14:54:42'),('ump-mi64iru4','7ba67f8b-c557-11f0-adb4-7a654ee49283','mod-012',1,'2025-11-19 14:54:43','2025-11-19 14:54:43');
/*!40000 ALTER TABLE `user_module_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_modules`
--

DROP TABLE IF EXISTS `user_modules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_modules` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `module_id` varchar(36) NOT NULL,
  `granted` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `created_by` varchar(36) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_modules`
--

LOCK TABLES `user_modules` WRITE;
/*!40000 ALTER TABLE `user_modules` DISABLE KEYS */;
INSERT INTO `user_modules` VALUES ('um-19e596cd-9313-11f0-bdbd-581122e4f','ceo-001','mod-001',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a183-9313-11f0-bdbd-581122e4f','ceo-001','mod-002',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a29b-9313-11f0-bdbd-581122e4f','ceo-001','mod-003',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a33b-9313-11f0-bdbd-581122e4f','ceo-001','mod-004',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a3d0-9313-11f0-bdbd-581122e4f','ceo-001','mod-005',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a465-9313-11f0-bdbd-581122e4f','ceo-001','mod-006',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a4e6-9313-11f0-bdbd-581122e4f','ceo-001','mod-007',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a564-9313-11f0-bdbd-581122e4f','ceo-001','mod-008',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a5ea-9313-11f0-bdbd-581122e4f','ceo-001','mod-009',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a665-9313-11f0-bdbd-581122e4f','ceo-001','mod-010',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a6df-9313-11f0-bdbd-581122e4f','ceo-001','mod-011',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a75b-9313-11f0-bdbd-581122e4f','ceo-001','mod-012',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a7dd-9313-11f0-bdbd-581122e4f','ceo-001','mod-013',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a859-9313-11f0-bdbd-581122e4f','ceo-001','mod-014',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a8d6-9313-11f0-bdbd-581122e4f','ceo-001','mod-015',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a95f-9313-11f0-bdbd-581122e4f','ceo-001','mod-016',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5a9e0-9313-11f0-bdbd-581122e4f','ceo-001','mod-017',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5aa5e-9313-11f0-bdbd-581122e4f','ceo-001','mod-018',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5aad9-9313-11f0-bdbd-581122e4f','ceo-001','mod-019',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5ab56-9313-11f0-bdbd-581122e4f','ceo-001','mod-020',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5abd6-9313-11f0-bdbd-581122e4f','ceo-001','mod-021',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5ac52-9313-11f0-bdbd-581122e4f','ceo-001','mod-022',1,'2025-09-16 15:37:49','ceo-001'),('um-19e5acd1-9313-11f0-bdbd-581122e4f','ceo-001','mod-023',1,'2025-09-16 15:37:49','ceo-001');
/*!40000 ALTER TABLE `user_modules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_permissions`
--

DROP TABLE IF EXISTS `user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_permissions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `action` varchar(50) NOT NULL,
  `granted` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_permissions`
--

LOCK TABLES `user_permissions` WRITE;
/*!40000 ALTER TABLE `user_permissions` DISABLE KEYS */;
INSERT INTO `user_permissions` VALUES ('0b74f520-6526-11f0-92b6-e251efb8cddb','ceo-001','users','manage',1,'2025-07-20 04:57:32'),('0b74f67b-6526-11f0-92b6-e251efb8cddb','ceo-001','customers','manage',1,'2025-07-20 04:57:32'),('0b74f6f2-6526-11f0-92b6-e251efb8cddb','ceo-001','deals','manage',1,'2025-07-20 04:57:32'),('0b74f72d-6526-11f0-92b6-e251efb8cddb','ceo-001','products','manage',1,'2025-07-20 04:57:32'),('0b74f761-6526-11f0-92b6-e251efb8cddb','ceo-001','tickets','manage',1,'2025-07-20 04:57:32'),('0b74f792-6526-11f0-92b6-e251efb8cddb','ceo-001','feedback','manage',1,'2025-07-20 04:57:32'),('0b74f7c6-6526-11f0-92b6-e251efb8cddb','ceo-001','projects','manage',1,'2025-07-20 04:57:32'),('0b74f7f4-6526-11f0-92b6-e251efb8cddb','ceo-001','reports','manage',1,'2025-07-20 04:57:32'),('0b74f824-6526-11f0-92b6-e251efb8cddb','ceo-001','settings','manage',1,'2025-07-20 04:57:32'),('0b74fa00-6526-11f0-92b6-e251efb8cddb','ceo-001','analytics','manage',1,'2025-07-20 04:57:32');
/*!40000 ALTER TABLE `user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_sessions` (
  `id` varchar(36) NOT NULL DEFAULT uuid(),
  `user_id` varchar(36) NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_targets`
--

DROP TABLE IF EXISTS `user_targets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_targets`
--

LOCK TABLES `user_targets` WRITE;
/*!40000 ALTER TABLE `user_targets` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_targets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  `tenant_key` varchar(100) DEFAULT 'rabin' COMMENT 'کلید tenant که کاربر به آن تعلق دارد',
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_users_tenant` (`tenant_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('ceo-001','Robintejarat@gmail.com','مهندس کریمی','مهندس کریمی','Robintejarat@gmail.com','$2b$10$/r0.PUBZw.x5nhGodAsuM.nEMoCVLMuzXFwEMj.VnsoixS780ZUhi','ceo',NULL,NULL,'active','/uploads/avatars/ceo-001-1755615503750.png',NULL,'',NULL,'2025-07-20 04:57:32','2025-10-18 15:55:25','2025-07-20 04:57:32','2025-10-18 15:55:25',NULL,'rabin'),('362bb74f-3810-4ae4-ab26-ef93fce6c05f','rameshk.kosar@gmail.com','کوثر رامشک','کوثر رامشک','rameshk.kosar@gmail.com','$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq','agent',NULL,NULL,'active',NULL,NULL,'09172087848',NULL,'2025-09-08 06:54:26','2025-09-08 07:34:19','2025-09-08 06:54:26','2025-10-24 16:15:03',NULL,'rabin'),('a0389f14-6a2a-4ccc-b257-9c4ec2704c4f','alirezasahafi77@gmail.com','علیرضا صحافی','علیرضا صحافی','alirezasahafi77@gmail.com','$2a$10$gToKzPcgV3ide/025rPLW.bZrPTtXgVJQOBpIZ86IomdJqP.au4yq','sales_agent',NULL,NULL,'active',NULL,NULL,'09332107233',NULL,'2025-09-08 06:53:13','2025-09-13 05:59:44','2025-09-08 06:53:13','2025-10-24 16:15:03',NULL,'rabin'),('d497a492-f183-4452-86c1-961e5a0e3e22',NULL,NULL,'مدیر سامین','admin@samin.com','$2a$10$Mx.JpKc4q762x/0dL91GbeZbNsOkTK4ykiTW/eYWcQoFogG1QTfOG','ceo',NULL,NULL,'active',NULL,NULL,NULL,NULL,'2025-10-13 17:53:59',NULL,'2025-10-13 17:53:59','2025-10-14 18:57:27',NULL,'samin'),('effaaff2-57b1-493e-8d47-83217067cf3e',NULL,NULL,'demo','demo@gmail.com','$2b$10$taZXeeeyAPXA8lokt47mye.1aAcSYxP0mu0xkvF8sFsb4en3m9ghK','ceo',NULL,NULL,'active',NULL,NULL,NULL,NULL,'2025-10-24 17:17:59',NULL,'2025-10-24 17:17:59','2025-10-24 17:17:59',NULL,'demo'),('7481ac8e-b1be-11f0-9386-581122e4f0be',NULL,NULL,'علی احمدی','ali.ahmadi@demo.com','$2a$10$fgRqCB.D/Ejbbl614MKHjuyx0oTMauk6F/HL.hw7b1P0R9.YlaQzC','sales_agent',NULL,NULL,'active',NULL,NULL,'09123456789',NULL,'2025-10-25 16:20:00',NULL,'2025-10-25 16:20:00','2025-10-25 16:20:00',NULL,'demo'),('b4f9abfd-bca2-11f0-8607-581122e4f0be',NULL,NULL,'احمدرضا اوندی','ahmadreza.avandi@gmail.com','$2a$10$oUcqn6CDoyIU8JsRVgWoDOipyw7SzBdzkB9ITHk1usLAyxk.fr6KC','sales_agent',NULL,NULL,'active',NULL,NULL,'09921386634',NULL,'2025-11-08 12:59:05',NULL,'2025-11-08 12:59:05','2025-11-08 12:59:05',NULL,'rabin'),('3cbba416-c557-11f0-adb4-7a654ee49283',NULL,NULL,'علی رضا حسنی','alireza034@gmail.com','$2a$10$cjhk5v7lYPasiHRkkOKKcOXi4qxsY5Ok3xSdTHMC2Wo9zeRwvvZ1S','sales_manager',NULL,NULL,'active',NULL,NULL,NULL,NULL,'2025-11-19 14:51:32',NULL,'2025-11-19 14:51:32','2025-11-19 14:51:32',NULL,'rabin'),('7ba67f8b-c557-11f0-adb4-7a654ee49283',NULL,NULL,'مهندس عزیزی','M.razizi076@gmail.com','$2a$10$gaqyEEPhmqp3KiPULZb99.FsXexXIeRaJcN8CGG3JuQJ7f7mMj0fm','sales_agent',NULL,NULL,'active',NULL,NULL,NULL,NULL,'2025-11-19 14:53:17',NULL,'2025-11-19 14:53:17','2025-11-19 14:53:17',NULL,'rabin');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voc_insights`
--

DROP TABLE IF EXISTS `voc_insights`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voc_insights`
--

LOCK TABLES `voc_insights` WRITE;
/*!40000 ALTER TABLE `voc_insights` DISABLE KEYS */;
/*!40000 ALTER TABLE `voc_insights` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-20  7:23:49
