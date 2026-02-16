#!/bin/bash

# Security Check Script
# Run this before making your repo public

echo "🔒 Security Check for API Keys"
echo "================================"
echo ""

# Check if .env exists
echo "1. Checking .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file exists"
else
    echo "   ❌ .env file not found!"
    echo "   Create it from .env.example"
fi
echo ""

# Check if .env is in .gitignore
echo "2. Checking .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo "   ✅ .env is in .gitignore"
else
    echo "   ❌ .env not in .gitignore!"
    echo "   Add it to .gitignore"
fi
echo ""

# Check if .env is tracked by git
echo "3. Checking if .env is tracked by git..."
if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    echo "   ❌ .env is tracked by git!"
    echo "   Run: git rm --cached .env"
else
    echo "   ✅ .env is not tracked by git"
fi
echo ""

# Search for hardcoded API keys
echo "4. Searching for hardcoded API keys..."
echo ""

echo "   Checking for Firebase keys..."
if grep -r "AIzaSyAX9tEdO28EjKEGIFWBpki8spx7rESqdoU" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" . > /dev/null 2>&1; then
    echo "   ❌ Found hardcoded Firebase key!"
    grep -r "AIzaSyAX9tEdO28EjKEGIFWBpki8spx7rESqdoU" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" .
else
    echo "   ✅ No hardcoded Firebase keys"
fi
echo ""

echo "   Checking for YouTube keys..."
if grep -r "AIzaSyBJdyNY4Rp7_JwwiEIqxgxINXMz_qSlyN4" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" . > /dev/null 2>&1; then
    echo "   ❌ Found hardcoded YouTube key!"
    grep -r "AIzaSyBJdyNY4Rp7_JwwiEIqxgxINXMz_qSlyN4" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" .
else
    echo "   ✅ No hardcoded YouTube keys"
fi
echo ""

echo "   Checking for Pexels keys..."
if grep -r "qciPEOH1PjYSlM9zWeSbiT9adR9oOGAh8FI7DMy3R8SEAifggkeego9G" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" . > /dev/null 2>&1; then
    echo "   ❌ Found hardcoded Pexels key!"
    grep -r "qciPEOH1PjYSlM9zWeSbiT9adR9oOGAh8FI7DMy3R8SEAifggkeego9G" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" .
else
    echo "   ✅ No hardcoded Pexels keys"
fi
echo ""

echo "   Checking for Stripe secret keys..."
if grep -r "sk_test_" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" . | grep -v "STRIPE_SECRET_KEY" > /dev/null 2>&1; then
    echo "   ❌ Found hardcoded Stripe secret key!"
    grep -r "sk_test_" --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude=".env" . | grep -v "STRIPE_SECRET_KEY"
else
    echo "   ✅ No hardcoded Stripe secret keys"
fi
echo ""

# Check if environment variables are used
echo "5. Checking if code uses environment variables..."
if grep -r "process\.env\.EXPO_PUBLIC" --exclude-dir=node_modules --exclude-dir=.git src/ config/ utils/ > /dev/null 2>&1; then
    echo "   ✅ Code uses environment variables"
else
    echo "   ❌ Code doesn't use environment variables!"
fi
echo ""

# Summary
echo "================================"
echo "📋 Summary"
echo "================================"
echo ""
echo "Before making repo public:"
echo "1. ✅ Verify all checks pass"
echo "2. ⚠️  Remove .env from git: git rm --cached .env"
echo "3. ⚠️  Clean git history (see SECURITY_GUIDE.md)"
echo "4. ⚠️  Rotate ALL API keys"
echo "5. ✅ Update .env with new keys"
echo "6. ✅ Test app with new keys"
echo "7. ✅ Push changes"
echo ""
echo "See API_KEYS_SECURED.md for complete checklist"
echo ""
