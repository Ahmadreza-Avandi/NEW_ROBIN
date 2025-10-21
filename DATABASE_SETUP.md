# راهنمای راه‌اندازی دیتابیس CRM

## ورژن‌های استفاده شده
- **MariaDB**: 10.4.32
- **phpMyAdmin**: 5.2.2

## فایل‌های دیتابیس
- `database/init.sql`: اسکریپت اولیه ایجاد دیتابیس و کاربر
- `database/crm_system.sql`: ساختار کامل جداول و داده‌های نمونه

## راه‌اندازی خودکار
اسکریپت `deploy-server.sh` به‌طور خودکار:
1. فولدر `database` را ایجاد می‌کند
2. فایل‌های لازم را کپی می‌کند
3. دیتابیس را initialize می‌کند
4. اتصال را تست می‌کند

## تست دستی دیتابیس
```bash
# اجرای اسکریپت تست
./test-database.sh

# یا تست دستی
docker-compose exec mysql mariadb -u root -p
```

## دستورات مفید

### بک‌آپ دیتابیس
```bash
docker-compose exec mysql mariadb-dump -u root -p${DATABASE_PASSWORD}_ROOT crm_system > backup.sql
```

### بازیابی دیتابیس
```bash
docker-compose exec -T mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT crm_system < backup.sql
```

### مشاهده لاگ‌های دیتابیس
```bash
docker-compose logs mysql
```

### اتصال به دیتابیس
```bash
docker-compose exec mysql mariadb -u root -p${DATABASE_PASSWORD}_ROOT
```

## تنظیمات محیطی مورد نیاز در .env
```
DATABASE_HOST=mysql
DATABASE_NAME=crm_system
DATABASE_USER=crm_app_user
DATABASE_PASSWORD=your_strong_password
```

## مشکلات رایج و راه‌حل

### دیتابیس initialize نمی‌شود
- مطمئن شوید فولدر `database` وجود دارد
- بررسی کنید فایل‌های `init.sql` و `crm_system.sql` در فولدر `database` هستند

### خطای اتصال
- بررسی کنید متغیرهای محیطی در `.env` درست تنظیم شده‌اند
- مطمئن شوید کانتینر mysql در حال اجراست: `docker-compose ps`

### phpMyAdmin کار نمی‌کند
- آدرس: `http://your-domain/secure-db-admin-panel-x7k9m2/`
- نام کاربری: مقدار `DATABASE_USER` از `.env`
- رمز عبور: مقدار `DATABASE_PASSWORD` از `.env`