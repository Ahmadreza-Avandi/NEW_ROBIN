-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: saas_master
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
-- Temporary table structure for view `active_tenants_summary`
--

DROP TABLE IF EXISTS `active_tenants_summary`;
/*!50001 DROP VIEW IF EXISTS `active_tenants_summary`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `active_tenants_summary` AS SELECT
 1 AS `id`,
  1 AS `tenant_key`,
  1 AS `company_name`,
  1 AS `admin_email`,
  1 AS `subscription_status`,
  1 AS `subscription_plan`,
  1 AS `subscription_end`,
  1 AS `days_remaining`,
  1 AS `max_users`,
  1 AS `created_at` */;
SET character_set_client = @saved_cs_client;

--
-- Temporary table structure for view `expired_tenants`
--

DROP TABLE IF EXISTS `expired_tenants`;
/*!50001 DROP VIEW IF EXISTS `expired_tenants`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `expired_tenants` AS SELECT
 1 AS `id`,
  1 AS `tenant_key`,
  1 AS `company_name`,
  1 AS `admin_email`,
  1 AS `subscription_end`,
  1 AS `days_expired` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `subscription_history`
--

DROP TABLE IF EXISTS `subscription_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `plan_key` varchar(50) NOT NULL,
  `subscription_type` enum('monthly','yearly','custom') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `amount` decimal(15,2) NOT NULL COMMENT 'مبلغ پرداختی (تومان)',
  `status` enum('active','expired','cancelled','refunded') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL COMMENT 'ID super admin که ایجاد کرده',
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_status` (`status`),
  KEY `idx_dates` (`start_date`,`end_date`),
  CONSTRAINT `subscription_history_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_history`
--

LOCK TABLES `subscription_history` WRITE;
/*!40000 ALTER TABLE `subscription_history` DISABLE KEYS */;
INSERT INTO `subscription_history` VALUES (1,1,'professional','yearly','2025-10-13','2026-10-13',15000000.00,'',NULL,'2025-10-13 17:00:20',NULL),(2,4,'professional','monthly','2025-10-13','2026-04-13',1500000.00,'',NULL,'2025-10-13 17:35:23',NULL),(3,5,'basic','yearly','2025-10-13','2026-10-13',5000000.00,'',NULL,'2025-10-13 17:39:19',NULL),(4,7,'basic','monthly','2025-10-24','2026-01-24',500000.00,'',NULL,'2025-10-24 17:17:59',NULL);
/*!40000 ALTER TABLE `subscription_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `subscription_plans` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `plan_key` (`plan_key`),
  KEY `idx_plan_key` (`plan_key`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (1,'basic','پایه','Basic',500000.00,5000000.00,5,500,512,'[\"crm_basic\", \"customer_management\", \"task_management\"]','پلن پایه برای کسب‌وکارهای کوچک',1,1,'2025-10-13 15:20:25','2025-10-13 15:20:25'),(2,'professional','حرفه‌ای','Professional',1500000.00,15000000.00,20,5000,2048,'[\"crm_basic\", \"customer_management\", \"task_management\", \"advanced_reports\", \"api_access\"]','پلن حرفه‌ای برای کسب‌وکارهای متوسط',1,2,'2025-10-13 15:20:25','2025-10-13 15:20:25'),(3,'enterprise','سازمانی','Enterprise',5000000.00,50000000.00,100,50000,10240,'[\"crm_basic\", \"customer_management\", \"task_management\", \"advanced_reports\", \"api_access\", \"voice_assistant\", \"custom_integration\", \"priority_support\"]','پلن سازمانی برای شرکت‌های بزرگ',1,3,'2025-10-13 15:20:25','2025-10-13 15:20:25');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `super_admins`
--

DROP TABLE IF EXISTS `super_admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `super_admins` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `super_admins`
--

LOCK TABLES `super_admins` WRITE;
/*!40000 ALTER TABLE `super_admins` DISABLE KEYS */;
INSERT INTO `super_admins` VALUES (1,'Ahmadreza.avandi','ahmadrezaavandi@gmail.com','$2b$10$LZwtbXyn2q1sIMV5ymNU7ujRHGJJbdPOu2PKf6jUs3wmE.syBxiKK','احمدرضا اوندی',NULL,'super_admin',NULL,1,'2025-11-18 20:26:55','2025-10-13 15:20:25','2025-11-18 20:26:55');
/*!40000 ALTER TABLE `super_admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `system_settings`
--

DROP TABLE IF EXISTS `system_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text DEFAULT NULL,
  `setting_type` enum('string','number','boolean','json') DEFAULT 'string',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0 COMMENT 'قابل نمایش برای tenants',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `setting_key` (`setting_key`),
  KEY `idx_setting_key` (`setting_key`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `system_settings`
--

LOCK TABLES `system_settings` WRITE;
/*!40000 ALTER TABLE `system_settings` DISABLE KEYS */;
INSERT INTO `system_settings` VALUES (1,'default_trial_days','14','number','تعداد روزهای دوره آزمایشی پیش‌فرض',0,'2025-10-13 15:20:25','2025-10-13 15:20:25'),(2,'max_tenants','1000','number','حداکثر تعداد tenants مجاز',0,'2025-10-13 15:20:25','2025-10-13 15:20:25'),(3,'maintenance_mode','false','boolean','حالت تعمیر و نگهداری',0,'2025-10-13 15:20:25','2025-10-13 15:20:25'),(4,'default_db_host','mysql','string','هاست پیش‌فرض دیتابیس',0,'2025-10-13 15:20:25','2025-10-13 15:20:25');
/*!40000 ALTER TABLE `system_settings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenant_activity_logs`
--

DROP TABLE IF EXISTS `tenant_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenant_activity_logs` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `tenant_id` int(11) NOT NULL,
  `activity_type` enum('created','activated','suspended','expired','deleted','updated','login','other') NOT NULL,
  `description` text DEFAULT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'اطلاعات اضافی' CHECK (json_valid(`metadata`)),
  `performed_by` int(11) DEFAULT NULL COMMENT 'ID super admin',
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tenant_id` (`tenant_id`),
  KEY `idx_activity_type` (`activity_type`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `tenant_activity_logs_ibfk_1` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenant_activity_logs`
--

LOCK TABLES `tenant_activity_logs` WRITE;
/*!40000 ALTER TABLE `tenant_activity_logs` DISABLE KEYS */;
INSERT INTO `tenant_activity_logs` VALUES (1,1,'','Tenant created: شرکت رابین تجارت','{\"plan_key\":\"professional\",\"subscription_months\":12,\"admin_email\":\"ahmadrezaavandi@gmail.com\"}',NULL,NULL,NULL,'2025-10-13 17:00:20'),(2,4,'','Tenant created: samin','{\"plan_key\":\"professional\",\"subscription_months\":6,\"admin_email\":\"samin@gmail.com\"}',NULL,NULL,NULL,'2025-10-13 17:35:23'),(3,5,'','Tenant created: شرکت تست','{\"plan_key\":\"basic\",\"subscription_months\":12,\"admin_email\":\"admin@test.com\"}',NULL,NULL,NULL,'2025-10-13 17:39:19'),(4,7,'','Tenant created: demo','{\"plan_key\":\"basic\",\"subscription_months\":3,\"admin_email\":\"demo@gmail.com\"}',NULL,NULL,NULL,'2025-10-24 17:17:59');
/*!40000 ALTER TABLE `tenant_activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tenants`
--

DROP TABLE IF EXISTS `tenants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tenants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
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
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tenant_key` (`tenant_key`),
  KEY `idx_tenant_key` (`tenant_key`),
  KEY `idx_subscription_status` (`subscription_status`),
  KEY `idx_is_active` (`is_active`),
  KEY `idx_subscription_end` (`subscription_end`),
  KEY `idx_db_name` (`db_name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tenants`
--

LOCK TABLES `tenants` WRITE;
/*!40000 ALTER TABLE `tenants` DISABLE KEYS */;
INSERT INTO `tenants` VALUES (1,'rabin','شرکت رابین تجارت','crm_system','localhost',3306,'root','e36e2202897c1684aa5e53c3d217fef6:c0d0a907cfb47e31099308c02a92a258:','احمدرضا اوندی','ahmadrezaavandi@gmail.com','','active','professional','2025-10-13','2026-10-13',20,5000,2048,'\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\", \\\"advanced_reports\\\", \\\"api_access\\\"]\"',NULL,1,0,'2025-10-13 17:00:20','2025-10-17 10:24:26',NULL),(4,'samin','samin','crm_system','localhost',3306,'root','af03b9577c92f64a678d99cd73eb190b:c76545e0b3896dc3e842c4290cd0116f:','samin','samin@gmail.com','09001234567','active','professional','2025-10-13','2026-04-13',20,5000,2048,'\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\", \\\"advanced_reports\\\", \\\"api_access\\\"]\"',NULL,1,0,'2025-10-13 17:35:23','2025-10-17 09:53:23',NULL),(5,'testcompany','شرکت تست','crm_system','localhost',3306,'root','693011d4f215d8e3eead9d67d4dc51fd:94037994541b2ca22a452c3ca2cee3b4:','مدیر تست','admin@test.com','','active','basic','2025-10-13','2026-10-13',5,500,512,'\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\"]\"',NULL,1,0,'2025-10-13 17:39:19','2025-10-17 09:53:23',NULL),(7,'demo','demo','crm_system','localhost',3306,'crm_user','1234','demo','demo@gmail.com','09921386634','active','basic','2025-10-24','2026-01-24',5,500,512,'\"[\\\"crm_basic\\\", \\\"customer_management\\\", \\\"task_management\\\"]\"',NULL,1,0,'2025-10-24 17:17:59','2025-10-24 17:17:59',NULL);
/*!40000 ALTER TABLE `tenants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `active_tenants_summary`
--

/*!50001 DROP VIEW IF EXISTS `active_tenants_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `active_tenants_summary` AS select `t`.`id` AS `id`,`t`.`tenant_key` AS `tenant_key`,`t`.`company_name` AS `company_name`,`t`.`admin_email` AS `admin_email`,`t`.`subscription_status` AS `subscription_status`,`t`.`subscription_plan` AS `subscription_plan`,`t`.`subscription_end` AS `subscription_end`,to_days(`t`.`subscription_end`) - to_days(curdate()) AS `days_remaining`,`t`.`max_users` AS `max_users`,`t`.`created_at` AS `created_at` from `tenants` `t` where `t`.`is_active` = 1 and `t`.`is_deleted` = 0 order by `t`.`subscription_end` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `expired_tenants`
--

/*!50001 DROP VIEW IF EXISTS `expired_tenants`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_general_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `expired_tenants` AS select `t`.`id` AS `id`,`t`.`tenant_key` AS `tenant_key`,`t`.`company_name` AS `company_name`,`t`.`admin_email` AS `admin_email`,`t`.`subscription_end` AS `subscription_end`,to_days(curdate()) - to_days(`t`.`subscription_end`) AS `days_expired` from `tenants` `t` where `t`.`subscription_status` = 'expired' and `t`.`is_active` = 1 and `t`.`is_deleted` = 0 order by `t`.`subscription_end` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-20  7:23:59
