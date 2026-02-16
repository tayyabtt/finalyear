// utils/storage.ts
// AsyncStorage helper functions for ShaadiSet

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_ROLE: '@shaadiset:userRole',
  USER_ID: '@shaadiset:userId',
  VENDOR_DATA: '@shaadiset:vendorData',
} as const;

/**
 * Save user role to AsyncStorage
 */
export const saveUserRole = async (role: 'user' | 'vendor'): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  } catch (error) {
    console.error('Error saving user role:', error);
    throw error;
  }
};

/**
 * Get user role from AsyncStorage
 */
export const getUserRole = async (): Promise<'user' | 'vendor' | null> => {
  try {
    const role = await AsyncStorage.getItem(STORAGE_KEYS.USER_ROLE);
    return role as 'user' | 'vendor' | null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
};

/**
 * Save user ID to AsyncStorage
 */
export const saveUserId = async (userId: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  } catch (error) {
    console.error('Error saving user ID:', error);
    throw error;
  }
};

/**
 * Get user ID from AsyncStorage
 */
export const getUserId = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

/**
 * Save vendor data to AsyncStorage (for caching)
 */
export const saveVendorData = async (vendorData: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.VENDOR_DATA, JSON.stringify(vendorData));
  } catch (error) {
    console.error('Error saving vendor data:', error);
    throw error;
  }
};

/**
 * Get vendor data from AsyncStorage
 */
export const getVendorData = async (): Promise<any | null> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.VENDOR_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting vendor data:', error);
    return null;
  }
};

/**
 * Clear all auth-related data from AsyncStorage
 */
export const clearAuthData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_ROLE,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.VENDOR_DATA,
    ]);
  } catch (error) {
    console.error('Error clearing auth data:', error);
    throw error;
  }
};
