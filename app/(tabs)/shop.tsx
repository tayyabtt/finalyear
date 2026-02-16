/* eslint-disable react-native/no-inline-styles */
// app/(tabs)/shop.tsx - Browse Vendors by Category
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Vendor {
  id: string;
  businessName: string;
  serviceType: string;
  location: string;
  rating: number;
  reviewCount: number;
  phoneNumber?: string;
}

interface CategoryData {
  name: string;
  icon: string;
  color: string;
  vendors: Vendor[];
}

const CATEGORIES: { [key: string]: { icon: string; color: string } } = {
  'Photographer': { icon: 'camera', color: '#f59e0b' },
  'Decorator': { icon: 'rose', color: '#ec4899' },
  'Caterer': { icon: 'restaurant', color: '#ef4444' },
  'Venue': { icon: 'business', color: '#8b5cf6' },
  'Makeup Artist': { icon: 'color-palette', color: '#f472b6' },
  'Planner': { icon: 'clipboard', color: '#06b6d4' },
  'Mehndi Artist': { icon: 'hand-left', color: '#f97316' },
  'Bridal Wear': { icon: 'woman', color: '#e11d48' },
  'Groom Wear': { icon: 'man', color: '#3b82f6' },
};

export default function ShopScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const db = getFirestore();
      const vendorsRef = collection(db, 'vendors');
      const snapshot = await getDocs(vendorsRef);
      
      const vendorsByCategory: { [key: string]: Vendor[] } = {};
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const serviceType = data.serviceType || 'Other';
        
        if (!vendorsByCategory[serviceType]) {
          vendorsByCategory[serviceType] = [];
        }
        
        vendorsByCategory[serviceType].push({
          id: doc.id,
          businessName: data.businessName || 'Unknown',
          serviceType: serviceType,
          location: data.location || 'Pakistan',
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          phoneNumber: data.phoneNumber,
        });
      });
      
      // Sort vendors within each category by rating
      const categoryList: CategoryData[] = Object.keys(vendorsByCategory)
        .map(name => ({
          name,
          icon: CATEGORIES[name]?.icon || 'briefcase',
          color: CATEGORIES[name]?.color || '#64748b',
          vendors: vendorsByCategory[name].sort((a, b) => b.rating - a.rating),
        }))
        .sort((a, b) => b.vendors.length - a.vendors.length);
      
      setCategories(categoryList);
    } catch (error) {
      console.error('Error loading vendors:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredCategories = categories.map(cat => ({
    ...cat,
    vendors: cat.vendors.filter(v =>
      v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(cat => cat.vendors.length > 0);

  const displayCategories = selectedCategory
    ? filteredCategories.filter(c => c.name === selectedCategory)
    : filteredCategories;

  const totalVendors = categories.reduce((sum, c) => sum + c.vendors.length, 0);

  const VendorCard = ({ vendor }: { vendor: Vendor }) => {
    const catStyle = CATEGORIES[vendor.serviceType] || { icon: 'briefcase', color: '#64748b' };
    
    return (
      <TouchableOpacity
        style={styles.vendorCard}
        onPress={() => router.push({ pathname: '/vendor-detail', params: { vendorId: vendor.id } })}
        activeOpacity={0.7}
      >
        <View style={[styles.vendorIcon, { backgroundColor: catStyle.color + '20' }]}>
          <Ionicons name={catStyle.icon as any} size={24} color={catStyle.color} />
        </View>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName} numberOfLines={1}>{vendor.businessName}</Text>
          <View style={styles.vendorMeta}>
            <Ionicons name="location-outline" size={12} color="#64748b" />
            <Text style={styles.vendorLocation}>{vendor.location}</Text>
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.ratingText}>
              {vendor.rating > 0 ? vendor.rating.toFixed(1) : 'New'} 
              {vendor.reviewCount > 0 && ` (${vendor.reviewCount})`}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
      </TouchableOpacity>
    );
  };

  const CategorySection = ({ category }: { category: CategoryData }) => (
    <View style={styles.categorySection}>
      <View style={styles.categoryHeader}>
        <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
          <Ionicons name={category.icon as any} size={20} color={category.color} />
        </View>
        <Text style={styles.categoryTitle}>{category.name}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{category.vendors.length}</Text>
        </View>
      </View>
      {category.vendors.map(vendor => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#e22f2f', '#ff6b6b']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Browse Vendors</Text>
        <View style={{ width: 26 }} />
      </LinearGradient>

      {/* Stats */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalVendors}</Text>
          <Text style={styles.statLabel}>Total Vendors</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#94a3b8" />
        <TextInput
          placeholder="Search vendors by name or city..."
          placeholderTextColor="#94a3b8"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#94a3b8" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Pills */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterPill, !selectedCategory && styles.filterPillActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.filterText, !selectedCategory && styles.filterTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.name}
            style={[styles.filterPill, selectedCategory === cat.name && styles.filterPillActive]}
            onPress={() => setSelectedCategory(selectedCategory === cat.name ? null : cat.name)}
          >
            <Ionicons 
              name={cat.icon as any} 
              size={14} 
              color={selectedCategory === cat.name ? '#fff' : cat.color} 
            />
            <Text style={[styles.filterText, selectedCategory === cat.name && styles.filterTextActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e22f2f" />
          <Text style={styles.loadingText}>Loading vendors...</Text>
        </View>
      ) : displayCategories.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyTitle}>No Vendors Found</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 'Try a different search term' : 'No vendors available yet'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayCategories}
          keyExtractor={c => c.name}
          renderItem={({ item }) => <CategorySection category={item} />}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadVendors(); }} tintColor="#e22f2f" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 16, paddingTop: 52,
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statsBar: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800', color: '#e22f2f' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#e5e7eb' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 14,
    backgroundColor: '#fff', borderRadius: 14, paddingHorizontal: 14, height: 50,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1e293b' },
  filterScroll: { marginTop: 14, maxHeight: 50 },
  filterContent: { paddingHorizontal: 16, gap: 8 },
  filterPill: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 6,
    borderWidth: 1, borderColor: '#e5e7eb',
  },
  filterPillActive: { backgroundColor: '#e22f2f', borderColor: '#e22f2f' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  filterTextActive: { color: '#fff' },
  categorySection: { marginBottom: 24 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  categoryIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  categoryTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginLeft: 10, flex: 1 },
  countBadge: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 13, fontWeight: '700', color: '#64748b' },
  vendorCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 14, borderRadius: 14, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  vendorIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  vendorInfo: { flex: 1, marginLeft: 12 },
  vendorName: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  vendorMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  vendorLocation: { fontSize: 13, color: '#64748b' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  ratingText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 15, color: '#64748b' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#475569', marginTop: 16 },
  emptyText: { fontSize: 15, color: '#94a3b8', marginTop: 8, textAlign: 'center' },
});
