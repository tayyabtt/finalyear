// app/(vendor)/my-services.tsx
// Vendor My Services screen with Add/Edit functionality - Saves to Firestore

import { Ionicons } from '@expo/vector-icons';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

const db = getFirestore();

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  status: 'active' | 'inactive';
}

const SERVICE_CATEGORIES = [
  'Photography', 'Videography', 'Makeup & Beauty', 'Catering', 'Decoration',
  'Venue', 'DJ & Music', 'Mehndi Artist', 'Wedding Planner', 'Bridal Wear',
  'Jewelry', 'Transportation', 'Invitation Cards', 'Other',
];

const DURATION_OPTIONS = [
  '1 Hour', '2 Hours', '3 Hours', '4 Hours', 'Half Day (5 Hours)',
  'Full Day (8+ Hours)', 'Per Event', 'Per Person', 'Custom',
];

export default function MyServicesScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [serviceCategory, setServiceCategory] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');

  useEffect(() => { if (user) loadServices(); }, [user]);

  const loadServices = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const servicesRef = collection(db, 'vendors', user.uid, 'services');
      const snapshot = await getDocs(servicesRef);
      const loadedServices: Service[] = [];
      snapshot.forEach((doc) => {
        loadedServices.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(loadedServices);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setServiceName(''); setServiceDescription(''); setServiceCategory('');
    setServicePrice(''); setServiceDuration(''); setEditingService(null);
  };

  const openAddModal = () => { resetForm(); setModalVisible(true); };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setServiceName(service.name);
    setServiceDescription(service.description || '');
    setServiceCategory(service.category);
    setServicePrice(service.price);
    setServiceDuration(service.duration || '');
    setModalVisible(true);
  };

  const handleSaveService = async () => {
    if (!user) return;
    if (!serviceName.trim()) { Alert.alert('Error', 'Please enter a service name'); return; }
    if (!serviceCategory) { Alert.alert('Error', 'Please select a category'); return; }
    if (!servicePrice.trim()) { Alert.alert('Error', 'Please enter a price'); return; }

    try {
      const serviceData = {
        name: serviceName.trim(),
        description: serviceDescription.trim(),
        category: serviceCategory,
        price: servicePrice.trim(),
        duration: serviceDuration,
        status: 'active' as const,
        updatedAt: new Date().toISOString(),
      };

      if (editingService) {
        const serviceRef = doc(db, 'vendors', user.uid, 'services', editingService.id);
        await updateDoc(serviceRef, serviceData);
      } else {
        const newId = Date.now().toString();
        const serviceRef = doc(db, 'vendors', user.uid, 'services', newId);
        await setDoc(serviceRef, { ...serviceData, id: newId, createdAt: new Date().toISOString() });
      }

      await loadServices();
      setModalVisible(false);
      resetForm();
      Alert.alert('Success', editingService ? 'Service updated!' : 'Service added!');
    } catch (error) {
      console.error('Error saving service:', error);
      Alert.alert('Error', 'Failed to save service');
    }
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert('Delete Service', 'Are you sure you want to delete this service?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        if (!user) return;
        try {
          await deleteDoc(doc(db, 'vendors', user.uid, 'services', serviceId));
          await loadServices();
        } catch (error) { Alert.alert('Error', 'Failed to delete service'); }
      }},
    ]);
  };

  const toggleServiceStatus = async (serviceId: string, currentStatus: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'vendors', user.uid, 'services', serviceId), {
        status: currentStatus === 'active' ? 'inactive' : 'active',
      });
      await loadServices();
    } catch (error) { console.error('Error toggling status:', error); }
  };

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceHeader}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{item.name}</Text>
          <View style={styles.categoryTag}>
            <Ionicons name="pricetag" size={12} color="#7c26ff" />
            <Text style={styles.serviceCategory}>{item.category}</Text>
          </View>
          {item.description ? <Text style={styles.serviceDescription} numberOfLines={2}>{item.description}</Text> : null}
          <View style={styles.priceRow}>
            <Text style={styles.servicePrice}>PKR {item.price}</Text>
            {item.duration ? <Text style={styles.serviceDuration}>• {item.duration}</Text> : null}
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#d1fae5' : '#fee2e2' }]}
          onPress={() => toggleServiceStatus(item.id, item.status)}
        >
          <Text style={[styles.statusText, { color: item.status === 'active' ? '#059669' : '#dc2626' }]}>
            {item.status === 'active' ? 'Active' : 'Inactive'}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.serviceActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={20} color="#7c26ff" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteService(item.id)}>
          <Ionicons name="trash-outline" size={20} color="#e22f2f" />
          <Text style={[styles.actionButtonText, { color: '#e22f2f' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="briefcase-outline" size={60} color="#7c26ff" />
      </View>
      <Text style={styles.emptyTitle}>No services yet</Text>
      <Text style={styles.emptySubtitle}>Add your services to showcase what you offer to clients</Text>
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Your First Service</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Services</Text>
        <Text style={styles.serviceCount}>{services.length} services</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}><Text style={{ color: '#666' }}>Loading services...</Text></View>
      ) : (
        <FlatList data={services} keyExtractor={(item) => item.id} renderItem={renderService}
          contentContainerStyle={styles.listContainer} ListEmptyComponent={renderEmpty} showsVerticalScrollIndicator={false} />
      )}

      {services.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={28} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingService ? 'Edit Service' : 'Add New Service'}</Text>
              <TouchableOpacity onPress={() => { setModalVisible(false); resetForm(); }}>
                <Ionicons name="close-circle" size={32} color="#ccc" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Service Name *</Text>
              <TextInput style={styles.input} placeholder="e.g., Wedding Photography Package" value={serviceName} onChangeText={setServiceName} placeholderTextColor="#999" />

              <Text style={styles.inputLabel}>Category *</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowCategoryPicker(true)}>
                <Text style={serviceCategory ? styles.pickerText : styles.pickerPlaceholder}>{serviceCategory || 'Select a category'}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Price (PKR) *</Text>
              <TextInput style={styles.input} placeholder="e.g., 50000" value={servicePrice} onChangeText={setServicePrice} keyboardType="numeric" placeholderTextColor="#999" />

              <Text style={styles.inputLabel}>Duration</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setShowDurationPicker(true)}>
                <Text style={serviceDuration ? styles.pickerText : styles.pickerPlaceholder}>{serviceDuration || 'Select duration'}</Text>
                <Ionicons name="chevron-down" size={20} color="#666" />
              </TouchableOpacity>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your service..." value={serviceDescription} onChangeText={setServiceDescription} multiline numberOfLines={4} placeholderTextColor="#999" />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveService}>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.saveButtonText}>{editingService ? 'Update Service' : 'Add Service'}</Text>
              </TouchableOpacity>
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Category Picker */}
      <Modal visible={showCategoryPicker} animationType="slide" transparent>
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView>
              {SERVICE_CATEGORIES.map((cat) => (
                <TouchableOpacity key={cat} style={[styles.pickerOption, serviceCategory === cat && styles.pickerOptionActive]}
                  onPress={() => { setServiceCategory(cat); setShowCategoryPicker(false); }}>
                  <Text style={[styles.pickerOptionText, serviceCategory === cat && styles.pickerOptionTextActive]}>{cat}</Text>
                  {serviceCategory === cat && <Ionicons name="checkmark" size={22} color="#7c26ff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Duration Picker */}
      <Modal visible={showDurationPicker} animationType="slide" transparent>
        <View style={styles.pickerModalOverlay}>
          <View style={styles.pickerModalContent}>
            <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Duration</Text>
              <TouchableOpacity onPress={() => setShowDurationPicker(false)}><Ionicons name="close" size={28} color="#333" /></TouchableOpacity>
            </View>
            <ScrollView>
              {DURATION_OPTIONS.map((dur) => (
                <TouchableOpacity key={dur} style={[styles.pickerOption, serviceDuration === dur && styles.pickerOptionActive]}
                  onPress={() => { setServiceDuration(dur); setShowDurationPicker(false); }}>
                  <Text style={[styles.pickerOptionText, serviceDuration === dur && styles.pickerOptionTextActive]}>{dur}</Text>
                  {serviceDuration === dur && <Ionicons name="checkmark" size={22} color="#7c26ff" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1a1a1a' },
  serviceCount: { fontSize: 14, color: '#666', backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContainer: { padding: 16, paddingBottom: 100 },
  serviceCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  serviceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  serviceInfo: { flex: 1, marginRight: 10 },
  serviceName: { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  categoryTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3e8ff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 8 },
  serviceCategory: { fontSize: 12, color: '#7c26ff', marginLeft: 4, fontWeight: '600' },
  serviceDescription: { fontSize: 13, color: '#666', marginBottom: 8, lineHeight: 18 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  servicePrice: { fontSize: 16, fontWeight: '700', color: '#10b981' },
  serviceDuration: { fontSize: 13, color: '#666', marginLeft: 8 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, height: 28 },
  statusText: { fontSize: 12, fontWeight: '600' },
  serviceActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, gap: 12 },
  actionButton: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: 10, borderRadius: 10, backgroundColor: '#f8f9fa' },
  actionButtonText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#7c26ff' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#666', marginBottom: 24, textAlign: 'center', paddingHorizontal: 40 },
  addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c26ff', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 14 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  fab: { position: 'absolute', bottom: 100, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#7c26ff', justifyContent: 'center', alignItems: 'center', shadowColor: '#7c26ff', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, fontSize: 15, color: '#333', borderWidth: 1, borderColor: '#eee' },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#eee' },
  pickerText: { fontSize: 15, color: '#333' },
  pickerPlaceholder: { fontSize: 15, color: '#999' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#7c26ff', paddingVertical: 16, borderRadius: 14, marginTop: 24 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', marginLeft: 8 },
  pickerModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  pickerModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '60%' },
  pickerModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pickerModalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  pickerOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  pickerOptionActive: { backgroundColor: '#f3e8ff' },
  pickerOptionText: { fontSize: 16, color: '#333' },
  pickerOptionTextActive: { color: '#7c26ff', fontWeight: '600' },
});
