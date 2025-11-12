# 🚀 راهنمای Deploy تغییرات امنیتی phpMyAdmin

## 📋 خلاصه تغییرات

### تغییرات اعمال شده:
1. ✅ مسیر phpMyAdmin تغییر کرد: `/secure-db-admin-panel-x7k9m2/` → `/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/`
2. ✅ احراز هویت دو لایه اضافه شد (Basic Auth + MySQL)
3. ✅ تنظیمات امنیتی phpMyAdmin بهبود یافت
4. ✅ Security Headers اضافه شد

---

## 🎯 مراحل Deploy (گام به گام)

### مرحله 1: آماده‌سازی فایل‌ها (روی لوکال)

```bash
# 1. اطمینان از وجود فایل‌های به‌روز
git pull origin main

# 2. بررسی فایل‌های تغییر یافته
git status

# باید این فایل‌ها را ببینید:
# - deploy-server.sh
# - docker-compose.yml
# - nginx/default.conf
```

### مرحله 2: آپلود به سرور

```bash
# روش 1: با Git (توصیه می‌شود)
# روی سرور:
cd /path/to/project
git pull origin main

# روش 2: با SCP/SFTP
# از لوکال:
scp deploy-server.sh user@server:/path/to/project/
scp docker-compose.yml user@server:/path/to/project/
scp nginx/default.conf user@server:/path/to/project/nginx/
```

### مرحله 3: اجرای Deploy روی سرور

#### گزینه A: Deploy معمولی (توصیه می‌شود)

```bash
# اتصال به سرور
ssh user@crm.robintejarat.com

# رفتن به پوشه پروژه
cd /path/to/project

# اجرای اسکریپت deploy
chmod +x deploy-server.sh
./deploy-server.sh
```

**این کار انجام می‌دهد:**
- ✅ ایجاد username/password تصادفی برای Basic Auth
- ✅ ایجاد فایل `.htpasswd` برای nginx
- ✅ ذخیره اطلاعات در `.phpmyadmin_credentials`
- ✅ Build و راه‌اندازی سرویس‌ها
- ✅ نمایش اطلاعات دسترسی

#### گزینه B: Deploy با پاکسازی کامل

```bash
# اگر می‌خواهید همه چیز از صفر rebuild شود
./deploy-server.sh --clean
```

**⚠️ هشدار:** این کار volume دیتابیس را حذف می‌کند!

---

## 📝 پس از Deploy

### 1. یادداشت اطلاعات دسترسی

پس از اجرای deploy، اطلاعات زیر نمایش داده می‌شود:

```
📋 اطلاعات دسترسی phpMyAdmin:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 URL: https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/

🔐 Basic Auth (لایه اول امنیتی):
   Username: dbadmin_abc12345
   Password: xYz789AbC...

🗄️  MySQL Login (لایه دوم امنیتی):
   Username: crm_user
   Password: 1234
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**⚠️ مهم:** این اطلاعات را در جای امن یادداشت کنید!

### 2. مشاهده فایل credentials

```bash
# روی سرور
cat .phpmyadmin_credentials
```

**خروجی:**
```
# phpMyAdmin Access Credentials
# ================================
# URL: https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
# 
# Basic Auth (nginx):
# Username: dbadmin_abc12345
# Password: xYz789AbC...
#
# MySQL Login:
# Username: crm_user
# Password: 1234
# ================================
```

### 3. حذف فایل credentials (امنیت)

```bash
# پس از یادداشت، حذف کنید
rm .phpmyadmin_credentials

# یا نگه دارید اما دسترسی را محدود کنید
chmod 600 .phpmyadmin_credentials
```

---

## 🧪 تست دسترسی

### مرحله 1: باز کردن URL

```
https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
```

### مرحله 2: ورود Basic Auth

یک پنجره احراز هویت باز می‌شود:

```
┌─────────────────────────────────────┐
│ Database Management - Restricted   │
│ Access                              │
│                                     │
│ Username: [dbadmin_abc12345]       │
│ Password: [xYz789AbC...]           │
│                                     │
│         [Cancel]  [Sign in]        │
└─────────────────────────────────────┘
```

**اطلاعات را از `.phpmyadmin_credentials` وارد کنید**

### مرحله 3: ورود MySQL

پس از عبور از Basic Auth، صفحه phpMyAdmin باز می‌شود:

```
Server: mysql (پیش‌فرض)
Username: crm_user
Password: 1234
```

### مرحله 4: بررسی دسترسی

```sql
-- بررسی دیتابیس‌ها
SHOW DATABASES;

-- باید ببینید:
-- crm_system
-- saas_master
```

---

## 🔧 عیب‌یابی

### مشکل 1: "401 Unauthorized" در Basic Auth

**علت:** فایل `.htpasswd` وجود ندارد یا mount نشده

**راه‌حل:**
```bash
# بررسی وجود فایل
ls -la nginx/.htpasswd

# اگر وجود ندارد، دوباره deploy کنید
./deploy-server.sh

# یا دستی ایجاد کنید
htpasswd -c nginx/.htpasswd dbadmin
# رمز عبور را وارد کنید

# Restart nginx
docker-compose restart nginx
```

### مشکل 2: صفحه 404 Not Found

**علت:** nginx config به‌روز نشده

**راه‌حل:**
```bash
# بررسی nginx config
docker exec crm-nginx cat /etc/nginx/conf.d/default.conf | grep db-mgmt

# باید ببینید:
# location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/

# اگر ندیدید، restart کنید
docker-compose restart nginx

# یا rebuild کنید
docker-compose up -d --force-recreate nginx
```

### مشکل 3: "Access denied" در MySQL

**علت:** رمز عبور MySQL اشتباه است

**راه‌حل:**
```bash
# بررسی رمز عبور در .env
cat .env | grep DATABASE_PASSWORD

# تست اتصال
docker exec crm-mysql mysql -u crm_user -p1234 -e "SELECT 1;"

# اگر کار نکرد، رمز را reset کنید
docker exec -it crm-mysql mysql -u root -p1234
ALTER USER 'crm_user'@'%' IDENTIFIED BY '1234';
FLUSH PRIVILEGES;
```

### مشکل 4: مسیر قدیم هنوز کار می‌کند

**علت:** nginx config قدیمی هنوز فعال است

**راه‌حل:**
```bash
# حذف config قدیمی
docker exec crm-nginx rm -f /etc/nginx/conf.d/old-config.conf

# Restart nginx
docker-compose restart nginx
```

---

## 🔒 بهبودهای امنیتی اضافی (اختیاری)

### 1. محدودیت IP

اگر می‌خواهید فقط از IP خاص دسترسی داشته باشید:

```bash
# ویرایش nginx config
nano nginx/default.conf
```

اضافه کنید:
```nginx
location /db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/ {
    # محدودیت IP
    allow 1.2.3.4;      # IP شما
    allow 5.6.7.8;      # IP دفتر
    deny all;
    
    auth_basic "Database Management - Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;
    # ...
}
```

سپس:
```bash
docker-compose restart nginx
```

### 2. تغییر رمز عبور Basic Auth

```bash
# ایجاد رمز جدید
NEW_PASS=$(openssl rand -base64 24)
echo "New password: $NEW_PASS"

# آپدیت .htpasswd
htpasswd -b nginx/.htpasswd dbadmin "$NEW_PASS"

# Restart nginx
docker-compose restart nginx
```

### 3. تغییر رمز عبور MySQL

```bash
# اتصال به MySQL
docker exec -it crm-mysql mysql -u root -p1234

# تغییر رمز
ALTER USER 'crm_user'@'%' IDENTIFIED BY 'NEW_STRONG_PASSWORD';
FLUSH PRIVILEGES;
EXIT;

# آپدیت .env
nano .env
# DATABASE_PASSWORD=NEW_STRONG_PASSWORD

# Restart services
docker-compose restart
```

---

## 📊 چک‌لیست Deploy

### قبل از Deploy:
- [ ] Backup از دیتابیس گرفته شده
- [ ] فایل‌های جدید commit شده‌اند
- [ ] تغییرات روی سرور pull شده‌اند

### حین Deploy:
- [ ] اسکریپت deploy اجرا شد
- [ ] اطلاعات credentials یادداشت شد
- [ ] سرویس‌ها با موفقیت راه‌اندازی شدند

### بعد از Deploy:
- [ ] دسترسی به phpMyAdmin تست شد
- [ ] Basic Auth کار می‌کند
- [ ] MySQL Login کار می‌کند
- [ ] فایل `.phpmyadmin_credentials` حذف یا محافظت شد
- [ ] مسیر قدیم غیرفعال شد

---

## 🆘 در صورت مشکل

### Rollback سریع:

```bash
# بازگشت به نسخه قبل
git checkout HEAD~1 deploy-server.sh docker-compose.yml nginx/default.conf

# Rebuild
docker-compose down
docker-compose up -d --build
```

### دسترسی اضطراری:

اگر نمی‌توانید به phpMyAdmin دسترسی پیدا کنید:

```bash
# دسترسی مستقیم به MySQL از خط فرمان
docker exec -it crm-mysql mysql -u root -p1234

# یا از phpMyAdmin container
docker exec -it crm-phpmyadmin sh
```

---

## 📞 پشتیبانی

### لاگ‌های مفید:

```bash
# لاگ nginx
docker logs crm-nginx | tail -50

# لاگ phpMyAdmin
docker logs crm-phpmyadmin | tail -50

# لاگ MySQL
docker logs crm-mysql | tail -50

# لاگ deploy
tail -100 /var/log/deploy.log
```

### اطلاعات سیستم:

```bash
# وضعیت سرویس‌ها
docker-compose ps

# استفاده از منابع
docker stats --no-stream

# فضای دیسک
df -h
```

---

## ✅ نتیجه‌گیری

پس از اجرای موفق deploy:

1. ✅ phpMyAdmin با مسیر جدید و امن در دسترس است
2. ✅ احراز هویت دو لایه فعال است
3. ✅ Security headers اضافه شده‌اند
4. ✅ تنظیمات امنیتی بهبود یافته‌اند

**مسیر جدید:**
```
https://crm.robintejarat.com/db-mgmt-a8f3e9c2b1d4f7e6a5c8b9d2e1f4a7b3/
```

**مسیر قدیم (غیرفعال):**
```
https://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/  ❌
```

---

**تاریخ:** $(date)
**نسخه:** 1.0
**وضعیت:** ✅ Ready for Production
