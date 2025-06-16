/* app/(tabs)/share.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    BackHandler,
    Platform,
    Share,
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── helpers ───────── */
const copyToClipboard = async (code:string) => {
  await Clipboard.setStringAsync(code);
  if(Platform.OS==='android') ToastAndroid.show('Code copied!',ToastAndroid.SHORT);
};

export default function ShareScreen() {
  const router      = useRouter();
  const navigation  = useNavigation();
  const params      = useLocalSearchParams<{ code?: string }>();
  const inviteCode  = params.code ?? '123 456';

  /* back handling */
  useEffect(()=>{
    const goHome=()=>{ router.replace('/home'); return true; };
    const hw   = BackHandler.addEventListener('hardwareBackPress',goHome);
    const gest = navigation.addListener('beforeRemove',e=>{ e.preventDefault(); goHome(); });
    return ()=>{ hw.remove(); gest(); };
  },[navigation,router]);

  /* native share */
  const doShare = () => {
    Share.share({
      message:`Join our wedding on ShaadiSet! Use invite code ${inviteCode}. Download: https://shaadiset.app`,
    });
  };

  return (
    <View style={styles.page}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.replace('/home')}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Invite Code</Text>
        <View style={{width:28}} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Your code</Text>
        <Text style={styles.code}>{inviteCode}</Text>
        <View style={styles.row}>
          <TouchableOpacity style={styles.btn} onPress={()=>copyToClipboard(inviteCode)}>
            <Ionicons name="copy" size={20} color="#fff" style={{marginRight:6}}/>
            <Text style={styles.btnTxt}>Copy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={doShare}>
            <Ionicons name="share-social" size={20} color="#fff" style={{marginRight:6}}/>
            <Text style={styles.btnTxt}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  page:{flex:1,backgroundColor:'#fff'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderColor:'#eee'},
  headerTitle:{fontSize:20,fontWeight:'700',color:'#e22f2f'},
  card:{margin:24,padding:24,borderRadius:16,backgroundColor:'#fef4f5',alignItems:'center'},
  label:{fontSize:14,color:'#777'},
  code:{fontSize:28,fontWeight:'700',color:'#e22f2f',marginVertical:12,letterSpacing:3},
  row:{flexDirection:'row',marginTop:20},
  btn:{flexDirection:'row',alignItems:'center',backgroundColor:'#e22f2f',borderRadius:12,paddingVertical:10,paddingHorizontal:18,marginHorizontal:6},
  btnTxt:{color:'#fff',fontWeight:'600'},
});
