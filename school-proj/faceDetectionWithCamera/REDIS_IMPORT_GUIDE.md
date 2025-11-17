# راهنمای وارد کردن دیتا به Redis

## روش‌های مختلف وارد کردن دیتا

### روش 1: استفاده از اسکریپت Python (ساده‌ترین روش)

این روش دیتاهای نمونه را مستقیماً به Redis وارد می‌کند:

```bash
python import-redis-data.py
```

**مزایا:**
- ساده و سریع
- نیاز به تنظیمات خاصی ندارد
- دیتاهای نمونه از قبل آماده است

**معایب:**
- فقط دیتاهای نمونه (بدون تصاویر کامل)

---

### روش 2: کپی مستقیم فایل dump.rdb

این روش برای وارد کردن کامل دیتاها از فایل dump.rdb:

#### مراحل:

1. **پیدا کردن دایرکتوری Redis:**
```bash
# در لینوکس/مک
redis-cli CONFIG GET dir

# خروجی مثال:
# 1) "dir"
# 2) "/var/lib/redis"
```

2. **متوقف کردن Redis:**
```bash
# در لینوکس
sudo systemctl stop redis

# در ویندوز
net stop redis

# یا در Docker
docker stop redis-container
```

3. **کپی کردن فایل dump.rdb:**
```bash
# بک‌آپ از فایل قبلی (اختیاری)
sudo cp /var/lib/redis/dump.rdb /var/lib/redis/dump.rdb.backup

# کپی فایل جدید
sudo cp dump.rdb /var/lib/redis/dump.rdb

# تنظیم مجوزها
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo chmod 660 /var/lib/redis/dump.rdb
```

4. **راه‌اندازی مجدد Redis:**
```bash
# در لینوکس
sudo systemctl start redis

# در ویندوز
net start redis

# یا در Docker
docker start redis-container
```

5. **بررسی دیتاها:**
```bash
redis-cli
> KEYS *
> GET "3381695444"
```

---

### روش 3: استفاده از ابزار rdbtools

این روش برای تبدیل dump.rdb به JSON و سپس وارد کردن:

#### نصب ابزار:
```bash
pip install rdbtools python-lzf
```

#### تبدیل به JSON:
```bash
rdb --command json dump.rdb > redis_data.json
```

#### وارد کردن به Redis:
```python
import redis
import json

redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

with open('redis_data.json', 'r') as f:
    data = json.load(f)
    for key, value in data.items():
        redis_client.set(key, json.dumps(value))
```

---

### روش 4: استفاده از redis-cli و RESTORE

برای وارد کردن کلیدهای خاص:

```bash
# دامپ گرفتن از یک کلید
redis-cli --rdb dump.rdb

# بازیابی یک کلید
redis-cli RESTORE key ttl serialized-value
```

---

## استفاده از اسکریپت مدیریتی

اسکریپت `extract-from-dump.py` ابزارهای مختلفی برای مدیریت دیتا ارائه می‌دهد:

```bash
python extract-from-dump.py
```

**قابلیت‌ها:**
1. نمایش کلیدهای موجود در Redis
2. خروجی گرفتن از Redis به فایل JSON
3. راهنمای وارد کردن از dump.rdb
4. پاک کردن تمام دیتاها

---

## تنظیمات محیطی

می‌توانید تنظیمات Redis را از طریق متغیرهای محیطی تغییر دهید:

```bash
# در لینوکس/مک
export REDIS_HOST=localhost
export REDIS_PORT=6379
export REDIS_PASSWORD=your_password

# در ویندوز (CMD)
set REDIS_HOST=localhost
set REDIS_PORT=6379
set REDIS_PASSWORD=your_password

# در ویندوز (PowerShell)
$env:REDIS_HOST="localhost"
$env:REDIS_PORT="6379"
$env:REDIS_PASSWORD="your_password"
```

---

## بررسی دیتاهای وارد شده

### با استفاده از redis-cli:
```bash
redis-cli

# نمایش تمام کلیدها
> KEYS *

# خواندن یک کلید
> GET "3381695444"

# تعداد کلیدها
> DBSIZE

# اطلاعات یک کلید
> TYPE "3381695444"
> TTL "3381695444"
```

### با استفاده از Python:
```python
import redis
import json

redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# لیست کلیدها
keys = redis_client.keys('*')
print(f"تعداد کلیدها: {len(keys)}")

# خواندن یک کلید
data = redis_client.get("3381695444")
user_data = json.loads(data)
print(user_data)
```

---

## عیب‌یابی

### خطا: Connection refused
```bash
# بررسی وضعیت Redis
sudo systemctl status redis

# راه‌اندازی Redis
sudo systemctl start redis
```

### خطا: Permission denied
```bash
# تنظیم مجوزهای فایل dump.rdb
sudo chown redis:redis /var/lib/redis/dump.rdb
sudo chmod 660 /var/lib/redis/dump.rdb
```

### خطا: NOAUTH Authentication required
```bash
# اضافه کردن پسورد به اتصال
redis-cli -a your_password

# یا در Python
redis_client = redis.StrictRedis(host='localhost', port=6379, password='your_password')
```

---

## ساختار دیتا

هر رکورد در Redis به این صورت ذخیره می‌شود:

```json
{
  "nationalCode": "3381695444",
  "fullName": "",
  "faceImage": "/9j/4AAQSkZJRgABAQAAAQABAAD...",
  "detectionTime": "1404-08-24 15:26:18"
}
```

- **Key**: کد ملی (nationalCode)
- **Value**: JSON شامل اطلاعات کاربر و تصویر چهره (Base64)

---

## نکات مهم

1. ⚠️ قبل از کپی فایل dump.rdb، حتماً از Redis خود بک‌آپ بگیرید
2. 🔒 اگر Redis شما پسورد دارد، حتماً آن را در متغیر محیطی تنظیم کنید
3. 📦 تصاویر به صورت Base64 ذخیره شده‌اند و حجم زیادی دارند
4. 🚀 برای تست سریع از روش 1 (اسکریپت Python) استفاده کنید
5. 💾 برای وارد کردن کامل دیتاها از روش 2 (کپی dump.rdb) استفاده کنید

---

## پشتیبانی

در صورت بروز مشکل:
1. لاگ‌های Redis را بررسی کنید: `sudo journalctl -u redis`
2. اتصال به Redis را تست کنید: `redis-cli ping`
3. مجوزهای فایل‌ها را بررسی کنید
