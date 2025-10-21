-- Fix missing data - Simple version
-- این اسکریپت داده‌های نمونه برای تست اضافه می‌کند

-- 1. افزودن معاملات نمونه (Deals)
-- استفاده از customer_id و stage_id موجود در دیتابیس

INSERT INTO deals (id, title, customer_id, total_value, currency, stage_id, probability, expected_close_date, assigned_to, created_at, updated_at)
SELECT 'deal-001', 'فروش نرم‌افزار CRM', id, 50000000, 'IRR', 'stage-005', 70, '2025-11-15', 'ceo-001', NOW(), NOW()
FROM customers LIMIT 1;

INSERT INTO deals (id, title, customer_id, total_value, currency, stage_id, probability, expected_close_date, assigned_to, created_at, updated_at)
SELECT 'deal-002', 'پروژه پیاده‌سازی سیستم', id, 120000000, 'IRR', 'stage-004', 50, '2025-12-01', 'ceo-001', NOW(), NOW()
FROM customers LIMIT 1 OFFSET 1;

INSERT INTO deals (id, title, customer_id, total_value, currency, stage_id, probability, expected_close_date, assigned_to, created_at, updated_at)
SELECT 'deal-003', 'خرید محصولات', id, 80000000, 'IRR', 'stage-006', 100, '2025-10-05', 'ceo-001', NOW(), NOW()
FROM customers LIMIT 1 OFFSET 2;

INSERT INTO deals (id, title, customer_id, total_value, currency, stage_id, probability, expected_close_date, assigned_to, created_at, updated_at)
SELECT 'deal-004', 'قرارداد نگهداری', id, 30000000, 'IRR', 'stage-001', 30, '2025-11-30', 'ceo-001', NOW(), NOW()
FROM customers LIMIT 1 OFFSET 3;

INSERT INTO deals (id, title, customer_id, total_value, currency, stage_id, probability, expected_close_date, assigned_to, created_at, updated_at)
SELECT 'deal-005', 'فروش لایسنس', id, 45000000, 'IRR', 'stage-005', 60, '2025-11-20', 'ceo-001', NOW(), NOW()
FROM customers LIMIT 1 OFFSET 4;

-- 2. افزودن بازخوردهای نمونه (Feedback)
INSERT INTO feedback (id, customer_id, type, title, comment, score, status, priority, assigned_to, created_at)
SELECT 'fb-001', id, 'suggestion', 'پیشنهاد بهبود رابط کاربری', 'رابط کاربری سیستم می‌تواند ساده‌تر و کاربرپسندتر باشد', 4.00, 'pending', 'medium', 'ceo-001', NOW()
FROM customers LIMIT 1;

INSERT INTO feedback (id, customer_id, type, title, comment, score, status, priority, assigned_to, created_at)
SELECT 'fb-002', id, 'complaint', 'مشکل در سرعت سیستم', 'سیستم در ساعات شلوغ کند می‌شود', 2.00, 'in_progress', 'high', 'ceo-001', NOW()
FROM customers LIMIT 1 OFFSET 1;

INSERT INTO feedback (id, customer_id, type, title, comment, score, status, priority, assigned_to, created_at)
SELECT 'fb-003', id, 'praise', 'تشکر از پشتیبانی', 'تیم پشتیبانی بسیار حرفه‌ای و مفید بودند', 5.00, 'completed', 'low', 'ceo-001', NOW()
FROM customers LIMIT 1 OFFSET 2;

INSERT INTO feedback (id, customer_id, type, title, comment, score, status, priority, assigned_to, created_at)
SELECT 'fb-004', id, 'csat', 'نظرسنجی رضایت', 'به طور کلی از سیستم راضی هستم', 4.00, 'pending', 'medium', 'ceo-001', NOW()
FROM customers LIMIT 1 OFFSET 3;

INSERT INTO feedback (id, customer_id, type, title, comment, score, status, priority, assigned_to, created_at)
SELECT 'fb-005', id, 'suggestion', 'افزودن گزارش‌های بیشتر', 'نیاز به گزارش‌های تحلیلی بیشتری داریم', 4.00, 'pending', 'medium', 'ceo-001', NOW()
FROM customers LIMIT 1 OFFSET 4;

-- 3. بررسی نتیجه
SELECT 'معاملات (Deals):' as نوع_داده, COUNT(*) as تعداد FROM deals
UNION ALL
SELECT 'بازخوردها (Feedback):', COUNT(*) FROM feedback
UNION ALL
SELECT 'کاربران (Users):', COUNT(*) FROM users
UNION ALL
SELECT 'پیام‌های چت:', COUNT(*) FROM chat_messages;
