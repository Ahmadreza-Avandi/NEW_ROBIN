# تنظیم میرورهای Alpine برای آروان کلود

این فایل‌ها برای حل مشکل اینترنت داخلی و استفاده از میرورهای آروان کلود تغییر کرده‌اند.

## تغییرات انجام شده:

### 1. Dockerfile اصلی
- اضافه شدن میرور آروان کلود برای Alpine repositories
- به‌روزرسانی دستورات `apk` برای استفاده از میرور جدید

### 2. nginx/Dockerfile (جدید)
- Dockerfile سفارشی برای nginx با میرور آروان کلود
- نصب ابزارهای اضافی (curl, bash)

### 3. redis/Dockerfile (جدید)
- Dockerfile سفارشی برای Redis با میرور آروان کلود
- نصب ابزارهای اضافی (curl, bash)

### 4. docker-compose فایل‌ها
- تغییر از `image: nginx:alpine` به `build` سفارشی
- استفاده از Dockerfile های سفارشی

### 5. deploy-server.sh
- تغییر nginx موقت به build سفارشی

## میرورهای استفاده شده:

```
https://mirror.arvancloud.ir/alpine/v3.20/main
https://mirror.arvancloud.ir/alpine/v3.20/community
```

## نحوه استفاده:

1. اجرای اسکریپت به‌روزرسانی (اختیاری):
```bash
chmod +x update-alpine-mirrors.sh
bash update-alpine-mirrors.sh
```

2. ادامه deploy معمولی:
```bash
bash deploy-server.sh
```

## نکات مهم:

- اولین build ممکن است کمی طولانی باشد چون images سفارشی ساخته می‌شوند
- پس از اولین build، builds بعدی سریع‌تر خواهند بود
- تمام تغییرات برای بهبود سرعت دانلود در ایران انجام شده‌اند

## فایل‌های تغییر کرده:

- `Dockerfile` - میرور آروان کلود اضافه شد
- `nginx/Dockerfile` - جدید
- `redis/Dockerfile` - جدید  
- `docker-compose.yml` - تغییر به build سفارشی
- `docker-compose.memory-optimized.yml` - تغییر به build سفارشی
- `deploy-server.sh` - nginx موقت به build سفارشی

## تست تغییرات:

برای تست اینکه میرورها کار می‌کنند:

```bash
# تست nginx build
docker build -t test-nginx ./nginx

# تست redis build  
docker build -t test-redis ./redis

# تست Dockerfile اصلی
docker build -t test-main .
```