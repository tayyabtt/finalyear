# 💍 ShaadiSet - Wedding Planning App

A comprehensive React Native wedding planning application built with Expo, featuring vendor management, booking system, e-invites, and more.

## 🚀 Quick Start

### For Developers

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd finalyear
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```
Then add your API keys to `.env` (get from team lead)

4. **Start development server**
```bash
npm start
```

See [SETUP_FOR_DEVELOPERS.md](SETUP_FOR_DEVELOPERS.md) for detailed setup instructions.

## 🔐 Security

All API keys are secured using environment variables. See:
- [API_KEYS_SECURED.md](API_KEYS_SECURED.md) - Security summary
- [SECURITY_GUIDE.md](SECURITY_GUIDE.md) - Complete security guide
- [README_API_SECURITY.md](README_API_SECURITY.md) - Quick reference

### Run Security Check
```bash
# Windows PowerShell
.\scripts\check-security.ps1

# Mac/Linux
chmod +x scripts/check-security.sh
./scripts/check-security.sh
```

## ✨ Features

### For Users
- 🏠 Browse vendors by category (venues, photographers, caterers, etc.)
- 📅 Book vendors and manage bookings
- 💌 Create and share digital e-invites
- 📱 Real-time chat with vendors
- ⭐ Rate and review vendors
- 💡 Wedding planning tools and inspiration
- 🎥 Browse wedding videos and galleries
- 📍 Filter vendors by city

### For Vendors
- 📊 Vendor dashboard
- 📦 Package management
- 💰 Booking and payment management
- 📨 Inbox for customer inquiries
- 📈 Analytics and insights
- ⭐ Review management

### Admin Features
- 👥 User and vendor management
- 💳 Payment and transaction management
- 📊 Analytics and reporting
- 🎫 Promotion management

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Payments**: Stripe
- **APIs**: YouTube Data API, Pexels API
- **Ads**: Huawei Ads SDK
- **State Management**: React Context
- **UI**: React Native components with custom styling

## 📱 Supported Platforms

- ✅ Android
- ✅ iOS
- ✅ Web (limited)

## 🏗️ Project Structure

```
finalyear/
├── app/                    # App screens (Expo Router)
│   ├── (tabs)/            # User screens
│   ├── (vendor)/          # Vendor screens
│   ├── home.tsx           # Home screen
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── config/               # Configuration files
├── contexts/             # React contexts (Auth, Payment)
├── utils/                # Utility functions
├── assets/               # Images, fonts
├── functions/            # Firebase Cloud Functions
├── scripts/              # Utility scripts
├── .env                  # Environment variables (not in git)
├── .env.example          # Environment template
└── package.json          # Dependencies
```

## 📚 Documentation

- [SETUP_FOR_DEVELOPERS.md](SETUP_FOR_DEVELOPERS.md) - Developer setup guide
- [SECURITY_GUIDE.md](SECURITY_GUIDE.md) - Security best practices
- [API_KEYS_SECURED.md](API_KEYS_SECURED.md) - API security summary
- [HUAWEI_ADS_SETUP.md](HUAWEI_ADS_SETUP.md) - Huawei Ads integration
- [BOOKING_SYSTEM_COMPLETE.md](BOOKING_SYSTEM_COMPLETE.md) - Booking system docs
- [PAYMENT_SETUP_GUIDE.md](PAYMENT_SETUP_GUIDE.md) - Payment integration

## 🔑 Environment Variables

Required environment variables (see `.env.example`):

```env
# Firebase
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# APIs
EXPO_PUBLIC_YOUTUBE_API_KEY=
EXPO_PUBLIC_PEXELS_API_KEY=

# Huawei Ads (optional)
EXPO_PUBLIC_HUAWEI_BANNER_AD_ID=
EXPO_PUBLIC_HUAWEI_INTERSTITIAL_AD_ID=
EXPO_PUBLIC_HUAWEI_REWARDED_AD_ID=
EXPO_PUBLIC_HUAWEI_NATIVE_AD_ID=
```

## 🚀 Building

### Development Build
```bash
eas build --platform android --profile preview
```

### Production Build
```bash
eas build --platform android --profile production
```

### Build APK for Huawei AppGallery
```bash
eas build --platform android --profile huawei
```

See [BUILD_APK_GUIDE.md](BUILD_APK_GUIDE.md) for detailed build instructions.

## 🧪 Testing

```bash
# Run tests
npm test

# Lint code
npm run lint
```

## 📦 Deployment

### Firebase Functions
```bash
cd functions
npm install
firebase deploy --only functions
```

### Expo Updates
```bash
eas update --branch production
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- **Developer**: Tayyab Tahir
- **Project**: Final Year Project
- **University**: [Your University]

## 🆘 Support

- **Issues**: Open an issue on GitHub
- **Email**: [your-email@example.com]
- **Documentation**: Check the docs folder

## 🙏 Acknowledgments

- Expo team for the amazing framework
- Firebase for backend services
- Stripe for payment processing
- Pexels and YouTube for media APIs
- Huawei for ads monetization

---

**Made with ❤️ for wedding planning**

## 📊 Stats

- 50+ screens
- 30+ components
- Firebase integration
- Stripe payments
- Real-time chat
- Video streaming
- Image galleries
- Booking system
- Review system
- Admin panel

---

**Version**: 1.0.0  
**Last Updated**: 2024
