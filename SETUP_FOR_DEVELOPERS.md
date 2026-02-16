# 🚀 Setup Guide for Developers

Quick guide to set up this project after cloning.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Git

## ⚡ Quick Setup (5 minutes)

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd finalyear
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.example .env
```

### 4. Get API Keys from Team Lead

Contact your team lead to get the following API keys and add them to `.env`:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=<ask team lead>
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=<ask team lead>
EXPO_PUBLIC_FIREBASE_PROJECT_ID=<ask team lead>
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=<ask team lead>
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<ask team lead>
EXPO_PUBLIC_FIREBASE_APP_ID=<ask team lead>
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=<ask team lead>

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=<ask team lead>

# YouTube API Key
EXPO_PUBLIC_YOUTUBE_API_KEY=<ask team lead>

# Pexels API Key
EXPO_PUBLIC_PEXELS_API_KEY=<ask team lead>
```

### 5. Start Development Server
```bash
npm start
```

Then:
- Press `a` for Android
- Press `i` for iOS
- Press `w` for web
- Scan QR code with Expo Go app

## 🔑 Getting Your Own API Keys (Optional)

If you want to use your own API keys for development:

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project or use existing
3. Add web app
4. Copy config values to `.env`

### YouTube API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `.env`

### Pexels API
1. Go to [Pexels API](https://www.pexels.com/api/)
2. Sign up for free account
3. Get API key
4. Add to `.env`

### Stripe (Test Mode)
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get test publishable key
3. Add to `.env`

## 📱 Running on Physical Device

### Android
```bash
npm run android
```

### iOS (Mac only)
```bash
npm run ios
```

### Using Expo Go
1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code with Expo Go

## 🏗️ Building APK

### For Testing
```bash
eas build --platform android --profile preview
```

### For Production
```bash
eas build --platform android --profile production
```

## 🔧 Common Issues

### "Environment variable not found"
- Make sure `.env` file exists
- Restart Metro bundler: `npm start --reset-cache`

### "Firebase not initialized"
- Check `.env` has correct Firebase config
- Verify all Firebase variables are set

### "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start --reset-cache
```

### Expo Go not connecting
- Make sure phone and computer are on same WiFi
- Try tunnel mode: `npm start --tunnel`

## 📂 Project Structure

```
finalyear/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # User screens
│   ├── (vendor)/          # Vendor screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── config/               # Configuration files
├── contexts/             # React contexts
├── utils/                # Utility functions
├── assets/               # Images, fonts
├── .env                  # Environment variables (DO NOT COMMIT)
├── .env.example          # Example env file (safe to commit)
└── package.json          # Dependencies
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## 📝 Development Workflow

1. Create feature branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make changes and commit:
```bash
git add .
git commit -m "Add: your feature description"
```

3. Push to remote:
```bash
git push origin feature/your-feature-name
```

4. Create Pull Request on GitHub

## ⚠️ Important Rules

### DO NOT:
- ❌ Commit `.env` file
- ❌ Commit API keys in code
- ❌ Push directly to main branch
- ❌ Commit `node_modules/`
- ❌ Commit build artifacts

### DO:
- ✅ Use `.env` for all secrets
- ✅ Create feature branches
- ✅ Write meaningful commit messages
- ✅ Test before pushing
- ✅ Update `.env.example` if adding new variables

## 🆘 Getting Help

### Team Communication
- Slack: #finalyear-dev
- Email: team@example.com

### Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [Project Wiki](link-to-wiki)

## 🎯 Next Steps

After setup:
1. Read `CONTRIBUTING.md` for contribution guidelines
2. Check `TODO.md` for available tasks
3. Join team standup meetings
4. Review code style guide

---

**Welcome to the team! 🎉**

If you have any questions, don't hesitate to ask!
