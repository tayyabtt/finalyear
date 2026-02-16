# ⚡ Quick Start Guide

Get up and running in 5 minutes!

## 🎯 For New Developers

### 1. Clone & Install (2 min)
```bash
git clone <repo-url>
cd finalyear
npm install
```

### 2. Setup Environment (2 min)
```bash
# Copy template
cp .env.example .env

# Get API keys from team lead and add to .env
```

### 3. Start Development (1 min)
```bash
npm start
```

Then press:
- `a` for Android
- `i` for iOS  
- `w` for web

## 🔐 For Repo Owner (Before Making Public)

### Security Checklist
```bash
# 1. Run security check
.\scripts\check-security.ps1  # Windows
./scripts/check-security.sh   # Mac/Linux

# 2. Remove .env from git
git rm --cached .env
git commit -m "Remove .env from tracking"

# 3. Clean git history (choose one):

# Option A: Fresh start (easiest)
rm -rf .git
git init
git add .
git commit -m "Initial commit with secured keys"
git remote add origin <new-repo-url>
git push -u origin main --force

# Option B: Use BFG (advanced)
# See SECURITY_GUIDE.md for instructions

# 4. Rotate ALL API keys
# - Firebase: Delete & recreate web app
# - YouTube: Delete & create new key
# - Pexels: Regenerate key
# - Stripe: Roll keys

# 5. Update .env with new keys

# 6. Test everything
npm start --reset-cache

# 7. Push to public repo
git push
```

## 📚 Documentation Quick Links

| Need | See |
|------|-----|
| Setup instructions | [SETUP_FOR_DEVELOPERS.md](SETUP_FOR_DEVELOPERS.md) |
| Security guide | [SECURITY_GUIDE.md](SECURITY_GUIDE.md) |
| API security | [README_API_SECURITY.md](README_API_SECURITY.md) |
| Complete checklist | [API_KEYS_SECURED.md](API_KEYS_SECURED.md) |
| Huawei Ads | [HUAWEI_QUICK_START.md](HUAWEI_QUICK_START.md) |

## 🚨 Emergency: Keys Exposed

If you accidentally exposed keys:

1. **Immediately rotate all keys**
2. **Check for unauthorized usage**
3. **Enable billing alerts**
4. **Update .env**
5. **Notify team**

See [SECURITY_GUIDE.md](SECURITY_GUIDE.md) for details.

## 💡 Common Commands

```bash
# Start development
npm start

# Clear cache
npm start --reset-cache

# Build APK
eas build --platform android --profile production

# Run security check
.\scripts\check-security.ps1

# Install dependencies
npm install

# Lint code
npm run lint
```

## 🆘 Common Issues

### "Environment variable not found"
```bash
# Make sure .env exists
cp .env.example .env
# Add your keys to .env
# Restart: npm start --reset-cache
```

### ".env is tracked by git"
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### "Module not found"
```bash
rm -rf node_modules
npm install
npm start --reset-cache
```

## ✅ Ready to Go!

- ✅ Dependencies installed
- ✅ Environment configured
- ✅ Security verified
- ✅ App running

**Happy coding! 🎉**

---

**Need help?** Check the documentation or ask your team lead.
