# راهنمای حل مشکل آپلود فایل در Docker

این راهنما برای حل مشکلات آپلود فایل و رویدادها در محیط Docker طراحی شده است.

## مشکلات حل شده

### 1. مشکلات Volume و مجوزها
- ✅ تنظیم صحیح volumes در `docker-compose.yml`
- ✅ اصلاح مجوزهای فولدرهای uploads در `Dockerfile`
- ✅ ایجاد خودکار فولدرهای مورد نیاز

### 2. مشکلات Nginx
- ✅ افزایش حد آپلود فایل به 100MB
- ✅ تنظیم timeout مناسب برای آپلود
- ✅ بهینه‌سازی proxy settings برای API

### 3. مشکلات API
- ✅ بهبود error handling در `/api/documents`
- ✅ اضافه کردن logging کامل
- ✅ بررسی مجوزهای نوشتن قبل از آپلود

## فایل‌های تغییر یافته

### 1. `Dockerfile`
```dockerfile
# ایجاد فولدرهای uploads با مجوزهای صحیح
RUN mkdir -p /app/uploads/documents /app/uploads/avatars /app/uploads/chat /app/uploads/temp
RUN chown -R nextjs:nodejs /app/uploads /app/public/uploads
RUN chmod -R 775 /app/uploads/documents
```

### 2. `docker-compose.yml`
```yaml
volumes:
  # Mount uploads با مجوز نوشتن
  - ./uploads:/app/uploads:rw
  - ./public/uploads:/app/public/uploads:rw
  - ./logs:/app/logs:rw
```

### 3. `nginx/default.conf`
```nginx
# افزایش حد آپلود
client_max_body_size 100M;
client_body_buffer_size 256k;

# تنظیمات بهینه برای API
proxy_request_buffering off;
proxy_buffering off;
```

### 4. `app/api/documents/route.ts`
- اضافه شدن logging کامل
- بررسی مجوزهای نوشتن
- بهبود error handling

### 5. `deploy-server.sh`
- ایجاد خودکار فولدرهای uploads
- تنظیم مجوزهای صحیح
- تست خودکار مجوزهای نوشتن

## نحوه استفاده

### 1. دیپلوی کامل (پیشنهادی)
```bash
# دیپلوی با پاکسازی کامل
npm run deploy:clean

# یا
bash deploy-server.sh --clean
```

### 2. دیپلوی معمولی
```bash
npm run deploy

# یا
bash deploy-server.sh
```

### 3. تست مشکلات Docker
```bash
npm run test:docker

# یا
bash test-docker-uploads.sh
```

### 4. تست کامل API
```bash
npm run test:api

# یا
node test-documents-api-complete.js
```

## بررسی مشکلات

### 1. بررسی وضعیت کانتینرها
```bash
docker-compose ps
```

### 2. بررسی لاگ‌های NextJS
```bash
docker-compose logs nextjs --tail 50
```

### 3. بررسی مجوزهای uploads
```bash
docker-compose exec nextjs ls -la /app/uploads/
```

### 4. تست نوشتن فایل
```bash
docker-compose exec nextjs touch /app/uploads/test.txt
docker-compose exec nextjs rm /app/uploads/test.txt
```

## مسیرهای مهم

### در کانتینر:
- `/app/uploads/documents` - فایل‌های اسناد
- `/app/uploads/avatars` - تصاویر پروفایل
- `/app/uploads/chat` - فایل‌های چت
- `/app/uploads/temp` - فایل‌های موقت

### در سرور:
- `./uploads/` - فولدر اصلی آپلود
- `./public/uploads/` - فایل‌های عمومی
- `./logs/` - لاگ‌های سیستم

## عیب‌یابی

### مشکل: آپلود فایل 500 Error
1. بررسی لاگ‌های NextJS
2. بررسی مجوزهای فولدر uploads
3. بررسی اتصال دیتابیس
4. اجرای تست Docker

### مشکل: فولدر uploads وجود ندارد
```bash
# ایجاد دستی فولدرها
mkdir -p uploads/{documents,avatars,chat,temp}
chmod -R 777 uploads

# restart کانتینر
docker-compose restart nextjs
```

### مشکل: مجوز نوشتن
```bash
# اصلاح مجوزها در کانتینر
docker-compose exec nextjs chown -R nextjs:nodejs /app/uploads
docker-compose exec nextjs chmod -R 775 /app/uploads
```

## تست نهایی

پس از اعمال تغییرات:

1. **دیپلوی کامل:**
   ```bash
   npm run deploy:clean
   ```

2. **انتظار 2-3 دقیقه** برای آماده شدن سرویس‌ها

3. **تست Docker:**
   ```bash
   npm run test:docker
   ```

4. **تست API:**
   ```bash
   npm run test:api
   ```

5. **تست دستی** در مرورگر:
   - ورود به سیستم
   - رفتن به بخش اسناد
   - آپلود یک فایل تست

## نکات مهم

- ✅ همیشه قبل از دیپلوی، backup از دیتابیس بگیرید
- ✅ پس از دیپلوی، حتماً تست‌ها را اجرا کنید
- ✅ لاگ‌های سیستم را بررسی کنید
- ✅ مجوزهای فولدرها را چک کنید

## پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های کامل را بررسی کنید
2. تست‌های خودکار را اجرا کنید
3. مجوزهای فولدرها را چک کنید
4. در صورت نیاز، دیپلوی کامل انجام دهید