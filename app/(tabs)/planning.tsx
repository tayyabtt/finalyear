// app/planning.tsx
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/* ---------- helpers ---------- */
const uuid = () => Math.random().toString(36).slice(2, 9);
const pkr = (v: number) => `PKR ${v.toLocaleString()}`;

/* ---------- mock budget ---------- */
const BUDGET = [
  { id: 'b1', label: 'Venue', planned: 400000, spent: 325000 },
  { id: 'b2', label: 'Catering', planned: 200000, spent: 75000 },
  { id: 'b3', label: 'Photo', planned: 150000, spent: 25000 },
];

export default function PlanningScreen() {
  const router = useRouter();

  /* checklist + notes state */
  const [tasks, setTasks] = useState([
    { id: uuid(), title: 'Book venue', done: false },
    { id: uuid(), title: 'Send invitations', done: false },
  ]);
  const [notes, setNotes] = useState([
    { id: uuid(), text: 'Confirm makeup trial next week.' },
  ]);

  const [inputTask, setInputTask] = useState('');
  const [inputNote, setInputNote] = useState('');

  /* derived */
  const completed = tasks.filter(t => t.done).length;
  const progress = tasks.length ? completed / tasks.length : 0;

  /* handlers */
  const addTask = () => {
    if (!inputTask.trim()) return;
    setTasks([{ id: uuid(), title: inputTask.trim(), done: false }, ...tasks]);
    setInputTask('');
  };
  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  };
  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  const addNote = () => {
    if (!inputNote.trim()) return;
    setNotes([{ id: uuid(), text: inputNote.trim() }, ...notes]);
    setInputNote('');
  };
  const removeNote = (id: string) => setNotes(notes.filter(n => n.id !== id));

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Planning Dashboard</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Countdown */}
        <View style={styles.cardCountdown}>
          <MaterialCommunityIcons name="calendar-heart" size={32} color="#e22f2f" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.countdownDays}>120</Text>
            <Text style={styles.countdownLabel}>days until wedding</Text>
          </View>
        </View>

        {/* Checklist */}
        <Text style={styles.section}>Checklist</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={inputTask}
            onChangeText={setInputTask}
            placeholder="Add a task..."
            style={styles.input}
          />
          <TouchableOpacity onPress={addTask}>
            <Ionicons name="add-circle" size={28} color="#e22f2f" />
          </TouchableOpacity>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {completed}/{tasks.length} tasks completed
        </Text>

        {tasks.map(t => (
          <View key={t.id} style={styles.taskRow}>
            <TouchableOpacity onPress={() => toggleTask(t.id)}>
              <Ionicons
                name={t.done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={t.done ? '#4caf50' : '#777'}
              />
            </TouchableOpacity>
            <Text
              style={[
                styles.taskText,
                t.done && { textDecorationLine: 'line-through', color: '#999' },
              ]}
            >
              {t.title}
            </Text>
            <TouchableOpacity onPress={() => removeTask(t.id)}>
              <Ionicons name="trash" size={20} color="#e22f2f" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Budget Snapshot */}
        <Text style={styles.section}>Budget Snapshot</Text>
        <FlatList
          data={BUDGET}
          keyExtractor={i => i.id}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const spentPct = item.spent / item.planned;
            return (
              <View style={styles.budgetRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.budgetLabel}>{item.label}</Text>
                  <View style={styles.budgetBar}>
                    <View style={[styles.budgetFill, { width: `${spentPct * 100}%` }]} />
                  </View>
                  <Text style={styles.budgetText}>
                    {pkr(item.spent)} / {pkr(item.planned)}
                  </Text>
                </View>
                <Ionicons name="cash-outline" size={22} color="#e22f2f" />
              </View>
            );
          }}
        />

        {/* Notes */}
        <Text style={styles.section}>Notes</Text>
        <View style={styles.inputRow}>
          <TextInput
            value={inputNote}
            onChangeText={setInputNote}
            placeholder="Write a note..."
            style={styles.input}
          />
          <TouchableOpacity onPress={addNote}>
            <Ionicons name="add-circle" size={28} color="#e22f2f" />
          </TouchableOpacity>
        </View>

        {notes.map(n => (
          <View key={n.id} style={styles.noteCard}>
            <Text style={styles.noteText}>{n.text}</Text>
            <TouchableOpacity onPress={() => removeNote(n.id)}>
              <Ionicons name="close-circle" size={20} color="#e22f2f" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#e22f2f', borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
  },
  title: { fontSize: 20, fontWeight: '700', color: '#fff' },

  cardCountdown: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 16, borderRadius: 14,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 3,
    marginBottom: 24,
  },
  countdownDays: { fontSize: 32, fontWeight: '800', color: '#e22f2f' },
  countdownLabel: { color: '#666', marginTop: -4 },

  section: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },

  /* checklist */
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  input: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    marginRight: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  progressBar: { height: 8, backgroundColor: '#eee', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: '#4caf50' },
  progressText: { marginTop: 6, marginBottom: 8, color: '#666' },
  taskRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  taskText: { marginLeft: 8, marginRight: 8, fontSize: 15, flex: 1 },

  /* budget */
  budgetRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 12,
    shadowColor: '#000', shadowRadius: 4, shadowOpacity: 0.05, elevation: 2,
  },
  budgetLabel: { fontWeight: '600', marginBottom: 6 },
  budgetBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, overflow: 'hidden' },
  budgetFill: { height: 6, backgroundColor: '#ffb74d' },
  budgetText: { fontSize: 12, color: '#666', marginTop: 4 },

  /* notes */
  noteCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 10,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  noteText: { flex: 1, marginRight: 8, lineHeight: 18, color: '#333' },
});
