# نمونه استفاده از استایل‌های ریسپانسیو موبایل

## مثال 1: صفحه ساده با هدر و آمار

```tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw, Users } from 'lucide-react';
import '../mobile-responsive.css';

export default function MyPage() {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header - ریسپانسیو می‌شود */}
      <div className="dashboard-header flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-vazir">عنوان صفحه</h1>
          <p className="text-muted-foreground font-vazir mt-2">توضیحات صفحه</p>
        </div>
        <div className="flex space-x-2 space-x-reverse">
          <Button variant="outline" className="desktop-only">
            <RefreshCw className="h-4 w-4 ml-2" />
            بروزرسانی
          </Button>
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            <span className="hidden sm:inline">افزودن آیتم</span>
            <span className="sm:hidden">افزودن</span>
          </Button>
        </div>
      </div>

      {/* آمار - از 4 ستون به 2 ستون در موبایل */}
      <div className="stats-grid grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium font-vazir">کل کاربران</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-vazir">۱۲۳</div>
          </CardContent>
        </Card>
        {/* سایر کارت‌های آمار... */}
      </div>
    </div>
  );
}
```

## مثال 2: فرم با فیلترها

```tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import '../mobile-responsive.css';

export default function FilterExample() {
  return (
    <Card className="filter-section border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 space-x-reverse font-vazir">
          <Filter className="h-5 w-5" />
          <span>فیلترها</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* در موبایل هر فیلتر در یک خط جداگانه */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="relative md:col-span-2">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="جستجو..."
              className="pr-10 font-vazir"
              dir="rtl"
            />
          </div>

          <Select>
            <SelectTrigger className="font-vazir">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-vazir">همه</SelectItem>
              <SelectItem value="active" className="font-vazir">فعال</SelectItem>
            </SelectContent>
          </Select>

          <Select>
            <SelectTrigger className="font-vazir">
              <SelectValue placeholder="دسته‌بندی" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-vazir">همه</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
```

## مثال 3: لیست کارت‌ها

```tsx
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, User, Mail, Phone } from 'lucide-react';
import '../mobile-responsive.css';

export default function CardListExample() {
  const items = [
    { id: 1, name: 'علی احمدی', email: 'ali@example.com', phone: '09123456789', status: 'active' }
  ];

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.id} className="hover:shadow-lg transition-all">
          <CardContent className="sales-card-content p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* هدر کارت */}
                <div className="flex items-center space-x-3 space-x-reverse mb-2 flex-wrap">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-white">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-lg font-semibold font-vazir">{item.name}</h3>
                  <Badge className="font-vazir">
                    {item.status === 'active' ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
                
                {/* اطلاعات - در موبایل به صورت عمودی */}
                <div className="grid gap-3 md:grid-cols-3 mt-4">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-vazir truncate-mobile">{item.email}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm font-vazir">{item.phone}</span>
                  </div>
                </div>
              </div>
              
              {/* دکمه‌های عملیات */}
              <div className="flex space-x-2 space-x-reverse">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">ویرایش</span>
                </Button>
                <Button variant="outline" size="sm" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">حذف</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

## مثال 4: دیالوگ/مودال

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import '../mobile-responsive.css';

export default function DialogExample() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          افزودن
        </Button>
      </DialogTrigger>
      {/* در موبایل تمام صفحه را می‌گیرد */}
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>افزودن آیتم جدید</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>نام</Label>
            <Input placeholder="نام را وارد کنید" />
          </div>
          <div className="space-y-2">
            <Label>ایمیل</Label>
            <Input type="email" placeholder="ایمیل را وارد کنید" />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button variant="outline">انصراف</Button>
            <Button>ذخیره</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

## مثال 5: جدول ریسپانسیو

```tsx
import { Card, CardContent } from '@/components/ui/card';
import '../mobile-responsive.css';

export default function TableExample() {
  const data = [
    { id: 1, name: 'علی احمدی', email: 'ali@example.com', status: 'فعال' }
  ];

  return (
    <Card>
      <CardContent className="p-0">
        {/* در موبایل به کارت تبدیل می‌شود */}
        <table className="w-full">
          <thead>
            <tr>
              <th>نام</th>
              <th>ایمیل</th>
              <th>وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td data-label="نام">{item.name}</td>
                <td data-label="ایمیل">{item.email}</td>
                <td data-label="وضعیت">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
```

## کلاس‌های کاربردی

### مخفی کردن در موبایل
```tsx
<Button className="desktop-only">
  این دکمه فقط در دسکتاپ نمایش داده می‌شود
</Button>
```

### نمایش فقط در موبایل
```tsx
<div className="mobile-only">
  این محتوا فقط در موبایل نمایش داده می‌شود
</div>
```

### کوتاه کردن متن در موبایل
```tsx
<span className="truncate-mobile">
  این متن در موبایل کوتاه می‌شود
</span>
```

### اسکرول افقی در موبایل
```tsx
<div className="scroll-x-mobile">
  محتوای عریض که نیاز به اسکرول افقی دارد
</div>
```

## نکات مهم

1. **همیشه CSS را import کنید:**
   ```tsx
   import '../mobile-responsive.css';
   ```

2. **از کلاس‌های مناسب استفاده کنید:**
   - `.dashboard-header` برای هدر
   - `.stats-grid` برای آمار
   - `.filter-section` برای فیلترها
   - `.sales-card-content` برای کارت‌ها

3. **برای دکمه‌ها متن جایگزین اضافه کنید:**
   ```tsx
   <span className="hidden sm:inline">متن کامل</span>
   <span className="sm:hidden">متن کوتاه</span>
   ```

4. **برای آیکون‌ها screen reader text اضافه کنید:**
   ```tsx
   <Button>
     <Edit className="h-4 w-4" />
     <span className="sr-only">ویرایش</span>
   </Button>
   ```

5. **از flex-shrink-0 برای آیکون‌ها استفاده کنید:**
   ```tsx
   <Icon className="h-4 w-4 flex-shrink-0" />
   ```
