#!/usr/bin/env bash
# Clean up extra files and folders for a lean Next.js deploy repo
# Usage on Linux/macOS/WSL:
#   bash ./cleanup.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"

items=(
  ".next"
  "logs"
  "backup"
  "backups"
  "uploads"
  "env"
  "docs"
  "security"
  "supabase"
  "scripts"
  "public/uploads"
  "docker-compose.deploy.yml"
  "docker-compose.yml.backup"
  "quick-deploy.sh"
  "quick-fix.sh"
  "push-changes.sh"
  "push-to-server.sh"
  "restart-services.sh"
  "restart-without-nginx.sh"
  "start-all.sh"
  "fix-and-deploy.sh"
  "fix-and-restart.sh"
  "fix-database.sh"
  "final-setup.sh"
  "check-system.sh"
  "troubleshoot.sh"
  "express-email-server.js"
  "email-service-simple.cjs"
  "get-new-refresh-token.js"
  "test-audio-module.js"
  "test-document-email-attachment.js"
  "test-document-email-complete.js"
  "test-document-email-with-file.js"
  "test-document-email.js"
  "test-email-attachment.js"
  "test-email-attachment.mjs"
  "test-email-send.js"
  "test-email-system.js"
  "test-env.js"
  "test-express-email-integration.js"
  "test-oauth-debug.js"
  "test-oauth-simple.js"
  "test-oauth-v2.js"
  "test-voice-command-analysis.js"
  "test-voice-document-email.mjs"
  "test-vps-audio.sh"
  "test-file.txt"
  "auth.json"
  "pages-breakdown.md"
  "project-pages-analysis.md"
  "AI_ANALYTICS_RECOMMENDATIONS.md"
  "AUDIO_ANALYSIS_MODULE_GUIDE.md"
  "AUDIO_MODULE_ISSUES_AND_FIXES.md"
  "BACKUP_SYSTEM_GUIDE.md"
  "DEPLOYMENT_GUIDE.md"
  "EMAIL_ATTACHMENT_GUIDE.md"
  "EMAIL_ATTACHMENT_SETUP_GUIDE.md"
  "EMAIL_INTEGRATION_SUMMARY.md"
  "EMAIL_SETUP_GUIDE.md"
  "EMAIL_TEMPLATE_GUIDE.md"
  "ENV-MANAGEMENT-GUIDE.md"
  "ENV-SETUP-GUIDE.md"
  "EXPRESS_EMAIL_SETUP.md"
  "FINAL_EMAIL_SYSTEM_STATUS.md"
  "FIX_MODULES_GUIDE.md"
  "QUICK_EMAIL_SETUP.md"
  "SPEECH_TO_TEXT_SETUP.md"
  "SMS_SETUP_GUIDE.md"
  "راهنمای_سیستم_صوتی.md"
  "secrets.example.sh"
  "add-password-type-column.sql"
  "add-sample-products.sh"
  "add_missing_modules.sql"
  "create-permissions-tables.sql"
  "crm_system (2).sql"
  "crm_system.sql"
  "fix-passwords.sql"
  "fix-permissions.sql"
  "fix-sales-table.sql"
  "reset-permissions.sql"
  "update-modules.sql"
  ".env.example"
  "public/test-pcm-browser.html"
)

removed=()
skipped=()

for rel in "${items[@]}"; do
  target="$ROOT/$rel"
  if [[ -e "$target" ]]; then
    if rm -rf -- "$target" 2>/dev/null; then
      removed+=("$rel")
    else
      echo "WARN: failed to remove $rel" >&2
      skipped+=("$rel")
    fi
  fi
done

echo "Cleanup complete."
echo "Removed items:"
for r in "${removed[@]}"; do echo " - $r"; done
if (( ${#skipped[@]} > 0 )); then
  echo "Skipped (errors):"
  for s in "${skipped[@]}"; do echo " - $s"; done
fi
# .env, .env.local, .env.server are intentionally kept.