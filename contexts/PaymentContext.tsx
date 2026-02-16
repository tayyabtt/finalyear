// contexts/PaymentContext.tsx
// Payment state management context

import React, { createContext, useCallback, useContext, useState } from 'react';
import {
    CreatePaymentRequest,
    PaymentDispute,
    PaymentSummary,
    PaymentTransaction,
    RefundRequest,
    VendorPaymentAccount,
} from '../types/payment';
import {
    confirmPayment,
    createDispute,
    createPayment,
    getAllDisputes,
    getAllTransactions,
    getPaymentSummary,
    getUserTransactions,
    getVendorPaymentAccount,
    processRefund,
    processVendorPayout,
    releaseHeldPayment,
    resolveDispute,
} from '../utils/paymentService';
import { useAuth } from './AuthContext';

interface PaymentContextType {
  // State
  transactions: PaymentTransaction[];
  vendorAccount: VendorPaymentAccount | null;
  summary: PaymentSummary | null;
  disputes: PaymentDispute[];
  loading: boolean;
  error: string | null;
  
  // Actions
  sendPayment: (request: CreatePaymentRequest) => Promise<PaymentTransaction>;
  confirmStripePayment: (transactionId: string, chargeId: string) => Promise<void>;
  loadTransactions: (type?: 'sent' | 'received') => Promise<void>;
  loadVendorAccount: () => Promise<void>;
  loadSummary: () => Promise<void>;
  
  // Dispute actions
  fileDispute: (
    transactionId: string,
    reason: PaymentDispute['reason'],
    description: string
  ) => Promise<PaymentDispute>;
  
  // Admin actions
  refundPayment: (request: RefundRequest) => Promise<PaymentTransaction>;
  releasePayment: (transactionId: string) => Promise<void>;
  loadAllTransactions: () => Promise<void>;
  loadAllDisputes: () => Promise<void>;
  resolvePaymentDispute: (
    disputeId: string,
    resolution: 'resolved_customer' | 'resolved_vendor',
    refundAmount: number | undefined,
    notes: string
  ) => Promise<void>;
  payoutToVendor: (vendorId: string, amount: number) => Promise<void>;
  
  clearError: () => void;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [vendorAccount, setVendorAccount] = useState<VendorPaymentAccount | null>(null);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [disputes, setDisputes] = useState<PaymentDispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clearError = useCallback(() => setError(null), []);
  
  /**
   * Send a payment
   */
  const sendPayment = useCallback(async (
    request: CreatePaymentRequest
  ): Promise<PaymentTransaction> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const transaction = await createPayment(
        request,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        user.email || '',
        role || 'user'
      );
      
      setTransactions((prev) => [transaction, ...prev]);
      return transaction;
    } catch (err: any) {
      setError(err.message || 'Failed to send payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, role]);
  
  /**
   * Confirm Stripe payment
   */
  const confirmStripePayment = useCallback(async (
    transactionId: string,
    chargeId: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const updated = await confirmPayment(transactionId, chargeId);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? updated : t))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to confirm payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Load user transactions
   */
  const loadTransactions = useCallback(async (type?: 'sent' | 'received'): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const txns = await getUserTransactions(user.uid, type);
      setTransactions(txns);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Load vendor payment account
   */
  const loadVendorAccount = useCallback(async (): Promise<void> => {
    if (!user || role !== 'vendor') return;
    
    setLoading(true);
    setError(null);
    
    try {
      const account = await getVendorPaymentAccount(user.uid);
      setVendorAccount(account);
    } catch (err: any) {
      setError(err.message || 'Failed to load vendor account');
    } finally {
      setLoading(false);
    }
  }, [user, role]);
  
  /**
   * Load payment summary
   */
  const loadSummary = useCallback(async (): Promise<void> => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const sum = await getPaymentSummary(user.uid);
      setSummary(sum);
    } catch (err: any) {
      setError(err.message || 'Failed to load summary');
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * File a dispute
   */
  const fileDispute = useCallback(async (
    transactionId: string,
    reason: PaymentDispute['reason'],
    description: string
  ): Promise<PaymentDispute> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const dispute = await createDispute(
        transactionId,
        user.uid,
        user.displayName || user.email?.split('@')[0] || 'User',
        reason,
        description
      );
      
      setDisputes((prev) => [dispute, ...prev]);
      return dispute;
    } catch (err: any) {
      setError(err.message || 'Failed to file dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  // Admin actions
  
  /**
   * Refund a payment (admin)
   */
  const refundPayment = useCallback(async (
    request: RefundRequest
  ): Promise<PaymentTransaction> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const refund = await processRefund(request, user.uid);
      
      // Update original transaction in state
      setTransactions((prev) =>
        prev.map((t) => {
          if (t.id === request.transactionId) {
            return {
              ...t,
              status: request.fullRefund ? 'refunded' : 'partially_refunded',
              refundAmount: (t.refundAmount || 0) + request.amount,
            };
          }
          return t;
        })
      );
      
      return refund;
    } catch (err: any) {
      setError(err.message || 'Failed to process refund');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Release held payment (admin)
   */
  const releasePayment = useCallback(async (transactionId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const updated = await releaseHeldPayment(transactionId, user.uid);
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? updated : t))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to release payment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Load all transactions (admin)
   */
  const loadAllTransactions = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const txns = await getAllTransactions();
      setTransactions(txns);
    } catch (err: any) {
      setError(err.message || 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Load all disputes (admin)
   */
  const loadAllDisputes = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const allDisputes = await getAllDisputes();
      setDisputes(allDisputes);
    } catch (err: any) {
      setError(err.message || 'Failed to load disputes');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Resolve a dispute (admin)
   */
  const resolvePaymentDispute = useCallback(async (
    disputeId: string,
    resolution: 'resolved_customer' | 'resolved_vendor',
    refundAmount: number | undefined,
    notes: string
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      const resolved = await resolveDispute(disputeId, resolution, refundAmount, user.uid, notes);
      setDisputes((prev) =>
        prev.map((d) => (d.id === disputeId ? resolved : d))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to resolve dispute');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  /**
   * Payout to vendor (admin)
   */
  const payoutToVendor = useCallback(async (
    vendorId: string,
    amount: number
  ): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    
    setLoading(true);
    setError(null);
    
    try {
      await processVendorPayout(
        { vendorId, amount, method: 'bank_transfer' },
        user.uid
      );
    } catch (err: any) {
      setError(err.message || 'Failed to process payout');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  const value: PaymentContextType = {
    transactions,
    vendorAccount,
    summary,
    disputes,
    loading,
    error,
    
    sendPayment,
    confirmStripePayment,
    loadTransactions,
    loadVendorAccount,
    loadSummary,
    fileDispute,
    
    refundPayment,
    releasePayment,
    loadAllTransactions,
    loadAllDisputes,
    resolvePaymentDispute,
    payoutToVendor,
    
    clearError,
  };
  
  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = (): PaymentContextType => {
  const context = useContext(PaymentContext);
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }
  return context;
};
