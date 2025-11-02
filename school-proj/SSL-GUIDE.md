# 🔐 راهنمای دریافت SSL برای School-Proj

## مشکل فعلی

پورت 80 و 443 توسط nginx پروژه CRM استفاده می‌شود، بنابراین باید از روش **webroot** برای دریافت SSL استفاده کنیم.

## ✅ راه حل ساده (توصیه می‌شود)

```bash
cd school-proj
sudo bash get-ssl-manual.sh
```

این اسکریپت:
1. یک کانفیگ موقت به nginx اضافه می‌کند
2. گواهی SSL را دریافت می‌کند
3. کانفیگ موقت را حذف می‌کند

## 🔄 راه حل جایگزین

اگر اسکریپت بالا کار نکرد، این دستور را مستقیماً اجرا کنید:

```bash
# 1. ایجاد دایرکتوری
sudo mkdir -p /var/www/certbot
sudo chmod 755 /var/www/certbot

# 2. اضافه کردن کانفیگ به nginx
sudo tee /etc/nginx/sites-available/school-ssl > /dev/null << 'EOF'
server {
    listen 80;
    server_name sch.ahmadreza-avandi.ir;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

# 3. فعال‌سازی کانفیگ
sudo ln -sf /etc/nginx/sites-available/school-ssl /etc/nginx/sites-enabled/school-ssl

# 4. تست و reload nginx
sudo nginx -t && sudo systemctl reload nginx

# 5. دریافت گواهی
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email admin@ahmadreza-avandi.ir \
    --agree-tos \
    --no-eff-email \
    -d sch.ahmadreza-avandi.ir

# 6. حذف کانفیگ موقت
sudo rm -f /etc/nginx/sites-enabled/school-ssl
sudo systemctl reload nginx
```

## 🔍 بررسی وضعیت

بعد از دریافت موفق، بررسی کنید:

```bash
# بررسی وجود گواهی
sudo ls -la /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/

# مشاهده تاریخ انقضا
sudo openssl x509 -enddate -noout -in /etc/letsencrypt/live/sch.ahmadreza-avandi.ir/fullchain.pem
```

## ✅ بعد از دریافت SSL

```bash
cd school-proj
bash deploy.sh
```

## 🐛 عیب‌یابی

### خطا: Address already in use

این طبیعی است چون nginx CRM روی پورت 80 است. از روش webroot استفاده کنید.

### خطا: Connection refused

```bash
# بررسی nginx
sudo systemctl status nginx

# بررسی پورت 80
sudo netstat -tulpn | grep :80
```

### مشاهده لاگ خطا

```bash
sudo tail -50 /var/log/letsencrypt/letsencrypt.log
```

## 📝 نکات مهم

1. **DNS**: مطمئن شوید `sch.ahmadreza-avandi.ir` به IP سرور متصل است
2. **Firewall**: پورت 80 باید باز باشد
3. **Nginx**: nginx باید در حال اجرا باشد
4. **Webroot**: از `/var/www/certbot` استفاده می‌کنیم

---

**بعد از دریافت موفق SSL، فوراً `bash deploy.sh` را اجرا کنید!** 🚀
