# 🚀 راهنمای سریع دیپلوی School-Proj

## 📌 خلاصه

پروژه School-Proj حالا آماده دیپلوی روی دامنه **sch.ahmadreza-avandi.ir** است.

تمام پورت‌ها تغییر کردند تا با پروژه CRM تداخل نداشته باشند.

## ⚡ دیپلوی سریع (3 مرحله)

### مرحله 1: آماده‌سازی سرور (فقط بار اول)
```bash
cd school-proj
sudo bash setup-server.sh
```

### مرحله 2: دریافت SSL (فقط بار اول)
```bash
sudo bash setup-ssl.sh
```

### مرحله 3: دیپلوی پروژه
```bash
bash deploy.sh
```

## 🎯 همین! پروژه شما آماده است

بعد از دیپلوی موفق:
- 🌐 وب‌سایت: https://sch.ahmadreza-avandi.ir
- 🔧 API: https://sch.ahmadreza-avandi.ir/api
- 🐍 Python: https://sch.ahmadreza-avandi.ir/python-api

## 📊 دستورات مفید

```bash
# بررسی وضعیت
bash status.sh

# مشاهده لاگ‌ها
bash status.sh logs

# ری‌استارت
bash restart.sh

# توقف
bash stop.sh
```

## 🔧 پورت‌های جدید

| سرویس | پورت |
|-------|------|
| Next.js | 3003 |
| Nest.js | 3002 |
| Python | 5001 |
| MySQL | 3307 |
| Redis | 6380 |

## 📚 مستندات کامل

برای اطلاعات بیشتر:
- `DEPLOY-README.md` - راهنمای کامل دیپلوی
- `CHANGES.md` - لیست تغییرات

## ⚠️ نکته مهم

این پروژه کاملاً مستقل از CRM است و هیچ تداخلی ندارد.

---

**آماده برای دیپلوی!** 🎉
