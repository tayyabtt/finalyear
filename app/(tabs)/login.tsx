import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseErrorMessage } from '../../utils/validation';

/* ───── constants ───── */
const { width }     = Dimensions.get('window');
const PAD           = 24;
const CARD_WIDTH    = width - PAD * 2;
const images = [
  require('../../assets/images/loginimage1.jpg'),
  require('../../assets/images/loginimage2.jpg'),
  require('../../assets/images/loginimage3.jpg'),
  require('../../assets/images/loginimage4.jpg'),
  require('../../assets/images/loginimage5.jpg'),
  require('../../assets/images/loginimage6.jpg'),
  require('../../assets/images/loginimage7.jpg'),
];

/* ───── component ───── */
export default function LoginScreen() {
  const router = useRouter();
  const { signIn, role } = useAuth();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [index,    setIndex]    = useState(0);
  const [loading,  setLoading]  = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  /* auto-scroll carousel every 4 s */
  useEffect(() => {
    const id = setInterval(() => {
      const next = (index + 1) % images.length;
      scrollRef.current?.scrollTo({ x: next * (CARD_WIDTH + 12), animated: true });
      setIndex(next);
    }, 4000); 
    return () => clearInterval(id);
  }, [index]);

  /* login */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please fill in both fields');
      return;
    }
    
    setLoading(true);
    
    try {
      await signIn(email, password);
      // Navigation will be handled by root layout based on role
      router.replace('/home');
      setTimeout(() => Alert.alert('Welcome', `Welcome back!`), 500);
    } catch (error: any) {
      const errorMessage = getFirebaseErrorMessage(error.code);
      Alert.alert('Login failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ui */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
      {/* carousel */}
      <View style={styles.carouselWrap}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {images.map((src, i) => (
            <Image key={i} source={src} style={styles.image} resizeMode="cover" />
          ))}
        </ScrollView>
      </View>

      <Text style={styles.heading}>Welcome Back!</Text>
      <Text style={styles.subheading}>Let’s continue planning your big day.</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Email or Phone"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity onPress={() => { /* TODO: forgot-password logic */ }}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.6 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonTxt}>
            {loading ? 'Logging in...' : 'Log in'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupTxt}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/account-type-selection')}>
          <Text style={styles.signupLink}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ───── styles (unchanged) ───── */
const styles = StyleSheet.create({
  container:      { alignItems: 'center', paddingHorizontal: PAD, paddingTop: 30,
                    backgroundColor: '#fff', flexGrow: 1, paddingBottom: 40 },
  carouselWrap:   { width: '100%', height: 250, marginBottom: 30 },
  carousel:       { alignItems: 'center' },
  image:          { width: CARD_WIDTH, height: 250, borderRadius: 12, marginRight: 12 },
  heading:        { fontSize: 24, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 4 },
  subheading:     { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  form:           { width: '100%' },
  input:          { backgroundColor: '#f1f1f1', borderRadius: 25, paddingHorizontal: 20,
                    paddingVertical: Platform.select({ ios: 12, android: 10 }),
                    fontSize: 16, marginBottom: 16, color: '#333' },
  forgot:         { alignSelf: 'flex-end', fontSize: 13, color: '#e22f2f', marginBottom: 24 },
  button:         { backgroundColor: '#e22f2f', borderRadius: 25, paddingVertical: 16,
                    alignItems: 'center', marginBottom: 20,
                    ...Platform.select({
                      ios:      { shadowColor: '#e22f2f', shadowOffset: { width: 0, height: 8 },
                                  shadowOpacity: 0.3, shadowRadius: 10 },
                      android:  { elevation: 4 },
                    }) },
  buttonTxt:      { color: '#fff', fontWeight: '700', fontSize: 16 },
  signupRow:      { flexDirection: 'row', marginTop: 10 },
  signupTxt:      { fontSize: 14, color: '#444' },
  signupLink:     { fontSize: 14, color: '#e22f2f', fontWeight: '600' },
});
