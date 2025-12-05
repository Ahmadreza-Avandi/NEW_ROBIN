-- اضافه کردن فیلد image به جدول products
ALTER TABLE products 
ADD COLUMN image VARCHAR(500) NULL AFTER description;

-- نمایش ساختار جدید
DESCRIBE products;
