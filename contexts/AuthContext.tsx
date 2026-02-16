// contexts/AuthContext.tsx
// Global authentication state management for ShaadiSet

import { User, onAuthStateChanged } from 'firebase/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { logout as firebaseLogout, login, signup } from '../src/AuthService';
import { auth } from '../src/firebaseConfig';
import {
    createUserProfile,
    createVendorProfile,
    getUserRoleFromFirestore,
    getVendorProfile,
} from '../utils/firestore';
import {
    getUserRoleLocal,
    saveUserProfile as saveUserProfileLocal,
    saveVendorProfile as saveVendorProfileLocal,
} from '../utils/localStorage';
import {
    clearAuthData,
    getUserRole,
    saveUserId,
    saveUserRole,
    saveVendorData,
} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  role: 'user' | 'vendor' | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    role: 'user' | 'vendor',
    additionalData?: any
  ) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'vendor' | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in - keep loading true until role is determined
        setUser(firebaseUser);
        
        try {
          // First check AsyncStorage
          let userRole = await getUserRole();
          
          // If not in AsyncStorage, fetch from local storage
          if (!userRole) {
            userRole = await getUserRoleLocal(firebaseUser.uid);
            if (userRole) {
              await saveUserRole(userRole);
              await saveUserId(firebaseUser.uid);
            }
          }
          
          // If vendor, cache vendor data
          if (userRole === 'vendor') {
            const vendorData = await getVendorProfile(firebaseUser.uid);
            if (vendorData) {
              await saveVendorData(vendorData);
            }
          }
          
          // Set role BEFORE setting loading to false
          setRole(userRole);
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
        
        // Only set loading false after role is determined
        setLoading(false);
      } else {
        // User is signed out
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * Sign up a new user
   */
  const signUp = async (
    email: string,
    password: string,
    userRole: 'user' | 'vendor',
    additionalData?: any
  ): Promise<void> => {
    try {
      // Create Firebase user
      const userCredential = await signup(email, password);
      const userId = userCredential.user.uid;

      // Create profile in Firestore AND local storage
      if (userRole === 'user') {
        // Save to Firestore
        await createUserProfile(userId, additionalData.fullName, email);
        
        // Also save to local storage for offline access
        await saveUserProfileLocal({
          userId,
          role: 'user',
          fullName: additionalData.fullName,
          email,
          createdAt: new Date().toISOString(),
        });
      } else if (userRole === 'vendor') {
        // Save to Firestore
        await createVendorProfile(
          userId,
          additionalData.businessName,
          additionalData.serviceType,
          additionalData.location,
          additionalData.phoneNumber,
          email
        );
        
        // Also save to local storage for offline access
        const vendorProfile = {
          userId,
          role: 'vendor' as const,
          businessName: additionalData.businessName,
          serviceType: additionalData.serviceType,
          location: additionalData.location,
          phoneNumber: additionalData.phoneNumber,
          email,
          createdAt: new Date().toISOString(),
          rating: 0,
          reviewCount: 0,
        };
        
        await saveVendorProfileLocal(vendorProfile);
        await saveVendorData(vendorProfile);
      }

      // Save role and userId to AsyncStorage
      await saveUserRole(userRole);
      await saveUserId(userId);
      
      setRole(userRole);
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  /**
   * Sign in an existing user
   */
  const signIn = async (email: string, password: string): Promise<void> => {
    try {
      // Sign in with Firebase
      const userCredential = await login(email, password);
      const userId = userCredential.user.uid;

      // Try to fetch role from Firestore first
      let userRole = await getUserRoleFromFirestore(userId);
      
      // If not in Firestore, check local storage
      if (!userRole) {
        userRole = await getUserRoleLocal(userId);
      }
      
      // If still not found, default to 'user'
      if (!userRole) {
        console.log('Role not found, defaulting to user');
        userRole = 'user';
        
        // Create profile in both Firestore and local storage
        await createUserProfile(userId, email.split('@')[0], email);
        await saveUserProfileLocal({
          userId,
          role: 'user',
          fullName: email.split('@')[0],
          email,
          createdAt: new Date().toISOString(),
        });
      }

      // Save to AsyncStorage
      await saveUserRole(userRole);
      await saveUserId(userId);
      
      // If vendor, cache vendor data
      if (userRole === 'vendor') {
        const vendorData = await getVendorProfile(userId);
        if (vendorData) {
          await saveVendorData(vendorData);
        }
      }
      
      setRole(userRole);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  /**
   * Sign out the current user
   */
  const signOut = async (): Promise<void> => {
    try {
      await firebaseLogout();
      await clearAuthData();
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    role,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
