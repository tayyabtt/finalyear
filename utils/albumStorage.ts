import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALBUM_THEMES, EventAlbum, EventPhoto } from '../types/album';

// Storage keys
const getAlbumsKey = (eventCode: string) => `event_albums_${eventCode}`;
const getPhotosKey = (eventCode: string, eventId: string) => `event_photos_${eventCode}_${eventId}`;

// Event Album Operations
export const loadEventAlbums = async (eventCode: string): Promise<EventAlbum[]> => {
  try {
    const stored = await AsyncStorage.getItem(getAlbumsKey(eventCode));
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading event albums:', error);
    return [];
  }
};

export const saveEventAlbums = async (eventCode: string, albums: EventAlbum[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(getAlbumsKey(eventCode), JSON.stringify(albums));
  } catch (error) {
    console.error('Error saving event albums:', error);
    throw error;
  }
};

export const createEventAlbum = async (
  eventCode: string,
  name: string,
  themeIndex: number
): Promise<EventAlbum> => {
  const albums = await loadEventAlbums(eventCode);
  
  const newAlbum: EventAlbum = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    theme: ALBUM_THEMES[themeIndex] || ALBUM_THEMES[0],
    createdAt: Date.now(),
    photoCount: 0,
  };
  
  albums.push(newAlbum);
  await saveEventAlbums(eventCode, albums);
  
  return newAlbum;
};

export const updateAlbumPhotoCount = async (
  eventCode: string,
  eventId: string,
  count: number
): Promise<void> => {
  const albums = await loadEventAlbums(eventCode);
  const album = albums.find(a => a.id === eventId);
  
  if (album) {
    album.photoCount = count;
    await saveEventAlbums(eventCode, albums);
  }
};

export const updateAlbumCoverPhoto = async (
  eventCode: string,
  eventId: string,
  photoUri: string
): Promise<void> => {
  const albums = await loadEventAlbums(eventCode);
  const album = albums.find(a => a.id === eventId);
  
  if (album) {
    album.coverPhotoUri = photoUri;
    await saveEventAlbums(eventCode, albums);
  }
};

// Event Photo Operations
export const loadEventPhotos = async (eventCode: string, eventId: string): Promise<EventPhoto[]> => {
  try {
    const stored = await AsyncStorage.getItem(getPhotosKey(eventCode, eventId));
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  } catch (error) {
    console.error('Error loading event photos:', error);
    return [];
  }
};

export const saveEventPhotos = async (
  eventCode: string,
  eventId: string,
  photos: EventPhoto[]
): Promise<void> => {
  try {
    await AsyncStorage.setItem(getPhotosKey(eventCode, eventId), JSON.stringify(photos));
    
    // Update photo count
    await updateAlbumPhotoCount(eventCode, eventId, photos.length);
    
    // Update cover photo if not set
    const albums = await loadEventAlbums(eventCode);
    const album = albums.find(a => a.id === eventId);
    if (album && !album.coverPhotoUri && photos.length > 0) {
      await updateAlbumCoverPhoto(eventCode, eventId, photos[0].uri);
    }
  } catch (error) {
    console.error('Error saving event photos:', error);
    throw error;
  }
};

export const addPhotoToEvent = async (
  eventCode: string,
  eventId: string,
  photo: EventPhoto
): Promise<void> => {
  const photos = await loadEventPhotos(eventCode, eventId);
  photos.push(photo);
  await saveEventPhotos(eventCode, eventId, photos);
};

export const addPhotosToEvent = async (
  eventCode: string,
  eventId: string,
  newPhotos: EventPhoto[]
): Promise<void> => {
  const photos = await loadEventPhotos(eventCode, eventId);
  photos.push(...newPhotos);
  await saveEventPhotos(eventCode, eventId, photos);
};

// Migration: Convert old photos to default album
export const migrateOldPhotos = async (eventCode: string, userId: string): Promise<void> => {
  try {
    // Check if old photos exist
    const oldKey = `event_images_${eventCode}`;
    const oldPhotos = await AsyncStorage.getItem(oldKey);
    
    if (!oldPhotos) return;
    
    // Check if already migrated
    const albums = await loadEventAlbums(eventCode);
    const defaultAlbum = albums.find(a => a.name === 'All Photos');
    
    if (defaultAlbum) return; // Already migrated
    
    // Create default album
    const newAlbum = await createEventAlbum(eventCode, 'All Photos', 2); // Walima theme
    
    // Convert old photos
    const parsed = JSON.parse(oldPhotos);
    const eventPhotos: EventPhoto[] = parsed.map((photo: any) => ({
      ...photo,
      eventId: newAlbum.id,
      uploadedBy: userId,
      timestamp: photo.timestamp || Date.now(),
    }));
    
    // Save to new structure
    await saveEventPhotos(eventCode, newAlbum.id, eventPhotos);
    
    console.log(`Migrated ${eventPhotos.length} photos to default album`);
  } catch (error) {
    console.error('Error migrating old photos:', error);
  }
};
