# TikTok-Style Video Player Implementation Guide

## What You Requested
A vertical, swipeable video player (like TikTok) inside the app that plays wedding videos from Pexels API without opening external browser.

## Implementation Summary

### 1. Install Required Package
```bash
npx expo install expo-av
```

### 2. Add Video Player State (in home.tsx)
```typescript
const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
```

### 3. Update Hero Section Click Handler
Replace the hero section to open video player modal instead of external link.

### 4. Create TikTok-Style Video Player Modal
```typescript
<Modal visible={videoPlayerOpen} animationType="slide">
  <View style={{ flex: 1, backgroundColor: '#000' }}>
    <ScrollView 
      pagingEnabled 
      showsVerticalScrollIndicator={false}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(e.nativeEvent.contentOffset.y / height);
        setCurrentVideoIndex(index);
      }}
    >
      {weddingVideos.map((video, idx) => (
        <View key={idx} style={{ height, width, justifyContent: 'center' }}>
          <Video
            source={{ uri: video.video_files[0].link }}
            style={{ width, height }}
            resizeMode="cover"
            shouldPlay={idx === currentVideoIndex}
            isLooping
            useNativeControls
          />
          {/* Overlay with video info */}
          <View style={{ position: 'absolute', bottom: 100, left: 20 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
              {video.user?.name}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
    
    {/* Close Button */}
    <TouchableOpacity 
      style={{ position: 'absolute', top: 50, right: 20 }}
      onPress={() => setVideoPlayerOpen(false)}
    >
      <Ionicons name="close" size={32} color="#fff" />
    </TouchableOpacity>
  </View>
</Modal>
```

### 5. Features Included
- ✅ Vertical scroll (swipe up/down)
- ✅ Auto-play current video
- ✅ Pause other videos
- ✅ Loop videos
- ✅ Native controls (play/pause, seek)
- ✅ Video info overlay
- ✅ Close button
- ✅ Full-screen experience

### 6. Video URL from Pexels
Use `video.video_files[0].link` to get the video URL from Pexels API response.

## Status
Ready to implement - requires expo-av package installation and code integration.

## Next Steps
1. Install expo-av
2. Import Video component
3. Add video player modal
4. Update hero section click handler
5. Test with wedding videos

