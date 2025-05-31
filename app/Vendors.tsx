// app/vendors.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const categories = [
  {
    id: '1',
    title: 'Venues',
    subtitle: 'Banquet Halls, Marriage gardenn',
    color: '#B3E5FC',
    image: require('../assets/images/venues.jpg'),
  },
  {
    id: '2',
    title: 'Photographers',
    subtitle: 'Photographers',
    color: '#FFD180',
    image: require('../assets/images/photographer.jpg'),
  },
  {
    id: '3',
    title: 'Makeup',
    subtitle: 'Bridal Makeup, Family Makeup',
    color: '#E1BEE7',
    image: require('../assets/images/makeup2.jpg'),
  },
  {
    id: '4',
    title: 'Pre Wedding Shoot',
    subtitle: 'Pre Wedding Shoot Location',
    color: '#C8E6C9',
    image: require('../assets/images/prewedding.jpg'),
  },
  {
    id: '5',
    title: 'Planning & Decor',
    subtitle: 'Wedding planners, Decoration',
    color: '#FFE0B2',
    image: require('../assets/images/decor2.jpg'),
  },
  {
    id: '6',
    title: 'Bridal Wear',
    subtitle: 'Bridal Lehengas, Sahries',
    color: '#F8BBD0',
    image: require('../assets/images/bridalwear.jpg'),
  },
  {
    id: '7',
    title: 'Groom Wear',
    subtitle: 'Sherwani, Wedding Suits',
    color: '#FFCDD2',
    image: require('../assets/images/groomwear.jpg'),
  },
  {
    id: '8',
    title: 'Mehndi',
    subtitle: 'Mehndi Artist',
    color: '#FFECB3',
    image: require('../assets/images/mehndi.jpg'),
  },
];

export default function VendorsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[styles.itemContainer, { backgroundColor: item.color }]}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </View>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
      <Image source={item.image} style={styles.imagePlaceholder} />
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header with back arrow */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendors</Text>
        <View style={{ width: 28 }} /> {/* Placeholder for alignment */}
      </View>

      {/* List of categories */}
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#e22f2f',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  textContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#555',
    marginTop: 4,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
});
