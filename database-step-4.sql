-- مرحله 4: اضافه کردن فیلد source به جدول customers
-- این مرحله رو بعد از مرحله 3 اجرا کنید

-- اضافه کردن فیلد source (اگر وجود نداشته باشد)
ALTER TABLE `customers` ADD COLUMN `source` varchar(100) DEFAULT NULL COMMENT 'منبع کسب مشتری';

-- ایجاد ایندکس برای فیلد source
CREATE INDEX `idx_customers_source` ON `customers` (`source`);

-- بروزرسانی منبع مشتریان موجود بر اساس صنعت
UPDATE `customers` SET `source` = 'تماس تلفنی' 
WHERE (`industry` LIKE '%دام%' OR `industry` LIKE '%پرورش%' OR `industry` LIKE '%گوساله%' OR `industry` LIKE '%بره%') 
AND `source` IS NULL;

UPDATE `customers` SET `source` = 'وب‌سایت' 
WHERE `priority` = 'high' AND `source` IS NULL;

UPDATE `customers` SET `source` = 'معرفی' 
WHERE `segment` = 'enterprise' AND `source` IS NULL;

UPDATE `customers` SET `source` = 'تماس سرد' 
WHERE `source` IS NULL;

-- بررسی نتیجه
SELECT 'مرحله 4 تکمیل شد - فیلد source اضافه شد' as message;
SELECT source, COUNT(*) as count FROM customers GROUP BY source;