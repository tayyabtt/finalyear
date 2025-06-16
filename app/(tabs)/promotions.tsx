/* app/(tabs)/promotions.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    BackHandler,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── Demo promotions (no external images) ───────── */
const promos = [
  {
    id: 'P1',
    title: '10% off Floral Fantasy Décor',
    details: 'Book any décor package before 30 Jun 2025',
    badge: 'Limited‑Time',
    icon: 'pricetag',
    color: '#FFE0B2',
  },
  {
    id: 'P2',
    title: 'Venue + Catering Saver',
    details: 'Pearl Continental Ballroom + Tasty Treats menu',
    badge: 'Bundle Deal',
    icon: 'gift',
    color: '#C8E6C9',
  },
  {
    id: 'P3',
    title: 'Invite‑&‑Earn Referral',
    details: 'Share code SHAADI500 & get PKR 500 credit each',
    badge: 'Referral',
    icon: 'megaphone',
    color: '#FFD180',
  },
  {
    id: 'P4',
    title: 'Firework + Cold Sparklers',
    details: 'Add wow factor to your Baraat entrance',
    badge: 'Add‑On',
    icon: 'sparkles',
    color: '#E1BEE7',
  },
];

export default function PromotionsScreen() {
  const router = useRouter();
  const nav    = useNavigation();

  /* Back handler to always jump to home */
  useEffect(() => {
    const goHome = () => { router.replace('/home'); return true; };
    const hw     = BackHandler.addEventListener('hardwareBackPress', goHome);
    const gest   = nav.addListener('beforeRemove', e => { e.preventDefault(); goHome(); });
    return () => { hw.remove(); gest(); };
  }, [nav, router]);

  /* render card */
  const renderItem = ({ item }: { item: typeof promos[0] }) => (
    <View style={styles.card}>
      <View style={[styles.iconWrap,{backgroundColor:item.color}]}> 
        <Ionicons name={item.icon as any} size={26} color="#333" />
      </View>
      <View style={{flex:1,marginLeft:12}}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.details}>{item.details}</Text>
        <View style={[styles.badge,{backgroundColor:item.color}]}> 
          <Text style={styles.badgeTxt}>{item.badge}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{flex:1}}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.replace('/home')}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={{width:28}}/>
      </View>

      <FlatList
        data={promos}
        keyExtractor={p=>p.id}
        renderItem={renderItem}
        contentContainerStyle={{padding:16}}
        ItemSeparatorComponent={()=> <View style={{height:12}}/>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  header:{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',
           paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderColor:'#eee',backgroundColor:'#fff'},
  headerTitle:{fontSize:20,fontWeight:'700',color:'#e22f2f'},

  card:{flexDirection:'row',alignItems:'center',backgroundColor:'#fafafa',borderRadius:14,padding:14,elevation:1,shadowColor:'#000',shadowOpacity:0.06,shadowRadius:4},
  iconWrap:{width:50,height:50,borderRadius:25,alignItems:'center',justifyContent:'center'},
  title:{fontSize:15,fontWeight:'600',color:'#111'},
  details:{fontSize:12,color:'#555',marginTop:2},
  badge:{alignSelf:'flex-start',marginTop:6,borderRadius:8,paddingHorizontal:8,paddingVertical:2},
  badgeTxt:{fontSize:11,fontWeight:'600',color:'#111'},
});
