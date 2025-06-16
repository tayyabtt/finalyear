/* app/(tabs)/recommendations.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── Top‑reviewed places (no external images) ───────── */
const topPlaces = [
  { id:'1', name:"Faletti's Hotel Ballroom", city:'Lahore', category:'Venue',       rating:4.9, reviews:312, icon:'business',   color:'#B3E5FC' },
  { id:'2', name:'Pixels & Vows Studio',      city:'Karachi', category:'Photography',rating:4.8, reviews:221, icon:'camera',     color:'#FFD180' },
  { id:'3', name:'Glamour by Anaya',          city:'Islamabad',category:'Make‑up',   rating:4.8, reviews:198, icon:'color-palette',color:'#E1BEE7' },
  { id:'4', name:'Blossom Décor Co.',         city:'Lahore',  category:'Décor',      rating:4.7, reviews:185, icon:'rose',       color:'#C8E6C9' },
  { id:'5', name:'Royal Sherwanis',           city:'Karachi', category:'Groom Wear', rating:4.7, reviews:164, icon:'man',         color:'#FFCDD2' },
];

export default function RecommendationsScreen() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof topPlaces[0] }) => (
    <View style={styles.card}>
      {/* Icon circle */}
      <View style={[styles.iconWrap,{backgroundColor:item.color}]}> 
        <Ionicons name={item.icon as any} size={28} color="#333" />
      </View>
      {/* Text section */}
      <View style={{flex:1,marginLeft:12}}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.sub}>{item.city} ‧ {item.category}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#fbbf24" />
          <Text style={styles.rateTxt}>{item.rating.toFixed(1)} · {item.reviews} reviews</Text>
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
        <Text style={styles.headerTitle}>Recommendations</Text>
        <View style={{width:28}}/>
      </View>

      <FlatList
        data={topPlaces}
        keyExtractor={i=>i.id}
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
  iconWrap:{width:56,height:56,borderRadius:28,alignItems:'center',justifyContent:'center'},
  name:{fontSize:16,fontWeight:'600',color:'#111'},
  sub:{fontSize:12,color:'#555',marginTop:2},
  ratingRow:{flexDirection:'row',alignItems:'center',marginTop:4},
  rateTxt:{fontSize:12,color:'#333',marginLeft:4},
});
