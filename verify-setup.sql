-- بررسی نهایی تنظیمات دیتابیس

-- 1. بررسی جداول ایجاد شده
SELECT 'Step 1: Checking tables...' as step;
SHOW TABLES LIKE 'products';
SHOW TABLES LIKE 'customer_product_interests';

-- 2. بررسی محصولات
SELECT 'Step 2: Checking products...' as step;
SELECT COUNT(*) as total_products FROM products;
SELECT id, name, category, CONCAT(price, ' ', currency) as price_display FROM products;

-- 3. بررسی علاقه‌مندی‌ها
SELECT 'Step 3: Checking customer interests...' as step;
SELECT COUNT(*) as total_interests FROM customer_product_interests;

-- 4. بررسی join بین جداول
SELECT 'Step 4: Testing joins...' as step;
SELECT 
  c.name as customer_name,
  p.name as product_name,
  cpi.interest_level,
  cpi.notes
FROM customer_product_interests cpi
JOIN customers c ON cpi.customer_id = c.id
JOIN products p ON cpi.product_id = p.id
ORDER BY c.name, p.name;

-- 5. بررسی فیلد source در customers
SELECT 'Step 5: Checking source field...' as step;
DESCRIBE customers;

-- 6. آمار نهایی
SELECT 'Step 6: Final statistics...' as step;
SELECT 
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM products) as total_products,
  (SELECT COUNT(*) FROM customer_product_interests) as total_interests,
  (SELECT COUNT(DISTINCT customer_id) FROM customer_product_interests) as customers_with_interests;

-- 7. بررسی مشتریان با محصولات علاقه‌مند
SELECT 'Step 7: Customers with product interests...' as step;
SELECT 
  c.name as customer_name,
  c.city,
  COUNT(cpi.id) as interested_products_count,
  GROUP_CONCAT(p.name SEPARATOR ', ') as interested_products
FROM customers c
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id
LEFT JOIN products p ON cpi.product_id = p.id
GROUP BY c.id, c.name, c.city
HAVING interested_products_count > 0
ORDER BY interested_products_count DESC;

SELECT 'All verification completed successfully!' as final_message;