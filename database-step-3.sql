-- مرحله 3: اضافه کردن ایندکس‌های مفید
-- این مرحله رو بعد از مرحله 2 اجرا کنید

-- ایندکس‌های جدول محصولات
CREATE INDEX `idx_products_category` ON `products` (`category`);
CREATE INDEX `idx_products_status` ON `products` (`status`);
CREATE INDEX `idx_products_created_by` ON `products` (`created_by`);

-- ایندکس‌های جدول مشتریان (برای فیلترهای بهتر)
CREATE INDEX `idx_customers_industry` ON `customers` (`industry`);
CREATE INDEX `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX `idx_customers_city` ON `customers` (`city`);
CREATE INDEX `idx_customers_state` ON `customers` (`state`);

-- بررسی نتیجه
SELECT 'مرحله 3 تکمیل شد - ایندکس‌ها اضافه شدند' as message;
SHOW INDEX FROM products;
SHOW INDEX FROM customers WHERE Key_name LIKE 'idx_%';