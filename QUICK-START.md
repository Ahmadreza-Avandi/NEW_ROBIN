# 🚀 راهنمای سریع دیپلوی

## پیش‌نیازها
- Docker و Docker Compose نصب شده باشد
- دامنه به سرور متصل باشد
- پورت‌های 80 و 443 باز باشند

## مراحل دیپلوی

### 1. آماده‌سازی فایل .env
```bash
# اگر فایل .env.server موجود است
cp .env.server .env

# یا از template استفاده کنید
cp .env.example .env
nano .env  # ویرایش و تنظیم مقادیر
```

### 2. تنظیم متغیرهای ضروری در .env
```env
# دیتابیس
DATABASE_USER=crm_user
DATABASE_PASSWORD=your_secure_password_here
DATABASE_NAME=crm_system

# JWT
JWT_SECRET=your_jwt_secret_32_chars_minimum

# صدای رابین
RABIN_VOICE_OPENROUTER_API_KEY=your_openrouter_api_key
```

### 3. اجرای دیپلوی
```bash
# دیپلوی معمولی
./deploy-server.sh

# یا دیپلوی با پاکسازی کامل
./deploy-server.sh --clean
```

### 4. تست سیستم
```bash
# تست دسترسی دیتابیس
bash test-database-access.sh

# بررسی وضعیت کانتینرها
docker ps

# مشاهده لاگ‌ها
docker-compose logs -f
```

## دسترسی به سیستم

### CRM اصلی
```
http://crm.robintejarat.com
```

### دستیار صوتی رابین
```
http://crm.robintejarat.com/rabin-voice
```

### phpMyAdmin
```
http://crm.robintejarat.com/secure-db-admin-panel-x7k9m2/
```

**اطلاعات ورود phpMyAdmin**:
- Username: مقدار `DATABASE_USER` از `.env`
- Password: مقدار `DATABASE_PASSWORD` از `.env`

## دستورات مفید

```bash
# مشاهده لاگ یک سرویس
docker logs -f rabin-voice
docker logs -f nextjs
docker logs -f mysql

# راه‌اندازی مجدد یک سرویس
docker-compose restart rabin-voice

# توقف همه سرویس‌ها
docker-compose down

# راه‌اندازی مجدد همه سرویس‌ها
docker-compose up -d

# ورود به کانتینر
docker exec -it mysql bash
docker exec -it nextjs sh
```

## رفع مشکلات

### مشکل دسترسی دیتابیس
```bash
bash test-database-access.sh
```

### مشکل صدای رابین
```bash
docker logs rabin-voice
docker restart rabin-voice
```

### مشکل NextJS
```bash
docker logs nextjs
docker restart nextjs
```

## اسناد کامل

- **تغییرات و بهبودها**: `CHANGES-SUMMARY.md`
- **راهنمای phpMyAdmin**: `PHPMYADMIN-LOGIN.md`
- **راهنمای کامل دیپلوی**: `DOCKER-DEPLOYMENT.md`

## پشتیبانی

اگر مشکلی پیش آمد:
1. لاگ‌ها را بررسی کنید
2. `test-database-access.sh` را اجرا کنید
3. اسناد مربوطه را مطالعه کنید
