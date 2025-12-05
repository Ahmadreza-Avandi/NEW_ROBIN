# راهنمای افزودن عکس به محصولات

## مراحل نصب و راه‌اندازی

### 1. اضافه کردن فیلد image به دیتابیس

```bash
node add-product-image.cjs
```

این دستور فیلد `image` را به جدول `products` اضافه می‌کند.

### 2. ساخت پوشه uploads

```bash
mkdir -p public/uploads/products
```

### 3. ریستارت سرور Next.js

```bash
# Ctrl+C برای توقف سرور
npm run dev
```

## ویژگی‌های اضافه شده

### ✅ API Endpoints

1. **آپلود تصویر**: `POST /api/products/upload-image`
   - پشتیبانی از فرمت‌های: JPG, PNG, WEBP, GIF
   - حداکثر حجم: 5MB
   - نام فایل یونیک با UUID
   - ذخیره در: `public/uploads/products/`

2. **ایجاد محصول**: `POST /api/tenant/products`
   - فیلد جدید: `image` (اختیاری)

3. **بروزرسانی محصول**: `PUT /api/tenant/products`
   - امکان آپدیت تصویر محصول

### ✅ صفحات Frontend

1. **افزودن محصول**: `/[tenant_key]/dashboard/products/new`
   - آپلود تصویر با drag & drop
   - پیش‌نمایش تصویر قبل از ذخیره
   - امکان حذف و تغییر تصویر

2. **لیست محصولات**: `/[tenant_key]/dashboard/products`
   - نمایش تصویر محصولات در کارت‌ها
   - fallback برای محصولات بدون تصویر

## نحوه استفاده

### افزودن محصول با تصویر

1. به صفحه افزودن محصول بروید
2. روی قسمت "برای آپلود تصویر کلیک کنید" کلیک کنید
3. تصویر مورد نظر را انتخاب کنید
4. پیش‌نمایش تصویر نمایش داده می‌شود
5. فرم را تکمیل کنید و "ذخیره محصول" را بزنید

### ویرایش تصویر محصول

(این قسمت در مرحله بعد اضافه می‌شود)

## ساختار دیتابیس

```sql
ALTER TABLE products 
ADD COLUMN image VARCHAR(500) NULL AFTER description;
```

فیلد `image` مسیر نسبی تصویر را ذخیره می‌کند:
- مثال: `/uploads/products/abc123-def456.jpg`

## نکات امنیتی

✅ بررسی نوع فایل (فقط تصویر)
✅ محدودیت حجم فایل (5MB)
✅ نام فایل یونیک با UUID
✅ ذخیره در پوشه عمومی با دسترسی محدود

## مثال API Request

### آپلود تصویر

```javascript
const formData = new FormData();
formData.append('image', imageFile);

const response = await fetch('/api/products/upload-image', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// { success: true, data: { url: '/uploads/products/...', filename: '...' } }
```

### ایجاد محصول با تصویر

```javascript
const response = await fetch('/api/tenant/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Key': tenantKey
  },
  body: JSON.stringify({
    name: 'محصول نمونه',
    description: 'توضیحات',
    image: '/uploads/products/abc123.jpg',
    category: 'دسته‌بندی',
    price: 100000,
    currency: 'IRR',
    status: 'active'
  }),
});
```

## مراحل بعدی (اختیاری)

- [ ] صفحه ویرایش محصول با قابلیت تغییر تصویر
- [ ] نمایش تصویر در صفحه جزئیات محصول
- [ ] گالری تصاویر (چند تصویر برای هر محصول)
- [ ] فشرده‌سازی خودکار تصاویر
- [ ] ذخیره در cloud storage (S3, Cloudinary)
