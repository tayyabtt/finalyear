// utils/stripeApi.ts
// Stripe API - Direct calls for testing
// ⚠️ WARNING: This file should NOT be used in production!
// Move all Stripe operations to Firebase Functions or backend server

import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';

const db = getFirestore();

// ⚠️ SECURITY WARNING ⚠️
// Stripe Secret Key should NEVER be in client code!
// This is for DEVELOPMENT/TESTING ONLY
// In production, use Firebase Functions (see functions/index.js)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';

// If you see this warning, you need to move to backend implementation
if (!STRIPE_SECRET_KEY) {
  console.warn('⚠️ Stripe secret key not configured. Use Firebase Functions for production!');
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  customerId?: string;
  ephemeralKey?: string;
}

/**
 * Create a Stripe customer
 * ⚠️ Should be done on backend in production
 */
const createStripeCustomer = async (userId: string, email?: string): Promise<string> => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured. Use Firebase Functions.');
  }

  const response = await fetch('https://api.stripe.com/v1/customers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `metadata[firebaseUID]=${userId}${email ? `&email=${encodeURIComponent(email)}` : ''}`,
  });

  const customer = await response.json();
  if (customer.error) throw new Error(customer.error.message);
  return customer.id;
};

/**
 * Create ephemeral key for customer
 * ⚠️ Should be done on backend in production
 */
const createEphemeralKey = async (customerId: string): Promise<string> => {
  if (!STRIPE_SECRET_KEY) {
    throw new Error('Stripe not configured. Use Firebase Functions.');
  }

  const response = await fetch('https://api.stripe.com/v1/ephemeral_keys', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Stripe-Version': '2023-10-16',
    },
    body: `customer=${customerId}`,
  });

  const key = await response.json();
  if (key.error) throw new Error(key.error.message);
  return key.secret;
};

/**
 * Create a payment intent
 * ⚠️ In production, call your backend API instead
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'pkr',
  metadata: Record<string, string> = {},
  userId?: string,
  userEmail?: string
): Promise<PaymentIntentResponse> => {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured. Please set up Firebase Functions.');
    }

    let customerId: string | undefined;
    let ephemeralKey: string | undefined;

    // Get or create Stripe customer if userId provided
    if (userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      customerId = userDoc.exists() ? userDoc.data()?.stripeCustomerId : undefined;

      if (!customerId) {
        customerId = await createStripeCustomer(userId, userEmail);
        // Save customer ID to user profile
        await setDoc(doc(db, 'users', userId), { stripeCustomerId: customerId }, { merge: true });
      }

      // Create ephemeral key
      ephemeralKey = await createEphemeralKey(customerId);
    }

    // Build request body
    let body = `amount=${amount}&currency=${currency}&automatic_payment_methods[enabled]=true`;
    
    if (customerId) {
      body += `&customer=${customerId}`;
    }
    
    Object.entries(metadata).forEach(([key, value]) => {
      body += `&metadata[${key}]=${encodeURIComponent(value)}`;
    });

    // Create payment intent
    const response = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const paymentIntent = await response.json();
    
    if (paymentIntent.error) {
      throw new Error(paymentIntent.error.message);
    }

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId,
      ephemeralKey,
    };
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error(error.message || 'Failed to create payment');
  }
};

/**
 * Process refund (Admin only)
 * ⚠️ Should be done on backend in production
 */
export const processStripeRefund = async (
  paymentIntentId: string,
  amount?: number,
  reason?: string
): Promise<{ success: boolean; refundId: string }> => {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured. Use Firebase Functions.');
    }

    let body = `payment_intent=${paymentIntentId}`;
    if (amount) body += `&amount=${amount}`;
    if (reason) body += `&metadata[reason]=${encodeURIComponent(reason)}`;

    const response = await fetch('https://api.stripe.com/v1/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const refund = await response.json();
    
    if (refund.error) {
      throw new Error(refund.error.message);
    }

    return { success: true, refundId: refund.id };
  } catch (error: any) {
    console.error('Error processing refund:', error);
    throw new Error(error.message || 'Failed to process refund');
  }
};

/**
 * Get payment intent status
 */
export const getPaymentIntentStatus = async (paymentIntentId: string): Promise<string> => {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured. Use Firebase Functions.');
    }

    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const paymentIntent = await response.json();
    
    if (paymentIntent.error) {
      throw new Error(paymentIntent.error.message);
    }

    return paymentIntent.status;
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

/**
 * Get payment intent details including charge ID
 */
export const getPaymentIntentDetails = async (paymentIntentId: string): Promise<{
  status: string;
  chargeId?: string;
}> => {
  try {
    if (!STRIPE_SECRET_KEY) {
      throw new Error('Stripe not configured. Use Firebase Functions.');
    }

    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const paymentIntent = await response.json();
    
    if (paymentIntent.error) {
      throw new Error(paymentIntent.error.message);
    }

    return {
      status: paymentIntent.status,
      chargeId: paymentIntent.latest_charge || undefined,
    };
  } catch (error: any) {
    console.error('Error getting payment intent details:', error);
    throw error;
  }
};

// ⚠️ PRODUCTION RECOMMENDATION ⚠️
// Replace this entire file with backend API calls:
//
// export const createPaymentIntent = async (...) => {
//   const response = await fetch('https://your-backend.com/api/create-payment-intent', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ amount, currency, metadata, userId })
//   });
//   return response.json();
// };
