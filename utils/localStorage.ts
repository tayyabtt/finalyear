// utils/localStorage.ts
// Local storage implementation (no Firestore needed)

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  USERS: '@shaadiset:users',
  VENDORS: '@shaadiset:vendors',
  CURRENT_USER: '@shaadiset:currentUser',
};

export interface UserProfile {
  userId: string;
  role: 'user';
  fullName: string;
  email: string;
  createdAt: string;
}

export interface VendorProfile {
  userId: string;
  role: 'vendor';
  businessName: string;
  serviceType: string;
  location: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
  rating?: number;
  reviewCount?: number;
}

// Get all users
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
};

// Get all vendors
export const getAllVendors = async (): Promise<VendorProfile[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VENDORS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting vendors:', error);
    return [];
  }
};

// Save user profile
export const saveUserProfile = async (profile: UserProfile): Promise<void> => {
  try {
    const users = await getAllUsers();
    const existingIndex = users.findIndex(u => u.userId === profile.userId);
    
    if (existingIndex >= 0) {
      users[existingIndex] = profile;
    } else {
      users.push(profile);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving user profile:', error);
    throw error;
  }
};

// Save vendor profile
export const saveVendorProfile = async (profile: VendorProfile): Promise<void> => {
  try {
    const vendors = await getAllVendors();
    const existingIndex = vendors.findIndex(v => v.userId === profile.userId);
    
    if (existingIndex >= 0) {
      vendors[existingIndex] = profile;
    } else {
      vendors.push(profile);
    }
    
    await AsyncStorage.setItem(STORAGE_KEYS.VENDORS, JSON.stringify(vendors));
  } catch (error) {
    console.error('Error saving vendor profile:', error);
    throw error;
  }
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const users = await getAllUsers();
    return users.find(u => u.userId === userId) || null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Get vendor profile by ID
export const getVendorProfile = async (userId: string): Promise<VendorProfile | null> => {
  try {
    const vendors = await getAllVendors();
    return vendors.find(v => v.userId === userId) || null;
  } catch (error) {
    console.error('Error getting vendor profile:', error);
    return null;
  }
};

// Get user role
export const getUserRoleLocal = async (userId: string): Promise<'user' | 'vendor' | null> => {
  try {
    const userProfile = await getUserProfile(userId);
    if (userProfile) return 'user';
    
    const vendorProfile = await getVendorProfile(userId);
    if (vendorProfile) return 'vendor';
    
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

// Get vendors by service type
export const getVendorsByServiceType = async (serviceType: string): Promise<VendorProfile[]> => {
  try {
    const vendors = await getAllVendors();
    return vendors.filter(v => v.serviceType === serviceType);
  } catch (error) {
    console.error('Error getting vendors by service type:', error);
    return [];
  }
};

// Clear all local data (for testing)
export const clearAllLocalData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USERS,
      STORAGE_KEYS.VENDORS,
      STORAGE_KEYS.CURRENT_USER,
    ]);
  } catch (error) {
    console.error('Error clearing local data:', error);
  }
};
