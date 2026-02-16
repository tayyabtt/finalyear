/* eslint-disable react-native/no-inline-styles */
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/src/firebaseConfig';
import { ALBUM_THEMES, EVENT_SUGGESTIONS, EventAlbum, EventPhoto } from '@/types/album';
import { addPhotosToEvent, createEventAlbum, loadEventAlbums, loadEventPhotos, migrateOldPhotos, saveEventPhotos } from '@/utils/albumStorage';
import { Booking, getUserBookings } from '@/utils/bookings';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, orderBy, query, setDoc, where } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    Easing,
    FlatList,
    Image,
    KeyboardAvoidingView,
    Linking,
    Modal,
    PanResponder,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

/* ───────── constants ───────── */
const { width, height } = Dimensions.get('window');
const RING_SZ = 80;
const RING_STROKE = 6;

const GROOM_IMG = require('../../assets/images/bride1.jpg');
const BRIDE_IMG = require('../../assets/images/necklace.jpg');
const venueLatLng = { lat: 31.5204, lng: 74.3587 };
const dummyVendors = [
  { id: '1', name: 'Pearl Continental Ballroom', type: 'Venue', phone: '042-111-505-505' },
  { id: '2', name: 'Floral Fantasy Décor', type: 'Decorator', phone: '0300-1234567' },
  { id: '3', name: 'Tasty Treats Catering', type: 'Caterer', phone: '042-9998887' },
];

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ───────── types ───────── */
type EventData = {
  title: string;
  hall: string;
  date: Date;
  guestLimit: number;
  budget: number;
  code: string;
  userId?: string;
};

export default function EventScreen() {
  const { user } = useAuth();

  /* nav mode */
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'overview'>('menu');

  /* create-form fields */
  const [title, setTitle] = useState('');
  const [hall, setHall] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [guests, setGuests] = useState('');
  const [budget, setBudget] = useState('');

  /* join */
  const [joinCode, setJoinCode] = useState('');

  /* stored event (now from Firestore) */
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  /* slideshow state */
  const [slideshowActive, setSlideshowActive] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [slideshowSpeed, setSlideshowSpeed] = useState(3000);
  const slideshowRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const kenBurnsScale = useRef(new Animated.Value(1)).current;
  const kenBurnsX = useRef(new Animated.Value(0)).current;
  const kenBurnsY = useRef(new Animated.Value(0)).current;

  /* gallery / album state */
  type VoiceNote = { uri: string; duration: number; userId: string; userName?: string };
  type PhotoData = {
    uri: string;
    caption?: string;
    favorite?: boolean;
    timestamp?: number;
    filter?: string;
    voiceNotes?: VoiceNote[];
  };
  const [images, setImages] = useState<PhotoData[]>([]);
  const [albumOpen, setAlbumOpen] = useState(false);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [captionModalOpen, setCaptionModalOpen] = useState(false);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const [tempCaption, setTempCaption] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [slideshowSettingsOpen, setSlideshowSettingsOpen] = useState(false);
  const [kenBurnsEnabled, setKenBurnsEnabled] = useState(true);

  /* voice note state */
  const [voiceNoteModalOpen, setVoiceNoteModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playingVoiceNote, setPlayingVoiceNote] = useState<string | null>(null);
  const recordingRef = useRef<any>(null);
  const soundRef = useRef<any>(null);
  const recordingTimerRef = useRef<any>(null);

  /* luxury album state */
  const [albumMode, setAlbumMode] = useState<'selection' | 'cover' | 'flip' | null>(null);
  const [eventAlbums, setEventAlbums] = useState<EventAlbum[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<EventPhoto[]>([]);
  const [createAlbumModal, setCreateAlbumModal] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectEventForUpload, setSelectEventForUpload] = useState(false);

  /* vendors state */
  type VendorInfo = {
    id: string;
    name: string;
    type: string;
    phone: string;
    rating?: number;
    reviewCount?: number;
  };
  const [eventVendors, setEventVendors] = useState<VendorInfo[]>([]);

  /* vintage page flip animations */
  const pageFlipAnim = useRef(new Animated.Value(0)).current;
  const [isFlipping, setIsFlipping] = useState(false);

  /* Load event from Firestore on mount */
  useEffect(() => {
    loadEvent();
  }, [user]);

  /* Load images when event is loaded */
  useEffect(() => {
    if (event?.code) {
      loadImages();
      loadAlbums();
      loadVendors();
    }
  }, [event?.code]);

  const loadAlbums = async () => {
    if (!event?.code || !user) return;
    try {
      await migrateOldPhotos(event.code, user.uid);
      const albums = await loadEventAlbums(event.code);
      setEventAlbums(albums);
    } catch (error) {
      console.error('Error loading albums:', error);
    }
  };

  const loadVendors = async () => {
    if (!user?.uid) {
      console.log('No user ID, cannot load vendors');
      return;
    }

    try {
      console.log('Loading vendors for user:', user.uid);

      // Get user's bookings
      const bookings = await getUserBookings(user.uid);
      console.log('Total bookings:', bookings.length);
      console.log('Bookings:', bookings);

      // Filter accepted bookings only
      const acceptedBookings = bookings.filter((b: Booking) => b.status === 'accepted');
      console.log('Accepted bookings:', acceptedBookings.length);
      console.log('Accepted:', acceptedBookings);

      // Get unique vendor details
      const vendorMap = new Map<string, VendorInfo>();

      for (const booking of acceptedBookings) {
        console.log('Processing booking for vendor:', booking.vendorId);

        if (!vendorMap.has(booking.vendorId)) {
          // Fetch vendor details from Firestore - try users collection first, then vendors
          try {
            let vendorDoc = await getDoc(doc(db, 'users', booking.vendorId));
            console.log('Vendor doc in users exists:', vendorDoc.exists());

            // If not in users, try vendors collection
            if (!vendorDoc.exists()) {
              vendorDoc = await getDoc(doc(db, 'vendors', booking.vendorId));
              console.log('Vendor doc in vendors exists:', vendorDoc.exists());
            }

            if (vendorDoc.exists()) {
              const vendorData = vendorDoc.data();
              console.log('Vendor data:', vendorData);

              const vendorInfo = {
                id: booking.vendorId,
                name: vendorData.businessName || booking.vendorName,
                type: vendorData.serviceType || booking.serviceType,
                phone: vendorData.phoneNumber || 'N/A',
                rating: vendorData.rating || 5.0,
                reviewCount: vendorData.reviewCount || 0,
              };

              console.log('Adding vendor:', vendorInfo);
              vendorMap.set(booking.vendorId, vendorInfo);
            } else {
              // If vendor doc doesn't exist, use booking data
              console.log('Vendor doc not found, using booking data');
              const vendorInfo = {
                id: booking.vendorId,
                name: booking.vendorName,
                type: booking.serviceType,
                phone: 'N/A',
                rating: 5.0,
                reviewCount: 0,
              };
              console.log('Adding vendor from booking:', vendorInfo);
              vendorMap.set(booking.vendorId, vendorInfo);
            }
          } catch (error) {
            console.error('Error fetching vendor details:', error);
            // Fallback to booking data on error
            const vendorInfo = {
              id: booking.vendorId,
              name: booking.vendorName,
              type: booking.serviceType,
              phone: 'N/A',
              rating: 5.0,
              reviewCount: 0,
            };
            vendorMap.set(booking.vendorId, vendorInfo);
          }
        }
      }

      const vendors = Array.from(vendorMap.values());
      console.log('Final vendors list:', vendors);
      setEventVendors(vendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  /* Vintage Page Flip Animation */
  const flipToPage = (direction: 'next' | 'prev') => {
    if (isFlipping) return;

    const totalPages = Math.ceil(albumPhotos.length / 2);
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;

    if (newPage < 0 || newPage >= totalPages) return;

    setIsFlipping(true);
    pageFlipAnim.setValue(0);

    Animated.timing(pageFlipAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setCurrentPage(newPage);
      pageFlipAnim.setValue(0);
      setIsFlipping(false);
    });
  };

  /* Swipe Gesture Handler */
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_: any, gestureState: any) => {
        return Math.abs(gestureState.dx) > 10;
      },
      onPanResponderRelease: (_: any, gestureState: any) => {
        if (gestureState.dx > 50) {
          // Swipe right - previous page
          flipToPage('prev');
        } else if (gestureState.dx < -50) {
          // Swipe left - next page
          flipToPage('next');
        }
      },
    })
  ).current;

  const loadEvent = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const eventRef = doc(db, 'events', user.uid);
      const eventDoc = await getDoc(eventRef);

      if (eventDoc.exists()) {
        const data = eventDoc.data();
        setEvent({
          ...data,
          date: new Date(data.date),
        } as EventData);
        setMode('overview');
      }
    } catch (error) {
      console.error('Error loading event:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveEvent = async (eventData: EventData) => {
    if (!user) return;

    try {
      const eventRef = doc(db, 'events', user.uid);
      await setDoc(eventRef, {
        ...eventData,
        date: eventData.date.toISOString(),
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  };

  /* Image persistence with AsyncStorage */
  const loadImages = async (eventCode?: string) => {
    const code = eventCode || event?.code;
    if (!code) return;
    try {
      const stored = await AsyncStorage.getItem(`event_images_${code}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Migrate old format to new format
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          setImages(parsed.map((uri: string) => ({ uri, timestamp: Date.now() })));
        } else {
          setImages(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  };

  const saveImages = async (newImages: PhotoData[]) => {
    if (!event?.code) return;
    try {
      await AsyncStorage.setItem(`event_images_${event.code}`, JSON.stringify(newImages));

      // Also sync to album storage if we're viewing an album
      if (selectedAlbum) {
        await syncToAlbumStorage(newImages);
      }
    } catch (error) {
      console.error('Error saving images:', error);
      Alert.alert('Storage Full', 'Cannot save more photos. Try deleting some old ones.');
    }
  };

  // Sync changes to album storage
  const syncToAlbumStorage = async (updatedImages: PhotoData[]) => {
    if (!event?.code || !selectedAlbum) return;

    try {
      // Load current album photos
      const albumPhotosList = await loadEventPhotos(event.code, selectedAlbum.id);

      // Update album photos with changes from images
      const syncedPhotos = albumPhotosList.map(albumPhoto => {
        const matchingImage = updatedImages.find(img => img.uri === albumPhoto.uri);
        if (matchingImage) {
          return {
            ...albumPhoto,
            caption: matchingImage.caption,
            favorite: matchingImage.favorite,
            filter: matchingImage.filter,
            voiceNotes: matchingImage.voiceNotes,
          };
        }
        return albumPhoto;
      });

      // Save back to album storage
      await saveEventPhotos(event.code, selectedAlbum.id, syncedPhotos);

      // Reload album photos to reflect changes
      setAlbumPhotos(syncedPhotos);
    } catch (error) {
      console.error('Error syncing to album storage:', error);
    }
  };

  /* slideshow functions */
  const startSlideshow = () => {
    if (images.length === 0) return;
    setSlideshowActive(true);
    setCurrentSlideIndex(0);
    slideAnim.setValue(0);
    if (kenBurnsEnabled) startKenBurns();
  };

  const stopSlideshow = () => {
    setSlideshowActive(false);
    if (slideshowRef.current) clearInterval(slideshowRef.current);
    kenBurnsScale.setValue(1);
    kenBurnsX.setValue(0);
    kenBurnsY.setValue(0);
  };

  const startKenBurns = () => {
    const randomScale = 1 + Math.random() * 0.3;
    const randomX = (Math.random() - 0.5) * 40;
    const randomY = (Math.random() - 0.5) * 40;

    Animated.parallel([
      Animated.timing(kenBurnsScale, { toValue: randomScale, duration: slideshowSpeed, useNativeDriver: true }),
      Animated.timing(kenBurnsX, { toValue: randomX, duration: slideshowSpeed, useNativeDriver: true }),
      Animated.timing(kenBurnsY, { toValue: randomY, duration: slideshowSpeed, useNativeDriver: true }),
    ]).start();
  };

  const transitionToNextSlide = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
    ]).start();

    setCurrentSlideIndex(prev => (prev + 1) % images.length);
    if (kenBurnsEnabled) {
      kenBurnsScale.setValue(1);
      kenBurnsX.setValue(0);
      kenBurnsY.setValue(0);
      startKenBurns();
    }
  };

  useEffect(() => {
    if (slideshowActive && images.length > 0) {
      slideshowRef.current = setInterval(transitionToNextSlide, slideshowSpeed);
    }
    return () => { if (slideshowRef.current) clearInterval(slideshowRef.current); };
  }, [slideshowActive, images.length, slideshowSpeed]);

  /* helpers */
  const resetForm = () => { setTitle(''); setHall(''); setDate(new Date()); setGuests(''); setBudget(''); };

  const handleCreate = async () => {
    if (!title.trim() || !hall.trim()) { Alert.alert('Fill all required fields'); return; }

    const code = generateCode();
    const eventData: EventData = {
      title: title.trim(),
      hall: hall.trim(),
      date,
      guestLimit: Number(guests) || 0,
      budget: Number(budget) || 0,
      code,
    };

    try {
      await saveEvent(eventData);
      setEvent(eventData);
      Alert.alert('Event Created', `Your event has been saved! Share this code: ${code}`);
      resetForm();
      setMode('overview');
    } catch (error) {
      Alert.alert('Error', 'Failed to save event. Please try again.');
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) {
      Alert.alert('Error', 'Please enter a code');
      return;
    }

    try {
      // Search for event with this code in Firestore
      const eventsRef = collection(db, 'events');
      const q = query(eventsRef, where('code', '==', joinCode.trim()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert('Invalid Code', 'No event found with this code');
        return;
      }

      // Load the event
      const eventDoc = snapshot.docs[0];
      const data = eventDoc.data();
      const loadedEvent = {
        ...data,
        date: new Date(data.date),
      } as EventData;

      setEvent(loadedEvent);

      // Load images for this event
      await loadImages(loadedEvent.code);

      setJoinCode('');
      setMode('overview');
      Alert.alert('Success', 'Joined event successfully!');
    } catch (error) {
      console.error('Error joining event:', error);
      Alert.alert('Error', 'Failed to join event');
    }
  };

  /* derived for overview */
  const hallName = event?.hall ?? '';
  const guestCount = event?.guestLimit ?? 0;
  const eventDate = event?.date ?? new Date();
  const budgetVal = event?.budget ?? 1;
  const rsvpCount = Math.floor(guestCount * 0.6);           // demo
  const spent = Math.min(budgetVal * 0.75, budgetVal);    // demo

  /* countdown */
  const [countDown, setCountDown] = useState('');
  const [spark, setSpark] = useState(false);
  useEffect(() => {
    if (mode !== 'overview') return;
    const tick = () => {
      const diff = eventDate.getTime() - Date.now();
      if (diff <= 0) { setCountDown('Today!'); setSpark(false); return; }
      const d = Math.floor(diff / 86_400_000), h = Math.floor((diff / 3_600_000) % 24), m = Math.floor((diff / 60_000) % 60);
      setCountDown(`${d}d ${h}h ${m}m`);
      setSpark(diff < 86_400_000);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [mode, eventDate]);

  /* RSVP animation */
  const ring = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (mode !== 'overview') return;
    Animated.timing(ring, { toValue: guestCount ? rsvpCount / guestCount : 0, duration: 1200, easing: Easing.out(Easing.exp), useNativeDriver: false }).start();
  }, [mode, rsvpCount, guestCount]);
  const pickImage = async () => {
    if (eventAlbums.length > 0) {
      setSelectEventForUpload(true);
    } else {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsMultipleSelection: true,
      });
      if (!res.canceled) {
        const newPhotos: PhotoData[] = res.assets.map(asset => ({
          uri: asset.uri,
          timestamp: Date.now(),
          filter: 'none',
        }));
        const updated = [...images, ...newPhotos];
        setImages(updated);
        await saveImages(updated);
      }
    }
  };

  const uploadToAlbum = async (albumId: string) => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
    });
    if (!res.canceled && event?.code && user) {
      const newPhotos: EventPhoto[] = res.assets.map(asset => ({
        uri: asset.uri,
        eventId: albumId,
        timestamp: Date.now(),
        filter: 'none',
        uploadedBy: user.uid,
      }));
      await addPhotosToEvent(event.code, albumId, newPhotos);
      await loadAlbums();
      setSelectEventForUpload(false);
      Alert.alert('Success', `Added ${newPhotos.length} photos to album`);
    }
  };

  const deleteImage = async (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    await saveImages(updated);
  };

  const toggleFavorite = async (index: number) => {
    const updated = [...images];
    updated[index] = { ...updated[index], favorite: !updated[index].favorite };
    setImages(updated);
    await saveImages(updated);
  };

  const applyFilter = async (filter: string) => {
    if (editingPhotoIndex === null) return;
    const updated = [...images];
    updated[editingPhotoIndex] = { ...updated[editingPhotoIndex], filter };
    setImages(updated);
    await saveImages(updated);
    setFilterModalOpen(false);
    setEditingPhotoIndex(null);
  };

  const openPhotoEditor = (index: number) => {
    setEditingPhotoIndex(index);
    setFilterModalOpen(true);
  };

  const saveCaption = async () => {
    if (editingPhotoIndex === null) return;
    const updated = [...images];
    updated[editingPhotoIndex] = { ...updated[editingPhotoIndex], caption: tempCaption };
    setImages(updated);
    await saveImages(updated);
    setCaptionModalOpen(false);
    setEditingPhotoIndex(null);
    setTempCaption('');
  };

  const openCaptionEditor = (index: number) => {
    setEditingPhotoIndex(index);
    setTempCaption(images[index].caption || '');
    setCaptionModalOpen(true);
  };

  /* ========== VOICE NOTE FUNCTIONS ========== */
  const openVoiceNoteModal = (index: number) => {
    setEditingPhotoIndex(index);
    setVoiceNoteModalOpen(true);
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access to record voice notes');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingDuration(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    try {
      clearInterval(recordingTimerRef.current);
      setIsRecording(false);

      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();

      if (uri && editingPhotoIndex !== null && user) {
        const voiceNote: VoiceNote = {
          uri,
          duration: recordingDuration,
          userId: user.uid,
          userName: user.email?.split('@')[0] || 'Guest',
        };

        const updated = [...images];
        const existingNotes = updated[editingPhotoIndex].voiceNotes || [];
        updated[editingPhotoIndex] = {
          ...updated[editingPhotoIndex],
          voiceNotes: [...existingNotes, voiceNote],
        };

        setImages(updated);
        await saveImages(updated);
        Alert.alert('Success', 'Voice note saved!');
      }

      recordingRef.current = null;
      setRecordingDuration(0);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Error', 'Failed to save recording');
    }
  };

  const playVoiceNote = async (voiceNoteUri: string) => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri: voiceNoteUri });
      soundRef.current = sound;
      setPlayingVoiceNote(voiceNoteUri);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingVoiceNote(null);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play voice note:', error);
      Alert.alert('Error', 'Failed to play voice note');
    }
  };

  const stopPlayback = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      setPlayingVoiceNote(null);
    }
  };

  const deleteVoiceNote = async (voiceNoteUri: string) => {
    if (editingPhotoIndex === null) return;

    const isOwner = event?.userId === user?.uid;

    if (!isOwner) {
      Alert.alert('Permission Denied', 'Only the event creator can delete voice notes');
      return;
    }

    Alert.alert(
      'Delete Voice Note',
      'Are you sure you want to delete this voice note?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updated = [...images];
            const existingNotes = updated[editingPhotoIndex].voiceNotes || [];
            updated[editingPhotoIndex] = {
              ...updated[editingPhotoIndex],
              voiceNotes: existingNotes.filter(vn => vn.uri !== voiceNoteUri),
            };
            setImages(updated);
            await saveImages(updated);
          },
        },
      ]
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilterStyle = (filter?: string) => {
    // Note: React Native doesn't support CSS filters, so we use opacity and overlays
    switch (filter) {
      case 'grayscale':
        return { opacity: 0.8 };
      default:
        return {};
    }
  };

  const getFilterOverlay = (filter?: string) => {
    switch (filter) {
      case 'sepia':
        return { backgroundColor: 'rgba(112, 66, 20, 0.3)' };
      case 'vintage':
        return { backgroundColor: 'rgba(212, 165, 116, 0.25)' };
      case 'cool':
        return { backgroundColor: 'rgba(110, 181, 255, 0.2)' };
      case 'warm':
        return { backgroundColor: 'rgba(255, 179, 102, 0.25)' };
      default:
        return null;
    }
  };

  const displayImages = showFavoritesOnly ? images.filter(img => img.favorite) : images;

  /* chat - upgraded group chat */
  type ChatMessage = {
    id: string;
    text?: string;
    type: 'text' | 'photo' | 'video' | 'voice';
    mediaUrl?: string;
    voiceDuration?: number;
    userId: string;
    userName: string;
    timestamp: number;
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [mediaViewerOpen, setMediaViewerOpen] = useState(false);
  const [selectedMediaUri, setSelectedMediaUri] = useState<string>('');
  const [mediaViewerType, setMediaViewerType] = useState<'photo' | 'video'>('photo');
  const chatRef = useRef<FlatList>(null);
  const chatSoundRef = useRef<any>(null);

  // Load messages from Firestore
  useEffect(() => {
    if (!event?.code) return;

    const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [event?.code]);

  // Auto-scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        chatRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const sendTextMessage = async () => {
    if (!chatInput.trim() || !event?.code || !user) return;

    try {
      // Load user profile
      const storedProfile = await AsyncStorage.getItem('@user_profile');
      let userName = user.email?.split('@')[0] || 'Guest';
      let userAvatar = null;
      
      if (storedProfile) {
        const profile = JSON.parse(storedProfile);
        userName = profile.name || userName;
        userAvatar = profile.avatar || null;
      }

      const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
      await addDoc(messagesRef, {
        text: chatInput.trim(),
        type: 'text',
        userId: user.uid,
        userName,
        userAvatar,
        timestamp: Date.now(),
      });
      setChatInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const sendPhotoMessage = async () => {
    if (!event?.code || !user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        // Load user profile
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        let userName = user.email?.split('@')[0] || 'Guest';
        let userAvatar = null;
        
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          userName = profile.name || userName;
          userAvatar = profile.avatar || null;
        }

        const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
        await addDoc(messagesRef, {
          type: 'photo',
          mediaUrl: result.assets[0].uri,
          userId: user.uid,
          userName,
          userAvatar,
          timestamp: Date.now(),
        });
        setShowAttachMenu(false);
      }
    } catch (error) {
      console.error('Error sending photo:', error);
      Alert.alert('Error', 'Failed to send photo');
    }
  };

  const sendVideoMessage = async () => {
    if (!event?.code || !user) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        // Load user profile
        const storedProfile = await AsyncStorage.getItem('@user_profile');
        let userName = user.email?.split('@')[0] || 'Guest';
        let userAvatar = null;
        
        if (storedProfile) {
          const profile = JSON.parse(storedProfile);
          userName = profile.name || userName;
          userAvatar = profile.avatar || null;
        }

        const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
        await addDoc(messagesRef, {
          type: 'video',
          mediaUrl: result.assets[0].uri,
          userId: user.uid,
          userName,
          userAvatar,
          timestamp: Date.now(),
        });
        setShowAttachMenu(false);
      }
    } catch (error) {
      console.error('Error sending video:', error);
      Alert.alert('Error', 'Failed to send video');
    }
  };

  const startChatVoiceRecording = async () => {
    if (!event?.code || !user) return;

    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Required', 'Please allow microphone access');
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();

      // Record for max 60 seconds
      setTimeout(async () => {
        try {
          await recording.stopAndUnloadAsync();
          const uri = recording.getURI();
          if (uri) {
            // Load user profile
            const storedProfile = await AsyncStorage.getItem('@user_profile');
            let userName = user.email?.split('@')[0] || 'Guest';
            let userAvatar = null;
            
            if (storedProfile) {
              const profile = JSON.parse(storedProfile);
              userName = profile.name || userName;
              userAvatar = profile.avatar || null;
            }

            const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
            await addDoc(messagesRef, {
              type: 'voice',
              mediaUrl: uri,
              voiceDuration: 60,
              userId: user.uid,
              userName,
              userAvatar,
              timestamp: Date.now(),
            });
          }
        } catch (error) {
          console.error('Error saving voice:', error);
        }
      }, 60000);

      setShowAttachMenu(false);
      Alert.alert('Recording', 'Voice message recording... (max 60s)', [
        {
          text: 'Stop', onPress: async () => {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            if (uri) {
              // Load user profile
              const storedProfile = await AsyncStorage.getItem('@user_profile');
              let userName = user.email?.split('@')[0] || 'Guest';
              let userAvatar = null;
              
              if (storedProfile) {
                const profile = JSON.parse(storedProfile);
                userName = profile.name || userName;
                userAvatar = profile.avatar || null;
              }

              const messagesRef = collection(db, 'eventMessages', event.code, 'messages');
              await addDoc(messagesRef, {
                type: 'voice',
                mediaUrl: uri,
                voiceDuration: 10,
                userId: user.uid,
                userName,
                userAvatar,
                timestamp: Date.now(),
              });
            }
          }
        }
      ]);
    } catch (error) {
      console.error('Error recording voice:', error);
      Alert.alert('Error', 'Failed to record voice message');
    }
  };

  const playChatVoice = async (uri: string) => {
    try {
      if (chatSoundRef.current) {
        await chatSoundRef.current.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync({ uri });
      chatSoundRef.current = sound;
      setPlayingVoice(uri);

      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.didJustFinish) {
          setPlayingVoice(null);
        }
      });

      await sound.playAsync();
    } catch (error) {
      console.error('Error playing voice:', error);
    }
  };

  const stopChatVoice = async () => {
    if (chatSoundRef.current) {
      await chatSoundRef.current.stopAsync();
      await chatSoundRef.current.unloadAsync();
      chatSoundRef.current = null;
    }
    setPlayingVoice(null);
  };

  const deleteMessage = async (messageId: string) => {
    if (!event?.code || event.userId !== user?.uid) return;

    Alert.alert('Delete Message', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'eventMessages', event.code, 'messages', messageId));
          } catch (error) {
            console.error('Error deleting message:', error);
            Alert.alert('Error', 'Failed to delete message');
          }
        }
      }
    ]);
  };

  /* wave decoration */
  const waveX = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.loop(Animated.timing(waveX, { toValue: 1, duration: 8000, easing: Easing.linear, useNativeDriver: true })).start(); }, []);

  /* seating dummy */
  const [planOpen, setPlanOpen] = useState(false);

  /* ========== MENU ========== */
  if (loading) {
    return (
      <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.menuWrap}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading...</Text>
      </LinearGradient>
    );
  }

  if (mode === 'menu') return (
    <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.menuWrap}>
      <Text style={styles.menuH1}>Wedding Planner</Text>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setMode('create')}><Ionicons name="add-circle" size={26} color="#fff" /><Text style={styles.menuTxt}>Create Event</Text></TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setMode('join')}><Ionicons name="log-in" size={24} color="#fff" /><Text style={styles.menuTxt}>Join Event</Text></TouchableOpacity>
    </LinearGradient>
  );

  /* ========== CREATE FORM ========== */
  if (mode === 'create') return (
    <ScrollView contentContainerStyle={styles.formWrap} showsVerticalScrollIndicator={false}>
      <Text style={styles.formH1}>Create Event</Text>
      <TextInput style={styles.in} placeholder="Event title *" placeholderTextColor="#aaa" value={title} onChangeText={setTitle} />
      <TextInput style={styles.in} placeholder="Venue / Shaadi Hall *" placeholderTextColor="#aaa" value={hall} onChangeText={setHall} />
      <TouchableOpacity onPress={() => setShowDate(true)} style={styles.dateBtn}>
        <Ionicons name="calendar" size={20} color="#fff" style={{ marginRight: 8 }} /><Text style={styles.dateTxt}>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDate && (
        <DateTimePicker value={date} mode="date" display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e: DateTimePickerEvent, d?: Date) => { setShowDate(false); if (d) setDate(d); }}
        />
      )}
      <TextInput style={styles.in} placeholder="Expected guests" keyboardType="numeric" placeholderTextColor="#aaa" value={guests} onChangeText={setGuests} />
      <TextInput style={styles.in} placeholder="Budget (PKR)" keyboardType="numeric" placeholderTextColor="#aaa" value={budget} onChangeText={setBudget} />
      <TouchableOpacity style={styles.saveBtn} onPress={handleCreate}><Text style={styles.saveTxt}>Save & Continue</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setMode('menu')} style={{ marginTop: 12 }}><Text style={{ color: '#ccc' }}>Back to menu</Text></TouchableOpacity>
    </ScrollView>
  );

  /* ========== JOIN SCREEN ========== */
  if (mode === 'join') return (
    <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.formWrap}>
      <Text style={styles.formH1}>Join Event</Text>
      <TextInput style={styles.in} placeholder="Enter invite code" keyboardType="numeric" placeholderTextColor="#aaa" value={joinCode} onChangeText={setJoinCode} />
      <TouchableOpacity style={styles.saveBtn} onPress={handleJoin}><Text style={styles.saveTxt}>Join</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => setMode('menu')} style={{ marginTop: 12 }}><Text style={{ color: '#ccc' }}>Back to menu</Text></TouchableOpacity>
    </LinearGradient>
  );

  /* SAFEGUARD */
  if (!event) return null;

  /* ========== OVERVIEW (rich UI) ========== */
  return (
    <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={{ flex: 1 }}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setEvent(null);
          setMode('menu');
        }}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={styles.hero}>
          <LinearGradient colors={['rgba(0,0,0,0.55)', 'transparent']} style={styles.heroOverlay} />
          <View style={styles.coupleRow}>
            <Image source={GROOM_IMG} style={styles.avatar} /><Text style={styles.heart}>❤️</Text><Image source={BRIDE_IMG} style={styles.avatar} />
          </View>
          <View style={styles.quoteBlock}>
            <Text style={styles.quote}>“Two souls, one heart, one beautiful journey.”</Text>
            <Text style={styles.names}>{event.title}</Text>
          </View>

          {/* EVENT CODE CARD */}
          <View style={styles.eventCodeCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
              <Ionicons name="ticket" size={24} color="#ffeb3b" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Event Code</Text>
            </View>
            <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, borderWidth: 2, borderColor: 'rgba(255,235,59,0.3)', borderStyle: 'dashed' }}>
              <Text style={{ color: '#ffeb3b', fontSize: 32, fontWeight: '800', letterSpacing: 4, textAlign: 'center' }}>{event.code}</Text>
            </View>
            <Text style={{ color: '#ccc', fontSize: 12, marginTop: 8, textAlign: 'center' }}>Share this code with guests to join</Text>
          </View>

          <View style={styles.heroTxt}>
            <Text style={styles.hall}>{hallName}</Text>
            <Text style={styles.date}>{eventDate.toDateString()}</Text>
            <Text style={styles.count}>{countDown}</Text>
          </View>
          {spark && (
            <Animated.View style={[styles.spark, { opacity: waveX.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) }]}>
              <Ionicons name="sparkles" size={42} color="#ffeb3b" />
            </Animated.View>
          )}
        </View>

        {/* wave */}
        <Animated.View style={[styles.wave, { transform: [{ translateX: waveX.interpolate({ inputRange: [0, 1], outputRange: [0, -width] }) }] }]} />

        {/* DIGITAL ALBUM CAROUSEL */}
        <View style={styles.albumSection}>
          <View style={styles.albumHeader}>
            <Text style={styles.albumTitle}>📸 Wedding Album</Text>
            <TouchableOpacity onPress={pickImage} style={styles.addPhotoBtn}>
              <Ionicons name="add-circle" size={28} color="#ffeb3b" />
            </TouchableOpacity>
          </View>

          {images.length === 0 ? (
            <TouchableOpacity style={styles.emptyAlbum} onPress={pickImage}>
              <Ionicons name="images-outline" size={60} color="rgba(255,255,255,0.3)" />
              <Text style={styles.emptyAlbumText}>Tap to add your first photo</Text>
              <Text style={styles.emptyAlbumSubtext}>Create beautiful wedding memories</Text>
            </TouchableOpacity>
          ) : (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={width - 60}
              contentContainerStyle={styles.carouselContainer}
            >
              {images.map((photo, index) => (
                <Animated.View key={photo.uri + index} style={styles.carouselCard}>
                  <Image source={{ uri: photo.uri }} style={[styles.carouselImage, getFilterStyle(photo.filter)]} />
                  {getFilterOverlay(photo.filter) && (
                    <View style={[StyleSheet.absoluteFill, getFilterOverlay(photo.filter)]} />
                  )}
                  {photo.favorite && (
                    <View style={styles.favoriteBadge}>
                      <Ionicons name="heart" size={24} color="#ff4757" />
                    </View>
                  )}
                  {photo.caption && (
                    <View style={styles.captionOverlay}>
                      <Text style={styles.captionText}>{photo.caption}</Text>
                    </View>
                  )}
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.8)']}
                    style={styles.carouselOverlay}
                  >
                    <View style={styles.carouselControls}>
                      <Text style={styles.carouselIndex}>{index + 1} / {images.length}</Text>
                      <View style={styles.carouselActions}>
                        <TouchableOpacity style={styles.carouselBtn} onPress={() => toggleFavorite(index)}>
                          <Ionicons name={photo.favorite ? "heart" : "heart-outline"} size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.carouselBtn} onPress={() => openPhotoEditor(index)}>
                          <Ionicons name="color-filter" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.carouselBtn} onPress={() => openCaptionEditor(index)}>
                          <Ionicons name="text" size={22} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.carouselBtn, photo.voiceNotes && photo.voiceNotes.length > 0 && { backgroundColor: 'rgba(255,235,59,0.3)' }]} onPress={() => openVoiceNoteModal(index)}>
                          <Ionicons name="mic" size={22} color={photo.voiceNotes && photo.voiceNotes.length > 0 ? "#ffeb3b" : "#fff"} />
                          {photo.voiceNotes && photo.voiceNotes.length > 0 && (
                            <View style={{ position: 'absolute', top: -4, right: -4, backgroundColor: '#ffeb3b', borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center' }}>
                              <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>{photo.voiceNotes.length}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.carouselBtn} onPress={() => deleteImage(index)}>
                          <Ionicons name="trash" size={20} color="#ff4757" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </LinearGradient>
                </Animated.View>
              ))}
            </ScrollView>
          )}

          {images.length > 0 && (
            <>
              <View style={styles.albumActions}>
                <TouchableOpacity style={styles.albumActionBtn} onPress={() => setAlbumOpen(true)}>
                  <Ionicons name="grid" size={20} color="#fff" />
                  <Text style={styles.albumActionText}>View All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.albumActionBtn} onPress={() => setSlideshowSettingsOpen(true)}>
                  <Ionicons name="play" size={20} color="#fff" />
                  <Text style={styles.albumActionText}>Slideshow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.albumActionBtn} onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}>
                  <Ionicons name={showFavoritesOnly ? "heart" : "heart-outline"} size={20} color="#fff" />
                  <Text style={styles.albumActionText}>Favorites</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.albumStats}>
                <Text style={styles.albumStatsText}>
                  {images.length} photos • {images.filter(p => p.favorite).length} favorites
                </Text>
              </View>
            </>
          )}
        </View>

        {/* WIDGETS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.widgets}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SZ} height={RING_SZ}>
              <Circle cx={RING_SZ / 2} cy={RING_SZ / 2} r={(RING_SZ - RING_STROKE) / 2}
                stroke="rgba(255,255,255,0.25)" strokeWidth={RING_STROKE} />
              <AnimatedCircle cx={RING_SZ / 2} cy={RING_SZ / 2} r={(RING_SZ - RING_STROKE) / 2} stroke="#ffeb3b" strokeWidth={RING_STROKE} strokeLinecap="round"
                strokeDasharray={Math.PI * (RING_SZ - RING_STROKE)}
                strokeDashoffset={ring.interpolate({ inputRange: [0, 1], outputRange: [Math.PI * (RING_SZ - RING_STROKE), 0] })} />
            </Svg>
            <Text style={styles.ringTxt}>{`${rsvpCount}/${guestCount}`}{'\n'}RSVP</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLbl}>Budget</Text>
            <View style={styles.budgetBar}><View style={[styles.budgetFill, { width: `${(spent / budgetVal) * 100}%` }]} /></View>
            <Text style={styles.budgetTxt}>₨{spent.toLocaleString()} / ₨{budgetVal.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}
            onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${venueLatLng.lat},${venueLatLng.lng}`)}>
            <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 6 }} /><Text style={styles.cardLbl}>Directions</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* LUXURY ALBUM BUTTON */}
        <TouchableOpacity style={{ marginHorizontal: 10, marginVertical: 20, borderRadius: 16, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }} onPress={() => setAlbumMode('selection')}>
          <LinearGradient colors={['#7c26ff', '#9d4edd']} style={{ padding: 20, alignItems: 'center' }}>
            <Ionicons name="book" size={28} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 8 }}>Wedding Albums</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{eventAlbums.length} Events • Tap to Open</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* GALLERY TEASER */}
        <View style={styles.headRow}>
          <Text style={styles.title}>Gallery</Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={pickImage}><Ionicons name="add-circle" size={26} color="#fff" /></TouchableOpacity>
            <TouchableOpacity onPress={() => setAlbumOpen(true)} style={{ marginLeft: 12 }}><Ionicons name="images" size={26} color="#fff" /></TouchableOpacity>
          </View>
        </View>
        {images.length === 0 ? (
          <Text style={[styles.empty, { marginLeft: 14 }]}>No photos yet — tap ➕ to add.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.gRow}>
            {images.slice(-6).map((photo, idx) => (
              <View key={photo.uri + idx} style={{ position: 'relative' }}>
                <Image source={{ uri: photo.uri }} style={[styles.phPlaceholder, getFilterStyle(photo.filter)]} />
                {getFilterOverlay(photo.filter) && (
                  <View style={[{ position: 'absolute', top: 0, left: 0, right: 10, bottom: 0, borderRadius: 12 }, getFilterOverlay(photo.filter)]} />
                )}
                {photo.favorite && (
                  <View style={{ position: 'absolute', top: 4, right: 14, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 }}>
                    <Ionicons name="heart" size={14} color="#ff4757" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}

        {/* VENDORS */}
        <Text style={styles.title}>Vendors</Text>
        {eventVendors.length === 0 ? (
          <Text style={[styles.empty, { marginLeft: 14, marginBottom: 20 }]}>No vendors booked yet</Text>
        ) : (
          eventVendors.map(v => (
            <View key={v.id} style={styles.vendor}>
              <View style={{ flex: 1 }}>
                <Text style={styles.vName}>{v.name}</Text>
                <Text style={styles.vType}>{v.type}</Text>
                {v.rating && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Ionicons name="star" size={14} color="#fbbf24" />
                    <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 4 }}>
                      {v.rating.toFixed(1)} ({v.reviewCount || 0} reviews)
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  if (v.phone && v.phone !== 'N/A') {
                    Linking.openURL(`tel:${v.phone}`);
                  } else {
                    Alert.alert('No Phone', 'Phone number not available');
                  }
                }}
                style={{ backgroundColor: 'rgba(255,138,128,0.2)', padding: 10, borderRadius: 20 }}
              >
                <Ionicons name="call" size={22} color="#ff8a80" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* ACTIONS */}
        <View style={styles.actRow}>
          <TouchableOpacity style={styles.actBtn} onPress={() => setPlanOpen(true)}><Ionicons name="grid" size={24} color="#fff" /><Text style={styles.actTxt}>Seating Plan</Text></TouchableOpacity>
          <TouchableOpacity style={styles.actBtn}><Ionicons name="download" size={24} color="#fff" /><Text style={styles.actTxt}>Memory Capsule</Text></TouchableOpacity>
        </View>

        {/* CHAT */}
        <Text style={styles.title}>Live Chat 💬</Text>
        <View style={styles.chatWrap}>
          <FlatList
            ref={chatRef}
            data={messages}
            keyExtractor={m => m.id}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            onContentSizeChange={() => chatRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => chatRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isOwn = item.userId === user?.uid;
              const isOwner = event?.userId === user?.uid;

              return (
                <View style={[styles.messageContainer, isOwn && styles.messageContainerOwn]}>
                  <View style={{ flexDirection: isOwn ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                    {/* Avatar - show for everyone */}
                    <View style={isOwn ? { marginLeft: 8 } : { marginRight: 8 }}>
                      {item.userAvatar ? (
                        <Image source={{ uri: item.userAvatar }} style={styles.messageAvatar} />
                      ) : (
                        <View style={[styles.messageAvatar, styles.messageAvatarPlaceholder]}>
                          <Ionicons name="person" size={16} color="#e22f2f" />
                        </View>
                      )}
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.messageSender, isOwn && { textAlign: 'right' }]}>{item.userName}</Text>

                      <View style={[styles.bubble, isOwn && styles.bubbleSelf]}>
                    {item.type === 'text' && <Text style={[styles.msg, isOwn && styles.msgSelf]}>{item.text}</Text>}

                    {item.type === 'photo' && item.mediaUrl && (
                      <TouchableOpacity onPress={() => {
                        setSelectedMediaUri(item.mediaUrl!);
                        setMediaViewerType('photo');
                        setMediaViewerOpen(true);
                      }}>
                        <Image source={{ uri: item.mediaUrl }} style={styles.chatImage} />
                      </TouchableOpacity>
                    )}

                    {item.type === 'video' && item.mediaUrl && (
                      <TouchableOpacity
                        style={styles.chatVideoContainer}
                        onPress={() => {
                          setSelectedMediaUri(item.mediaUrl!);
                          setMediaViewerType('video');
                          setMediaViewerOpen(true);
                        }}
                      >
                        <Ionicons name="play-circle" size={48} color="#fff" />
                        <Text style={styles.chatVideoText}>Video Message</Text>
                      </TouchableOpacity>
                    )}

                    {item.type === 'voice' && item.mediaUrl && (
                      <TouchableOpacity
                        style={styles.chatVoiceContainer}
                        onPress={() => playingVoice === item.mediaUrl ? stopChatVoice() : playChatVoice(item.mediaUrl!)}
                      >
                        <Ionicons
                          name={playingVoice === item.mediaUrl ? "stop-circle" : "play-circle"}
                          size={32}
                          color={isOwn ? "#333" : "#fff"}
                        />
                        <Text style={[styles.chatVoiceText, isOwn && { color: '#333' }]}>
                          Voice {item.voiceDuration}s
                        </Text>
                      </TouchableOpacity>
                    )}

                    <Text style={[styles.messageTime, isOwn && { color: '#666' }]}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                      </View>
                    </View>
                  </View>

                  {isOwner && (
                    <TouchableOpacity
                      style={styles.deleteMessageBtn}
                      onPress={() => deleteMessage(item.id)}
                    >
                      <Ionicons name="trash" size={16} color="#ff4757" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            }}
          />
        </View>
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* CHAT INPUT */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={() => setShowAttachMenu(!showAttachMenu)}
          >
            <Ionicons name="add-circle" size={28} color="#7c26ff" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message…"
            placeholderTextColor="#ccc"
            value={chatInput}
            onChangeText={setChatInput}
            onSubmitEditing={sendTextMessage}
            returnKeyType="send"
          />

          <TouchableOpacity onPress={sendTextMessage} style={styles.sendBtn}>
            <Ionicons name="send" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {showAttachMenu && (
          <View style={styles.attachMenu}>
            <TouchableOpacity style={styles.attachOption} onPress={sendPhotoMessage}>
              <Ionicons name="image" size={24} color="#7c26ff" />
              <Text style={styles.attachOptionText}>Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachOption} onPress={sendVideoMessage}>
              <Ionicons name="videocam" size={24} color="#7c26ff" />
              <Text style={styles.attachOptionText}>Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.attachOption} onPress={startChatVoiceRecording}>
              <Ionicons name="mic" size={24} color="#7c26ff" />
              <Text style={styles.attachOptionText}>Voice</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* MEDIA VIEWER MODAL */}
      <Modal visible={mediaViewerOpen} animationType="fade" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, zIndex: 10 }}
            onPress={() => setMediaViewerOpen(false)}
          >
            <Ionicons name="close-circle" size={40} color="#fff" />
          </TouchableOpacity>

          {mediaViewerType === 'photo' && selectedMediaUri && (
            <Image
              source={{ uri: selectedMediaUri }}
              style={{ width: '90%', height: '80%', resizeMode: 'contain' }}
            />
          )}

          {mediaViewerType === 'video' && selectedMediaUri && (
            <View style={{ width: '90%', height: '80%', backgroundColor: '#000' }}>
              <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                Video: {selectedMediaUri.substring(selectedMediaUri.lastIndexOf('/') + 1)}
              </Text>
              <Text style={{ color: '#aaa', textAlign: 'center', marginTop: 10, fontSize: 12 }}>
                Tap to play in your device's video player
              </Text>
              <TouchableOpacity
                style={{ alignItems: 'center', marginTop: 40 }}
                onPress={() => Linking.openURL(selectedMediaUri)}
              >
                <Ionicons name="play-circle" size={80} color="#7c26ff" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Open Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* SEATING PLAN MODAL */}
      <Modal visible={planOpen} animationType="slide">
        <LinearGradient colors={['#29004e', '#1e0037']} style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Seating Plan (Coming Soon)</Text>
          <Text style={{ color: '#fff' }}>Drag & drop guests to tables here…</Text>
          <TouchableOpacity style={[styles.actBtn, { alignSelf: 'flex-end', marginTop: 20 }]} onPress={() => setPlanOpen(false)}>
            <Ionicons name="close" size={22} color="#fff" /><Text style={styles.actTxt}>Close</Text>
          </TouchableOpacity>
        </LinearGradient>
      </Modal>

      {/* ALBUM MODAL */}
      <Modal visible={albumOpen} animationType="slide">
        <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={{ flex: 1, paddingTop: 50 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>Wedding Album</Text>
            <TouchableOpacity onPress={() => setAlbumOpen(false)}><Ionicons name="close" size={26} color="#fff" /></TouchableOpacity>
          </View>
          {displayImages.length === 0 ? (
            <Text style={{ color: '#ccc', textAlign: 'center', marginTop: 30 }}>
              {showFavoritesOnly ? 'No favorites yet. Heart some photos!' : 'No photos yet.'}
            </Text>
          ) : (
            <FlatList
              data={displayImages}
              keyExtractor={(item, idx) => item.uri + idx}
              numColumns={3}
              contentContainerStyle={{ padding: 6 }}
              renderItem={({ item, index }) => (
                <TouchableOpacity onPress={() => openPhotoEditor(images.indexOf(item))} style={{ position: 'relative' }}>
                  <Image source={{ uri: item.uri }} style={[styles.albumThumb, getFilterStyle(item.filter)]} />
                  {getFilterOverlay(item.filter) && (
                    <View style={[StyleSheet.absoluteFill, { borderRadius: 10 }, getFilterOverlay(item.filter)]} />
                  )}
                  {item.favorite && (
                    <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: 4 }}>
                      <Ionicons name="heart" size={16} color="#ff4757" />
                    </View>
                  )}
                  {item.caption && (
                    <View style={{ position: 'absolute', bottom: 8, left: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: 4 }}>
                      <Text style={{ color: '#fff', fontSize: 10 }} numberOfLines={1}>{item.caption}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </LinearGradient>
      </Modal>

      {/* SLIDESHOW SETTINGS MODAL */}
      <Modal visible={slideshowSettingsOpen} animationType="slide" transparent>
        <View style={styles.settingsModal}>
          <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Slideshow Settings</Text>

            <Text style={styles.settingsLabel}>Speed: {slideshowSpeed / 1000}s per photo</Text>
            <View style={styles.speedButtons}>
              <TouchableOpacity style={[styles.speedBtn, slideshowSpeed === 2000 && styles.speedBtnActive]} onPress={() => setSlideshowSpeed(2000)}>
                <Text style={styles.speedBtnText}>Fast</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.speedBtn, slideshowSpeed === 3000 && styles.speedBtnActive]} onPress={() => setSlideshowSpeed(3000)}>
                <Text style={styles.speedBtnText}>Normal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.speedBtn, slideshowSpeed === 5000 && styles.speedBtnActive]} onPress={() => setSlideshowSpeed(5000)}>
                <Text style={styles.speedBtnText}>Slow</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.settingsActions}>
              <TouchableOpacity style={styles.settingsBtn} onPress={() => { setSlideshowSettingsOpen(false); startSlideshow(); }}>
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.settingsBtnText}>Start Slideshow</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setSlideshowSettingsOpen(false)}>
                <Text style={styles.settingsBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* SLIDESHOW MODAL */}
      <Modal visible={slideshowActive} animationType="fade" statusBarTranslucent>
        <View style={styles.slideshowContainer}>
          <TouchableOpacity style={styles.slideshowCloseBtn} onPress={stopSlideshow}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          {images.length > 0 && (
            <Animated.View style={[styles.slideshowContent, {
              opacity: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
              transform: [
                { scale: kenBurnsScale },
                { translateX: kenBurnsX },
                { translateY: kenBurnsY },
              ]
            }]}>
              <View style={{ width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' }}>
                <Image
                  source={{ uri: images[currentSlideIndex].uri }}
                  style={[styles.slideshowImage, getFilterStyle(images[currentSlideIndex].filter)]}
                  resizeMode="contain"
                />
                {getFilterOverlay(images[currentSlideIndex].filter) && (
                  <View style={[StyleSheet.absoluteFill, getFilterOverlay(images[currentSlideIndex].filter)]} />
                )}
              </View>
              {images[currentSlideIndex].caption && (
                <View style={styles.slideshowCaptionBox}>
                  <Text style={styles.slideshowCaption}>{images[currentSlideIndex].caption}</Text>
                </View>
              )}
              <View style={styles.slideshowIndicator}>
                <Text style={styles.slideshowCounter}>
                  {currentSlideIndex + 1} / {images.length}
                </Text>
              </View>
            </Animated.View>
          )}
        </View>
      </Modal>

      {/* FILTER MODAL */}
      <Modal visible={filterModalOpen} animationType="slide" transparent>
        <View style={styles.settingsModal}>
          <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Apply Filter</Text>

            {editingPhotoIndex !== null && (
              <Image source={{ uri: images[editingPhotoIndex].uri }} style={styles.filterPreview} />
            )}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {['none', 'sepia', 'grayscale', 'vintage', 'cool', 'warm'].map(filter => (
                <TouchableOpacity key={filter} style={styles.filterOption} onPress={() => applyFilter(filter)}>
                  {editingPhotoIndex !== null && (
                    <Image source={{ uri: images[editingPhotoIndex].uri }} style={[styles.filterThumb, getFilterStyle(filter)]} />
                  )}
                  <Text style={styles.filterName}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.1)', marginTop: 20 }]} onPress={() => { setFilterModalOpen(false); setAlbumOpen(true); }}>
              <Text style={styles.settingsBtnText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* CAPTION MODAL */}
      <Modal visible={captionModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.settingsModal}>
          <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>Add Caption</Text>

            <TextInput
              style={styles.captionInput}
              placeholder="Write a caption..."
              placeholderTextColor="#aaa"
              value={tempCaption}
              onChangeText={setTempCaption}
              multiline
              maxLength={100}
            />
            <Text style={styles.captionCounter}>{tempCaption.length}/100</Text>

            <View style={styles.settingsActions}>
              <TouchableOpacity style={styles.settingsBtn} onPress={saveCaption}>
                <Ionicons name="checkmark" size={24} color="#fff" />
                <Text style={styles.settingsBtnText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]} onPress={() => setCaptionModalOpen(false)}>
                <Text style={styles.settingsBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>

      {/* VOICE NOTE MODAL */}
      <Modal visible={voiceNoteModalOpen} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.settingsModal}>
          <LinearGradient colors={['#220042', '#311158', '#4f1b78']} style={styles.settingsContent}>
            <Text style={styles.settingsTitle}>📸 Photo Actions</Text>

            {/* Photo Preview */}
            {editingPhotoIndex !== null && (
              <View style={{ marginBottom: 20, alignItems: 'center' }}>
                <Image source={{ uri: images[editingPhotoIndex].uri }} style={{ width: 200, height: 200, borderRadius: 12 }} />
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20, justifyContent: 'center' }}>
              <TouchableOpacity
                style={{ backgroundColor: images[editingPhotoIndex!]?.favorite ? '#ff4757' : 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 80 }}
                onPress={() => editingPhotoIndex !== null && toggleFavorite(editingPhotoIndex)}
              >
                <Ionicons name={images[editingPhotoIndex!]?.favorite ? "heart" : "heart-outline"} size={24} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Favorite</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 80 }}
                onPress={() => {
                  if (editingPhotoIndex !== null) {
                    setVoiceNoteModalOpen(false);
                    openCaptionEditor(editingPhotoIndex);
                  }
                }}
              >
                <Ionicons name="text" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Caption</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 80 }}
                onPress={() => {
                  if (editingPhotoIndex !== null) {
                    setVoiceNoteModalOpen(false);
                    openPhotoEditor(editingPhotoIndex);
                  }
                }}
              >
                <Ionicons name="color-filter" size={24} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Filter</Text>
              </TouchableOpacity>

              {event?.userId === user?.uid && (
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,71,87,0.3)', padding: 12, borderRadius: 12, alignItems: 'center', minWidth: 80 }}
                  onPress={() => editingPhotoIndex !== null && deleteImage(editingPhotoIndex)}
                >
                  <Ionicons name="trash" size={24} color="#ff4757" />
                  <Text style={{ color: '#fff', fontSize: 12, marginTop: 4 }}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20, marginBottom: 20 }}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 10 }}>🎤 Voice Notes</Text>
            </View>

            {/* Existing Voice Notes */}
            {editingPhotoIndex !== null && images[editingPhotoIndex].voiceNotes && images[editingPhotoIndex].voiceNotes!.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 10 }}>Recorded Notes ({images[editingPhotoIndex].voiceNotes!.length})</Text>
                <ScrollView style={{ maxHeight: 200 }}>
                  {images[editingPhotoIndex].voiceNotes!.map((voiceNote, idx) => (
                    <View key={idx} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: '#ffeb3b', fontSize: 12, fontWeight: '600' }}>{voiceNote.userName || 'Guest'}</Text>
                        <Text style={{ color: '#ccc', fontSize: 12 }}>{formatDuration(voiceNote.duration)}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                          style={{ backgroundColor: playingVoiceNote === voiceNote.uri ? '#ff4757' : '#7c26ff', padding: 10, borderRadius: 20 }}
                          onPress={() => playingVoiceNote === voiceNote.uri ? stopPlayback() : playVoiceNote(voiceNote.uri)}
                        >
                          <Ionicons name={playingVoiceNote === voiceNote.uri ? "stop" : "play"} size={20} color="#fff" />
                        </TouchableOpacity>
                        {event?.userId === user?.uid && (
                          <TouchableOpacity
                            style={{ backgroundColor: 'rgba(255,71,87,0.3)', padding: 10, borderRadius: 20 }}
                            onPress={() => deleteVoiceNote(voiceNote.uri)}
                          >
                            <Ionicons name="trash" size={20} color="#ff4757" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Recording Section */}
            <View style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 20 }}>
              {isRecording ? (
                <>
                  <Animated.View style={{ marginBottom: 16 }}>
                    <Ionicons name="mic" size={60} color="#ff4757" />
                  </Animated.View>
                  <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', marginBottom: 8 }}>{formatDuration(recordingDuration)}</Text>
                  <Text style={{ color: '#ccc', fontSize: 14, marginBottom: 20 }}>Recording...</Text>
                  <TouchableOpacity style={{ backgroundColor: '#ff4757', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 }} onPress={stopRecording}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Stop & Save</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Ionicons name="mic-outline" size={60} color="#7c26ff" style={{ marginBottom: 16 }} />
                  <Text style={{ color: '#fff', fontSize: 16, marginBottom: 20, textAlign: 'center' }}>Record a voice note for this photo</Text>
                  <TouchableOpacity style={{ backgroundColor: '#7c26ff', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={startRecording}>
                    <Ionicons name="mic" size={20} color="#fff" />
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Start Recording</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#888', fontSize: 12, marginTop: 12 }}>Max 60 seconds</Text>
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.settingsBtn, { backgroundColor: 'rgba(255,255,255,0.1)' }]}
              onPress={async () => {
                setVoiceNoteModalOpen(false);
                setEditingPhotoIndex(null);
                if (isRecording) stopRecording();

                // Sync changes back to album storage if viewing an album
                if (selectedAlbum && event?.code) {
                  await syncToAlbumStorage(images);
                }
              }}
            >
              <Text style={styles.settingsBtnText}>Close</Text>
            </TouchableOpacity>
          </LinearGradient>
        </KeyboardAvoidingView>
      </Modal>

      {/* LUXURY ALBUM MODALS */}
      {albumMode === 'selection' && (
        <Modal visible={true} animationType="slide">
          <LinearGradient colors={['#1a0033', '#2d0052']} style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingTop: 50 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '700' }}>Wedding Albums</Text>
                <TouchableOpacity onPress={() => setAlbumMode(null)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 10 }}>
                {eventAlbums.length === 0 ? (
                  <View style={{ alignItems: 'center', marginTop: 100 }}>
                    <Ionicons name="albums-outline" size={80} color="rgba(255,255,255,0.3)" />
                    <Text style={{ color: '#fff', fontSize: 18, marginTop: 20 }}>No Albums Yet</Text>
                    <Text style={{ color: '#aaa', fontSize: 14, marginTop: 8 }}>Create your first event album</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    {eventAlbums.map(album => (
                      <TouchableOpacity
                        key={album.id}
                        style={{ width: (width - 40) / 2, marginBottom: 20, borderRadius: 12, overflow: 'hidden', backgroundColor: '#2a2a2a' }}
                        onPress={() => {
                          setSelectedAlbum(album);
                          setAlbumMode('cover');
                        }}
                      >
                        <LinearGradient colors={[album.theme.primary, album.theme.secondary]} style={{ height: 150, justifyContent: 'center', alignItems: 'center' }}>
                          {album.coverPhotoUri ? (
                            <Image source={{ uri: album.coverPhotoUri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
                          ) : (
                            <Ionicons name="images" size={60} color="rgba(255,255,255,0.5)" />
                          )}
                        </LinearGradient>
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', padding: 10 }}>{album.name}</Text>
                        <Text style={{ color: '#aaa', fontSize: 12, paddingHorizontal: 10, paddingBottom: 10 }}>{album.photoCount} photos</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </ScrollView>

              <TouchableOpacity
                style={{ position: 'absolute', bottom: 30, right: 30, backgroundColor: '#fff', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
                onPress={() => setCreateAlbumModal(true)}
              >
                <Ionicons name="add-circle" size={60} color="#7c26ff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      )}

      {createAlbumModal && (
        <Modal visible={true} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
              <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#333' }}>Create Event Album</Text>

              <TextInput
                style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 20 }}
                placeholder="Event Name"
                value={newAlbumName}
                onChangeText={setNewAlbumName}
              />

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10 }}>Quick Suggestions:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 }}>
                {EVENT_SUGGESTIONS.map(suggestion => (
                  <TouchableOpacity
                    key={suggestion}
                    style={{ backgroundColor: '#f0f0f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 }}
                    onPress={() => setNewAlbumName(suggestion)}
                  >
                    <Text style={{ color: '#333', fontSize: 12 }}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10 }}>Choose Theme:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
                {ALBUM_THEMES.map((theme, index) => (
                  <TouchableOpacity
                    key={theme.name}
                    style={{ alignItems: 'center', marginRight: 12, padding: 8, borderRadius: 12, borderWidth: 2, borderColor: selectedTheme === index ? '#7c26ff' : 'transparent' }}
                    onPress={() => setSelectedTheme(index)}
                  >
                    <LinearGradient colors={[theme.primary, theme.secondary]} style={{ width: 60, height: 60, borderRadius: 30, marginBottom: 4 }} />
                    <Text style={{ fontSize: 10, color: '#666' }}>{theme.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#7c26ff', padding: 14, borderRadius: 12, alignItems: 'center' }}
                  onPress={async () => {
                    if (newAlbumName.trim() && event?.code) {
                      await createEventAlbum(event.code, newAlbumName.trim(), selectedTheme);
                      await loadAlbums();
                      setCreateAlbumModal(false);
                      setNewAlbumName('');
                      setSelectedTheme(0);
                    }
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: '#666', padding: 14, borderRadius: 12, alignItems: 'center' }}
                  onPress={() => {
                    setCreateAlbumModal(false);
                    setNewAlbumName('');
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {selectEventForUpload && (
        <Modal visible={true} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
            <View style={{ backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400 }}>
              <Text style={{ fontSize: 22, fontWeight: '700', marginBottom: 20, color: '#333' }}>Select Album</Text>
              <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>Choose which album to add photos to:</Text>

              <ScrollView style={{ maxHeight: 300 }}>
                {eventAlbums.map(album => (
                  <TouchableOpacity
                    key={album.id}
                    style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: '#f5f5f5', marginBottom: 10 }}
                    onPress={() => uploadToAlbum(album.id)}
                  >
                    <LinearGradient colors={[album.theme.primary, album.theme.secondary]} style={{ width: 50, height: 50, borderRadius: 8, marginRight: 12, justifyContent: 'center', alignItems: 'center' }}>
                      <Ionicons name="images" size={24} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: '#333' }}>{album.name}</Text>
                      <Text style={{ fontSize: 12, color: '#666' }}>{album.photoCount} photos</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#999" />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={{ backgroundColor: '#666', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 }}
                onPress={() => setSelectEventForUpload(false)}
              >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {albumMode === 'cover' && selectedAlbum && (
        <Modal visible={true} animationType="fade">
          <LinearGradient colors={[selectedAlbum.theme.primary, selectedAlbum.theme.secondary]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', padding: 40 }}>
              <View style={{ borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 20, padding: 30, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 32, fontWeight: '700', textAlign: 'center', marginBottom: 20 }}>{selectedAlbum.name}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18, textAlign: 'center', marginBottom: 10 }}>{event?.title}</Text>
                <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', marginBottom: 30 }}>{eventDate.toDateString()}</Text>
                <View style={{ width: 100, height: 2, backgroundColor: 'rgba(255,255,255,0.5)', marginBottom: 30 }} />
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 40 }}>{selectedAlbum.photoCount} Precious Moments</Text>
                <TouchableOpacity
                  style={{ backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 16, paddingHorizontal: 40, borderRadius: 30 }}
                  onPress={async () => {
                    const photos = await loadEventPhotos(event!.code, selectedAlbum.id);
                    setAlbumPhotos(photos);

                    // Sync album photos to main images array so editing works
                    const photoDataArray: PhotoData[] = photos.map(p => ({
                      uri: p.uri,
                      caption: p.caption,
                      favorite: p.favorite,
                      timestamp: p.timestamp,
                      filter: p.filter,
                      voiceNotes: p.voiceNotes,
                    }));

                    // Merge with existing images (avoid duplicates)
                    const mergedImages = [...images];
                    photoDataArray.forEach(newPhoto => {
                      const existingIndex = mergedImages.findIndex(img => img.uri === newPhoto.uri);
                      if (existingIndex >= 0) {
                        mergedImages[existingIndex] = newPhoto;
                      } else {
                        mergedImages.push(newPhoto);
                      }
                    });
                    setImages(mergedImages);

                    setCurrentPage(0);
                    setAlbumMode('flip');
                  }}
                >
                  <Text style={{ color: '#333', fontSize: 18, fontWeight: '700' }}>Open Album</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={{ position: 'absolute', top: 50, left: 20 }}
                onPress={() => setAlbumMode('selection')}
              >
                <Ionicons name="arrow-back" size={32} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ position: 'absolute', top: 50, right: 20 }}
                onPress={() => setAlbumMode(null)}
              >
                <Ionicons name="close" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Modal>
      )}

      {albumMode === 'flip' && selectedAlbum && (
        <Modal visible={true} animationType="slide">
          {/* Dark Wood Background */}
          <LinearGradient colors={[selectedAlbum.theme.primary, selectedAlbum.theme.secondary]} style={{ flex: 1 }}>
            <View style={{ flex: 1, paddingTop: 50 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' }}>
                <TouchableOpacity onPress={() => setAlbumMode('cover')}>
                  <Ionicons name="arrow-back" size={28} color="#fff" />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginRight: 10 }}>{selectedAlbum.name}</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>Page {currentPage + 1} of {Math.ceil(albumPhotos.length / 2)}</Text>
                </View>
                <TouchableOpacity onPress={() => setAlbumMode(null)}>
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>
              </View>

              {albumPhotos.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                  <Ionicons name="images-outline" size={80} color="rgba(255,255,255,0.5)" />
                  <Text style={{ color: '#fff', fontSize: 18, marginTop: 20 }}>No Photos Yet</Text>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 }}>Add photos to this album</Text>
                  <TouchableOpacity
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 20, marginTop: 20 }}
                    onPress={() => {
                      setAlbumMode(null);
                      setSelectEventForUpload(true);
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Photos</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ flex: 1, margin: 20 }}>
                  {/* Single Page View */}
                  <View style={{ flex: 1, backgroundColor: '#FFFEF0', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 }}>
                    <View style={{ flex: 1, justifyContent: 'space-between' }}>
                      {/* Top Photo */}
                      {albumPhotos[currentPage * 2] && (
                        <TouchableOpacity
                          style={{ flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, marginBottom: 10 }}
                          onPress={() => {
                            const photoIndex = images.findIndex(img => img.uri === albumPhotos[currentPage * 2].uri);
                            if (photoIndex !== -1) {
                              openVoiceNoteModal(photoIndex);
                            }
                          }}
                        >
                          <Image source={{ uri: albumPhotos[currentPage * 2].uri }} style={{ width: '100%', height: '100%', borderRadius: 2, resizeMode: 'cover' }} />

                          {/* Favorite Badge */}
                          {albumPhotos[currentPage * 2].favorite && (
                            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 6 }}>
                              <Ionicons name="heart" size={18} color="#ff4757" />
                            </View>
                          )}

                          {/* Voice Note Indicator */}
                          {albumPhotos[currentPage * 2].voiceNotes && albumPhotos[currentPage * 2].voiceNotes!.length > 0 && (
                            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,235,59,0.9)', borderRadius: 12, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Ionicons name="mic" size={14} color="#000" />
                              <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>{albumPhotos[currentPage * 2].voiceNotes!.length}</Text>
                            </View>
                          )}

                          {albumPhotos[currentPage * 2].caption && (
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8 }}>
                              <Text style={{ fontSize: 12, color: '#fff', fontStyle: 'italic', textAlign: 'center' }} numberOfLines={2}>{albumPhotos[currentPage * 2].caption}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}

                      {/* Bottom Photo */}
                      {albumPhotos[currentPage * 2 + 1] && (
                        <TouchableOpacity
                          style={{ flex: 1, backgroundColor: '#fff', padding: 10, borderRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 6, marginTop: 10 }}
                          onPress={() => {
                            const photoIndex = images.findIndex(img => img.uri === albumPhotos[currentPage * 2 + 1].uri);
                            if (photoIndex !== -1) {
                              openVoiceNoteModal(photoIndex);
                            }
                          }}
                        >
                          <Image source={{ uri: albumPhotos[currentPage * 2 + 1].uri }} style={{ width: '100%', height: '100%', borderRadius: 2, resizeMode: 'cover' }} />

                          {/* Favorite Badge */}
                          {albumPhotos[currentPage * 2 + 1].favorite && (
                            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 6 }}>
                              <Ionicons name="heart" size={18} color="#ff4757" />
                            </View>
                          )}

                          {/* Voice Note Indicator */}
                          {albumPhotos[currentPage * 2 + 1].voiceNotes && albumPhotos[currentPage * 2 + 1].voiceNotes!.length > 0 && (
                            <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255,235,59,0.9)', borderRadius: 12, padding: 6, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                              <Ionicons name="mic" size={14} color="#000" />
                              <Text style={{ color: '#000', fontSize: 10, fontWeight: '700' }}>{albumPhotos[currentPage * 2 + 1].voiceNotes!.length}</Text>
                            </View>
                          )}

                          {albumPhotos[currentPage * 2 + 1].caption && (
                            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', padding: 8 }}>
                              <Text style={{ fontSize: 12, color: '#fff', fontStyle: 'italic', textAlign: 'center' }} numberOfLines={2}>{albumPhotos[currentPage * 2 + 1].caption}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={{ textAlign: 'center', fontSize: 12, color: '#999', marginTop: 10 }}>Page {currentPage + 1}</Text>
                  </View>

                  {/* Navigation Controls */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingHorizontal: 20 }}>
                    <TouchableOpacity
                      style={{ backgroundColor: currentPage > 0 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', padding: 14, borderRadius: 30, opacity: currentPage > 0 ? 1 : 0.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                      onPress={() => currentPage > 0 && setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 0}
                    >
                      <Ionicons name="chevron-back" size={28} color="#333" />
                    </TouchableOpacity>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.9)', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 }}>
                      <Text style={{ fontSize: 14, color: '#333', fontWeight: '600' }}>Page {currentPage + 1} of {Math.ceil(albumPhotos.length / 2)}</Text>
                    </View>
                    <TouchableOpacity
                      style={{ backgroundColor: currentPage < Math.ceil(albumPhotos.length / 2) - 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)', padding: 14, borderRadius: 30, opacity: currentPage < Math.ceil(albumPhotos.length / 2) - 1 ? 1 : 0.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
                      onPress={() => currentPage < Math.ceil(albumPhotos.length / 2) - 1 && setCurrentPage(currentPage + 1)}
                      disabled={currentPage >= Math.ceil(albumPhotos.length / 2) - 1}
                    >
                      <Ionicons name="chevron-forward" size={28} color="#333" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </LinearGradient>
        </Modal>
      )}
    </LinearGradient>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  /* menu */
  menuWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuH1: { color: '#fff', fontSize: 28, fontWeight: '700', marginBottom: 30 },
  menuBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c26ff', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 24, marginVertical: 8 },
  menuTxt: { color: '#fff', fontWeight: '600', marginLeft: 8, fontSize: 16 },

  /* form */
  formWrap: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#220042' },
  formH1: { color: '#fff', fontSize: 24, fontWeight: '700', marginBottom: 20 },
  in: { width: '100%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, color: '#fff', marginBottom: 12 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, padding: 14, marginBottom: 12 },
  dateTxt: { color: '#fff' },
  saveBtn: { backgroundColor: '#7c26ff', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 30, marginTop: 6 },
  saveTxt: { color: '#fff', fontWeight: '600' },

  /* overview (existing styles) */
  hero: { height: height * 0.55, justifyContent: 'flex-end' }, heroOverlay: { ...StyleSheet.absoluteFillObject },
  coupleRow: { position: 'absolute', top: 40, alignSelf: 'center', flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#fff' }, heart: { fontSize: 30, marginHorizontal: 14, color: '#ffeb3b' },
  quoteBlock: { position: 'absolute', top: 180, alignSelf: 'center', alignItems: 'center', paddingHorizontal: 20 },
  eventCodeCard: { position: 'absolute', top: 280, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 16, padding: 16, minWidth: 280, alignItems: 'center', backdropFilter: 'blur(10px)' },
  quote: { color: '#ffeb3b', fontStyle: 'italic', fontSize: 16, textAlign: 'center' }, names: { color: '#fff', fontWeight: '700', marginTop: 4, fontSize: 18 },
  heroTxt: { padding: 16, marginTop: -6 }, hall: { color: '#fff', fontSize: 26, fontWeight: 'bold' }, date: { color: '#d0c4ff', marginTop: 2 }, count: { color: '#ffeb3b', fontWeight: '700', marginTop: 2 },
  spark: { position: 'absolute', top: 18, right: 18 },
  wave: { height: 50, width: width * 2, backgroundColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  widgets: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 6 }, ringWrap: { alignItems: 'center', marginRight: 14 }, ringTxt: { color: '#fff', fontSize: 12, textAlign: 'center', marginTop: 4 },
  card: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 14, marginRight: 14, minWidth: 110, alignItems: 'center' },
  cardLbl: { color: '#fff', fontWeight: '600', marginTop: 4 }, budgetBar: { width: '100%', height: 6, backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 3, marginTop: 6 },
  budgetFill: { height: 6, backgroundColor: '#80ffea', borderRadius: 3 }, budgetTxt: { color: '#fff', fontSize: 11, marginTop: 4, textAlign: 'center' },
  title: { color: '#fff', fontSize: 20, fontWeight: '700', marginVertical: 14, marginLeft: 10 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 10 },
  empty: { color: '#ccc', fontStyle: 'italic', marginBottom: 10 }, gRow: { paddingLeft: 10, marginBottom: 10 },
  phPlaceholder: { width: 120, height: 90, borderRadius: 12, marginRight: 10, resizeMode: 'cover' },
  albumThumb: { width: (width - 24) / 3 - 8, height: (width - 24) / 3 - 8, borderRadius: 10, margin: 4, backgroundColor: '#333' },

  vendor: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.12)', padding: 14, marginHorizontal: 10, borderRadius: 16, marginBottom: 10 },
  vName: { color: '#fff', fontWeight: '600' }, vType: { color: '#ccc', fontSize: 12 },

  actRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 },
  actBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#7c26ff', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 20 },
  actTxt: { color: '#fff', fontWeight: '600', marginLeft: 6 },

  chatWrap: { height: 300, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 10, borderRadius: 16, padding: 10, overflow: 'hidden' },
  messageContainer: { marginVertical: 4, alignItems: 'flex-start', maxWidth: '85%' },
  messageContainerOwn: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  messageSender: { color: '#aaa', fontSize: 11, marginBottom: 2, marginLeft: 8, marginRight: 8 },
  messageAvatar: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#e22f2f' },
  messageAvatarPlaceholder: { backgroundColor: '#ffe4e6', justifyContent: 'center', alignItems: 'center' },
  bubble: { backgroundColor: 'rgba(124,38,255,0.9)', padding: 10, borderRadius: 12, minWidth: 60 },
  bubbleSelf: { backgroundColor: '#fff' },
  msg: { color: '#fff', fontSize: 14 },
  msgSelf: { color: '#333' },
  messageTime: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 4 },
  chatImage: { width: 200, height: 150, borderRadius: 8, resizeMode: 'cover' },
  chatVideoContainer: { width: 200, height: 150, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  chatVideoText: { color: '#fff', marginTop: 8, fontSize: 12 },
  chatVoiceContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatVoiceText: { color: '#fff', fontSize: 14 },
  deleteMessageBtn: { marginLeft: 8, padding: 4 },

  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', margin: 10, borderRadius: 30, paddingHorizontal: 10 },
  attachBtn: { padding: 8 },
  attachMenu: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 10, marginBottom: 10, borderRadius: 16, padding: 10, justifyContent: 'space-around' },
  attachOption: { alignItems: 'center', padding: 10 },
  attachOptionText: { color: '#fff', fontSize: 12, marginTop: 4 },
  input: { flex: 1, color: '#fff', paddingVertical: 10 },
  sendBtn: { backgroundColor: '#7c26ff', padding: 10, borderRadius: 25 },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 10,
    borderRadius: 20,
  },

  // Digital Album Styles
  albumSection: {
    marginVertical: 20,
    paddingHorizontal: 16,
  },
  albumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  albumTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
  },
  addPhotoBtn: {
    padding: 4,
  },
  emptyAlbum: {
    height: 280,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    borderStyle: 'dashed',
  },
  emptyAlbumText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyAlbumSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  carouselContainer: {
    paddingRight: 30,
  },
  carouselCard: {
    width: width - 60,
    height: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  carouselIndex: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deletePhotoBtn: {
    backgroundColor: 'rgba(226,47,47,0.9)',
    padding: 8,
    borderRadius: 20,
  },
  albumActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    gap: 8,
  },
  albumActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  albumActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Slideshow Styles
  slideshowContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  slideshowContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideshowImage: {
    width: '100%',
    height: '80%',
  },
  slideshowIndicator: {
    position: 'absolute',
    bottom: 50,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  slideshowCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  slideshowCaptionBox: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 16,
    borderRadius: 12,
  },
  slideshowCaption: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Premium Features Styles
  favoriteBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 20,
    zIndex: 2,
  },
  captionOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 12,
    zIndex: 2,
  },
  captionText: {
    color: '#fff',
    fontSize: 14,
    fontStyle: 'italic',
  },
  carouselControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  carouselActions: {
    flexDirection: 'row',
    gap: 8,
  },
  carouselBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  albumStats: {
    marginTop: 8,
    alignItems: 'center',
  },
  albumStatsText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },

  // Modal Styles
  settingsModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  settingsContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 24,
  },
  settingsTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  settingsLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  speedBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  speedBtnActive: {
    backgroundColor: '#7c26ff',
  },
  speedBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  settingsActions: {
    gap: 10,
  },
  settingsBtn: {
    backgroundColor: '#7c26ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  settingsBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Filter Styles
  filterPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'cover',
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterOption: {
    alignItems: 'center',
    marginRight: 16,
  },
  filterThumb: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  filterName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // Caption Styles
  captionInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  captionCounter: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 20,
  },
});
