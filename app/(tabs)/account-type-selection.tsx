// app/(tabs)/account-type-selection.tsx
// Account type selection screen for ShaadiSet

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function AccountTypeSelection() {
  const router = useRouter();

  const handleUserSelection = () => {
    router.push('/(tabs)/signup');
  };

  const handleVendorSelection = () => {
    router.push('/(tabs)/vendor-signup');
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.title}>Choose Account Type</Text>
      <Text style={styles.subtitle}>
        Select how you want to use ShaadiSet
      </Text>

      {/* Option Cards */}
      <View style={styles.cardsContainer}>
        {/* User Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={handleUserSelection}
        >
          <LinearGradient
            colors={['#e22f2f', '#c02525']}
            style={styles.cardGradient}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={48} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Continue as User</Text>
            <Text style={styles.cardDescription}>
              Planning your wedding? Browse vendors, create invites, and manage your big day.
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Vendor Card */}
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.8}
          onPress={handleVendorSelection}
        >
          <LinearGradient
            colors={['#7c26ff', '#6420d9']}
            style={styles.cardGradient}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="briefcase" size={48} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>Continue as Vendor</Text>
            <Text style={styles.cardDescription}>
              Offer wedding services? Showcase your work and connect with couples.
            </Text>
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 24,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    ...shadow,
  },
  cardGradient: {
    padding: 28,
    minHeight: 220,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 16,
  },
  arrowContainer: {
    alignSelf: 'flex-end',
    marginTop: 'auto',
  },
});
