# Design Document

## Overview

This design implements a dual-role authentication system for ShaadiSet that allows users to register and authenticate as either a "User" (wedding planner/couple) or "Vendor" (service provider). The system will intercept the existing authentication flow, present role selection, route to appropriate signup/login screens, and load role-specific navigation stacks.

The implementation leverages Firebase Authentication for user management, Firestore for vendor profile storage, AsyncStorage for persistent role state, and Expo Router for navigation.

## Architecture

### High-Level Flow

```
Welcome Screen
    ↓
[Sign Up / Log In Button Pressed]
    ↓
Account Type Selection Modal
    ├─→ "Continue as User" → User Signup/Login → User Navigator
    └─→ "Continue as Vendor" → Vendor Signup/Login → Vendor Navigator
```

### Authentication State Management

The app will use a combination of:
- **Firebase Auth**: Core authentication (email/password)
- **AsyncStorage**: Persistent role storage (`userRole`, `userId`)
- **Firestore**: Vendor profile data storage
- **React Context**: Global auth state management

### Navigation Architecture

```
App Root
  ├─ Auth Stack (not authenticated)
  │   ├─ Welcome Screen
  │   ├─ Account Type Selection
  │   ├─ User Signup/Login
  │   └─ Vendor Signup/Login
  │
  ├─ User Navigator (role: "user")
  │   ├─ Home Tab
  │   ├─ Vendors Tab
  │   ├─ E-Invite Tab
  │   ├─ Inbox Tab
  │   └─ Event Tab
  │
  └─ Vendor Navigator (role: "vendor")
      ├─ Dashboard Tab
      ├─ My Services Tab
      ├─ Requests Tab
      ├─ Inbox Tab
      └─ Profile Tab
```

## Components and Interfaces

### 1. Account Type Selection Component

**File**: `app/(tabs)/account-type-selection.tsx`

**Purpose**: Modal or screen that presents "User" vs "Vendor" choice

**Interface**:
```typescript
interface AccountTypeSelectionProps {
  onSelectUser: () => void;
  onSelectVendor: () => void;
  onClose?: () => void;
}
```

**UI Elements**:
- Header: "Choose Account Type"
- Two large, tappable cards:
  - "Continue as User" (with icon: person planning)
  - "Continue as Vendor" (with icon: briefcase/business)
- Back button to return to welcome screen
- Visual styling: Clean, modern, uses ShaadiSet brand colors

**Behavior**:
- Displays as a modal or full-screen overlay
- On "Continue as User": Navigate to User Signup
- On "Continue as Vendor": Navigate to Vendor Signup
- Stores selection temporarily (not persisted until signup completes)

### 2. Vendor Signup Screen

**File**: `app/(tabs)/vendor-signup.tsx`

**Purpose**: Collect vendor-specific information during registration

**Form Fields**:
```typescript
interface VendorSignupForm {
  businessName: string;      // required
  serviceType: ServiceType;  // required, dropdown
  location: string;          // required
  phoneNumber: string;       // required, numeric
  email: string;             // required, email format
  password: string;          // required, min 6 chars
}

type ServiceType = 
  | 'Photographer'
  | 'Decorator'
  | 'Caterer'
  | 'Venue'
  | 'Makeup Artist'
  | 'Planner'
  | 'Mehndi Artist'
  | 'Bridal Wear'
  | 'Groom Wear';
```

**Validation Rules**:
- Business Name: Non-empty, 2-100 characters
- Service Type: Must select from dropdown
- Location: Non-empty, 2-100 characters
- Phone Number: Numeric, 10-15 digits
- Email: Valid email format
- Password: Minimum 6 characters

**UI Layout**:
- ScrollView container (keyboard-aware)
- Text inputs with icons
- Dropdown/Picker for Service Type
- Primary action button: "Create Vendor Account"
- Link to login: "Already have an account? Log in"
- Error messages displayed inline below fields

**Behavior**:
1. Validate all fields on submit
2. Create Firebase user with email/password
3. Store vendor profile in Firestore
4. Save role="vendor" to AsyncStorage
5. Navigate to Vendor Navigator

### 3. User Signup Screen (Modified)

**File**: `app/(tabs)/signup.tsx` (existing, needs modification)

**Changes Required**:
- Remove the "I am a..." picker (role is already determined)
- Simplify to: Full Name, Email, Password, Confirm Password
- On successful signup, save role="user" to AsyncStorage
- Navigate to User Navigator instead of generic home

### 4. Login Screen (Modified)

**File**: `app/(tabs)/login.tsx` (existing, needs modification)

**Changes Required**:
- After successful Firebase login, fetch user role from Firestore or AsyncStorage
- Route to appropriate navigator based on role:
  - If role="user" → User Navigator
  - If role="vendor" → Vendor Navigator
- If role not found, show account type selection again

### 5. Auth Context Provider

**File**: `contexts/AuthContext.tsx` (new)

**Purpose**: Manage global authentication state

**Interface**:
```typescript
interface AuthContextType {
  user: FirebaseUser | null;
  role: 'user' | 'vendor' | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'user' | 'vendor', additionalData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}
```

**Responsibilities**:
- Listen to Firebase auth state changes
- Load role from AsyncStorage on app start
- Provide authentication methods to components
- Manage loading states during auth operations

### 6. User Navigator

**File**: `app/(user)/_layout.tsx` (new)

**Purpose**: Navigation stack for authenticated users

**Tabs**:
- Home: Existing home screen with vendor browsing
- Vendors: Vendor categories and listings
- E-Invite: Digital invitation creator
- Inbox: Messaging with vendors
- Event: Event planning and management

**Styling**: Uses existing ShaadiSet red theme (#e22f2f)

### 7. Vendor Navigator

**File**: `app/(vendor)/_layout.tsx` (new)

**Purpose**: Navigation stack for authenticated vendors

**Tabs**:
- Dashboard: Overview of bookings, earnings, analytics
- My Services: Manage service listings, pricing, availability
- Requests: View and respond to booking requests from users
- Inbox: Messaging with potential clients
- Profile: Vendor profile management, settings

**Styling**: Distinct from User UI (e.g., purple/blue accent color #7c26ff)

### 8. Vendor Dashboard Screen

**File**: `app/(vendor)/dashboard.tsx` (new)

**Purpose**: Main landing screen for vendors

**UI Elements**:
- Welcome header with business name
- Key metrics cards:
  - Pending Requests (count)
  - Total Bookings (count)
  - This Month's Earnings (amount)
  - Profile Views (count)
- Quick actions:
  - "Add New Service"
  - "View All Requests"
  - "Update Availability"
- Recent activity feed

### 9. My Services Screen

**File**: `app/(vendor)/my-services.tsx` (new)

**Purpose**: Manage vendor's service listings

**UI Elements**:
- List of services with:
  - Service name
  - Category
  - Price range
  - Status (active/inactive)
  - Edit/Delete actions
- Floating action button: "Add New Service"
- Empty state: "No services yet. Add your first service!"

### 10. Requests Screen

**File**: `app/(vendor)/requests.tsx` (new)

**Purpose**: View and manage booking requests

**UI Elements**:
- Tabs: Pending / Accepted / Declined
- Request cards showing:
  - User name
  - Event date
  - Service requested
  - Message preview
  - Actions: Accept / Decline / View Details
- Empty state per tab

## Data Models

### User Profile (Firestore)

**Collection**: `users`

```typescript
interface UserProfile {
  userId: string;           // Firebase UID
  role: 'user';
  fullName: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Optional fields
  phoneNumber?: string;
  avatar?: string;
  weddingDate?: Timestamp;
}
```

### Vendor Profile (Firestore)

**Collection**: `vendors`

```typescript
interface VendorProfile {
  userId: string;           // Firebase UID
  role: 'vendor';
  businessName: string;
  serviceType: ServiceType;
  location: string;
  phoneNumber: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  // Optional fields
  avatar?: string;
  description?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  portfolio?: string[];     // Image URLs
}
```

### AsyncStorage Keys

```typescript
const STORAGE_KEYS = {
  USER_ROLE: '@shaadiset:userRole',      // 'user' | 'vendor'
  USER_ID: '@shaadiset:userId',          // Firebase UID
  VENDOR_DATA: '@shaadiset:vendorData',  // Cached vendor profile
};
```

## Error Handling

### Validation Errors

Display inline error messages below form fields:
- Empty required field: "This field is required"
- Invalid email: "Please enter a valid email address"
- Weak password: "Password must be at least 6 characters"
- Password mismatch: "Passwords do not match"
- Invalid phone: "Please enter a valid phone number"

### Firebase Errors

Map Firebase error codes to user-friendly messages:
- `auth/email-already-in-use`: "This email is already registered"
- `auth/invalid-email`: "Invalid email format"
- `auth/weak-password`: "Password is too weak"
- `auth/user-not-found`: "No account found with this email"
- `auth/wrong-password`: "Incorrect password"
- `auth/network-request-failed`: "Network error. Please check your connection"

### Firestore Errors

Handle Firestore operations with try-catch:
- On write failure: Retry once, then show "Failed to save profile. Please try again"
- On read failure: Use cached data from AsyncStorage if available
- On network error: Show offline indicator, queue operations

## Testing Strategy

### Unit Tests

**Auth Service Tests** (`src/AuthService.test.ts`):
- Test signup with valid credentials
- Test signup with invalid email
- Test login with correct credentials
- Test login with wrong password
- Test logout functionality

**Validation Tests** (`utils/validation.test.ts`):
- Test email validation regex
- Test password strength validation
- Test phone number validation
- Test required field validation

### Integration Tests

**Signup Flow Tests**:
1. Navigate to account type selection
2. Select "Vendor"
3. Fill vendor signup form
4. Submit and verify Firestore write
5. Verify navigation to Vendor Navigator

**Login Flow Tests**:
1. Login with user credentials
2. Verify role fetched from Firestore
3. Verify navigation to User Navigator
4. Logout and verify AsyncStorage cleared

**Role Persistence Tests**:
1. Login as vendor
2. Close app (simulate)
3. Reopen app
4. Verify Vendor Navigator loads automatically

### E2E Tests

**User Journey**:
1. Open app → Welcome screen
2. Tap "Sign Up" → Account type selection
3. Select "User" → User signup form
4. Complete signup → User Navigator loads
5. Browse vendors, create event
6. Logout → Welcome screen

**Vendor Journey**:
1. Open app → Welcome screen
2. Tap "Sign Up" → Account type selection
3. Select "Vendor" → Vendor signup form
4. Complete signup → Vendor Navigator loads
5. Add service, view dashboard
6. Logout → Welcome screen

### Manual Testing Checklist

- [ ] Account type selection displays correctly
- [ ] User signup creates Firebase user and Firestore document
- [ ] Vendor signup creates Firebase user and Firestore document with all fields
- [ ] Login routes to correct navigator based on role
- [ ] Role persists after app restart
- [ ] Logout clears AsyncStorage and returns to welcome
- [ ] Validation errors display correctly
- [ ] Firebase errors show user-friendly messages
- [ ] Vendor dashboard displays mock data correctly
- [ ] User and Vendor UIs are visually distinct

## Implementation Notes

### Expo Router File Structure

```
app/
├── (tabs)/
│   ├── index.tsx                    # Welcome screen
│   ├── account-type-selection.tsx   # NEW: Role selection
│   ├── signup.tsx                   # MODIFIED: User signup
│   ├── vendor-signup.tsx            # NEW: Vendor signup
│   ├── login.tsx                    # MODIFIED: Role-aware login
│   └── ...
├── (user)/                          # NEW: User navigator
│   ├── _layout.tsx
│   ├── home.tsx
│   ├── vendors.tsx
│   ├── einvite.tsx
│   ├── inbox.tsx
│   └── event.tsx
├── (vendor)/                        # NEW: Vendor navigator
│   ├── _layout.tsx
│   ├── dashboard.tsx
│   ├── my-services.tsx
│   ├── requests.tsx
│   ├── inbox.tsx
│   └── profile.tsx
└── _layout.tsx                      # ROOT: Auth-aware routing

contexts/
└── AuthContext.tsx                  # NEW: Global auth state

utils/
├── validation.ts                    # NEW: Form validation helpers
└── storage.ts                       # NEW: AsyncStorage helpers
```

### Root Layout Logic

The root `app/_layout.tsx` will:
1. Initialize AuthContext
2. Check AsyncStorage for existing role
3. If role exists and Firebase user is authenticated:
   - Load User Navigator (role="user")
   - Load Vendor Navigator (role="vendor")
4. If no role or not authenticated:
   - Show Welcome screen

### Migration Strategy

Since the app already has authentication:
1. Existing users will have no role in Firestore
2. On first login after update, prompt for account type selection
3. Save selected role to Firestore and AsyncStorage
4. Future logins will use stored role

### Security Considerations

- Store only non-sensitive data in AsyncStorage (role, userId)
- Never store passwords locally
- Use Firebase Security Rules to restrict Firestore access:
  - Users can only read/write their own profile
  - Vendors can only read/write their own vendor profile
  - Users can read all vendor profiles (for browsing)
- Validate all inputs on both client and server (Firebase Functions if needed)

### Performance Optimizations

- Cache vendor profile in AsyncStorage to reduce Firestore reads
- Use FlatList with pagination for vendor listings
- Lazy load vendor dashboard metrics
- Implement pull-to-refresh for data updates
- Use React.memo for expensive components

### Accessibility

- All form inputs have accessible labels
- Error messages are announced by screen readers
- Touch targets are minimum 44x44 points
- Color contrast meets WCAG AA standards
- Support for dynamic text sizing
