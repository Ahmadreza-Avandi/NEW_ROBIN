-- بررسی تعداد رکوردها در جداول مختلف
SELECT 'users' as table_name,
    COUNT(*) as total
FROM users;
SELECT 'activities' as table_name,
    COUNT(*) as total
FROM activities;
SELECT 'feedback' as table_name,
    COUNT(*) as total
FROM feedback;
SELECT 'sales_opportunities' as table_name,
    COUNT(*) as total
FROM sales_opportunities;
SELECT 'chat_conversations' as table_name,
    COUNT(*) as total
FROM chat_conversations;
SELECT 'chat_messages' as table_name,
    COUNT(*) as total
FROM chat_messages;
-- بررسی ساختار جدول users
DESCRIBE users;
-- نمایش چند رکورد از users
SELECT id,
    name,
    email,
    role
FROM users
LIMIT 5;