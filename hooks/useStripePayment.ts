// hooks/useStripePayment.ts
// Custom hook for Stripe payment operations

import { useStripe } from '@stripe/stripe-react-native';
import { useState } from 'react';
import { STRIPE_CONFIG } from '../config/stripe';
import { useAuth } from '../contexts/AuthContext';
import { createPaymentIntent } from '../utils/stripeApi';

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  /**
   * Initialize and present the Stripe payment sheet
   */
  const payWithSheet = async (
    amount: number,
    description: string = 'Payment'
  ): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> => {
    setLoading(true);

    try {
      // 1. Create payment intent (amount in paisa for PKR)
      const { clientSecret, paymentIntentId, customerId, ephemeralKey } = 
        await createPaymentIntent(
          amount * 100, // Convert to paisa
          STRIPE_CONFIG.currency,
          { description },
          user?.uid,
          user?.email || undefined
        );

      // 2. Initialize payment sheet
      const initConfig: any = {
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'ShaadiSet',
        style: 'automatic',
      };

      // Add customer info if available
      if (customerId && ephemeralKey) {
        initConfig.customerId = customerId;
        initConfig.customerEphemeralKeySecret = ephemeralKey;
      }

      // Add Google Pay config
      initConfig.googlePay = {
        merchantCountryCode: STRIPE_CONFIG.country,
        testEnv: true,
      };

      const { error: initError } = await initPaymentSheet(initConfig);

      if (initError) {
        console.error('Init error:', initError);
        throw new Error(initError.message);
      }

      // 3. Present payment sheet to user
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        if (presentError.code === 'Canceled') {
          return { success: false, error: 'Payment cancelled' };
        }
        throw new Error(presentError.message);
      }

      return { success: true, paymentIntentId };
    } catch (error: any) {
      console.error('Payment error:', error);
      return { success: false, error: error.message || 'Payment failed' };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    payWithSheet,
  };
};

export default useStripePayment;
