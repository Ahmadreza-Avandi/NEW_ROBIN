# 🚀 راهنمای کامل دیپلوی پروژه

## 📋 مقدمه

این راهنما برای دیپلوی کامل پروژه روی دامنه `https://sch.ahmadreza-avandi.ir/` طراحی شده است.

## 🏗️ معماری پروژه

```
https://sch.ahmadreza-avandi.ir/
├── /                    → Next.js (Frontend)
├── /api/               → Nest.js (Backend API)
├── /python-api/        → Python Flask (Face Detection)
├── /phpmyadmin/        → phpMyAdmin (Database Management)
└── /redis-commander/   → Redis Commander (Cache Management)
```

## 📦 سرویس‌ها

| سرویس | پورت محلی | URL عمومی | توضیحات |
|--------|-----------|-----------|---------|
| Next.js | 3000 | https://sch.ahmadreza-avandi.ir/ | فرانت‌اند |
| Nest.js | 3001 | https://sch.ahmadreza-avandi.ir/api/ | بک‌اند API |
| Python | 5000 | https://sch.ahmadreza-avandi.ir/python-api/ | تشخیص چهره |
| MySQL | 3306 | - | دیتابیس |
| Redis | 6379 | - | کش |
| phpMyAdmin | 8081 | https://sch.ahmadreza-avandi.ir/phpmyadmin/ | مدیریت DB |
| Redis Commander | 8082 | https://sch.ahmadreza-avandi.ir/redis-commander/ | مدیریت Redis |

## 🛠️ پیش‌نیازها

### سرور
- Ubuntu 20.04+ یا Debian 10+
- Docker & Docker Compose
- Nginx
- SSL Certificate (Let's Encrypt)

### فایل‌های ضروری
- ✅ `docker-compose.yml`
- ✅ `nginx-config.conf`
- ✅ `mydatabase (3).sql`
- ✅ `nest/Dockerfile`
- ✅ `next/Dockerfile`
- ✅ `faceDetectionWithCamera/Dockerfile`

## 🚀 مراحل دیپلوی

### مرحله ۱: آماده‌سازی سرور

```bash
# نصب Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# نصب Docker Compose
sudo apt-get install docker-compose-plugin

# نصب Nginx
sudo apt-get update
sudo apt-get install nginx

# نصب Certbot برای SSL
sudo apt-get install certbot python3-certbot-nginx
```

### مرحله ۲: کانفیگ Nginx و SSL

```bash
# کانفیگ Nginx
chmod +x setup-nginx-complete.sh
sudo ./setup-nginx-complete.sh

# دریافت SSL Certificate
c
```

### مرحله ۳: دیپلوی پروژه

```bash
# دیپلوی کامل
chmod +x test-and-deploy.sh
./test-and-deploy.sh

# یا دیپلوی سریع
chmod +x quick-deploy.sh
./quick-deploy.sh
```

## 🔧 دستورات مفید

### مدیریت Docker

```bash
# مشاهده وضعیت containers
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده لاگ یک سرویس خاص
docker-compose logs -f nextjs

# ری‌استارت همه سرویس‌ها
docker-compose restart

# ری‌استارت یک سرویس خاص
docker-compose restart nextjs

# توقف همه سرویس‌ها
docker-compose down

# بیلد مجدد
docker-compose build --no-cache

# پاک‌سازی
docker system prune -af --volumes
```

### مدیریت Nginx

```bash
# تست کانفیگ
sudo nginx -t

# ری‌لود
sudo systemctl reload nginx

# ری‌استارت
sudo systemctl restart nginx

# وضعیت
sudo systemctl status nginx

# مشاهده لاگ‌ها
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 🐛 عیب‌یابی

### مشکلات رایج

#### ۱. خطای "Connection refused"
```bash
# بررسی وضعیت containers
docker-compose ps

# بررسی لاگ‌ها
docker-compose logs [service-name]

# ری‌استارت سرویس
docker-compose restart [service-name]
```

#### ۲. خطای SSL
```bash
# بررسی گواهی SSL
sudo certbot certificates

# تجدید گواهی
sudo certbot renew

# تست تجدید
sudo certbot renew --dry-run
```

#### ۳. خطای Nginx
```bash
# تست کانفیگ
sudo nginx -t

# مشاهده لاگ خطا
sudo tail -f /var/log/nginx/error.log

# ری‌استارت Nginx
sudo systemctl restart nginx
```

#### ۴. خطای Database
```bash
# بررسی لاگ MySQL
docker-compose logs mysql

# اتصال به MySQL
docker-compose exec mysql mysql -u root -p

# بررسی وضعیت health check
docker-compose ps mysql
```

### بررسی سلامت سرویس‌ها

```bash
# تست سرویس‌ها
curl -I http://localhost:3000  # Next.js
curl -I http://localhost:3001  # Nest.js
curl -I http://localhost:5000  # Python
curl -I http://localhost:8081  # phpMyAdmin
curl -I http://localhost:8082  # Redis Commander

# تست از طریق دامنه
curl -I https://sch.ahmadreza-avandi.ir/
curl -I https://sch.ahmadreza-avandi.ir/api/
curl -I https://sch.ahmadreza-avandi.ir/python-api/
```

## 📊 مانیتورینگ

### مشاهده منابع سیستم

```bash
# استفاده از CPU و RAM
docker stats

# فضای دیسک
df -h

# لاگ‌های سیستم
sudo journalctl -f
```

### بکاپ

```bash
# بکاپ دیتابیس
docker-compose exec mysql mysqldump -u root -p mydatabase > backup.sql

# بکاپ volumes
docker run --rm -v mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz -C /data .
```

## 🔄 به‌روزرسانی

```bash
# دریافت آخرین تغییرات
git pull

# بیلد مجدد containers
docker-compose build --no-cache

# ری‌استارت سرویس‌ها
docker-compose up -d

# پاک‌سازی images قدیمی
docker image prune -f
```

## 📞 پشتیبانی

در صورت بروز مشکل:

1. ابتدا لاگ‌ها را بررسی کنید
2. وضعیت containers را چک کنید
3. کانفیگ Nginx را تست کنید
4. SSL certificate را بررسی کنید

## ✅ چک‌لیست نهایی

- [ ] همه containers در حال اجرا هستند
- [ ] Nginx کانفیگ شده و در حال اجراست
- [ ] SSL certificate معتبر است
- [ ] همه سرویس‌ها از طریق دامنه در دسترس هستند
- [ ] Database initialize شده است
- [ ] لاگ‌ها خطای جدی نشان نمی‌دهند

---

🎉 **پروژه شما آماده است!**

دسترسی از طریق: https://sch.ahmadreza-avandi.ir/