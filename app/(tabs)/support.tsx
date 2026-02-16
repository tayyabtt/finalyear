import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface Founder {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  defaultImage: any; // local asset fallback
}

const founders: Founder[] = [
  {
    id: 'tayyab',
    name: 'Tayyab Tahir',
    role: 'Founder',
    phone: '03134349539',
    email: 'tayyabttahir111@gmail.com',
    defaultImage: require('../../assets/images/tayyab.jpg'),
  },
  {
    id: 'faizan',
    name: 'Faizan Arshad',
    role: 'Founder',
    phone: '',
    email: '',
    defaultImage: require('../../assets/images/faizan.jpg'),
  },
];

const SupportScreen: React.FC = () => {
  const [avatars, setAvatars] = useState<Record<string, string | null>>({});

  // Load saved avatars on mount
  useEffect(() => {
    (async () => {
      const entries = await Promise.all(
        founders.map(async (f) => [f.id, await AsyncStorage.getItem(`avatar_${f.id}`)])
      );
      setAvatars(Object.fromEntries(entries));
    })();
  }, []);

  const pickImage = useCallback(async (id: string) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatars((prev) => ({ ...prev, [id]: uri }));
      await AsyncStorage.setItem(`avatar_${id}`, uri);
    }
  }, []);

  const openLink = (url: string) => Linking.openURL(url).catch(() => {});

  return (
    <LinearGradient colors={['#ece9e6', '#ffffff']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Need Help? Meet The Founders</Text>
        {founders.map((founder) => {
          const avatarUri = avatars[founder.id];
          return (
            <View key={founder.id} style={styles.card}>
              <TouchableOpacity onPress={() => pickImage(founder.id)}>
                <Image
                  source={avatarUri ? { uri: avatarUri } : founder.defaultImage}
                  style={styles.avatar}
                />
                <View style={styles.changeBadge}>
                  <AntDesign name="camerao" size={14} color="#fff" />
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{founder.name}</Text>
                <Text style={styles.role}>{founder.role}</Text>
                {founder.phone ? (
                  <TouchableOpacity
                    style={styles.linkRow}
                    onPress={() => openLink(`tel:${founder.phone}`)}
                  >
                    <Ionicons name="call" size={18} color="#4caf50" />
                    <Text style={styles.linkText}>{founder.phone}</Text>
                  </TouchableOpacity>
                ) : null}

                {founder.email ? (
                  <TouchableOpacity
                    style={styles.linkRow}
                    onPress={() => openLink(`mailto:${founder.email}`)}
                  >
                    <Ionicons name="mail" size={18} color="#2196f3" />
                    <Text style={styles.linkText}>{founder.email}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
};

export default SupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ffffffee',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fff',
  },
  changeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#0006',
    padding: 4,
    borderRadius: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
  },
  role: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  linkText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
  },
});
