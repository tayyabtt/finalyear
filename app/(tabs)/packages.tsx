/* eslint-disable react-native/no-inline-styles */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
    Alert,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── constants ───────── */
const { width } = Dimensions.get('window');
const METHODS = [
  { id: 'jazzcash',  label: 'JazzCash',  icon: 'cash-outline' },
  { id: 'easypaisa', label: 'EasyPaisa', icon: 'wallet-outline' },
  { id: 'card',      label: 'Debit / Credit', icon: 'card-outline' },
];

export default function eSalamiScreen() {
  /* form state */
  const [name, setName]       = useState('');
  const [amount, setAmount]   = useState('');
  const [msg, setMsg]         = useState('');
  const [method, setMethod]   = useState('jazzcash');
  const [sending, setSending] = useState(false);

  /* validation + fake submit */
  const handleSend = () => {
    const amt = parseInt(amount, 10);
    if (!amt || amt < 100) {
      Alert.alert('Amount too small', 'Minimum e‑Salami is ₨100');
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      Alert.alert('Shukriya! ❤️', 'Your e‑Salami has been sent successfully.');
      setName('');
      setAmount('');
      setMsg('');
    }, 1200);
  };

  return (
    <LinearGradient colors={['#1b1f3a', '#2d314d']} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Send e‑Salami</Text>
        <Text style={styles.subtitle}>Secure • Instant • 0% Fee</Text>

        {/* Amount */}
        <Text style={styles.label}>Amount (₨)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g., 5000"
          placeholderTextColor="#7c7f94"
          style={styles.input}
        />

        {/* Name (optional) */}
        <Text style={styles.label}>Your Name (optional)</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Abdullah Khan"
          placeholderTextColor="#7c7f94"
          style={styles.input}
        />

        {/* Message */}
        <Text style={styles.label}>Message (optional)</Text>
        <TextInput
          value={msg}
          onChangeText={setMsg}
          placeholder="Mubarak ho!"
          placeholderTextColor="#7c7f94"
          style={[styles.input, { height: 80 }]} multiline
        />

        {/* Method picker */}
        <Text style={styles.label}>Payment Method</Text>
        <View style={styles.methodRow}>
          {METHODS.map(m => (
            <TouchableOpacity
              key={m.id}
              style={[styles.methodBtn, method === m.id && styles.methodSelected]}
              onPress={() => setMethod(m.id)}
            >
              <Ionicons name={m.icon as any} size={20} color="#fff" />
              <Text style={styles.methodTxt}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Send */}
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending}>
          <Ionicons name="paper-plane" size={20} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.sendTxt}>{sending ? 'Sending…' : 'Send e‑Salami'}</Text>
        </TouchableOpacity>
      </ScrollView>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} />
    </LinearGradient>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    color: '#9da0b8',
    marginBottom: 24,
  },
  label: {
    color: '#9da0b8',
    marginTop: 14,
    marginBottom: 6,
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
  },
  methodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  methodBtn: {
    width: (width - 72) / 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  methodSelected: {
    backgroundColor: '#7c26ff',
  },
  methodTxt: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  sendBtn: {
    flexDirection: 'row',
    backgroundColor: '#00c853',
    borderRadius: 16,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  sendTxt: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
