// app/(tabs)/booking.tsx – Polished Booking Manager UI
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Booking {
  id: string;
  vendor: string;
  service: string;
  date: string; // YYYY‑MM‑DD
  status: 'Confirmed' | 'Pending' | 'Cancelled';
}

const seed: Booking[] = [
  { id: '1', vendor: 'VenueX',     service: 'Banquet Hall',  date: '2025-12-21', status: 'Confirmed' },
  { id: '2', vendor: 'MakeupPro',  service: 'Bridal Makeup', date: '2025-12-20', status: 'Pending'    },
  { id: '3', vendor: 'CateringCo', service: 'Dinner Buffet', date: '2025-12-21', status: 'Confirmed' },
  { id: '4', vendor: 'PlannerCo',  service: 'Full Planning', date: '2025-08-01', status: 'Confirmed' },
];

const badgeColors = (s: Booking['status']) =>
  s === 'Confirmed' ? { bg: '#c8e6c9', txt: '#256029' } :
  s === 'Pending'   ? { bg: '#fff3cd', txt: '#7c4d00' } :
                      { bg: '#f8d7da', txt: '#842029' };

export default function BookingScreen() {
  const router = useRouter();
  const [list,    setList]    = useState(seed);
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);

  const filtered = list.filter(b =>
    `${b.vendor} ${b.service}`.toLowerCase().includes(query.toLowerCase())
  );

  const addDummy = () => {
    setList(p => [
      ...p,
      { id: Date.now().toString(), vendor: 'DecoratorX', service: 'Stage Decor', date: '2025-11-15', status: 'Pending' },
    ]);
    setOpen(false);
  };

  const Card = ({ item }: { item: Booking }) => {
    const c = badgeColors(item.status);
    return (
      <View style={styles.card}>
        <View style={styles.avatarCircle}>
          <MaterialIcons name="business-center" size={20} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.vendor}>{item.vendor}</Text>
          <Text style={styles.service}>{item.service}</Text>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <View style={[styles.badge, { backgroundColor: c.bg }]}> 
          <Text style={[styles.badgeTxt, { color: c.txt }]}>{item.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* header */}
      <View style={styles.header}> 
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={() => setOpen(true)}>
          <Ionicons name="add-circle" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color="#888" />
        <TextInput
          placeholder="Search vendor or service"
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        renderItem={Card}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setOpen(true)}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* modal */}
      <Modal visible={open} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Quick Add (demo)</Text>
            <Pressable style={styles.saveBtn} onPress={addDummy}>
              <Ionicons name="save" size={20} color="#fff" />
              <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>Add Dummy Booking</Text>
            </Pressable>
            <Pressable style={styles.modalClose} onPress={() => setOpen(false)}>
              <Ionicons name="close" size={24} color="#e22f2f" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e22f2f', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    shadowColor: '#e22f2f', shadowOpacity: 0.25, shadowRadius: 6, shadowOffset: { width: 0, height: 4 },
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 16,
    backgroundColor: '#fff', borderRadius: 30, paddingHorizontal: 14, height: 42,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },

  card: {
    flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  avatarCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e22f2f', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  vendor:  { fontSize: 16, fontWeight: '600', color: '#333' },
  service: { fontSize: 14, color: '#555', marginTop: 2 },
  date:    { fontSize: 12, color: '#888', marginTop: 4 },

  badge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 10 },
  badgeTxt: { fontSize: 11, fontWeight: '600' },

  fab: {
    position: 'absolute', bottom: 24, right: 24, backgroundColor: '#e22f2f',
    width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, shadowOffset: { width: 0, height: 3 },
  },

  /* modal */
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  saveBtn: { flexDirection: 'row', backgroundColor: '#e22f2f', paddingVertical: 12, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  modalClose: { position: 'absolute', top: 10, right: 16 },
});
