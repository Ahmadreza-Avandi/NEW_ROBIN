# 🔧 دستورالعمل دیپلوی مجدد برای رفع مشکل Rabin Voice

## 🐛 مشکلات شناسایی شده:

1. ❌ **متغیرهای محیطی به Rabin Voice نمی‌رسید**
   - فایل `.env` به سرویس `rabin-voice` لینک نشده بود
   
2. ❌ **NextJS روی port اشتباه اجرا می‌شد**
   - NextJS داشت روی port 3001 اجرا می‌شد به جای 3000
   - باعث می‌شد Nginx نتونه بهش وصل بشه (502 Bad Gateway)

3. ❌ **API Key خالی بود**
   - متغیر `RABIN_VOICE_OPENROUTER_API_KEY` در `.env.server` placeholder بود

## ✅ تغییرات انجام شده:

### 1. فایل `.env.server`
- ✅ API Key واقعی اضافه شد

### 2. فایل `docker-compose.yml`
- ✅ اضافه شدن `env_file: - .env` به سرویس `rabin-voice`
- ✅ اضافه شدن `PORT=3000` صریح به سرویس `nextjs`

### 3. فایل `docker-compose.memory-optimized.yml`
- ✅ اضافه شدن `env_file: - .env` به سرویس `rabin-voice`
- ✅ اضافه شدن `PORT=3000` صریح به سرویس `nextjs`

## 🚀 دستورات دیپلوی مجدد:

### روش 1: دیپلوی کامل (توصیه می‌شود)

```bash
cd ~/rabin-last

# متوقف کردن همه کانتینرها
docker-compose down

# پاک کردن کانتینرهای قدیمی
docker-compose rm -f

# Build مجدد با --no-cache
docker-compose build --no-cache rabin-voice
docker-compose build --no-cache nextjs

# راه‌اندازی مجدد
docker-compose up -d

# بررسی وضعیت
docker-compose ps
docker-compose logs -f --tail=50
```

### روش 2: استفاده از اسکریپت deploy

```bash
cd ~/rabin-last
./deploy-server.sh
```

## 🧪 تست‌های بعد از دیپلوی:

### 1. بررسی کانتینرها
```bash
docker ps
# باید 5 کانتینر ببینید:
# - crm_mysql
# - crm_phpmyadmin
# - crm_nextjs
# - crm_rabin_voice
# - crm_nginx
```

### 2. بررسی Port های درست
```bash
# NextJS باید روی 3000 باشه
docker exec crm_nextjs env | grep PORT
# خروجی: PORT=3000

# Rabin Voice باید روی 3001 باشه
docker exec crm_rabin_voice env | grep PORT
# خروجی: PORT=3001
```

### 3. بررسی متغیرهای محیطی
```bash
# بررسی API Key در Rabin Voice
docker exec crm_rabin_voice env | grep OPENROUTER_API_KEY
# باید API Key واقعی رو نشون بده (نه "your_openrouter_api_key_here")
```

### 4. تست API ها
```bash
# تست NextJS
curl http://localhost:3000

# تست Rabin Voice
curl http://localhost:3001/rabin-voice/

# تست از طریق Nginx
curl https://crm.robintejarat.com/rabin-voice/
```

### 5. بررسی لاگ‌ها
```bash
# لاگ NextJS
docker logs crm_nextjs --tail=50

# لاگ Rabin Voice
docker logs crm_rabin_voice --tail=50

# لاگ Nginx
docker logs crm_nginx --tail=50
```

## 📊 نتیجه مورد انتظار:

بعد از دیپلوی موفق باید:

✅ همه 5 کانتینر در حال اجرا باشند
✅ NextJS روی port 3000 اجرا بشه
✅ Rabin Voice روی port 3001 اجرا بشه
✅ Nginx بتونه به هر دو سرویس وصل بشه
✅ دامنه `https://crm.robintejarat.com` بدون 502 پاسخ بده
✅ Rabin Voice در `https://crm.robintejarat.com/rabin-voice/` در دسترس باشه
✅ API Key در Rabin Voice تنظیم شده باشه

## 🔍 عیب‌یابی:

### اگر هنوز 502 می‌گیرید:
```bash
# بررسی اتصال Nginx به NextJS
docker exec crm_nginx wget -O- http://nextjs:3000

# بررسی اتصال Nginx به Rabin Voice
docker exec crm_nginx wget -O- http://rabin-voice:3001/rabin-voice/
```

### اگر Rabin Voice بالا نمی‌آید:
```bash
# بررسی دقیق لاگ
docker logs crm_rabin_voice

# بررسی build
docker-compose build --no-cache rabin-voice
```

### اگر متغیرهای محیطی هنوز خالی هستند:
```bash
# مطمئن شوید فایل .env در root پروژه هست
ls -la ~/rabin-last/.env

# کپی از .env.server
cp ~/rabin-last/.env.server ~/rabin-last/.env

# دیپلوی مجدد
docker-compose down
docker-compose up -d
```

## 📝 نکات مهم:

1. **همیشه از فایل `.env` استفاده کنید** نه `.env.server` در Docker
2. **Port ها را صریحاً تنظیم کنید** در docker-compose
3. **بعد از تغییر .env حتماً rebuild کنید** با `--no-cache`
4. **لاگ‌ها را بررسی کنید** برای یافتن مشکلات

## 🎯 اولویت‌های دیپلوی:

1. اول MySQL بیاد بالا
2. بعد Rabin Voice (روی 3001)
3. بعد NextJS (روی 3000 و وابسته به MySQL و Rabin Voice)
4. بعد phpMyAdmin
5. آخر Nginx (وابسته به همه)