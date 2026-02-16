// utils/bookings.ts
// Booking management (Firestore + local storage)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';

const STORAGE_KEYS = {
  BOOKINGS: '@shaadiset:bookings',
  NOTIFICATIONS: '@shaadiset:notifications',
  CHATS: '@shaadiset:chats',
};

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  vendorId: string;
  vendorName: string;
  serviceType: string;
  eventDate: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  type: 'booking' | 'message' | 'status_update';
  title: string;
  message: string;
  bookingId?: string;
  read: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  vendorId: string;
  userName: string;
  vendorName: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

const MESSAGES_KEY = '@shaadiset:messages';

// Bookings - Firestore implementation
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const snapshot = await getDocs(bookingsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    console.error('Error getting bookings:', error);
    return [];
  }
};

// Create booking
export const createBooking = async (booking: Booking): Promise<void> => {
  try {
    // Use the booking's ID as the document ID
    const bookingRef = doc(db, 'bookings', booking.id);
    await setDoc(bookingRef, booking);
    console.log('Booking created with ID:', booking.id);
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Get bookings for user
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    console.error('Error getting user bookings:', error);
    return [];
  }
};

// Get bookings for vendor
export const getVendorBookings = async (vendorId: string): Promise<Booking[]> => {
  try {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, where('vendorId', '==', vendorId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
  } catch (error) {
    console.error('Error getting vendor bookings:', error);
    return [];
  }
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: 'accepted' | 'declined'
): Promise<void> => {
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, { status });
    console.log(`Booking ${bookingId} updated to ${status}`);
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Notifications
export const getAllNotifications = async (): Promise<Notification[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

export const createNotification = async (notification: Notification): Promise<void> => {
  try {
    const notifications = await getAllNotifications();
    notifications.unshift(notification); // Add to beginning
    await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notifications = await getAllNotifications();
    return notifications.filter(n => n.recipientId === userId);
  } catch (error) {
    console.error('Error getting user notifications:', error);
    return [];
  }
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notifications = await getAllNotifications();
    const index = notifications.findIndex(n => n.id === notificationId);
    if (index >= 0) {
      notifications[index].read = true;
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

// Chats - Firestore implementation
export const getAllChats = async (): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const snapshot = await getDocs(chatsRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
  } catch (error) {
    console.error('Error getting chats:', error);
    return [];
  }
};

export const getOrCreateChat = async (
  userId: string,
  vendorId: string,
  userName: string,
  vendorName: string
): Promise<Chat> => {
  try {
    const chatId = `${userId}_${vendorId}`;
    const chatRef = doc(db, 'chats', chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      return { id: chatDoc.id, ...chatDoc.data() } as Chat;
    }
    
    // Create new chat
    const newChat: Chat = {
      id: chatId,
      userId,
      vendorId,
      userName,
      vendorName,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
    };
    
    await setDoc(chatRef, newChat);
    return newChat;
  } catch (error) {
    console.error('Error getting/creating chat:', error);
    throw error;
  }
};

export const getUserChats = async (userId: string, isVendor: boolean): Promise<Chat[]> => {
  try {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where(isVendor ? 'vendorId' : 'userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
  } catch (error) {
    console.error('Error getting user chats:', error);
    return [];
  }
};

// Messages - Firestore implementation

export const getAllMessages = async (): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
  } catch (error) {
    console.error('Error getting messages:', error);
    return [];
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

export const sendMessage = async (message: ChatMessage): Promise<void> => {
  try {
    // Save message to Firestore
    const messagesRef = collection(db, 'messages');
    await addDoc(messagesRef, message);
    
    // Update chat's last message in Firestore
    const chatRef = doc(db, 'chats', message.chatId);
    const chatDoc = await getDoc(chatRef);
    
    if (chatDoc.exists()) {
      await setDoc(chatRef, {
        ...chatDoc.data(),
        lastMessage: message.text,
        lastMessageTime: message.timestamp,
      }, { merge: true });
    }
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};
