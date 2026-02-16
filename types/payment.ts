// types/payment.ts
// Payment system type definitions

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'refunded'
  | 'partially_refunded'
  | 'disputed'
  | 'held';

export type PaymentType = 
  | 'esalami'        // Gift money to couple
  | 'vendor_payment' // Payment to vendor for services
  | 'refund'         // Refund from vendor to customer
  | 'payout';        // Payout to vendor's bank

export type PaymentMethod = 
  | 'stripe'
  | 'jazzcash'
  | 'easypaisa'
  | 'bank_transfer';

export interface PaymentTransaction {
  id: string;
  type: PaymentType;
  status: PaymentStatus;
  amount: number;
  currency: string;
  fee: number;
  netAmount: number;
  
  // Sender info
  senderId: string;
  senderName: string;
  senderEmail: string;
  senderType: 'user' | 'vendor' | 'admin';
  
  // Recipient info
  recipientId: string;
  recipientName: string;
  recipientEmail: string;
  recipientType: 'user' | 'vendor';
  
  // Payment details
  method: PaymentMethod;
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripeChargeId?: string;
  
  // Metadata
  message?: string;
  bookingId?: string;
  eventId?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  refundedAt?: string;
  
  // Refund tracking
  refundAmount?: number;
  refundReason?: string;
  refundedBy?: string;
  originalTransactionId?: string;
  
  // Hold/Escrow
  isHeld: boolean;
  heldUntil?: string;
  releaseCondition?: string;
}

export interface VendorPaymentAccount {
  vendorId: string;
  stripeAccountId?: string;
  stripeAccountStatus: 'pending' | 'active' | 'restricted' | 'disabled';
  
  // Bank details (for manual payouts)
  bankName?: string;
  accountNumber?: string;
  accountTitle?: string;
  iban?: string;
  
  // Balance
  availableBalance: number;
  pendingBalance: number;
  heldBalance: number;
  totalEarnings: number;
  totalRefunds: number;
  
  // Settings
  autoPayoutEnabled: boolean;
  payoutThreshold: number;
  payoutSchedule: 'daily' | 'weekly' | 'monthly' | 'manual';
  
  createdAt: string;
  updatedAt: string;
}

export interface PaymentDispute {
  id: string;
  transactionId: string;
  
  // Parties
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  
  // Dispute details
  reason: 'scam' | 'service_not_delivered' | 'quality_issue' | 'overcharge' | 'other';
  description: string;
  evidence?: string[];
  
  // Resolution
  status: 'open' | 'under_review' | 'resolved_customer' | 'resolved_vendor' | 'closed';
  resolution?: string;
  refundAmount?: number;
  resolvedBy?: string;
  
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface PaymentSummary {
  totalReceived: number;
  totalSent: number;
  pendingPayments: number;
  heldPayments: number;
  transactionCount: number;
}

export interface CreatePaymentRequest {
  type: PaymentType;
  amount: number;
  recipientId: string;
  recipientType: 'user' | 'vendor';
  method: PaymentMethod;
  message?: string;
  bookingId?: string;
  eventId?: string;
  holdPayment?: boolean;
  holdDays?: number;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
  fullRefund: boolean;
}

export interface PayoutRequest {
  vendorId: string;
  amount: number;
  method: 'stripe' | 'bank_transfer';
}
