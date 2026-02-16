# How to Build APK for ShaadiSet App

## Quick Start (EAS Build - Recommended)

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
If you don't have an account, create one at: https://expo.dev/signup

### 3. Configure EAS Build
```bash
eas build:configure
```
This creates `eas.json` file with build configurations.

### 4. Build APK
```bash
eas build -p android --profile preview
```

**What happens:**
- Your code is uploaded to Expo servers
- Built in the cloud (takes 10-20 minutes)
- You get a download link for the APK
- APK is ready to share!

### 5. Download APK
After build completes, you'll get a link like:
```
https://expo.dev/artifacts/eas/[build-id].apk
```

Download this APK and share it with anyone!

---

## Build Profiles Explained

### Preview Build (For Testing)
```bash
eas build -p android --profile preview
```
- Creates APK file
- Can be installed on any Android device
- Good for testing and sharing with testers
- File size: ~50-100 MB

### Production Build (For Play Store)
```bash
eas build -p android --profile production
```
- Creates AAB (Android App Bundle)
- Optimized for Google Play Store
- Requires signing keys
- Smaller download size for users

---

## Sharing Your APK

### Method 1: Direct Download Link
After build completes, share the Expo download link:
```
https://expo.dev/artifacts/eas/[your-build-id].apk
```

### Method 2: Upload to Cloud Storage
1. Download the APK from Expo
2. Upload to:
   - Google Drive
   - Dropbox
   - Firebase Hosting
   - Your own website
3. Share the link

### Method 3: QR Code
1. Go to https://expo.dev/accounts/[your-username]/projects/[project-name]/builds
2. Find your build
3. Share the QR code
4. Users scan and download

---

## Upload to Google Play Store

### 1. Create Google Play Console Account
- Go to: https://play.google.com/console
- Pay $25 one-time registration fee

### 2. Build Production AAB
```bash
eas build -p android --profile production
```

### 3. Upload to Play Store
1. Create new app in Play Console
2. Upload the AAB file
3. Fill in app details (description, screenshots, etc.)
4. Submit for review

**Review time:** 1-7 days

---

## Troubleshooting

### Build Failed?
Check the build logs:
```bash
eas build:list
```
Click on the failed build to see logs.

### APK Too Large?
Optimize your app:
1. Remove unused dependencies
2. Compress images
3. Use production build profile

### Can't Install APK?
Enable "Install from Unknown Sources" on Android device:
1. Settings → Security
2. Enable "Unknown Sources"
3. Try installing again

---

## Cost

### Free Tier
- 30 builds per month
- Unlimited preview builds
- Perfect for development

### Paid Plans
- $29/month - Unlimited builds
- Priority build queue
- More storage

---

## Alternative: Local Build

If you want to build locally (no cloud):

### 1. Install Android Studio
Download from: https://developer.android.com/studio

### 2. Set up Android SDK
Follow Expo docs: https://docs.expo.dev/build-reference/local-builds/

### 3. Build Locally
```bash
eas build -p android --profile preview --local
```

**Pros:** Unlimited builds, faster
**Cons:** Requires Android Studio setup

---

## Quick Commands Reference

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build APK (testing)
eas build -p android --profile preview

# Build AAB (Play Store)
eas build -p android --profile production

# Check build status
eas build:list

# View build details
eas build:view [build-id]
```

---

## Next Steps

1. Run `eas build:configure` to create eas.json
2. Run `eas build -p android --profile preview` to build APK
3. Wait 10-20 minutes
4. Download and share your APK!

For more info: https://docs.expo.dev/build/setup/
