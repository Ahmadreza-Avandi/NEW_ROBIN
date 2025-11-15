# 🚀 راهنمای دیپلوی School-Proj

## خلاصه پروژه

پروژه School-Proj یک سیستم حضور و غیاب مدرسه با تشخیص چهره است که شامل:
- **Next.js** - فرانت‌اند + API Routes (بک‌اند)
- **Python/Flask** - سرویس تشخیص چهره
- **MySQL** - دیتابیس
- **Redis** - کش
- **phpMyAdmin** - مدیریت دیتابیس
- **Redis Commander** - مدیریت Redis

## ⚠️ تغییرات مهم

### NestJS حذف شد
- تمام API ها به Next.js منتقل شدند
- احراز هویت با JWT مستقیماً در Next.js
- اتصال مستقیم به MySQL

## 📋 پیش‌نیازها

### روی سرور
```bash
# Docker & Docker Compose
docker --version
docker-compose --version

# Nginx
nginx -v

# SSL Certificate
ls /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/
```

## 🔧 دیپلوی سریع

### روش 1: دیپلوی کامل (توصیه می‌شود)
```bash
# اجرای اسکریپت دیپلوی کامل
bash deploy-complete.sh
```

این اسکریپت:
1. ✅ فایل‌های .env را می‌سازد (حالت سرور)
2. ✅ کانفیگ nginx را کپی می‌کند
3. ✅ SSL را چک می‌کند
4. ✅ Containers را build و اجرا می‌کند
5. ✅ سلامت سرویس‌ها را بررسی می‌کند

### روش 2: Rebuild کامل (اگر مشکل دارید)
```bash
# Rebuild از صفر
bash rebuild.sh
```

این اسکریپت:
1. ✅ .env ها را دوباره می‌سازد
2. ✅ Containers قدیمی را حذف می‌کند
3. ✅ Build از نو (با --no-cache)
4. ✅ اجرای مجدد

## 🔑 فایل‌های .env

### ساخت دستی
```bash
# حالت سرور (production)
bash setup-env.sh 1

# حالت لوکال (development)
bash setup-env.sh 0

# تشخیص خودکار
bash setup-env.sh auto
```

### تنظیمات سرور (.env)
```env
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=mydatabase
MYSQL_USER=user
MYSQL_PASSWORD=userpassword
REDIS_HOST=redis
REDIS_PORT=6379
DOMAIN=sch.ahmadreza-avandi.ir
NODE_ENV=production
```

## 🌐 Nginx

### کانفیگ فعلی
```bash
# مشاهده کانفیگ فعال
sudo cat /etc/nginx/sites-enabled/school-proj

# تست کانفیگ
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### مسیرها
- `/` → Next.js (پورت 3003)
- `/python-api/` → Python Flask (پورت 5001)
- `/phpmyadmin/` → phpMyAdmin (پورت 8083)
- `/redis-commander/` → Redis Commander (پورت 8084)

## 🐳 Docker Commands

### مشاهده وضعیت
```bash
docker-compose ps
docker-compose logs -f
docker-compose logs pythonserver
```

### ری‌استارت
```bash
# همه سرویس‌ها
docker-compose restart

# یک سرویس خاص
docker-compose restart pythonserver
docker-compose restart nextjs
```

### توقف
```bash
# توقف
docker-compose down

# توقف + حذف volumes
docker-compose down -v

# توقف + حذف orphan containers
docker-compose down --remove-orphans
```

### Build مجدد
```bash
# Build همه
docker-compose build

# Build یک سرویس
docker-compose build pythonserver

# Build بدون cache
docker-compose build --no-cache
```

## 🔍 عیب‌یابی

### Python server به Redis وصل نمیشه
```bash
# چک کردن environment variables
docker exec school-proj-pythonserver-1 printenv | grep REDIS

# باید نتیجه بدهد:
# REDIS_HOST=redis
# REDIS_PORT=6379
```

اگر `REDIS_HOST=localhost` بود:
```bash
# Rebuild Python container
docker-compose build --no-cache pythonserver
docker-compose up -d pythonserver
```

### SSL Error (ERR_CERT_COMMON_NAME_INVALID)
```bash
# چک کردن certificate
sudo ls -la /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/

# چک کردن nginx config
sudo nginx -t

# مطمئن شوید که nginx config درست کپی شده
sudo cp nginx-config.conf /etc/nginx/sites-available/school-proj
sudo systemctl reload nginx
```

### Next.js به دیتابیس وصل نمیشه
```bash
# چک کردن environment variables
docker exec school-proj-nextjs-1 printenv | grep DATABASE_URL

# چک کردن MySQL
docker exec school-proj-mysql-1 mysql -uuser -puserpassword -e "SHOW DATABASES;"
```

### پورت‌ها اشغال هستند
```bash
# چک کردن پورت‌های اشغال شده
sudo netstat -tulpn | grep -E "3003|5001|3307|6380|8083|8084"

# توقف containers قدیمی
docker-compose down --remove-orphans
```

## 📊 پورت‌ها

| سرویس | پورت داخلی | پورت خارجی | URL |
|-------|------------|------------|-----|
| Next.js | 3000 | 3003 | https://sch.ahmadreza-avandi.ir |
| Python | 5000 | 5001 | https://sch.ahmadreza-avandi.ir/python-api |
| MySQL | 3306 | 3307 | localhost:3307 |
| Redis | 6379 | 6380 | localhost:6380 |
| phpMyAdmin | 80 | 8083 | https://sch.ahmadreza-avandi.ir/phpmyadmin |
| Redis Commander | 8081 | 8084 | https://sch.ahmadreza-avandi.ir/redis-commander |

## 🔐 امنیت

### فایل‌های حساس
این فایل‌ها را **هرگز** commit نکنید:
- `.env`
- `next/.env.local`
- `next/.env.production`

### تغییر رمزها
برای production، حتماً رمزها را تغییر دهید:
```bash
# در فایل .env
MYSQL_ROOT_PASSWORD=<رمز-قوی>
MYSQL_PASSWORD=<رمز-قوی>
JWT_SECRET=<رشته-تصادفی-طولانی>
```

## 📝 لاگ‌ها

### مشاهده لاگ‌های زنده
```bash
# همه سرویس‌ها
docker-compose logs -f

# یک سرویس خاص
docker-compose logs -f pythonserver
docker-compose logs -f nextjs

# 50 خط آخر
docker-compose logs --tail=50 pythonserver
```

### لاگ‌های Nginx
```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log
```

## ✅ چک‌لیست دیپلوی

- [ ] SSL certificate موجود است
- [ ] فایل‌های .env با حالت سرور ساخته شده‌اند
- [ ] nginx config کپی و reload شده
- [ ] تمام containers در حال اجرا هستند
- [ ] Python به Redis وصل است
- [ ] Next.js به MySQL وصل است
- [ ] سایت از طریق HTTPS قابل دسترسی است

## 🆘 پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ‌ها را چک کنید: `docker-compose logs -f`
2. وضعیت را بررسی کنید: `bash status.sh`
3. Rebuild کنید: `bash rebuild.sh`
