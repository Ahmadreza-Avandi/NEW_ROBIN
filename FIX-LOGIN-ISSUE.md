# 🔧 راهنمای رفع مشکل لاگین و دیتابیس

## ⚡ راه حل سریع (اول این را امتحان کنید)

```bash
cd /root/NEW_ROBIN
chmod +x quick-fix-database.sh
./quick-fix-database.sh
```

این اسکریپت:
- ✅ دیتابیس‌های خالی را ایمپورت می‌کند
- ✅ دسترسی‌ها را تنظیم می‌کند
- ✅ NextJS را راه‌اندازی مجدد می‌کند

## 🔍 بررسی مشکل (برای تشخیص دقیق)

```bash
chmod +x check-and-fix-database.sh
./check-and-fix-database.sh
```

## 📋 مراحل دستی رفع مشکل

### 1. بررسی وضعیت دیتابیس‌ها

```bash
# بررسی دیتابیس‌ها
docker exec mysql mariadb -u root -p1234 -e "SHOW DATABASES;"

# بررسی جداول crm_system
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; SHOW TABLES;"

# بررسی کاربران
docker exec mysql mariadb -u root -p1234 -e "USE crm_system; SELECT email, is_active FROM users;"
```

### 2. اگر دیتابیس خالی است - ایمپورت

```bash
# ایمپورت crm_system
docker cp database/crm_system.sql $(docker compose -f docker-compose.deploy.yml ps -q mysql):/tmp/crm.sql
docker exec mysql mariadb -u root -p1234 crm_system < /tmp/crm.sql

# ایمپورت saas_master
docker cp database/saas_master.sql $(docker compose -f docker-compose.deploy.yml ps -q mysql):/tmp/saas.sql
docker exec mysql mariadb -u root -p1234 saas_master < /tmp/saas.sql
```

### 3. بازگردانی کاربر و رمز

```bash
# بازگردانی رمز کاربر CEO
docker exec mysql mariadb -u root -p1234 -e "
USE crm_system;
UPDATE users SET 
    password='\$2a\$10\$s5hegTVdWH53vz5820uOqOkYjbTQZZTvZGpwd.VyjF8.lmIeOC4ye',
    is_active=1,
    status='active'
WHERE email='Robintejarat@gmail.com';
"
```

### 4. راه‌اندازی مجدد NextJS

```bash
docker compose -f docker-compose.deploy.yml restart nextjs
```

## 🔐 اطلاعات لاگین

- **Email**: `Robintejarat@gmail.com`
- **Password**: `1234`

## 🔒 بررسی امنیت

### بررسی لاگ‌های مشکوک:

```bash
# لاگ‌های MySQL
docker logs mysql --tail 200 | grep -iE "(drop|delete|truncate|unauthorized)"

# لاگ‌های Nginx
docker logs nginx --tail 200 | grep -E "401|403"

# بررسی کاربران MySQL
docker exec mysql mariadb -u root -p1234 -e "SELECT User, Host FROM mysql.user;"
```

### اگر نفوذ رخ داده:

1. **تغییر رمزها**:
   ```bash
   docker exec mysql mariadb -u root -p1234 -e "ALTER USER 'crm_user'@'%' IDENTIFIED BY 'رمز_جدید_قوی'; FLUSH PRIVILEGES;"
   ```

2. **محدود کردن دسترسی**:
   - در `docker-compose.yml` پورت 3306 را به `127.0.0.1:3306:3306` تغییر دهید

3. **بک‌آپ گیری**:
   ```bash
   docker exec mysql mariadb-dump -u root -p1234 crm_system > backup_emergency_$(date +%Y%m%d_%H%M%S).sql
   ```

## 🆘 اگر همچنان مشکل دارید

1. اجرای `./check-and-fix-database.sh` و ذخیره خروجی
2. بررسی لاگ‌های NextJS: `docker logs nextjs --tail 100`
3. بررسی لاگ‌های MySQL: `docker logs mysql --tail 100`

