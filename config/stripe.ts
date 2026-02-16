// config/stripe.ts
// Stripe Configuration - Using Environment Variables

export const STRIPE_CONFIG = {
  // Publishable key (safe to use in app)
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // Merchant info for Apple/Google Pay
  merchantIdentifier: 'merchant.com.shaadiset',
  
  // Currency
  currency: 'pkr',
  
  // Country
  country: 'PK',
};

// IMPORTANT: Secret key should NEVER be in client code
// Use Firebase Functions or backend server for secret key operations
// See functions/index.js for proper implementation
