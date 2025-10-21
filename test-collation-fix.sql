-- تست کردن query های activities و deals بعد از حل مشکل collation

-- تست query activities
SELECT 
  a.id,
  a.customer_id,
  a.type,
  a.title,
  a.description,
  a.start_time,
  a.end_time,
  a.duration,
  a.outcome,
  a.notes,
  a.created_at,
  a.updated_at,
  c.name as customer_name,
  u.name as performed_by_name
FROM activities a
LEFT JOIN customers c ON a.customer_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
LEFT JOIN users u ON a.performed_by COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
ORDER BY a.created_at DESC
LIMIT 5;

-- تست query deals
SELECT 
  d.id,
  d.title,
  d.total_value,
  d.currency,
  d.probability,
  d.expected_close_date,
  d.actual_close_date,
  d.assigned_to,
  d.created_at,
  d.updated_at,
  c.name as customer_name,
  u.name as assigned_user_name,
  CASE 
    WHEN d.actual_close_date IS NOT NULL AND d.probability = 100 THEN 'won'
    WHEN d.actual_close_date IS NOT NULL AND d.probability = 0 THEN 'lost'
    ELSE 'active'
  END as status,
  CASE 
    WHEN d.probability >= 90 THEN 'بسته شده - برنده'
    WHEN d.probability >= 70 THEN 'مذاکره'
    WHEN d.probability >= 50 THEN 'ارسال پیشنهاد'
    WHEN d.probability >= 30 THEN 'نیازسنجی'
    ELSE 'لید جدید'
  END as stage
FROM deals d
LEFT JOIN customers c ON d.customer_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
LEFT JOIN users u ON d.assigned_to COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
ORDER BY d.created_at DESC
LIMIT 5;

-- بررسی collation جداول
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'crm_system' 
AND TABLE_NAME IN ('activities', 'customers', 'deals', 'users')
ORDER BY TABLE_NAME;