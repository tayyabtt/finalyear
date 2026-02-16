/* app/(tabs)/recommendations.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, getFirestore, limit, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Vendor {
  id: string;
  businessName: string;
  location: string;
  serviceType: string;
  rating: number;
  reviewCount: number;
}

const SERVICE_ICONS: Record<string, { icon: string; color: string }> = {
  'Photographer': { icon: 'camera', color: '#FFD180' },
  'Decorator': { icon: 'rose', color: '#C8E6C9' },
  'Caterer': { icon: 'restaurant', color: '#FFCDD2' },
  'Venue': { icon: 'business', color: '#B3E5FC' },
  'Makeup Artist': { icon: 'color-palette', color: '#E1BEE7' },
  'Planner': { icon: 'clipboard', color: '#B2DFDB' },
  'Mehndi Artist': { icon: 'hand-left', color: '#FFE0B2' },
  'Bridal Wear': { icon: 'woman', color: '#F8BBD9' },
  'Groom Wear': { icon: 'man', color: '#BBDEFB' },
};

export default function RecommendationsScreen() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopVendors();
  }, []);

  const fetchTopVendors = async () => {
    try {
      const db = getFirestore();
      const vendorsRef = collection(db, 'vendors');
      
      // Query top 5 vendors by rating (descending), only those with reviews
      const q = query(
        vendorsRef,
        orderBy('rating', 'desc'),
        limit(5)
      );
      
      const snapshot = await getDocs(q);
      const topVendors: Vendor[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        // Only include vendors with at least 1 review
        if (data.rating && data.rating > 0) {
          topVendors.push({
            id: doc.id,
            businessName: data.businessName || 'Unknown Business',
            location: data.location || 'Pakistan',
            serviceType: data.serviceType || 'Service Provider',
            rating: data.rating || 0,
            reviewCount: data.reviewCount || 0,
          });
        }
      });
      
      setVendors(topVendors);
    } catch (error) {
      console.error('Error fetching top vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getServiceStyle = (serviceType: string) => {
    return SERVICE_ICONS[serviceType] || { icon: 'briefcase', color: '#E0E0E0' };
  };

  const renderItem = ({ item, index }: { item: Vendor; index: number }) => {
    const style = getServiceStyle(item.serviceType);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({ pathname: '/vendor-detail', params: { vendorId: item.id } })}
        activeOpacity={0.7}
      >
        {/* Rank Badge */}
        <View style={styles.rankBadge}>
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>
        
        {/* Icon circle */}
        <View style={[styles.iconWrap, { backgroundColor: style.color }]}> 
          <Ionicons name={style.icon as any} size={28} color="#333" />
        </View>
        
        {/* Text section */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.name} numberOfLines={1}>{item.businessName}</Text>
          <Text style={styles.sub}>{item.location} • {item.serviceType}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.rateTxt}>
              {item.rating.toFixed(1)} • {item.reviewCount} {item.reviewCount === 1 ? 'review' : 'reviews'}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      </TouchableOpacity>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="trophy-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>No Rated Vendors Yet</Text>
      <Text style={styles.emptyText}>
        Be the first to book and review vendors!{'\n'}Top rated vendors will appear here.
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Rated Vendors</Text>
        <TouchableOpacity onPress={fetchTopVendors}>
          <Ionicons name="refresh" size={24} color="#e22f2f" />
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <View style={styles.subtitleContainer}>
        <Ionicons name="trophy" size={18} color="#fbbf24" />
        <Text style={styles.subtitle}>Top 5 highest rated vendors on ShaadiSet</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e22f2f" />
          <Text style={styles.loadingText}>Loading top vendors...</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={i => i.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={EmptyState}
        />
      )}
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#e22f2f' },
  subtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#fffbeb',
    borderBottomWidth: 1,
    borderColor: '#fef3c7',
  },
  subtitle: { fontSize: 13, color: '#92400e', marginLeft: 8, fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  rankBadge: {
    position: 'absolute',
    top: -6,
    left: -6,
    backgroundColor: '#e22f2f',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  rankText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  iconWrap: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#111' },
  sub: { fontSize: 12, color: '#555', marginTop: 2 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  rateTxt: { fontSize: 12, color: '#333', marginLeft: 4, fontWeight: '500' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
