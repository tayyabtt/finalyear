// utils/firestore.ts
// Firestore helper functions for user and vendor profiles

import { doc, getDoc, getFirestore, setDoc, Timestamp } from 'firebase/firestore';

const db = getFirestore();

// Type definitions
export interface UserProfile {
  userId: string;
  role: 'user';
  fullName: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  phoneNumber?: string;
  avatar?: string;
  weddingDate?: Timestamp;
}

export interface VendorProfile {
  userId: string;
  role: 'vendor';
  businessName: string;
  serviceType: string;
  location: string;
  phoneNumber: string;
  email: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  avatar?: string;
  description?: string;
  priceRange?: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  portfolio?: string[];
}

/**
 * Create user profile in Firestore
 */
export const createUserProfile = async (
  userId: string,
  fullName: string,
  email: string
): Promise<void> => {
  try {
    const userProfile: UserProfile = {
      userId,
      role: 'user',
      fullName,
      email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    await setDoc(doc(db, 'users', userId), userProfile);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Create vendor profile in Firestore
 */
export const createVendorProfile = async (
  userId: string,
  businessName: string,
  serviceType: string,
  location: string,
  phoneNumber: string,
  email: string
): Promise<void> => {
  try {
    const vendorProfile: VendorProfile = {
      userId,
      role: 'vendor',
      businessName,
      serviceType,
      location,
      phoneNumber,
      email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      rating: 0,
      reviewCount: 0,
      isVerified: false,
    };
    
    await setDoc(doc(db, 'vendors', userId), vendorProfile);
  } catch (error) {
    console.error('Error creating vendor profile:', error);
    throw error;
  }
};

/**
 * Get user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Get vendor profile from Firestore
 */
export const getVendorProfile = async (userId: string): Promise<VendorProfile | null> => {
  try {
    const docRef = doc(db, 'vendors', userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as VendorProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting vendor profile:', error);
    throw error;
  }
};

/**
 * Get user role from Firestore (checks both users and vendors collections)
 */
export const getUserRoleFromFirestore = async (userId: string): Promise<'user' | 'vendor' | null> => {
  try {
    // Check users collection first
    const userProfile = await getUserProfile(userId);
    if (userProfile) {
      return 'user';
    }
    
    // Check vendors collection
    const vendorProfile = await getVendorProfile(userId);
    if (vendorProfile) {
      return 'vendor';
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user role from Firestore:', error);
    return null;
  }
};

// Vendor Service type
export interface VendorService {
  id: string;
  vendorId: string;
  name: string;
  description: string;
  category: string;
  price: string;
  duration: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

/**
 * Save vendor services to Firestore
 */
export const saveVendorServices = async (vendorId: string, services: VendorService[]): Promise<void> => {
  try {
    const servicesRef = doc(db, 'vendorServices', vendorId);
    await setDoc(servicesRef, { 
      vendorId,
      services,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error saving vendor services:', error);
    throw error;
  }
};

/**
 * Get vendor services from Firestore
 */
export const getVendorServices = async (vendorId: string): Promise<VendorService[]> => {
  try {
    const servicesRef = doc(db, 'vendorServices', vendorId);
    const docSnap = await getDoc(servicesRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return data.services || [];
    }
    return [];
  } catch (error) {
    console.error('Error getting vendor services:', error);
    return [];
  }
};
