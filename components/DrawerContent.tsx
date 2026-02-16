import {
    Entypo,
    FontAwesome,
    Ionicons,
    MaterialIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useProfile } from '../app/(tabs)/ProfileContext';
import { useAuth } from '../contexts/AuthContext';
import { getVendorData } from '../utils/storage';

/* types */
interface MenuItem {
  icon: string;
  label: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'Entypo';
  route: string;
}

/* menu items for users */
const userMenuItems: MenuItem[] = [
  { icon: 'mail-outline',              label: 'Inbox',            iconType: 'Ionicons',      route: '/(tabs)/inbox' },
  { icon: 'calendar-today',            label: 'My Bookings',      iconType: 'MaterialIcons', route: '/(tabs)/bookings' },
  { icon: 'clipboard-outline',         label: 'Planning',         iconType: 'Ionicons',      route: '/(tabs)/planning' },
  { icon: 'mail-open-outline',         label: 'E-Invites',        iconType: 'Ionicons',      route: '/(tabs)/einvite' },
  { icon: 'star-outline',              label: 'Write a Review',   iconType: 'Ionicons',      route: '/(tabs)/review' },
  { icon: 'document-text-outline',     label: 'E-Salami',         iconType: 'Ionicons',      route: '/(tabs)/packages' },
  { icon: 'thumbs-up-outline',         label: 'Recommendations',  iconType: 'Ionicons',      route: '/(tabs)/recommendations' },
  { icon: 'shopping-bag',              label: 'Shop',             iconType: 'MaterialIcons', route: '/(tabs)/shop' },
  { icon: 'gift-outline',              label: 'Promotions',       iconType: 'Ionicons',      route: '/(tabs)/promotions' },
  { icon: 'call-outline',              label: 'Contact Support',  iconType: 'Ionicons',      route: '/(tabs)/support' },
  { icon: 'information-circle-outline',label: 'Information',      iconType: 'Ionicons',      route: '/(tabs)/info' },
  { icon: 'star',                      label: 'Rate on Store',    iconType: 'FontAwesome',   route: '/(tabs)/rate' },
  { icon: 'share',                     label: 'Share',            iconType: 'Entypo',        route: '/(tabs)/share' },
];

/* menu items for vendors */
const vendorMenuItems: MenuItem[] = [
  { icon: 'grid',                      label: 'Dashboard',        iconType: 'Ionicons',      route: '/(vendor)/dashboard' },
  { icon: 'briefcase',                 label: 'My Services',      iconType: 'Ionicons',      route: '/(vendor)/my-services' },
  { icon: 'mail',                      label: 'Requests',         iconType: 'Ionicons',      route: '/(vendor)/requests' },
  { icon: 'chatbubbles',               label: 'Messages',         iconType: 'Ionicons',      route: '/(vendor)/inbox' },
  { icon: 'person',                    label: 'Profile',          iconType: 'Ionicons',      route: '/(vendor)/profile' },
  { icon: 'call-outline',              label: 'Contact Support',  iconType: 'Ionicons',      route: '/(tabs)/support' },
  { icon: 'information-circle-outline',label: 'Information',      iconType: 'Ionicons',      route: '/(tabs)/info' },
];

/* render helper */
const renderIcon = (item: MenuItem) => {
  switch (item.iconType) {
    case 'MaterialIcons': return <MaterialIcons name={item.icon as any} size={22} color="#333" />;
    case 'FontAwesome':   return <FontAwesome   name={item.icon as any} size={22} color="#333" />;
    case 'Entypo':        return <Entypo        name={item.icon as any} size={22} color="#333" />;
    default:              return <Ionicons      name={item.icon as any} size={22} color="#333" />;
  }
};

const DrawerContent: React.FC = () => {
  const router     = useRouter();
  const navigation = useNavigation();
  const { avatar: contextAvatar, name: contextName } = useProfile();
  const { role, signOut, user } = useAuth();
  const [displayName, setDisplayName] = useState('Guest');
  const [displayAvatar, setDisplayAvatar] = useState<string | null>(null);

  useEffect(() => {
    loadUserData();
    
    // Reload when drawer is opened
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });
    
    // Check for profile updates periodically
    const checkInterval = setInterval(async () => {
      const lastUpdate = await AsyncStorage.getItem('@profile_updated');
      if (lastUpdate) {
        loadUserData();
      }
    }, 2000);
    
    return () => {
      unsubscribe();
      clearInterval(checkInterval);
    };
  }, [role, user, navigation]);

  const loadUserData = async () => {
    try {
      if (role === 'vendor') {
        const vendorData = await getVendorData();
        if (vendorData?.businessName) {
          setDisplayName(vendorData.businessName);
        }
      } else {
        // Load user profile from AsyncStorage
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          setDisplayName(profile.name || user?.email?.split('@')[0] || 'Guest');
          setDisplayAvatar(profile.avatar || null);
        } else if (user?.email) {
          setDisplayName(user.email.split('@')[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  /* helper → navigate + close drawer */
  const go = (path: string) => {
    router.push(path as any);
    const parent = navigation.getParent?.();
    if (parent && parent.getState?.().type === 'drawer') {
      parent.dispatch(DrawerActions.closeDrawer());
    }
  };

  /* logout flow */
  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      go('/');
    }
  };

  // Select menu items based on role
  const menuItems = role === 'vendor' ? vendorMenuItems : userMenuItems;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* profile header */}
      <TouchableOpacity 
        style={styles.profile} 
        onPress={() => go(role === 'vendor' ? '/(vendor)/profile' : '/(tabs)/profile')} 
        activeOpacity={0.8}
      >
        {(displayAvatar || contextAvatar) ? (
          <Image source={{ uri: (displayAvatar || contextAvatar) as string }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, { backgroundColor: role === 'vendor' ? '#f0e6ff' : '#ffe4e6' }]}>
            <Ionicons 
              name={role === 'vendor' ? 'business' : 'person'} 
              size={40} 
              color={role === 'vendor' ? '#7c26ff' : '#e22f2f'} 
            />
          </View>
        )}
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.viewProfile}>View Profile</Text>
        {role === 'vendor' && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Vendor</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.separator} />

      {/* regular items */}
      {menuItems.map(item => (
        <TouchableOpacity key={item.route} style={styles.menuItem} onPress={() => go(item.route)} activeOpacity={0.7}>
          {renderIcon(item)}
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}

      {/* logout item */}
      <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
        <Ionicons name="log-out-outline" size={22} color="#333" />
        <Text style={styles.menuLabel}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/* styles */
const styles = StyleSheet.create({
  container:   { padding:16, backgroundColor:'#fff' },
  profile:     { alignItems:'center', marginBottom:16 },
  avatar:      { width:80, height:80, borderRadius:40, marginBottom:10, justifyContent:'center', alignItems:'center' },
  name:        { fontSize:18, fontWeight:'700' },
  viewProfile: { fontSize:14, color:'#777' },
  roleBadge:   { backgroundColor:'#7c26ff', paddingHorizontal:12, paddingVertical:4, borderRadius:12, marginTop:8 },
  roleBadgeText: { color:'#fff', fontSize:12, fontWeight:'600' },
  separator:   { height:1, backgroundColor:'#ccc', marginVertical:12 },
  menuItem:    { flexDirection:'row', alignItems:'center', paddingVertical:12 },
  menuLabel:   { marginLeft:16, fontSize:16, color:'#333' },
});

export default DrawerContent;
