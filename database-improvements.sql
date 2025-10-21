-- بهبودهای دیتابیس برای سیستم CRM
-- تاریخ: 2025-10-11

-- 1. ایجاد جدول محصولات (اگر وجود ندارد)
CREATE TABLE IF NOT EXISTS `products` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `currency` varchar(3) DEFAULT 'IRR',
  `status` enum('active','inactive','discontinued') DEFAULT 'active',
  `sku` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `specifications` json DEFAULT NULL,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `sku_unique` (`sku`),
  KEY `idx_products_category` (`category`),
  KEY `idx_products_status` (`status`),
  KEY `idx_products_created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='محصولات';

-- 2. ایجاد جدول رابطه مشتری-محصول (علاقه‌مندی مشتری به محصولات)
-- ابتدا بدون foreign key ایجاد می‌کنیم
CREATE TABLE IF NOT EXISTS `customer_product_interests` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `interest_level` enum('low','medium','high') DEFAULT 'medium',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_product` (`customer_id`, `product_id`),
  KEY `idx_customer_interests` (`customer_id`),
  KEY `idx_product_interests` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='علاقه‌مندی مشتریان به محصولات';

-- 3. اضافه کردن فیلدهای جدید به جدول customers برای بهتر شدن فیلترها
ALTER TABLE `customers` 
ADD COLUMN IF NOT EXISTS `source` varchar(100) DEFAULT NULL COMMENT 'منبع کسب مشتری',
ADD COLUMN IF NOT EXISTS `tags` json DEFAULT NULL COMMENT 'برچسب‌های مشتری',
ADD COLUMN IF NOT EXISTS `custom_fields` json DEFAULT NULL COMMENT 'فیلدهای سفارشی',
ADD COLUMN IF NOT EXISTS `last_activity_date` timestamp NULL DEFAULT NULL COMMENT 'آخرین فعالیت',
ADD COLUMN IF NOT EXISTS `lead_score` int DEFAULT 0 COMMENT 'امتیاز مشتری',
ADD COLUMN IF NOT EXISTS `lifecycle_stage` enum('subscriber','lead','marketing_qualified_lead','sales_qualified_lead','opportunity','customer','evangelist','other') DEFAULT 'lead' COMMENT 'مرحله چرخه حیات مشتری';

-- 4. ایجاد ایندکس‌های بهتر برای فیلترها
CREATE INDEX IF NOT EXISTS `idx_customers_industry` ON `customers` (`industry`);
CREATE INDEX IF NOT EXISTS `idx_customers_assigned_to` ON `customers` (`assigned_to`);
CREATE INDEX IF NOT EXISTS `idx_customers_status` ON `customers` (`status`);
CREATE INDEX IF NOT EXISTS `idx_customers_priority` ON `customers` (`priority`);
CREATE INDEX IF NOT EXISTS `idx_customers_segment` ON `customers` (`segment`);
CREATE INDEX IF NOT EXISTS `idx_customers_city` ON `customers` (`city`);
CREATE INDEX IF NOT EXISTS `idx_customers_state` ON `customers` (`state`);
CREATE INDEX IF NOT EXISTS `idx_customers_source` ON `customers` (`source`);
CREATE INDEX IF NOT EXISTS `idx_customers_lifecycle_stage` ON `customers` (`lifecycle_stage`);
CREATE INDEX IF NOT EXISTS `idx_customers_created_at` ON `customers` (`created_at`);
CREATE INDEX IF NOT EXISTS `idx_customers_last_activity` ON `customers` (`last_activity_date`);

-- 5. ایجاد جدول برچسب‌های مشتری (برای مدیریت بهتر تگ‌ها)
CREATE TABLE IF NOT EXISTS `customer_tags_new` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `color` varchar(7) DEFAULT '#3B82F6',
  `description` text DEFAULT NULL,
  `usage_count` int DEFAULT 0,
  `created_by` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_tag_name` (`name`),
  KEY `idx_tags_usage` (`usage_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='برچسب‌های مشتری جدید';

-- 6. ایجاد جدول رابطه مشتری-برچسب
CREATE TABLE IF NOT EXISTS `customer_tag_relations` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `tag_id` varchar(36) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_customer_tag` (`customer_id`, `tag_id`),
  KEY `idx_customer_tags` (`customer_id`),
  KEY `idx_tag_customers` (`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='رابطه مشتری-برچسب';

-- 7. درج نمونه محصولات
INSERT IGNORE INTO `products` (`id`, `name`, `description`, `category`, `price`, `sku`, `created_by`) VALUES
('prod-001', 'خط تولید خوراک دام', 'دستگاه تولید خوراک دام با ظرفیت بالا', 'ماشین‌آلات کشاورزی', 50000000.00, 'FEED-LINE-001', 'ceo-001'),
('prod-002', 'آسیاب و میکسر', 'دستگاه آسیاب و میکسر برای تولید خوراک', 'ماشین‌آلات کشاورزی', 25000000.00, 'MILL-MIX-001', 'ceo-001'),
('prod-003', 'سیستم مدیریت CRM', 'نرم‌افزار مدیریت ارتباط با مشتری', 'نرم‌افزار', 10000000.00, 'CRM-SYS-001', 'ceo-001'),
('prod-004', 'تجهیزات دامداری', 'تجهیزات کامل دامداری', 'تجهیزات دامی', 30000000.00, 'FARM-EQ-001', 'ceo-001');

-- 8. درج نمونه برچسب‌ها
INSERT IGNORE INTO `customer_tags_new` (`id`, `name`, `color`, `description`, `created_by`) VALUES
('tag-001', 'دامدار', '#10B981', 'مشتریان دامدار', 'ceo-001'),
('tag-002', 'کشاورز', '#F59E0B', 'مشتریان کشاورز', 'ceo-001'),
('tag-003', 'VIP', '#EF4444', 'مشتریان ویژه', 'ceo-001'),
('tag-004', 'پیگیری فوری', '#8B5CF6', 'نیاز به پیگیری فوری', 'ceo-001'),
('tag-005', 'مشتری جدید', '#06B6D4', 'مشتریان جدید', 'ceo-001');

-- 9. بروزرسانی برخی از مشتریان موجود با اطلاعات جدید
UPDATE `customers` SET 
  `source` = 'تماس تلفنی',
  `lifecycle_stage` = 'lead',
  `lead_score` = 50
WHERE `industry` LIKE '%دام%' OR `industry` LIKE '%پرورش%';

UPDATE `customers` SET 
  `source` = 'وب‌سایت',
  `lifecycle_stage` = 'marketing_qualified_lead',
  `lead_score` = 75
WHERE `priority` = 'high';

-- 10. ایجاد View برای گزارش‌گیری بهتر
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
  c.lifecycle_stage,
  c.lead_score,
  c.assigned_to,
  u.name as assigned_to_name,
  c.created_at,
  c.last_activity_date,
  COUNT(DISTINCT cpi.product_id) as interested_products_count,
  COUNT(DISTINCT ctr.tag_id) as tags_count,
  COUNT(DISTINCT a.id) as activities_count
FROM customers c
LEFT JOIN users u ON c.assigned_to = u.id
LEFT JOIN customer_product_interests cpi ON c.id = cpi.customer_id
LEFT JOIN customer_tag_relations ctr ON c.id = ctr.customer_id
LEFT JOIN activities a ON c.id = a.customer_id
GROUP BY c.id;

-- 11. ایجاد stored procedure برای جستجوی پیشرفته مشتریان
DELIMITER //
CREATE OR REPLACE PROCEDURE SearchCustomers(
  IN search_term VARCHAR(255),
  IN filter_industry VARCHAR(100),
  IN filter_status VARCHAR(50),
  IN filter_priority VARCHAR(50),
  IN filter_assigned_to VARCHAR(36),
  IN filter_city VARCHAR(100),
  IN filter_source VARCHAR(100),
  IN limit_count INT,
  IN offset_count INT
)
BEGIN
  SET @sql = 'SELECT * FROM customer_summary_view WHERE 1=1';
  
  IF search_term IS NOT NULL AND search_term != '' THEN
    SET @sql = CONCAT(@sql, ' AND (name LIKE "%', search_term, '%" OR email LIKE "%', search_term, '%" OR phone LIKE "%', search_term, '%")');
  END IF;
  
  IF filter_industry IS NOT NULL AND filter_industry != '' THEN
    SET @sql = CONCAT(@sql, ' AND industry = "', filter_industry, '"');
  END IF;
  
  IF filter_status IS NOT NULL AND filter_status != '' THEN
    SET @sql = CONCAT(@sql, ' AND status = "', filter_status, '"');
  END IF;
  
  IF filter_priority IS NOT NULL AND filter_priority != '' THEN
    SET @sql = CONCAT(@sql, ' AND priority = "', filter_priority, '"');
  END IF;
  
  IF filter_assigned_to IS NOT NULL AND filter_assigned_to != '' THEN
    SET @sql = CONCAT(@sql, ' AND assigned_to = "', filter_assigned_to, '"');
  END IF;
  
  IF filter_city IS NOT NULL AND filter_city != '' THEN
    SET @sql = CONCAT(@sql, ' AND city = "', filter_city, '"');
  END IF;
  
  IF filter_source IS NOT NULL AND filter_source != '' THEN
    SET @sql = CONCAT(@sql, ' AND source = "', filter_source, '"');
  END IF;
  
  SET @sql = CONCAT(@sql, ' ORDER BY created_at DESC');
  
  IF limit_count IS NOT NULL AND limit_count > 0 THEN
    SET @sql = CONCAT(@sql, ' LIMIT ', limit_count);
    IF offset_count IS NOT NULL AND offset_count > 0 THEN
      SET @sql = CONCAT(@sql, ' OFFSET ', offset_count);
    END IF;
  END IF;
  
  PREPARE stmt FROM @sql;
  EXECUTE stmt;
  DEALLOCATE PREPARE stmt;
END //
DELIMITER ;

-- 12. تریگر برای بروزرسانی آخرین فعالیت مشتری
DELIMITER //
CREATE OR REPLACE TRIGGER update_customer_last_activity
AFTER INSERT ON activities
FOR EACH ROW
BEGIN
  UPDATE customers 
  SET last_activity_date = NOW() 
  WHERE id = NEW.customer_id;
END //
DELIMITER ;

-- 13. تریگر برای بروزرسانی تعداد استفاده از برچسب‌ها
DELIMITER //
CREATE OR REPLACE TRIGGER update_tag_usage_count
AFTER INSERT ON customer_tag_relations
FOR EACH ROW
BEGIN
  UPDATE customer_tags 
  SET usage_count = usage_count + 1 
  WHERE id = NEW.tag_id;
END //
DELIMITER ;

DELIMITER //
CREATE OR REPLACE TRIGGER decrease_tag_usage_count
AFTER DELETE ON customer_tag_relations
FOR EACH ROW
BEGIN
  UPDATE customer_tags 
  SET usage_count = usage_count - 1 
  WHERE id = OLD.tag_id;
END //
DELIMITER ;

-- پایان اسکریپت بهبود دیتابیس