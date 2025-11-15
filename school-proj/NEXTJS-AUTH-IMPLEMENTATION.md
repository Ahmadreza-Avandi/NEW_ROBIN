# 🔐 پیاده‌سازی سیستم احراز هویت و دسترسی در Next.js

## 📁 فایل‌های ایجاد شده

### 1. کتابخانه احراز هویت
- ✅ `next/lib/auth.ts` - توابع اصلی احراز هویت و دسترسی
- ✅ `next/hooks/useAuth.ts` - Hook های React برای استفاده در صفحات
- ✅ `next/components/ProtectedRoute.tsx` - کامپوننت محافظت از صفحات

### 2. API Routes محافظت شده
- ✅ `next/pages/api/admin/create-grade.ts` - ایجاد پایه
- ✅ `next/pages/api/admin/create-major.ts` - ایجاد رشته
- ✅ `next/pages/api/admin/create-class.ts` - ایجاد کلاس
- ✅ `next/pages/api/admin/create-subject.ts` - ایجاد درس

### 3. صفحات به‌روزرسانی شده
- ✅ `next/pages/createclass.tsx` - صفحه ایجاد کلاس (فقط مدیر)

---

## 🎯 نقش‌ها و دسترسی‌ها

### مدیر (roleId = 1)
```typescript
✅ مشاهده همه چیز
✅ ایجاد/ویرایش/حذف کلاس‌ها
✅ ایجاد/ویرایش/حذف پایه‌ها و رشته‌ها
✅ ایجاد/ویرایش/حذف دروس
✅ مدیریت کاربران
✅ مشاهده حضور و غیاب
```

### معلم (roleId = 2)
```typescript
✅ مشاهده دانش‌آموزان کلاس خودش
✅ ثبت حضور و غیاب
✅ مشاهده دروس خودش
❌ ایجاد کلاس، پایه، رشته
❌ مدیریت کاربران
```

### دانش‌آموز (roleId = 3)
```typescript
✅ ثبت‌نام
✅ مشاهده پروفایل خودش
✅ مشاهده حضور و غیاب خودش
❌ هیچ دسترسی مدیریتی
```

---

## 💻 نحوه استفاده

### 1. محافظت از صفحات

#### روش 1: استفاده از Hook

```typescript
import { useRequireAdmin } from '@/hooks/useAuth';

export default function AdminPage() {
  const { user, loading } = useRequireAdmin();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>صفحه مدیریت</h1>
      <p>خوش آمدید {user?.fullName}</p>
    </div>
  );
}
```

#### روش 2: استفاده از Component

```typescript
import { AdminRoute } from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <div>
        <h1>صفحه مدیریت</h1>
      </div>
    </AdminRoute>
  );
}
```

### 2. محافظت از API Routes

```typescript
import { withAuth } from '@/lib/auth';
import { UserRole } from '@/lib/auth';

export default withAuth(
  async (req, res, user) => {
    // user اطلاعات کاربر لاگین شده
    // فقط مدیران می‌توانند به اینجا دسترسی داشته باشند
    
    return res.json({ message: 'Success', user });
  },
  { requiredRole: UserRole.ADMIN }
);
```

### 3. نمایش مشروط در UI

```typescript
import { ConditionalRender } from '@/components/ProtectedRoute';
import { UserRole } from '@/lib/auth';

export default function Dashboard() {
  return (
    <div>
      <h1>داشبورد</h1>
      
      {/* فقط برای مدیر */}
      <ConditionalRender requiredRole={UserRole.ADMIN}>
        <button>ایجاد کلاس جدید</button>
      </ConditionalRender>
      
      {/* برای مدیر و معلم */}
      <ConditionalRender requiredRole={[UserRole.ADMIN, UserRole.TEACHER]}>
        <button>ثبت حضور و غیاب</button>
      </ConditionalRender>
    </div>
  );
}
```

### 4. چک دسترسی دستی

```typescript
import { useAuth } from '@/hooks/useAuth';

export default function MyPage() {
  const { user, isAdmin, isTeacher, canAccess } = useAuth();

  return (
    <div>
      {isAdmin && <p>شما مدیر هستید</p>}
      {isTeacher && <p>شما معلم هستید</p>}
      {canAccess('editPlaces') && <button>ویرایش مکان</button>}
    </div>
  );
}
```

---

## 🔧 API های جدید

### 1. ایجاد پایه تحصیلی

```typescript
POST /api/admin/create-grade
Authorization: Bearer {token}

Body:
{
  "name": "دهم"
}

Response:
{
  "message": "پایه با موفقیت ایجاد شد",
  "id": 1,
  "name": "دهم"
}
```

### 2. ایجاد رشته

```typescript
POST /api/admin/create-major
Authorization: Bearer {token}

Body:
{
  "name": "شبکه و نرم‌افزار"
}

Response:
{
  "message": "رشته با موفقیت ایجاد شد",
  "id": 1,
  "name": "شبکه و نرم‌افزار"
}
```

### 3. ایجاد کلاس

```typescript
POST /api/admin/create-class
Authorization: Bearer {token}

Body:
{
  "name": "دهم شبکه",
  "majorId": 1,
  "gradeId": 3
}

Response:
{
  "message": "کلاس با موفقیت ایجاد شد",
  "id": 1,
  "name": "دهم شبکه",
  "majorId": 1,
  "gradeId": 3
}
```

### 4. ایجاد درس

```typescript
POST /api/admin/create-subject
Authorization: Bearer {token}

Body:
{
  "name": "ریاضی",
  "classId": 1,
  "teacherId": 2,
  "dayOfWeek": "شنبه",
  "startTime": "08:00:00",
  "endTime": "09:30:00"
}

Response:
{
  "message": "درس با موفقیت ایجاد شد",
  "id": 1,
  ...
}
```

---

## 📝 مثال کامل: صفحه ایجاد کلاس

```typescript
import { useState, useEffect } from 'react';
import { AdminRoute } from '@/components/ProtectedRoute';
import { useRequireAdmin } from '@/hooks/useAuth';

export default function CreateClassPage() {
  const { user, loading } = useRequireAdmin();
  const [formData, setFormData] = useState({
    name: '',
    majorId: '',
    gradeId: '',
  });
  const [majors, setMajors] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    // دریافت رشته‌ها و پایه‌ها
    fetch('/api/majors').then(r => r.json()).then(setMajors);
    fetch('/api/grades').then(r => r.json()).then(setGrades);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('access_token');
    const response = await fetch('/api/admin/create-class', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      alert('کلاس با موفقیت ایجاد شد');
      setFormData({ name: '', majorId: '', gradeId: '' });
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AdminRoute>
      <form onSubmit={handleSubmit}>
        <input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="نام کلاس"
          required
        />
        
        <select
          value={formData.majorId}
          onChange={(e) => setFormData({...formData, majorId: e.target.value})}
          required
        >
          <option value="">انتخاب رشته</option>
          {majors.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={formData.gradeId}
          onChange={(e) => setFormData({...formData, gradeId: e.target.value})}
          required
        >
          <option value="">انتخاب پایه</option>
          {grades.map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>

        <button type="submit">ایجاد کلاس</button>
      </form>
    </AdminRoute>
  );
}
```

---

## 🚀 مراحل بعدی

### صفحات باقی‌مانده که باید به‌روزرسانی شوند:

1. ✅ `createclass.tsx` - انجام شد
2. ⏳ `createdars.tsx` - ایجاد درس (فقط مدیر)
3. ⏳ `createreshte.tsx` - ایجاد رشته (فقط مدیر)
4. ⏳ `attendance.tsx` - حضور و غیاب (مدیر و معلم)
5. ⏳ `viewusers.tsx` - مشاهده کاربران (مدیر و معلم)

### API های باقی‌مانده:

1. ⏳ محدود کردن دسترسی به attendance API
2. ⏳ محدود کردن دسترسی به users API
3. ⏳ API برای دریافت دروس معلم
4. ⏳ API برای دریافت دانش‌آموزان کلاس

---

## ✅ چک‌لیست تست

- [ ] مدیر می‌تواند کلاس ایجاد کند
- [ ] معلم نمی‌تواند کلاس ایجاد کند (403)
- [ ] دانش‌آموز نمی‌تواند کلاس ایجاد کند (403)
- [ ] بدون لاگین redirect به /login می‌شود
- [ ] توکن نامعتبر 401 برمی‌گرداند
- [ ] API ها با Authorization header کار می‌کنند

---

## 🔐 امنیت

1. **همیشه** توکن را در localStorage ذخیره کنید
2. **همیشه** توکن را در header ارسال کنید
3. **هرگز** توکن را در URL قرار ندهید
4. **همیشه** دسترسی را در سمت سرور چک کنید
5. **هرگز** فقط به چک سمت کلاینت اعتماد نکنید
