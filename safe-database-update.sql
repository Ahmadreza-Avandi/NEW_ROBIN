-- اسکریپت محتاطانه بروزرسانی دیتابیس
-- این اسکریپت جداول موجود را حذف نمی‌کند

-- 1. بررسی و اصلاح جدول products
-- ابتدا ساختار فعلی را ببینید:
-- DESCRIBE products;

-- اگر فیلدهای مورد نیاز وجود ندارند، آنها را اضافه کنید:
-- (اگر خطا دادند، یعنی قبلاً وجود دارند - نگران نباشید)

-- اضافه کردن فیلد description اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'description') > 0,
  'SELECT "Column description already exists"',
  'ALTER TABLE products ADD COLUMN description text'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- اضافه کردن فیلد category اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'category') > 0,
  'SELECT "Column category already exists"',
  'ALTER TABLE products ADD COLUMN category varchar(100)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- اضافه کردن فیلد price اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'price') > 0,
  'SELECT "Column price already exists"',
  'ALTER TABLE products ADD COLUMN price decimal(15,2)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- اضافه کردن فیلد currency اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'currency') > 0,
  'SELECT "Column currency already exists"',
  'ALTER TABLE products ADD COLUMN currency varchar(3) DEFAULT "IRR"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- اضافه کردن فیلد status اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'status') > 0,
  'SELECT "Column status already exists"',
  'ALTER TABLE products ADD COLUMN status enum("active","inactive") DEFAULT "active"'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- اضافه کردن فیلد sku اگر وجود ندارد:
SET @sql = (SELECT IF(
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE table_name = 'products' 
   AND table_schema = DATABASE() 
   AND column_name = 'sku') > 0,
  'SELECT "Column sku already exists"',
  'ALTER TABLE products ADD COLUMN sku varchar(100)'
));
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. ایجاد جدول customer_product_interests اگر وجود ندارد:
CREATE TABLE IF NOT EXISTS `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text,
  `created_at` timestamp DEFAULT current_timestamp(),
  `updated_at` timestamp DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
);

-- اضافه کردن ایندکس‌ها اگر وجود ندارند:
-- (اگر خطا دادند، یعنی قبلاً وجود دارند)
ALTER TABLE `customer_product_interests` ADD UNIQUE KEY `unique_customer_product` (`customer_id`, `product_id`);
ALTER TABLE `customer_product_interests` ADD INDEX `idx_customer_interests` (`customer_id`);
ALTER TABLE `customer_product_interests` ADD INDEX `idx_product_interests` (`product_id`);

-- 3. اضافه کردن فیلدهای جدید به جدول customers:
-- (اگر خطا دادند، یعنی قبلاً وجود دارند)
ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `last_activity_date` timestamp NULL DEFAULT NULL;
ALTER TABLE `customers` ADD COLUMN `lead_score` int DEFAULT 0;

-- 4. ایجاد ایندکس‌های مفید:
-- (اگر خطا دادند، یعنی قبلاً وجود دارند)
CREATE INDEX `idx_customers_industry` ON `customers` (`industry`);
CREATE INDEX `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX `idx_customers_city` ON `customers` (`city`);
CREATE INDEX `idx_customers_source` ON `customers` (`source`);

-- 5. درج نمونه محصولات (فقط اگر وجود نداشته باشند):
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category`, `price`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام با ظرفیت بالا', 'ماشین‌آلات کشاورزی', 50000000.00, 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر برای تولید خوراک', 'ماشین‌آلات کشاورزی', 25000000.00, 'MILL-MIX-001', 'ceo-001'),
('prod-003', 'سیستم مدیریت CRM', 'نرم‌افزار مدیریت ارتباط با مشتری', 'نرم‌افزار', 10000000.00, 'CRM-SYS-001', 'ceo-001'),
('prod-004', 'تجهیزات دامداری', 'تجهیزات کامل دامداری', 'تجهیزات دامی', 30000000.00, 'FARM-EQ-001', 'ceo-001');

-- 6. بروزرسانی منبع مشتریان موجود:
UPDATE `customers` SET `source` = 'تماس تلفنی' 
WHERE (`industry` LIKE '%دام%' OR `industry` LIKE '%پرورش%') AND `source` IS NULL;

UPDATE `customers` SET `source` = 'وب‌سایت' 
WHERE `priority` = 'high' AND `source` IS NULL;

-- پایان اسکریپت
SELECT 'Database update completed successfully!' as message;