// app/(vendor)/requests-new.tsx
// Vendor Requests screen with real bookings

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, createNotification, getVendorBookings, updateBookingStatus } from '../../utils/bookings';

const { width } = Dimensions.get('window');

const RequestCard = ({ 
  item, 
  showActions, 
  onAccept, 
  onDecline 
}: { 
  item: Booking; 
  showActions: boolean;
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
}) => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={24} color="#7c26ff" />
      </View>
      <View style={styles.requestInfo}>
        <Text style={styles.userName}>{item.userName}</Text>
        <Text style={styles.service}>{item.serviceType}</Text>
      </View>
    </View>

    <View style={styles.requestDetails}>
      <View style={styles.detailRow}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.detailText}>
          {new Date(item.eventDate).toDateString()}
        </Text>
      </View>
      <View style={styles.detailRow}>
        <Ionicons name="mail-outline" size={16} color="#666" />
        <Text style={styles.detailText}>{item.userEmail}</Text>
      </View>
    </View>

    <Text style={styles.message} numberOfLines={2}>{item.message}</Text>

    {showActions && (
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.acceptBtn]}
          onPress={() => onAccept?.(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.declineBtn]}
          onPress={() => onDecline?.(item.id)}
        >
          <Ionicons name="close" size={20} color="#fff" />
          <Text style={styles.actionBtnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.emptyContainer}>
    <Ionicons name="mail-open-outline" size={80} color="#ccc" />
    <Text style={styles.emptyText}>{message}</Text>
  </View>
);

export default function RequestsScreen() {
  const { user } = useAuth();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'pending', title: 'Pending' },
    { key: 'accepted', title: 'Accepted' },
    { key: 'declined', title: 'Declined' },
  ]);

  const [pendingRequests, setPendingRequests] = useState<Booking[]>([]);
  const [acceptedRequests, setAcceptedRequests] = useState<Booking[]>([]);
  const [declinedRequests, setDeclinedRequests] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadBookings();
    }, [user])
  );

  const loadBookings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const bookings = await getVendorBookings(user.uid);
      
      setPendingRequests(bookings.filter(b => b.status === 'pending'));
      setAcceptedRequests(bookings.filter(b => b.status === 'accepted'));
      setDeclinedRequests(bookings.filter(b => b.status === 'declined'));
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      const booking = pendingRequests.find(b => b.id === bookingId);
      if (!booking) {
        console.log('Booking not found in pending requests');
        return;
      }

      console.log('Accepting booking:', bookingId);

      // Update in Firestore first
      await updateBookingStatus(bookingId, 'accepted');
      console.log('Firestore updated successfully');
      
      // Update UI after successful Firestore update
      setPendingRequests(prev => prev.filter(b => b.id !== bookingId));
      setAcceptedRequests(prev => [...prev, { ...booking, status: 'accepted' }]);
      
      // Send notification
      await createNotification({
        id: Date.now().toString(),
        recipientId: booking.userId,
        type: 'status_update',
        title: 'Booking Accepted',
        message: `${booking.vendorName} has accepted your booking request!`,
        bookingId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Booking accepted!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      Alert.alert('Error', `Failed to accept booking: ${error}`);
      // Reload on error
      loadBookings();
    }
  };

  const handleDecline = async (bookingId: string) => {
    try {
      const booking = pendingRequests.find(b => b.id === bookingId);
      if (!booking) {
        console.log('Booking not found in pending requests');
        return;
      }

      console.log('Declining booking:', bookingId);

      // Update in Firestore first
      await updateBookingStatus(bookingId, 'declined');
      console.log('Firestore updated successfully');
      
      // Update UI after successful Firestore update
      setPendingRequests(prev => prev.filter(b => b.id !== bookingId));
      setDeclinedRequests(prev => [...prev, { ...booking, status: 'declined' }]);
      
      // Send notification
      await createNotification({
        id: Date.now().toString(),
        recipientId: booking.userId,
        type: 'status_update',
        title: 'Booking Declined',
        message: `${booking.vendorName} has declined your booking request.`,
        bookingId: booking.id,
        read: false,
        createdAt: new Date().toISOString(),
      });
      
      Alert.alert('Success', 'Booking declined');
    } catch (error) {
      console.error('Error declining booking:', error);
      Alert.alert('Error', `Failed to decline booking: ${error}`);
      // Reload on error
      loadBookings();
    }
  };

  const PendingRoute = () => (
    <FlatList
      data={pendingRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <RequestCard 
          item={item} 
          showActions={true}
          onAccept={handleAccept}
          onDecline={handleDecline}
        />
      )}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<EmptyState message="No pending requests" />}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={loadBookings}
    />
  );

  const AcceptedRoute = () => (
    <FlatList
      data={acceptedRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RequestCard item={item} showActions={false} />}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<EmptyState message="No accepted requests" />}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={loadBookings}
    />
  );

  const DeclinedRoute = () => (
    <FlatList
      data={declinedRequests}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <RequestCard item={item} showActions={false} />}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<EmptyState message="No declined requests" />}
      showsVerticalScrollIndicator={false}
      refreshing={loading}
      onRefresh={loadBookings}
    />
  );

  const renderScene = SceneMap({
    pending: PendingRoute,
    accepted: AcceptedRoute,
    declined: DeclinedRoute,
  });

  const renderTabBar = (props: any) => (
    <View style={styles.tabBar}>
      {props.navigationState.routes.map((route: any, i: number) => (
        <TouchableOpacity
          key={route.key}
          style={[styles.tabItem, index === i && styles.tabItemActive]}
          onPress={() => setIndex(i)}
        >
          <Text style={[styles.tabText, index === i && styles.tabTextActive]}>
            {route.title}
          </Text>
          {i === 0 && pendingRequests.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{pendingRequests.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Requests</Text>
        <TouchableOpacity onPress={loadBookings}>
          <Ionicons name="refresh" size={24} color="#7c26ff" />
        </TouchableOpacity>
      </View>

      {/* Tab View */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabItemActive: {
    borderBottomColor: '#7c26ff',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#7c26ff',
  },
  tabBadge: {
    backgroundColor: '#e22f2f',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  service: {
    fontSize: 14,
    color: '#7c26ff',
    fontWeight: '600',
  },
  requestDetails: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  message: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
  },
  acceptBtn: {
    backgroundColor: '#10b981',
  },
  declineBtn: {
    backgroundColor: '#e22f2f',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
  },
});
