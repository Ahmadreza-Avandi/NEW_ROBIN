-- تست قابلیت‌های جدید سیستم CRM

-- 1. بررسی جداول ایجاد شده
SELECT 'Checking tables...' as step;

SELECT 
  TABLE_NAME,
  TABLE_ROWS,
  CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME IN ('products', 'customer_product_interests', 'customers');

-- 2. بررسی محصولات
SELECT 'Checking products...' as step;
SELECT id, name, category, price, status FROM products LIMIT 5;

-- 3. بررسی علاقه‌مندی‌های مشتری-محصول
SELECT 'Checking customer product interests...' as step;
SELECT 
  cpi.id,
  c.name as customer_name,
  p.name as product_name,
  cpi.interest_level,
  cpi.notes
FROM customer_product_interests cpi
LEFT JOIN customers c ON cpi.customer_id = c.id
LEFT JOIN products p ON cpi.product_id = p.id
LIMIT 5;

-- 4. بررسی مشتریان با محصولات علاقه‌مند
SELECT 'Checking customers with product interests...' as step;
SELECT 
  c.name as customer_name,
  c.city,
  c.assigned_to,
  COUNT(cpi.id) as interested_products_count,
  GROUP_CONCAT(p.name SEPARATOR ', ') as products
FROM customers c
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id
LEFT JOIN products p ON cpi.product_id = p.id
GROUP BY c.id
HAVING interested_products_count > 0
LIMIT 10;

-- 5. آمار کلی
SELECT 'General statistics...' as step;
SELECT 
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM customer_product_interests) as total_interests,
  (SELECT COUNT(DISTINCT customer_id) FROM customer_product_interests) as customers_with_interests;

-- 6. بررسی فیلد source در جدول customers
SELECT 'Checking source field...' as step;
SELECT 
  source,
  COUNT(*) as count
FROM customers 
WHERE source IS NOT NULL
GROUP BY source;

-- 7. بررسی assigned_to
SELECT 'Checking assigned users...' as step;
SELECT 
  assigned_to,
  COUNT(*) as customer_count
FROM customers 
GROUP BY assigned_to;

SELECT 'All tests completed!' as final_message;