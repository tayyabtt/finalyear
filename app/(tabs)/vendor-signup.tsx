/* eslint-disable react-native/no-inline-styles */
// app/(tabs)/vendor-signup.tsx - Vendor Signup with Portfolio Photos

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert, Image, KeyboardAvoidingView, Platform, ScrollView,
    StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseErrorMessage, validateEmail, validatePassword, validatePhoneNumber, validateRequired } from '../../utils/validation';

const SERVICE_TYPES = ['Select Service Type', 'Photographer', 'Decorator', 'Caterer', 'Venue', 'Makeup Artist', 'Planner', 'Mehndi Artist', 'Bridal Wear', 'Groom Wear'];
const CITIES = ['Select City', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur', 'Larkana', 'Sheikhupura', 'Jhang', 'Rahim Yar Khan', 'Mardan', 'Gujrat', 'Kasur', 'Mingora', 'Dera Ghazi Khan', 'Nawabshah', 'Sahiwal', 'Mirpur Khas', 'Okara', 'Mandi Bahauddin', 'Jacobabad', 'Jhelum', 'Abbottabad', 'Muzaffarabad', 'Gilgit', 'Skardu'];
const MIN_PHOTOS = 6;

export default function VendorSignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [step, setStep] = useState(1); // 1: Basic Info, 2: Photos
  const [businessName, setBusinessName] = useState('');
  const [serviceType, setServiceType] = useState('Select Service Type');
  const [location, setLocation] = useState('Select City');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ businessName: '', serviceType: '', location: '', phoneNumber: '', email: '', password: '', photos: '' });

  const validateStep1 = (): boolean => {
    const newErrors = { ...errors, businessName: '', serviceType: '', location: '', phoneNumber: '', email: '', password: '' };
    if (!validateRequired(businessName, 'Business name').isValid) newErrors.businessName = 'Business name is required';
    if (serviceType === 'Select Service Type') newErrors.serviceType = 'Please select a service type';
    if (location === 'Select City') newErrors.location = 'Please select a city';
    if (!validatePhoneNumber(phoneNumber).isValid) newErrors.phoneNumber = 'Enter valid phone number';
    if (!validateEmail(email).isValid) newErrors.email = 'Enter valid email';
    if (!validatePassword(password).isValid) newErrors.password = 'Password must be 6+ characters';
    setErrors(newErrors);
    return !newErrors.businessName && !newErrors.serviceType && !newErrors.location && !newErrors.phoneNumber && !newErrors.email && !newErrors.password;
  };

  const pickImage = async () => {
    if (photos.length >= 10) return Alert.alert('Limit Reached', 'Maximum 10 photos allowed');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });
    if (!result.canceled && result.assets[0]) setPhotos([...photos, result.assets[0].uri]);
  };

  const removePhoto = (index: number) => setPhotos(photos.filter((_, i) => i !== index));

  const handleNext = () => { if (validateStep1()) setStep(2); };

  const handleSignup = async () => {
    if (photos.length < MIN_PHOTOS) {
      setErrors({ ...errors, photos: `Please add at least ${MIN_PHOTOS} photos of your work` });
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, 'vendor', { businessName, serviceType, location, phoneNumber, portfolioPhotos: photos });
      Alert.alert('Success! 🎉', 'Your vendor account has been created. Start getting bookings!');
      router.replace('/(vendor)/dashboard');
    } catch (error: any) {
      Alert.alert('Signup Failed', getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep(1)}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.stepText}>Step 2 of 2</Text>
        </View>
        <Text style={styles.heading}>Portfolio Photos</Text>
        <Text style={styles.subheading}>Add at least {MIN_PHOTOS} photos of your best work to attract clients</Text>
        
        <View style={styles.photoGrid}>
          {[0,1,2,3,4,5,6,7,8,9].map(i => (
            <TouchableOpacity key={i} style={styles.photoSlot} onPress={photos[i] ? () => removePhoto(i) : pickImage}>
              {photos[i] ? (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: photos[i] }} style={styles.photo} />
                  <View style={styles.removeBtn}><Ionicons name="close" size={16} color="#fff" /></View>
                </View>
              ) : (
                <View style={[styles.emptySlot, i < MIN_PHOTOS && styles.requiredSlot]}>
                  <Ionicons name="add" size={28} color={i < MIN_PHOTOS ? '#7c26ff' : '#ccc'} />
                  {i < MIN_PHOTOS && <Text style={styles.requiredText}>Required</Text>}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.photoCount}>
          <Text style={[styles.countText, photos.length >= MIN_PHOTOS && { color: '#10b981' }]}>
            {photos.length}/{MIN_PHOTOS} required photos
          </Text>
          {photos.length >= MIN_PHOTOS && <Ionicons name="checkmark-circle" size={20} color="#10b981" />}
        </View>
        
        {errors.photos ? <Text style={styles.errorText}>{errors.photos}</Text> : null}
        
        <TouchableOpacity style={[styles.button, (loading || photos.length < MIN_PHOTOS) && styles.buttonDisabled]} onPress={handleSignup} disabled={loading || photos.length < MIN_PHOTOS}>
          <Text style={styles.buttonText}>{loading ? 'Creating Account...' : 'Create Vendor Account'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Ionicons name="arrow-back" size={28} color="#333" /></TouchableOpacity>
          <Text style={styles.stepText}>Step 1 of 2</Text>
        </View>
        <Text style={styles.heading}>Create Vendor Account</Text>
        <Text style={styles.subheading}>Join ShaadiSet and showcase your services</Text>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="business" size={20} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Business Name *" value={businessName} onChangeText={setBusinessName} placeholderTextColor="#999" />
          </View>
          {errors.businessName ? <Text style={styles.errorText}>{errors.businessName}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.pickerWrapper}>
            <Ionicons name="briefcase" size={20} color="#666" style={styles.pickerIcon} />
            <Picker selectedValue={serviceType} onValueChange={setServiceType} style={styles.picker}>
              {SERVICE_TYPES.map(t => <Picker.Item key={t} label={t} value={t} />)}
            </Picker>
          </View>
          {errors.serviceType ? <Text style={styles.errorText}>{errors.serviceType}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.pickerWrapper}>
            <Ionicons name="location" size={20} color="#666" style={styles.pickerIcon} />
            <Picker selectedValue={location} onValueChange={setLocation} style={styles.picker}>
              {CITIES.map(c => <Picker.Item key={c} label={c} value={c} />)}
            </Picker>
          </View>
          {errors.location ? <Text style={styles.errorText}>{errors.location}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="call" size={20} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Phone Number *" value={phoneNumber} onChangeText={setPhoneNumber} keyboardType="phone-pad" placeholderTextColor="#999" />
          </View>
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail" size={20} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#999" />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed" size={20} color="#666" style={styles.inputIcon} />
            <TextInput style={styles.input} placeholder="Password *" value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor="#999" />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>Next: Add Photos</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/login')}><Text style={styles.loginLink}> Log in</Text></TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, paddingTop: 50, paddingHorizontal: 24, paddingBottom: 40, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  stepText: { fontSize: 14, color: '#7c26ff', fontWeight: '600' },
  heading: { fontSize: 28, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center' },
  subheading: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 28, lineHeight: 22 },
  inputContainer: { marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 16, height: 54 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: '#333' },
  pickerWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 12, paddingLeft: 16, height: 54, overflow: 'hidden' },
  pickerIcon: { marginRight: 12 },
  picker: { flex: 1, height: 54 },
  errorText: { color: '#e22f2f', fontSize: 13, marginTop: 6, marginLeft: 4 },
  button: { flexDirection: 'row', backgroundColor: '#7c26ff', borderRadius: 12, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 17 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 15, color: '#666' },
  loginLink: { fontSize: 15, color: '#7c26ff', fontWeight: '600' },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  photoSlot: { width: '31%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden' },
  photoContainer: { flex: 1, position: 'relative' },
  photo: { width: '100%', height: '100%' },
  removeBtn: { position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
  emptySlot: { flex: 1, backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#e5e5e5', borderStyle: 'dashed', borderRadius: 12 },
  requiredSlot: { borderColor: '#7c26ff', backgroundColor: '#faf5ff' },
  requiredText: { fontSize: 10, color: '#7c26ff', marginTop: 4 },
  photoCount: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  countText: { fontSize: 14, color: '#666', marginRight: 8 },
});
