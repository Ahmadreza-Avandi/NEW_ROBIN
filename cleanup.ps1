# Clean up extra files and folders for a lean Next.js deploy repo
# Usage (PowerShell as Admin or normal):
#   powershell -ExecutionPolicy Bypass -File e:\new-rabin-server\cleanup.ps1

$ErrorActionPreference = 'SilentlyContinue'

$root = "e:\new-rabin-server"

$itemsToRemove = @(
  # Directories
  ".next",
  "logs",
  "backup",
  "backups",
  "uploads",
  "env",
  "docs",
  "security",
  "supabase",
  "scripts",
  "public\uploads",

  # Generated or not needed compose file
  "docker-compose.deploy.yml",
  "docker-compose.yml.backup",

  # Helper/quick scripts and fix scripts
  "quick-deploy.sh",
  "quick-fix.sh",
  "push-changes.sh",
  "push-to-server.sh",
  "restart-services.sh",
  "restart-without-nginx.sh",
  "start-all.sh",
  "fix-and-deploy.sh",
  "fix-and-restart.sh",
  "fix-database.sh",
  "final-setup.sh",
  "check-system.sh",
  "troubleshoot.sh",

  # Extra servers/tests
  "express-email-server.js",
  "email-service-simple.cjs",
  "get-new-refresh-token.js",
  "test-audio-module.js",
  "test-document-email-attachment.js",
  "test-document-email-complete.js",
  "test-document-email-with-file.js",
  "test-document-email.js",
  "test-email-attachment.js",
  "test-email-attachment.mjs",
  "test-email-send.js",
  "test-email-system.js",
  "test-env.js",
  "test-express-email-integration.js",
  "test-oauth-debug.js",
  "test-oauth-simple.js",
  "test-oauth-v2.js",
  "test-voice-command-analysis.js",
  "test-voice-document-email.mjs",
  "test-vps-audio.sh",
  "test-file.txt",

  # Standalone docs and guides not needed for deploy
  "auth.json",
  "pages-breakdown.md",
  "project-pages-analysis.md",
  "AI_ANALYTICS_RECOMMENDATIONS.md",
  "AUDIO_ANALYSIS_MODULE_GUIDE.md",
  "AUDIO_MODULE_ISSUES_AND_FIXES.md",
  "BACKUP_SYSTEM_GUIDE.md",
  "DEPLOYMENT_GUIDE.md",
  "EMAIL_ATTACHMENT_GUIDE.md",
  "EMAIL_ATTACHMENT_SETUP_GUIDE.md",
  "EMAIL_INTEGRATION_SUMMARY.md",
  "EMAIL_SETUP_GUIDE.md",
  "EMAIL_TEMPLATE_GUIDE.md",
  "ENV-MANAGEMENT-GUIDE.md",
  "ENV-SETUP-GUIDE.md",
  "EXPRESS_EMAIL_SETUP.md",
  "FINAL_EMAIL_SYSTEM_STATUS.md",
  "FIX_MODULES_GUIDE.md",
  "QUICK_EMAIL_SETUP.md",
  "SPEECH_TO_TEXT_SETUP.md",
  "SMS_SETUP_GUIDE.md",
  "راهنمای_سیستم_صوتی.md",

  # Sample/legacy SQL and helpers in root (keep database/ directory)
  "secrets.example.sh",
  "add-password-type-column.sql",
  "add-sample-products.sh",
  "add_missing_modules.sql",
  "create-permissions-tables.sql",
  "crm_system (2).sql",
  "crm_system.sql",
  "fix-passwords.sql",
  "fix-permissions.sql",
  "fix-sales-table.sql",
  "reset-permissions.sql",
  "update-modules.sql",

  # Other extras
  ".env.example",
  "public\test-pcm-browser.html"
)

$removed = @()
$skipped = @()

foreach ($rel in $itemsToRemove) {
  $target = Join-Path $root $rel
  if (Test-Path $target) {
    try {
      if (Test-Path $target -PathType Container) {
        Remove-Item -LiteralPath $target -Recurse -Force -ErrorAction Stop
      } else {
        Remove-Item -LiteralPath $target -Force -ErrorAction Stop
      }
      $removed += $rel
    } catch {
      Write-Warning "Failed to remove: $rel - $($_.Exception.Message)"
      $skipped += $rel
    }
  }
}

Write-Host "Cleanup complete." -ForegroundColor Green
Write-Host "Removed items:"
$removed | ForEach-Object { Write-Host " - $_" }

if ($skipped.Count -gt 0) {
  Write-Host "Skipped (errors):" -ForegroundColor Yellow
  $skipped | ForEach-Object { Write-Host " - $_" }
}

# Ensure .env files are kept; nothing to do as per instruction.