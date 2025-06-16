// components/DrawerContent.tsx
import {
  Entypo,
  FontAwesome,
  Ionicons,
  MaterialIcons,
} from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useProfile } from '../app/(tabs)/ProfileContext'; // ← correct relative path

/* types */
interface MenuItem {
  icon: string;
  label: string;
  iconType: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'Entypo';
  route: string;
}

/* menu items */
const menuItems: MenuItem[] = [
  { icon: 'mail-outline', label: 'Inbox', iconType: 'Ionicons', route: '/inbox' },
  { icon: 'calendar-today', label: 'My Bookings', iconType: 'MaterialIcons', route: '/bookings' },
  { icon: 'clipboard-outline', label: 'Planning', iconType: 'Ionicons', route: '/planning' },
  { icon: 'mail-open-outline', label: 'E-Invites', iconType: 'Ionicons', route: '/einvite' },
  { icon: 'star-outline', label: 'Write a Review', iconType: 'Ionicons', route: '/review' },
  { icon: 'document-text-outline', label: 'E-Salami', iconType: 'Ionicons', route: '/packages' },
  { icon: 'thumbs-up-outline', label: 'Recommendations', iconType: 'Ionicons', route: '/recommendations' },
  { icon: 'shopping-bag', label: 'Shop', iconType: 'MaterialIcons', route: '/shop' },
  { icon: 'gift-outline', label: 'Promotions', iconType: 'Ionicons', route: '/promotions' },
  { icon: 'call-outline', label: 'Contact Support', iconType: 'Ionicons', route: '/support' },
  { icon: 'information-circle-outline', label: 'Information', iconType: 'Ionicons', route: '/info' },
  { icon: 'star', label: 'Rate on Store', iconType: 'FontAwesome', route: '/rate' },
  { icon: 'share', label: 'Share', iconType: 'Entypo', route: '/share' },
];

/* icon factory */
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
  const { avatar, name } = useProfile();                  // live state

  const go = (path: string) => {
    router.push(path as any);
    const p = navigation.getParent?.();
    if (p && p.getState?.().type === 'drawer') p.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* profile header */}
      <TouchableOpacity style={styles.profile} onPress={() => go('/profile')} activeOpacity={0.8}>
        {avatar
          ? <Image source={{ uri: avatar }} style={styles.avatar} />
          : <Image source={require('../assets/images/faizan.jpg')} style={styles.avatar} />}
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.viewProfile}>View Profile</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {menuItems.map(item => (
        <TouchableOpacity key={item.route} style={styles.menuItem} onPress={() => go(item.route)} activeOpacity={0.7}>
          {renderIcon(item)}
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/* styles */
const styles = StyleSheet.create({
  container:{ padding:16, backgroundColor:'#fff' },
  profile:{ alignItems:'center', marginBottom:16 },
  avatar:{ width:80, height:80, borderRadius:40, marginBottom:10 },
  name:{ fontSize:18, fontWeight:'700' },
  viewProfile:{ fontSize:14, color:'#777' },
  separator:{ height:1, backgroundColor:'#ccc', marginVertical:12 },
  menuItem:{ flexDirection:'row', alignItems:'center', paddingVertical:12 },
  menuLabel:{ marginLeft:16, fontSize:16, color:'#333' },
});

export default DrawerContent;
