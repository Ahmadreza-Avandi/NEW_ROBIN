# 🔐 راهنمای ورود به phpMyAdmin

## آدرس دسترسی
```
http://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/
```
یا
```
https://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/
```

## اطلاعات ورود

### گزینه 1: ورود با کاربر عادی (توصیه می‌شود)
- **Server**: `mysql` (یا خالی بگذارید)
- **Username**: مقدار `DATABASE_USER` از فایل `.env` (معمولاً `crm_user`)
- **Password**: مقدار `DATABASE_PASSWORD` از فایل `.env`

این کاربر به دیتابیس‌های زیر دسترسی دارد:
- `crm_system` - دیتابیس اصلی CRM
- `saas_master` - دیتابیس مدیریت تنانت‌ها

### گزینه 2: ورود با root (فقط برای مدیریت پیشرفته)
- **Server**: `mysql` (یا خالی بگذارید)
- **Username**: `root`
- **Password**: مقدار `DATABASE_PASSWORD` از فایل `.env` + پسوند `_ROOT`
  - مثال: اگر `DATABASE_PASSWORD=mypass123` باشد، رمز root می‌شود: `mypass123_ROOT`

## نکات مهم

### 1. یافتن اطلاعات ورود
برای مشاهده اطلاعات ورود، فایل `.env` را باز کنید:
```bash
cat .env | grep DATABASE
```

خروجی مثال:
```
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=secure_password_here
DATABASE_NAME=crm_system
```

### 2. تست اتصال از خط فرمان
برای اطمینان از صحت اطلاعات ورود:

```bash
# تست با کاربر عادی
docker exec mysql mariadb -u crm_user -p'YOUR_PASSWORD' -e "SHOW DATABASES;"

# تست با root
docker exec mysql mariadb -u root -p'YOUR_PASSWORD_ROOT' -e "SHOW DATABASES;"
```

### 3. رفع مشکل "Access Denied"

اگر با خطای "Access Denied" مواجه شدید:

#### راه حل 1: بررسی رمز عبور
```bash
# نمایش متغیرهای محیطی
docker exec mysql env | grep MYSQL
```

#### راه حل 2: اجرای مجدد grant privileges
```bash
docker exec mysql mariadb -u root -p'YOUR_PASSWORD_ROOT' < database/01-grant-privileges.sql
```

#### راه حل 3: ایجاد مجدد کاربر
```bash
docker exec -it mysql mariadb -u root -p'YOUR_PASSWORD_ROOT'
```

سپس در MySQL:
```sql
-- حذف کاربر قدیمی
DROP USER IF EXISTS 'crm_user'@'%';
DROP USER IF EXISTS 'crm_user'@'localhost';

-- ایجاد کاربر جدید
CREATE USER 'crm_user'@'%' IDENTIFIED BY 'YOUR_PASSWORD';
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD';

-- دادن دسترسی‌ها
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON crm_system.* TO 'crm_user'@'localhost';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'%';
GRANT ALL PRIVILEGES ON saas_master.* TO 'crm_user'@'localhost';

FLUSH PRIVILEGES;
```

### 4. بررسی دسترسی‌های کاربر
```bash
docker exec mysql mariadb -u root -p'YOUR_PASSWORD_ROOT' -e "SHOW GRANTS FOR 'crm_user'@'%';"
```

## امنیت

⚠️ **نکات امنیتی مهم:**

1. **تغییر آدرس پیش‌فرض**: آدرس `/secure-db-admin-panel-x7k9m2/` را به یک مسیر تصادفی دیگر تغییر دهید
2. **محدود کردن دسترسی IP**: در nginx فقط به IP های مشخص اجازه دسترسی دهید
3. **استفاده از HTTPS**: همیشه از HTTPS برای دسترسی به phpMyAdmin استفاده کنید
4. **رمزهای قوی**: از رمزهای پیچیده و طولانی استفاده کنید
5. **غیرفعال کردن در production**: در صورت عدم نیاز، phpMyAdmin را غیرفعال کنید

## غیرفعال کردن phpMyAdmin

برای غیرفعال کردن موقت:
```bash
docker-compose stop phpmyadmin
```

برای حذف کامل از docker-compose:
```yaml
# در فایل docker-compose.yml سرویس phpmyadmin را comment کنید
```

## لاگ‌های phpMyAdmin

برای مشاهده لاگ‌های phpMyAdmin:
```bash
docker logs crm-phpmyadmin
```

یا برای مشاهده لحظه‌ای:
```bash
docker logs -f crm-phpmyadmin
```
