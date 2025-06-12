import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';

// ⬇️ existing tab screens
import EInviteScreen from './(tabs)/einvite';
import EventScreen from './(tabs)/event';
import InboxScreen from './(tabs)/inbox';
import VendorsScreen from './Vendors';

/* ─────────── tab routes ─────────── */
const routes = [
  { key: 'home',    title: 'Home',    icon: 'home' },
  { key: 'vendors', title: 'Vendors', icon: 'briefcase-outline' },
  { key: 'einvite', title: 'E-Invite',icon: 'mail-outline' },
  { key: 'inbox',   title: 'Inbox',   icon: 'chatbubbles-outline' },
  { key: 'event',   title: 'Event',   icon: 'bulb-outline' },
] as const;

/* ─────────── main component ─────────── */
export default function HomeScreen() {
  const [index, setIndex] = useState(0);
  const [selectedCity, setSelectedCity] = useState('All Cities');

  /* static data for Home tab only */
  const cities = [
    'All Cities','Karachi','Lahore','Islamabad','Rawalpindi','Faisalabad','Multan',
    'Peshawar','Quetta','Sialkot','Gujranwala','Hyderabad','Bahawalpur','Sargodha',
    'Abbottabad','Mirpur',
  ];
  const trendingItems = [
    { id: '1', title: 'Bridal Necklace', image: require('../assets/images/necklace.jpg') },
    { id: '2', title: 'Bridal Makeup Look', image: require('../assets/images/bridal.jpg') },
    { id: '3', title: 'Bride Trending Looks', image: require('../assets/images/bride1.jpg') },
    { id: '4', title: 'Jewelry',           image: require('../assets/images/jewelry.jpg') },
  ];
  const planningTools = [
    { id: '1', title: '💌 Digital E-Invites' },
    { id: '2', title: '📋 Shortlisted Vendors' },
    { id: '3', title: '💡 Favourite Ideas' },
  ];
  const exploreStories = [
    { id: '1', title: 'Venues',     image: require('../assets/images/venues.jpg') },
    { id: '2', title: 'Decorators', image: require('../assets/images/decorators.jpg') },
    { id: '3', title: 'Makeup',     image: require('../assets/images/makeup.jpg') },
    { id: '4', title: 'Planners',   image: require('../assets/images/planners.jpg') },
    { id: '5', title: 'Catering',   image: require('../assets/images/catering.jpg') },
  ];

  /* Home tab JSX */
  const HomeRoute = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* City Picker */}
      <View style={styles.cityPickerWrapper}>
        <Picker
          selectedValue={selectedCity}
          onValueChange={setSelectedCity}
          style={styles.cityPicker}
          dropdownIconColor="#e22f2f"
        >
          {cities.map(city => <Picker.Item key={city} label={city} value={city} />)}
        </Picker>
      </View>

      {/* Hero */}
      <Text style={styles.heroAbove}>Explore More</Text>
      <View style={styles.heroBanner}>
        <Image source={require('../assets/images/explore.jpg')} style={styles.heroImage} />
      </View>

      {/* Planning Tools */}
      <Text style={styles.sectionTitle}>Wedding Planning Tools</Text>
      <View style={styles.cardGrid}>
        {planningTools.map(tool => (
          <View key={tool.id} style={styles.toolCardBox}>
            <Text style={styles.toolCardText}>{tool.title}</Text>
          </View>
        ))}
      </View>

      {/* Filters */}
      <Text style={styles.sectionTitle}>Browse Vendors by Location</Text>
      <TextInput style={styles.input} placeholder="Where are you getting married?" />
      <TextInput style={styles.input} placeholder="Vendor Category" />
      <TouchableOpacity style={styles.searchBtn}>
        <Text style={styles.searchText}>Search</Text>
      </TouchableOpacity>

      {/* Explore Services */}
      <Text style={styles.sectionTitle}>Explore Services</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesRow}>
        {exploreStories.map(story => (
          <View key={story.id} style={styles.storyBubble}>
            <Image source={story.image} style={styles.storyImage} />
            <Text style={styles.storyText}>{story.title}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Trending (horizontal ScrollView) */}
      <Text style={styles.sectionTitle}>Trending Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingItems.map(item => (
          <View key={item.id} style={styles.trendCard}>
            <Image source={item.image} style={styles.trendImage} />
            <Text style={styles.trendTitle}>{item.title}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  /* Tab scenes */
  const renderScene = SceneMap({
    home:    HomeRoute,           // uses vertical ScrollView (no nested FlatLists)
    vendors: () => <VendorsScreen />,  // each screen handles its own FlatList safely
    einvite: () => <EInviteScreen />,
    inbox:   () => <InboxScreen />,
    event:   () => <EventScreen />,
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>ShaadiSet</Text>
      </View>

      {/* Swipeable TabView */}
      <TabView
        navigationState={{ index, routes: routes as any }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: Dimensions.get('window').width }}
        swipeEnabled
        renderTabBar={() => null}
      />

      {/* Custom bottom bar */}
      <View style={styles.bottomTabs}>
        {routes.map((r, i) => (
          <TouchableOpacity
            key={r.key}
            style={styles.tabItem}
            activeOpacity={0.8}
            onPress={() => setIndex(i)}
          >
            <Ionicons name={r.icon} size={24} color={index === i ? '#e22f2f' : '#777'} />
            <Text style={[styles.tabLabel, { color: index === i ? '#e22f2f' : '#777' }]}>
              {r.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ─────────── styles ─────────── */
const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },

  cityPickerWrapper: { backgroundColor: '#f8f8f8', borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
  cityPicker: { width: '100%', height: 50, color: '#e22f2f', paddingLeft: 10 },

  heroAbove: { fontSize: 22, fontWeight: 'bold', color: '#00BFFF', textAlign: 'center', marginBottom: 8 },
  heroBanner: { height: 180, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 20, overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', position: 'absolute' },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },

  input: { backgroundColor: '#f1f1f1', borderRadius: 12, padding: 14, marginBottom: 12 },
  searchBtn: { backgroundColor: '#e22f2f', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  searchText: { color: '#fff', fontWeight: '600' },

  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  toolCardBox: { backgroundColor: '#ffe4e6', borderRadius: 16, padding: 16, width: '48%', marginBottom: 12 },
  toolCardText: { fontSize: 14, fontWeight: '600' },

  storiesRow: { flexDirection: 'row', marginBottom: 12 },
  storyBubble: { alignItems: 'center', marginRight: 16 },
  storyImage: { width: 64, height: 64, borderRadius: 32, marginBottom: 6 },
  storyText: { fontSize: 12, fontWeight: '600' },

  trendCard: { width: 120, marginRight: 16, alignItems: 'center' },
  trendImage: { width: 120, height: 80, borderRadius: 12, marginBottom: 6 },
  trendTitle: { fontWeight: '600', fontSize: 14, textAlign: 'center' },

  bottomTabs: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, marginTop: 4 },

  topBar: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee', alignItems: 'center', backgroundColor: '#fff' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#e22f2f' },
});
