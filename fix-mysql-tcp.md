# راه‌حل مشکل اتصال MySQL از WSL

## مشکل
MySQL در XAMPP فقط روی socket فایل گوش می‌دهد و TCP/IP غیرفعال است.
WSL نمی‌تواند به socket فایل ویندوز دسترسی داشته باشد.

## راه‌حل: فعال کردن TCP/IP

### مرحله 1: ویرایش فایل my.ini

فایل را باز کنید: `C:\xampp\mysql\bin\my.ini`

خط زیر را پیدا کنید:
```ini
# bind-address="127.0.0.1"
```

آن را به این تغییر دهید (uncomment کنید):
```ini
bind-address=0.0.0.0
```

همچنین مطمئن شوید این خط کامنت باشد:
```ini
#skip-networking
```

### مرحله 2: Restart کردن MySQL

1. XAMPP Control Panel را باز کنید
2. دکمه Stop کنار MySQL را بزنید
3. صبر کنید تا کاملاً متوقف شود
4. دکمه Start را بزنید

### مرحله 3: پیدا کردن IP ویندوز از WSL

در WSL این دستور را اجرا کنید:
```bash
cat /etc/resolv.conf | grep nameserver | awk '{print $2}'
```

این IP آدرس ویندوز شماست (مثلاً 172.x.x.x)

### مرحله 4: تست اتصال

```bash
# جایگزین کردن WINDOWS_IP با IP که گرفتید
mysql -h WINDOWS_IP -u crm_user -p1234 -e "SELECT 1"
```

### مرحله 5: آپدیت کردن .env

در فایل `.env` و `.env.local`:
```env
DATABASE_HOST=172.x.x.x  # IP ویندوز شما
DB_HOST=172.x.x.x
```

## گزینه جایگزین: اجرای پروژه در ویندوز

اگر نمی‌خواهید MySQL را تغییر دهید، پروژه را در PowerShell ویندوز اجرا کنید:

```powershell
# در PowerShell ویندوز
cd E:\NEW_ROBIN
npm run dev
```

در این صورت `127.0.0.1` کار خواهد کرد.
