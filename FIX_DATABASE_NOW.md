# 🚨 راهنمای سریع: رفع مشکل دیتابیس

## ⚡ راه‌حل فوری (الان روی سرور اجرا کنید)

### گام 1: ایمپورت سریع دیتابیس

```bash
# اجرای اسکریپت ایمپورت سریع
chmod +x import-database-now.sh
./import-database-now.sh
```

این اسکریپت:
- ✅ فایل‌های SQL را به کانتینر MySQL کپی می‌کند
- ✅ دیتابیس‌ها را ایمپورت می‌کند
- ✅ دسترسی‌ها را تست می‌کند
- ✅ تعداد جداول را نمایش می‌دهد

### گام 2: Restart سرویس‌ها

```bash
docker-compose -f docker-compose.deploy.yml restart
```

### گام 3: تست دسترسی

```bash
# تست crm_system
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u crm_user -p1234 -e "USE crm_system; SHOW TABLES;"

# تست saas_master
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u crm_user -p1234 -e "USE saas_master; SHOW TABLES;"
```

---

## 🔍 علت مشکل

### مشکل اصلی:
فایل‌های SQL در اولین راه‌اندازی ایمپورت نشدند چون:

1. **Volume قبلی وجود داشت** - init scripts فقط در اولین بار اجرا می‌شوند
2. **نام فایل‌ها اشتباه بود** - در کد `01-crm_system.sql` بود ولی فایل واقعی `crm_system.sql` است

### تغییرات اعمال شده:

#### در `deploy-server.sh`:
```bash
# قبل (اشتباه):
if [ -f "database/01-crm_system.sql" ]; then
    docker cp database/01-crm_system.sql ...

# بعد (درست):
if [ -f "database/crm_system.sql" ]; then
    docker cp database/crm_system.sql ...
```

---

## 📋 دستورات مفید

### بررسی وضعیت دیتابیس:

```bash
# تعداد جداول crm_system
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  SELECT COUNT(*) as table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'crm_system';
"

# تعداد جداول saas_master
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  SELECT COUNT(*) as table_count 
  FROM information_schema.tables 
  WHERE table_schema = 'saas_master';
"

# تعداد کاربران
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  USE crm_system;
  SELECT COUNT(*) as user_count FROM users;
"

# تعداد Super Admins
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  USE saas_master;
  SELECT COUNT(*) as admin_count FROM super_admins;
"
```

### ایمپورت دستی (اگر اسکریپت کار نکرد):

```bash
# کپی فایل‌ها
MYSQL_CONTAINER=$(docker-compose -f docker-compose.deploy.yml ps -q mysql)
docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm.sql
docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas.sql

# ایمپورت
docker exec $MYSQL_CONTAINER mariadb -u root -p1234 crm_system < /tmp/crm.sql
docker exec $MYSQL_CONTAINER mariadb -u root -p1234 saas_master < /tmp/saas.sql

# یا با docker-compose exec:
docker-compose -f docker-compose.deploy.yml exec mysql sh -c 'mariadb -u root -p1234 crm_system < /tmp/crm.sql'
docker-compose -f docker-compose.deploy.yml exec mysql sh -c 'mariadb -u root -p1234 saas_master < /tmp/saas.sql'
```

---

## 🔄 برای دیپلوی‌های بعدی

### اگر می‌خواهید دیتابیس از صفر ایمپورت شود:

```bash
# حذف volume و rebuild کامل
./deploy-server.sh --clean
```

این کار:
- ✅ Volume دیتابیس را حذف می‌کند
- ✅ همه چیز را از صفر build می‌کند
- ✅ فایل‌های SQL را خودکار ایمپورت می‌کند

### اگر فقط می‌خواهید دیتابیس را دوباره ایمپورت کنید:

```bash
# استفاده از اسکریپت سریع
./import-database-now.sh
```

---

## ✅ چک‌لیست تست

پس از ایمپورت، این موارد را بررسی کنید:

- [ ] تعداد جداول crm_system بیشتر از 30 است
- [ ] تعداد جداول saas_master بیشتر از 5 است
- [ ] حداقل 1 کاربر در جدول users وجود دارد
- [ ] حداقل 1 Super Admin در جدول super_admins وجود دارد
- [ ] می‌توانید با crm_user به هر دو دیتابیس دسترسی پیدا کنید
- [ ] می‌توانید به سیستم لاگین کنید

---

## 🆘 عیب‌یابی

### مشکل: "Access denied for user 'crm_user'"

```bash
# Reset رمز عبور
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  ALTER USER 'crm_user'@'%' IDENTIFIED BY '1234';
  FLUSH PRIVILEGES;
"
```

### مشکل: "Table doesn't exist"

```bash
# بررسی لیست جداول
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u root -p1234 -e "
  USE crm_system;
  SHOW TABLES;
"

# اگر خالی بود، دوباره ایمپورت کنید
./import-database-now.sh
```

### مشکل: "Can't connect to MySQL server"

```bash
# بررسی وضعیت MySQL
docker-compose -f docker-compose.deploy.yml ps mysql

# مشاهده لاگ‌ها
docker-compose -f docker-compose.deploy.yml logs mysql | tail -50

# Restart MySQL
docker-compose -f docker-compose.deploy.yml restart mysql
```

---

## 📞 دستورات سریع

```bash
# ایمپورت سریع (توصیه می‌شود)
./import-database-now.sh

# یا دستی:
MYSQL_CONTAINER=$(docker-compose -f docker-compose.deploy.yml ps -q mysql)
docker cp database/crm_system.sql $MYSQL_CONTAINER:/tmp/crm.sql
docker cp database/saas_master.sql $MYSQL_CONTAINER:/tmp/saas.sql
docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 crm_system < /tmp/crm.sql'
docker exec $MYSQL_CONTAINER sh -c 'mariadb -u root -p1234 saas_master < /tmp/saas.sql'

# Restart
docker-compose -f docker-compose.deploy.yml restart

# تست
docker-compose -f docker-compose.deploy.yml exec mysql mariadb -u crm_user -p1234 -e "USE crm_system; SELECT COUNT(*) FROM users;"
```

---

**زمان تخمینی:** 2-5 دقیقه
**سطح دشواری:** آسان
**نیاز به Downtime:** خیر (سیستم در حین ایمپورت کار می‌کند)
