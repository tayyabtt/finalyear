// app/vendor-detail.tsx
// Vendor detail screen with booking and chat options

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import { useAuth } from '../contexts/AuthContext';
import { createBooking, createNotification, getOrCreateChat } from '../utils/bookings';
import { getVendorProfile, VendorProfile } from '../utils/firestore';

export default function VendorDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const vendorId = params.vendorId as string;
  const { user } = useAuth();

  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [eventDate, setEventDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadVendor();
  }, [vendorId]);

  const loadVendor = async () => {
    const vendorData = await getVendorProfile(vendorId);
    setVendor(vendorData);
  };

  const handleBookNow = () => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to book this vendor');
      return;
    }
    setBookingModalVisible(true);
  };

  const handleSubmitBooking = async () => {
    if (!user || !vendor) return;

    if (!message.trim()) {
      Alert.alert('Message Required', 'Please add a message for the vendor');
      return;
    }

    setLoading(true);

    try {
      const booking = {
        id: Date.now().toString(),
        userId: user.uid,
        userName: user.email?.split('@')[0] || 'User',
        userEmail: user.email || '',
        vendorId: vendor.userId,
        vendorName: vendor.businessName,
        serviceType: vendor.serviceType,
        eventDate: eventDate.toISOString(),
        message: message.trim(),
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      await createBooking(booking);

      // Create notification for vendor
      await createNotification({
        id: Date.now().toString(),
        recipientId: vendor.userId,
        type: 'booking',
        title: 'New Booking Request',
        message: `${booking.userName} wants to book your ${vendor.serviceType} service`,
        bookingId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(
        'Booking Sent!',
        'Your booking request has been sent to the vendor. They will respond soon.',
        [{ text: 'OK', onPress: () => setBookingModalVisible(false) }]
      );

      setMessage('');
    } catch (error) {
      Alert.alert('Error', 'Failed to send booking request');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!user || !vendor) {
      Alert.alert('Error', 'User or vendor information missing');
      return;
    }

    try {
      console.log('Creating chat for:', user.uid, vendor.userId);
      const chat = await getOrCreateChat(
        user.uid,
        vendor.userId,
        user.email?.split('@')[0] || 'User',
        vendor.businessName
      );
      
      console.log('Chat created:', chat);
      
      // Use router.push with proper path
      router.push({
        pathname: '/chat',
        params: {
          chatId: chat.id,
          vendorName: vendor.businessName
        }
      });
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to open chat: ' + (error as Error).message);
    }
  };

  if (!vendor) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendor Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Vendor Card */}
        <View style={styles.vendorCard}>
          <View style={styles.vendorAvatar}>
            <Ionicons name="business" size={60} color="#e22f2f" />
          </View>

          <Text style={styles.businessName}>{vendor.businessName}</Text>
          <Text style={styles.serviceType}>{vendor.serviceType}</Text>

          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {vendor.rating?.toFixed(1) || '5.0'} ({vendor.reviewCount || 0} reviews)
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="location" size={20} color="#666" />
            <Text style={styles.infoText}>{vendor.location}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color="#666" />
            <Text style={styles.infoText}>{vendor.phoneNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={20} color="#666" />
            <Text style={styles.infoText}>{vendor.email}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
            <Ionicons name="calendar" size={20} color="#fff" />
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.chatButton} onPress={handleChat}>
            <Ionicons name="chatbubbles" size={20} color="#e22f2f" />
            <Text style={styles.chatButtonText}>Chat</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        isVisible={bookingModalVisible}
        onBackdropPress={() => setBookingModalVisible(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Book {vendor.businessName}</Text>

          <Text style={styles.label}>Event Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#666" />
            <Text style={styles.dateText}>{eventDate.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={eventDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setEventDate(date);
              }}
            />
          )}

          <Text style={styles.label}>Message to Vendor</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Tell the vendor about your event..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setBookingModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, loading && { opacity: 0.6 }]}
              onPress={handleSubmitBooking}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Sending...' : 'Send Request'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  vendorCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 16,
  },
  vendorAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  serviceType: {
    fontSize: 16,
    color: '#e22f2f',
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e22f2f',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e22f2f',
  },
  chatButtonText: {
    color: '#e22f2f',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  dateText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 12,
  },
  messageInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#e22f2f',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
