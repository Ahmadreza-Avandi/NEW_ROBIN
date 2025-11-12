# 🔐 راهنمای امنیت phpMyAdmin

## تغییرات امنیتی اعمال شده

### 1. تغییر مسیر دسترسی
- **مسیر قدیم (ناامن):** `/secure-db-admin-panel-x7k9m2/`
- **مسیر جدید (امن):** `/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/`

### 2. احراز هویت دو لایه

#### لایه اول: Basic Authentication (nginx)
- قبل از دسترسی به phpMyAdmin، nginx یک username و password می‌خواهد
- این اطلاعات در فایل `.phpmyadmin_credentials` ذخیره می‌شود
- این لایه از حملات Brute Force به phpMyAdmin جلوگیری می‌کند

#### لایه دوم: MySQL Authentication
- پس از عبور از Basic Auth، باید با اطلاعات MySQL وارد شوید
- Username: `crm_user` یا `root`
- Password: `1234`

### 3. تنظیمات امنیتی اضافی

#### در docker-compose.yml:
```yaml
PMA_ARBITRARY: 0  # غیرفعال شد - فقط به سرور تعریف شده متصل می‌شود
```

#### در nginx:
- `X-Frame-Options: DENY` - جلوگیری از Clickjacking
- `X-Content-Type-Options: nosniff` - جلوگیری از MIME sniffing
- `Referrer-Policy: no-referrer` - عدم ارسال referrer
- `Cache-Control: no-store` - غیرفعال کردن cache

### 4. نحوه دسترسی

#### مرحله 1: دریافت اطلاعات Basic Auth
پس از اجرای `deploy-server.sh`، فایل `.phpmyadmin_credentials` ایجاد می‌شود:

```bash
cat .phpmyadmin_credentials
```

#### مرحله 2: دسترسی به phpMyAdmin
1. به آدرس زیر بروید:
   ```
   https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
   ```

2. در پنجره Basic Auth که باز می‌شود:
   - Username و Password از فایل `.phpmyadmin_credentials` را وارد کنید

3. در صفحه لاگین phpMyAdmin:
   - Server: `mysql` (پیش‌فرض)
   - Username: `crm_user` یا `root`
   - Password: `1234`

### 5. توصیه‌های امنیتی

#### ⚠️ فوری:
1. **فایل `.phpmyadmin_credentials` را پس از یادداشت حذف کنید:**
   ```bash
   rm .phpmyadmin_credentials
   ```

2. **رمز عبور MySQL را تغییر دهید:**
   ```bash
   # در کانتینر MySQL
   docker exec -it crm-mysql mysql -u root -p1234
   ALTER USER 'root'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
   ALTER USER 'crm_user'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
   FLUSH PRIVILEGES;
   ```

3. **فایل .env را از git حذف کنید:**
   ```bash
   git rm --cached .env
   echo ".env" >> .gitignore
   ```

#### 🔒 پیشرفته:
1. **محدودیت IP (اختیاری):**
   در فایل nginx config، می‌توانید دسترسی را به IP خاص محدود کنید:
   ```nginx
   location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
       allow 1.2.3.4;  # IP شما
       deny all;
       
       auth_basic "Database Management";
       auth_basic_user_file /etc/nginx/.htpasswd;
       # ...
   }
   ```

2. **تغییر دوره‌ای رمز عبور Basic Auth:**
   ```bash
   # ایجاد رمز جدید
   NEW_PASS=$(openssl rand -base64 24)
   echo "New password: $NEW_PASS"
   
   # آپدیت .htpasswd
   htpasswd -b nginx/.htpasswd dbadmin "$NEW_PASS"
   
   # Restart nginx
   docker-compose restart nginx
   ```

3. **فعال‌سازی لاگ دسترسی phpMyAdmin:**
   در nginx config:
   ```nginx
   location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
       access_log /var/log/nginx/phpmyadmin_access.log;
       error_log /var/log/nginx/phpmyadmin_error.log;
       # ...
   }
   ```

### 6. عیب‌یابی

#### مشکل: "401 Unauthorized" در Basic Auth
- بررسی کنید فایل `.htpasswd` در مسیر `nginx/.htpasswd` وجود دارد
- بررسی کنید volume در docker-compose صحیح mount شده:
  ```yaml
  - ./nginx/.htpasswd:/etc/nginx/.htpasswd:ro
  ```

#### مشکل: "Access denied" در phpMyAdmin
- Username و Password MySQL را بررسی کنید
- بررسی کنید کاربر در دیتابیس وجود دارد:
  ```bash
  docker exec -it crm-mysql mysql -u root -p1234 -e "SELECT user, host FROM mysql.user;"
  ```

#### مشکل: صفحه 404
- بررسی کنید nginx config به درستی reload شده:
  ```bash
  docker-compose restart nginx
  ```

### 7. مانیتورینگ

برای مشاهده تلاش‌های ناموفق دسترسی:
```bash
# لاگ‌های nginx
docker logs crm-nginx | grep "401"

# لاگ‌های phpMyAdmin
docker logs crm-phpmyadmin | grep "denied"
```

### 8. Backup و Recovery

قبل از هر تغییر امنیتی، حتماً backup بگیرید:
```bash
# Backup فایل‌های config
tar -czf nginx-config-backup-$(date +%Y%m%d).tar.gz nginx/

# Backup دیتابیس
docker exec crm-mysql mysqldump -u root -p1234 --all-databases > backup-$(date +%Y%m%d).sql
```

---

## 📞 پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های nginx و phpMyAdmin را بررسی کنید
2. تنظیمات docker-compose را چک کنید
3. اطمینان حاصل کنید که همه سرویس‌ها running هستند: `docker-compose ps`
