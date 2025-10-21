# PowerShell script to import missing tables

Write-Host "🔧 ایمپورت جداول مفقود..." -ForegroundColor Green

# Load environment variables from .env.local if it exists
if (Test-Path ".env.local") {
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Database connection details
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_PORT = if ($env:DB_PORT) { $env:DB_PORT } else { "3306" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "crm_system" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$DB_PASS = if ($env:DB_PASS) { $env:DB_PASS } else { "" }

Write-Host "📊 اتصال به دیتابیس: $DB_HOST`:$DB_PORT/$DB_NAME" -ForegroundColor Cyan

# Check if mysql command is available
try {
    $null = Get-Command mysql -ErrorAction Stop
    Write-Host "✅ MySQL client پیدا شد" -ForegroundColor Green
} catch {
    Write-Host "❌ MySQL client پیدا نشد. لطفا MySQL client را نصب کنید." -ForegroundColor Red
    exit 1
}

# Test database connection
$connectionTest = "SELECT 1;"
$mysqlArgs = @("-h$DB_HOST", "-P$DB_PORT", "-u$DB_USER")
if ($DB_PASS) {
    $mysqlArgs += "-p$DB_PASS"
}
$mysqlArgs += @("-e", $connectionTest, $DB_NAME)

try {
    $result = & mysql @mysqlArgs 2>$null
    Write-Host "✅ اتصال به دیتابیس موفق بود" -ForegroundColor Green
} catch {
    Write-Host "❌ خطا در اتصال به دیتابیس. لطفا تنظیمات اتصال را بررسی کنید." -ForegroundColor Red
    Write-Host "💡 اطمینان حاصل کنید که MySQL در حال اجرا است و اطلاعات اتصال صحیح است." -ForegroundColor Yellow
    exit 1
}

# Import missing tables
Write-Host "🔄 ایمپورت جداول مفقود..." -ForegroundColor Yellow

$importArgs = @("-h$DB_HOST", "-P$DB_PORT", "-u$DB_USER")
if ($DB_PASS) {
    $importArgs += "-p$DB_PASS"
}
$importArgs += $DB_NAME

try {
    Get-Content "missing-tables.sql" | & mysql @importArgs
    Write-Host "✅ جداول مفقود با موفقیت ایمپورت شدند" -ForegroundColor Green
} catch {
    Write-Host "❌ خطا در ایمپورت جداول" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Verify tables exist
Write-Host "🔍 بررسی وجود جداول..." -ForegroundColor Cyan

$requiredTables = @("modules", "user_permissions", "sales_pipeline_stages", "users", "customers", "sales", "activities", "feedback")

foreach ($table in $requiredTables) {
    $checkArgs = @("-h$DB_HOST", "-P$DB_PORT", "-u$DB_USER")
    if ($DB_PASS) {
        $checkArgs += "-p$DB_PASS"
    }
    $checkArgs += @("-e", "SHOW TABLES LIKE '$table';", $DB_NAME)
    
    try {
        $result = & mysql @checkArgs 2>$null
        if ($result -match $table) {
            Write-Host "✅ جدول $table موجود است" -ForegroundColor Green
        } else {
            Write-Host "❌ جدول $table موجود نیست" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ خطا در بررسی جدول $table" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 ایمپورت جداول تمام شد!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 جداول ایجاد شده:" -ForegroundColor Cyan
Write-Host "   - modules: ماژول‌های سیستم" -ForegroundColor White
Write-Host "   - user_permissions: مجوزهای کاربران" -ForegroundColor White
Write-Host "   - sales_pipeline_stages: مراحل فرآیند فروش" -ForegroundColor White
Write-Host "   - ستون‌های مفقود به جداول موجود اضافه شدند" -ForegroundColor White
Write-Host "   - ویوهای مورد نیاز ایجاد شدند" -ForegroundColor White
Write-Host "   - ایندکس‌ها برای بهبود عملکرد اضافه شدند" -ForegroundColor White
Write-Host ""
Write-Host "🚀 حالا می‌توانید سرور را مجدداً راه‌اندازی کنید:" -ForegroundColor Green
Write-Host "   npm run dev" -ForegroundColor Yellow