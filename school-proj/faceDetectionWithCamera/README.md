# سیستم تشخیص چهره و ثبت حضور

## نصب و راه‌اندازی

### 1. نصب پکیج‌های Python

```bash
pip install -r requirements.txt
```

### 2. تنظیمات محیطی

فایل `.env` را ویرایش کنید و اطلاعات دیتابیس و Redis خود را وارد کنید.

### 3. راه‌اندازی Redis

اگر Redis نصب نیست:

**Windows:**
```bash
# دانلود از https://github.com/microsoftarchive/redis/releases
# یا استفاده از Docker:
docker run -d -p 6379:6379 redis
```

**Linux/Mac:**
```bash
sudo apt-get install redis-server
redis-server
```

### 4. اجرای سرور Flask (get-face-data.py)

```bash
python get-face-data.py
```

سرور روی پورت 5000 اجرا می‌شود.

### 5. اجرای سیستم تشخیص چهره (faceDetectionWithCamera.py)

```bash
python faceDetectionWithCamera.py
```

## استفاده

1. ابتدا از صفحه `/register2` در Next.js ثبت‌نام کنید
2. تصویر شما به Redis و Liara Storage ارسال می‌شود
3. سیستم تشخیص چهره به صورت خودکار مدل را آموزش می‌دهد
4. با اجرای `faceDetectionWithCamera.py` دوربین فعال می‌شود و حضور ثبت می‌شود

## نکات مهم

- مطمئن شوید MySQL، Redis و سرور Flask در حال اجرا هستند
- برای تست، ابتدا چند کاربر ثبت‌نام کنید
- مدل در پوشه `trainer/model.xml` ذخیره می‌شود
- لاگ‌ها در فایل `attendance.log` ذخیره می‌شوند

## متغیرهای محیطی

| متغیر | پیش‌فرض | توضیحات |
|-------|---------|---------|
| MYSQL_HOST | localhost | آدرس MySQL |
| MYSQL_PORT | 3306 | پورت MySQL |
| MYSQL_DATABASE | school | نام دیتابیس |
| MYSQL_USER | crm_user | نام کاربری MySQL |
| MYSQL_PASSWORD | 1234 | رمز عبور MySQL |
| REDIS_HOST | localhost | آدرس Redis |
| REDIS_PORT | 6379 | پورت Redis |
| LOG_LEVEL | INFO | سطح لاگ |
