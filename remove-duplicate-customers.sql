-- حذف مشتریان تکراری

-- مرحله 1: بررسی تعداد مشتریان تکراری
SELECT 'Checking duplicate customers...' as step;
SELECT 
    name, 
    phone, 
    COUNT(*) as duplicate_count 
FROM customers 
GROUP BY name, phone 
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- مرحله 2: حذف رکوردهای تکراری (نگه داشتن آخرین رکورد)
DELETE c1 FROM customers c1
INNER JOIN customers c2 
WHERE 
    c1.id < c2.id 
    AND c1.name = c2.name 
    AND c1.phone = c2.phone;

-- مرحله 3: بررسی نتیجه
SELECT 'After cleanup...' as step;
SELECT COUNT(*) as total_customers FROM customers;

-- مرحله 4: اضافه کردن ایندکس منحصر به فرد برای جلوگیری از تکرار در آینده
ALTER TABLE customers 
ADD UNIQUE INDEX unique_customer_name_phone (name, phone);

SELECT 'Duplicate customers removed successfully!' as message;