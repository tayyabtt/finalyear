import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Alert,
    Linking,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

/**
 * Replace this with your **actual** application ID on the Play Store / App Store.
 */
const ANDROID_APP_ID = 'com.shaadiset.app';
const IOS_APP_ID = '0000000000'; // example: '1234567890'

const RateScreen: React.FC = () => {
  /**
   * Opens the Play Store / App Store directly on the rating page.
   * Falls back nicely if the URL can’t be opened.
   */
  const handleRatePress = async () => {
    const url = Platform.select({
      android: `https://play.google.com/store/apps/details?id=${ANDROID_APP_ID}&reviewId=0`,
      ios: `itms-apps://itunes.apple.com/app/id${IOS_APP_ID}?action=write-review`,
    });

    if (!url) return;

    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      Linking.openURL(url);
    } else {
      Alert.alert(
        'Unable to open store',
        'Please check your internet connection or try again later.'
      );
    }
  };

  return (
    <LinearGradient
      colors={['#fff1eb', '#ace0f9', '#dab6ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.card}>
        <AntDesign name="staro" size={72} color="#ffb300" style={styles.iconShadow} />
        <Text style={styles.title}>Enjoying ShaadiSet?</Text>
        <Text style={styles.subtitle}>
          Tap the button below and leave us a ⭐⭐⭐⭐⭐ rating on the store.
        </Text>

        <TouchableOpacity style={styles.button} onPress={handleRatePress}>
          <Text style={styles.buttonText}>Rate on Play Store</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '85%',
    padding: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 10,
  },
  iconShadow: {
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#444',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 36,
    backgroundColor: '#ff9a9e',
    borderRadius: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RateScreen;
