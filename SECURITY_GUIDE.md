# 🔒 Security Guide - Protecting Your API Keys

Complete guide to securing your API keys before making your repository public.

## ✅ What's Been Done

### 1. Environment Variables Setup
All sensitive API keys have been moved to `.env` file:
- ✅ Firebase configuration
- ✅ Stripe publishable key
- ✅ YouTube API key
- ✅ Pexels API key
- ✅ Huawei Ads configuration

### 2. Updated Files
The following files now use environment variables:
- ✅ `src/firebaseConfig.ts` - Firebase config
- ✅ `config/stripe.ts` - Stripe publishable key
- ✅ `utils/trendingApi.ts` - YouTube & Pexels APIs
- ✅ `utils/stripeApi.ts` - Removed hardcoded secret key

### 3. Git Protection
- ✅ `.env` added to `.gitignore`
- ✅ `.env.example` created for team reference
- ✅ Sensitive config files ignored

## 🚀 Before Making Repo Public

### Step 1: Verify .env is Ignored
```bash
cd finalyear
git status
```

Make sure `.env` is NOT listed. If it is, run:
```bash
git rm --cached .env
git commit -m "Remove .env from tracking"
```

### Step 2: Remove Sensitive Data from Git History

⚠️ **IMPORTANT**: Your API keys are already in git history!

You need to remove them using one of these methods:

#### Option A: BFG Repo-Cleaner (Recommended)
```bash
# Install BFG
# Windows: Download from https://rtyley.github.io/bfg-repo-cleaner/
# Mac: brew install bfg
# Linux: Download jar file

# Backup your repo first!
cd ..
cp -r finalyear finalyear-backup

# Remove sensitive strings
cd finalyear
bfg --replace-text passwords.txt

# Force push (⚠️ WARNING: This rewrites history)
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

Create `passwords.txt` with your API keys:
```
AIzaSyAX9tEdO28EjKEGIFWBpki8spx7rESqdoU
AIzaSyBJdyNY4Rp7_JwwiEIqxgxINXMz_qSlyN4
qciPEOH1PjYSlM9zWeSbiT9adR9oOGAh8FI7DMy3R8SEAifggkeego9G
sk_test_51Skk9aKSwNjQka2uDiQXDb20oY43E0HqEw6LpUTXMUy4kqTM0DduCDmFK3pRvr6OQRtf1MEBw70ybOvgmlKf5rLT00eUVvDHFZ
pk_test_51Skk9aKSwNjQka2ue8vgtgLXvNOsWOG6Ih0HVphD4sR0EPnvKgZX9cBOkFPlD9mmJYMY3cDsrebVzIJ54oGpragn00jbeBWdkZ
```

#### Option B: git-filter-repo (Alternative)
```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove sensitive files from history
git filter-repo --path src/firebaseConfig.ts --invert-paths
git filter-repo --path utils/stripeApi.ts --invert-paths

# Force push
git push --force
```

#### Option C: Start Fresh (Easiest but loses history)
```bash
# Remove git history
rm -rf .git

# Initialize new repo
git init
git add .
git commit -m "Initial commit with secured API keys"

# Push to new repo
git remote add origin <your-new-repo-url>
git push -u origin main --force
```

### Step 3: Rotate All API Keys

⚠️ **CRITICAL**: Since your keys were exposed, you should rotate them:

#### Firebase
1. Go to Firebase Console
2. Project Settings > General
3. Delete current web app
4. Add new web app
5. Copy new config to `.env`

#### YouTube API
1. Go to Google Cloud Console
2. APIs & Services > Credentials
3. Delete old API key
4. Create new API key
5. Restrict to YouTube Data API v3
6. Update `.env`

#### Pexels API
1. Go to Pexels.com/api
2. Regenerate API key
3. Update `.env`

#### Stripe
1. Go to Stripe Dashboard
2. Developers > API Keys
3. Roll keys (create new ones)
4. Update `.env` and Firebase Functions config

### Step 4: Update .env with New Keys
```bash
# Edit .env with your new keys
nano .env
```

### Step 5: Verify Security
```bash
# Search for any remaining hardcoded keys
cd finalyear
grep -r "AIzaSy" --exclude-dir=node_modules --exclude-dir=.git
grep -r "sk_test" --exclude-dir=node_modules --exclude-dir=.git
grep -r "pk_test" --exclude-dir=node_modules --exclude-dir=.git
```

If any results appear, update those files to use environment variables.

## 📝 For Team Members

When someone clones your repo, they need to:

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Get API keys from team lead and update `.env`

3. Never commit `.env` file

## 🔐 Additional Security Measures

### 1. Stripe Secret Key
The Stripe secret key should NEVER be in client code. Move it to Firebase Functions:

```bash
cd functions
firebase functions:config:set stripe.secret="your_new_secret_key"
firebase deploy --only functions
```

### 2. Firebase Security Rules
Update your Firestore rules to prevent unauthorized access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Vendors can only modify their own data
    match /vendors/{vendorId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == vendorId;
    }
    
    // Bookings - users and vendors can read their own
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.vendorId == request.auth.uid);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         resource.data.vendorId == request.auth.uid);
    }
  }
}
```

### 3. API Key Restrictions

#### YouTube API
- Restrict to specific domains/apps
- Set quota limits
- Enable only YouTube Data API v3

#### Firebase
- Enable App Check
- Restrict API keys to your app's bundle ID
- Set up usage quotas

#### Stripe
- Use webhook signing secrets
- Enable 3D Secure
- Set up fraud detection

## 🚨 If Keys Are Already Exposed

If your repo was public with exposed keys:

1. **Immediately rotate ALL keys**
2. **Check for unauthorized usage**:
   - Firebase Console > Usage
   - Google Cloud Console > Billing
   - Stripe Dashboard > Payments
3. **Enable billing alerts**
4. **Monitor for suspicious activity**

## ✅ Final Checklist

Before making repo public:

- [ ] All API keys moved to `.env`
- [ ] `.env` added to `.gitignore`
- [ ] `.env` not in git status
- [ ] Git history cleaned (BFG or fresh start)
- [ ] All API keys rotated
- [ ] New keys added to `.env`
- [ ] `.env.example` created
- [ ] Team members notified
- [ ] Firebase rules updated
- [ ] Stripe moved to backend
- [ ] API restrictions enabled
- [ ] Billing alerts set up
- [ ] README updated with setup instructions

## 📚 Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [git-filter-repo](https://github.com/newren/git-filter-repo)

## 🆘 Need Help?

If you're unsure about any step:
1. **Don't make the repo public yet**
2. Backup your entire project
3. Test the changes locally first
4. Consider consulting a security expert

---

**Remember**: Once API keys are exposed publicly, they should be considered compromised and rotated immediately!
