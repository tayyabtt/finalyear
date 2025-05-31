// app/(tabs)/login.tsx
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 24;
const CAROUSEL_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

const images = [
  require('../../assets/images/loginimage1.jpg'),
  require('../../assets/images/loginimage2.jpg'),
  require('../../assets/images/loginimage3.jpg'),
  require('../../assets/images/loginimage4.jpg'),
  require('../../assets/images/loginimage5.jpg'),
  require('../../assets/images/loginimage6.jpg'),
  require('../../assets/images/loginimage7.jpg'),
];

export default function LoginScreen() {
  const router = useRouter();
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll every 4s
  useEffect(() => {
    const timer = setInterval(() => {
      const next = (currentIndex + 1) % images.length;
      scrollRef.current?.scrollTo({ x: next * (CAROUSEL_WIDTH + 12), animated: true });
      setCurrentIndex(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleLogin = () => {
    if (!emailPhone || !password) {
      alert('Please fill in both fields');
      return;
    }
    router.replace('/home');
    setTimeout(() => alert(`Welcome back, ${emailPhone}`), 500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      {/* Auto-scrolling Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carousel}
        >
          {images.map((src, idx) => (
            <Image
              key={idx}
              source={src}
              style={styles.carouselImage}
              resizeMode="cover"
            />
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
          value={emailPhone}
          onChangeText={setEmailPhone}
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => {/* forgot password action */}}>
          <Text style={styles.forgot}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => router.push('/signup')}>
          <Text style={styles.signupLink}> Sign Up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 30,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  carouselContainer: {
    width: '100%',
    height: 250,
    marginBottom: 30,
  },
  carousel: {
    alignItems: 'center',
  },
  carouselImage: {
    width: CAROUSEL_WIDTH,
    height: 250,
    borderRadius: 12,
    marginRight: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#f1f1f1',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: Platform.select({ ios: 12, android: 10 }),
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
  },
  forgot: {
    alignSelf: 'flex-end',
    fontSize: 13,
    color: '#e22f2f',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#e22f2f',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#e22f2f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  signupRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  signupText: {
    fontSize: 14,
    color: '#444',
  },
  signupLink: {
    fontSize: 14,
    color: '#e22f2f',
    fontWeight: '600',
  },
});
