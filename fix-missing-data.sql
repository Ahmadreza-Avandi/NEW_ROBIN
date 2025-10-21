-- Fix missing data issues for CRM system
-- This script adds sample data for testing

-- First, let's get a valid customer_id and stage_id
-- We'll use existing customers from the database

-- 1. Add sample deals/sales data
-- Using stage_id from deal_stages table and customer_id from customers table
INSERT INTO deals (
    id, 
    title, 
    customer_id, 
    total_value, 
    currency, 
    stage_id, 
    probability, 
    expected_close_date, 
    assigned_to,
    created_at, 
    updated_at
) 
SELECT 
    'deal-001' as id,
    'فروش نرم‌افزار CRM' as title,
    (SELECT id FROM customers LIMIT 1) as customer_id,
    50000000 as total_value,
    'IRR' as currency,
    (SELECT id FROM deal_stages WHERE name LIKE '%مذاکره%' LIMIT 1) as stage_id,
    70 as probability,
    '2025-11-15' as expected_close_date,
    'ceo-001' as assigned_to,
    NOW() as created_at,
    NOW() as updated_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE id = 'deal-001');

INSERT INTO deals (
    id, 
    title, 
    customer_id, 
    total_value, 
    currency, 
    stage_id, 
    probability, 
    expected_close_date, 
    assigned_to,
    created_at, 
    updated_at
) 
SELECT 
    'deal-002' as id,
    'پروژه پیاده‌سازی سیستم' as title,
    (SELECT id FROM customers LIMIT 1 OFFSET 1) as customer_id,
    120000000 as total_value,
    'IRR' as currency,
    (SELECT id FROM deal_stages WHERE name LIKE '%پیشنهاد%' LIMIT 1) as stage_id,
    50 as probability,
    '2025-12-01' as expected_close_date,
    'ceo-001' as assigned_to,
    NOW() as created_at,
    NOW() as updated_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE id = 'deal-002');

INSERT INTO deals (
    id, 
    title, 
    customer_id, 
    total_value, 
    currency, 
    stage_id, 
    probability, 
    expected_close_date, 
    assigned_to,
    created_at, 
    updated_at
) 
SELECT 
    'deal-003' as id,
    'خرید محصولات' as title,
    (SELECT id FROM customers LIMIT 1 OFFSET 2) as customer_id,
    80000000 as total_value,
    'IRR' as currency,
    (SELECT id FROM deal_stages WHERE name LIKE '%برنده%' OR name LIKE '%موفق%' LIMIT 1) as stage_id,
    100 as probability,
    '2025-10-05' as expected_close_date,
    'ceo-001' as assigned_to,
    NOW() as created_at,
    NOW() as updated_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE id = 'deal-003');

INSERT INTO deals (
    id, 
    title, 
    customer_id, 
    total_value, 
    currency, 
    stage_id, 
    probability, 
    expected_close_date, 
    assigned_to,
    created_at, 
    updated_at
) 
SELECT 
    'deal-004' as id,
    'قرارداد نگهداری' as title,
    (SELECT id FROM customers LIMIT 1 OFFSET 3) as customer_id,
    30000000 as total_value,
    'IRR' as currency,
    (SELECT id FROM deal_stages LIMIT 1) as stage_id,
    30 as probability,
    '2025-11-30' as expected_close_date,
    'ceo-001' as assigned_to,
    NOW() as created_at,
    NOW() as updated_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE id = 'deal-004');

INSERT INTO deals (
    id, 
    title, 
    customer_id, 
    total_value, 
    currency, 
    stage_id, 
    probability, 
    expected_close_date, 
    assigned_to,
    created_at, 
    updated_at
) 
SELECT 
    'deal-005' as id,
    'فروش لایسنس' as title,
    (SELECT id FROM customers LIMIT 1 OFFSET 4) as customer_id,
    45000000 as total_value,
    'IRR' as currency,
    (SELECT id FROM deal_stages WHERE name LIKE '%مذاکره%' LIMIT 1) as stage_id,
    60 as probability,
    '2025-11-20' as expected_close_date,
    'ceo-001' as assigned_to,
    NOW() as created_at,
    NOW() as updated_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM deals WHERE id = 'deal-005');

-- 2. Add sample feedback data
-- Note: customer_id is NOT NULL in feedback table, so we need to use existing customers
INSERT INTO feedback (
    id,
    customer_id,
    type,
    title,
    comment,
    score,
    status,
    priority,
    assigned_to,
    created_at
) 
SELECT 
    'fb-001' as id,
    (SELECT id FROM customers LIMIT 1) as customer_id,
    'suggestion' as type,
    'پیشنهاد بهبود رابط کاربری' as title,
    'رابط کاربری سیستم می‌تواند ساده‌تر و کاربرپسندتر باشد' as comment,
    4.00 as score,
    'pending' as status,
    'medium' as priority,
    'ceo-001' as assigned_to,
    NOW() as created_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE id = 'fb-001');

INSERT INTO feedback (
    id,
    customer_id,
    type,
    title,
    comment,
    score,
    status,
    priority,
    assigned_to,
    created_at
) 
SELECT 
    'fb-002' as id,
    (SELECT id FROM customers LIMIT 1 OFFSET 1) as customer_id,
    'complaint' as type,
    'مشکل در سرعت سیستم' as title,
    'سیستم در ساعات شلوغ کند می‌شود' as comment,
    2.00 as score,
    'in_progress' as status,
    'high' as priority,
    'ceo-001' as assigned_to,
    NOW() as created_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE id = 'fb-002');

INSERT INTO feedback (
    id,
    customer_id,
    type,
    title,
    comment,
    score,
    status,
    priority,
    assigned_to,
    created_at
) 
SELECT 
    'fb-003' as id,
    (SELECT id FROM customers LIMIT 1 OFFSET 2) as customer_id,
    'praise' as type,
    'تشکر از پشتیبانی' as title,
    'تیم پشتیبانی بسیار حرفه‌ای و مفید بودند' as comment,
    5.00 as score,
    'completed' as status,
    'low' as priority,
    'ceo-001' as assigned_to,
    NOW() as created_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE id = 'fb-003');

INSERT INTO feedback (
    id,
    customer_id,
    type,
    title,
    comment,
    score,
    status,
    priority,
    assigned_to,
    created_at
) 
SELECT 
    'fb-004' as id,
    (SELECT id FROM customers LIMIT 1 OFFSET 3) as customer_id,
    'csat' as type,
    'نظرسنجی رضایت' as title,
    'به طور کلی از سیستم راضی هستم' as comment,
    4.00 as score,
    'pending' as status,
    'medium' as priority,
    'ceo-001' as assigned_to,
    NOW() as created_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE id = 'fb-004');

INSERT INTO feedback (
    id,
    customer_id,
    type,
    title,
    comment,
    score,
    status,
    priority,
    assigned_to,
    created_at
) 
SELECT 
    'fb-005' as id,
    (SELECT id FROM customers LIMIT 1 OFFSET 4) as customer_id,
    'suggestion' as type,
    'افزودن گزارش‌های بیشتر' as title,
    'نیاز به گزارش‌های تحلیلی بیشتری داریم' as comment,
    4.00 as score,
    'pending' as status,
    'medium' as priority,
    'ceo-001' as assigned_to,
    NOW() as created_at
FROM dual
WHERE NOT EXISTS (SELECT 1 FROM feedback WHERE id = 'fb-005');

-- 3. Verify the data
SELECT 'Deals Count:' as info, COUNT(*) as count FROM deals
UNION ALL
SELECT 'Feedback Count:', COUNT(*) FROM feedback
UNION ALL
SELECT 'Users Count:', COUNT(*) FROM users
UNION ALL
SELECT 'Chat Messages Count:', COUNT(*) FROM chat_messages
UNION ALL
SELECT 'Deal Stages Count:', COUNT(*) FROM deal_stages
UNION ALL
SELECT 'Customers Count:', COUNT(*) FROM customers;
