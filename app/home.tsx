import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const cities = [
    'All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi',
    'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot',
    'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Abbottabad', 'Mirpur'
  ];

  const trendingItems = [
    { id: '1', title: 'Bridal Necklace', image: require('../assets/images/necklace.jpg') },
    { id: '2', title: 'Bridal Makeup Look', image: require('../assets/images/bridal.jpg') },
    { id: '3', title: 'Bride Trending Looks', image: require('../assets/images/bride1.jpg') },
    { id: '4', title: 'Jewelry', image: require('../assets/images/jewelry.jpg') },
  ];

  const planningTools = [
    { id: '1', title: '💌 Digital E-Invites' },
    { id: '2', title: '📋 Shortlisted Vendors' },
    { id: '3', title: '💡 Favourite Ideas' },
  ];

  const exploreStories = [
    { id: '1', title: 'Venues', image: require('../assets/images/venues.jpg') },
    { id: '2', title: 'Decorators', image: require('../assets/images/decorators.jpg') },
    { id: '3', title: 'Makeup', image: require('../assets/images/makeup.jpg') },
    { id: '4', title: 'Planners', image: require('../assets/images/planners.jpg') },
    { id: '5', title: 'Catering', image: require('../assets/images/catering.jpg') },
  ];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#e22f2f" />
          </TouchableOpacity>
          <View style={styles.headerIcons}>
            <Ionicons name="search" size={22} color="#333" style={styles.icon} />
            <Ionicons name="chatbubble-outline" size={22} color="#333" style={styles.icon} />
            <Ionicons name="person-circle-outline" size={22} color="#333" />
          </View>
        </View>

        {/* City Picker Dropdown */}
        <View style={styles.cityPickerWrapper}>
          <Picker
            selectedValue={selectedCity}
            onValueChange={setSelectedCity}
            style={styles.cityPicker}
            dropdownIconColor="#e22f2f"
          >
            {cities.map((city, index) => (
              <Picker.Item key={index} label={city} value={city} />
            ))}
          </Picker>
        </View>

        {/* Hero Section */}
        <Text style={styles.heroAbove}>Explore More</Text>
        <View style={styles.heroBanner}>
          <Image source={require('../assets/images/explore.jpg')} style={styles.heroImage} />
        </View>

        {/* Planning Tools */}
        <Text style={styles.sectionTitle}>Wedding Planning Tools</Text>
        <View style={styles.cardGrid}>
          {planningTools.map((tool) => (
            <View key={tool.id} style={styles.toolCardBox}>
              <Text style={styles.toolCardText}>{tool.title}</Text>
            </View>
          ))}
        </View>

        {/* Filters */}
        <Text style={styles.sectionTitle}>Browse Vendors by Location</Text>
        <TextInput
          style={styles.input}
          placeholder="Where are you getting married?"
        />
        <TextInput
          style={styles.input}
          placeholder="Vendor Category"
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchText}>Search</Text>
        </TouchableOpacity>

        {/* Explore Services */}
        <Text style={styles.sectionTitle}>Explore Services</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.storiesRow}
        >
          {exploreStories.map((story) => (
            <View key={story.id} style={styles.storyBubble}>
              <Image source={story.image} style={styles.storyImage} />
              <Text style={styles.storyText}>{story.title}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Wedding Checklist */}
        <Text style={styles.sectionTitle}>Wedding Checklist</Text>
        <View style={styles.checklistCard}>
          <View style={styles.checklistProgress}>
            <Text style={styles.checklistPercent}>0%</Text>
          </View>
          <View>
            <Text style={styles.checklistLabel}>0/61 tasks done</Text>
            <Text style={styles.checklistSub}>Upcoming tasks</Text>
            <Text style={styles.checklistItem}>○ Research Venue options</Text>
            <Text style={styles.checklistItem}>○ Research Wedding Planners</Text>
          </View>
        </View>

        {/* Trending Today */}
        <Text style={styles.sectionTitle}>Trending Today</Text>
        <FlatList
          horizontal
          data={trendingItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.trendCard}>
              <Image source={item.image} style={styles.trendImage} />
              <Text style={styles.trendTitle}>{item.title}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Bottom Tabs */}
      <View style={styles.bottomTabs}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('../(tabs)/index')}
        >
          <Ionicons name="home" size={25} color="#e22f2f" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/Vendors')}
        >
          <Ionicons name="briefcase-outline" size={22} color="#777" />
          <Text style={styles.tabLabel}>Vendors</Text>
        </TouchableOpacity>
        <TouchableOpacity
  style={styles.tabItem}
  onPress={() => router.push('/einvite')}
>
  <Ionicons name="mail-outline" size={22} color="#777" />
  <Text style={styles.tabLabel}>E-Invite</Text>
</TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="chatbubbles-outline" size={22} color="#777" />
          <Text style={styles.tabLabel}>Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="bulb-outline" size={22} color="#777" />
          <Text style={styles.tabLabel}>Ideas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', padding: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  icon: { marginHorizontal: 6 },
  cityPickerWrapper: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cityPicker: { width: '100%', height: 50, color: '#e22f2f', paddingLeft: 10 },
  heroAbove: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00BFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroBanner: {
    height: 180,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
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
  checklistCard: { backgroundColor: '#f9f0f3', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  checklistProgress: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  checklistPercent: { color: '#e22f2f', fontWeight: 'bold' },
  checklistLabel: { fontWeight: '600' },
  checklistSub: { fontSize: 13, color: '#777', marginBottom: 4 },
  checklistItem: { fontSize: 13, color: '#555' },
  trendCard: { width: 120, marginRight: 16, alignItems: 'center' },
  trendImage: { width: 120, height: 80, borderRadius: 12, marginBottom: 6 },
  trendTitle: { fontWeight: '600', fontSize: 14, textAlign: 'center' },
  bottomTabs: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  tabItem: { alignItems: 'center' },
  tabLabel: { fontSize: 12, color: '#777', marginTop: 4 },
});
