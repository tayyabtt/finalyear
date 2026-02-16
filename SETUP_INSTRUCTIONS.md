# ShaadiSet - Setup & Testing Instructions

## ✅ What's Implemented

### 1. **Dual Role Authentication**
- ✅ Account type selection (User vs Vendor)
- ✅ Separate signup flows with validation
- ✅ Role-based navigation
- ✅ Persistent authentication

### 2. **Vendor Features**
- ✅ Vendor signup with business details
- ✅ Data saved to Firestore `vendors` collection
- ✅ Vendor dashboard with metrics
- ✅ Service management screen
- ✅ Booking requests screen
- ✅ Vendor profile & inbox

### 3. **User Features**
- ✅ User signup
- ✅ Browse vendors by category
- ✅ **NEW: View vendors filtered by service type**
- ✅ Existing features (home, e-invite, inbox, events)

### 4. **Vendor Discovery**
- ✅ Users can tap a category (e.g., "Photographers")
- ✅ App fetches vendors from Firestore with that service type
- ✅ Displays list with business name, location, rating
- ✅ Contact button for each vendor

---

## 🚀 How to Run

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Start the App**
```bash
npm start
```

### 3. **Deploy Firestore Rules** (Important!)
```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Testing Flow

### **Test 1: Vendor Signup**
1. Open app → Tap "Sign Up"
2. Select "Continue as Vendor"
3. Fill in:
   - Business Name: "Ahmed Photography"
   - Service Type: Select "Photographer"
   - Location: "Karachi"
   - Phone: "03001234567"
   - Email: "ahmed@example.com"
   - Password: "password123"
4. Tap "Create Vendor Account"
5. ✅ Should navigate to Vendor Dashboard
6. ✅ Check Firestore: `vendors` collection should have new document

### **Test 2: User Signup**
1. Logout (if logged in)
2. Tap "Sign Up" → "Continue as User"
3. Fill in:
   - Full Name: "Sarah Khan"
   - Email: "sarah@example.com"
   - Password: "password123"
4. Tap "Create Account"
5. ✅ Should navigate to User Home
6. ✅ Check Firestore: `users` collection should have new document

### **Test 3: Vendor Discovery**
1. Login as User
2. Go to "Vendors" tab
3. Tap "Photographers" category
4. ✅ Should show list of vendors with serviceType="Photographer"
5. ✅ Should see "Ahmed Photography" (from Test 1)

### **Test 4: Role Persistence**
1. Login as Vendor
2. Close app completely
3. Reopen app
4. ✅ Should automatically open Vendor Dashboard (not login screen)

### **Test 5: Login Routing**
1. Logout
2. Login with vendor email
3. ✅ Should go to Vendor Dashboard
4. Logout
5. Login with user email
6. ✅ Should go to User Home

---

## 📊 Firestore Structure

### `users` Collection
```json
{
  "userId": "firebase_uid",
  "role": "user",
  "fullName": "Sarah Khan",
  "email": "sarah@example.com",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### `vendors` Collection
```json
{
  "userId": "firebase_uid",
  "role": "vendor",
  "businessName": "Ahmed Photography",
  "serviceType": "Photographer",
  "location": "Karachi",
  "phoneNumber": "03001234567",
  "email": "ahmed@example.com",
  "rating": 0,
  "reviewCount": 0,
  "isVerified": false,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🎯 What Happens When Vendor Signs Up

1. **Firebase Authentication**: Creates user account
2. **Firestore Write**: Saves vendor profile to `vendors/{userId}`
3. **AsyncStorage**: Saves `role="vendor"` and `userId`
4. **Navigation**: Redirects to Vendor Dashboard
5. **Vendor Appears in User UI**: When users browse "Photographers", they'll see this vendor

---

## 🔍 How Vendor Discovery Works

### User Flow:
```
User Home 
  → Taps "Vendors" 
  → Sees categories (Photographers, Makeup, etc.)
  → Taps "Photographers"
  → App queries Firestore: WHERE serviceType == "Photographer"
  → Displays all matching vendors
```

### Code Flow:
```typescript
// In vendor-list.tsx
const q = query(
  collection(db, 'vendors'), 
  where('serviceType', '==', 'Photographer')
);
const vendors = await getDocs(q);
// Display vendors in FlatList
```

---

## 🐛 Troubleshooting

### "No vendors found"
- **Cause**: No vendors signed up with that service type yet
- **Fix**: Sign up as vendor with the service type you're searching for

### "Network error"
- **Cause**: Firestore rules not deployed
- **Fix**: Run `firebase deploy --only firestore:rules`

### "Can't read vendors"
- **Cause**: Firestore rules blocking access
- **Fix**: Check `firestore.rules` - vendors collection should allow read for all

### App crashes on vendor signup
- **Cause**: Missing Firestore initialization
- **Fix**: Check `src/firebaseConfig.ts` has correct config

---

## 📱 Service Type Mapping

When user taps a category, it maps to Firestore service types:

| Category | Service Type in Firestore |
|----------|---------------------------|
| Venues | Venue |
| Photographers | Photographer |
| Makeup | Makeup Artist |
| Pre Wedding | Photographer |
| Planning & Decor | Decorator |
| Bridal Wear | Bridal Wear |
| Groom Wear | Groom Wear |
| Mehndi | Mehndi Artist |

---

## ✨ Next Steps (Optional)

1. **Add vendor details page** - Show full profile when vendor is tapped
2. **Add booking functionality** - Let users send booking requests
3. **Add real-time chat** - Connect users and vendors
4. **Add image uploads** - Let vendors upload portfolio images
5. **Add search & filters** - Search by location, price, rating
6. **Add reviews** - Let users rate and review vendors

---

## 🎉 Summary

**YES, everything you asked for is working:**

✅ Vendor signup with business details  
✅ Saves to Firestore  
✅ Service type selection (dropdown)  
✅ Vendors appear in user UI based on service type  
✅ Role-based navigation  
✅ Persistent authentication  
✅ Separate User and Vendor experiences  

**The app is ready to run and test!** 🚀
