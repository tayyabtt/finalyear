/* eslint-disable react-native/no-inline-styles */
// app/(tabs)/review.tsx – Write a Review screen with real bookings
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { addDoc, collection, doc, getDoc, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

interface PastBooking {
  id: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  reviewed: boolean;
  reviewedAt?: string;
}

export default function ReviewScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [pastBookings, setPastBookings] = useState<PastBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Review modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<PastBooking | null>(null);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPastBookings();
  }, [user]);

  const loadPastBookings = async () => {
    if (!user) {
      setPastBookings([]);
      setLoading(false);
      return;
    }

    try {
      const db = getFirestore();
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      const snapshot = await getDocs(q);
      const now = new Date();
      const past: PastBooking[] = [];
      
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        const eventDate = new Date(data.eventDate);
        
        // Only include bookings where event date has passed
        if (eventDate < now) {
          past.push({
            id: docSnap.id,
            vendorId: data.vendorId,
            vendorName: data.vendorName || 'Vendor',
            serviceType: data.serviceType || 'Service',
            eventDate: data.eventDate,
            reviewed: data.reviewed || false,
            reviewedAt: data.reviewedAt,
          });
        }
      });
      
      // Sort: unreviewed first, then by date (newest first)
      past.sort((a, b) => {
        if (a.reviewed !== b.reviewed) return a.reviewed ? 1 : -1;
        return new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();
      });
      
      setPastBookings(past);
    } catch (error) {
      console.error('Error loading past bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openReviewForm = (booking: PastBooking) => {
    if (booking.reviewed) {
      Alert.alert('Already Reviewed', 'You have already submitted a review for this vendor.');
      return;
    }
    setSelected(booking);
    setStars(0);
    setComment('');
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selected || !user || stars === 0) return;
    
    setSubmitting(true);
    try {
      const db = getFirestore();
      
      // Save review to Firestore
      await addDoc(collection(db, 'reviews'), {
        vendorId: selected.vendorId,
        vendorName: selected.vendorName,
        userId: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || 'User',
        bookingId: selected.id,
        serviceType: selected.serviceType,
        rating: stars,
        review: comment.trim(),
        createdAt: new Date().toISOString(),
      });

      // Update vendor's average rating
      const vendorRef = doc(db, 'vendors', selected.vendorId);
      const vendorDoc = await getDoc(vendorRef);
      if (vendorDoc.exists()) {
        const data = vendorDoc.data();
        const currentRating = data.rating || 0;
        const reviewCount = data.reviewCount || 0;
        const newCount = reviewCount + 1;
        const newRating = ((currentRating * reviewCount) + stars) / newCount;
        await updateDoc(vendorRef, { rating: newRating, reviewCount: newCount });
      }

      // Mark booking as reviewed
      await updateDoc(doc(db, 'bookings', selected.id), { 
        reviewed: true, 
        reviewedAt: new Date().toISOString() 
      });

      Alert.alert('Thank You! 🎉', 'Your review has been submitted successfully!');
      setModalOpen(false);
      loadPastBookings(); // Refresh list
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewedCount = pastBookings.filter(b => b.reviewed).length;
  const pendingCount = pastBookings.filter(b => !b.reviewed).length;

  const renderBooking = ({ item }: { item: PastBooking }) => {
    const eventDate = new Date(item.eventDate);
    const formattedDate = eventDate.toLocaleDateString('en-PK', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });

    return (
      <TouchableOpacity 
        style={[styles.card, item.reviewed && styles.cardReviewed]} 
        activeOpacity={0.7} 
        onPress={() => openReviewForm(item)}
      >
        <View style={[styles.avatar, item.reviewed && { backgroundColor: '#10b981' }]}>
          <Ionicons name={item.reviewed ? 'checkmark' : 'business'} size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.vendorName}</Text>
          <Text style={styles.service}>{item.serviceType}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        {item.reviewed ? (
          <View style={styles.reviewedBadge}>
            <Ionicons name="star" size={12} color="#10b981" />
            <Text style={styles.reviewedText}>Reviewed</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>Write Review</Text>
            <Ionicons name="chevron-forward" size={16} color="#e22f2f" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <LinearGradient colors={['#e22f2f', '#ff6b6b']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); loadPastBookings(); }}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Summary */}
      {pastBookings.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{pastBookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#ef4444' }]}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: '#10b981' }]}>{reviewedCount}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#e22f2f" />
          <Text style={styles.loadingText}>Loading past bookings...</Text>
        </View>
      ) : pastBookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="star-outline" size={60} color="#ccc" />
          <Text style={styles.emptyTitle}>No Past Bookings</Text>
          <Text style={styles.emptyText}>
            Once your booked events are completed,{'\n'}you can write reviews for vendors here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pastBookings}
          keyExtractor={i => i.id}
          renderItem={renderBooking}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadPastBookings} tintColor="#e22f2f" />
          }
        />
      )}

      {/* Review Modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Rate {selected?.vendorName}</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.sheetService}>{selected?.serviceType}</Text>

            {/* Stars */}
            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map(i => (
                <TouchableOpacity key={i} onPress={() => setStars(i)} style={styles.starBtn}>
                  <Ionicons
                    name={i <= stars ? 'star' : 'star-outline'}
                    size={36}
                    color={i <= stars ? '#fbbf24' : '#d1d5db'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {stars === 0 ? 'Tap to rate' : 
               stars === 1 ? 'Poor' : 
               stars === 2 ? 'Fair' : 
               stars === 3 ? 'Good' : 
               stars === 4 ? 'Very Good' : 'Excellent!'}
            </Text>

            {/* Comment */}
            <TextInput
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience with this vendor..."
              placeholderTextColor="#9ca3af"
              style={styles.commentBox}
              textAlignVertical="top"
            />

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { opacity: stars && !submitting ? 1 : 0.5 }]}
                disabled={!stars || submitting}
                onPress={handleSubmit}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Review</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },

  // Stats
  statsContainer: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },

  // Cards
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.05,
    shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  cardReviewed: { backgroundColor: '#f0fdf4' },
  avatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#e22f2f',
    justifyContent: 'center', alignItems: 'center', marginRight: 14,
  },
  name: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  service: { fontSize: 13, color: '#64748b', marginTop: 2 },
  date: { fontSize: 12, color: '#94a3b8', marginTop: 4 },
  reviewedBadge: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#dcfce7',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12,
  },
  reviewedText: { fontSize: 12, color: '#10b981', fontWeight: '600', marginLeft: 4 },
  pendingBadge: { flexDirection: 'row', alignItems: 'center' },
  pendingText: { fontSize: 13, color: '#e22f2f', fontWeight: '600', marginRight: 4 },

  // Empty state
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 8, lineHeight: 20 },

  // Modal
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b' },
  sheetService: { fontSize: 14, color: '#64748b', marginBottom: 20 },
  starRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 8 },
  starBtn: { padding: 4 },
  ratingLabel: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 20 },
  commentBox: {
    minHeight: 100, backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e5e7eb',
    borderRadius: 12, padding: 14, fontSize: 15, color: '#333',
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn: {
    flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center',
  },
  cancelBtnText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  submitBtn: {
    flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#e22f2f', alignItems: 'center',
  },
  submitBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});
