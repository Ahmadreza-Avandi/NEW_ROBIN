-- بررسی ساختار جدول users
SHOW COLUMNS
FROM users;
-- بررسی تعداد رکوردها
SELECT 'users' as table_name,
    COUNT(*) as total
FROM users;
SELECT 'activities' as table_name,
    COUNT(*) as total
FROM activities;
SELECT 'sales' as table_name,
    COUNT(*) as total
FROM sales;
SELECT 'feedback' as table_name,
    COUNT(*) as total
FROM feedback;
SELECT 'chat_conversations' as table_name,
    COUNT(*) as total
FROM chat_conversations;
-- بررسی نمونه داده از users
SELECT id,
    name,
    email,
    role
FROM users
LIMIT 3;
-- بررسی رکوردهای تکراری
SELECT id,
    COUNT(*) as count
FROM users
GROUP BY id
HAVING count > 1;