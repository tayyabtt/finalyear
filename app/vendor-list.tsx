// app/vendor-list.tsx
// Shows list of vendors filtered by service type

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const db = getFirestore();

interface Vendor {
  userId: string;
  businessName: string;
  serviceType: string;
  location: string;
  phoneNumber: string;
  rating?: number;
  reviewCount?: number;
}

export default function VendorListScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const serviceType = params.serviceType as string;
  const selectedCity = params.city as string;

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendors();
  }, [serviceType, selectedCity]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      
      // Fetch from Firestore
      const vendorsRef = collection(db, 'vendors');
      const q = query(vendorsRef, where('serviceType', '==', serviceType));
      const querySnapshot = await getDocs(q);

      let vendorsList: Vendor[] = [];
      querySnapshot.forEach((doc) => {
        vendorsList.push(doc.data() as Vendor);
      });

      // Filter by city if selected
      if (selectedCity && selectedCity !== 'All Cities') {
        vendorsList = vendorsList.filter(vendor => 
          vendor.location.toLowerCase().includes(selectedCity.toLowerCase())
        );
      }

      setVendors(vendorsList);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderVendor = ({ item }: { item: Vendor }) => (
    <TouchableOpacity 
      style={styles.vendorCard} 
      activeOpacity={0.8}
      onPress={() => router.push(`/vendor-detail?vendorId=${item.userId}`)}
    >
      <View style={styles.vendorAvatar}>
        <Ionicons name="business" size={32} color="#e22f2f" />
      </View>

      <View style={styles.vendorInfo}>
        <Text style={styles.vendorName}>{item.businessName}</Text>
        <Text style={styles.vendorLocation}>
          <Ionicons name="location" size={14} color="#666" /> {item.location}
        </Text>

        <View style={styles.vendorMeta}>
          <View style={styles.rating}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {item.rating?.toFixed(1) || '5.0'} ({item.reviewCount || 0})
            </Text>
          </View>
          <Text style={styles.serviceType}>{item.serviceType}</Text>
        </View>
      </View>

      <View style={styles.arrowIcon}>
        <Ionicons name="chevron-forward" size={24} color="#ccc" />
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No vendors found</Text>
      <Text style={styles.emptySubtitle}>
        No {serviceType} vendors available yet
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{serviceType}</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#e22f2f" />
        </TouchableOpacity>
      </View>

      {/* Vendor List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e22f2f" />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.userId}
          renderItem={renderVendor}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  vendorCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vendorAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffe4e6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  vendorLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  vendorMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  serviceType: {
    fontSize: 12,
    color: '#e22f2f',
    fontWeight: '600',
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  arrowIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
});
