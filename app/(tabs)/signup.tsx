import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function SignupScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [emailPhone, setEmailPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('Couple / Vendor / Artist');

  const handleCreateAccount = () => {
    // ✅ Basic validation (optional)
    if (!fullName || !emailPhone || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    // ✅ Go back to index.tsx (Welcome screen)
    router.replace('/'); // This navigates to app/index.tsx
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#999"
        value={fullName}
        onChangeText={setFullName}
      />

      <TextInput
        style={styles.input}
        placeholder="Email or Phone"
        placeholderTextColor="#999"
        keyboardType="email-address"
        value={emailPhone}
        onChangeText={setEmailPhone}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <Text style={styles.label}>I am a...</Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={role}
          onValueChange={(itemValue) => setRole(itemValue)}
          mode="dropdown"
          style={styles.picker}
          dropdownIconColor="#333"
        >
          <Picker.Item label="Couple / Vendor / Artist" value="Couple / Vendor / Artist" />
          <Picker.Item label="Couple" value="Couple" />
          <Picker.Item label="Vendor" value="Vendor" />
          <Picker.Item label="Artist" value="Artist" />
        </Picker>
      </View>

      <Text style={styles.infoText}>
        Your wedding profile will help personalize your experience.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#bbb',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 18,
    fontSize: 16,
    color: '#222',
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#444',
  },
  pickerWrapper: {
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginBottom: 25,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#e22f2f',
    borderRadius: 350,
    paddingVertical: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#e22f2f',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
    letterSpacing: 0.7,
  },
});
