/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    FlatList,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const RING_SZ = 80;
const RING_STROKE = 6;

/* ░░ Dummy data ░░ */
const venueLatLng = { lat: 31.5204, lng: 74.3587 }; // Lahore
const dummyVendors = [
  { id: '1', name: 'Pearl Continental Ballroom', type: 'Venue', phone: '042-111-505-505' },
  { id: '2', name: 'Floral Fantasy Décor',        type: 'Decorator', phone: '0300-1234567' },
  { id: '3', name: 'Tasty Treats Catering',       type: 'Caterer',   phone: '042-9998887' },
];

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function EventScreen() {
  const router = useRouter();

  /* ░░ Core event meta ░░ */
  const [hallName]   = useState('Pearl Continental Ballroom');
  const [guestCount] = useState(350);
  const [eventDate]  = useState(new Date('2025-12-12T20:00:00'));
  const [rsvpCount]  = useState(215);
  const budget       = 1_200_000;
  const spent        = 950_000;

  /* ░░ Countdown & sparkle ░░ */
  const [countDown, setCountDown] = useState('');
  const [spark,     setSpark]     = useState(false);
  useEffect(() => {
    const tick = () => {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) { setCountDown('Today!'); setSpark(false); return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff / 3_600_000) % 24);
      const m = Math.floor((diff / 60_000)    % 60);
      setCountDown(`${d}d ${h}h ${m}m`);
      setSpark(diff < 86_400_000);          // sparkle when < 24 h
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [eventDate]);

  /* ░░ Weather chip ░░ */
  const [weather, setWeather] = useState<{ temp: number; icon: string } | null>(null);
  useEffect(() => {
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${venueLatLng.lat}&longitude=${venueLatLng.lng}&current_weather=true`)
      .then(r => r.json())
      .then(j => setWeather({ temp: j.current_weather.temperature, icon: 'cloudy-outline' }))
      .catch(() => {});
  }, []);

  /* ░░ RSVP ring animation ░░ */
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(ring, {
      toValue: rsvpCount / guestCount,
      duration: 1200,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  }, [rsvpCount, guestCount]);

  /* ░░ Gallery (user-picked) ░░ */
  const [images, setImages] = useState<string[]>([]);
  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!res.canceled) setImages(p => [...p, res.assets[0].uri]);
  };

  /* ░░ Live chat ░░ */
  const [chatInput, setChatInput] = useState('');
  const [messages,  setMessages]  = useState<{ id: string; text: string; self?: boolean }[]>([
    { id: '1', text: 'Welcome to your live Wedding Stream! 🎉' },
  ]);
  const chatRef = useRef<FlatList>(null);
  const send = () => {
    if (!chatInput.trim()) return;
    setMessages(p => [...p, { id: Date.now().toString(), text: chatInput.trim(), self: true }]);
    setChatInput('');
    setTimeout(() => chatRef.current?.scrollToEnd({ animated: true }), 50);
  };

  /* ░░ Infinite sine-wave separator ░░ */
  const waveX = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(waveX, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  /* ░░ Seating-plan modal ░░ */
  const [planOpen, setPlanOpen] = useState(false);

  return (
    <LinearGradient
      colors={['#220042', '#311158', '#4f1b78']}   /* deep-purple ramp */
      style={{ flex: 1 }}
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ╭─ Hero ─╮ */}
        <View style={styles.hero}>
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.heroOverlay}/>
          <View style={styles.heroTxt}>
            <Text style={styles.hall}>{hallName}</Text>
            <Text style={styles.date}>{eventDate.toDateString()}</Text>
            <Text style={styles.count}>{countDown}</Text>
          </View>
          {spark && (
            <Animated.View
              style={[
                styles.spark,
                { opacity: waveX.interpolate({ inputRange: [0,0.5,1], outputRange: [1,0.3,1] }) },
              ]}
            >
              <Ionicons name="sparkles" size={42} color="#ffeb3b"/>
            </Animated.View>
          )}
        </View>

        {/* Sine-wave separator */}
        <Animated.View
          style={[
            styles.wave,
            { transform: [{ translateX: waveX.interpolate({ inputRange:[0,1], outputRange:[0,-width] }) }] },
          ]}
        />

        {/* ╭─ Quick widgets row ─╮ */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widgets}>
          {/* RSVP ring */}
          <View style={styles.ringWrap}>
            <Svg width={RING_SZ} height={RING_SZ}>
              <Circle cx={RING_SZ/2} cy={RING_SZ/2} r={(RING_SZ-RING_STROKE)/2}
                      stroke="rgba(255,255,255,0.25)" strokeWidth={RING_STROKE}/>
              <AnimatedCircle
                cx={RING_SZ/2}
                cy={RING_SZ/2}
                r={(RING_SZ-RING_STROKE)/2}
                stroke="#ffeb3b"
                strokeWidth={RING_STROKE}
                strokeDasharray={Math.PI*(RING_SZ-RING_STROKE)}
                strokeDashoffset={ring.interpolate({
                  inputRange:[0,1],
                  outputRange:[Math.PI*(RING_SZ-RING_STROKE),0],
                })}
                strokeLinecap="round"
              />
            </Svg>
            <Text style={styles.ringTxt}>{`${rsvpCount}/${guestCount}`}\nRSVP</Text>
          </View>

          {/* Weather chip */}
          <View style={styles.card}>
            <Ionicons name={(weather?.icon ?? 'cloudy-outline') as any} size={22} color="#fff"/>
            <Text style={styles.cardLbl}>{weather ? `${weather.temp}°C` : '--'}</Text>
          </View>

          {/* Budget chip */}
          <View style={styles.card}>
            <Text style={styles.cardLbl}>Budget</Text>
            <View style={styles.budgetBar}>
              <View style={[styles.budgetFill,{ width:`${(spent/budget)*100}%` }]}/>
            </View>
            <Text style={styles.budgetTxt}>{`₨${spent.toLocaleString()} / ₨${budget.toLocaleString()}`}</Text>
          </View>

          {/* Map chip */}
          <TouchableOpacity
            style={[styles.card,{ flexDirection:'row', alignItems:'center' }]}
            onPress={()=>Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${venueLatLng.lat},${venueLatLng.lng}`)}
          >
            <Ionicons name="location" size={20} color="#fff" style={{ marginRight:6 }}/>
            <Text style={styles.cardLbl}>Directions</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ╭─ Timeline ─╮ */}
        <Text style={styles.title}>Event Timeline</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft:10 }}>
          {['Mehndi','Barat','Walima'].map((t,i)=>(
            <Animated.View key={t} style={[styles.timeCard,{ transform:[{ scale:1-i*0.05 }] }]}>
              <Text style={styles.timeTtl}>{t}</Text>
              <Text style={styles.timeSub}>7:00 PM</Text>
            </Animated.View>
          ))}
        </ScrollView>

        {/* ╭─ Gallery ─╮ */}
        <View style={styles.headRow}>
          <Text style={styles.title}>Gallery</Text>
          <TouchableOpacity onPress={pickImage}>
            <Ionicons name="add-circle" size={26} color="#fff"/>
          </TouchableOpacity>
        </View>
        {images.length === 0 ? (
          <Text style={[styles.empty,{ marginLeft:14 }]}>
            No photos yet — tap ➕ when you’re ready.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gRow}>
            {images.map(uri=>(
              <View key={uri} style={styles.phPlaceholder}/>
            ))}
          </ScrollView>
        )}

        {/* ╭─ Vendors ─╮ */}
        <Text style={styles.title}>Vendors</Text>
        {dummyVendors.map(v=>(
          <View key={v.id} style={styles.vendor}>
            <View>
              <Text style={styles.vName}>{v.name}</Text>
              <Text style={styles.vType}>{v.type}</Text>
            </View>
            <Ionicons name="call" size={22} color="#ff8a80"/>
          </View>
        ))}

        {/* Action buttons */}
        <View style={styles.actRow}>
          <TouchableOpacity style={styles.actBtn} onPress={()=>setPlanOpen(true)}>
            <Ionicons name="grid" size={24} color="#fff"/>
            <Text style={styles.actTxt}>Seating Plan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actBtn}>
            <Ionicons name="download" size={24} color="#fff"/>
            <Text style={styles.actTxt}>Memory Capsule</Text>
          </TouchableOpacity>
        </View>

        {/* ╭─ Live chat ─╮ */}
        <Text style={styles.title}>Live Chat</Text>
        <View style={styles.chatWrap}>
          <FlatList
            ref={chatRef}
            data={messages}
            keyExtractor={m=>m.id}
            renderItem={({item})=>(
              <View style={[styles.bubble, item.self && styles.bubbleSelf]}>
                <Text style={styles.msg}>{item.text}</Text>
              </View>
            )}
          />
        </View>

        <View style={{ height:90 }}/>
      </ScrollView>

      {/* Chat input */}
      <KeyboardAvoidingView behavior={Platform.OS==='ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor="#ccc"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={send} style={styles.sendBtn}>
            <Ionicons name="send" size={22} color="#fff"/>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Seating-plan modal (stub) */}
      <Modal visible={planOpen} animationType="slide">
        <View style={{ flex:1, backgroundColor:'#29004e', padding:24 }}>
          <Text style={{ color:'#fff', fontSize:20, fontWeight:'700', marginBottom:10 }}>
            Seating Plan (Coming Soon)
          </Text>
          <Text style={{ color:'#fff' }}>Drag & drop guests to tables here…</Text>
          <TouchableOpacity style={[styles.actBtn,{ alignSelf:'flex-end', marginTop:20 }]} onPress={()=>setPlanOpen(false)}>
            <Ionicons name="close" size={22} color="#fff"/>
            <Text style={styles.actTxt}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </LinearGradient>
  );
}

/* ░░ Styles ░░ */
const styles = StyleSheet.create({
  /* Hero */
  hero:{ height:height*0.32, justifyContent:'flex-end' },
  heroOverlay:{ ...StyleSheet.absoluteFillObject },
  heroTxt:{ padding:18 },
  hall:{ color:'#fff', fontSize:26, fontWeight:'bold' },
  date:{ color:'#d0c4ff', marginTop:2 },
  count:{ color:'#ffeb3b', fontWeight:'700', marginTop:2 },
  spark:{ position:'absolute', top:18, right:18 },

  /* Wave */
  wave:{ height:50, width:width*2, backgroundColor:'rgba(255,255,255,0.08)', borderBottomLeftRadius:40, borderBottomRightRadius:40 },

  /* Widgets */
  widgets:{ flexDirection:'row', paddingVertical:14, paddingHorizontal:6 },
  ringWrap:{ alignItems:'center', marginRight:14 },
  ringTxt:{ color:'#fff', fontSize:12, textAlign:'center', marginTop:4 },
  card:{ backgroundColor:'rgba(255,255,255,0.1)', padding:12, borderRadius:14, marginRight:14, minWidth:110, alignItems:'center' },
  cardLbl:{ color:'#fff', fontWeight:'600', marginTop:4 },
  budgetBar:{ width:'100%', height:6, backgroundColor:'rgba(255,255,255,0.25)', borderRadius:3, marginTop:6 },
  budgetFill:{ height:6, backgroundColor:'#80ffea', borderRadius:3 },
  budgetTxt:{ color:'#fff', fontSize:11, marginTop:4, textAlign:'center' },

  /* Section titles */
  title:{ color:'#fff', fontSize:20, fontWeight:'700', marginVertical:14, marginLeft:10 },
  headRow:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginRight:10 },

  /* Timeline */
  timeCard:{ width:width*0.55, backgroundColor:'rgba(255,255,255,0.12)', padding:16, borderRadius:20, marginRight:14 },
  timeTtl:{ color:'#fff', fontSize:18, fontWeight:'600' },
  timeSub:{ color:'#ddd', marginTop:4 },

  /* Gallery */
  empty:{ color:'#ccc', fontStyle:'italic', marginBottom:10 },
  gRow:{ paddingLeft:10, marginBottom:10 },
  phPlaceholder:{ width:120, height:90, borderRadius:12, marginRight:10, backgroundColor:'rgba(255,255,255,0.15)' },

  /* Vendors */
  vendor:{ flexDirection:'row', justifyContent:'space-between', backgroundColor:'rgba(255,255,255,0.12)', padding:14, marginHorizontal:10, borderRadius:16, marginBottom:10 },
  vName:{ color:'#fff', fontWeight:'600' },
  vType:{ color:'#ccc', fontSize:12 },

  /* Actions */
  actRow:{ flexDirection:'row', justifyContent:'space-around', marginVertical:20 },
  actBtn:{ flexDirection:'row', alignItems:'center', backgroundColor:'#7c26ff', paddingVertical:10, paddingHorizontal:14, borderRadius:20 },
  actTxt:{ color:'#fff', fontWeight:'600', marginLeft:6 },

  /* Chat */
  chatWrap:{ height:230, backgroundColor:'rgba(255,255,255,0.1)', marginHorizontal:10, borderRadius:16, padding:10 },
  bubble:{ backgroundColor:'rgba(255,255,255,0.9)', alignSelf:'flex-start', padding:8, borderRadius:10, marginVertical:4, maxWidth:'85%' },
  bubbleSelf:{ alignSelf:'flex-end', backgroundColor:'#ffeb3b' },
  msg:{ color:'#333' },

  /* Chat input */
  inputRow:{ flexDirection:'row', alignItems:'center', backgroundColor:'rgba(255,255,255,0.12)', margin:10, borderRadius:30, paddingHorizontal:10 },
  input:{ flex:1, color:'#fff', paddingVertical:10 },
  sendBtn:{ backgroundColor:'#7c26ff', padding:10, borderRadius:25 },
});
