/* eslint-disable react-native/no-inline-styles */
// components/ReviewPopup.tsx - Post-booking review popup

import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, getFirestore, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface ReviewPopupProps {
  visible: boolean;
  onClose: () => void;
  booking: {
    id: string;
    vendorId: string;
    vendorName: string;
    serviceType: string;
    eventDate: string;
  };
  userId: string;
  userName: string;
}

export default function ReviewPopup({ visible, onClose, booking, userId, userName }: ReviewPopupProps) {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Rating Required', 'Please select a star rating');
    if (!review.trim()) return Alert.alert('Review Required', 'Please write a short review');

    setLoading(true);
    try {
      // Save review to Firestore
      await addDoc(collection(db, 'reviews'), {
        vendorId: booking.vendorId,
        vendorName: booking.vendorName,
        userId,
        userName,
        bookingId: booking.id,
        serviceType: booking.serviceType,
        rating,
        review: review.trim(),
        createdAt: new Date().toISOString(),
      });

      // Update vendor's average rating
      const vendorRef = doc(db, 'vendors', booking.vendorId);
      const vendorDoc = await getDoc(vendorRef);
      if (vendorDoc.exists()) {
        const data = vendorDoc.data();
        const currentRating = data.rating || 0;
        const reviewCount = data.reviewCount || 0;
        const newCount = reviewCount + 1;
        const newRating = ((currentRating * reviewCount) + rating) / newCount;
        await updateDoc(vendorRef, { rating: newRating, reviewCount: newCount });
      }

      // Mark booking as reviewed
      await updateDoc(doc(db, 'bookings', booking.id), { reviewed: true, reviewedAt: new Date().toISOString() });

      Alert.alert('Thank You! 🎉', 'Your review has been submitted successfully!');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateDoc(doc(db, 'bookings', booking.id), { reviewSkipped: true });
    } catch (e) { console.error(e); }
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.emoji}>⭐</Text>
            <Text style={styles.title}>How was your experience?</Text>
            <Text style={styles.subtitle}>Rate your experience with {booking.vendorName}</Text>
          </View>

          <View style={styles.serviceInfo}>
            <Ionicons name="briefcase-outline" size={16} color="#7c26ff" />
            <Text style={styles.serviceText}>{booking.serviceType}</Text>
            <Text style={styles.dateText}>{new Date(booking.eventDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
          </View>

          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
                <Ionicons name={star <= rating ? 'star' : 'star-outline'} size={40} color={star <= rating ? '#fbbf24' : '#d1d5db'} />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating === 0 ? 'Tap to rate' : rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent!'}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Write your review here..."
            placeholderTextColor="#9ca3af"
            value={review}
            onChangeText={setReview}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <TouchableOpacity style={[styles.submitBtn, (loading || rating === 0) && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading || rating === 0}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Review</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
            <Text style={styles.skipText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  container: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 360 },
  header: { alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', marginTop: 4, textAlign: 'center' },
  serviceInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 20 },
  serviceText: { fontSize: 14, color: '#7c26ff', fontWeight: '600', marginLeft: 6 },
  dateText: { fontSize: 12, color: '#94a3b8', marginLeft: 8 },
  starsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingText: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 15, color: '#1e293b', minHeight: 100, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 },
  submitBtn: { backgroundColor: '#7c26ff', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn: { paddingVertical: 12, alignItems: 'center' },
  skipText: { color: '#94a3b8', fontSize: 14 },
});
