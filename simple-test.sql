-- تست ساده جداول و داده‌ها

-- 1. بررسی وجود جداول
SELECT 'Checking tables existence...' as step;

SHOW TABLES LIKE 'products';
SHOW TABLES LIKE 'customer_product_interests';
SHOW TABLES LIKE 'customers';

-- 2. بررسی محصولات
SELECT 'Checking products...' as step;
SELECT COUNT(*) as total_products FROM products;
SELECT id, name, category, price FROM products LIMIT 3;

-- 3. بررسی علاقه‌مندی‌ها
SELECT 'Checking interests...' as step;
SELECT COUNT(*) as total_interests FROM customer_product_interests;

-- 4. بررسی مشتریان
SELECT 'Checking customers...' as step;
SELECT COUNT(*) as total_customers FROM customers;
SELECT id, name, city, assigned_to FROM customers LIMIT 3;

-- 5. بررسی join ساده
SELECT 'Testing simple join...' as step;
SELECT 
  c.name as customer_name,
  p.name as product_name,
  cpi.interest_level
FROM customer_product_interests cpi
JOIN customers c ON cpi.customer_id = c.id
JOIN products p ON cpi.product_id = p.id
LIMIT 3;

-- 6. آمار کلی
SELECT 'Final statistics...' as step;
SELECT 
  (SELECT COUNT(*) FROM customers) as customers,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM customer_product_interests) as interests;

SELECT 'All tests completed successfully!' as final_message;