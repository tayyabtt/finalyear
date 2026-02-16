# Payment System - Quick Setup Guide

Your Stripe keys are already configured! Just deploy the Cloud Functions.

## Step 1: Deploy Firebase Cloud Functions

```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Go to functions folder
cd functions

# Install dependencies
npm install

# Set Stripe secret key (already in code as fallback, but recommended)
firebase functions:config:set stripe.secret="sk_test_51Skk9aKSwNjQka2uDiQXDb20oY43E0HqEw6LpUTXMUy4kqTM0DduCDmFK3pRvr6OQRtf1MEBw70ybOvgmlKf5rLT00eUVvDHFZ"

# Deploy functions
firebase deploy --only functions
```

## Step 2: Test Payment

1. Open the app
2. Go to E-Salami screen (from drawer menu)
3. Enter amount (min ₨100)
4. Enter any recipient ID
5. Tap "Send e-Salami"
6. Complete payment with test card: `4242 4242 4242 4242`

## Step 3: Check Firebase

All transactions are saved in Firestore:
- Collection: `payments` - All transaction records
- Collection: `vendorPaymentAccounts` - Vendor balances

## Test Card Numbers

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Expiry: Any future date
- CVC: Any 3 digits

## Admin Refunds

From your admin project, use:
```javascript
import { forceRefundFromVendor } from './utils/paymentService';

// Refund customer, deduct from vendor
await forceRefundFromVendor(transactionId, amount, 'Scam reason', adminUserId);
```

## Webhook Setup (Optional but Recommended)

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/stripeWebhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy signing secret and set:
   ```bash
   firebase functions:config:set stripe.webhook_secret="whsec_..."
   ```
