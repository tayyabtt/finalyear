// app/_layout.tsx
import { useRouter, useSegments } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DrawerContent from '../components/DrawerContent';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { PaymentProvider } from '../contexts/PaymentContext';
import { StripeProvider } from '../providers/StripeProvider';

function RootLayoutNav() {
  const { user, role, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    const inVendorGroup = segments[0] === '(vendor)';
    const inHome = segments[0] === 'home';
    const inVendors = segments[0] === 'Vendors';
    const inVendorList = segments[0] === 'vendor-list';
    const inVendorDetail = segments[0] === 'vendor-detail';
    const inChat = segments[0] === 'chat';
    
    const authScreens = ['login', 'signup', 'account-type-selection', 'vendor-signup', 'index'];
    const currentScreen = segments[1] as string | undefined;

    if (!user) {
      // User not authenticated, redirect to login/welcome
      if (!inAuthGroup) {
        router.replace('/');
      }
    } else {
      // User authenticated
      if (role === 'vendor') {
        // Vendor logged in
        if (inAuthGroup && currentScreen && authScreens.includes(currentScreen)) {
          // Redirect from auth screens to vendor dashboard
          router.replace('/(vendor)/dashboard');
        } else if (inAuthGroup || inHome || inVendors || inVendorList || inVendorDetail) {
          // Prevent vendor from accessing user screens
          router.replace('/(vendor)/dashboard');
        }
        // Allow: (vendor), chat
      } else {
        // User logged in
        if (inAuthGroup && currentScreen && authScreens.includes(currentScreen)) {
          // Redirect from auth screens to home
          router.replace('/home');
        } else if (inVendorGroup) {
          // Prevent user from accessing vendor screens
          router.replace('/home');
        }
        // Allow: (tabs), home, Vendors, vendor-list, vendor-detail, chat
      }
    }
  }, [user, role, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <ActivityIndicator size="large" color="#e22f2f" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="(tabs)/index"
        drawerContent={() => <DrawerContent />}
        screenOptions={{
          drawerStyle: {
            width: 280,
          },
        }}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Auth',
            title: 'ShaadiSet',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Home',
            title: 'ShaadiSet Home',
          }}
        />
        <Drawer.Screen
          name="Vendors"
          options={{
            drawerLabel: 'Vendors',
            title: 'Vendors',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="(vendor)"
          options={{
            drawerLabel: 'Vendor Dashboard',
            title: 'Vendor',
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="chat"
          options={{
            drawerLabel: 'Chat',
            title: 'Chat',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="vendor-detail"
          options={{
            drawerLabel: 'Vendor Detail',
            title: 'Vendor Detail',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
        <Drawer.Screen
          name="vendor-list"
          options={{
            drawerLabel: 'Vendor List',
            title: 'Vendor List',
            headerShown: false,
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <StripeProvider>
        <PaymentProvider>
          <RootLayoutNav />
        </PaymentProvider>
      </StripeProvider>
    </AuthProvider>
  );
}
