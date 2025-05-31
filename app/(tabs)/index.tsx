import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/1.png')}
        style={styles.image}
        resizeMode="cover"
      />

      <Text style={styles.heading}>Welcome to ShaadiSet!</Text>

      <Text style={styles.subheading}>
        Plan your wedding with easy, stylish, and smart tools – made just for South Asian Weddings.
      </Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={({ pressed }) => [
            styles.signupBtn,
            pressed && styles.buttonPressed,
          ]}
          android_ripple={{ color: '#a02922' }}
          onPress={() => router.push('/signup')}
        >
          <Text style={styles.signupText}>Sign up</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && styles.buttonPressed,
          ]}
          android_ripple={{ color: '#cfcfcf' }}
          onPress={() => router.push('/login')}
        >
          <Text style={styles.loginText}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
  },
  android: {
    elevation: 7,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 80,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 280,
    borderRadius: 25,
    marginBottom: 40,
    ...shadow,
  },
  heading: {
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 12,
    color: '#1a1a1a',
    textAlign: 'center',
    letterSpacing: 0.6,
  },
  subheading: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 24,
    paddingHorizontal: 10,
    fontWeight: '500',
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 20,
  },
  signupBtn: {
    flex: 1,
    backgroundColor: '#e22f2f',
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: 'center',
    ...shadow,
  },
  signupText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    borderRadius: 35,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  loginText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.8,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
