// app/(tabs)/bookings.tsx – Real Booking Manager from Firestore
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, getUserBookings } from '../../utils/bookings';

const badgeColors = (s: string) =>
  s === 'accepted' ? { bg: '#c8e6c9', txt: '#256029' } :
  s === 'pending'  ? { bg: '#fff3cd', txt: '#7c4d00' } :
                     { bg: '#f8d7da', txt: '#842029' };

const formatStatus = (s: string) =>
  s === 'accepted' ? 'Confirmed' :
  s === 'pending'  ? 'Pending' :
                     'Declined';

export default function BookingScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [list, setList] = useState<Booking[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
    // Refresh every 10 seconds
    const interval = setInterval(loadBookings, 10000);
    return () => clearInterval(interval);
  }, [user]);

  const loadBookings = async () => {
    if (!user) {
      setList([]);
      setLoading(false);
      return;
    }

    try {
      const bookings = await getUserBookings(user.uid);
      setList(bookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter(b =>
    `${b.vendorName} ${b.serviceType}`.toLowerCase().includes(query.toLowerCase())
  );

  const Card = ({ item }: { item: Booking }) => {
    const c = badgeColors(item.status);
    const eventDate = new Date(item.eventDate).toLocaleDateString();
    
    return (
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="business-center" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendor}>{item.vendorName}</Text>
          <Text style={styles.service}>{item.serviceType}</Text>
          <Text style={styles.date}>Event: {eventDate}</Text>
          {item.message && (
            <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
          )}
        </View>
        <View style={[styles.badge, { backgroundColor: c.bg }]}> 
          <Text style={[styles.badgeTxt, { color: c.txt }]}>{formatStatus(item.status)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* header */}
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={loadBookings}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search vendor or service"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading bookings...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="calendar-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>
            {query ? 'No bookings match your search' : 'Book a vendor to see your bookings here'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={Card}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      )}
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e22f2f', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    shadowColor: '#e22f2f', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 14, height: 42,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },

  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e22f2f', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  vendor:  { fontSize: 16, fontWeight: '600', color: '#333' },
  service: { fontSize: 14, color: '#555', marginTop: 2 },
  date:    { fontSize: 12, color: '#888', marginTop: 4 },
  message: { fontSize: 12, color: '#666', marginTop: 6, fontStyle: 'italic' },

  badge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  badgeTxt: { fontSize: 11, fontWeight: '600' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
});
