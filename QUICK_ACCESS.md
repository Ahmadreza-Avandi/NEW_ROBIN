# 🚀 دسترسی سریع به سیستم

## 🌐 آدرس‌های دسترسی

### سیستم اصلی CRM
```
https://crm.robintejarat.com
```

### phpMyAdmin (مدیریت دیتابیس)
```
https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
```

## 🔐 اطلاعات ورود

### phpMyAdmin - لایه اول (Basic Auth)
```bash
# برای مشاهده اطلاعات:
cat .phpmyadmin_credentials
```

### phpMyAdmin - لایه دوم (MySQL)
- **Username:** `crm_user` یا `root`
- **Password:** `1234`
- **Server:** `mysql` (پیش‌فرض)

### دیتابیس‌ها
- **CRM System:** `crm_system`
- **SaaS Master:** `saas_master`

## 🛠️ دستورات مفید

### مشاهده وضعیت سرویس‌ها
```bash
docker-compose ps
```

### مشاهده لاگ‌ها
```bash
# همه سرویس‌ها
docker-compose logs -f

# فقط nginx
docker logs -f crm-nginx

# فقط phpMyAdmin
docker logs -f crm-phpmyadmin

# فقط MySQL
docker logs -f crm-mysql
```

### Restart سرویس‌ها
```bash
# همه سرویس‌ها
docker-compose restart

# فقط nginx
docker-compose restart nginx

# فقط phpMyAdmin
docker-compose restart phpmyadmin
```

### دسترسی به MySQL از خط فرمان
```bash
# با کاربر root
docker exec -it crm-mysql mysql -u root -p1234

# با کاربر crm_user
docker exec -it crm-mysql mysql -u crm_user -p1234 crm_system
```

### Backup دیتابیس
```bash
# Backup همه دیتابیس‌ها
docker exec crm-mysql mysqldump -u root -p1234 --all-databases > backup-$(date +%Y%m%d).sql

# Backup فقط crm_system
docker exec crm-mysql mysqldump -u root -p1234 crm_system > crm_system-$(date +%Y%m%d).sql
```

### تغییر رمز عبور Basic Auth
```bash
# ایجاد رمز جدید
NEW_PASS=$(openssl rand -base64 24)
echo "New password: $NEW_PASS"

# آپدیت .htpasswd (نیاز به htpasswd tool)
htpasswd -b nginx/.htpasswd dbadmin "$NEW_PASS"

# Restart nginx
docker-compose restart nginx
```

## ⚠️ نکات امنیتی مهم

1. **حذف فایل credentials پس از یادداشت:**
   ```bash
   rm .phpmyadmin_credentials
   ```

2. **تغییر رمز عبور MySQL:**
   ```bash
   docker exec -it crm-mysql mysql -u root -p1234
   ALTER USER 'root'@'%' IDENTIFIED BY 'NEW_PASSWORD';
   ALTER USER 'crm_user'@'%' IDENTIFIED BY 'NEW_PASSWORD';
   FLUSH PRIVILEGES;
   ```

3. **بررسی فایل .env در git:**
   ```bash
   git rm --cached .env
   echo ".env" >> .gitignore
   ```

## 📚 مستندات کامل

برای اطلاعات بیشتر:
- [راهنمای امنیت phpMyAdmin](./PHPMYADMIN_SECURITY.md)
- [مستندات Deploy](./deploy-server.sh)

## 🆘 عیب‌یابی سریع

### مشکل: نمی‌توانم به phpMyAdmin دسترسی پیدا کنم
```bash
# بررسی وضعیت سرویس‌ها
docker-compose ps

# بررسی لاگ nginx
docker logs crm-nginx | tail -50

# بررسی لاگ phpMyAdmin
docker logs crm-phpmyadmin | tail -50

# Restart nginx
docker-compose restart nginx
```

### مشکل: Basic Auth کار نمی‌کند
```bash
# بررسی وجود فایل .htpasswd
ls -la nginx/.htpasswd

# بررسی mount شدن volume
docker inspect crm-nginx | grep htpasswd

# ایجاد مجدد .htpasswd
htpasswd -c nginx/.htpasswd dbadmin
docker-compose restart nginx
```

### مشکل: MySQL connection error
```bash
# بررسی وضعیت MySQL
docker exec crm-mysql mysqladmin -u root -p1234 ping

# بررسی لاگ MySQL
docker logs crm-mysql | tail -50

# Restart MySQL
docker-compose restart mysql
```

---

**آخرین بروزرسانی:** $(date)
