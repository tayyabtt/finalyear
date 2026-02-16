// functions/index.js
// Firebase Cloud Functions for Stripe Payment Processing
//
// DEPLOYMENT:
// 1. cd functions && npm install
// 2. firebase functions:config:set stripe.secret="sk_test_51Skk9aKSwNjQka2uDiQXDb20oY43E0HqEw6LpUTXMUy4kqTM0DduCDmFK3pRvr6OQRtf1MEBw70ybOvgmlKf5rLT00eUVvDHFZ"
// 3. firebase deploy --only functions

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Initialize Stripe with secret key from config
const stripe = require('stripe')(functions.config().stripe?.secret || 'sk_test_51Skk9aKSwNjQka2uDiQXDb20oY43E0HqEw6LpUTXMUy4kqTM0DduCDmFK3pRvr6OQRtf1MEBw70ybOvgmlKf5rLT00eUVvDHFZ');

/**
 * Create a Payment Intent
 */
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  const { amount, currency = 'pkr', metadata = {} } = data;

  if (!amount || amount < 100) {
    throw new functions.https.HttpsError('invalid-argument', 'Amount must be at least 100 paisa');
  }

  try {
    const userId = context.auth.uid;
    
    // Get or create Stripe customer
    const userDoc = await admin.firestore().collection('users').doc(userId).get();
    let customerId = userDoc.exists ? userDoc.data()?.stripeCustomerId : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { firebaseUID: userId },
        email: context.auth.token.email || undefined,
      });
      customerId = customer.id;
      
      // Save customer ID
      await admin.firestore().collection('users').doc(userId).set({
        stripeCustomerId: customerId,
      }, { merge: true });
    }

    // Create ephemeral key
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2023-10-16' }
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
      customer: customerId,
      metadata: {
        ...metadata,
        userId: userId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      customerId: customerId,
      ephemeralKey: ephemeralKey.secret,
    };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Stripe Webhook Handler
 */
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = functions.config().stripe?.webhook_secret;

  let event;

  try {
    if (webhookSecret) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      
      // Update payment in Firestore
      const paymentsRef = admin.firestore().collection('payments');
      const snapshot = await paymentsRef
        .where('stripePaymentIntentId', '==', paymentIntent.id)
        .get();
      
      if (!snapshot.empty) {
        const paymentDoc = snapshot.docs[0];
        await paymentDoc.ref.update({
          status: 'completed',
          stripeChargeId: paymentIntent.latest_charge,
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Update vendor balance if applicable
        const paymentData = paymentDoc.data();
        if (paymentData.recipientType === 'vendor') {
          const vendorRef = admin.firestore()
            .collection('vendorPaymentAccounts')
            .doc(paymentData.recipientId);
          
          const vendorDoc = await vendorRef.get();
          if (vendorDoc.exists) {
            await vendorRef.update({
              availableBalance: admin.firestore.FieldValue.increment(paymentData.netAmount),
              totalEarnings: admin.firestore.FieldValue.increment(paymentData.netAmount),
              updatedAt: new Date().toISOString(),
            });
          } else {
            await vendorRef.set({
              vendorId: paymentData.recipientId,
              availableBalance: paymentData.netAmount,
              pendingBalance: 0,
              heldBalance: 0,
              totalEarnings: paymentData.netAmount,
              totalRefunds: 0,
              stripeAccountStatus: 'pending',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      
      const failedSnapshot = await admin.firestore()
        .collection('payments')
        .where('stripePaymentIntentId', '==', failedPayment.id)
        .get();
      
      if (!failedSnapshot.empty) {
        await failedSnapshot.docs[0].ref.update({
          status: 'failed',
          updatedAt: new Date().toISOString(),
        });
      }
      break;
  }

  res.json({ received: true });
});

/**
 * Process Refund (Admin only)
 */
exports.processRefund = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
  }

  // Check admin
  const adminDoc = await admin.firestore().collection('admins').doc(context.auth.uid).get();
  if (!adminDoc.exists) {
    throw new functions.https.HttpsError('permission-denied', 'Admin access required');
  }

  const { paymentIntentId, amount, reason } = data;

  try {
    const refundParams = {
      payment_intent: paymentIntentId,
      reason: 'requested_by_customer',
      metadata: { reason: reason || 'Admin refund' },
    };
    
    if (amount) {
      refundParams.amount = amount;
    }

    const refund = await stripe.refunds.create(refundParams);
    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Refund error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
