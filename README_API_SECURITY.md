# 🔐 API Security - Quick Reference

## ✅ What's Secured

All sensitive API keys have been moved to environment variables:

| Service | Status | Location |
|---------|--------|----------|
| Firebase | ✅ Secured | `.env` |
| Stripe | ✅ Secured | `.env` |
| YouTube | ✅ Secured | `.env` |
| Pexels | ✅ Secured | `.env` |
| Huawei Ads | ✅ Secured | `.env` |

## 🚀 Quick Start

### For New Developers

1. **Copy environment template:**
```bash
cp .env.example .env
```

2. **Get API keys from team lead**

3. **Add keys to `.env` file**

4. **Start development:**
```bash
npm install
npm start
```

### For Team Lead

1. **Share API keys securely** (use password manager, not email/Slack)

2. **Rotate keys if exposed**

3. **Monitor API usage** in respective dashboards

## 📁 Files Changed

### Updated to use environment variables:
- ✅ `src/firebaseConfig.ts`
- ✅ `config/stripe.ts`
- ✅ `utils/trendingApi.ts`
- ✅ `utils/stripeApi.ts`

### New files:
- ✅ `.env` (contains actual keys - NOT in git)
- ✅ `.env.example` (template - safe to commit)
- ✅ `SECURITY_GUIDE.md` (detailed security guide)

### Updated:
- ✅ `.gitignore` (ignores `.env` and sensitive files)

## ⚠️ Before Making Repo Public

**CRITICAL STEPS:**

1. ✅ Verify `.env` is in `.gitignore`
2. ✅ Remove `.env` from git tracking
3. ✅ Clean git history (remove old API keys)
4. ✅ Rotate ALL API keys
5. ✅ Update `.env` with new keys
6. ✅ Test app with new keys
7. ✅ Enable API restrictions
8. ✅ Set up billing alerts

**See `SECURITY_GUIDE.md` for detailed instructions.**

## 🔑 Environment Variables

### Required Variables

```env
# Firebase (7 variables)
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Stripe (1 variable - publishable key only)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# YouTube (1 variable)
EXPO_PUBLIC_YOUTUBE_API_KEY=

# Pexels (1 variable)
EXPO_PUBLIC_PEXELS_API_KEY=

# Huawei Ads (4 variables - optional)
EXPO_PUBLIC_HUAWEI_BANNER_AD_ID=
EXPO_PUBLIC_HUAWEI_INTERSTITIAL_AD_ID=
EXPO_PUBLIC_HUAWEI_REWARDED_AD_ID=
EXPO_PUBLIC_HUAWEI_NATIVE_AD_ID=
```

## 🚨 Emergency: Keys Exposed

If API keys are accidentally exposed:

1. **Immediately rotate keys:**
   - Firebase: Delete and recreate web app
   - YouTube: Delete and create new API key
   - Pexels: Regenerate API key
   - Stripe: Roll keys in dashboard

2. **Check for unauthorized usage:**
   - Firebase Console > Usage
   - Google Cloud Console > Billing
   - Stripe Dashboard > Payments

3. **Enable billing alerts**

4. **Update `.env` with new keys**

5. **Notify team**

## 📊 Monitoring

### Firebase
- Console: https://console.firebase.google.com/
- Check: Authentication, Firestore, Storage usage

### YouTube API
- Console: https://console.cloud.google.com/
- Check: API quotas and usage

### Stripe
- Dashboard: https://dashboard.stripe.com/
- Check: Payments, disputes, balance

### Pexels
- Dashboard: https://www.pexels.com/api/
- Check: API usage and limits

## 🔒 Best Practices

### DO:
- ✅ Use environment variables for ALL secrets
- ✅ Keep `.env` file local only
- ✅ Rotate keys regularly
- ✅ Enable API restrictions
- ✅ Monitor usage and billing
- ✅ Use test keys for development
- ✅ Move Stripe secret key to backend

### DON'T:
- ❌ Commit `.env` to git
- ❌ Share keys via email/Slack
- ❌ Use production keys in development
- ❌ Hardcode API keys in code
- ❌ Push sensitive data to public repos
- ❌ Use same keys across projects

## 📚 Documentation

- **Full Security Guide**: `SECURITY_GUIDE.md`
- **Developer Setup**: `SETUP_FOR_DEVELOPERS.md`
- **Huawei Ads Setup**: `HUAWEI_ADS_SETUP.md`

## 🆘 Support

### Issues?
1. Check `SECURITY_GUIDE.md`
2. Ask team lead
3. Check service documentation

### Questions?
- Team Slack: #finalyear-dev
- Email: team@example.com

---

**Remember**: Security is everyone's responsibility! 🔐
