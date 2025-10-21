-- ایجاد View ساده بدون مشکل collation

-- حذف View قدیمی
DROP VIEW IF EXISTS `customer_summary_view`;

-- ایجاد View جدید با CAST برای حل مشکل collation
CREATE VIEW `customer_summary_view` AS
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
  COALESCE(CAST(u.name AS CHAR CHARACTER SET utf8mb4), 'تخصیص نیافته') as assigned_to_name,
  c.created_at,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT a.id) as activities_count,
  GROUP_CONCAT(DISTINCT CAST(p.name AS CHAR CHARACTER SET utf8mb4) ORDER BY p.name SEPARATOR ', ') as interested_products
FROM customers c 
LEFT JOIN users u ON CAST(c.assigned_to AS CHAR CHARACTER SET utf8mb4) = CAST(u.id AS CHAR CHARACTER SET utf8mb4)
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id 
LEFT JOIN products p ON cpi.product_id = p.id 
LEFT JOIN activities a ON c.id = a.customer_id 
GROUP BY c.id, c.name, c.email, c.phone, c.city, c.state, c.industry, c.status, c.priority, c.segment, c.source, c.assigned_to, u.name, c.created_at;

-- تست View
SELECT 'Testing view...' as step;
SELECT COUNT(*) as view_records FROM customer_summary_view;
SELECT name, interested_products_count, interested_products FROM customer_summary_view LIMIT 3;

SELECT 'View created successfully!' as message;