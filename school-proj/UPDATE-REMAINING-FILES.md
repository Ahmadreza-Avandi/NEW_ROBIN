# 📝 راهنمای به‌روزرسانی فایل‌های باقی‌مانده

## فایل‌هایی که نیاز به به‌روزرسانی دارند

### 1. `next/pages/profile.tsx`
جایگزین کنید:
```typescript
// قبل:
const response = await fetch(`http://localhost:3001/users/by-national-code/${nationalCode}`, ...)

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${apiUrl}/users/by-national-code/${nationalCode}`, ...)
```

همین تغییر را برای تمام fetch/axios calls در این فایل اعمال کنید.

### 2. `next/pages/register.tsx`
```typescript
// قبل:
const response = await axios.get('http://localhost:3001/users/role');

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await axios.get(`${apiUrl}/users/role`);
```

### 3. `next/pages/roles.tsx`
```typescript
// قبل:
const response = await axios.post('http://localhost:3001/users/role', newRole);

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await axios.post(`${apiUrl}/users/role`, newRole);
```

### 4. `next/pages/viewplace.tsx`
```typescript
// قبل:
const response = await fetch('http://localhost:3001/locations');

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${apiUrl}/locations`);
```

### 5. `next/pages/newplace.tsx`
```typescript
// قبل:
const response = await fetch('http://localhost:3001/locations', {...});

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${apiUrl}/locations`, {...});
```

### 6. `next/pages/createreshte.tsx`, `createclass.tsx`, `createdars.tsx`
```typescript
// قبل:
const response = await fetch('http://localhost:3001/lessons', {...});

// بعد:
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const response = await fetch(`${apiUrl}/lessons`, {...});
```

### 7. `next/pages/onlinecam/class1.tsx`
```typescript
// قبل:
const res = await fetch('http://localhost:5000/status');
videoRef.current.src = `http://localhost:5000/video_feed?t=${Date.now()}`;

// بعد:
const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';
const res = await fetch(`${pythonUrl}/status`);
videoRef.current.src = `${pythonUrl}/video_feed?t=${Date.now()}`;
```

### 8. `next/pages/users/userpic.tsx`
```typescript
// قبل:
const res = await fetch('http://localhost:5000/get_all_images');

// بعد:
const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';
const res = await fetch(`${pythonUrl}/get_all_images`);
```

### 9. `next/pages/api/view-person.ts`
```typescript
// قبل:
const response = await axios.get('http://localhost:3001/new-person');

// بعد:
import { SERVER_NESTJS_URL } from '@/lib/config';
const response = await axios.get(`${SERVER_NESTJS_URL}/new-person`);
```

### 10. `next/pages/api/auth/me.ts`
```typescript
// قبل:
const response = await axios.get('http://localhost:3001/auth/me', {...});

// بعد:
import { SERVER_NESTJS_URL } from '@/lib/config';
const response = await axios.get(`${SERVER_NESTJS_URL}/auth/me`, {...});
```

## الگوی کلی

### برای فایل‌های Frontend (pages/*.tsx):
```typescript
// در ابتدای component یا قبل از استفاده
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const pythonUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000';

// سپس استفاده کنید
fetch(`${apiUrl}/endpoint`)
fetch(`${pythonUrl}/endpoint`)
```

### برای فایل‌های API Routes (pages/api/*.ts):
```typescript
import { SERVER_NESTJS_URL, SERVER_PYTHON_URL } from '@/lib/config';

// یا
const nestjsUrl = process.env.NESTJS_API_URL || 'http://localhost:3001';
const pythonUrl = process.env.PYTHON_API_URL || 'http://localhost:5000';
```

## نکات مهم

1. **Client-side** (pages/*.tsx): از `NEXT_PUBLIC_*` استفاده کنید
2. **Server-side** (pages/api/*.ts): از متغیرهای بدون `NEXT_PUBLIC_` استفاده کنید
3. همیشه یک مقدار پیش‌فرض برای لوکال تعریف کنید
4. بعد از تغییرات، حتماً تست کنید

## تست

بعد از به‌روزرسانی:

```bash
# حالت لوکال
bash setup-env.sh 0
cd next
npm run dev

# حالت سرور
bash setup-env.sh 1
docker-compose up --build
```
