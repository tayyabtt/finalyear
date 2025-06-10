import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PlanningScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* simple header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Planning</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* placeholder */}
      <View style={styles.center}>
        <Text style={{ fontSize: 16, color: '#777' }}>
          Your wedding-planning dashboard will live here.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: '#fafafa' },
  header: { flexDirection: 'row', alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#e22f2f',
            paddingHorizontal: 16, paddingVertical: 12,
            borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  title:  { fontSize: 20, fontWeight: '700', color: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
});
