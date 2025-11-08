# راهنمای اجرای Migration

## مرحله 1: اجرای Migration برای اضافه کردن tenant_key

این migration فیلد `tenant_key` رو به همه جداول اصلی اضافه میکنه تا سیستم multi-tenant بشه.

### نحوه اجرا:

#### روش 1: از طریق MySQL Command Line
```bash
mysql -u root -p crm_system < migrations/add_tenant_key.sql
```

#### روش 2: از طریق phpMyAdmin یا MySQL Workbench
1. فایل `add_tenant_key.sql` رو باز کن
2. محتوای اون رو کپی کن
3. توی phpMyAdmin یا MySQL Workbench بزن SQL tab
4. کد رو paste کن و اجرا کن

#### روش 3: از طریق PowerShell (Windows)
```powershell
Get-Content migrations/add_tenant_key.sql | mysql -u root -p crm_system
```

### توضیحات:
- همه جداول اصلی فیلد `tenant_key` با مقدار پیش‌فرض `'rabin'` دریافت میکنن
- Index هم برای بهبود performance اضافه میشه
- داده‌های موجود حفظ میشن و tenant_key اونها `'rabin'` میشه

### بعد از اجرا:
سرور Next.js رو ریستارت کن تا تغییرات اعمال بشه.

## مرحله 2: ایجاد داده‌های نمونه برای tenant های مختلف

برای تست multi-tenant، باید user و داده‌های جداگانه برای هر tenant بسازی:

```bash
# ایجاد user های نمونه برای demo و samin
mysql -u root -p crm_system < migrations/create_demo_users.sql
```

این اسکریپت:
- 4 user برای tenant 'demo' میسازه
- 4 user برای tenant 'samin' میسازه  
- مشتریان و وظایف نمونه برای هر tenant
- رمز عبور همه: `123456`

## مرحله 3: تست کردن

بعد از اجرای migration، این موارد رو تست کن:
1. لاگین به `/demo/dashboard` با user های demo
2. لاگین به `/samin/dashboard` با user های samin
3. لاگین به `/rabin/dashboard` با user های rabin (موجود)
4. چک کن که هر tenant فقط داده‌های خودش رو میبینه:
   - همکاران
   - مشتریان
   - وظایف
   - چت

## نکات مهم:
- قبل از اجرا حتماً backup از دیتابیس بگیر
- اگر خطا دادی، لاگ خطا رو بفرست
- tenant_key پیش‌فرض `'rabin'` هست
- برای tenant های جدید باید user و داده‌های جداگانه بسازی
- هر tenant باید حداقل یک CEO یا admin داشته باشه
