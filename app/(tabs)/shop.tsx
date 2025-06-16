/* app/(tabs)/shop.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── categories (icon‑only, no images) ───────── */
const categories = [
  { id: 'outfit',   label: 'Outfits',      icon: 'shirt' },
  { id: 'decor',    label: 'Décor',        icon: 'rose' },
  { id: 'favors',   label: 'Favors',       icon: 'gift' },
  { id: 'digital',  label: 'Digital',      icon: 'sparkles' },
];

/* ───────── dummy products ───────── */
const products = [
  { id: 'p1', name: 'Red Bridal Lehenga (Rent)',      price: 85000,  category: 'outfit',  rating: 4.9 },
  { id: 'p2', name: 'Golden Sherwani',                price: 65000,  category: 'outfit',  rating: 4.7 },
  { id: 'p3', name: 'Floral Stage Backdrop',          price: 40000,  category: 'decor',   rating: 4.8 },
  { id: 'p4', name: 'LED Dance Floor – 16×16',        price: 30000,  category: 'decor',   rating: 4.6 },
  { id: 'p5', name: 'Custom Mithai Boxes (50 pcs)',   price: 12000,  category: 'favors',  rating: 4.5 },
  { id: 'p6', name: 'Scented Candle Favours (100)',   price: 15000,  category: 'favors',  rating: 4.4 },
  { id: 'p7', name: 'Premium E‑Invite Template',      price: 3500,   category: 'digital', rating: 4.9 },
  { id: 'p8', name: 'Instagram Story Sticker Pack',   price: 1800,   category: 'digital', rating: 4.3 },
];

export default function ShopScreen() {
  const router      = useRouter();
  const navigation  = useNavigation();
  const [cat, setCat] = useState<string>('outfit');
  const [cart, setCart] = useState<number>(0);

  /* back navigation → Home */
  useEffect(() => {
    const goHome = () => { router.replace('/home'); return true; };
    const hw = BackHandler.addEventListener('hardwareBackPress', goHome);
    const gest = navigation.addListener('beforeRemove', e => { e.preventDefault(); goHome(); });
    return () => { hw.remove(); gest(); };
  }, [navigation, router]);

  /* helpers */
  const addToCart = () => setCart(c => c + 1);
  const filtered = products.filter(p => p.category === cat);

  /* render */
  const renderProduct = ({ item }: { item: typeof products[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardIconWrap}>
        <Ionicons name="pricetag" size={24} color="#fff" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardName}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#ffd700" />
          <Text style={styles.ratingTxt}>{item.rating}</Text>
        </View>
        <Text style={styles.price}>₨ {item.price.toLocaleString()}</Text>
      </View>
      <TouchableOpacity style={styles.addBtn} onPress={addToCart}>
        <Ionicons name="add" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  const renderCat = (c: typeof categories[0]) => (
    <TouchableOpacity key={c.id} style={[styles.catPill, cat===c.id && styles.catActive]} onPress={() => setCat(c.id)}>
      <Ionicons name={c.icon as any} size={16} color={cat===c.id ? '#fff' : '#e22f2f'} style={{ marginRight:4 }} />
      <Text style={[styles.catTxt, cat===c.id && { color:'#fff' }]}>{c.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex:1 }}> {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')} style={{ padding:4 }}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shop</Text>
        <TouchableOpacity style={{ padding:4 }}>
          <Ionicons name="cart" size={26} color="#e22f2f" />
          {cart>0 && <View style={styles.badge}><Text style={styles.badgeTxt}>{cart}</Text></View>}
        </TouchableOpacity>
      </View>

      {/* CATEGORY SELECTOR */}
      <View style={styles.catRow}>{categories.map(renderCat)}</View>

      {/* PRODUCT LIST */}
      <FlatList
        data={filtered}
        keyExtractor={p => p.id}
        renderItem={renderProduct}
        contentContainerStyle={{ padding:16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  header:{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderColor:'#eee',backgroundColor:'#fff' },
  headerTitle:{ fontSize:20,fontWeight:'700',color:'#e22f2f' },
  badge:{ position:'absolute',top:-4,right:-4,backgroundColor:'#e22f2f',borderRadius:10,minWidth:18,height:18,justifyContent:'center',alignItems:'center',paddingHorizontal:2 },
  badgeTxt:{ color:'#fff',fontSize:10,fontWeight:'700' },

  catRow:{ flexDirection:'row',flexWrap:'wrap',paddingHorizontal:16,paddingVertical:10,backgroundColor:'#fafafa' },
  catPill:{ flexDirection:'row',alignItems:'center',borderWidth:1,borderColor:'#e22f2f',borderRadius:20,paddingHorizontal:12,paddingVertical:6,marginRight:8,marginBottom:8 },
  catActive:{ backgroundColor:'#e22f2f' },
  catTxt:{ color:'#e22f2f',fontWeight:'600',fontSize:12 },

  card:{ flexDirection:'row',alignItems:'center',backgroundColor:'#fff',padding:12,borderRadius:14,marginBottom:12,shadowColor:'#000',shadowOpacity:0.05,shadowRadius:6,elevation:2 },
  cardIconWrap:{ width:46,height:46,borderRadius:23,backgroundColor:'#e22f2f',justifyContent:'center',alignItems:'center',marginRight:12 },
  cardName:{ fontSize:14,fontWeight:'600',marginBottom:2,color:'#333' },
  ratingRow:{ flexDirection:'row',alignItems:'center',marginBottom:2 },
  ratingTxt:{ fontSize:12,marginLeft:4,color:'#555' },
  price:{ fontSize:13,fontWeight:'700',color:'#e22f2f' },
  addBtn:{ backgroundColor:'#e22f2f',borderRadius:20,padding:6 },
});
