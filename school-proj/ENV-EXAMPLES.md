# 📝 نمونه فایل‌های .env

این سند نمونه‌هایی از فایل‌های `.env` که توسط `setup-env.sh` ساخته می‌شوند را نشان می‌دهد.

---

## 🏠 حالت لوکال (MODE=0)

### `.env` (اصلی پروژه)
```env
# School-Proj Environment Variables
# حالت: لوکال
# تاریخ ایجاد: ...

# MySQL Configuration
MYSQL_ROOT_PASSWORD=1234
MYSQL_DATABASE=school
MYSQL_USER=crm_user
MYSQL_PASSWORD=1234

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Database URL for Nest.js
DATABASE_URL=mysql://crm_user:1234@localhost:3306/school?connect_timeout=30

# API URLs for Next.js (Client-side)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:5000

# API URLs for Server-side
NESTJS_API_URL=http://localhost:3001
PYTHON_API_URL=http://localhost:5000

# Domain
DOMAIN=localhost

# Node Environment
NODE_ENV=development
```

### `nest/.env` (Backend)
```env
# Nest.js Environment Variables
# School-Proj Backend
# حالت: لوکال

# Database
DATABASE_URL=mysql://crm_user:1234@localhost:3306/school?connect_timeout=30

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Face Detection Service
FACE_DETECTION_URL=http://localhost:5000

# JWT Secret
JWT_SECRET=school_proj_jwt_secret_local_dev

# Environment
NODE_ENV=development

# Domain
DOMAIN=localhost
```

### `next/.env.local` (Frontend)
```env
# Next.js Environment Variables
# School-Proj Frontend
# حالت: لوکال

# API URLs for Client-side (Browser)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_PYTHON_API_URL=http://localhost:5000

# API URLs for Server-side
NESTJS_API_URL=http://localhost:3001
PYTHON_API_URL=http://localhost:5000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Database
DATABASE_URL=mysql://crm_user:1234@localhost:3306/school?connect_timeout=30

# Environment
NODE_ENV=development
```

---

## 🌐 حالت سرور (MODE=1)

### `.env` (اصلی پروژه)
```env
# School-Proj Environment Variables
# حالت: سرور
# تاریخ ایجاد: ...

# MySQL Configuration
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=mydatabase
MYSQL_USER=user
MYSQL_PASSWORD=userpassword

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379

# Database URL for Nest.js
DATABASE_URL=mysql://user:userpassword@mysql:3306/mydatabase?connect_timeout=30

# API URLs for Next.js (Client-side)
NEXT_PUBLIC_API_URL=https://sch.ahmadreza-avandi.ir/api
NEXT_PUBLIC_PYTHON_API_URL=https://sch.ahmadreza-avandi.ir/python-api

# API URLs for Server-side
NESTJS_API_URL=http://nestjs:3001
PYTHON_API_URL=http://pythonserver:5000

# Domain
DOMAIN=sch.ahmadreza-avandi.ir

# Node Environment
NODE_ENV=production
```

### `nest/.env` (Backend)
```env
# Nest.js Environment Variables
# School-Proj Backend
# حالت: سرور

# Database
DATABASE_URL=mysql://user:userpassword@mysql:3306/mydatabase?connect_timeout=30

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Face Detection Service
FACE_DETECTION_URL=http://pythonserver:5000

# JWT Secret
JWT_SECRET=school_proj_jwt_secret_1731600000_abc123...

# Environment
NODE_ENV=production

# Domain
DOMAIN=sch.ahmadreza-avandi.ir
```

### `next/.env.local` (Frontend)
```env
# Next.js Environment Variables
# School-Proj Frontend
# حالت: سرور

# API URLs for Client-side (Browser)
NEXT_PUBLIC_API_URL=https://sch.ahmadreza-avandi.ir/api
NEXT_PUBLIC_PYTHON_API_URL=https://sch.ahmadreza-avandi.ir/python-api

# API URLs for Server-side
NESTJS_API_URL=http://nestjs:3001
PYTHON_API_URL=http://pythonserver:5000

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# Database
DATABASE_URL=mysql://user:userpassword@mysql:3306/mydatabase?connect_timeout=30

# Environment
NODE_ENV=production
```

### `next/.env.production` (فقط در حالت سرور)
```env
# Next.js Production Environment
# School-Proj

NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_PYTHON_API_URL=/python-api
NODE_ENV=production
```

---

## 🔑 تفاوت‌های کلیدی

| مورد | لوکال (0) | سرور (1) |
|------|-----------|----------|
| **دیتابیس** | `school` | `mydatabase` |
| **کاربر MySQL** | `crm_user` | `user` |
| **رمز MySQL** | `1234` | `userpassword` |
| **هاست MySQL** | `localhost` | `mysql` (Docker) |
| **Redis** | `localhost` | `redis` (Docker) |
| **دامنه** | `localhost` | `sch.ahmadreza-avandi.ir` |
| **محیط** | `development` | `production` |
| **API URLs** | `http://localhost:...` | `https://domain/...` |

---

## 💡 نکات

1. **لوکال**: برای توسعه و تست روی سیستم شخصی
2. **سرور**: برای دیپلوی با Docker و Nginx
3. **امنیت**: در حالت سرور، JWT Secret به صورت تصادفی تولید می‌شود
4. **شبکه**: در حالت سرور، سرویس‌ها از طریق شبکه Docker با هم ارتباط دارند
