// hooks/usePendingReviews.ts
// Hook to check for bookings that need reviews after event date passed

import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface PendingReviewBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
}

export function usePendingReviews(userId: string | undefined) {
  const [pendingReview, setPendingReview] = useState<PendingReviewBooking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    checkPendingReviews();
  }, [userId]);

  const checkPendingReviews = async () => {
    if (!userId) return;
    
    try {
      const db = getFirestore();
      const bookingsRef = collection(db, 'bookings');
      
      // Get user's accepted bookings that haven't been reviewed
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        where('status', '==', 'accepted')
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      
      for (const doc of snapshot.docs) {
        const booking = doc.data();
        const eventDate = new Date(booking.eventDate);
        
        // Check if event date has passed and not yet reviewed
        if (eventDate < now && !booking.reviewed && !booking.reviewSkipped) {
          setPendingReview({
            id: doc.id,
            vendorId: booking.vendorId,
            vendorName: booking.vendorName,
            serviceType: booking.serviceType,
            eventDate: booking.eventDate,
          });
          break; // Only show one at a time
        }
      }
    } catch (error) {
      console.error('Error checking pending reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearPendingReview = () => {
    setPendingReview(null);
  };

  const refreshPendingReviews = () => {
    checkPendingReviews();
  };

  return { pendingReview, loading, clearPendingReview, refreshPendingReviews };
}
