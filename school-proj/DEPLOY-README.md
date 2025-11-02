# 🚀 راهنمای دیپلوی پروژه School-Proj

این پروژه روی دامنه `sch.ahmadreza-avandi.ir` دیپلوی می‌شود و کاملاً مستقل از پروژه CRM است.

## 📋 پورت‌های اختصاص داده شده

پروژه School-Proj از پورت‌های زیر استفاده می‌کند (بدون تداخل با CRM):

| سرویس | پورت محلی | پورت داخلی Container |
|-------|-----------|---------------------|
| Next.js Frontend | 3003 | 3000 |
| Nest.js Backend | 3002 | 3001 |
| Python API | 5001 | 5000 |
| MySQL Database | 3307 | 3306 |
| Redis | 6380 | 6379 |
| phpMyAdmin | 8083 | 80 |
| Redis Commander | 8084 | 8081 |

## 🏗️ ساختار پروژه

```
school-proj/
├── next/              # فرانت‌اند Next.js
├── nest/              # بک‌اند Nest.js
├── faceDetectionWithCamera/  # سرویس Python
├── trainer/           # ماژول آموزش
├── docker-compose.yml # کانفیگ Docker
├── nginx-config.conf  # کانفیگ Nginx
├── deploy.sh          # اسکریپت دیپلوی کامل
├── stop.sh            # اسکریپت توقف
├── restart.sh         # اسکریپت ری‌استارت
└── status.sh          # اسکریپت بررسی وضعیت
```

## 🎯 دیپلوی کامل (اولین بار)

### پیش‌نیازها

1. Docker و Docker Compose نصب باشد
2. Nginx نصب باشد
3. دامنه `sch.ahmadreza-avandi.ir` به سرور متصل باشد
4. گواهی SSL برای دامنه دریافت شده باشد

### مراحل دیپلوی

```bash
cd school-proj
bash deploy.sh
```

این اسکریپت به صورت خودکار:
- ✅ پیش‌نیازها را بررسی می‌کند
- ✅ گواهی SSL را چک می‌کند (در صورت نیاز راهنمایی می‌دهد)
- ✅ Containers قبلی را متوقف می‌کند
- ✅ Nginx را کانفیگ می‌کند
- ✅ تمام سرویس‌ها را Build و اجرا می‌کند
- ✅ سلامت سرویس‌ها را بررسی می‌کند
- ✅ لاگ‌ها را نمایش می‌دهد

## 🔄 دستورات مدیریتی

### بررسی وضعیت پروژه
```bash
cd school-proj
bash status.sh
```

### مشاهده لاگ‌های زنده
```bash
cd school-proj
bash status.sh logs
```

### ری‌استارت کل پروژه
```bash
cd school-proj
bash restart.sh
```

### ری‌استارت یک سرویس خاص
```bash
cd school-proj
bash restart.sh nextjs    # فقط Next.js
bash restart.sh nestjs    # فقط Nest.js
bash restart.sh pythonserver  # فقط Python
```

### توقف پروژه
```bash
cd school-proj
bash stop.sh
```

## 🌐 لینک‌های دسترسی

بعد از دیپلوی موفق، می‌توانید از لینک‌های زیر استفاده کنید:

- **وب‌سایت اصلی**: https://sch.ahmadreza-avandi.ir
- **API Nest.js**: https://sch.ahmadreza-avandi.ir/api
- **API Python**: https://sch.ahmadreza-avandi.ir/python-api
- **phpMyAdmin**: https://sch.ahmadreza-avandi.ir/phpmyadmin
- **Redis Commander**: https://sch.ahmadreza-avandi.ir/redis-commander

## 🔧 دستورات Docker مفید

### مشاهده لاگ‌های یک سرویس
```bash
docker-compose logs -f nextjs
docker-compose logs -f nestjs
docker-compose logs -f pythonserver
```

### ورود به Container
```bash
docker-compose exec nextjs sh
docker-compose exec nestjs sh
docker-compose exec mysql bash
```

### مشاهده استفاده از منابع
```bash
docker stats
```

### پاک‌سازی کامل (حذف volumes و images)
```bash
docker-compose down -v --rmi all
```

## 🐛 عیب‌یابی

### سرویسی اجرا نمی‌شود
```bash
# مشاهده لاگ‌های سرویس
docker-compose logs [service-name]

# ری‌استارت سرویس
docker-compose restart [service-name]

# بیلد مجدد سرویس
docker-compose up -d --build [service-name]
```

### خطای پورت در حال استفاده
```bash
# بررسی پورت‌های در حال استفاده
sudo netstat -tulpn | grep LISTEN

# یا
sudo lsof -i :[port-number]
```

### خطای Nginx
```bash
# تست کانفیگ Nginx
sudo nginx -t

# مشاهده لاگ‌های Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# ری‌استارت Nginx
sudo systemctl restart nginx
```

### خطای دیتابیس
```bash
# ورود به MySQL
docker-compose exec mysql mysql -u root -p

# بررسی دیتابیس‌ها
docker-compose exec mysql mysql -u root -prootpassword -e "SHOW DATABASES;"
```

## 🔐 دریافت گواهی SSL (اولین بار)

اگر گواهی SSL ندارید:

```bash
# نصب Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# دریافت گواهی
sudo certbot --nginx -d sch.ahmadreza-avandi.ir

# تمدید خودکار (اختیاری)
sudo certbot renew --dry-run
```

## 📊 مانیتورینگ

### بررسی وضعیت سرویس‌ها
```bash
# وضعیت Containers
docker-compose ps

# استفاده از منابع
docker stats --no-stream

# بررسی سلامت
curl http://localhost:3003  # Next.js
curl http://localhost:3002  # Nest.js
curl http://localhost:5001  # Python
```

### لاگ‌ها
```bash
# تمام لاگ‌ها
docker-compose logs

# لاگ‌های اخیر
docker-compose logs --tail=50

# لاگ‌های زنده
docker-compose logs -f

# لاگ یک سرویس خاص
docker-compose logs -f nextjs
```

## 🔄 آپدیت پروژه

برای آپدیت کد و دیپلوی مجدد:

```bash
cd school-proj

# دریافت آخرین تغییرات (اگر از Git استفاده می‌کنید)
git pull

# دیپلوی مجدد
bash deploy.sh
```

## ⚠️ نکات مهم

1. **جداسازی از CRM**: این پروژه کاملاً مستقل است و هیچ تداخلی با پروژه CRM ندارد
2. **پورت‌ها**: پورت‌های متفاوت استفاده می‌شود تا تداخلی ایجاد نشود
3. **Nginx**: کانفیگ Nginx جداگانه برای این دامنه است
4. **Database**: دیتابیس جداگانه روی پورت 3307 اجرا می‌شود
5. **SSL**: گواهی SSL جداگانه برای دامنه `sch.ahmadreza-avandi.ir` نیاز است

## 📞 پشتیبانی

در صورت بروز مشکل:
1. ابتدا `bash status.sh` را اجرا کنید
2. لاگ‌های سرویس مشکل‌دار را بررسی کنید
3. از دستورات عیب‌یابی استفاده کنید

---

**نکته**: همیشه قبل از دیپلوی، از دیتابیس و فایل‌های مهم بکاپ بگیرید! 🔒
