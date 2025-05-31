// app/_layout.tsx
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Your screens

// Your custom sidebar
import DrawerContent from '../components/DrawerContent';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        initialRouteName="(tabs)/index"
        drawerContent={() => <DrawerContent />}
      >
        <Drawer.Screen
          name="(tabs)/index"
          options={{
            drawerLabel: 'Welcome',
            title: 'Welcome to ShaadiSet',
          }}
        />
        <Drawer.Screen
          name="home"
          options={{
            drawerLabel: 'Home',
            title: 'ShaadiSet Home',
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}
