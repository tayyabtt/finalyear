import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';

// Components
import ReviewPopup from '../components/ReviewPopup';
import YouTubePlayer from '../components/YouTubePlayer';

// Contexts & Hooks
import { useAuth } from '../contexts/AuthContext';
import { usePendingReviews } from '../hooks/usePendingReviews';

// Tab screens
import EInviteScreen from './(tabs)/einvite';
import EventScreen from './(tabs)/event';
import InboxScreen from './(tabs)/inbox';
import VendorsScreen from './Vendors';

/* ─────────── tab routes ─────────── */
const routes = [
  { key: 'home', title: 'Home', icon: 'home' },
  { key: 'vendors', title: 'Vendors', icon: 'briefcase-outline' },
  { key: 'einvite', title: 'E-Invite', icon: 'mail-outline' },
  { key: 'inbox', title: 'Inbox', icon: 'chatbubbles-outline' },
  { key: 'event', title: 'Event', icon: 'bulb-outline' },
] as const;

/* ─────────── main component ─────────── */
export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { pendingReview, clearPendingReview } = usePendingReviews(user?.uid);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [index, setIndex] = useState(0);
  const [trendingModalOpen, setTrendingModalOpen] = useState(false);
  const [selectedTrending, setSelectedTrending] = useState<any>(null);
  const [trendingImages, setTrendingImages] = useState<any[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [favoriteImages, setFavoriteImages] = useState<any[]>([]);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [weddingVideos, setWeddingVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [realWeddingsModalOpen, setRealWeddingsModalOpen] = useState(false);
  const [destinationModalOpen, setDestinationModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('Lahore');
  const [venueFilter, setVenueFilter] = useState('indoor');

  // Load favorites and videos on mount
  useEffect(() => {
    loadFavorites();
    loadWeddingVideos();
  }, []);

  // Show review popup when there's a pending review
  useEffect(() => {
    if (pendingReview) {
      // Delay popup by 2 seconds after app loads
      const timer = setTimeout(() => setShowReviewPopup(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [pendingReview]);

  const loadWeddingVideos = async () => {
    try {
      const { fetchWeddingVideos } = await import('../utils/trendingApi');
      const videos = await fetchWeddingVideos(1);
      console.log('Loaded videos:', videos.length, videos[0]);
      if (videos.length > 0) {
        setWeddingVideos(videos);
      } else {
        console.warn('No videos returned from API');
      }
    } catch (error) {
      console.error('Error loading wedding videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const loadMoreVideos = async () => {
    try {
      const { fetchWeddingVideos } = await import('../utils/trendingApi');
      const page = Math.floor(weddingVideos.length / 80) + 1;
      const newVideos = await fetchWeddingVideos(page);
      setWeddingVideos(prev => [...prev, ...newVideos]);
    } catch (error) {
      console.error('Error loading more videos:', error);
    }
  };

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem('@favorite_ideas');
      if (stored) {
        setFavoriteImages(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (image: any) => {
    try {
      const imageUrl = typeof image === 'number' ? image : image.src?.medium;
      const isFavorite = favoriteImages.some(fav =>
        (typeof fav === 'number' ? fav : fav.src?.medium) === imageUrl
      );

      let newFavorites;
      if (isFavorite) {
        newFavorites = favoriteImages.filter(fav =>
          (typeof fav === 'number' ? fav : fav.src?.medium) !== imageUrl
        );
      } else {
        newFavorites = [...favoriteImages, image];
      }

      setFavoriteImages(newFavorites);
      await AsyncStorage.setItem('@favorite_ideas', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const isFavorite = (image: any) => {
    const imageUrl = typeof image === 'number' ? image : image.src?.medium;
    return favoriteImages.some(fav =>
      (typeof fav === 'number' ? fav : fav.src?.medium) === imageUrl
    );
  };

  /* static data for Home tab only */
  const cities = [
    'All Cities', 'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
    'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha',
    'Abbottabad', 'Mirpur',
  ];
  const trendingItems = [
    { id: '1', title: 'Bridal Necklace', image: require('../assets/images/necklace.jpg') },
    { id: '2', title: 'Bridal Makeup Look', image: require('../assets/images/bridal.jpg') },
    { id: '3', title: 'Bride Trending Looks', image: require('../assets/images/bride1.jpg') },
    { id: '4', title: 'Jewelry', image: require('../assets/images/jewelry.jpg') },
  ];
  const planningTools = [
    { id: '1', title: '💌 Digital E-Invites', route: '/(tabs)/einvite' },
    { id: '2', title: '📋 Shortlisted Vendors', route: null },
    { id: '3', title: '📅 Wedding Planner', route: '/(tabs)/planning' },
    { id: '4', title: '💡 Favourite Ideas', route: null },
  ];

  /* Home tab JSX */
  const HomeRoute = () => (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero - Wedding Videos */}
      <Text style={styles.heroAbove}>Explore Wedding Ideas 💍</Text>
      <TouchableOpacity
        style={styles.heroBanner}
        onPress={() => {
          if (weddingVideos.length > 0) {
            setVideoPlayerOpen(true);
            setCurrentVideoIndex(0);
          }
        }}
      >
        {loadingVideos ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
            <Text style={{ color: '#666' }}>Loading wedding videos...</Text>
          </View>
        ) : weddingVideos.length > 0 ? (
          <>
            <Image
              source={{ uri: weddingVideos[0].thumbnail }}
              style={styles.heroImage}
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <Ionicons name="play-circle" size={80} color="#fff" />
              <Text style={{ color: '#fff', marginTop: 15, fontSize: 18, fontWeight: '700', textAlign: 'center', paddingHorizontal: 20 }}>
                Watch Wedding Shorts
              </Text>
              <Text style={{ color: '#fff', marginTop: 5, fontSize: 14, textAlign: 'center' }}>
                {weddingVideos.length} Pakistani & South Asian wedding videos
              </Text>
            </View>
          </>
        ) : (
          <>
            <Image source={require('../assets/images/explore.jpg')} style={styles.heroImage} />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
              <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center', paddingHorizontal: 20 }}>
                Loading wedding inspiration...
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>

      {/* Planning Tools */}
      <Text style={styles.sectionTitle}>Wedding Planning Tools</Text>
      <View style={styles.cardGrid}>
        {planningTools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCardBox}
            onPress={() => {
              if (tool.title === '💡 Favourite Ideas') {
                setFavoritesModalOpen(true);
              } else if (tool.route) {
                router.push(tool.route as any);
              }
            }}
          >
            <Text style={styles.toolCardText}>{tool.title}</Text>
            {tool.title === '💡 Favourite Ideas' && favoriteImages.length > 0 && (
              <View style={{ position: 'absolute', top: 5, right: 5, backgroundColor: '#e22f2f', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>{favoriteImages.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Inspiration Galleries */}
      <Text style={styles.sectionTitle}>Get Inspired ✨</Text>
      <View style={styles.inspirationRow}>
        <TouchableOpacity 
          style={styles.inspirationCard}
          onPress={() => setRealWeddingsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Image source={require('../assets/images/bridal.jpg')} style={styles.inspirationImage} />
          <View style={styles.inspirationOverlay}>
            <Ionicons name="heart" size={28} color="#fff" />
            <Text style={styles.inspirationTitle}>Real Weddings</Text>
            <Text style={styles.inspirationSubtitle}>Browse stunning galleries</Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.inspirationCard}
          onPress={() => setDestinationModalOpen(true)}
          activeOpacity={0.8}
        >
          <Image source={require('../assets/images/venues.jpg')} style={styles.inspirationImage} />
          <View style={styles.inspirationOverlay}>
            <Ionicons name="business" size={28} color="#fff" />
            <Text style={styles.inspirationTitle}>Venue Explorer</Text>
            <Text style={styles.inspirationSubtitle}>Find your dream venue</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Trending (horizontal ScrollView) */}
      <Text style={styles.sectionTitle}>Trending Today</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {trendingItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.trendCard}
            onPress={async () => {
              setSelectedTrending(item);
              setTrendingModalOpen(true);
              setLoadingImages(true);
              setTrendingImages([]);

              try {
                // Fetch real trending images from Pexels API
                const { fetchTrendingImages, getFallbackImages } = await import('../utils/trendingApi');
                const apiImages = await fetchTrendingImages(item.title);

                if (apiImages.length > 0) {
                  setTrendingImages(apiImages);
                } else {
                  // Use fallback if API fails
                  const fallbackImages = getFallbackImages(item.title);
                  setTrendingImages(fallbackImages);
                }
              } catch (error) {
                console.error('Error loading images:', error);
                // Use fallback on error
                const { getFallbackImages } = await import('../utils/trendingApi');
                const fallbackImages = getFallbackImages(item.title);
                setTrendingImages(fallbackImages);
              }

              setLoadingImages(false);
            }}
          >
            <Image source={item.image} style={styles.trendImage} />
            <Text style={styles.trendTitle}>{item.title}</Text>
            <View style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 12, padding: 4 }}>
              <Ionicons name="trending-up" size={16} color="#ffeb3b" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={{ height: 80 }} />
    </ScrollView>
  );

  /* Tab scenes */
  const renderScene = SceneMap({
    home: HomeRoute,           // uses vertical ScrollView (no nested FlatLists)
    vendors: () => <VendorsScreen />,  // each screen handles its own FlatList safely
    einvite: () => <EInviteScreen />,
    inbox: () => <InboxScreen />,
    event: () => <EventScreen />,
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

      {/* Trending Modal */}
      <Modal visible={trendingModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }}>
            <View style={{ backgroundColor: '#e22f2f', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                {selectedTrending?.title}
              </Text>
              <TouchableOpacity onPress={() => setTrendingModalOpen(false)}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {selectedTrending && (
                <>
                  <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15, color: '#333', textAlign: 'center' }}>
                    Trending {selectedTrending.title} 🔥
                  </Text>

                  {loadingImages ? (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                      <Text style={{ color: '#666' }}>Loading trending images...</Text>
                    </View>
                  ) : (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      {trendingImages.map((img, idx) => (
                        <View key={idx} style={{ width: '48%', marginBottom: 15, position: 'relative' }}>
                          <Image
                            source={typeof img === 'number' ? img : { uri: img.src?.medium || img.src?.original }}
                            style={{ width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' }}
                          />
                          <TouchableOpacity
                            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 }}
                            onPress={() => toggleFavorite(img)}
                          >
                            <Ionicons
                              name={isFavorite(img) ? "heart" : "heart-outline"}
                              size={20}
                              color={isFavorite(img) ? "#ff4757" : "#fff"}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={{ backgroundColor: '#f5f5f5', padding: 15, borderRadius: 12, marginTop: 10, marginBottom: 15 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 8, color: '#333' }}>
                      💡 Get Inspired:
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', lineHeight: 20 }}>
                      • Save your favorite looks{'\n'}
                      • Share with your stylist{'\n'}
                      • Browse similar vendors{'\n'}
                      • Get price estimates
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={{ backgroundColor: '#e22f2f', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 }}
                    onPress={() => {
                      setTrendingModalOpen(false);
                      setIndex(1); // Navigate to Vendors tab
                    }}
                  >
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                      Browse Vendors
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* TikTok-Style Video Player */}
      <Modal visible={videoPlayerOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <ScrollView
            pagingEnabled
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.y / Dimensions.get('window').height);
              setCurrentVideoIndex(index);

              // Auto-load more videos when near the end
              if (index >= weddingVideos.length - 3) {
                loadMoreVideos();
              }
            }}
          >
            {weddingVideos.map((video, idx) => {
              if (!video || !video.videoId) return null;
              
              const isCurrentVideo = idx === currentVideoIndex;
              
              return (
                <View key={video.videoId || idx} style={{ 
                  height: Dimensions.get('window').height, 
                  width: Dimensions.get('window').width, 
                  backgroundColor: '#000',
                  position: 'relative'
                }}>
                  {isCurrentVideo ? (
                    <View style={{ flex: 1, width: '100%', height: '100%' }}>
                      <YouTubePlayer videoId={video.videoId} autoplay={true} />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: video.thumbnail }}
                      style={{ width: '100%', height: '100%' }}
                      resizeMode="cover"
                    />
                  )}
                  
                  <View style={{ position: 'absolute', bottom: 100, left: 20, right: 80, backgroundColor: 'rgba(0,0,0,0.6)', padding: 10, borderRadius: 8 }}>
                    <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={2}>
                      {video.title || 'Wedding Video'}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 13, marginTop: 5 }}>
                      {video.channelTitle || 'Wedding Channel'}
                    </Text>
                    <Text style={{ color: '#fff', fontSize: 12, marginTop: 3 }}>
                      Swipe up for more • {weddingVideos.length} videos
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 25, padding: 10 }}
            onPress={() => setVideoPlayerOpen(false)}
          >
            <Ionicons name="close" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Favorites Modal */}
      <Modal visible={favoritesModalOpen} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden' }}>
            <View style={{ backgroundColor: '#e22f2f', padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>
                💡 Favourite Ideas ({favoriteImages.length})
              </Text>
              <TouchableOpacity onPress={() => setFavoritesModalOpen(false)}>
                <Ionicons name="close-circle" size={32} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {favoriteImages.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <Ionicons name="heart-outline" size={60} color="#ccc" />
                  <Text style={{ color: '#666', marginTop: 20, textAlign: 'center' }}>
                    No favorites yet!{'\n'}Heart images you love to save them here.
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {favoriteImages.map((img, idx) => (
                    <View key={idx} style={{ width: '48%', marginBottom: 15, position: 'relative' }}>
                      <Image
                        source={typeof img === 'number' ? img : { uri: img.src?.medium || img.src?.original }}
                        style={{ width: '100%', height: 200, borderRadius: 12, resizeMode: 'cover' }}
                      />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(255,71,87,0.9)', borderRadius: 20, padding: 8 }}
                        onPress={() => toggleFavorite(img)}
                      >
                        <Ionicons name="heart" size={20} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Real Weddings Gallery Modal - Beautiful UI */}
      <Modal visible={realWeddingsModalOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
          {/* Gradient Header */}
          <View style={{ backgroundColor: '#e22f2f', paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>💒 Real Weddings</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 6 }}>
                  Explore beautiful moments from {selectedCity}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Ionicons name="images" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginLeft: 6 }}>
                    {galleryImages.length} photos • Endless inspiration
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setRealWeddingsModalOpen(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* City Pills - Floating Style */}
          <View style={{ marginTop: -15, paddingHorizontal: 10 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
              {cities.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, marginHorizontal: 5, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
                    selectedCity === city 
                      ? { backgroundColor: '#e22f2f' } 
                      : { backgroundColor: '#fff' }
                  ]}
                  onPress={async () => {
                    setSelectedCity(city);
                    setGalleryLoading(true);
                    setGalleryImages([]);
                    try {
                      const { fetchRealWeddingImages } = await import('../utils/trendingApi');
                      const images = await fetchRealWeddingImages(city === 'All Cities' ? 'Pakistan' : city);
                      setGalleryImages(images);
                    } catch (error) {
                      console.error('Error loading gallery:', error);
                    }
                    setGalleryLoading(false);
                  }}
                >
                  <Text style={[
                    { fontSize: 14, fontWeight: '600' },
                    selectedCity === city ? { color: '#fff' } : { color: '#333' }
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Gallery Grid - Pinterest Style */}
          <ScrollView 
            style={{ flex: 1, paddingTop: 10 }}
            onScroll={async ({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
              if (isCloseToBottom && !galleryLoading && galleryImages.length > 0) {
                setGalleryLoading(true);
                try {
                  const { fetchRealWeddingImages } = await import('../utils/trendingApi');
                  const page = Math.floor(galleryImages.length / 20) + 1;
                  const moreImages = await fetchRealWeddingImages(selectedCity === 'All Cities' ? 'Pakistan' : selectedCity, page);
                  setGalleryImages(prev => [...prev, ...moreImages]);
                } catch (error) {
                  console.error('Error loading more:', error);
                }
                setGalleryLoading(false);
              }
            }}
            scrollEventThrottle={400}
          >
            {galleryLoading && galleryImages.length === 0 ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffe4e6', borderRadius: 50, padding: 20, marginBottom: 20 }}>
                  <Ionicons name="heart" size={40} color="#e22f2f" />
                </View>
                <Text style={{ color: '#333', fontSize: 18, fontWeight: '600' }}>Loading beautiful weddings...</Text>
                <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Finding the best moments for you</Text>
              </View>
            ) : galleryImages.length === 0 ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 50, padding: 25, marginBottom: 20 }}>
                  <Ionicons name="camera-outline" size={50} color="#ccc" />
                </View>
                <Text style={{ color: '#333', fontSize: 18, fontWeight: '600' }}>Select a City</Text>
                <Text style={{ color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                  Tap on a city above to explore{'\n'}stunning wedding galleries
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
                {galleryImages.map((img, idx) => (
                  <View key={idx} style={{ width: '50%', padding: 4 }}>
                    <View style={{ borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, backgroundColor: '#fff' }}>
                      <Image
                        source={{ uri: img.src?.medium || img.src?.large }}
                        style={{ width: '100%', height: idx % 3 === 0 ? 250 : 180, backgroundColor: '#f0f0f0' }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 8, elevation: 2 }}
                        onPress={() => toggleFavorite(img)}
                      >
                        <Ionicons
                          name={isFavorite(img) ? "heart" : "heart-outline"}
                          size={20}
                          color={isFavorite(img) ? "#e22f2f" : "#666"}
                        />
                      </TouchableOpacity>
                      {img.photographer && (
                        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', paddingVertical: 8, paddingHorizontal: 12 }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '500' }}>📸 {img.photographer}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
                {galleryLoading && (
                  <View style={{ width: '100%', padding: 30, alignItems: 'center' }}>
                    <Text style={{ color: '#e22f2f', fontWeight: '600' }}>Loading more beautiful moments...</Text>
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Wedding Venues Explorer Modal */}
      <Modal visible={destinationModalOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#fafafa' }}>
          {/* Header */}
          <View style={{ backgroundColor: '#e22f2f', paddingTop: 50, paddingBottom: 25, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 28, fontWeight: '800' }}>🏛️ Venue Explorer</Text>
                <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, marginTop: 6 }}>
                  Find your perfect wedding venue in {selectedCity}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                  <Ionicons name="location" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginLeft: 6 }}>
                    {galleryImages.length} venues found
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                onPress={() => setDestinationModalOpen(false)}
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* City Pills */}
          <View style={{ marginTop: -15, paddingHorizontal: 10 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingVertical: 10 }}>
              {cities.filter(c => c !== 'All Cities').map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[
                    { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, marginHorizontal: 5, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
                    selectedCity === city 
                      ? { backgroundColor: '#e22f2f' } 
                      : { backgroundColor: '#fff' }
                  ]}
                  onPress={async () => {
                    setSelectedCity(city);
                    setGalleryLoading(true);
                    setGalleryImages([]);
                    try {
                      const { fetchDestinationImages } = await import('../utils/trendingApi');
                      const images = await fetchDestinationImages(city, venueFilter);
                      setGalleryImages(images);
                    } catch (error) {
                      console.error('Error loading venues:', error);
                    }
                    setGalleryLoading(false);
                  }}
                >
                  <Text style={[
                    { fontSize: 14, fontWeight: '600' },
                    selectedCity === city ? { color: '#fff' } : { color: '#333' }
                  ]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filter Chips - Indoor/Outdoor, Budget, Capacity */}
          <View style={{ backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 15, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { key: 'indoor', label: '🏠 Indoor Halls', icon: 'home' },
                { key: 'outdoor', label: '🌳 Outdoor/Garden', icon: 'leaf' },
                { key: 'luxury', label: '👑 Luxury', icon: 'diamond' },
                { key: 'budget', label: '💰 Budget Friendly', icon: 'wallet' },
                { key: 'large', label: '👥 Large Capacity', icon: 'people' },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, marginRight: 10, borderWidth: 1.5 },
                    venueFilter === filter.key 
                      ? { backgroundColor: '#ffe4e6', borderColor: '#e22f2f' } 
                      : { backgroundColor: '#f8f8f8', borderColor: '#eee' }
                  ]}
                  onPress={async () => {
                    setVenueFilter(filter.key);
                    setGalleryLoading(true);
                    setGalleryImages([]);
                    try {
                      const { fetchDestinationImages } = await import('../utils/trendingApi');
                      const images = await fetchDestinationImages(selectedCity, filter.key);
                      setGalleryImages(images);
                    } catch (error) {
                      console.error('Error loading filtered venues:', error);
                    }
                    setGalleryLoading(false);
                  }}
                >
                  <Text style={[
                    { fontSize: 13, fontWeight: '600' },
                    venueFilter === filter.key ? { color: '#e22f2f' } : { color: '#666' }
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Venue Gallery Grid */}
          <ScrollView 
            style={{ flex: 1, paddingTop: 10 }}
            onScroll={async ({ nativeEvent }) => {
              const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
              const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
              if (isCloseToBottom && !galleryLoading && galleryImages.length > 0) {
                setGalleryLoading(true);
                try {
                  const { fetchDestinationImages } = await import('../utils/trendingApi');
                  const page = Math.floor(galleryImages.length / 20) + 1;
                  const moreImages = await fetchDestinationImages(selectedCity, venueFilter, page);
                  setGalleryImages(prev => [...prev, ...moreImages]);
                } catch (error) {
                  console.error('Error loading more venues:', error);
                }
                setGalleryLoading(false);
              }
            }}
            scrollEventThrottle={400}
          >
            {galleryLoading && galleryImages.length === 0 ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#ffe4e6', borderRadius: 50, padding: 20, marginBottom: 20 }}>
                  <Ionicons name="business" size={40} color="#e22f2f" />
                </View>
                <Text style={{ color: '#333', fontSize: 18, fontWeight: '600' }}>Finding dream venues...</Text>
                <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>Searching the best locations for you</Text>
              </View>
            ) : galleryImages.length === 0 ? (
              <View style={{ padding: 60, alignItems: 'center' }}>
                <View style={{ backgroundColor: '#f5f5f5', borderRadius: 50, padding: 25, marginBottom: 20 }}>
                  <Ionicons name="location-outline" size={50} color="#ccc" />
                </View>
                <Text style={{ color: '#333', fontSize: 18, fontWeight: '600' }}>Select a Filter</Text>
                <Text style={{ color: '#666', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
                  Choose a city and filter above{'\n'}to explore wedding venues
                </Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8 }}>
                {galleryImages.map((img, idx) => {
                  // Real venue names by city and type
                  const venueNames: { [city: string]: { [type: string]: string[] } } = {
                    'Karachi': {
                      indoor: ['Marquee by Mews', 'Creek Vista', 'Bagh Ibn-e-Qasim', 'Royal Rodale', 'Vintage Garden', 'The Atrium', 'Qasr-e-Noor', 'Grand Sapphire', 'Mehmaan Banquet', 'Royale Marquee'],
                      outdoor: ['Beach Luxury Hotel', 'Mohatta Palace', 'Frere Hall Garden', 'PAF Museum Lawn', 'Karachi Golf Club', 'Creek Club', 'Boat Basin Garden', 'Sea View Lawn', 'DHA Golf Club', 'Clifton Beach'],
                      luxury: ['Pearl Continental Karachi', 'Movenpick Hotel', 'Marriott Karachi', 'Avari Towers', 'Beach Luxury Hotel', 'Regent Plaza', 'Sheraton Karachi', 'Mövenpick', 'Ramada Plaza', 'Hotel Faran'],
                      budget: ['Mehran Banquet', 'Al-Habib Marquee', 'Noor Mahal', 'Gulshan Marquee', 'Korangi Banquet', 'Nazimabad Hall', 'Liaquatabad Marquee', 'Malir Banquet', 'Landhi Hall', 'Orangi Marquee'],
                      large: ['Expo Centre Karachi', 'Convention Centre', 'Creek Vista Grand', 'Royal Rodale Grand', 'Bagh Ibn-e-Qasim', 'PAF Museum', 'Beach Luxury Grand', 'Marriott Grand Hall', 'PC Grand Ballroom', 'Avari Grand']
                    },
                    'Lahore': {
                      indoor: ['Royal Palm', 'Faletti\'s Grand', 'Nishat Hotel', 'Luxus Grand', 'The Vines', 'Royalay Marquee', 'Grand Empire', 'Qasr-e-Noor', 'Sheesh Mahal', 'Mughal Darbar'],
                      outdoor: ['Bagh-e-Jinnah', 'Shalimar Gardens', 'Lawrence Gardens', 'Race Course Park', 'Lahore Gymkhana', 'Royal Palm Golf', 'Defence Raya Golf', 'Canal View Garden', 'Model Town Park', 'Jilani Park'],
                      luxury: ['Pearl Continental Lahore', 'Nishat Hotel', 'Avari Hotel Lahore', 'Faletti\'s Hotel', 'Luxus Grand Hotel', 'The Nishat Emporium', 'Royal Palm Club', 'Lahore Serena', 'Hospitality Inn', 'Best Western'],
                      budget: ['Johar Town Marquee', 'Iqbal Town Hall', 'Township Banquet', 'Gulberg Marquee', 'Model Town Hall', 'Faisal Town Banquet', 'Allama Iqbal Town', 'Sabzazar Marquee', 'Green Town Hall', 'Shahdara Banquet'],
                      large: ['Expo Centre Lahore', 'Alhamra Hall', 'Royal Palm Grand', 'PC Grand Ballroom', 'Fortress Stadium', 'Gaddafi Stadium Lawn', 'Luxus Convention', 'Nishat Grand Hall', 'Faletti\'s Grand', 'Defence Raya']
                    },
                    'Islamabad': {
                      indoor: ['Marquee Islamabad', 'The Monal Marquee', 'Envoy Continental', 'Ramada Islamabad', 'Grand Marquee F-7', 'Royal Tulip', 'Islamabad Serena', 'Margalla Hotel', 'Best Western', 'Hotel One'],
                      outdoor: ['Faisal Mosque Lawn', 'Daman-e-Koh', 'Shakarparian', 'Lake View Park', 'Fatima Jinnah Park', 'Rose & Jasmine Garden', 'Margalla Hills', 'Trail 5 Venue', 'Saidpur Village', 'Pir Sohawa'],
                      luxury: ['Islamabad Serena Hotel', 'Marriott Islamabad', 'Ramada Islamabad', 'Envoy Continental', 'Rooftop Islamabad', 'The Monal', 'Royal Tulip', 'Best Western Premier', 'Hotel One', 'Shelton\'s Rezidor'],
                      budget: ['G-9 Markaz Hall', 'I-8 Marquee', 'F-10 Banquet', 'G-11 Marriage Hall', 'Bhara Kahu Marquee', 'Tarnol Banquet', 'Rawat Hall', 'Golra Marquee', 'Nilore Banquet', 'Soan Garden Hall'],
                      large: ['Jinnah Convention', 'Pak-China Centre', 'Serena Grand Ballroom', 'Marriott Grand Hall', 'Aiwan-e-Sadr Lawn', 'Convention Centre', 'Centaurus Marquee', 'Ramada Grand', 'Envoy Grand Hall', 'PNCA Auditorium']
                    },
                    'Rawalpindi': {
                      indoor: ['Pearl Continental Rawalpindi', 'Shalimar Hotel', 'Grand Marquee', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Mughal Darbar', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden'],
                      outdoor: ['Ayub Park', 'Rawalpindi Golf Club', 'Army Golf Club', 'Jinnah Park', 'Liaquat Bagh', 'Race Course', 'Chaklala Cantonment', 'Westridge Garden', 'Satellite Town Park', 'Bahria Town Garden'],
                      luxury: ['Pearl Continental Rawalpindi', 'Shalimar Hotel', 'Hotel One Mall Road', 'Shelton\'s Hotel', 'Grand Marquee', 'Royal Marquee', 'Envoy Hotel', 'Best Western', 'Ramada', 'Hotel De Palazzo'],
                      budget: ['Saddar Marquee', 'Committee Chowk Hall', 'Adiala Road Banquet', 'Dhoke Kala Khan', 'Pirwadhai Marquee', 'Morgah Hall', 'Westridge Banquet', 'Tench Bhatta Hall', 'Khayaban Marquee', 'Gulzar-e-Quaid'],
                      large: ['Ayub Park Convention', 'PC Grand Ballroom', 'Liaquat Bagh', 'Army Convention Centre', 'Rawalpindi Cricket Stadium', 'Jinnah Stadium', 'Shalimar Grand', 'Royal Grand Hall', 'Bahria Convention', 'DHA Convention']
                    },
                    'Faisalabad': {
                      indoor: ['Serena Hotel Faisalabad', 'Grand Marquee', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden', 'Mughal Darbar', 'Paradise Marquee'],
                      outdoor: ['Jinnah Garden', 'Iqbal Stadium Lawn', 'Canal Garden', 'D-Ground', 'Company Bagh', 'Gatwala Wildlife Park', 'Agriculture University', 'Susan Road Garden', 'Peoples Colony Park', 'Madina Town Garden'],
                      luxury: ['Serena Hotel Faisalabad', 'Hotel One', 'Best Western', 'Ramada', 'Grand Marquee', 'Royal Marquee', 'Envoy Hotel', 'Hotel De Palazzo', 'Shelton\'s', 'Faisalabad Serena'],
                      budget: ['D-Ground Marquee', 'Peoples Colony Hall', 'Madina Town Banquet', 'Ghulam Muhammad Abad', 'Millat Town Hall', 'Jinnah Colony Marquee', 'Susan Road Banquet', 'Samanabad Hall', 'Batala Colony', 'Gulfishan Marquee'],
                      large: ['Iqbal Stadium', 'Serena Grand Hall', 'Canal Convention', 'D-Ground Convention', 'Agriculture University Hall', 'Faisalabad Expo', 'Grand Convention', 'Royal Grand Hall', 'Chenab Club', 'Lyallpur Club']
                    },
                    'Multan': {
                      indoor: ['Ramada Multan', 'Holiday Inn', 'Grand Marquee', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden', 'Paradise Marquee'],
                      outdoor: ['Multan Cricket Stadium', 'Qila Kohna Qasim Bagh', 'Hussain Agahi Garden', 'Nishtar Park', 'Bosan Road Garden', 'Cantt Garden', 'Shah Rukn-e-Alam Lawn', 'Gulgasht Colony Park', 'Model Town Garden', 'BZU Lawn'],
                      luxury: ['Ramada Multan', 'Holiday Inn Multan', 'Hotel One', 'Best Western', 'Grand Marquee', 'Royal Marquee', 'Envoy Hotel', 'Shelton\'s', 'Hotel De Palazzo', 'Multan Serena'],
                      budget: ['Hussain Agahi Hall', 'Gulgasht Marquee', 'Bosan Road Banquet', 'Model Town Hall', 'Shah Rukn-e-Alam', 'Cantt Marquee', 'Mumtazabad Hall', 'New Multan Banquet', 'Sher Shah Road', 'Chungi No. 9 Hall'],
                      large: ['Multan Cricket Stadium', 'Qila Kohna Qasim Bagh', 'Ramada Grand Hall', 'Holiday Inn Convention', 'BZU Convention Centre', 'Nishtar Hall', 'Grand Convention', 'Royal Grand Hall', 'Multan Expo', 'Chenab Club']
                    },
                    'Peshawar': {
                      indoor: ['Pearl Continental Peshawar', 'Shelton\'s Rezidor', 'Grand Marquee', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden', 'Paradise Marquee'],
                      outdoor: ['Bala Hisar Fort', 'Shahi Bagh', 'Peshawar Golf Club', 'Warsak Dam', 'Islamia College Lawn', 'Cunningham Park', 'Tatara Park', 'Hayatabad Sports Complex', 'University Town Garden', 'Cantt Garden'],
                      luxury: ['Pearl Continental Peshawar', 'Shelton\'s Rezidor', 'Hotel Grand', 'Greens Hotel', 'Rose Hotel', 'Hotel One', 'Best Western', 'Ramada', 'Envoy Hotel', 'PC Peshawar'],
                      budget: ['Saddar Marquee', 'Hayatabad Hall', 'University Town Banquet', 'Board Bazaar Hall', 'Cantt Marquee', 'Dalazak Road Hall', 'Ring Road Banquet', 'Kohat Road Hall', 'GT Road Marquee', 'Charsadda Road'],
                      large: ['Arbab Niaz Stadium', 'PC Grand Ballroom', 'Shahi Bagh Convention', 'Islamia College Hall', 'Peshawar Expo', 'Grand Convention', 'Royal Grand Hall', 'Hayatabad Convention', 'University Auditorium', 'Nishtar Hall']
                    },
                    'Quetta': {
                      indoor: ['Serena Hotel Quetta', 'Quetta Grand', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden', 'Paradise Marquee', 'Grand Marquee'],
                      outdoor: ['Quaid-e-Azam Residency', 'Hanna Lake', 'Urak Valley', 'Ziarat', 'Bolan Pass', 'Quetta Golf Club', 'Ayub Stadium Lawn', 'Cantt Garden', 'Jinnah Road Garden', 'Brewery Road Park'],
                      luxury: ['Serena Hotel Quetta', 'Quetta Grand Hotel', 'Hotel Bloom Star', 'Lourdes Hotel', 'Hotel Grand', 'Royal Marquee', 'Best Western', 'Hotel One', 'Ramada', 'Envoy Hotel'],
                      budget: ['Jinnah Road Hall', 'Satellite Town Marquee', 'Brewery Road Banquet', 'Cantt Hall', 'Sariab Road Marquee', 'Airport Road Hall', 'Samungli Road Banquet', 'Joint Road Hall', 'Zarghoon Road', 'Model Town Hall'],
                      large: ['Ayub Stadium', 'Serena Grand Hall', 'Quetta Expo', 'Grand Convention', 'Royal Grand Hall', 'Bugti Stadium', 'University Auditorium', 'Balochistan Assembly Hall', 'PC Convention', 'Quetta Club']
                    }
                  };

                  // Default venues for cities not in the list
                  const defaultVenues = {
                    indoor: ['Grand Marquee', 'Royal Marquee', 'Qasr-e-Noor', 'Sheesh Mahal', 'Al-Noor Banquet', 'Chandni Marquee', 'Rose Garden', 'Paradise Marquee', 'Mughal Darbar', 'Pearl Banquet'],
                    outdoor: ['City Garden', 'Central Park', 'Golf Club', 'Sports Complex', 'University Lawn', 'Cantt Garden', 'Model Town Park', 'Lake View', 'Hill Top Venue', 'River Side'],
                    luxury: ['Pearl Continental', 'Serena Hotel', 'Marriott', 'Avari Hotel', 'Best Western', 'Ramada', 'Hotel One', 'Envoy Hotel', 'Grand Hotel', 'Royal Hotel'],
                    budget: ['City Marquee', 'Town Hall', 'Community Centre', 'Local Banquet', 'Marriage Hall', 'Function Hall', 'Event Centre', 'Celebration Hall', 'Party Venue', 'Wedding Hall'],
                    large: ['Convention Centre', 'Expo Centre', 'Grand Ballroom', 'Stadium Lawn', 'University Hall', 'Assembly Hall', 'Sports Arena', 'Exhibition Centre', 'Mega Venue', 'Grand Convention']
                  };

                  const cityVenues = venueNames[selectedCity] || {};
                  const filterVenues = cityVenues[venueFilter] || defaultVenues[venueFilter as keyof typeof defaultVenues] || defaultVenues.indoor;
                  const venueName = filterVenues[idx % filterVenues.length];

                  // Generate venue info based on filter type
                  const getVenueInfo = () => {
                    const capacities = ['200-300', '300-500', '500-800', '800-1200', '1000-1500'];
                    const randomCapacity = capacities[idx % capacities.length];
                    
                    switch(venueFilter) {
                      case 'indoor':
                        return {
                          type: '🏠 Indoor Hall',
                          capacity: `👥 ${randomCapacity} guests`,
                          feature: '❄️ AC Available',
                          price: idx % 2 === 0 ? '💵 PKR 3-5 Lac' : '💵 PKR 5-8 Lac'
                        };
                      case 'outdoor':
                        return {
                          type: '🌳 Garden/Outdoor',
                          capacity: `👥 ${randomCapacity} guests`,
                          feature: '🌙 Evening Events',
                          price: idx % 2 === 0 ? '💵 PKR 2-4 Lac' : '💵 PKR 4-6 Lac'
                        };
                      case 'luxury':
                        return {
                          type: '👑 Luxury Venue',
                          capacity: `👥 ${randomCapacity} guests`,
                          feature: '⭐ 5-Star Service',
                          price: idx % 2 === 0 ? '💵 PKR 10-15 Lac' : '💵 PKR 15-25 Lac'
                        };
                      case 'budget':
                        return {
                          type: '💰 Budget Friendly',
                          capacity: `👥 ${randomCapacity} guests`,
                          feature: '✅ All Inclusive',
                          price: idx % 2 === 0 ? '💵 PKR 1-2 Lac' : '💵 PKR 2-3 Lac'
                        };
                      case 'large':
                        return {
                          type: '🏟️ Large Capacity',
                          capacity: '👥 1500+ guests',
                          feature: '🎪 Multiple Halls',
                          price: idx % 2 === 0 ? '💵 PKR 8-12 Lac' : '💵 PKR 12-18 Lac'
                        };
                      default:
                        return {
                          type: '🏛️ Wedding Venue',
                          capacity: `👥 ${randomCapacity} guests`,
                          feature: '📍 Prime Location',
                          price: '💵 Contact for Price'
                        };
                    }
                  };
                  
                  const venueInfo = getVenueInfo();
                  
                  return (
                    <View key={idx} style={{ width: '50%', padding: 4 }}>
                      <View style={{ borderRadius: 16, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, backgroundColor: '#fff' }}>
                        <Image
                          source={{ uri: img.src?.medium || img.src?.large }}
                          style={{ width: '100%', height: 140, backgroundColor: '#f0f0f0' }}
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          style={{ position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, padding: 8, elevation: 2 }}
                          onPress={() => toggleFavorite(img)}
                        >
                          <Ionicons
                            name={isFavorite(img) ? "heart" : "heart-outline"}
                            size={18}
                            color={isFavorite(img) ? "#e22f2f" : "#666"}
                          />
                        </TouchableOpacity>
                        {/* Venue Info Card */}
                        <View style={{ padding: 10 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#333' }} numberOfLines={1}>
                            {venueName}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                            <Ionicons name="location-outline" size={11} color="#666" />
                            <Text style={{ fontSize: 10, color: '#666', marginLeft: 3 }}>{selectedCity}</Text>
                          </View>
                          {/* Capacity */}
                          <View style={{ marginTop: 6, backgroundColor: '#f8f8f8', borderRadius: 8, padding: 6 }}>
                            <Text style={{ fontSize: 10, color: '#333', fontWeight: '600' }}>{venueInfo.capacity}</Text>
                            <Text style={{ fontSize: 9, color: '#666', marginTop: 2 }}>{venueInfo.feature}</Text>
                          </View>
                          {/* Price & Type */}
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                            <View style={{ backgroundColor: '#ffe4e6', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 }}>
                              <Text style={{ fontSize: 9, color: '#e22f2f', fontWeight: '600' }}>{venueInfo.type}</Text>
                            </View>
                          </View>
                          <Text style={{ fontSize: 10, color: '#333', fontWeight: '700', marginTop: 6 }}>{venueInfo.price}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
                {galleryLoading && (
                  <View style={{ width: '100%', padding: 30, alignItems: 'center' }}>
                    <Text style={{ color: '#e22f2f', fontWeight: '600' }}>Loading more venues...</Text>
                  </View>
                )}
              </View>
            )}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Review Popup - Shows after booking date passes */}
      {pendingReview && (
        <ReviewPopup
          visible={showReviewPopup}
          onClose={() => {
            setShowReviewPopup(false);
            clearPendingReview();
          }}
          booking={pendingReview}
          userId={user?.uid || ''}
          userName={user?.displayName || user?.email?.split('@')[0] || 'User'}
        />
      )}
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

  // Inspiration Gallery Styles
  inspirationRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  inspirationCard: { width: '48%', height: 160, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
  inspirationImage: { width: '100%', height: '100%', position: 'absolute' },
  inspirationOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 12 },
  inspirationTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 8, textAlign: 'center' },
  inspirationSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, textAlign: 'center' },

  // Gallery Modal Styles
  galleryModalContainer: { flex: 1, backgroundColor: '#fff' },
  galleryHeader: { backgroundColor: '#e22f2f', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  galleryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  galleryTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  gallerySubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginTop: 4 },
  cityPillsContainer: { paddingVertical: 15, paddingHorizontal: 10, backgroundColor: '#f8f8f8' },
  cityPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, backgroundColor: '#fff', marginHorizontal: 5, borderWidth: 1, borderColor: '#ddd' },
  cityPillActive: { backgroundColor: '#e22f2f', borderColor: '#e22f2f' },
  cityPillText: { fontSize: 14, fontWeight: '600', color: '#333' },
  cityPillTextActive: { color: '#fff' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f5f5f5', marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  filterChipActive: { backgroundColor: '#ffe4e6', borderColor: '#e22f2f' },
  filterChipText: { fontSize: 13, color: '#666' },
  filterChipTextActive: { color: '#e22f2f', fontWeight: '600' },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 8 },
  galleryImageWrapper: { width: '50%', padding: 4 },
  galleryImage: { width: '100%', height: 200, borderRadius: 12 },
  galleryImageOverlay: { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 8, padding: 8 },
  galleryImageText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heartButton: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 8 },
  loadingContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
  emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666', fontSize: 16, textAlign: 'center', marginTop: 15 },
});
