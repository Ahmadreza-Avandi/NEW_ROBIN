# ⚡ راهنمای سریع School-Proj

## مشکل فعلی و راه حل

**مشکل**: Dockerfile های Next.js و Nest.js برای production build نیاز به devDependencies دارند.

**راه حل**: Dockerfile ها به multi-stage build تبدیل شدند.

## 🚀 دیپلوی سریع (2 دستور)

```bash
cd school-proj

# 1. ایجاد .env ها (اگر قبلاً نساختی)
bash setup-env.sh

# 2. دیپلوی
bash quick-deploy.sh
```

## 📝 تغییرات انجام شده

### 1. Next.js Dockerfile
- ✅ Multi-stage build
- ✅ مرحله اول: build با تمام dependencies
- ✅ مرحله دوم: production با فقط runtime dependencies

### 2. Nest.js Dockerfile
- ✅ Multi-stage build
- ✅ Build خودکار در Docker
- ✅ Prisma generate و migrate

### 3. اسکریپت quick-deploy.sh
- ✅ Build هر سرویس جداگانه
- ✅ مدیریت خطا و retry
- ✅ نمایش پیشرفت

## 🔍 اگر خطا داد

### خطا در build Next.js

```bash
# Build با no-cache
docker-compose build --no-cache nextjs

# مشاهده لاگ
docker-compose logs nextjs
```

### خطا در build Nest.js

```bash
# Build با no-cache
docker-compose build --no-cache nestjs

# مشاهده لاگ
docker-compose logs nestjs
```

### خطای npm

```bash
# پاک کردن node_modules در container
docker-compose down -v
docker-compose build --no-cache
```

## ✅ بعد از دیپلوی موفق

```bash
# بررسی وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f

# تست سرویس‌ها
curl http://localhost:3003  # Next.js
curl http://localhost:3002  # Nest.js
curl http://localhost:5001  # Python
```

## 🌐 دسترسی

- **وب‌سایت**: https://sch.ahmadreza-avandi.ir
- **API**: https://sch.ahmadreza-avandi.ir/api
- **Python**: https://sch.ahmadreza-avandi.ir/python-api

---

**نکته**: اولین build ممکن است 10-15 دقیقه طول بکشد. صبور باش! ☕
