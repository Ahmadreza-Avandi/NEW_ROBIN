# Gmail API Service Documentation

## نمای کلی
این سرویس امکان ارسال ایمیل از طریق Gmail API با استفاده از OAuth2 را فراهم می‌کند. سرویس از دو روش nodemailer و Gmail API پشتیبانی می‌کند و در صورت خرابی یکی، به روش دیگر تغییر می‌کند.

## آدرس سرویس
```
http://localhost:3000/api/Gmail
```

## روش‌های پشتیبانی شده

### GET - بررسی وضعیت سرویس
بررسی اتصال و وضعیت احراز هویت Gmail

**درخواست:**
```bash
GET /api/Gmail
```

**پاسخ موفق:**
```json
{
  "ok": true,
  "email": "ahmadrezaavandi@gmail.com",
  "profile": {
    "emailAddress": "ahmadrezaavandi@gmail.com",
    "messagesTotal": 1234,
    "threadsTotal": 567
  }
}
```

**پاسخ خطا:**
```json
{
  "ok": false,
  "error": "No access token retrieved. Refresh token may be invalid."
}
```

### POST - ارسال ایمیل

#### 1. ارسال ایمیل با JSON (بدون فایل)

**درخواست:**
```bash
POST /api/Gmail
Content-Type: application/json

{
  "to": "ahmadreza.avandi@gmail.com",
  "subject": "تست ساده",
  "text": "این یک ایمیل تست از سرویس محلی است"
}
```

**فیلدهای JSON:**
- `to` (الزامی): آدرس ایمیل گیرنده
- `subject` (الزامی): موضوع ایمیل
- `text` (اختیاری): متن ساده ایمیل
- `html` (اختیاری): محتوای HTML ایمیل
- `attachments` (اختیاری): آرایه‌ای از فایل‌های ضمیمه با فرمت base64

**نمونه با HTML:**
```json
{
  "to": "ahmadreza.avandi@gmail.com",
  "subject": "ایمیل HTML",
  "html": "<h2>سلام</h2><p>این یک ایمیل <strong>HTML</strong> است.</p>"
}
```

**نمونه با فایل ضمیمه (base64):**
```json
{
  "to": "ahmadreza.avandi@gmail.com",
  "subject": "ایمیل با فایل",
  "text": "این ایمیل شامل فایل ضمیمه است",
  "attachments": [
    {
      "filename": "document.txt",
      "contentBase64": "VGhpcyBpcyBhIHRlc3QgZmlsZQ=="
    }
  ]
}
```

#### 2. ارسال ایمیل با فایل (multipart/form-data)

**درخواست:**
```bash
POST /api/Gmail
Content-Type: multipart/form-data

Form fields:
- to: ahmadreza.avandi@gmail.com
- subject: تست با فایل
- text: این ایمیل شامل فایل است
- files: [فایل‌های انتخابی]
```

**نمونه با curl:**
```bash
curl -X POST "http://localhost:3000/api/Gmail" \
  -F "to=ahmadreza.avandi@gmail.com" \
  -F "subject=تست با فایل ضمیمه" \
  -F "text=این ایمیل شامل فایل ضمیمه است." \
  -F "files=@document.pdf" \
  -F "files=@image.jpg"
```

## پاسخ‌های سرویس

### پاسخ موفق
```json
{
  "ok": true,
  "via": "nodemailer", // یا "gmail-api"
  "info": {
    "messageId": "<unique-message-id>",
    "response": "250 Message queued"
  }
}
```

یا در صورت استفاده از Gmail API:
```json
{
  "ok": true,
  "via": "gmail-api",
  "result": {
    "id": "1994404cae21f8c5",
    "threadId": "1994404cae21f8c5",
    "labelIds": ["UNREAD", "INBOX"]
  }
}
```

### پاسخ خطا
```json
{
  "ok": false,
  "error": "Missing required fields: to, subject and text or html"
}
```

یا در صورت خرابی هر دو روش:
```json
{
  "ok": false,
  "error": "Both nodemailer and Gmail API send failed",
  "nodemailerError": "Authentication failed",
  "gmailError": "Insufficient Permission"
}
```

## کدهای وضعیت HTTP

- `200`: ایمیل با موفقیت ارسال شد
- `400`: فیلدهای الزامی ارسال نشده
- `500`: خطای سرور یا مشکل در ارسال

## تنظیمات محیط (.env)

```env
# Gmail OAuth2 Configuration
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"  
GOOGLE_REFRESH_TOKEN="your-refresh-token"
EMAIL_USER="your-gmail@gmail.com"

# Optional: Traditional SMTP (fallback)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_SECURE="false"
EMAIL_PASS="your-app-password"
EMAIL_FROM_NAME="Your App Name"
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
```

## نمونه‌های کاربردی

### JavaScript/TypeScript
```javascript
// ارسال ایمیل ساده
const response = await fetch('http://localhost:3000/api/Gmail', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: 'user@example.com',
    subject: 'سلام',
    text: 'این یک پیام تست است'
  })
});

const result = await response.json();
console.log(result);
```

### Python
```python
import requests

# ارسال ایمیل با فایل
files = {'files': open('document.pdf', 'rb')}
data = {
    'to': 'user@example.com',
    'subject': 'ایمیل با فایل',
    'text': 'لطفاً فایل ضمیمه را بررسی کنید'
}

response = requests.post(
    'http://localhost:3000/api/Gmail',
    files=files,
    data=data
)

print(response.json())
```

### PHP
```php
<?php
$data = [
    'to' => 'user@example.com',
    'subject' => 'تست PHP',
    'html' => '<h1>سلام از PHP</h1>'
];

$options = [
    'http' => [
        'header' => "Content-type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents('http://localhost:3000/api/Gmail', false, $context);
echo $result;
?>
```

## ویژگی‌های سرویس

- ✅ پشتیبانی از متن فارسی و انگلیسی
- ✅ ارسال ایمیل HTML
- ✅ پشتیبانی از فایل‌های ضمیمه
- ✅ احراز هویت OAuth2 با Gmail
- ✅ Fallback به Gmail API در صورت خرابی nodemailer
- ✅ لاگ‌گذاری کامل برای دیباگ
- ✅ پشتیبانی از انواع فرمت‌های فایل

## نکات مهم

1. **امنیت**: این سرویس در حال حاضر بدون احراز هویت قابل دسترسی است
2. **محدودیت حجم**: فایل‌های ضمیمه تا 20MB پشتیبانی می‌شوند
3. **Rate Limiting**: Gmail API محدودیت‌های روزانه دارد
4. **Encoding**: تمام متن‌های فارسی به درستی پشتیبانی می‌شوند

## عیب‌یابی

### مشکلات رایج:

1. **خطای 401 Unauthorized**: 
   - بررسی کنید refresh token معتبر باشد
   - تاریخ انقضای token را چک کنید

2. **خطای Insufficient Permission**:
   - مجوزهای Gmail API را بررسی کنید
   - Scope های لازم را اضافه کنید

3. **خطای Authentication failed**:
   - تنظیمات OAuth2 را دوباره بررسی کنید
   - Client ID و Secret را تأیید کنید

### لاگ‌ها:
سرویس لاگ‌های کاملی در کنسول نمایش می‌دهد که شامل:
- وضعیت دریافت access token
- جزئیات ارسال ایمیل
- خطاهای احتمالی و fallback ها

---

**نسخه:** 1.0.0  
**آخرین بروزرسانی:** ۱۴۰۳/۶/۲۳  
**سازنده:** CRM System Development Team
