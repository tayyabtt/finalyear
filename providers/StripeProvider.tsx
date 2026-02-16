// providers/StripeProvider.tsx
// Stripe Provider wrapper for the app

import { StripeProvider as StripeProviderNative } from '@stripe/stripe-react-native';
import React, { ReactElement } from 'react';
import { STRIPE_CONFIG } from '../config/stripe';

interface Props {
    children: ReactElement | ReactElement[];
}

export const StripeProvider: React.FC<Props> = ({ children }) => {
    return (
        <StripeProviderNative
            publishableKey={STRIPE_CONFIG.publishableKey}
            merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
            urlScheme="shaadiset"
        >
            {children}
        </StripeProviderNative>
    );
};

export default StripeProvider;
