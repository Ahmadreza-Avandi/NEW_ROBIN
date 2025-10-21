# 🐳 راهنمای کامل Deployment با Docker

## 📋 فهرست مطالب
- [پیش‌نیازها](#پیش‌نیازها)
- [راه‌اندازی سریع](#راه‌اندازی-سریع)
- [تنظیمات دیتابیس](#تنظیمات-دیتابیس)
- [phpMyAdmin](#phpmyadmin)
- [صدای رابین](#صدای-رابین)
- [عیب‌یابی](#عیب‌یابی)

---

## 🚀 پیش‌نیازها

### نصب Docker و Docker Compose
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# نصب Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### بررسی نصب
```bash
docker --version
docker-compose --version
```

---

## ⚡ راه‌اندازی سریع

### روش 1: استفاده از اسکریپت خودکار (توصیه می‌شود)

```bash
# 1. ساخت فایل .env
chmod +x create-production-env.sh
./create-production-env.sh crm.robintejarat.com

# 2. ویرایش .env و تنظیم رمز عبور
nano .env
# DATABASE_PASSWORD را تغییر دهید

# 3. اجرای Docker Compose
docker-compose up -d

# 4. مشاهده لاگ‌ها
docker-compose logs -f
```

### روش 2: ساخت دستی فایل .env

```bash
# کپی از نمونه
cp .env.example .env

# ویرایش
nano .env
```

**تنظیمات ضروری در .env:**
```env
NODE_ENV=production
DATABASE_HOST=mysql
DATABASE_USER=crm_user
DATABASE_PASSWORD=YOUR_SECURE_PASSWORD_HERE
DATABASE_NAME=crm_system
SAAS_DATABASE_NAME=saas_master
JWT_SECRET=YOUR_RANDOM_SECRET_HERE
```

---

## 🗄️ تنظیمات دیتابیس

### ساختار دیتابیس‌ها

پروژه از **دو دیتابیس** استفاده می‌کند:

#### 1. crm_system
دیتابیس اصلی CRM:
- `users` - کاربران
- `customers` - مشتریان
- `deals` - معاملات
- `activities` - فعالیت‌ها
- `tasks` - وظایف
- `documents` - اسناد
- و 85+ جدول دیگر

#### 2. saas_master
دیتابیس مدیریت تنانت‌ها:
- `tenants` - شرکت‌ها
- `subscription_plans` - پلن‌های اشتراک
- `subscription_history` - تاریخچه
- `super_admins` - مدیران ارشد

### Import خودکار

فایل‌های SQL در پوشه `database/` به صورت خودکار import می‌شوند:

```
database/
├── 00-init-databases.sql    # ایجاد دیتابیس‌ها و دسترسی‌ها
├── crm_system.sql            # ساختار و داده‌های CRM
└── saas_master.sql           # ساختار و داده‌های SaaS
```

**ترتیب اجرا**: فایل‌ها به ترتیب الفبایی اجرا می‌شوند (00, 01, 02, ...)

### دسترسی به MySQL در Docker

```bash
# ورود به MySQL
docker exec -it crm-mysql mysql -u crm_user -p

# یا با root
docker exec -it crm-mysql mysql -u root -p
```

**دستورات مفید:**
```sql
-- نمایش دیتابیس‌ها
SHOW DATABASES;

-- استفاده از دیتابیس
USE crm_system;

-- نمایش جداول
SHOW TABLES;

-- بررسی کاربران
SELECT User, Host FROM mysql.user;

-- بررسی دسترسی‌ها
SHOW GRANTS FOR 'crm_user'@'%';
```

---

## 🔧 phpMyAdmin

### دسترسی به phpMyAdmin

phpMyAdmin در مسیر امن زیر در دسترس است:

```
https://your-domain.com/secure-db-admin-panel-x7k9m2/
```

### اطلاعات ورود

**کاربر عادی:**
- Server: `mysql`
- Username: `crm_user`
- Password: (از .env)

**Root:**
- Server: `mysql`
- Username: `root`
- Password: `{DATABASE_PASSWORD}_ROOT`

### تنظیمات phpMyAdmin در Docker

```yaml
phpmyadmin:
  environment:
    PMA_HOST: mysql
    PMA_PORT: 3306
    PMA_USER: crm_user
    PMA_PASSWORD: ${DATABASE_PASSWORD}
    PMA_ABSOLUTE_URI: "${NEXTAUTH_URL}/secure-db-admin-panel-x7k9m2/"
```

### امنیت phpMyAdmin

✅ **تنظیمات امنیتی فعال:**
- مسیر مخفی و تصادفی
- بدون expose کردن port خارجی
- دسترسی فقط از طریق nginx
- پنهان کردن نسخه PHP
- محدودیت حافظه

⚠️ **توصیه‌های امنیتی:**
1. مسیر را تغییر دهید (در nginx config و docker-compose)
2. احراز هویت دو مرحله‌ای فعال کنید
3. IP whitelist تنظیم کنید
4. از VPN استفاده کنید

---

## 🎤 صدای رابین (Rabin Voice)

### وابستگی‌ها

صدای رابین **فقط** به موارد زیر وابسته است:
- ✅ دیتابیس MySQL (crm_system)
- ✅ Environment Variables

**نیاز به تنظیمات خاص ندارد!**

### Environment Variables

```env
# در .env اصلی
RABIN_VOICE_OPENROUTER_API_KEY=your_api_key
RABIN_VOICE_OPENROUTER_MODEL=anthropic/claude-3-haiku
RABIN_VOICE_TTS_API_URL=https://api.ahmadreza-avandi.ir/text-to-speech
RABIN_VOICE_LOG_LEVEL=INFO
```

### دسترسی

صدای رابین روی port 3001 اجرا می‌شود و از طریق nginx در دسترس است:

```
https://your-domain.com/rabin-voice/
```

### لاگ‌ها

```bash
# مشاهده لاگ‌های Rabin Voice
docker-compose logs -f rabin-voice

# لاگ‌های ذخیره شده
ls -la صدای\ رابین/logs/
```

---

## 🚀 دستورات Docker

### مدیریت کانتینرها

```bash
# شروع همه سرویس‌ها
docker-compose up -d

# توقف همه سرویس‌ها
docker-compose down

# Restart یک سرویس خاص
docker-compose restart nextjs
docker-compose restart mysql
docker-compose restart rabin-voice

# مشاهده وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f
docker-compose logs -f nextjs
docker-compose logs -f mysql
```

### Build و Rebuild

```bash
# Build دوباره
docker-compose build

# Build بدون cache
docker-compose build --no-cache

# Build و اجرا
docker-compose up -d --build
```

### پاکسازی

```bash
# حذف کانتینرها (داده‌ها حفظ می‌شوند)
docker-compose down

# حذف کانتینرها + volumes (داده‌ها پاک می‌شوند!)
docker-compose down -v

# پاکسازی کامل Docker
docker system prune -a
```

---

## 🔍 عیب‌یابی

### مشکل: کانتینر MySQL بالا نمی‌آید

```bash
# بررسی لاگ
docker-compose logs mysql

# بررسی healthcheck
docker inspect crm-mysql | grep -A 10 Health

# ورود به کانتینر
docker exec -it crm-mysql sh
```

**راه‌حل‌های رایج:**
1. بررسی رمز عبور در .env
2. حذف volume و شروع دوباره: `docker-compose down -v && docker-compose up -d`
3. بررسی فضای دیسک: `df -h`

### مشکل: خطای Permission Denied در uploads

```bash
# تنظیم دسترسی‌ها
docker exec -it crm-nextjs sh
chown -R nextjs:nodejs /app/uploads
chmod -R 755 /app/uploads
```

### مشکل: Out of Memory

```bash
# بررسی مصرف حافظه
docker stats

# استفاده از فایل memory-optimized
docker-compose -f docker-compose.memory-optimized.yml up -d
```

### مشکل: دیتابیس import نمی‌شود

```bash
# بررسی فایل‌های SQL
ls -la database/

# Import دستی
docker exec -i crm-mysql mysql -u crm_user -p1234 crm_system < database/crm_system.sql
docker exec -i crm-mysql mysql -u crm_user -p1234 saas_master < database/saas_master.sql
```

### مشکل: نمی‌توانم به phpMyAdmin دسترسی پیدا کنم

1. بررسی nginx config
2. بررسی مسیر: `/secure-db-admin-panel-x7k9m2/`
3. بررسی لاگ nginx: `docker-compose logs nginx`

---

## 📊 Monitoring

### بررسی وضعیت سرویس‌ها

```bash
# Health check همه سرویس‌ها
docker-compose ps

# CPU و Memory
docker stats

# Disk usage
docker system df
```

### لاگ‌ها

```bash
# همه لاگ‌ها
docker-compose logs -f

# فقط خطاها
docker-compose logs -f | grep -i error

# 100 خط آخر
docker-compose logs --tail=100
```

---

## 🔐 امنیت

### Checklist امنیتی

- [ ] رمز DATABASE_PASSWORD تغییر کرده
- [ ] JWT_SECRET تصادفی و قوی است
- [ ] مسیر phpMyAdmin تغییر کرده
- [ ] Port 3306 MySQL expose نشده
- [ ] SSL/TLS فعال است
- [ ] Firewall تنظیم شده
- [ ] Backup منظم دارید
- [ ] لاگ‌ها را monitor می‌کنید

### Backup

```bash
# Backup دیتابیس
docker exec crm-mysql mysqldump -u crm_user -p1234 crm_system > backup_crm_$(date +%Y%m%d).sql
docker exec crm-mysql mysqldump -u crm_user -p1234 saas_master > backup_saas_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup_$(date +%Y%m%d).tar.gz /data
```

---

## 📚 منابع بیشتر

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MariaDB Documentation](https://mariadb.com/kb/en/documentation/)
- [phpMyAdmin Documentation](https://docs.phpmyadmin.net/)

---

**تاریخ**: $(date)
**نسخه**: 1.0.0
