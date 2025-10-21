# راهنمای تنظیم Gmail API برای ارسال ایمیل

## مشکل فعلی
سیستم ارسال ایمیل در بخش‌های زیر روی سرور کار نمی‌کند:
- 📄 ارسال اسناد (`/dashboard/documents`)
- 📝 ارسال فرم‌های بازخورد (`/dashboard/feedback`)

## علت مشکل
1. **URL اشتباه**: فایل‌ها از `localhost:3000` استفاده می‌کردند که روی سرور کار نمی‌کند
2. **متغیرهای Gmail**: متغیرهای Gmail OAuth2 در فایل `.env` تنظیم نشده‌اند

## تغییرات انجام شده ✅

### 1. اصلاح URL های API
فایل‌های زیر اصلاح شدند تا از URL مناسب استفاده کنند:
- `app/api/documents/[id]/send-email/route.ts`
- `app/api/documents/[id]/share/route.ts`
- `app/api/feedback/forms/send/route.ts`

### 2. اضافه کردن متغیرهای Gmail به template
فایل `.env.server.template` به‌روزرسانی شد و متغیرهای زیر اضافه شدند:
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REFRESH_TOKEN=your_google_refresh_token_here
```

## مراحل تنظیم Gmail API

### مرحله 1: ایجاد پروژه در Google Cloud Console
1. به [Google Cloud Console](https://console.cloud.google.com/) بروید
2. پروژه جدید ایجاد کنید یا پروژه موجود را انتخاب کنید
3. Gmail API را فعال کنید

### مرحله 2: ایجاد OAuth2 Credentials
1. به بخش "Credentials" بروید
2. "Create Credentials" > "OAuth 2.0 Client IDs" را انتخاب کنید
3. Application type را "Desktop application" انتخاب کنید
4. `Client ID` و `Client Secret` را کپی کنید

### مرحله 3: دریافت Refresh Token
یکی از روش‌های زیر را انتخاب کنید:

#### روش A: استفاده از OAuth2 Playground
1. به [OAuth2 Playground](https://developers.google.com/oauthplayground/) بروید
2. روی تنظیمات (⚙️) کلیک کنید
3. "Use your own OAuth credentials" را فعال کنید
4. Client ID و Client Secret خود را وارد کنید
5. در قسمت "Select & authorize APIs":
   - `https://www.googleapis.com/auth/gmail.send` را انتخاب کنید
6. "Authorize APIs" را کلیک کنید
7. اکانت Gmail خود را انتخاب کنید
8. "Exchange authorization code for tokens" را کلیک کنید
9. `Refresh token` را کپی کنید

#### روش B: استفاده از کد Node.js
```javascript
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
  'YOUR_CLIENT_ID',
  'YOUR_CLIENT_SECRET',
  'urn:ietf:wg:oauth:2.0:oob'
);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/gmail.send'],
});

console.log('Authorize this app by visiting this url:', authUrl);
// کد authorization را وارد کنید و refresh token را دریافت کنید
```

### مرحله 4: تنظیم متغیرهای محیطی
فایل `.env` روی سرور را ویرایش کنید:

```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID=your_actual_client_id
GOOGLE_CLIENT_SECRET=your_actual_client_secret
GOOGLE_REFRESH_TOKEN=your_actual_refresh_token
EMAIL_USER=ahmadrezaavandi@gmail.com
```

### مرحله 5: راه‌اندازی مجدد سرویس
```bash
# روی سرور
cd /path/to/your/project
docker-compose down
docker-compose up -d
```

## تست عملکرد

### 1. تست Gmail API
```bash
curl -X GET https://crm.robintejarat.com/api/Gmail
```

پاسخ موفق:
```json
{
  "ok": true,
  "email": "ahmadrezaavandi@gmail.com",
  "profile": {...}
}
```

### 2. تست ارسال ایمیل
از طریق رابط کاربری:
1. به بخش Documents بروید
2. یک سند را انتخاب کنید
3. گزینه "ارسال ایمیل" را انتخاب کنید
4. ایمیل تست وارد کنید

## عیب‌یابی

### خطای "No access token"
- بررسی کنید که `GOOGLE_REFRESH_TOKEN` صحیح باشد
- مطمئن شوید که Gmail API فعال است

### خطای "Invalid credentials"
- `GOOGLE_CLIENT_ID` و `GOOGLE_CLIENT_SECRET` را بررسی کنید
- مطمئن شوید که credentials برای "Desktop application" ایجاد شده‌اند

### خطای "Connection refused"
- بررسی کنید که Docker containers در حال اجرا هستند
- لاگ‌های Docker را بررسی کنید: `docker-compose logs nextjs`

## نکات امنیتی
- هرگز credentials را در کد commit نکنید
- از متغیرهای محیطی استفاده کنید
- دسترسی‌های OAuth2 را محدود کنید
- به‌طور منظم credentials را بازنگری کنید

## پشتیبانی
در صورت بروز مشکل، لاگ‌های زیر را بررسی کنید:
```bash
docker-compose logs nextjs | grep -i gmail
docker-compose logs nextjs | grep -i email
```