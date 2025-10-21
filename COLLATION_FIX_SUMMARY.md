# خلاصه حل مشکل Collation در دیتابیس CRM

## مشکل اصلی
خطای `Illegal mix of collations (utf8mb4_unicode_ci,IMPLICIT) and (utf8mb4_general_ci,IMPLICIT)` در JOIN های بین جداول `activities`, `deals`, `customers` و `users`.

## علت مشکل
- جدول `activities` و `deals` از collation `utf8mb4_unicode_ci` استفاده می‌کردند
- جدول `customers` از collation `utf8mb4_general_ci` استفاده می‌کرد
- جدول `users` وجود نداشت

## راه‌حل‌های اعمال شده

### 1. تصحیح دیتابیس (fix-collation-simple.sql)
```sql
-- ایجاد جدول users با collation صحیح
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(36) NOT NULL DEFAULT (uuid()),
  `name` varchar(255) NOT NULL,
  -- ... سایر فیلدها
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- تغییر collation جدول customers
ALTER TABLE `customers` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد جداول products و deal_stages
-- اضافه کردن کاربران پیش‌فرض
-- اضافه کردن محصولات نمونه
-- اضافه کردن مراحل فروش
```

### 2. تصحیح API Routes

#### app/api/activities/route.ts
```typescript
// استفاده از COLLATE در JOIN ها
LEFT JOIN customers c ON a.customer_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
LEFT JOIN users u ON a.performed_by COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
```

#### app/api/deals/route.ts
```typescript
// استفاده از COLLATE در JOIN ها
LEFT JOIN customers c ON d.customer_id COLLATE utf8mb4_unicode_ci = c.id COLLATE utf8mb4_unicode_ci
LEFT JOIN users u ON d.assigned_to COLLATE utf8mb4_unicode_ci = u.id COLLATE utf8mb4_unicode_ci
```

## جداول ایجاد شده

### 1. جدول users
- ایجاد جدول کاربران با کاربران پیش‌فرض
- شامل نقش‌های مختلف (admin, sales, manager, etc.)

### 2. جدول products
- محصولات شرکت (خط تولید، میکسر، آسیاب، etc.)
- قیمت‌گذاری و دسته‌بندی

### 3. جدول deal_stages
- مراحل مختلف فروش
- از "لید جدید" تا "بسته شده"

## فایل‌های تصحیح شده
1. `fix-collation-simple.sql` - اسکریپت اصلی تصحیح
2. `app/api/activities/route.ts` - API فعالیت‌ها
3. `app/api/deals/route.ts` - API فروش‌ها
4. `test-collation-fix.sql` - اسکریپت تست

## مراحل اجرا
1. اجرای `fix-collation-simple.sql` در phpMyAdmin
2. ری‌استارت سرور Next.js
3. تست عملکرد صفحات `/dashboard/activities` و `/dashboard/sales`

## نتیجه
- حل مشکل collation در JOIN ها
- ایجاد ساختار کامل دیتابیس
- عملکرد صحیح API ها
- نمایش صحیح داده‌ها در فرانت‌اند

## توصیه‌ها
- همیشه از یک collation واحد در تمام جداول استفاده کنید
- قبل از JOIN، collation فیلدها را بررسی کنید
- از `utf8mb4_unicode_ci` برای پشتیبانی بهتر از زبان‌های مختلف استفاده کنید