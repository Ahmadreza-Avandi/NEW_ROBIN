-- =====================================================
-- اسکریپت رفع مشکلات دیتابیس CRM - نسخه ساده
-- =====================================================
-- 1. حذف رکوردهای تکراری از جدول users
DELETE u1
FROM users u1
    INNER JOIN users u2
WHERE u1.id = u2.id
    AND u1.created_at > u2.created_at;
-- 2. اضافه کردن فیلد username
ALTER TABLE `users`
ADD COLUMN `username` VARCHAR(100) NULL
AFTER `id`;
-- 3. اضافه کردن فیلد full_name
ALTER TABLE `users`
ADD COLUMN `full_name` VARCHAR(255) NULL
AFTER `username`;
-- 4. به‌روزرسانی username از email
UPDATE `users`
SET `username` = COALESCE(`email`, CONCAT('user_', `id`))
WHERE `username` IS NULL;
-- 5. به‌روزرسانی full_name از name
UPDATE `users`
SET `full_name` = `name`
WHERE `full_name` IS NULL;
-- 6. رفع مشکل role های خالی
UPDATE `users`
SET `role` = 'sales_agent'
WHERE `role` = ''
    OR `role` IS NULL;
-- 7. رفع مشکل collation در activities
ALTER TABLE `activities`
MODIFY COLUMN `performed_by` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
-- 8. رفع مشکل collation در users
ALTER TABLE `users`
MODIFY COLUMN `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL;
-- 9. اضافه کردن فیلدهای participant به chat_conversations
ALTER TABLE `chat_conversations`
ADD COLUMN `participant_1_id` varchar(36) NULL
AFTER `created_by`;
ALTER TABLE `chat_conversations`
ADD COLUMN `participant_2_id` varchar(36) NULL
AFTER `participant_1_id`;
-- 10. نمایش نتایج
SELECT 'تعداد کاربران' as info,
    COUNT(*) as value
FROM users;
SELECT 'تعداد فعالیت‌ها' as info,
    COUNT(*) as value
FROM activities;
SELECT 'تعداد فروش‌ها' as info,
    COUNT(*) as value
FROM sales;
SELECT 'تعداد بازخوردها' as info,
    COUNT(*) as value
FROM feedback;