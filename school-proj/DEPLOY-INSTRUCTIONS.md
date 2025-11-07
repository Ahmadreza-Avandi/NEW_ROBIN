# 📚 راهنمای دیپلوی School-Proj

## 🚀 دیپلوی اولیه (اولین بار)

اگر اولین باره که پروژه رو دیپلوی می‌کنی:

```bash
cd school-proj
sudo bash deploy-with-nginx.sh
```

این اسکریپت:
- ✅ Docker containers رو build و run می‌کنه
- ✅ Nginx رو کانفیگ می‌کنه (هم CRM و هم School)
- ✅ SSL رو چک می‌کنه
- ✅ همه چیز رو تست می‌کنه

---

## 🔄 آپدیت پروژه (بدون تغییر Nginx)

اگر فقط میخوای کد رو آپدیت کنی و Nginx رو دست نزنی:

```bash
cd school-proj
docker-compose down
docker-compose build
docker-compose up -d
```

یا استفاده از اسکریپت قبلی:

```bash
sudo bash deploy.sh
```

**نکته:** این اسکریپت Nginx رو تغییر نمیده، فقط containers رو آپدیت می‌کنه.

---

## 🔧 فیکس Nginx (بدون دیپلوی مجدد)

اگر containers در حال اجرا هستن ولی Nginx مشکل داره:

```bash
cd ~/NEW_ROBIN
sudo bash fix-all-nginx.sh
```

این اسکریپت:
- ✅ IP های CRM containers رو پیدا می‌کنه
- ✅ کانفیگ Nginx رو برای هر دو پروژه می‌سازه
- ✅ Nginx رو reload می‌کنه
- ❌ Containers رو restart نمی‌کنه

---

## 📊 چک کردن وضعیت

برای بررسی وضعیت همه چیز:

```bash
cd school-proj
bash status.sh
```

یا:

```bash
cd ~/NEW_ROBIN
sudo bash check-everything.sh
```

---

## 🔍 تست API ها

بعد از دیپلوی، این دستورات رو تست کن:

```bash
# Frontend
curl -I https://sch.ahmadreza-avandi.ir

# Nest.js API
curl https://sch.ahmadreza-avandi.ir/api/grades

# Python API
curl https://sch.ahmadreza-avandi.ir/python-api/

# phpMyAdmin
curl -I https://sch.ahmadreza-avandi.ir/phpmyadmin
```

---

## 🐛 عیب‌یابی

### مشکل: API ها 404 میدن

```bash
# چک کن containers در حال اجرا هستن
docker-compose ps

# چک کن پورت‌ها باز هستن
netstat -tuln | grep -E ':(3002|3003|5001|8083)'

# لاگ‌های nginx رو ببین
sudo tail -f /var/log/nginx/error.log
```

### مشکل: CRM کار نمی‌کنه

```bash
# چک کن nginx container نداری که پورت 80/443 رو گرفته باشه
docker ps | grep nginx

# اگر داری، stop کن
docker stop nginx
sudo systemctl restart nginx
```

### مشکل: SSL خطا میده

```bash
# چک کن SSL موجوده
ls -la /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/

# اگر نیست، دریافت کن
cd school-proj
sudo bash setup-ssl.sh
```

---

## 📝 لاگ‌ها

```bash
# لاگ‌های School containers
cd school-proj
docker-compose logs -f

# لاگ یک سرویس خاص
docker-compose logs -f nextjs
docker-compose logs -f nestjs

# لاگ‌های Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 🔄 ری‌استارت

```bash
# ری‌استارت همه containers
cd school-proj
docker-compose restart

# ری‌استارت یک سرویس
docker-compose restart nextjs

# ری‌استارت Nginx
sudo systemctl restart nginx
```

---

## 🛑 توقف

```bash
# توقف School containers
cd school-proj
docker-compose down

# توقف Nginx
sudo systemctl stop nginx
```

---

## 📌 نکات مهم

1. **همیشه از `deploy-with-nginx.sh` برای دیپلوی اولیه استفاده کن**
2. **برای آپدیت سریع، فقط `docker-compose` رو استفاده کن**
3. **اگر Nginx مشکل داره، از `fix-all-nginx.sh` استفاده کن**
4. **قبل از هر کاری، با `status.sh` وضعیت رو چک کن**

---

## 🌐 دامنه‌ها

- **CRM:** https://crm.robintejarat.com
- **School:** https://sch.ahmadreza-avandi.ir

هر دو پروژه روی یک سرور هستن ولی کاملاً مستقل از هم کار می‌کنن.
