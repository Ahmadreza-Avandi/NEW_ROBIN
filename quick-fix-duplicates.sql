-- حذف سریع مشتریان تکراری

-- حذف رکوردهای کاملاً تکراری (همه فیلدها یکسان)
DELETE c1 FROM customers c1
INNER JOIN customers c2 
WHERE c1.id > c2.id 
  AND c1.name = c2.name 
  AND COALESCE(c1.phone, '') = COALESCE(c2.phone, '')
  AND COALESCE(c1.email, '') = COALESCE(c2.email, '');

-- بررسی نتیجه
SELECT 'Duplicates removed!' as message;
SELECT COUNT(*) as remaining_customers FROM customers;