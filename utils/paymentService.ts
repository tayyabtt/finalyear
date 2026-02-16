// utils/paymentService.ts
// Payment service with Stripe integration and Firestore storage

import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    getFirestore,
    orderBy,
    query,
    runTransaction,
    updateDoc,
    where,
} from 'firebase/firestore';
import {
    CreatePaymentRequest,
    PaymentDispute,
    PaymentSummary,
    PaymentTransaction,
    PayoutRequest,
    RefundRequest,
    VendorPaymentAccount,
} from '../types/payment';

const db = getFirestore();

// Stripe configuration - In production, use environment variables
const STRIPE_CONFIG = {
  publishableKey: 'pk_test_your_stripe_publishable_key',
  // Backend URL for secure operations
  backendUrl: 'https://your-backend.com/api',
};

// Platform fee percentage (2.5%)
const PLATFORM_FEE_PERCENT = 2.5;
const STRIPE_FEE_PERCENT = 2.9;
const STRIPE_FEE_FIXED = 30; // 30 paisa/cents

/**
 * Calculate fees for a payment
 */
export const calculateFees = (amount: number): { fee: number; netAmount: number } => {
  const stripeFee = Math.round((amount * STRIPE_FEE_PERCENT) / 100) + STRIPE_FEE_FIXED;
  const platformFee = Math.round((amount * PLATFORM_FEE_PERCENT) / 100);
  const totalFee = stripeFee + platformFee;
  const netAmount = amount - totalFee;
  
  return { fee: totalFee, netAmount };
};

/**
 * Create a payment intent with Stripe (simulated for now)
 * In production, this should call your backend
 */
export const createStripePaymentIntent = async (
  amount: number,
  currency: string = 'pkr',
  metadata: Record<string, string> = {}
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  // Simulated response - In production, call your backend
  // Your backend should use Stripe SDK to create payment intent
  
  // Example backend call:
  // const response = await fetch(`${STRIPE_CONFIG.backendUrl}/create-payment-intent`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ amount, currency, metadata }),
  // });
  // return response.json();
  
  // Simulated for demo
  const paymentIntentId = `pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  return {
    clientSecret: `${paymentIntentId}_secret_demo`,
    paymentIntentId,
  };
};

/**
 * Create a new payment transaction
 */
export const createPayment = async (
  request: CreatePaymentRequest,
  senderId: string,
  senderName: string,
  senderEmail: string,
  senderType: 'user' | 'vendor' | 'admin'
): Promise<PaymentTransaction> => {
  try {
    // Try to get recipient details, but don't fail if not found
    let recipientName = request.recipientId; // Default to ID
    let recipientEmail = '';
    
    try {
      const recipientDoc = request.recipientType === 'vendor'
        ? await getDoc(doc(db, 'vendors', request.recipientId))
        : await getDoc(doc(db, 'users', request.recipientId));
      
      if (recipientDoc.exists()) {
        const recipientData = recipientDoc.data();
        recipientName = recipientData.businessName || recipientData.fullName || request.recipientId;
        recipientEmail = recipientData.email || '';
      }
    } catch (e) {
      console.log('Recipient not found in database, using ID as name');
    }
    
    // Calculate fees
    const { fee, netAmount } = calculateFees(request.amount);
    const now = new Date().toISOString();
    
    // Build transaction object - Firebase doesn't accept undefined values
    const transaction: Record<string, any> = {
      type: request.type,
      status: request.holdPayment ? 'held' : 'pending',
      amount: request.amount,
      currency: 'PKR',
      fee,
      netAmount,
      senderId,
      senderName,
      senderEmail,
      senderType,
      recipientId: request.recipientId,
      recipientName,
      recipientEmail,
      recipientType: request.recipientType,
      method: request.method,
      createdAt: now,
      updatedAt: now,
      isHeld: request.holdPayment || false,
    };
    
    // Only add optional fields if they have values
    if (request.message) transaction.message = request.message;
    if (request.bookingId) transaction.bookingId = request.bookingId;
    if (request.eventId) transaction.eventId = request.eventId;
    if (request.holdPayment && request.holdDays) {
      transaction.heldUntil = new Date(Date.now() + request.holdDays * 24 * 60 * 60 * 1000).toISOString();
      transaction.releaseCondition = 'Service completion or 7 days';
    }
    
    // Save to Firestore
    const docRef = await addDoc(collection(db, 'payments'), transaction);
    
    return { ...transaction, id: docRef.id } as PaymentTransaction;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

/**
 * Confirm payment after Stripe payment succeeds
 */
export const confirmPayment = async (
  transactionId: string,
  stripeChargeId: string
): Promise<PaymentTransaction> => {
  try {
    const transactionRef = doc(db, 'payments', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = transactionDoc.data() as PaymentTransaction;
    const now = new Date().toISOString();
    
    // Update transaction status - Firebase doesn't accept undefined values
    const updates: Record<string, any> = {
      status: transaction.isHeld ? 'held' : 'completed',
      stripeChargeId,
      updatedAt: now,
    };
    
    // Only add completedAt if not held
    if (!transaction.isHeld) {
      updates.completedAt = now;
    }
    
    await updateDoc(transactionRef, updates);
    
    // If payment is to vendor and not held, update vendor balance
    if (transaction.recipientType === 'vendor' && !transaction.isHeld) {
      await updateVendorBalance(transaction.recipientId, transaction.netAmount, 'add');
    }
    
    return { ...transaction, ...updates, id: transactionId };
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};


/**
 * Update vendor's payment account balance
 */
export const updateVendorBalance = async (
  vendorId: string,
  amount: number,
  operation: 'add' | 'subtract' | 'hold' | 'release'
): Promise<void> => {
  try {
    const accountRef = doc(db, 'vendorPaymentAccounts', vendorId);
    
    await runTransaction(db, async (transaction) => {
      const accountDoc = await transaction.get(accountRef);
      
      if (!accountDoc.exists()) {
        // Create new account if doesn't exist
        const newAccount: VendorPaymentAccount = {
          vendorId,
          stripeAccountStatus: 'pending',
          availableBalance: operation === 'add' ? amount : 0,
          pendingBalance: 0,
          heldBalance: operation === 'hold' ? amount : 0,
          totalEarnings: operation === 'add' ? amount : 0,
          totalRefunds: 0,
          autoPayoutEnabled: false,
          payoutThreshold: 5000,
          payoutSchedule: 'manual',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        transaction.set(accountRef, newAccount);
        return;
      }
      
      const account = accountDoc.data() as VendorPaymentAccount;
      const updates: Partial<VendorPaymentAccount> = {
        updatedAt: new Date().toISOString(),
      };
      
      switch (operation) {
        case 'add':
          updates.availableBalance = account.availableBalance + amount;
          updates.totalEarnings = account.totalEarnings + amount;
          break;
        case 'subtract':
          updates.availableBalance = Math.max(0, account.availableBalance - amount);
          updates.totalRefunds = account.totalRefunds + amount;
          break;
        case 'hold':
          updates.availableBalance = Math.max(0, account.availableBalance - amount);
          updates.heldBalance = account.heldBalance + amount;
          break;
        case 'release':
          updates.heldBalance = Math.max(0, account.heldBalance - amount);
          updates.availableBalance = account.availableBalance + amount;
          break;
      }
      
      transaction.update(accountRef, updates);
    });
  } catch (error) {
    console.error('Error updating vendor balance:', error);
    throw error;
  }
};

/**
 * Process refund - Admin can refund customer by taking money from vendor
 */
export const processRefund = async (
  request: RefundRequest,
  adminId: string
): Promise<PaymentTransaction> => {
  try {
    const originalRef = doc(db, 'payments', request.transactionId);
    const originalDoc = await getDoc(originalRef);
    
    if (!originalDoc.exists()) {
      throw new Error('Original transaction not found');
    }
    
    const original = { ...originalDoc.data(), id: request.transactionId } as PaymentTransaction;
    
    if (original.status === 'refunded') {
      throw new Error('Transaction already fully refunded');
    }
    
    const refundAmount = request.fullRefund ? original.amount : request.amount;
    
    if (refundAmount > original.amount - (original.refundAmount || 0)) {
      throw new Error('Refund amount exceeds available amount');
    }
    
    const now = new Date().toISOString();
    
    // Create refund transaction
    const refundTransaction: Omit<PaymentTransaction, 'id'> = {
      type: 'refund',
      status: 'completed',
      amount: refundAmount,
      currency: original.currency,
      fee: 0,
      netAmount: refundAmount,
      
      senderId: original.recipientId,
      senderName: original.recipientName,
      senderEmail: original.recipientEmail,
      senderType: original.recipientType,
      
      recipientId: original.senderId,
      recipientName: original.senderName,
      recipientEmail: original.senderEmail,
      recipientType: original.senderType === 'admin' ? 'user' : original.senderType,
      
      method: original.method,
      
      message: `Refund: ${request.reason}`,
      originalTransactionId: request.transactionId,
      refundReason: request.reason,
      refundedBy: adminId,
      
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      
      isHeld: false,
    };
    
    const refundRef = await addDoc(collection(db, 'payments'), refundTransaction);
    
    // Update original transaction
    const totalRefunded = (original.refundAmount || 0) + refundAmount;
    const newStatus = totalRefunded >= original.amount ? 'refunded' : 'partially_refunded';
    
    await updateDoc(originalRef, {
      status: newStatus,
      refundAmount: totalRefunded,
      refundReason: request.reason,
      refundedAt: now,
      refundedBy: adminId,
      updatedAt: now,
    });
    
    // Deduct from vendor balance
    if (original.recipientType === 'vendor') {
      await updateVendorBalance(original.recipientId, refundAmount, 'subtract');
    }
    
    return { ...refundTransaction, id: refundRef.id };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Release held payment to vendor
 */
export const releaseHeldPayment = async (
  transactionId: string,
  adminId: string
): Promise<PaymentTransaction> => {
  try {
    const transactionRef = doc(db, 'payments', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = { ...transactionDoc.data(), id: transactionId } as PaymentTransaction;
    
    if (transaction.status !== 'held') {
      throw new Error('Transaction is not in held status');
    }
    
    const now = new Date().toISOString();
    
    await updateDoc(transactionRef, {
      status: 'completed',
      isHeld: false,
      completedAt: now,
      updatedAt: now,
    });
    
    // Add to vendor's available balance
    if (transaction.recipientType === 'vendor') {
      await updateVendorBalance(transaction.recipientId, transaction.netAmount, 'release');
    }
    
    return { ...transaction, status: 'completed', isHeld: false, completedAt: now };
  } catch (error) {
    console.error('Error releasing held payment:', error);
    throw error;
  }
};

/**
 * Get payment transactions for a user
 */
export const getUserTransactions = async (
  userId: string,
  type?: 'sent' | 'received'
): Promise<PaymentTransaction[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    let q;
    
    if (type === 'sent') {
      q = query(paymentsRef, where('senderId', '==', userId), orderBy('createdAt', 'desc'));
    } else if (type === 'received') {
      q = query(paymentsRef, where('recipientId', '==', userId), orderBy('createdAt', 'desc'));
    } else {
      // Get both sent and received - need two queries
      const sentQuery = query(paymentsRef, where('senderId', '==', userId));
      const receivedQuery = query(paymentsRef, where('recipientId', '==', userId));
      
      const [sentDocs, receivedDocs] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery),
      ]);
      
      const transactions: PaymentTransaction[] = [];
      const seenIds = new Set<string>();
      
      sentDocs.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          transactions.push({ ...doc.data(), id: doc.id } as PaymentTransaction);
        }
      });
      
      receivedDocs.forEach((doc) => {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          transactions.push({ ...doc.data(), id: doc.id } as PaymentTransaction);
        }
      });
      
      return transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PaymentTransaction));
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

/**
 * Get vendor payment account
 */
export const getVendorPaymentAccount = async (
  vendorId: string
): Promise<VendorPaymentAccount | null> => {
  try {
    const accountRef = doc(db, 'vendorPaymentAccounts', vendorId);
    const accountDoc = await getDoc(accountRef);
    
    if (!accountDoc.exists()) {
      return null;
    }
    
    return accountDoc.data() as VendorPaymentAccount;
  } catch (error) {
    console.error('Error getting vendor payment account:', error);
    throw error;
  }
};

/**
 * Get payment summary for a user
 */
export const getPaymentSummary = async (userId: string): Promise<PaymentSummary> => {
  try {
    const transactions = await getUserTransactions(userId);
    
    let totalReceived = 0;
    let totalSent = 0;
    let pendingPayments = 0;
    let heldPayments = 0;
    
    transactions.forEach((t) => {
      if (t.recipientId === userId && t.status === 'completed') {
        totalReceived += t.netAmount;
      }
      if (t.senderId === userId && t.status === 'completed') {
        totalSent += t.amount;
      }
      if (t.status === 'pending') {
        pendingPayments += t.amount;
      }
      if (t.status === 'held') {
        heldPayments += t.amount;
      }
    });
    
    return {
      totalReceived,
      totalSent,
      pendingPayments,
      heldPayments,
      transactionCount: transactions.length,
    };
  } catch (error) {
    console.error('Error getting payment summary:', error);
    throw error;
  }
};

/**
 * Create a dispute for a transaction
 */
export const createDispute = async (
  transactionId: string,
  customerId: string,
  customerName: string,
  reason: PaymentDispute['reason'],
  description: string
): Promise<PaymentDispute> => {
  try {
    const transactionRef = doc(db, 'payments', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = transactionDoc.data() as PaymentTransaction;
    
    // Get vendor details
    const vendorDoc = await getDoc(doc(db, 'vendors', transaction.recipientId));
    const vendorData = vendorDoc.exists() ? vendorDoc.data() : {};
    
    const now = new Date().toISOString();
    
    const dispute: Omit<PaymentDispute, 'id'> = {
      transactionId,
      customerId,
      customerName,
      vendorId: transaction.recipientId,
      vendorName: vendorData.businessName || transaction.recipientName,
      reason,
      description,
      status: 'open',
      createdAt: now,
      updatedAt: now,
    };
    
    const disputeRef = await addDoc(collection(db, 'disputes'), dispute);
    
    // Update transaction status
    await updateDoc(transactionRef, {
      status: 'disputed',
      updatedAt: now,
    });
    
    return { ...dispute, id: disputeRef.id };
  } catch (error) {
    console.error('Error creating dispute:', error);
    throw error;
  }
};

/**
 * Get all disputes (admin only)
 */
export const getAllDisputes = async (): Promise<PaymentDispute[]> => {
  try {
    const disputesRef = collection(db, 'disputes');
    const q = query(disputesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PaymentDispute));
  } catch (error) {
    console.error('Error getting disputes:', error);
    throw error;
  }
};

/**
 * Resolve a dispute (admin only)
 */
export const resolveDispute = async (
  disputeId: string,
  resolution: 'resolved_customer' | 'resolved_vendor',
  refundAmount: number | undefined,
  adminId: string,
  resolutionNotes: string
): Promise<PaymentDispute> => {
  try {
    const disputeRef = doc(db, 'disputes', disputeId);
    const disputeDoc = await getDoc(disputeRef);
    
    if (!disputeDoc.exists()) {
      throw new Error('Dispute not found');
    }
    
    const dispute = { ...disputeDoc.data(), id: disputeId } as PaymentDispute;
    const now = new Date().toISOString();
    
    // If resolved in customer's favor and refund amount specified, process refund
    if (resolution === 'resolved_customer' && refundAmount && refundAmount > 0) {
      await processRefund(
        {
          transactionId: dispute.transactionId,
          amount: refundAmount,
          reason: `Dispute resolved: ${resolutionNotes}`,
          fullRefund: false,
        },
        adminId
      );
    }
    
    // Update dispute
    await updateDoc(disputeRef, {
      status: resolution,
      resolution: resolutionNotes,
      refundAmount,
      resolvedBy: adminId,
      resolvedAt: now,
      updatedAt: now,
    });
    
    return {
      ...dispute,
      status: resolution,
      resolution: resolutionNotes,
      refundAmount,
      resolvedBy: adminId,
      resolvedAt: now,
    };
  } catch (error) {
    console.error('Error resolving dispute:', error);
    throw error;
  }
};

/**
 * Get all transactions (admin only)
 */
export const getAllTransactions = async (
  limit: number = 50
): Promise<PaymentTransaction[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(paymentsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .slice(0, limit)
      .map((doc) => ({ ...doc.data(), id: doc.id } as PaymentTransaction));
  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

/**
 * Process payout to vendor (admin only)
 */
export const processVendorPayout = async (
  request: PayoutRequest,
  adminId: string
): Promise<PaymentTransaction> => {
  try {
    const account = await getVendorPaymentAccount(request.vendorId);
    
    if (!account) {
      throw new Error('Vendor payment account not found');
    }
    
    if (account.availableBalance < request.amount) {
      throw new Error('Insufficient balance for payout');
    }
    
    // Get vendor details
    const vendorDoc = await getDoc(doc(db, 'vendors', request.vendorId));
    if (!vendorDoc.exists()) {
      throw new Error('Vendor not found');
    }
    
    const vendorData = vendorDoc.data();
    const now = new Date().toISOString();
    
    // Create payout transaction
    const payoutTransaction: Omit<PaymentTransaction, 'id'> = {
      type: 'payout',
      status: 'completed',
      amount: request.amount,
      currency: 'PKR',
      fee: 0,
      netAmount: request.amount,
      
      senderId: 'platform',
      senderName: 'ShaadiSet Platform',
      senderEmail: 'payments@shaadiset.com',
      senderType: 'admin',
      
      recipientId: request.vendorId,
      recipientName: vendorData.businessName || 'Vendor',
      recipientEmail: vendorData.email || '',
      recipientType: 'vendor',
      
      method: request.method,
      
      message: `Payout processed by admin`,
      
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      
      isHeld: false,
    };
    
    const payoutRef = await addDoc(collection(db, 'payments'), payoutTransaction);
    
    // Deduct from vendor's available balance
    await updateVendorBalance(request.vendorId, request.amount, 'subtract');
    
    return { ...payoutTransaction, id: payoutRef.id };
  } catch (error) {
    console.error('Error processing vendor payout:', error);
    throw error;
  }
};


// ═══════════════════════════════════════════════════════════════
// ADMIN FUNCTIONS - For use in admin dashboard project
// ═══════════════════════════════════════════════════════════════

/**
 * Check if current user is admin
 */
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', userId));
    return adminDoc.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get transaction by ID (admin)
 */
export const getTransactionById = async (
  transactionId: string
): Promise<PaymentTransaction | null> => {
  try {
    const transactionDoc = await getDoc(doc(db, 'payments', transactionId));
    if (!transactionDoc.exists()) return null;
    return { ...transactionDoc.data(), id: transactionDoc.id } as PaymentTransaction;
  } catch (error) {
    console.error('Error getting transaction:', error);
    throw error;
  }
};

/**
 * Get all vendor payment accounts (admin)
 */
export const getAllVendorAccounts = async (): Promise<VendorPaymentAccount[]> => {
  try {
    const accountsRef = collection(db, 'vendorPaymentAccounts');
    const snapshot = await getDocs(accountsRef);
    return snapshot.docs.map((doc) => doc.data() as VendorPaymentAccount);
  } catch (error) {
    console.error('Error getting vendor accounts:', error);
    throw error;
  }
};

/**
 * Force refund - Admin takes money from vendor and refunds customer
 * Use this when vendor scams customer
 */
export const forceRefundFromVendor = async (
  transactionId: string,
  refundAmount: number,
  reason: string,
  adminId: string
): Promise<{ refundTransaction: PaymentTransaction; vendorDeducted: boolean }> => {
  try {
    const originalRef = doc(db, 'payments', transactionId);
    const originalDoc = await getDoc(originalRef);
    
    if (!originalDoc.exists()) {
      throw new Error('Original transaction not found');
    }
    
    const original = { ...originalDoc.data(), id: transactionId } as PaymentTransaction;
    
    // Validate refund amount
    const maxRefundable = original.amount - (original.refundAmount || 0);
    if (refundAmount > maxRefundable) {
      throw new Error(`Maximum refundable amount is ₨${maxRefundable}`);
    }
    
    const now = new Date().toISOString();
    
    // Create refund transaction record
    const refundTransaction: Omit<PaymentTransaction, 'id'> = {
      type: 'refund',
      status: 'completed',
      amount: refundAmount,
      currency: original.currency,
      fee: 0,
      netAmount: refundAmount,
      
      senderId: original.recipientId, // Vendor
      senderName: original.recipientName,
      senderEmail: original.recipientEmail,
      senderType: 'vendor',
      
      recipientId: original.senderId, // Customer
      recipientName: original.senderName,
      recipientEmail: original.senderEmail,
      recipientType: 'user',
      
      method: original.method,
      
      message: `Admin Refund: ${reason}`,
      originalTransactionId: transactionId,
      refundReason: reason,
      refundedBy: adminId,
      
      createdAt: now,
      updatedAt: now,
      completedAt: now,
      
      isHeld: false,
    };
    
    const refundRef = await addDoc(collection(db, 'payments'), refundTransaction);
    
    // Update original transaction
    const totalRefunded = (original.refundAmount || 0) + refundAmount;
    const newStatus = totalRefunded >= original.amount ? 'refunded' : 'partially_refunded';
    
    await updateDoc(originalRef, {
      status: newStatus,
      refundAmount: totalRefunded,
      refundReason: reason,
      refundedAt: now,
      refundedBy: adminId,
      updatedAt: now,
    });
    
    // Deduct from vendor balance
    let vendorDeducted = false;
    if (original.recipientType === 'vendor') {
      try {
        await updateVendorBalance(original.recipientId, refundAmount, 'subtract');
        vendorDeducted = true;
      } catch (e) {
        console.warn('Could not deduct from vendor balance:', e);
      }
    }
    
    return { 
      refundTransaction: { ...refundTransaction, id: refundRef.id }, 
      vendorDeducted 
    };
  } catch (error) {
    console.error('Error processing force refund:', error);
    throw error;
  }
};

/**
 * Hold vendor payment - Freeze funds pending investigation
 */
export const holdVendorPayment = async (
  transactionId: string,
  reason: string,
  adminId: string
): Promise<PaymentTransaction> => {
  try {
    const transactionRef = doc(db, 'payments', transactionId);
    const transactionDoc = await getDoc(transactionRef);
    
    if (!transactionDoc.exists()) {
      throw new Error('Transaction not found');
    }
    
    const transaction = transactionDoc.data() as PaymentTransaction;
    
    if (transaction.status !== 'completed') {
      throw new Error('Can only hold completed transactions');
    }
    
    const now = new Date().toISOString();
    
    await updateDoc(transactionRef, {
      status: 'held',
      isHeld: true,
      releaseCondition: `Admin hold: ${reason}`,
      updatedAt: now,
    });
    
    // Move from available to held balance
    if (transaction.recipientType === 'vendor') {
      await updateVendorBalance(transaction.recipientId, transaction.netAmount, 'hold');
    }
    
    return { 
      ...transaction, 
      id: transactionId, 
      status: 'held', 
      isHeld: true 
    };
  } catch (error) {
    console.error('Error holding payment:', error);
    throw error;
  }
};

/**
 * Get transactions by vendor (admin)
 */
export const getVendorTransactions = async (
  vendorId: string
): Promise<PaymentTransaction[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef, 
      where('recipientId', '==', vendorId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PaymentTransaction));
  } catch (error) {
    console.error('Error getting vendor transactions:', error);
    throw error;
  }
};

/**
 * Get transactions by customer (admin)
 */
export const getCustomerTransactions = async (
  customerId: string
): Promise<PaymentTransaction[]> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const q = query(
      paymentsRef, 
      where('senderId', '==', customerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as PaymentTransaction));
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    throw error;
  }
};

/**
 * Get payment statistics (admin dashboard)
 */
export const getPaymentStats = async (): Promise<{
  totalTransactions: number;
  totalVolume: number;
  totalFees: number;
  pendingPayments: number;
  heldPayments: number;
  disputedPayments: number;
  refundedAmount: number;
}> => {
  try {
    const paymentsRef = collection(db, 'payments');
    const snapshot = await getDocs(paymentsRef);
    
    let totalTransactions = 0;
    let totalVolume = 0;
    let totalFees = 0;
    let pendingPayments = 0;
    let heldPayments = 0;
    let disputedPayments = 0;
    let refundedAmount = 0;
    
    snapshot.docs.forEach((doc) => {
      const t = doc.data() as PaymentTransaction;
      totalTransactions++;
      totalVolume += t.amount;
      totalFees += t.fee;
      
      if (t.status === 'pending') pendingPayments += t.amount;
      if (t.status === 'held') heldPayments += t.amount;
      if (t.status === 'disputed') disputedPayments += t.amount;
      if (t.refundAmount) refundedAmount += t.refundAmount;
    });
    
    return {
      totalTransactions,
      totalVolume,
      totalFees,
      pendingPayments,
      heldPayments,
      disputedPayments,
      refundedAmount,
    };
  } catch (error) {
    console.error('Error getting payment stats:', error);
    throw error;
  }
};
