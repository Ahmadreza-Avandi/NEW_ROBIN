# 🔒 راهنمای بررسی امنیت و رفع مشکل دیتابیس

## 🚨 مشکل: دیتابیس‌ها حذف شده یا لاگین کار نمی‌کند

### مراحل بررسی و رفع

## 1️⃣ بررسی سریع وضعیت (اولین قدم)

```bash
# روی سرور لینوکس اجرا کنید:
cd /root/NEW_ROBIN
chmod +x check-and-fix-database.sh
./check-and-fix-database.sh
```

این اسکریپت:
- ✅ وضعیت کانتینرها را بررسی می‌کند
- ✅ وضعیت دیتابیس‌ها را بررسی می‌کند
- ✅ تعداد جداول و کاربران را نمایش می‌دهد
- ✅ لاگ‌های مشکوک را بررسی می‌کند
- ✅ دسترسی‌های امنیتی را بررسی می‌کند

## 2️⃣ رفع سریع دیتابیس (اگر خالی است)

```bash
chmod +x quick-fix-database.sh
./quick-fix-database.sh
```

این اسکریپت:
- ✅ دیتابیس‌های خالی را ایمپورت می‌کند
- ✅ دسترسی‌ها را تنظیم می‌کند
- ✅ NextJS را راه‌اندازی مجدد می‌کند

## 3️⃣ بررسی دستی دیتابیس

### بررسی وجود دیتابیس‌ها:
```bash
docker exec mysql mariadb -u root -p1234 -e "SHOW DATABASES;"
```

### بررسی جداول crm_system:
```bash
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;"
```

### بررسی کاربران:
```bash
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; SELECT email FROM users;"
```

## 4️⃣ بررسی امنیت و نفوذ

### بررسی لاگ‌های MySQL:
```bash
docker logs mysql --tail 100 | grep -iE "(drop|delete|truncate|unauthorized|access denied)"
```

### بررسی لاگ‌های Nginx:
```bash
docker logs nginx --tail 200 | grep -E "401|403|404" | awk '{print $1}' | sort | uniq -c | sort -rn
```

### بررسی کاربران غیرمجاز در MySQL:
```bash
docker exec mysql mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user WHERE User NOT IN ('root', 'mysql.sys', 'mysql.session', 'mysql.infoschema', 'crm_user');"
```

### بررسی حجم استفاده از دیتابیس:
```bash
docker exec mysql mariadb -u root -p1234 -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema IN ('crm_system', 'saas_master') GROUP BY table_schema;"
```

## 5️⃣ اقدامات امنیتی فوری

### 1. تغییر رمزهای عبور:
```bash
# تغییر رمز root MySQL (در docker-compose.yml)
# تغییر رمز crm_user
docker exec mysql mariadb -u root -p1234 -e "ALTER USER 'crm_user'@'%' IDENTIFIED BY 'رمز_جدید_قوی'; FLUSH PRIVILEGES;"
```

### 2. محدود کردن دسترسی از راه‌دور:
```bash
# در docker-compose.yml، پورت 3306 را فقط به localhost محدود کنید
ports:
  - "127.0.0.1:3306:3306"  # به جای "3306:3306"
```

### 3. بررسی فایل‌های .env:
```bash
# مطمئن شوید که رمزهای قوی در .env استفاده شده
cat .env | grep PASSWORD
```

### 4. بررسی فایل‌های phpMyAdmin:
```bash
# بررسی اینکه Basic Auth فعال است
cat nginx/active.conf | grep -A 5 "db-mgmt"
```

## 6️⃣ بک‌آپ گیری منظم

### بک‌آپ فوری:
```bash
# بک‌آپ crm_system
docker exec mysql mariadb-dump -u root -p1234 crm_system > backup_crm_$(date +%Y%m%d_%H%M%S).sql

# بک‌آپ saas_master
docker exec mysql mariadb-dump -u root -p1234 saas_master > backup_saas_$(date +%Y%m%d_%H%M%S).sql
```

### تنظیم بک‌آپ خودکار (cron):
```bash
# اضافه کردن به crontab
crontab -e

# اضافه کردن خط زیر برای بک‌آپ روزانه ساعت 2 صبح:
0 2 * * * cd /root/NEW_ROBIN && docker exec mysql mariadb-dump -u root -p1234 crm_system > backups/crm_$(date +\%Y\%m\%d).sql && docker exec mysql mariadb-dump -u root -p1234 saas_master > backups/saas_$(date +\%Y\%m\%d).sql
```

## 7️⃣ بررسی و رفع مشکل لاگین

### بررسی لاگ‌های NextJS:
```bash
docker logs nextjs --tail 50 | grep -iE "(error|database|connection|auth|login)"
```

### بررسی اتصال به دیتابیس از NextJS:
```bash
docker exec nextjs sh -c "node -e \"const mysql = require('mysql2/promise'); mysql.createConnection({host: 'mysql', user: 'crm_user', password: '1234', database: 'crm_system'}).then(c => {console.log('✅ Connected'); c.end();}).catch(e => console.error('❌', e.message));\""
```

### بررسی کاربر در دیتابیس:
```bash
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; SELECT id, email, is_active, status FROM users WHERE email='Robintejarat@gmail.com';"
```

### اگر کاربر موجود نیست یا رمز اشتباه است:
```bash
# بازگردانی رمز
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; UPDATE users SET password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye', is_active=1, status='active' WHERE email='Robintejarat@gmail.com';"
```

## 8️⃣ بهبود امنیت در deploy-server.sh

افزودن این موارد به deploy-server.sh:

1. ✅ بررسی حجم دیتابیس‌ها بعد از ایمپورت
2. ✅ بررسی تعداد کاربران
3. ✅ بررسی لاگ‌های مشکوک
4. ✅ بک‌آپ خودکار بعد از ایمپورت موفق

## 📞 در صورت نیاز به کمک بیشتر

1. خروجی `./check-and-fix-database.sh` را ذخیره کنید
2. لاگ‌های MySQL و NextJS را بررسی کنید
3. بررسی کنید که آیا حجم دیتابیس‌ها تغییر کرده یا نه

## ⚠️ اقدامات فوری برای امنیت

1. **فوری**: تغییر رمزهای عبور
2. **فوری**: محدود کردن دسترسی MySQL به localhost
3. **مهم**: فعال‌سازی بک‌آپ خودکار
4. **مهم**: بررسی لاگ‌ها برای فعالیت مشکوک
5. **پیشنهادی**: اضافه کردن fail2ban برای جلوگیری از brute force

