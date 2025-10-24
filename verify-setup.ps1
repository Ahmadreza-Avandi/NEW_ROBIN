# PowerShell script to verify setup-env.sh structure
Write-Host "🔍 Verifying setup-env.sh structure..." -ForegroundColor Cyan

# Check if file exists
if (!(Test-Path "setup-env.sh")) {
    Write-Host "❌ setup-env.sh not found!" -ForegroundColor Red
    exit 1
}

# Check for key components
$content = Get-Content "setup-env.sh" -Raw

$checks = @(
    @{ Name = "OpenRouter API Key Input"; Pattern = "read -p.*OpenRouter API Key" },
    @{ Name = "Model Selection Menu"; Pattern = "مدل‌های پیشنهادی" },
    @{ Name = "Environment Variables"; Pattern = "OPENROUTER_API_KEY=__OPENROUTER_API_KEY__" },
    @{ Name = "Variable Replacement"; Pattern = "sed.*OPENROUTER_API_KEY" },
    @{ Name = "Validation Array"; Pattern = "OPENROUTER_API_KEY.*OPENROUTER_MODEL" }
)

$passed = 0
$total = $checks.Count

foreach ($check in $checks) {
    if ($content -match $check.Pattern) {
        Write-Host "✅ $($check.Name)" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "❌ $($check.Name)" -ForegroundColor Red
    }
}

Write-Host "`n📊 Results: $passed/$total checks passed" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "🎉 setup-env.sh is properly configured!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Some issues found in setup-env.sh" -ForegroundColor Yellow
}