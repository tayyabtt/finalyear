/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
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

/* ───────── constants ───────── */
const { width, height } = Dimensions.get('window');
const RING_SZ = 80;
const RING_STROKE = 6;

const GROOM_IMG = require('../../assets/images/bride1.jpg');
const BRIDE_IMG = require('../../assets/images/necklace.jpg');
const venueLatLng = { lat: 31.5204, lng: 74.3587 };
const dummyVendors = [
  { id: '1', name: 'Pearl Continental Ballroom', type: 'Venue',     phone: '042-111-505-505' },
  { id: '2', name: 'Floral Fantasy Décor',        type: 'Decorator', phone: '0300-1234567' },
  { id: '3', name: 'Tasty Treats Catering',       type: 'Caterer',   phone: '042-9998887' },
];

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ───────── types ───────── */
type EventData = {
  title: string;
  hall: string;
  date: Date;
  guestLimit: number;
  budget: number;
  code: string;
};

export default function EventScreen() {
  /* nav mode */
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'overview'>('menu');

  /* create-form fields */
  const [title, setTitle] = useState('');
  const [hall,  setHall]  = useState('');
  const [date,  setDate]  = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');

  /* join */
  const [joinCode, setJoinCode] = useState('');

  /* stored event (local only) */
  const [event, setEvent] = useState<EventData | null>(null);

  /* helpers */
  const resetForm = () => { setTitle(''); setHall(''); setDate(new Date()); setGuests(''); setBudget(''); };

  const handleCreate = () => {
    if (!title.trim() || !hall.trim()) { Alert.alert('Fill all required fields'); return; }
    const code = generateCode();
    setEvent({ title: title.trim(), hall: hall.trim(), date, guestLimit: Number(guests)||0, budget: Number(budget)||0, code });
    Alert.alert('Event Created', `Share this code: ${code}`);
    resetForm();
    setMode('overview');
  };

  const handleJoin = () => {
    if (!event) { Alert.alert('No event created in this session'); return; }
    if (joinCode.trim() === event.code) { setMode('overview'); setJoinCode(''); }
    else Alert.alert('Invalid Code', 'Please try again.');
  };

  /* derived for overview */
  const hallName   = event?.hall ?? '';
  const guestCount = event?.guestLimit ?? 0;
  const eventDate  = event?.date ?? new Date();
  const budgetVal  = event?.budget ?? 1;
  const rsvpCount  = Math.floor(guestCount * 0.6);           // demo
  const spent      = Math.min(budgetVal*0.75, budgetVal);    // demo

  /* countdown */
  const [countDown, setCountDown] = useState('');
  const [spark, setSpark] = useState(false);
  useEffect(()=>{
    if(mode!=='overview') return;
    const tick=()=>{
      const diff=eventDate.getTime()-Date.now();
      if(diff<=0){setCountDown('Today!'); setSpark(false); return;}
      const d=Math.floor(diff/86_400_000), h=Math.floor((diff/3_600_000)%24), m=Math.floor((diff/60_000)%60);
      setCountDown(`${d}d ${h}h ${m}m`);
      setSpark(diff<86_400_000);
    };
    tick();
    const id=setInterval(tick,60000);
    return()=>clearInterval(id);
  },[mode,eventDate]);

  /* RSVP animation */
  const ring=useRef(new Animated.Value(0)).current;
  useEffect(()=>{ if(mode!=='overview') return;
    Animated.timing(ring,{toValue:guestCount? rsvpCount/guestCount:0,duration:1200,easing:Easing.out(Easing.exp),useNativeDriver:false}).start();
  },[mode,rsvpCount,guestCount]);

  /* gallery / album state */
  const [images,setImages]=useState<string[]>([]);
  const pickImage=async()=>{
    const res=await ImagePicker.launchImageLibraryAsync({mediaTypes:ImagePicker.MediaTypeOptions.Images,quality:0.8});
    if(!res.canceled) setImages(p=>[...p,res.assets[0].uri]);
  };
  const [albumOpen,setAlbumOpen]=useState(false);

  /* chat */
  const [messages,setMessages]=useState<{id:string;text:string;self?:boolean}[]>([
    {id:'1',text:'Welcome to your live Wedding Stream! 🎉'}
  ]);
  const [chatInput,setChatInput]=useState('');
  const chatRef=useRef<FlatList>(null);
  const send=()=>{ if(!chatInput.trim())return;
    setMessages(p=>[...p,{id:Date.now().toString(),text:chatInput.trim(),self:true}]);
    setChatInput(''); setTimeout(()=>chatRef.current?.scrollToEnd({animated:true}),50);
  };

  /* wave decoration */
  const waveX=useRef(new Animated.Value(0)).current;
  useEffect(()=>{ Animated.loop(Animated.timing(waveX,{toValue:1,duration:8000,easing:Easing.linear,useNativeDriver:true})).start(); },[]);

  /* seating dummy */
  const [planOpen,setPlanOpen]=useState(false);

  /* ========== MENU ========== */
  if(mode==='menu') return (
    <LinearGradient colors={['#220042','#311158','#4f1b78']} style={styles.menuWrap}>
      <Text style={styles.menuH1}>Wedding Planner</Text>
      <TouchableOpacity style={styles.menuBtn} onPress={()=>setMode('create')}><Ionicons name="add-circle" size={26} color="#fff"/><Text style={styles.menuTxt}>Create Event</Text></TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={()=>setMode('join')}><Ionicons name="log-in" size={24} color="#fff"/><Text style={styles.menuTxt}>Join Event</Text></TouchableOpacity>
    </LinearGradient>
  );

  /* ========== CREATE FORM ========== */
  if(mode==='create') return (
    <ScrollView contentContainerStyle={styles.formWrap} showsVerticalScrollIndicator={false}>
      <Text style={styles.formH1}>Create Event</Text>
      <TextInput style={styles.in} placeholder="Event title *" placeholderTextColor="#aaa" value={title} onChangeText={setTitle}/>
      <TextInput style={styles.in} placeholder="Venue / Shaadi Hall *" placeholderTextColor="#aaa" value={hall} onChangeText={setHall}/>
      <TouchableOpacity onPress={()=>setShowDate(true)} style={styles.dateBtn}>
        <Ionicons name="calendar" size={20} color="#fff" style={{marginRight:8}}/><Text style={styles.dateTxt}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDate&&(
        <DateTimePicker value={date} mode="date" display={Platform.OS==='ios'?'inline':'default'}
          onChange={(e:DateTimePickerEvent,d?:Date)=>{setShowDate(false); if(d) setDate(d);}}
        />
      )}
      <TextInput style={styles.in} placeholder="Expected guests" keyboardType="numeric" placeholderTextColor="#aaa" value={guests} onChangeText={setGuests}/>
      <TextInput style={styles.in} placeholder="Budget (PKR)" keyboardType="numeric" placeholderTextColor="#aaa" value={budget} onChangeText={setBudget}/>
      <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}><Text style={styles.saveTxt}>Save & Continue</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>setMode('menu')} style={{marginTop:12}}><Text style={{color:'#ccc'}}>Back to menu</Text></TouchableOpacity>
    </ScrollView>
  );

  /* ========== JOIN SCREEN ========== */
  if(mode==='join') return (
    <LinearGradient colors={['#220042','#311158','#4f1b78']} style={styles.formWrap}>
      <Text style={styles.formH1}>Join Event</Text>
      <TextInput style={styles.in} placeholder="Enter invite code" keyboardType="numeric" placeholderTextColor="#aaa" value={joinCode} onChangeText={setJoinCode}/>
      <TouchableOpacity style={styles.saveBtn} onPress={handleJoin}><Text style={styles.saveTxt}>Join</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>setMode('menu')} style={{marginTop:12}}><Text style={{color:'#ccc'}}>Back to menu</Text></TouchableOpacity>
    </LinearGradient>
  );

  /* SAFEGUARD */
  if(!event) return null;

  /* ========== OVERVIEW (rich UI) ========== */
  return (
    <LinearGradient colors={['#220042','#311158','#4f1b78']} style={{flex:1}}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.hero}>
          <LinearGradient colors={['rgba(0,0,0,0.55)','transparent']} style={styles.heroOverlay}/>
          <View style={styles.coupleRow}>
            <Image source={GROOM_IMG} style={styles.avatar}/><Text style={styles.heart}>❤️</Text><Image source={BRIDE_IMG} style={styles.avatar}/>
          </View>
          <View style={styles.quoteBlock}>
            <Text style={styles.quote}>“Two souls, one heart, one beautiful journey.”</Text>
            <Text style={styles.names}>{event.title}</Text>
          </View>
          <View style={styles.heroTxt}>
            <Text style={styles.hall}>{hallName}</Text>
            <Text style={styles.date}>{eventDate.toDateString()}</Text>
            <Text style={styles.count}>{countDown}</Text>
          </View>
          {spark&&(
            <Animated.View style={[styles.spark,{opacity:waveX.interpolate({inputRange:[0,0.5,1],outputRange:[1,0.3,1]})}]}>
              <Ionicons name="sparkles" size={42} color="#ffeb3b" />
            </Animated.View>
          )}
        </View>

        {/* wave */}
        <Animated.View style={[styles.wave,{transform:[{translateX:waveX.interpolate({inputRange:[0,1],outputRange:[0,-width]})}]}]}/>

        {/* WIDGETS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widgets}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SZ} height={RING_SZ}>
              <Circle cx={RING_SZ/2} cy={RING_SZ/2} r={(RING_SZ-RING_STROKE)/2}
                stroke="rgba(255,255,255,0.25)" strokeWidth={RING_STROKE}/>
              <AnimatedCircle cx={RING_SZ/2} cy={RING_SZ/2} r={(RING_SZ-RING_STROKE)/2} stroke="#ffeb3b" strokeWidth={RING_STROKE} strokeLinecap="round"
                strokeDasharray={Math.PI*(RING_SZ-RING_STROKE)}
                strokeDashoffset={ring.interpolate({inputRange:[0,1],outputRange:[Math.PI*(RING_SZ-RING_STROKE),0]})}/>
            </Svg>
            <Text style={styles.ringTxt}>{`${rsvpCount}/${guestCount}`}{'\n'}RSVP</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLbl}>Budget</Text>
            <View style={styles.budgetBar}><View style={[styles.budgetFill,{width:`${(spent/budgetVal)*100}%`}]} /></View>
            <Text style={styles.budgetTxt}>₨{spent.toLocaleString()} / ₨{budgetVal.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={[styles.card,{flexDirection:'row',alignItems:'center'}]}
            onPress={()=>Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${venueLatLng.lat},${venueLatLng.lng}`)}>
            <Ionicons name="location" size={20} color="#fff" style={{marginRight:6}}/><Text style={styles.cardLbl}>Directions</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* GALLERY TEASER */}
        <View style={styles.headRow}>
          <Text style={styles.title}>Gallery</Text>
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={pickImage}><Ionicons name="add-circle" size={26} color="#fff"/></TouchableOpacity>
            <TouchableOpacity onPress={()=>setAlbumOpen(true)} style={{marginLeft:12}}><Ionicons name="images" size={26} color="#fff"/></TouchableOpacity>
          </View>
        </View>
        {images.length===0 ? (
          <Text style={[styles.empty,{marginLeft:14}]}>No photos yet — tap ➕ to add.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gRow}>
            {images.slice(-6).map(uri=> <Image key={uri} source={{uri}} style={styles.phPlaceholder}/>)}
          </ScrollView>
        )}

        {/* VENDORS */}
        <Text style={styles.title}>Vendors</Text>
        {dummyVendors.map(v=>(
          <View key={v.id} style={styles.vendor}>
            <View><Text style={styles.vName}>{v.name}</Text><Text style={styles.vType}>{v.type}</Text></View>
            <Ionicons name="call" size={22} color="#ff8a80"/>
          </View>
        ))}

        {/* ACTIONS */}
        <View style={styles.actRow}>
          <TouchableOpacity style={styles.actBtn} onPress={()=>setPlanOpen(true)}><Ionicons name="grid" size={24} color="#fff"/><Text style={styles.actTxt}>Seating Plan</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actBtn}><Ionicons name="download" size={24} color="#fff"/><Text style={styles.actTxt}>Memory Capsule</Text></TouchableOpacity>
        </View>

        {/* CHAT */}
        <Text style={styles.title}>Live Chat</Text>
        <View style={styles.chatWrap}>
          <FlatList ref={chatRef} data={messages} keyExtractor={m=>m.id}
            renderItem={({item})=>(
              <View style={[styles.bubble,item.self&&styles.bubbleSelf]}><Text style={styles.msg}>{item.text}</Text></View>
            )}
          />
        </View>
        <View style={{height:90}}/>
      </ScrollView>

      {/* CHAT INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':undefined} keyboardVerticalOffset={80}>
        <View style={styles.inputRow}>
          <TextInput style={styles.input} placeholder="Type a message…" placeholderTextColor="#ccc" value={chatInput}
            onChangeText={setChatInput} onSubmitEditing={send} returnKeyType="send" />
          <TouchableOpacity onPress={send} style={styles.sendBtn}><Ionicons name="send" size={22} color="#fff"/></TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* SEATING PLAN MODAL */}
      <Modal visible={planOpen} animationType="slide">
        <LinearGradient colors={['#29004e','#1e0037']} style={{flex:1,padding:24}}>
          <Text style={{color:'#fff',fontSize:20,fontWeight:'700',marginBottom:12}}>Seating Plan (Coming Soon)</Text>
          <Text style={{color:'#fff'}}>Drag & drop guests to tables here…</Text>
          <TouchableOpacity style={[styles.actBtn,{alignSelf:'flex-end',marginTop:20}]} onPress={()=>setPlanOpen(false)}>
            <Ionicons name="close" size={22} color="#fff"/><Text style={styles.actTxt}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>

      {/* ALBUM MODAL */}
      <Modal visible={albumOpen} animationType="slide">
        <LinearGradient colors={['#220042','#311158','#4f1b78']} style={{flex:1,paddingTop:50}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingHorizontal:20,marginBottom:10}}>
            <Text style={{color:'#fff',fontSize:22,fontWeight:'700'}}>Wedding Album</Text>
            <TouchableOpacity onPress={()=>setAlbumOpen(false)}><Ionicons name="close" size={26} color="#fff"/></TouchableOpacity>
          </View>
          {images.length===0 ? (
            <Text style={{color:'#ccc',textAlign:'center',marginTop:30}}>No photos yet.</Text>
          ) : (
            <FlatList
              data={images}
              keyExtractor={uri=>uri}
              numColumns={3}
              contentContainerStyle={{padding:6}}
              renderItem={({item})=> <Image source={{uri:item}} style={styles.albumThumb} />}
            />
          )}
        </LinearGradient>
      </Modal>
    </LinearGradient>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  /* menu */
  menuWrap:{flex:1,justifyContent:'center',alignItems:'center'},
  menuH1:{color:'#fff',fontSize:28,fontWeight:'700',marginBottom:30},
  menuBtn:{flexDirection:'row',alignItems:'center',backgroundColor:'#7c26ff',paddingVertical:14,paddingHorizontal:20,borderRadius:24,marginVertical:8},
  menuTxt:{color:'#fff',fontWeight:'600',marginLeft:8,fontSize:16},

  /* form */
  formWrap:{flexGrow:1,justifyContent:'center',alignItems:'center',padding:24,backgroundColor:'#220042'},
  formH1:{color:'#fff',fontSize:24,fontWeight:'700',marginBottom:20},
  in:{width:'100%',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:14,color:'#fff',marginBottom:12},
  dateBtn:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:14,marginBottom:12},
  dateTxt:{color:'#fff'},
  saveBtn:{backgroundColor:'#7c26ff',borderRadius:16,paddingVertical:14,paddingHorizontal:30,marginTop:6},
  saveTxt:{color:'#fff',fontWeight:'600'},

  /* overview (existing styles) */
  hero:{height:height*0.55,justifyContent:'flex-end'}, heroOverlay:{...StyleSheet.absoluteFillObject},
  coupleRow:{position:'absolute',top:40,alignSelf:'center',flexDirection:'row',alignItems:'center'},
  avatar:{width:120,height:120,borderRadius:60,borderWidth:2,borderColor:'#fff'}, heart:{fontSize:30,marginHorizontal:14,color:'#ffeb3b'},
  quoteBlock:{position:'absolute',top:180,alignSelf:'center',alignItems:'center',paddingHorizontal:20},
  quote:{color:'#ffeb3b',fontStyle:'italic',fontSize:16,textAlign:'center'}, names:{color:'#fff',fontWeight:'700',marginTop:4,fontSize:18},
  heroTxt:{padding:16,marginTop:-6}, hall:{color:'#fff',fontSize:26,fontWeight:'bold'}, date:{color:'#d0c4ff',marginTop:2}, count:{color:'#ffeb3b',fontWeight:'700',marginTop:2},
  spark:{position:'absolute',top:18,right:18},
  wave:{height:50,width:width*2,backgroundColor:'rgba(255,255,255,0.08)',borderBottomLeftRadius:40,borderBottomRightRadius:40},
  widgets:{flexDirection:'row',paddingVertical:14,paddingHorizontal:6}, ringWrap:{alignItems:'center',marginRight:14}, ringTxt:{color:'#fff',fontSize:12,textAlign:'center',marginTop:4},
  card:{backgroundColor:'rgba(255,255,255,0.1)',padding:12,borderRadius:14,marginRight:14,minWidth:110,alignItems:'center'},
  cardLbl:{color:'#fff',fontWeight:'600',marginTop:4}, budgetBar:{width:'100%',height:6,backgroundColor:'rgba(255,255,255,0.25)',borderRadius:3,marginTop:6},
  budgetFill:{height:6,backgroundColor:'#80ffea',borderRadius:3}, budgetTxt:{color:'#fff',fontSize:11,marginTop:4,textAlign:'center'},
  title:{color:'#fff',fontSize:20,fontWeight:'700',marginVertical:14,marginLeft:10},
  headRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginRight:10},
  empty:{color:'#ccc',fontStyle:'italic',marginBottom:10}, gRow:{paddingLeft:10,marginBottom:10},
  phPlaceholder:{width:120,height:90,borderRadius:12,marginRight:10,resizeMode:'cover'},
  albumThumb:{width:(width-24)/3-8,height:(width-24)/3-8,borderRadius:10,margin:4,backgroundColor:'#333'},

  vendor:{flexDirection:'row',justifyContent:'space-between',backgroundColor:'rgba(255,255,255,0.12)',padding:14,marginHorizontal:10,borderRadius:16,marginBottom:10},
  vName:{color:'#fff',fontWeight:'600'}, vType:{color:'#ccc',fontSize:12},

  actRow:{flexDirection:'row',justifyContent:'space-around',marginVertical:20},
  actBtn:{flexDirection:'row',alignItems:'center',backgroundColor:'#7c26ff',paddingVertical:10,paddingHorizontal:14,borderRadius:20},
  actTxt:{color:'#fff',fontWeight:'600',marginLeft:6},

  chatWrap:{height:230,backgroundColor:'rgba(255,255,255,0.1)',marginHorizontal:10,borderRadius:16,padding:10},
  bubble:{backgroundColor:'rgba(255,255,255,0.9)',alignSelf:'flex-start',padding:8,borderRadius:10,marginVertical:4,maxWidth:'85%'},
  bubbleSelf:{alignSelf:'flex-end',backgroundColor:'#ffeb3b'}, msg:{color:'#333'},

  inputRow:{flexDirection:'row',alignItems:'center',backgroundColor:'rgba(255,255,255,0.12)',margin:10,borderRadius:30,paddingHorizontal:10},
  input:{flex:1,color:'#fff',paddingVertical:10},
  sendBtn:{backgroundColor:'#7c26ff',padding:10,borderRadius:25},
});
