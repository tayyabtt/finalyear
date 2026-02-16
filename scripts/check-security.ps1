# Security Check Script for Windows PowerShell
# Run this before making your repo public

Write-Host "🔒 Security Check for API Keys" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
Write-Host "1. Checking .env file..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ .env file not found!" -ForegroundColor Red
    Write-Host "   Create it from .env.example" -ForegroundColor Red
}
Write-Host ""

# Check if .env is in .gitignore
Write-Host "2. Checking .gitignore..." -ForegroundColor Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "^\.env$") {
    Write-Host "   ✅ .env is in .gitignore" -ForegroundColor Green
} else {
    Write-Host "   ❌ .env not in .gitignore!" -ForegroundColor Red
    Write-Host "   Add it to .gitignore" -ForegroundColor Red
}
Write-Host ""

# Check if .env is tracked by git
Write-Host "3. Checking if .env is tracked by git..." -ForegroundColor Yellow
$gitStatus = git ls-files .env 2>&1
if ($gitStatus -match ".env") {
    Write-Host "   ❌ .env is tracked by git!" -ForegroundColor Red
    Write-Host "   Run: git rm --cached .env" -ForegroundColor Red
} else {
    Write-Host "   ✅ .env is not tracked by git" -ForegroundColor Green
}
Write-Host ""

# Search for hardcoded API keys
Write-Host "4. Searching for hardcoded API keys..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   Checking for Firebase keys..." -ForegroundColor Yellow
$firebaseKey = "AIzaSyAX9tEdO28EjKEGIFWBpki8spx7rESqdoU"
$found = Select-String -Path "src\*.ts","config\*.ts","utils\*.ts" -Pattern $firebaseKey -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "   ❌ Found hardcoded Firebase key!" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No hardcoded Firebase keys" -ForegroundColor Green
}
Write-Host ""

Write-Host "   Checking for YouTube keys..." -ForegroundColor Yellow
$youtubeKey = "AIzaSyBJdyNY4Rp7_JwwiEIqxgxINXMz_qSlyN4"
$found = Select-String -Path "utils\*.ts" -Pattern $youtubeKey -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "   ❌ Found hardcoded YouTube key!" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No hardcoded YouTube keys" -ForegroundColor Green
}
Write-Host ""

Write-Host "   Checking for Pexels keys..." -ForegroundColor Yellow
$pexelsKey = "qciPEOH1PjYSlM9zWeSbiT9adR9oOGAh8FI7DMy3R8SEAifggkeego9G"
$found = Select-String -Path "utils\*.ts" -Pattern $pexelsKey -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "   ❌ Found hardcoded Pexels key!" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No hardcoded Pexels keys" -ForegroundColor Green
}
Write-Host ""

Write-Host "   Checking for Stripe secret keys..." -ForegroundColor Yellow
$found = Select-String -Path "utils\*.ts","config\*.ts" -Pattern "sk_test_" -ErrorAction SilentlyContinue | Where-Object { $_.Line -notmatch "STRIPE_SECRET_KEY" }
if ($found) {
    Write-Host "   ❌ Found hardcoded Stripe secret key!" -ForegroundColor Red
    $found | ForEach-Object { Write-Host "      $_" -ForegroundColor Red }
} else {
    Write-Host "   ✅ No hardcoded Stripe secret keys" -ForegroundColor Green
}
Write-Host ""

# Check if environment variables are used
Write-Host "5. Checking if code uses environment variables..." -ForegroundColor Yellow
$found = Select-String -Path "src\*.ts","config\*.ts","utils\*.ts" -Pattern "process\.env\.EXPO_PUBLIC" -ErrorAction SilentlyContinue
if ($found) {
    Write-Host "   ✅ Code uses environment variables" -ForegroundColor Green
} else {
    Write-Host "   ❌ Code doesn't use environment variables!" -ForegroundColor Red
}
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "📋 Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before making repo public:" -ForegroundColor Yellow
Write-Host "1. ✅ Verify all checks pass" -ForegroundColor White
Write-Host "2. ⚠️  Remove .env from git: git rm --cached .env" -ForegroundColor Yellow
Write-Host "3. ⚠️  Clean git history (see SECURITY_GUIDE.md)" -ForegroundColor Yellow
Write-Host "4. ⚠️  Rotate ALL API keys" -ForegroundColor Yellow
Write-Host "5. ✅ Update .env with new keys" -ForegroundColor White
Write-Host "6. ✅ Test app with new keys" -ForegroundColor White
Write-Host "7. ✅ Push changes" -ForegroundColor White
Write-Host ""
Write-Host "See API_KEYS_SECURED.md for complete checklist" -ForegroundColor Cyan
Write-Host ""
