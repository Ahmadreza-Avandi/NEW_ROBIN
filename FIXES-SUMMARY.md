# خلاصه رفع مشکلات

## 🐛 مشکلات گزارش شده

### 1. ❌ خطای 500 در اضافه کردن محصول
**مشکل:** POST `/api/tenant/products` خطای 500 میده

**علت احتمالی:**
- مشکل در استخراج `userId` از session
- احتمالاً `session.userId` و `session.id` هر دو null بودن

**راه‌حل:**
```typescript
// قبل:
const userId = session.userId || session.id;

// بعد:
const userId = session.userId || session.id || session.user?.id || 'unknown';
```

**لاگ‌های اضافه شده:**
```typescript
console.log('📝 Adding product:', { name, price: productPrice, userId, tenantKey });
console.log('✅ Product added successfully, ID:', result.insertId);
```

**فایل تغییر یافته:**
- `app/api/tenant/products/route.ts`

---

### 2. ❌ حذف مشتری کار نمیکنه
**مشکل:** در صفحه customers امکان حذف وجود نداره

**علت:** API endpoint برای DELETE وجود نداشت

**راه‌حل:** اضافه کردن handler برای DELETE:

```typescript
async function handleDeleteCustomer(request: NextRequest, session: any) {
  const customerId = searchParams.get('id');
  
  // حذف مشتری
  await conn.query(
    'DELETE FROM customers WHERE id = ? AND tenant_key = ?',
    [customerId, tenantKey]
  );
  
  // ثبت فعالیت حذف
  await logActivity({
    tenantKey,
    userId,
    userName,
    type: 'customer',
    title: `حذف مشتری`,
    description: `مشتری با شناسه ${customerId} حذف شد`
  });
}

export const DELETE = requireTenantAuth(handleDeleteCustomer);
```

**فایل تغییر یافته:**
- `app/api/tenant/customers/route.ts`

---

### 3. ❌ فعالیت خودکار ثبت نمیشه
**مشکل:** وقتی مشتری یا فروش اضافه میشه، فعالیت در `/rabin/dashboard/activities` نمایش داده نمیشه

**علت احتمالی:**
- خطا در ثبت فعالیت (silent fail)
- مشکل در اتصال دیتابیس
- مشکل در استخراج userId

**راه‌حل:** اضافه کردن لاگ‌های جامع:

```typescript
export async function logActivity(params: ActivityLogParams): Promise<void> {
  try {
    console.log('📝 شروع ثبت فعالیت:', { tenantKey, userId, type, title });
    
    const [result] = await conn.query(/* ... */) as any;
    
    console.log(`✅ فعالیت ثبت شد: ${title} توسط ${userName || userId} - ID: ${result.insertId}`);
  } catch (error) {
    console.error('❌ خطا در ثبت خودکار فعالیت:', error);
    console.error('❌ جزئیات خطا:', {
      message: error instanceof Error ? error.message : String(error),
      params: { tenantKey, userId, type, title }
    });
  }
}
```

**فایل تغییر یافته:**
- `lib/activity-logger.ts`

---

## 🔍 نحوه تست

### تست محصولات:
1. برو به: `https://crm.robintejarat.com/rabin/dashboard/products`
2. کلیک روی "افزودن محصول"
3. فرم رو پر کن و ذخیره کن
4. چک کن که خطای 500 نده
5. برو به Console و لاگ‌ها رو ببین:
   ```
   📝 Adding product: { name: '...', price: ..., userId: '...', tenantKey: 'rabin' }
   ✅ Product added successfully, ID: ...
   📝 شروع ثبت فعالیت: { tenantKey: 'rabin', userId: '...', type: 'product', title: 'محصول جدید: ...' }
   ✅ فعالیت ثبت شد: محصول جدید: ... توسط ... - ID: ...
   ```

### تست حذف مشتری:
1. برو به: `https://crm.robintejarat.com/rabin/dashboard/customers`
2. روی یک مشتری کلیک کن
3. دکمه حذف رو بزن
4. چک کن که مشتری حذف بشه
5. برو به Activities و ببین فعالیت "حذف مشتری" ثبت شده

### تست فعالیت خودکار:
1. یک مشتری جدید اضافه کن
2. برو به: `https://crm.robintejarat.com/rabin/dashboard/activities`
3. باید ببینی: "مشتری جدید: [نام]"
4. یک فروش جدید ثبت کن
5. باید ببینی: "فروش جدید به [مشتری]"
6. یک محصول جدید اضافه کن
7. باید ببینی: "محصول جدید: [نام]"

---

## 📊 لاگ‌های مفید برای Debug

### در Console مرورگر:
```javascript
// فیلتر کردن لاگ‌های مربوط به فعالیت
console.log('📝 شروع ثبت فعالیت')
console.log('✅ فعالیت ثبت شد')
console.error('❌ خطا در ثبت خودکار فعالیت')
```

### در لاگ‌های سرور (Docker):
```bash
# مشاهده لاگ‌های Next.js
docker logs nextjs-crm --tail 100 -f

# جستجوی خطاها
docker logs nextjs-crm 2>&1 | grep "❌"

# جستجوی فعالیت‌ها
docker logs nextjs-crm 2>&1 | grep "فعالیت"
```

---

## 🚀 دیپلوی

بعد از اعمال تغییرات، باید دیپلوی کنی:

```bash
# روی سرور
cd /path/to/project
git pull
./deploy-server.sh
```

یا اگه فقط میخوای Next.js رو rebuild کنی:

```bash
docker compose restart nextjs
```

---

## ⚠️ نکات مهم

1. **فولدر uploads:** اطمینان حاصل کن که فولدرهای uploads در Docker ساخته شدن:
   ```bash
   docker compose exec nextjs ls -la /app/uploads
   docker compose exec nextjs ls -la /app/public/uploads
   ```

2. **مجوزها:** چک کن که مجوزهای فولدرها درست باشن:
   ```bash
   docker compose exec nextjs ls -la /app/uploads
   # باید 775 یا 777 باشه
   ```

3. **دیتابیس:** اطمینان حاصل کن که جدول activities وجود داره:
   ```bash
   docker exec mysql-crm mariadb -u root -p1234 crm_system -e "SHOW TABLES LIKE 'activities';"
   ```

4. **Session:** اگه هنوز مشکل داری، session رو چک کن:
   ```typescript
   console.log('Session:', JSON.stringify(session, null, 2));
   ```

---

## 📝 چک‌لیست نهایی

- [ ] محصول جدید اضافه میشه بدون خطای 500
- [ ] مشتری حذف میشه
- [ ] فعالیت "حذف مشتری" ثبت میشه
- [ ] فعالیت "مشتری جدید" ثبت میشه
- [ ] فعالیت "فروش جدید" ثبت میشه
- [ ] فعالیت "محصول جدید" ثبت میشه
- [ ] همه فعالیت‌ها در صفحه Activities نمایش داده میشن
- [ ] لاگ‌ها در Console قابل مشاهده هستن

---

## 🔧 اگه هنوز مشکل داری...

1. **چک کن لاگ‌های سرور:**
   ```bash
   docker logs nextjs-crm --tail 200
   ```

2. **چک کن دیتابیس:**
   ```bash
   docker exec mysql-crm mariadb -u root -p1234 crm_system -e "SELECT * FROM activities ORDER BY created_at DESC LIMIT 5;"
   ```

3. **چک کن session:**
   - برو به Network tab در DevTools
   - ببین cookie `auth-token` وجود داره
   - ببین header `X-Tenant-Key` ارسال میشه

4. **Restart کامل:**
   ```bash
   docker compose down
   docker compose up -d
   ```
