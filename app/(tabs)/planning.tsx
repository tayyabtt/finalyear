/* eslint-disable react-native/no-inline-styles */
// app/(tabs)/planning.tsx - Wedding Planning Dashboard
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Linking,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get('window');
const uuid = () => Math.random().toString(36).slice(2, 9);
const pkr = (v: number) => `PKR ${v.toLocaleString()}`;

interface Task { id: string; title: string; done: boolean; }
interface BudgetItem { id: string; label: string; planned: number; spent: number; }
interface VendorContact { id: string; name: string; type: string; phone: string; }

export default function PlanningScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Wedding date state
  const [weddingDate, setWeddingDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  // Checklist state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [inputTask, setInputTask] = useState('');
  
  // Budget state
  const [budget, setBudget] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(0);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItem | null>(null);
  const [budgetInput, setBudgetInput] = useState({ label: '', planned: '', spent: '' });
  const [editBudgetInput, setEditBudgetInput] = useState({ planned: '', spent: '', addMore: '' });
  
  // Vendor contacts from bookings
  const [vendorContacts, setVendorContacts] = useState<VendorContact[]>([]);
  
  // Animations
  const pulseAnim = useState(new Animated.Value(1))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    loadPlanningData();
    loadVendorContacts();
    startAnimations();
  }, []);

  useEffect(() => {
    if (weddingDate) {
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    }
  }, [weddingDate]);

  const startAnimations = () => {
    // Fade in animation
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    
    // Pulse animation for countdown
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const updateCountdown = () => {
    if (!weddingDate) return;
    const now = new Date().getTime();
    const wedding = new Date(weddingDate).getTime();
    const diff = wedding - now;
    
    if (diff <= 0) {
      setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }
    
    setCountdown({
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
      minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      seconds: Math.floor((diff % (1000 * 60)) / 1000),
    });
  };

  const loadPlanningData = async () => {
    try {
      const stored = await AsyncStorage.getItem('@wedding_planning_v2');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.weddingDate) setWeddingDate(new Date(data.weddingDate));
        if (data.tasks) setTasks(data.tasks);
        if (data.budget) setBudget(data.budget);
        if (data.totalBudget) setTotalBudget(data.totalBudget);
      }
    } catch (error) {
      console.error('Error loading planning data:', error);
    }
  };

  const savePlanningData = async () => {
    try {
      await AsyncStorage.setItem('@wedding_planning_v2', JSON.stringify({
        weddingDate: weddingDate?.toISOString(),
        tasks,
        budget,
        totalBudget,
      }));
    } catch (error) {
      console.error('Error saving planning data:', error);
    }
  };

  useEffect(() => { savePlanningData(); }, [tasks, budget, totalBudget, weddingDate]);

  const loadVendorContacts = async () => {
    if (!user) return;
    try {
      const db = getFirestore();
      const bookingsRef = collection(db, 'bookings');
      const q = query(bookingsRef, where('userId', '==', user.uid), where('status', '==', 'accepted'));
      const snapshot = await getDocs(q);
      
      const contacts: VendorContact[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        contacts.push({
          id: doc.id,
          name: data.vendorName || 'Vendor',
          type: data.serviceType || 'Service',
          phone: data.vendorPhone || '',
        });
      });
      setVendorContacts(contacts);
    } catch (error) {
      console.error('Error loading vendor contacts:', error);
    }
  };

  // Task handlers
  const addTask = () => {
    if (!inputTask.trim()) return;
    setTasks([{ id: uuid(), title: inputTask.trim(), done: false }, ...tasks]);
    setInputTask('');
  };
  const toggleTask = (id: string) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const removeTask = (id: string) => setTasks(tasks.filter(t => t.id !== id));

  // Budget handlers
  const addBudgetItem = () => {
    if (!budgetInput.label.trim() || !budgetInput.planned) return;
    setBudget([...budget, {
      id: uuid(),
      label: budgetInput.label.trim(),
      planned: parseInt(budgetInput.planned) || 0,
      spent: parseInt(budgetInput.spent) || 0,
    }]);
    setBudgetInput({ label: '', planned: '', spent: '' });
    setShowBudgetModal(false);
  };
  const removeBudgetItem = (id: string) => setBudget(budget.filter(b => b.id !== id));
  const updateSpent = (id: string, spent: number) => setBudget(budget.map(b => b.id === id ? { ...b, spent } : b));
  
  const openEditBudget = (item: BudgetItem) => {
    setEditingBudget(item);
    setEditBudgetInput({ 
      planned: item.planned.toString(), 
      spent: item.spent.toString(),
      addMore: ''
    });
    setShowEditBudgetModal(true);
  };
  
  const saveEditBudget = () => {
    if (!editingBudget) return;
    const newPlanned = parseInt(editBudgetInput.planned) || editingBudget.planned;
    const newSpent = parseInt(editBudgetInput.spent) || 0;
    const addMore = parseInt(editBudgetInput.addMore) || 0;
    
    setBudget(budget.map(b => b.id === editingBudget.id ? {
      ...b,
      planned: newPlanned + addMore,
      spent: newSpent,
    } : b));
    
    setShowEditBudgetModal(false);
    setEditingBudget(null);
    setEditBudgetInput({ planned: '', spent: '', addMore: '' });
  };

  const totalPlanned = budget.reduce((sum, b) => sum + b.planned, 0);
  const totalSpent = budget.reduce((sum, b) => sum + b.spent, 0);
  const completed = tasks.filter(t => t.done).length;
  const progress = tasks.length ? completed / tasks.length : 0;

  // Date selection screen
  if (!weddingDate) {
    return (
      <View style={styles.dateSelectContainer}>
        <LinearGradient colors={['#e22f2f', '#ff6b6b', '#ee5a5a']} style={styles.dateSelectGradient}>
          <Animated.View style={{ opacity: fadeAnim, alignItems: 'center' }}>
            <MaterialCommunityIcons name="heart-multiple" size={80} color="#fff" />
            <Text style={styles.dateSelectTitle}>When's the Big Day?</Text>
            <Text style={styles.dateSelectSubtitle}>Select your wedding date to start planning</Text>
            
            <TouchableOpacity style={styles.dateSelectBtn} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar" size={24} color="#e22f2f" />
              <Text style={styles.dateSelectBtnText}>Choose Wedding Date</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.skipBtn} onPress={() => router.back()}>
              <Text style={styles.skipBtnText}>Go Back</Text>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
        
        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setWeddingDate(selectedDate);
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#e22f2f', '#ff6b6b']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Wedding Planner</Text>
        <TouchableOpacity onPress={() => Alert.alert('Reset Date?', 'Do you want to change your wedding date?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Change', onPress: () => setWeddingDate(null) }
        ])}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Countdown Timer */}
        <Animated.View style={[styles.countdownCard, { transform: [{ scale: pulseAnim }] }]}>
          <LinearGradient colors={['#1e1b4b', '#312e81', '#4338ca']} style={styles.countdownGradient}>
            <MaterialCommunityIcons name="calendar-heart" size={36} color="#fbbf24" />
            <Text style={styles.countdownTitle}>Countdown to Your Big Day</Text>
            <Text style={styles.countdownDate}>
              {weddingDate.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            
            <View style={styles.timerRow}>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{countdown.days}</Text>
                <Text style={styles.timerLabel}>Days</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{countdown.hours.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Hours</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{countdown.minutes.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Mins</Text>
              </View>
              <Text style={styles.timerColon}>:</Text>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{countdown.seconds.toString().padStart(2, '0')}</Text>
                <Text style={styles.timerLabel}>Secs</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Checklist Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="checkbox" size={22} color="#e22f2f" />
          <Text style={styles.sectionTitle}>Wedding Checklist</Text>
        </View>
        
        <View style={styles.inputRow}>
          <TextInput
            value={inputTask}
            onChangeText={setInputTask}
            placeholder="Add a task (e.g., Book venue)"
            placeholderTextColor="#999"
            style={styles.input}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {tasks.length > 0 && (
          <>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.progressText}>{completed}/{tasks.length} completed</Text>
            </View>

            {tasks.map(t => (
              <View key={t.id} style={styles.taskCard}>
                <TouchableOpacity onPress={() => toggleTask(t.id)} style={styles.taskCheck}>
                  <Ionicons
                    name={t.done ? 'checkmark-circle' : 'ellipse-outline'}
                    size={26}
                    color={t.done ? '#10b981' : '#ccc'}
                  />
                </TouchableOpacity>
                <Text style={[styles.taskText, t.done && styles.taskDone]}>{t.title}</Text>
                <TouchableOpacity onPress={() => removeTask(t.id)}>
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="list-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No tasks yet. Add your first task above!</Text>
          </View>
        )}

        {/* Budget Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="wallet" size={22} color="#e22f2f" />
          <Text style={styles.sectionTitle}>Budget Tracker</Text>
          <TouchableOpacity onPress={() => setShowBudgetModal(true)} style={styles.addSmallBtn}>
            <Ionicons name="add" size={20} color="#e22f2f" />
          </TouchableOpacity>
        </View>

        {budget.length > 0 && (
          <View style={styles.budgetSummary}>
            <View style={styles.budgetSummaryItem}>
              <Text style={styles.budgetSummaryLabel}>Total Budget</Text>
              <Text style={styles.budgetSummaryValue}>{pkr(totalPlanned)}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetSummaryItem}>
              <Text style={styles.budgetSummaryLabel}>Spent</Text>
              <Text style={[styles.budgetSummaryValue, { color: '#ef4444' }]}>{pkr(totalSpent)}</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetSummaryItem}>
              <Text style={styles.budgetSummaryLabel}>Remaining</Text>
              <Text style={[styles.budgetSummaryValue, { color: '#10b981' }]}>{pkr(totalPlanned - totalSpent)}</Text>
            </View>
          </View>
        )}

        {budget.map(b => {
          const pct = b.planned > 0 ? (b.spent / b.planned) * 100 : 0;
          const isOver = pct > 100;
          return (
            <TouchableOpacity key={b.id} style={styles.budgetCard} onPress={() => openEditBudget(b)} activeOpacity={0.7}>
              <View style={styles.budgetCardHeader}>
                <Text style={styles.budgetLabel}>{b.label}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <TouchableOpacity onPress={() => openEditBudget(b)}>
                    <Ionicons name="create-outline" size={18} color="#7c26ff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => removeBudgetItem(b.id)}>
                    <Ionicons name="close-circle" size={20} color="#ccc" />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.budgetBarContainer}>
                <View style={[styles.budgetBar, { backgroundColor: isOver ? '#fecaca' : '#e5e7eb' }]}>
                  <View style={[styles.budgetFill, { width: `${Math.min(pct, 100)}%`, backgroundColor: isOver ? '#ef4444' : '#10b981' }]} />
                </View>
                <Text style={styles.budgetPct}>{pct.toFixed(0)}%</Text>
              </View>
              <View style={styles.budgetAmounts}>
                <Text style={styles.budgetSpent}>{pkr(b.spent)} spent</Text>
                <Text style={styles.budgetPlanned}>of {pkr(b.planned)}</Text>
              </View>
              {isOver && (
                <View style={styles.overBudgetWarning}>
                  <Ionicons name="warning" size={14} color="#ef4444" />
                  <Text style={styles.overBudgetText}>Over budget by {pkr(b.spent - b.planned)}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {budget.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cash-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No budget items. Tap + to add categories!</Text>
          </View>
        )}

        {/* Vendor Contacts Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={22} color="#e22f2f" />
          <Text style={styles.sectionTitle}>Your Vendors</Text>
        </View>

        {vendorContacts.length > 0 ? (
          vendorContacts.map(v => (
            <View key={v.id} style={styles.vendorCard}>
              <View style={styles.vendorIcon}>
                <Ionicons name="business" size={24} color="#7c26ff" />
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{v.name}</Text>
                <Text style={styles.vendorType}>{v.type}</Text>
                {v.phone && <Text style={styles.vendorPhone}>{v.phone}</Text>}
              </View>
              <View style={styles.vendorActions}>
                {v.phone && (
                  <>
                    <TouchableOpacity style={styles.vendorBtn} onPress={() => Linking.openURL(`tel:${v.phone}`)}>
                      <Ionicons name="call" size={18} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.vendorBtn, { backgroundColor: '#10b981' }]} onPress={() => Linking.openURL(`sms:${v.phone}`)}>
                      <Ionicons name="chatbubble" size={18} color="#fff" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="briefcase-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No booked vendors yet.{'\n'}Book vendors to see them here!</Text>
          </View>
        )}
      </ScrollView>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Budget Category</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Category (e.g., Venue, Catering)"
              placeholderTextColor="#999"
              value={budgetInput.label}
              onChangeText={t => setBudgetInput({ ...budgetInput, label: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Planned Amount (PKR)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={budgetInput.planned}
              onChangeText={t => setBudgetInput({ ...budgetInput, planned: t })}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Already Spent (PKR) - Optional"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={budgetInput.spent}
              onChangeText={t => setBudgetInput({ ...budgetInput, spent: t })}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setShowBudgetModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAdd} onPress={addBudgetItem}>
                <Text style={styles.modalBtnAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal visible={showEditBudgetModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingBudget?.label}</Text>
            
            <Text style={styles.modalLabel}>Current Budget</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Planned Amount (PKR)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={editBudgetInput.planned}
              onChangeText={t => setEditBudgetInput({ ...editBudgetInput, planned: t })}
            />
            
            <Text style={styles.modalLabel}>Amount Spent</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Spent Amount (PKR)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={editBudgetInput.spent}
              onChangeText={t => setEditBudgetInput({ ...editBudgetInput, spent: t })}
            />
            
            <View style={styles.addMoreSection}>
              <Ionicons name="add-circle" size={20} color="#10b981" />
              <Text style={styles.addMoreTitle}>Need More Budget?</Text>
            </View>
            <TextInput
              style={[styles.modalInput, { borderColor: '#10b981' }]}
              placeholder="Add extra amount (PKR)"
              placeholderTextColor="#999"
              keyboardType="number-pad"
              value={editBudgetInput.addMore}
              onChangeText={t => setEditBudgetInput({ ...editBudgetInput, addMore: t })}
            />
            {editBudgetInput.addMore && parseInt(editBudgetInput.addMore) > 0 && (
              <Text style={styles.newTotalText}>
                New total: {pkr((parseInt(editBudgetInput.planned) || 0) + (parseInt(editBudgetInput.addMore) || 0))}
              </Text>
            )}
            
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => {
                setShowEditBudgetModal(false);
                setEditingBudget(null);
              }}>
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalBtnAdd} onPress={saveEditBudget}>
                <Text style={styles.modalBtnAddText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Date Selection Screen
  dateSelectContainer: { flex: 1 },
  dateSelectGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  dateSelectTitle: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 24, textAlign: 'center' },
  dateSelectSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 8, textAlign: 'center' },
  dateSelectBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, marginTop: 40 },
  dateSelectBtnText: { fontSize: 18, fontWeight: '700', color: '#e22f2f', marginLeft: 12 },
  skipBtn: { marginTop: 20, padding: 12 },
  skipBtnText: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, paddingTop: 50, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  
  // Countdown
  countdownCard: { marginBottom: 24, borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 },
  countdownGradient: { padding: 24, alignItems: 'center' },
  countdownTitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 12 },
  countdownDate: { fontSize: 14, color: '#fbbf24', fontWeight: '600', marginTop: 4 },
  timerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  timerBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16, alignItems: 'center', minWidth: 60 },
  timerValue: { fontSize: 28, fontWeight: '800', color: '#fff' },
  timerLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2, textTransform: 'uppercase' },
  timerColon: { fontSize: 28, fontWeight: '800', color: '#fff', marginHorizontal: 6 },
  
  // Section Headers
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginLeft: 8, flex: 1 },
  addSmallBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fee2e2', justifyContent: 'center', alignItems: 'center' },
  
  // Input Row
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, marginRight: 10 },
  addBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#e22f2f', justifyContent: 'center', alignItems: 'center' },
  
  // Progress
  progressContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  progressBar: { flex: 1, height: 8, backgroundColor: '#e5e7eb', borderRadius: 4, overflow: 'hidden', marginRight: 12 },
  progressFill: { height: 8, backgroundColor: '#10b981', borderRadius: 4 },
  progressText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  
  // Task Card
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  taskCheck: { marginRight: 12 },
  taskText: { flex: 1, fontSize: 15, color: '#1e293b', fontWeight: '500' },
  taskDone: { textDecorationLine: 'line-through', color: '#94a3b8' },
  
  // Empty State
  emptyState: { alignItems: 'center', padding: 32, backgroundColor: '#fff', borderRadius: 16, marginBottom: 16 },
  emptyText: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 12, lineHeight: 20 },
  
  // Budget Summary
  budgetSummary: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  budgetSummaryItem: { flex: 1, alignItems: 'center' },
  budgetSummaryLabel: { fontSize: 11, color: '#64748b', textTransform: 'uppercase' },
  budgetSummaryValue: { fontSize: 16, fontWeight: '800', color: '#1e293b', marginTop: 4 },
  budgetDivider: { width: 1, backgroundColor: '#e5e7eb' },
  
  // Budget Card
  budgetCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  budgetCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  budgetLabel: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  budgetBarContainer: { flexDirection: 'row', alignItems: 'center' },
  budgetBar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden', marginRight: 10 },
  budgetFill: { height: 8, borderRadius: 4 },
  budgetPct: { fontSize: 13, fontWeight: '700', color: '#64748b', width: 40, textAlign: 'right' },
  budgetAmounts: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  budgetSpent: { fontSize: 13, color: '#64748b' },
  budgetPlanned: { fontSize: 13, color: '#94a3b8' },
  overBudgetWarning: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: '#fef2f2', padding: 8, borderRadius: 8 },
  overBudgetText: { fontSize: 12, color: '#ef4444', marginLeft: 6, fontWeight: '600' },
  
  // Vendor Card
  vendorCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  vendorIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center' },
  vendorInfo: { flex: 1, marginLeft: 12 },
  vendorName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  vendorType: { fontSize: 12, color: '#7c26ff', fontWeight: '600', marginTop: 2 },
  vendorPhone: { fontSize: 13, color: '#64748b', marginTop: 2 },
  vendorActions: { flexDirection: 'row', gap: 8 },
  vendorBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#e22f2f', justifyContent: 'center', alignItems: 'center' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', marginBottom: 20, textAlign: 'center' },
  modalLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6, marginTop: 4 },
  modalInput: { backgroundColor: '#f8fafc', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  modalBtnCancel: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalBtnCancelText: { fontSize: 16, fontWeight: '600', color: '#64748b' },
  modalBtnAdd: { flex: 1, padding: 14, borderRadius: 12, backgroundColor: '#e22f2f', alignItems: 'center' },
  modalBtnAddText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  addMoreSection: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  addMoreTitle: { fontSize: 14, fontWeight: '600', color: '#10b981', marginLeft: 8 },
  newTotalText: { fontSize: 13, color: '#10b981', fontWeight: '600', marginBottom: 8, textAlign: 'center' },
});
