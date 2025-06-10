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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

/* ────────── menu configuration ────────── */
const menuItems = [
  { icon: 'mail-outline',          label: 'Inbox',           iconType: 'Ionicons',     route: '/inbox' },
  { icon: 'calendar-today',        label: 'My Bookings',     iconType: 'MaterialIcons',route: '/bookings' },
  { icon: 'clipboard-outline',     label: 'Planning',        iconType: 'Ionicons',     route: '/planning' },
  { icon: 'mail-open-outline',     label: 'E-Invites',       iconType: 'Ionicons',     route: '/einvite' },
  { icon: 'star-outline',          label: 'Write a Review',  iconType: 'Ionicons',     route: '/review' },
  { icon: 'document-text-outline', label: 'Packages',        iconType: 'Ionicons',     route: '/packages' },
  { icon: 'thumbs-up-outline',     label: 'Recommendation',  iconType: 'Ionicons',     route: '/recommendations' },
  { icon: 'shopping-bag',          label: 'Shop',            iconType: 'MaterialIcons',route: '/shop' },
  { icon: 'gift-outline',          label: 'Promotions',      iconType: 'Ionicons',     route: '/promotions' },
  { icon: 'call-outline',          label: 'Contact Support', iconType: 'Ionicons',     route: '/support' },
  { icon: 'information-circle-outline', label: 'Information',iconType: 'Ionicons',     route: '/info' },
  { icon: 'star',                  label: 'Rate on Store',   iconType: 'FontAwesome',  route: '/rate' },
  { icon: 'share',                 label: 'Share',           iconType: 'Entypo',       route: '/share' },
];

/* icon helper */
const renderIcon = (item: typeof menuItems[0]) => {
  switch (item.iconType) {
    case 'MaterialIcons':
      return <MaterialIcons name={item.icon as any} size={22} color="#333" />;
    case 'FontAwesome':
      return <FontAwesome   name={item.icon as any} size={22} color="#333" />;
    case 'Entypo':
      return <Entypo        name={item.icon as any} size={22} color="#333" />;
    default:
      return <Ionicons      name={item.icon as any} size={22} color="#333" />;
  }
};

const DrawerContent: React.FC = () => {
  const router     = useRouter();
  const navigation = useNavigation();

  /* navigate & close drawer if present */
  const go = (path: string) => {
    router.push(path as any);                       // navigate

    const parent = navigation.getParent?.();
    if (parent && parent.getState?.().type === 'drawer') {
      parent.dispatch(DrawerActions.closeDrawer()); // close drawer only when valid
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* profile header */}
      <TouchableOpacity style={styles.profile} activeOpacity={0.8} onPress={() => go('/profile')}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.name}>Malik Faizan</Text>
        <Text style={styles.viewProfile}>View Profile</Text>
      </TouchableOpacity>

      <View style={styles.separator} />

      {/* menu list */}
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.menuItem}
          activeOpacity={0.7}
          onPress={() => go(item.route)}
        >
          {renderIcon(item)}
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

/* ────────── styles ────────── */
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff' },

  profile: { alignItems: 'center', marginBottom: 16 },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  viewProfile: { fontSize: 14, color: '#777' },

  separator: { height: 1, backgroundColor: '#ccc', marginVertical: 12 },

  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  menuLabel: { marginLeft: 16, fontSize: 16, color: '#333' },
});

export default DrawerContent;
