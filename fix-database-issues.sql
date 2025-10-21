-- =====================================================
-- اسکریپت رفع مشکلات دیتابیس CRM
-- =====================================================
-- 1. حذف رکوردهای تکراری از جدول users
-- =====================================================
DELETE u1
FROM users u1
    INNER JOIN users u2
WHERE u1.id = u2.id
    AND u1.created_at > u2.created_at;
-- 2. اضافه کردن فیلدهای مورد نیاز به جدول users
-- =====================================================
ALTER TABLE `users`
ADD COLUMN IF NOT EXISTS `username` VARCHAR(100) NULL
AFTER `id`,
    ADD COLUMN IF NOT EXISTS `full_name` VARCHAR(255) NULL
AFTER `username`;
-- 3. به‌روزرسانی فیلدهای جدید با داده‌های موجود
-- =====================================================
UPDATE `users`
SET `username` = COALESCE(`email`, CONCAT('user_', `id`)),
    `full_name` = `name`
WHERE `username` IS NULL
    OR `full_name` IS NULL;
-- 4. رفع مشکل role های خالی
-- =====================================================
UPDATE `users`
SET `role` = 'sales_agent'
WHERE `role` = ''
    OR `role` IS NULL;
-- 5. اطمینان از وجود جدول tasks
-- =====================================================
CREATE TABLE IF NOT EXISTS `tasks` (
    `id` varchar(36) NOT NULL DEFAULT (uuid()),
    `title` varchar(255) NOT NULL,
    `description` text DEFAULT NULL,
    `customer_id` varchar(36) DEFAULT NULL,
    `deal_id` varchar(36) DEFAULT NULL,
    `assigned_to` varchar(36) NOT NULL,
    `assigned_by` varchar(36) NOT NULL,
    `priority` enum('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    `category` varchar(100) DEFAULT 'follow_up',
    `status` enum('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    `due_date` datetime DEFAULT NULL,
    `completed_at` datetime DEFAULT NULL,
    `completion_notes` text DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_assigned_to` (`assigned_to`),
    KEY `idx_customer_id` (`customer_id`),
    KEY `idx_status` (`status`),
    KEY `idx_due_date` (`due_date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 6. اطمینان از وجود جدول task_assignees
-- =====================================================
CREATE TABLE IF NOT EXISTS `task_assignees` (
    `id` varchar(36) NOT NULL DEFAULT (uuid()),
    `task_id` varchar(36) NOT NULL,
    `user_id` varchar(36) NOT NULL,
    `assigned_by` varchar(36) NOT NULL,
    `assigned_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 7. اطمینان از وجود جدول task_files
-- =====================================================
CREATE TABLE IF NOT EXISTS `task_files` (
    `id` varchar(36) NOT NULL DEFAULT (uuid()),
    `task_id` varchar(36) NOT NULL,
    `file_name` varchar(255) NOT NULL,
    `file_path` varchar(500) NOT NULL,
    `file_size` bigint(20) DEFAULT NULL,
    `file_type` varchar(100) DEFAULT NULL,
    `uploaded_by` varchar(36) NOT NULL,
    `uploaded_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_task_id` (`task_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 8. اطمینان از وجود جدول event_participants
-- =====================================================
CREATE TABLE IF NOT EXISTS `event_participants` (
    `id` varchar(36) NOT NULL DEFAULT (uuid()),
    `event_id` varchar(36) NOT NULL,
    `user_id` varchar(36) NOT NULL,
    `status` enum('pending', 'accepted', 'declined') DEFAULT 'pending',
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_event_id` (`event_id`),
    KEY `idx_user_id` (`user_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 9. اطمینان از وجود جدول event_reminders
-- =====================================================
CREATE TABLE IF NOT EXISTS `event_reminders` (
    `id` varchar(36) NOT NULL DEFAULT (uuid()),
    `event_id` varchar(36) NOT NULL,
    `method` enum('email', 'sms', 'notification') DEFAULT 'notification',
    `minutes_before` int(11) NOT NULL DEFAULT 15,
    `sent` tinyint(1) DEFAULT 0,
    `sent_at` timestamp NULL DEFAULT NULL,
    `created_at` timestamp NULL DEFAULT current_timestamp(),
    PRIMARY KEY (`id`),
    KEY `idx_event_id` (`event_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 10. بررسی و رفع مشکل collation در جدول activities
-- =====================================================
ALTER TABLE `activities`
MODIFY COLUMN `performed_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
-- 11. بررسی و رفع مشکل collation در جدول users
-- =====================================================
ALTER TABLE `users`
MODIFY COLUMN `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
-- 12. اضافه کردن index های مورد نیاز
-- =====================================================
ALTER TABLE `activities`
ADD INDEX IF NOT EXISTS `idx_performed_by` (`performed_by`),
    ADD INDEX IF NOT EXISTS `idx_customer_id` (`customer_id`),
    ADD INDEX IF NOT EXISTS `idx_type` (`type`),
    ADD INDEX IF NOT EXISTS `idx_start_time` (`start_time`);
ALTER TABLE `calendar_events`
ADD INDEX IF NOT EXISTS `idx_created_by` (`created_by`),
    ADD INDEX IF NOT EXISTS `idx_customer_id` (`customer_id`),
    ADD INDEX IF NOT EXISTS `idx_start_date` (`start_date`),
    ADD INDEX IF NOT EXISTS `idx_status` (`status`);
ALTER TABLE `feedback`
ADD INDEX IF NOT EXISTS `idx_customer_id` (`customer_id`),
    ADD INDEX IF NOT EXISTS `idx_type` (`type`),
    ADD INDEX IF NOT EXISTS `idx_status` (`status`),
    ADD INDEX IF NOT EXISTS `idx_created_at` (`created_at`);
ALTER TABLE `contacts`
ADD INDEX IF NOT EXISTS `idx_company_id` (`company_id`),
    ADD INDEX IF NOT EXISTS `idx_status` (`status`),
    ADD INDEX IF NOT EXISTS `idx_assigned_to` (`assigned_to`);
-- 13. رفع مشکل chat_conversations
-- =====================================================
ALTER TABLE `chat_conversations`
ADD COLUMN IF NOT EXISTS `participant_1_id` varchar(36) NULL
AFTER `created_by`,
    ADD COLUMN IF NOT EXISTS `participant_2_id` varchar(36) NULL
AFTER `participant_1_id`;
-- به‌روزرسانی داده‌های موجود
UPDATE `chat_conversations` c
    LEFT JOIN `chat_participants` p1 ON c.id = p1.conversation_id
SET c.participant_1_id = p1.user_id
WHERE c.participant_1_id IS NULL
LIMIT 1;
-- 14. نمایش خلاصه تغییرات
-- =====================================================
SELECT 'Database fixes completed successfully!' as status;
SELECT 'Users' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT id) as unique_ids,
    SUM(
        CASE
            WHEN role = ''
            OR role IS NULL THEN 1
            ELSE 0
        END
    ) as empty_roles
FROM users;
SELECT 'Tasks' as table_name,
    COUNT(*) as total_records
FROM tasks;
SELECT 'Calendar Events' as table_name,
    COUNT(*) as total_records
FROM calendar_events;
SELECT 'Activities' as table_name,
    COUNT(*) as total_records
FROM activities;
SELECT 'Feedback' as table_name,
    COUNT(*) as total_records
FROM feedback;
SELECT 'Contacts' as table_name,
    COUNT(*) as total_records
FROM contacts;