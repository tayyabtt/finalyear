# Requirements Document

## Introduction

This feature implements a dual-role authentication system for the ShaadiSet wedding planning app, allowing users to sign up and log in as either a "User" (someone planning a wedding) or a "Vendor" (service provider). The system will provide role-specific signup flows, authentication, and navigation experiences tailored to each user type.

## Requirements

### Requirement 1: Account Type Selection

**User Story:** As a new user opening the app, I want to choose whether I'm signing up as a User or Vendor, so that I can access the appropriate features for my role.

#### Acceptance Criteria

1. WHEN the user taps "Sign In" or "Sign Up" button on the welcome/home screen THEN the system SHALL display an account type selection screen or modal
2. WHEN the account type selection is displayed THEN the system SHALL show two clear options: "Continue as User" and "Continue as Vendor"
3. WHEN the user selects "Continue as User" THEN the system SHALL navigate to the User signup/login screen
4. WHEN the user selects "Continue as Vendor" THEN the system SHALL navigate to the Vendor signup/login screen
5. WHEN the account type selection screen is displayed THEN the system SHALL provide a way to go back to the previous screen

### Requirement 2: User Authentication Flow

**User Story:** As a person planning a wedding, I want to sign up and log in as a User, so that I can browse vendors, create events, and manage my wedding plans.

#### Acceptance Criteria

1. WHEN a User selects "Continue as User" THEN the system SHALL display the User signup screen with fields for email and password
2. WHEN a User completes the signup form with valid data THEN the system SHALL create a Firebase user account with role "user"
3. WHEN a User successfully signs up THEN the system SHALL store the user role as "user" in AsyncStorage
4. WHEN a User successfully signs up THEN the system SHALL navigate to the User navigation stack
5. WHEN a returning User logs in THEN the system SHALL verify credentials via Firebase and load the User navigation stack
6. IF signup fails due to invalid email or weak password THEN the system SHALL display appropriate error messages

### Requirement 3: Vendor Authentication Flow

**User Story:** As a wedding service provider, I want to sign up and log in as a Vendor with my business details, so that I can showcase my services and receive booking requests.

#### Acceptance Criteria

1. WHEN a Vendor selects "Continue as Vendor" THEN the system SHALL display the Vendor signup screen with the following fields:
   - Business Name (required text input)
   - Service Type (required dropdown: Photographer, Decorator, Caterer, Venue, Makeup Artist, Planner, Mehndi Artist, Bridal Wear, Groom Wear)
   - Location (required text input)
   - Phone Number (required text input with numeric keyboard)
   - Email (required email input)
   - Password (required password input with minimum 6 characters)
2. WHEN a Vendor completes the signup form with valid data THEN the system SHALL create a Firebase user account with role "vendor"
3. WHEN a Vendor successfully signs up THEN the system SHALL store the user role as "vendor" and vendor profile data in AsyncStorage and/or Firestore
4. WHEN a Vendor successfully signs up THEN the system SHALL navigate to the Vendor navigation stack
5. WHEN a returning Vendor logs in THEN the system SHALL verify credentials via Firebase and load the Vendor navigation stack
6. IF any required field is empty or invalid THEN the system SHALL display validation error messages
7. WHEN the Vendor taps the Service Type dropdown THEN the system SHALL display all available service categories

### Requirement 4: Role-Based Navigation

**User Story:** As a logged-in user, I want to see only the features relevant to my role (User or Vendor), so that I have a streamlined experience without confusion.

#### Acceptance Criteria

1. WHEN a User successfully authenticates THEN the system SHALL display the User Navigator with tabs/screens: Home, Vendors, E-Invite, Inbox, Event
2. WHEN a Vendor successfully authenticates THEN the system SHALL display the Vendor Navigator with tabs/screens: Dashboard, My Services, Requests, Inbox, Profile
3. WHEN the app launches THEN the system SHALL check AsyncStorage for stored user role
4. IF a valid role exists in AsyncStorage THEN the system SHALL automatically load the appropriate navigator without showing login screens
5. IF no role exists in AsyncStorage THEN the system SHALL display the welcome/account type selection screen
6. WHEN a user logs out THEN the system SHALL clear the role from AsyncStorage and return to the welcome screen

### Requirement 5: Persistent Authentication State

**User Story:** As a logged-in user, I want to remain logged in when I close and reopen the app, so that I don't have to sign in every time.

#### Acceptance Criteria

1. WHEN a user successfully logs in THEN the system SHALL store the user's role ("user" or "vendor") in AsyncStorage
2. WHEN a user successfully logs in THEN the system SHALL store the user's UID from Firebase in AsyncStorage
3. WHEN the app is reopened THEN the system SHALL check AsyncStorage for authentication data
4. IF valid authentication data exists THEN the system SHALL verify the Firebase auth state and load the appropriate navigator
5. WHEN a user logs out THEN the system SHALL clear all authentication data from AsyncStorage
6. WHEN a user logs out THEN the system SHALL sign out from Firebase

### Requirement 6: Vendor Profile Data Storage

**User Story:** As a Vendor, I want my business information to be saved and accessible, so that Users can view my services and contact me.

#### Acceptance Criteria

1. WHEN a Vendor completes signup THEN the system SHALL store vendor profile data in Firestore under a "vendors" collection
2. WHEN vendor profile data is stored THEN the system SHALL include: userId (Firebase UID), businessName, serviceType, location, phoneNumber, email, createdAt timestamp
3. WHEN a Vendor logs in THEN the system SHALL fetch their profile data from Firestore
4. IF Firestore is unavailable THEN the system SHALL cache vendor data in AsyncStorage as a fallback
5. WHEN vendor profile data is needed THEN the system SHALL be retrievable by the vendor's Firebase UID

### Requirement 7: User Interface Differentiation

**User Story:** As a user of the app, I want the interface to clearly reflect whether I'm using User or Vendor features, so that I understand the context of my actions.

#### Acceptance Criteria

1. WHEN the User Navigator is displayed THEN the system SHALL use the existing ShaadiSet branding with red accent color (#e22f2f)
2. WHEN the Vendor Navigator is displayed THEN the system SHALL use distinct visual styling (e.g., different accent color or header style) to differentiate from User UI
3. WHEN on the Vendor Dashboard THEN the system SHALL display vendor-specific metrics and actions (e.g., "Pending Requests", "My Services", "Earnings")
4. WHEN on the User Home THEN the system SHALL display user-specific content (e.g., "Browse Vendors", "My Events", "Planning Tools")
5. WHEN switching between User and Vendor accounts THEN the system SHALL clearly indicate the current role in the navigation header or profile section

### Requirement 8: Error Handling and Validation

**User Story:** As a user signing up, I want clear feedback when I make mistakes in the form, so that I can correct them and complete registration successfully.

#### Acceptance Criteria

1. WHEN a user submits a signup form with an empty required field THEN the system SHALL display an error message indicating which field is required
2. WHEN a user enters an invalid email format THEN the system SHALL display "Please enter a valid email address"
3. WHEN a user enters a password shorter than 6 characters THEN the system SHALL display "Password must be at least 6 characters"
4. WHEN a user enters a phone number with non-numeric characters THEN the system SHALL display "Please enter a valid phone number"
5. IF Firebase authentication fails THEN the system SHALL display the Firebase error message in user-friendly language
6. WHEN network connectivity is lost during signup THEN the system SHALL display "Network error. Please check your connection and try again"
