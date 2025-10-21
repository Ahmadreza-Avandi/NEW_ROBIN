-- مرحله 6: درج نمونه علاقه‌مندی‌ها و تست نهایی
-- این مرحله رو در آخر اجرا کنید

-- درج نمونه علاقه‌مندی‌های مشتری به محصولات
INSERT IGNORE INTO `customer_product_interests` VALUES
(UUID(), '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-001', 'high', 'مشتری به خط تولید خوراک دام علاقه‌مند است', NOW(), NOW()),
(UUID(), '15147929-6e36-42c5-b2bf-a6b2b1413292', 'prod-004', 'medium', 'ممکن است به تجهیزات دامداری نیاز داشته باشد', NOW(), NOW()),
(UUID(), 'c413bb92-bc43-4b20-9833-31172fb2d7d7', 'prod-003', 'high', 'شرکت بزرگ - نیاز به سیستم CRM', NOW(), NOW()),
(UUID(), '1d8ed6b9-abe0-44c9-822f-cbb92a66c922', 'prod-001', 'medium', 'شرکت پتروشیمی - ممکن است نیاز داشته باشد', NOW(), NOW()),
(UUID(), 'bb568c99-e785-4a1b-b29f-d307ae1a4679', 'prod-001', 'high', 'دامدار - نیاز فوری به خط تولید', NOW(), NOW()),
(UUID(), 'bb568c99-e785-4a1b-b29f-d307ae1a4679', 'prod-002', 'high', 'نیاز به آسیاب و میکسر', NOW(), NOW());

-- ایجاد View برای گزارش‌گیری بهتر
CREATE OR REPLACE VIEW `customer_summary_view` AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.city,
  c.state,
  c.industry,
  c.status,
  c.priority,
  c.segment,
  c.source,
  c.assigned_to,
  u.name as assigned_to_name,
  c.created_at,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT a.id) as activities_count,
  GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as interested_products
FROM customers c
LEFT JOIN users u ON c.assigned_to = u.id
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id
LEFT JOIN products p ON cpi.product_id = p.id
LEFT JOIN activities a ON c.id = a.customer_id
GROUP BY c.id;

-- تست نهایی - بررسی همه چیز
SELECT 'مرحله 6 تکمیل شد - سیستم آماده است!' as message;

-- آمار کلی
SELECT 
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM customer_product_interests) as total_interests,
  (SELECT COUNT(*) FROM users) as total_users;

-- نمایش مشتریانی که علاقه‌مندی محصول دارند
SELECT 
  c.name as customer_name,
  p.name as product_name,
  cpi.interest_level,
  cpi.notes
FROM customer_product_interests cpi
JOIN customers c ON cpi.customer_id = c.id
JOIN products p ON cpi.product_id = p.id
ORDER BY c.name;

SELECT 'تمام مراحل با موفقیت تکمیل شد!' as final_message;