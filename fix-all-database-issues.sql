-- ============================================
-- رفع تمام مشکلات دیتابیس CRM
-- تاریخ: 1404/07/20
-- ============================================

-- 1. بررسی و ایجاد جدول tasks
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `assigned_by` varchar(36) NOT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `due_date` date DEFAULT NULL,
  `completion_notes` text DEFAULT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `assigned_by` (`assigned_by`),
  KEY `status` (`status`),
  KEY `due_date` (`due_date`),
  CONSTRAINT `tasks_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `tasks_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. بررسی و ایجاد جدول task_assignees
CREATE TABLE IF NOT EXISTS `task_assignees` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `task_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `assigned_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_user_unique` (`task_id`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `task_assignees_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_assignees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. بررسی و ایجاد جدول task_files
CREATE TABLE IF NOT EXISTS `task_files` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `task_id` varchar(36) NOT NULL,
  `filename` varchar(255) NOT NULL,
  `original_filename` varchar(255) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_size` bigint(20) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `uploaded_by` varchar(36) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `task_id` (`task_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `task_files_ibfk_1` FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_files_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. بررسی و ایجاد جدول feedback
CREATE TABLE IF NOT EXISTS `feedback` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `type` enum('complaint','suggestion','praise','csat','nps','ces','other') DEFAULT 'other',
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `sentiment` enum('positive','neutral','negative') DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') DEFAULT 'pending',
  `assigned_to` varchar(36) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  `channel` varchar(50) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `customer_id` (`customer_id`),
  KEY `assigned_to` (`assigned_to`),
  KEY `type` (`type`),
  KEY `status` (`status`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `feedback_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL,
  CONSTRAINT `feedback_ibfk_2` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. بررسی و ایجاد جدول feedback_forms
CREATE TABLE IF NOT EXISTS `feedback_forms` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `title` varchar(255) NOT NULL,
  `type` enum('sales','product','service','support','general') DEFAULT 'general',
  `description` text DEFAULT NULL,
  `template` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`template`)),
  `status` enum('active','inactive','draft') DEFAULT 'active',
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `status` (`status`),
  CONSTRAINT `feedback_forms_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. بررسی و ایجاد جدول feedback_form_questions
CREATE TABLE IF NOT EXISTS `feedback_form_questions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `form_id` varchar(36) NOT NULL,
  `question_text` text NOT NULL,
  `question_type` enum('text','textarea','rating','scale','multiple_choice','single_choice','yes_no') NOT NULL,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`options`)),
  `is_required` tinyint(1) DEFAULT 0,
  `question_order` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `form_id` (`form_id`),
  CONSTRAINT `feedback_form_questions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. بررسی و ایجاد جدول feedback_form_submissions
CREATE TABLE IF NOT EXISTS `feedback_form_submissions` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `form_id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `token` varchar(100) NOT NULL,
  `status` enum('pending','completed','expired') DEFAULT 'pending',
  `submitted_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `form_id` (`form_id`),
  KEY `customer_id` (`customer_id`),
  KEY `status` (`status`),
  CONSTRAINT `feedback_form_submissions_ibfk_1` FOREIGN KEY (`form_id`) REFERENCES `feedback_forms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_form_submissions_ibfk_2` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. بررسی و ایجاد جدول feedback_form_responses
CREATE TABLE IF NOT EXISTS `feedback_form_responses` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `submission_id` varchar(36) NOT NULL,
  `question_id` varchar(36) NOT NULL,
  `response_text` text DEFAULT NULL,
  `response_value` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `submission_id` (`submission_id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `feedback_form_responses_ibfk_1` FOREIGN KEY (`submission_id`) REFERENCES `feedback_form_submissions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `feedback_form_responses_ibfk_2` FOREIGN KEY (`question_id`) REFERENCES `feedback_form_questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. بررسی ساختار جدول calendar_events
-- این جدول در دیتابیس شما وجود دارد، فقط بررسی می‌کنیم

-- 10. بررسی ساختار جدول chat_conversations
-- این جدول در دیتابیس شما وجود دارد

-- 11. بررسی ساختار جدول chat_messages  
-- این جدول در دیتابیس شما وجود دارد

-- 12. بررسی ساختار جدول chat_participants
-- این جدول در دیتابیس شما وجود دارد

-- ============================================
-- اضافه کردن داده‌های نمونه برای تست
-- ============================================

-- اضافه کردن یک وظیفه نمونه (اگر جدول خالی است)
INSERT IGNORE INTO tasks (id, title, description, assigned_by, assigned_to, priority, status, due_date)
SELECT 
  'task-sample-001',
  'وظیفه نمونه - تماس با مشتری',
  'تماس با مشتری جهت پیگیری سفارش',
  'ceo-001',
  'ceo-001',
  'medium',
  'pending',
  DATE_ADD(CURDATE(), INTERVAL 3 DAY)
WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);

-- اضافه کردن یک بازخورد نمونه (اگر جدول خالی است)
INSERT IGNORE INTO feedback (id, customer_name, type, title, comment, rating, status, priority)
SELECT
  'feedback-sample-001',
  'مشتری نمونه',
  'suggestion',
  'پیشنهاد بهبود سیستم',
  'پیشنهاد می‌شود امکان فیلتر پیشرفته‌تر اضافه شود',
  4,
  'pending',
  'medium'
WHERE NOT EXISTS (SELECT 1 FROM feedback LIMIT 1);

-- ============================================
-- بررسی نهایی
-- ============================================

-- نمایش تعداد رکوردها در هر جدول
SELECT 'tasks' as table_name, COUNT(*) as record_count FROM tasks
UNION ALL
SELECT 'feedback', COUNT(*) FROM feedback
UNION ALL
SELECT 'calendar_events', COUNT(*) FROM calendar_events
UNION ALL
SELECT 'chat_conversations', COUNT(*) FROM chat_conversations
UNION ALL
SELECT 'chat_messages', COUNT(*) FROM chat_messages;

-- پایان اسکریپت
