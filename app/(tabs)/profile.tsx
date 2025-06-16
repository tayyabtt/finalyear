/* app/(tabs)/profile.tsx */
/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    BackHandler,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── default avatar ───────── */
const DEFAULT_AVATAR = require('../../assets/images/faizan.jpg');

export default function ProfileScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  const [avatar, setAvatar] = useState<string | null>(null);
  const [name,   setName]   = useState('Faizan Ali');
  const [email,  setEmail]  = useState('faizan@example.com');
  const [phone,  setPhone]  = useState('');

  /* back intercept → home */
  useEffect(() => {
    const goHome = () => { router.replace('/home'); return true; };

    const hw = BackHandler.addEventListener('hardwareBackPress', goHome);
    const gest = navigation.addListener('beforeRemove', e => { e.preventDefault(); goHome(); });
    return () => { hw.remove(); gest(); };
  }, [navigation, router]);

  /* pick new avatar */
  const changePhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled) setAvatar(res.assets[0].uri);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/home')}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.container}>
        {/* avatar */}
        <TouchableOpacity onPress={changePhoto} activeOpacity={0.8}>
          <Image source={avatar ? { uri: avatar } : DEFAULT_AVATAR} style={styles.avatar} />
          <Ionicons name="camera" size={22} color="#fff" style={styles.camIcon} />
        </TouchableOpacity>

        {/* editable fields */}
        <View style={styles.form}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Your name" />

          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />

          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="03xx‑xxxxxxx" keyboardType="phone-pad" />
        </View>
      </View>
    </View>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  header:{ flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:16,paddingVertical:12,borderBottomWidth:1,borderBottomColor:'#eee',backgroundColor:'#fff' },
  headerTitle:{ fontSize:20,fontWeight:'700',color:'#e22f2f' },

  container:{ alignItems:'center',padding:24 },
  avatar:{ width:120,height:120,borderRadius:60 },
  camIcon:{ position:'absolute',bottom:6,right:6,backgroundColor:'#e22f2f',padding:4,borderRadius:14 },

  form:{ width:'100%',marginTop:30 },
  label:{ fontSize:14,fontWeight:'600',marginBottom:6,color:'#555' },
  input:{ backgroundColor:'#f5f5f5',borderRadius:12,padding:14,marginBottom:18,fontSize:14 },
});
