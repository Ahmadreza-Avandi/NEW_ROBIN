-- =====================================================
-- تغییر ساختار جدول customers
-- اضافه کردن فیلد company_name (نام شرکت)
-- =====================================================
-- 
-- توضیحات:
-- - فیلد name: نام و نام خانوادگی مشتری (مثل "احمدرضا آوندی") - الزامی
-- - فیلد company_name: نام شرکت (اختیاری)
-- - لاجیک segment:
--   * اگر company_name خالی باشد → segment = 'individual' (مشتری فردی)
--   * اگر company_name پر باشد → segment = 'small_business' (کسب و کار کوچک)
--   * enterprise باید دستی تنظیم شود
-- 
-- =====================================================

-- مرحله 1: بررسی وجود فیلد company_name
SELECT 'بررسی ساختار فعلی جدول customers...' as status;

-- مرحله 2: اضافه کردن فیلد company_name (اگر وجود ندارد)
ALTER TABLE `customers` 
ADD COLUMN IF NOT EXISTS `company_name` VARCHAR(255) NULL 
COMMENT 'نام شرکت - اگر خالی باشد مشتری فردی است' 
AFTER `name`;

-- مرحله 3: ایجاد ایندکس برای جستجوی سریع‌تر
CREATE INDEX IF NOT EXISTS `idx_customers_company_name` ON `customers` (`company_name`);

-- مرحله 4: بررسی نتیجه
SELECT 'فیلد company_name با موفقیت اضافه شد' as status;

-- نمایش نمونه داده‌ها
SELECT 
  id, 
  name as 'نام و نام خانوادگی', 
  company_name as 'نام شرکت',
  segment as 'بخش',
  industry as 'صنعت'
FROM customers 
LIMIT 10;
