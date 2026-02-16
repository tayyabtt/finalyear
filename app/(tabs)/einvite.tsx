import { Ionicons } from '@expo/vector-icons';
import * as Calendar from 'expo-calendar';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    ImageBackground,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';

import { InviteData } from '../../types/einvite';
import { inviteTemplates, islamicVerses, romanticQuotes } from '../../utils/inviteTemplates';

const { width, height } = Dimensions.get('window');

export default function EInviteScreen() {
  const router = useRouter();
  const viewShotRef = useRef<ViewShot>(null);
  
  // State
  const [selectedTemplate, setSelectedTemplate] = useState(inviteTemplates[0]);
  const [editorVisible, setEditorVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [flipAnim] = useState(new Animated.Value(0));
  const [exporting, setExporting] = useState(false);
  
  // Invite Data
  const [inviteData, setInviteData] = useState<InviteData>({
    brideName: 'Ayesha',
    groomName: 'Ahmed',
    brideFamily: 'D/o Mr. & Mrs. Khan',
    groomFamily: 'S/o Mr. & Mrs. Ali',
    eventType: 'Nikkah',
    eventDate: '2025-12-25',
    eventTime: '7:00 PM',
    venue: 'Grand Marquee',
    venueAddress: 'Karachi, Pakistan',
    quote: romanticQuotes[0],
    templateId: inviteTemplates[0].id,
  });

  const updateField = (field: keyof InviteData, value: string) => {
    setInviteData(prev => ({ ...prev, [field]: value }));
  };

  const selectTemplate = (template: typeof inviteTemplates[0]) => {
    setSelectedTemplate(template);
    updateField('templateId', template.id);
    setEditorVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      updateField('couplePhoto', result.assets[0].uri);
    }
  };

  const addToCalendar = async () => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find((cal: any) => cal.allowsModifications) || calendars[0];
        
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `${inviteData.eventType} - ${inviteData.brideName} & ${inviteData.groomName}`,
          startDate: new Date(inviteData.eventDate + ' ' + inviteData.eventTime),
          endDate: new Date(inviteData.eventDate + ' ' + inviteData.eventTime),
          location: inviteData.venue,
          notes: inviteData.venueAddress,
        });
        alert('Event added to calendar!');
      }
    } catch (error) {
      console.error('Calendar error:', error);
    }
  };

  const openMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inviteData.venueAddress)}`;
    Linking.openURL(url);
  };

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `You're invited to ${inviteData.eventType}!\n\n${inviteData.brideName} & ${inviteData.groomName}\n\n📅 ${inviteData.eventDate} at ${inviteData.eventTime}\n📍 ${inviteData.venue}\n\nCreated with ShaadiSet 💍`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const exportAsImage = async () => {
    try {
      setExporting(true);
      if (!viewShotRef.current || !viewShotRef.current.capture) return;

      // Capture the invitation as image
      const uri = await viewShotRef.current.capture();
      
      // Save to device
      const fileName = `ShaadiSet_Invite_${inviteData.brideName}_${inviteData.groomName}_${Date.now()}.png`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      // Share the image
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your wedding invitation',
        });
      }

      alert('Invitation exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export invitation');
    } finally {
      setExporting(false);
    }
  };

  const shareOnWhatsApp = async () => {
    try {
      setExporting(true);
      if (!viewShotRef.current || !viewShotRef.current.capture) return;

      // Capture the invitation as image
      const uri = await viewShotRef.current.capture();
      
      // Save to cache
      const fileName = `invite_${Date.now()}.png`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.copyAsync({ from: uri, to: fileUri });

      // Share on WhatsApp
      const message = `✨ You're Invited! ✨\n\n${inviteData.eventType}\n${inviteData.brideName} & ${inviteData.groomName}\n\n📅 ${inviteData.eventDate} at ${inviteData.eventTime}\n📍 ${inviteData.venue}`;
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'image/png',
          dialogTitle: message,
        });
      }
    } catch (error) {
      console.error('WhatsApp share error:', error);
      alert('Failed to share on WhatsApp');
    } finally {
      setExporting(false);
    }
  };

  const flipCard = () => {
    const currentValue = (flipAnim as any)._value || 0;
    Animated.spring(flipAnim, {
      toValue: currentValue === 0 ? 1 : 0,
      useNativeDriver: true,
    }).start();
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>✨ Luxury E-Invites</Text>
        <Text style={styles.headerSubtitle}>Create your perfect wedding invitation</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Template Gallery */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
            {inviteTemplates.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate.id === template.id && styles.templateCardSelected,
                ]}
                onPress={() => selectTemplate(template)}
              >
                <ImageBackground
                  source={{ uri: template.thumbnail }}
                  style={styles.templateImage}
                  imageStyle={{ borderRadius: 12 }}
                >
                  <View style={styles.templateOverlay}>
                    <Text style={styles.templateTitle}>{template.title}</Text>
                  </View>
                </ImageBackground>
                {selectedTemplate.id === template.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={24} color="#2ecc71" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.createButton} onPress={() => setEditorVisible(true)}>
            <Ionicons name="create" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Create Invitation</Text>
          </TouchableOpacity>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featuresGrid}>
            <View style={styles.featureItem}>
              <Ionicons name="images" size={32} color="#e22f2f" />
              <Text style={styles.featureText}>5+ Premium Templates</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="sparkles" size={32} color="#ffd700" />
              <Text style={styles.featureText}>Animated Effects</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="camera" size={32} color="#e22f2f" />
              <Text style={styles.featureText}>Add Your Photo</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="share-social" size={32} color="#ffd700" />
              <Text style={styles.featureText}>Easy Sharing</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Editor Modal */}
      <Modal visible={editorVisible} animationType="slide" onRequestClose={() => setEditorVisible(false)}>
        <View style={styles.editorContainer}>
          {/* Editor Header */}
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setEditorVisible(false)}>
              <Ionicons name="close" size={28} color="#e22f2f" />
            </TouchableOpacity>
            <Text style={styles.editorTitle}>Customize Invitation</Text>
            <TouchableOpacity onPress={() => setPreviewVisible(true)}>
              <Ionicons name="eye" size={28} color="#e22f2f" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.editorScroll} showsVerticalScrollIndicator={false}>
            {/* Couple Names */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>👰 Bride's Name</Text>
              <TextInput
                style={styles.input}
                value={inviteData.brideName}
                onChangeText={(text) => updateField('brideName', text)}
                placeholder="Enter bride's name"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={inviteData.brideFamily}
                onChangeText={(text) => updateField('brideFamily', text)}
                placeholder="D/o Mr. & Mrs. (Optional)"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>🤵 Groom's Name</Text>
              <TextInput
                style={styles.input}
                value={inviteData.groomName}
                onChangeText={(text) => updateField('groomName', text)}
                placeholder="Enter groom's name"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={inviteData.groomFamily}
                onChangeText={(text) => updateField('groomFamily', text)}
                placeholder="S/o Mr. & Mrs. (Optional)"
              />
            </View>

            {/* Event Details */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>💍 Event Type</Text>
              <View style={styles.eventTypeRow}>
                {(['Nikkah', 'Mehndi', 'Barat', 'Walima', 'Reception'] as const).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.eventTypeButton,
                      inviteData.eventType === type && styles.eventTypeButtonActive,
                    ]}
                    onPress={() => updateField('eventType', type)}
                  >
                    <Text
                      style={[
                        styles.eventTypeText,
                        inviteData.eventType === type && styles.eventTypeTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📅 Date & Time</Text>
              <TextInput
                style={styles.input}
                value={inviteData.eventDate}
                onChangeText={(text) => updateField('eventDate', text)}
                placeholder="YYYY-MM-DD"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={inviteData.eventTime}
                onChangeText={(text) => updateField('eventTime', text)}
                placeholder="7:00 PM"
              />
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📍 Venue</Text>
              <TextInput
                style={styles.input}
                value={inviteData.venue}
                onChangeText={(text) => updateField('venue', text)}
                placeholder="Venue name"
              />
              <TextInput
                style={[styles.input, { marginTop: 8 }]}
                value={inviteData.venueAddress}
                onChangeText={(text) => updateField('venueAddress', text)}
                placeholder="Full address"
                multiline
              />
            </View>

            {/* Photo Upload */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📸 Couple Photo (Optional)</Text>
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                {inviteData.couplePhoto ? (
                  <Image source={{ uri: inviteData.couplePhoto }} style={styles.photoPreview} />
                ) : (
                  <>
                    <Ionicons name="camera" size={32} color="#e22f2f" />
                    <Text style={styles.photoButtonText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Quote/Verse */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>💬 Quote or Verse</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={inviteData.quote}
                onChangeText={(text) => updateField('quote', text)}
                placeholder="Add a romantic quote or Islamic verse"
                multiline
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {[...romanticQuotes, ...islamicVerses].map((quote, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.quoteChip}
                    onPress={() => updateField('quote', quote)}
                  >
                    <Text style={styles.quoteChipText} numberOfLines={1}>
                      {quote.substring(0, 30)}...
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* RSVP Details */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>📞 RSVP Contact (Optional)</Text>
              <TextInput
                style={styles.input}
                value={inviteData.rsvpPhone}
                onChangeText={(text) => updateField('rsvpPhone', text)}
                placeholder="Phone number"
                keyboardType="phone-pad"
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.previewButton} onPress={() => setPreviewVisible(true)}>
                <Ionicons name="eye" size={20} color="#fff" />
                <Text style={styles.buttonText}>Preview</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareButton} onPress={shareInvite}>
                <Ionicons name="share-social" size={20} color="#fff" />
                <Text style={styles.buttonText}>Share</Text>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Preview Modal */}
      <Modal visible={previewVisible} animationType="fade" onRequestClose={() => setPreviewVisible(false)}>
        <View style={styles.previewContainer}>
          <TouchableOpacity style={styles.closePreview} onPress={() => setPreviewVisible(false)}>
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }}>
            <Animated.View
              style={[
                styles.cardFront,
                { transform: [{ rotateY: frontInterpolate }] },
              ]}
            >
            <ImageBackground
              source={{ uri: selectedTemplate.backgroundImage }}
              style={styles.previewCard}
              imageStyle={{ borderRadius: 20 }}
            >
              <View style={styles.cardContent}>
                {inviteData.couplePhoto && (
                  <Image source={{ uri: inviteData.couplePhoto }} style={styles.couplePhoto} />
                )}
                
                <Text style={[styles.previewNames, { color: selectedTemplate.primaryColor }]}>
                  {inviteData.brideName} & {inviteData.groomName}
                </Text>
                
                {inviteData.brideFamily && (
                  <Text style={styles.previewFamily}>{inviteData.brideFamily}</Text>
                )}
                {inviteData.groomFamily && (
                  <Text style={styles.previewFamily}>{inviteData.groomFamily}</Text>
                )}
                
                <View style={styles.divider} />
                
                <Text style={styles.previewEventType}>{inviteData.eventType}</Text>
                <Text style={styles.previewDate}>{inviteData.eventDate}</Text>
                <Text style={styles.previewTime}>{inviteData.eventTime}</Text>
                
                <View style={styles.divider} />
                
                <Text style={styles.previewVenue}>{inviteData.venue}</Text>
                <Text style={styles.previewAddress}>{inviteData.venueAddress}</Text>
                
                {inviteData.quote && (
                  <>
                    <View style={styles.divider} />
                    <Text style={styles.previewQuote}>"{inviteData.quote}"</Text>
                  </>
                )}
                
                <Text style={styles.watermark}>Created with ShaadiSet 💍</Text>
              </View>
            </ImageBackground>
          </Animated.View>
          </ViewShot>

          {/* Interactive Buttons */}
          <View style={styles.interactiveButtons}>
            <TouchableOpacity style={styles.interactiveButton} onPress={addToCalendar}>
              <Ionicons name="calendar" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>Add to Calendar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactiveButton} onPress={openMaps}>
              <Ionicons name="location" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>Open Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactiveButton} onPress={shareInvite}>
              <Ionicons name="share-social" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>Share</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.interactiveButton, styles.whatsappButton]} 
              onPress={shareOnWhatsApp}
              disabled={exporting}
            >
              <Ionicons name="logo-whatsapp" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>
                {exporting ? 'Exporting...' : 'WhatsApp'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.interactiveButton} 
              onPress={exportAsImage}
              disabled={exporting}
            >
              <Ionicons name="download" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>
                {exporting ? 'Exporting...' : 'Export'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.interactiveButton} onPress={flipCard}>
              <Ionicons name="sync" size={24} color="#fff" />
              <Text style={styles.interactiveButtonText}>Flip Card</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  templateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  templateCard: {
    width: 160,
    height: 220,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  templateCardSelected: {
    borderWidth: 3,
    borderColor: '#2ecc71',
  },
  templateImage: {
    width: '100%',
    height: '100%',
  },
  templateOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 12,
  },
  templateTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: '#e22f2f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#e22f2f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureItem: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  editorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  editorScroll: {
    flex: 1,
  },
  inputSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventTypeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  eventTypeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventTypeButtonActive: {
    backgroundColor: '#e22f2f',
    borderColor: '#e22f2f',
  },
  eventTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  eventTypeTextActive: {
    color: '#fff',
  },
  photoButton: {
    height: 150,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  photoButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  quoteChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  quoteChipText: {
    fontSize: 12,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  previewButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#667eea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#e22f2f',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closePreview: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
  },
  cardFront: {
    width: width * 0.9,
    height: height * 0.7,
  },
  previewCard: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 24,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
  },
  couplePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#ffd700',
  },
  previewNames: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  previewFamily: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#ffd700',
    marginVertical: 16,
  },
  previewEventType: {
    fontSize: 24,
    fontWeight: '600',
    color: '#e22f2f',
    marginBottom: 8,
  },
  previewDate: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  previewTime: {
    fontSize: 16,
    color: '#666',
  },
  previewVenue: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  previewAddress: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  previewQuote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  watermark: {
    fontSize: 10,
    color: '#999',
    marginTop: 16,
  },
  interactiveButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 12,
    paddingHorizontal: 20,
  },
  interactiveButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interactiveButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    borderColor: '#25D366',
  },
});
