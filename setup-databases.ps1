# اسکریپت نصب و راه‌اندازی دیتابیس‌های پروژه CRM (Windows)
# این اسکریپت دو دیتابیس crm_system و saas_master را ایجاد و import می‌کند

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 راه‌اندازی دیتابیس‌های پروژه CRM" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# بارگذاری متغیرهای محیطی از .env
if (Test-Path ".env") {
    Write-Host "✅ فایل .env یافت شد" -ForegroundColor Green
    
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Variable -Name $name -Value $value -Scope Script
        }
    }
} else {
    Write-Host "❌ فایل .env یافت نشد!" -ForegroundColor Red
    Write-Host "لطفاً ابتدا فایل .env را از .env.example کپی کنید" -ForegroundColor Yellow
    exit 1
}

# دریافت اطلاعات دیتابیس
$DB_HOST = if ($DATABASE_HOST) { $DATABASE_HOST } else { "localhost" }
$DB_USER = if ($DATABASE_USER) { $DATABASE_USER } else { "crm_app_user" }
$DB_PASS = if ($DATABASE_PASSWORD) { $DATABASE_PASSWORD } else { "Ahmad.1386" }
$CRM_DB = if ($DATABASE_NAME) { $DATABASE_NAME } else { "crm_system" }
$SAAS_DB = if ($SAAS_DATABASE_NAME) { $SAAS_DATABASE_NAME } else { "saas_master" }

Write-Host "`n📋 تنظیمات:" -ForegroundColor Blue
Write-Host "  Host: $DB_HOST"
Write-Host "  User: $DB_USER"
Write-Host "  CRM Database: $CRM_DB"
Write-Host "  SaaS Database: $SAAS_DB"

# درخواست رمز عبور root
Write-Host "`n🔐 لطفاً رمز عبور root MySQL را وارد کنید:" -ForegroundColor Yellow
$MYSQL_ROOT_PASS = Read-Host -AsSecureString
$MYSQL_ROOT_PASS_TEXT = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($MYSQL_ROOT_PASS)
)

# تست اتصال
Write-Host "`n🔌 تست اتصال به MySQL..." -ForegroundColor Cyan
try {
    $testQuery = "SELECT 1;"
    $null = & mysql -u root -p"$MYSQL_ROOT_PASS_TEXT" -e $testQuery 2>&1
    Write-Host "✅ اتصال موفقیت‌آمیز" -ForegroundColor Green
} catch {
    Write-Host "❌ خطا: نمی‌توان به MySQL متصل شد" -ForegroundColor Red
    exit 1
}

# ایجاد دیتابیس‌ها
Write-Host "`n📊 ایجاد دیتابیس‌ها..." -ForegroundColor Cyan

$createDbScript = @"
-- ایجاد دیتابیس CRM
CREATE DATABASE IF NOT EXISTS ``$CRM_DB`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد دیتابیس SaaS
CREATE DATABASE IF NOT EXISTS ``$SAAS_DB`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ایجاد کاربر (اگر وجود نداشته باشد)
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASS';

-- دادن دسترسی‌ها
GRANT ALL PRIVILEGES ON ``$CRM_DB``.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON ``$SAAS_DB``.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON ``$CRM_DB``.* TO '$DB_USER'@'%';
GRANT ALL PRIVILEGES ON ``$SAAS_DB``.* TO '$DB_USER'@'%';

FLUSH PRIVILEGES;
"@

$createDbScript | & mysql -u root -p"$MYSQL_ROOT_PASS_TEXT" 2>&1 | Out-Null
Write-Host "✅ دیتابیس‌ها ایجاد شدند" -ForegroundColor Green

# Import دیتابیس CRM
if (Test-Path "database/crm_system.sql") {
    Write-Host "`n📥 Import دیتابیس CRM..." -ForegroundColor Cyan
    Get-Content "database/crm_system.sql" | & mysql -u $DB_USER -p"$DB_PASS" $CRM_DB 2>&1 | Out-Null
    Write-Host "✅ دیتابیس CRM import شد" -ForegroundColor Green
} else {
    Write-Host "⚠️  فایل database/crm_system.sql یافت نشد" -ForegroundColor Yellow
}

# Import دیتابیس SaaS
if (Test-Path "database/saas_master.sql") {
    Write-Host "`n📥 Import دیتابیس SaaS..." -ForegroundColor Cyan
    Get-Content "database/saas_master.sql" | & mysql -u $DB_USER -p"$DB_PASS" $SAAS_DB 2>&1 | Out-Null
    Write-Host "✅ دیتابیس SaaS import شد" -ForegroundColor Green
} else {
    Write-Host "⚠️  فایل database/saas_master.sql یافت نشد" -ForegroundColor Yellow
}

# بررسی نهایی
Write-Host "`n🔍 بررسی نهایی..." -ForegroundColor Cyan

$crmTablesOutput = & mysql -u $DB_USER -p"$DB_PASS" -D $CRM_DB -e "SHOW TABLES;" 2>&1
$saasTablesOutput = & mysql -u $DB_USER -p"$DB_PASS" -D $SAAS_DB -e "SHOW TABLES;" 2>&1

$crmTableCount = ($crmTablesOutput | Measure-Object -Line).Lines - 1
$saasTableCount = ($saasTablesOutput | Measure-Object -Line).Lines - 1

Write-Host "✅ دیتابیس CRM: $crmTableCount جدول" -ForegroundColor Green
Write-Host "✅ دیتابیس SaaS: $saasTableCount جدول" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ نصب با موفقیت انجام شد!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`n📝 مراحل بعدی:" -ForegroundColor Blue
Write-Host "  1. نصب dependencies: " -NoNewline
Write-Host "npm install" -ForegroundColor Cyan
Write-Host "  2. تست تنظیمات: " -NoNewline
Write-Host "node test-env.js" -ForegroundColor Cyan
Write-Host "  3. اجرای پروژه: " -NoNewline
Write-Host "npm run dev" -ForegroundColor Cyan
Write-Host ""
