-- ایجاد View برای خلاصه مشتریان بدون مشکل collation

-- حذف View قدیمی
DROP VIEW IF EXISTS `customer_summary_view`;

-- ایجاد View جدید
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
  COALESCE(u.name, 'تخصیص نیافته') as assigned_to_name,
  c.created_at,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT a.id) as activities_count,
  GROUP_CONCAT(DISTINCT p.name ORDER BY p.name SEPARATOR ', ') as interested_products
FROM customers c 
LEFT JOIN users u ON c.assigned_to = u.id
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id 
LEFT JOIN products p ON cpi.product_id = p.id 
LEFT JOIN activities a ON c.id = a.customer_id 
GROUP BY c.id;

SELECT 'Customer summary view created successfully!' as message;