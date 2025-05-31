// components/DrawerContent.tsx
import React from 'react';
// Removed DrawerContentProps import due to expo-router/drawer typings issue

import { Entypo, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const menuItems = [
  { icon: 'mail-outline', label: 'Inbox', iconType: 'Ionicons' },
  { icon: 'calendar-today', label: 'My Bookings', iconType: 'MaterialIcons' },
  { icon: 'clipboard-outline', label: 'Planning', iconType: 'Ionicons' },
  { icon: 'mail-open-outline', label: 'E-Invites', iconType: 'Ionicons' },
  { icon: 'star-outline', label: 'Write a Review', iconType: 'Ionicons' },
  { icon: 'document-text-outline', label: 'Packages', iconType: 'Ionicons' },
  { icon: 'thumbs-up-outline', label: 'Recommendation', iconType: 'Ionicons' },
  { icon: 'shopping-bag', label: 'Shop', iconType: 'MaterialIcons' },
  { icon: 'gift-outline', label: 'Promotions', iconType: 'Ionicons' },
  { icon: 'call-outline', label: 'Contact Support', iconType: 'Ionicons' },
  { icon: 'information-circle-outline', label: 'Information', iconType: 'Ionicons' },
  { icon: 'star', label: 'Rate on App Store', iconType: 'FontAwesome' },
  { icon: 'share', label: 'Share', iconType: 'Entypo' },
];

const renderIcon = (item: typeof menuItems[0]) => {
  switch (item.iconType) {
    case 'MaterialIcons':
      return <MaterialIcons name={item.icon as any} size={22} color="#333" />;
    case 'FontAwesome':
      return <FontAwesome name={item.icon as any} size={22} color="#333" />;
    case 'Entypo':
      return <Entypo name={item.icon as any} size={22} color="#333" />;
    default:
      return <Ionicons name={item.icon as any} size={22} color="#333" />;
  }
};

const DrawerContent: React.FC = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profile}>
        <View style={styles.avatarPlaceholder} />
        <Text style={styles.name}>Malik Faizan</Text>
        <Text style={styles.viewProfile}>View Profile</Text>
      </View>
      <View style={styles.separator} />
      {menuItems.map((item, index) => (
        <TouchableOpacity key={index} style={styles.menuItem}>
          {renderIcon(item)}
          <Text style={styles.menuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  profile: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ccc',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewProfile: {
    fontSize: 14,
    color: '#777',
  },
  separator: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuLabel: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
});

export default DrawerContent;
