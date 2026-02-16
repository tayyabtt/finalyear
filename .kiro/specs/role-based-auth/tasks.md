# Implementation Plan

- [x] 1. Set up utility functions and helpers


  - Create validation utility functions for email, password, phone number
  - Create AsyncStorage helper functions for storing/retrieving user role and ID
  - Create Firestore helper functions for user/vendor profile operations
  - _Requirements: 8.1, 8.2, 8.3, 8.4_



- [ ] 2. Create AuthContext for global authentication state
  - Create AuthContext with user, role, loading, and auth methods
  - Implement signUp method that accepts role and additional data
  - Implement signIn method that fetches role from Firestore
  - Implement signOut method that clears AsyncStorage


  - Add Firebase auth state listener
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ] 3. Create Account Type Selection screen
  - Create account-type-selection.tsx with two option cards
  - Add "Continue as User" button that navigates to User signup


  - Add "Continue as Vendor" button that navigates to Vendor signup
  - Add back button to return to welcome screen
  - Style with ShaadiSet branding
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4. Create Vendor Signup screen
  - Create vendor-signup.tsx with form fields: businessName, serviceType, location, phoneNumber, email, password
  - Add Service Type dropdown with all vendor categories
  - Implement form validation for all fields



  - Add "Create Vendor Account" button
  - On submit, create Firebase user and store vendor profile in Firestore
  - Save role="vendor" to AsyncStorage
  - Navigate to Vendor Navigator on success
  - Display validation and Firebase errors inline


  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] 5. Modify existing User Signup screen
  - Remove "I am a..." role picker from signup.tsx
  - Simplify form to: Full Name, Email, Password, Confirm Password


  - On submit, create Firebase user and store user profile in Firestore
  - Save role="user" to AsyncStorage
  - Navigate to User Navigator on success


  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [ ] 6. Modify existing Login screen
  - Update login.tsx to fetch user role from Firestore after successful login


  - Route to User Navigator if role="user"
  - Route to Vendor Navigator if role="vendor"
  - Handle case where role is not found (prompt account type selection)
  - _Requirements: 2.5, 3.5, 4.3, 4.4_



- [ ] 7. Modify Welcome screen to show Account Type Selection
  - Update index.tsx to navigate to account-type-selection instead of directly to signup/login
  - Keep existing UI and styling
  - _Requirements: 1.1_



- [ ] 8. Create Vendor Navigator structure
  - Create app/(vendor)/_layout.tsx with bottom tabs
  - Add tabs: Dashboard, My Services, Requests, Inbox, Profile
  - Use distinct styling (purple accent #7c26ff)
  - _Requirements: 4.2, 7.2_



- [ ] 9. Create Vendor Dashboard screen
  - Create dashboard.tsx with welcome header showing business name
  - Add metric cards: Pending Requests, Total Bookings, Earnings, Profile Views (mock data)
  - Add quick action buttons: Add Service, View Requests, Update Availability


  - Add recent activity feed section
  - _Requirements: 4.2, 7.3_



- [ ] 10. Create My Services screen
  - Create my-services.tsx with FlatList of vendor services
  - Display service cards with name, category, price, status
  - Add floating action button "Add New Service"
  - Add empty state message


  - _Requirements: 4.2, 7.3_

- [ ] 11. Create Requests screen
  - Create requests.tsx with tabs: Pending, Accepted, Declined
  - Display request cards with user info, event date, service, message


  - Add Accept/Decline action buttons
  - Add empty state for each tab
  - _Requirements: 4.2, 7.3_



- [ ] 12. Create Vendor Profile screen
  - Create profile.tsx for vendor profile management
  - Display business info, service type, location, phone


  - Add edit profile functionality
  - Add logout button
  - _Requirements: 4.2, 6.3_

- [ ] 13. Create Vendor Inbox screen
  - Create inbox.tsx for vendor messaging (can reuse existing inbox component)
  - Display conversations with users
  - _Requirements: 4.2_

- [ ] 14. Create User Navigator structure
  - Create app/(user)/_layout.tsx with bottom tabs
  - Add tabs: Home, Vendors, E-Invite, Inbox, Event
  - Use existing ShaadiSet red theme (#e22f2f)
  - Move existing screens (home.tsx, Vendors.tsx, etc.) into (user) folder
  - _Requirements: 4.1, 7.1, 7.4_

- [ ] 15. Update root layout for auth-aware routing
  - Modify app/_layout.tsx to wrap with AuthContext provider
  - Check AsyncStorage for role on app start
  - If role exists and user authenticated, load appropriate navigator
  - If no role or not authenticated, show welcome screen
  - _Requirements: 4.3, 4.4, 4.5, 5.3, 5.4_

- [ ] 16. Update DrawerContent for role-based menu
  - Modify DrawerContent.tsx to show different menu items based on user role
  - For vendors, show: Dashboard, My Services, Requests, Profile, Logout
  - For users, keep existing menu items
  - _Requirements: 7.1, 7.2_

- [ ] 17. Add Firestore security rules
  - Create firestore.rules file
  - Add rules: users can read/write own profile, vendors can read/write own vendor profile, users can read all vendor profiles
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 18. Implement logout functionality across both navigators
  - Update logout in DrawerContent to clear AsyncStorage
  - Sign out from Firebase
  - Navigate to welcome screen
  - _Requirements: 4.6, 5.5, 5.6_

- [ ]* 19. Add unit tests for validation utilities
  - Write tests for email validation
  - Write tests for password validation
  - Write tests for phone number validation
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ]* 20. Add integration tests for auth flows
  - Test user signup flow end-to-end
  - Test vendor signup flow end-to-end
  - Test login with role routing
  - Test logout and AsyncStorage clearing
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.6, 5.5, 5.6_
