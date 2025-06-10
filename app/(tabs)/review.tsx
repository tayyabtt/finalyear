// app/(tabs)/review.tsx – Write-a-Review screen
import { Ionicons } from '@expo/vector-icons';
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

/* ────────── types & seed data ────────── */
interface VendorToRate {
  id: string;
  name: string;
  service: string;
  date: string; // YYYY-MM-DD
}

const todo: VendorToRate[] = [
  { id: 'venue',   name: 'VenueX',     service: 'Banquet Hall',  date: '2025-12-21' },
  { id: 'makeup',  name: 'MakeupPro',  service: 'Bridal Makeup', date: '2025-12-20' },
  { id: 'cater',   name: 'CateringCo', service: 'Dinner Buffet', date: '2025-12-21' },
];

/* ────────── main component ────────── */
export default function ReviewScreen() {
  const router = useRouter();

  const [modalOpen,   setModalOpen]   = useState(false);
  const [selected,    setSelected]    = useState<VendorToRate | null>(null);
  const [stars,       setStars]       = useState(0);
  const [comment,     setComment]     = useState('');

  const openForm = (v: VendorToRate) => { setSelected(v); setStars(0); setComment(''); setModalOpen(true); };

  const handleSubmit = () => {
    console.log('Submitted review:', { selected, stars, comment });
    setModalOpen(false);
  };

  const renderVendor = ({ item }: { item: VendorToRate }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => openForm(item)}>
      <View style={styles.avatar}><Ionicons name="business" size={20} color="#fff" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.service}>{item.service} • {item.date}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </TouchableOpacity>
  );

  /* ───── screen ───── */
  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Write a Review</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* list of pending reviews */}
      <FlatList
        data={todo}
        keyExtractor={i => i.id}
        renderItem={renderVendor}
        contentContainerStyle={{ padding: 16 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
      />

      {/* bottom-sheet modal */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {/* header row inside modal */}
            <Text style={styles.sheetTitle}>{selected?.name}</Text>

            {/* stars */}
            <View style={styles.starRow}>
              {[1,2,3,4,5].map(i => (
                <Pressable key={i} onPress={() => setStars(i)}>
                  <Ionicons
                    name={i <= stars ? 'star' : 'star-outline'}
                    size={28}
                    color="#e22f2f"
                    style={{ marginHorizontal: 4 }}
                  />
                </Pressable>
              ))}
            </View>

            {/* comment box */}
            <TextInput
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Write something nice…"
              style={styles.commentBox}
            />

            {/* actions */}
            <View style={styles.actionRow}>
              <Pressable style={styles.cancelBtn} onPress={() => setModalOpen(false)}>
                <Text style={{ color: '#e22f2f', fontWeight: '600' }}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.submitBtn, { opacity: stars ? 1 : 0.4 }]}
                disabled={!stars}
                onPress={handleSubmit}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>Submit</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ────────── styles ────────── */
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#e22f2f', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },

  /* list card */
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    padding: 16, borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 },
  },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e22f2f',
            justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  name:    { fontSize: 16, fontWeight: '600', color: '#333' },
  service: { fontSize: 13, color: '#777', marginTop: 2 },

  /* modal / sheet */
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
  sheet:    { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  sheetTitle:{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 16 },

  starRow:  { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },

  commentBox: {
    minHeight: 90, borderWidth: 1, borderColor: '#ddd', borderRadius: 12,
    padding: 12, textAlignVertical: 'top', fontSize: 15,
  },

  actionRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginTop: 20,
  },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: '#e22f2f' },
  submitBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, backgroundColor: '#e22f2f' },
});
