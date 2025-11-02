# دستورالعمل تست وب‌اپ دمو

## مشکلات گزارش شده:
1. ❌ افزودن وظیفه در دمو کار نمی‌کند
2. ❌ افزودن فعالیت در دمو کار نمی‌کند  
3. ❌ آپلود سند در دمو کار نمی‌کند

---

## مراحل تست:

### 1. لاگین به دمو
```
URL: http://localhost:3000/rabin/login
Email: Robintejarat@gmail.com
Password: admin123
```

### 2. تست افزودن وظیفه

**مسیر:** `http://localhost:3000/rabin/dashboard/tasks`

**مراحل:**
1. کلیک روی دکمه "وظیفه جدید"
2. پر کردن فرم:
   - عنوان: "تست وظیفه جدید"
   - توضیحات: "این یک تست است"
   - محول به: انتخاب یک همکار
   - اولویت: متوسط
   - تاریخ سررسید: انتخاب یک تاریخ
3. کلیک روی "ایجاد وظیفه"

**نتیجه مورد انتظار:**
- ✅ پیام موفقیت نمایش داده شود
- ✅ وظیفه جدید در لیست ظاهر شود

**در صورت خطا:**
- F12 را بزنید و Console را باز کنید
- خطاها را یادداشت کنید
- Network tab را چک کنید و ببینید درخواست به کدام API رفته

---

### 3. تست افزودن فعالیت

**مسیر:** `http://localhost:3000/rabin/dashboard/activities`

**مراحل:**
1. کلیک روی دکمه "فعالیت جدید"
2. پر کردن فرم:
   - مشتری: جستجو و انتخاب یک مشتری
   - نوع فعالیت: تماس تلفنی
   - عنوان: "تست فعالیت جدید"
   - نتیجه: تکمیل شده
   - توضیحات: "این یک تست است"
3. کلیک روی "ثبت فعالیت"

**نتیجه مورد انتظار:**
- ✅ پیام موفقیت نمایش داده شود
- ✅ فعالیت جدید در لیست ظاهر شود

**در صورت خطا:**
- F12 را بزنید و Console را باز کنید
- خطاها را یادداشت کنید
- Network tab را چک کنید

---

### 4. تست آپلود سند

**مسیر:** `http://localhost:3000/rabin/dashboard/documents`

**مراحل:**
1. کلیک روی دکمه "آپلود سند جدید"
2. پر کردن فرم:
   - انتخاب فایل: یک فایل PDF یا تصویر
   - عنوان: "تست سند جدید"
   - توضیحات: "این یک تست است"
   - سطح دسترسی: خصوصی
3. کلیک روی "آپلود"

**نتیجه مورد انتظار:**
- ✅ پیام موفقیت نمایش داده شود
- ✅ سند جدید در لیست ظاهر شود

**در صورت خطا:**
- F12 را بزنید و Console را باز کنید
- خطاها را یادداشت کنید
- Network tab را چک کنید

---

## نکات مهم برای دیباگ:

### 1. بررسی Console (F12)
```javascript
// خطاهای احتمالی:
- "401 Unauthorized" → مشکل احراز هویت
- "400 Bad Request" → داده‌های ارسالی اشتباه
- "500 Internal Server Error" → مشکل سرور
- "Network Error" → مشکل اتصال
```

### 2. بررسی Network Tab
```
- Request URL: باید به /api/tenant/... باشد
- Request Headers: باید X-Tenant-Key: rabin داشته باشد
- Request Headers: باید Authorization: Bearer TOKEN داشته باشد
- Response: پاسخ سرور را چک کنید
```

### 3. بررسی Local Storage
```javascript
// در Console تایپ کنید:
localStorage.getItem('tenant_token')
localStorage.getItem('currentUser')

// باید token و اطلاعات کاربر را نشان دهد
```

### 4. بررسی Cookies
```javascript
// در Console تایپ کنید:
document.cookie

// باید auth-token را نشان دهد
```

---

## خطاهای رایج و راه‌حل:

### خطا: "توکن نامعتبر است"
**راه‌حل:**
1. Logout کنید
2. دوباره Login کنید
3. Cache مرورگر را پاک کنید (Ctrl+Shift+Del)

### خطا: "Tenant key یافت نشد"
**راه‌حل:**
1. مطمئن شوید URL شامل `/rabin/` است
2. صفحه را Refresh کنید
3. دوباره Login کنید

### خطا: "خطا در اتصال به سرور"
**راه‌حل:**
1. مطمئن شوید سرور در حال اجرا است
2. چک کنید که پورت 3000 باز است
3. لاگ‌های سرور را بررسی کنید

### خطا: "دسترسی غیرمجاز"
**راه‌حل:**
1. مطمئن شوید با کاربر صحیح لاگین کرده‌اید
2. دسترسی‌های کاربر را در دیتابیس چک کنید
3. دوباره Login کنید

---

## اسکریپت‌های کمکی:

### تست سریع از Console مرورگر:
```javascript
// تست افزودن وظیفه
fetch('/api/tenant/tasks', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Key': 'rabin',
    'Authorization': 'Bearer ' + localStorage.getItem('tenant_token')
  },
  body: JSON.stringify({
    title: 'تست از Console',
    description: 'تست',
    assigned_to: ['ceo-001'],
    priority: 'medium',
    due_date: new Date(Date.now() + 7*24*60*60*1000).toISOString()
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

```javascript
// تست افزودن فعالیت
fetch('/api/tenant/activities', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-Key': 'rabin',
    'Authorization': 'Bearer ' + localStorage.getItem('tenant_token')
  },
  body: JSON.stringify({
    customer_id: 'CUSTOMER_ID_HERE', // باید ID یک مشتری واقعی باشد
    type: 'call',
    title: 'تست از Console',
    description: 'تست',
    outcome: 'completed'
  })
})
.then(r => r.json())
.then(d => console.log('Result:', d))
.catch(e => console.error('Error:', e));
```

---

## گزارش مشکل:

اگر مشکلی پیدا کردید، لطفاً موارد زیر را گزارش دهید:

1. **URL صفحه:**
2. **عملیات انجام شده:**
3. **پیام خطا:**
4. **خطاهای Console:**
5. **اسکرین‌شات Network Tab:**
6. **اسکرین‌شات صفحه:**

---

**تاریخ:** ۱۴۰۴/۰۸/۰۶
**نسخه:** 1.0.0
