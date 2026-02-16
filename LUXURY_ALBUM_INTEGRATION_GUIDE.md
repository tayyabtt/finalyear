# Luxury Album Integration Guide for event.tsx

## Summary

The luxury album feature foundation is complete with:
- ✅ Data structures (`types/album.ts`)
- ✅ Storage functions (`utils/albumStorage.ts`)
- ✅ 7 predefined themes
- ✅ Migration support

## What to Add to event.tsx

### 1. Add Imports (at top of file)
```typescript
import { EventAlbum, EventPhoto, ALBUM_THEMES, EVENT_SUGGESTIONS } from '../types/album';
import { 
  loadEventAlbums, 
  createEventAlbum, 
  loadEventPhotos,
  addPhotosToEvent,
  migrateOldPhotos 
} from '../utils/albumStorage';
```

### 2. Add State Variables (after existing state)
```typescript
// Luxury Album State
const [albumMode, setAlbumMode] = useState<'selection' | 'cover' | 'flip' | null>(null);
const [eventAlbums, setEventAlbums] = useState<EventAlbum[]>([]);
const [selectedAlbum, setSelectedAlbum] = useState<EventAlbum | null>(null);
const [albumPhotos, setAlbumPhotos] = useState<EventPhoto[]>([]);
const [createAlbumModal, setCreateAlbumModal] = useState(false);
const [newAlbumName, setNewAlbumName] = useState('');
const [selectedTheme, setSelectedTheme] = useState(0);
const [currentPage, setCurrentPage] = useState(0);
```

### 3. Load Albums on Event Load (in useEffect)
```typescript
useEffect(() => {
  if (event?.code) {
    loadAlbums();
  }
}, [event?.code]);

const loadAlbums = async () => {
  if (!event?.code || !user) return;
  
  // Migrate old photos first
  await migrateOldPhotos(event.code, user.uid);
  
  // Load albums
  const albums = await loadEventAlbums(event.code);
  setEventAlbums(albums);
};
```

### 4. Add "Open Album" Button (in overview section, after widgets)
```typescript
{/* LUXURY ALBUM BUTTON */}
<TouchableOpacity 
  style={styles.luxuryAlbumBtn} 
  onPress={() => setAlbumMode('selection')}
>
  <LinearGradient
    colors={['#7c26ff', '#9d4edd']}
    style={styles.luxuryAlbumGradient}
  >
    <Ionicons name="book" size={24} color="#fff" />
    <Text style={styles.luxuryAlbumText}>Open Wedding Album</Text>
    <Text style={styles.luxuryAlbumSubtext}>{eventAlbums.length} Events</Text>
  </LinearGradient>
</TouchableOpacity>
```

### 5. Add Album Screens (before closing LinearGradient)
```typescript
{/* LUXURY ALBUM SCREENS */}
{albumMode === 'selection' && (
  <Modal visible={true} animationType="slide">
    <LinearGradient colors={['#1a0033', '#2d0052']} style={{flex:1}}>
      {/* Event Selection Screen */}
      <View style={{flex:1, paddingTop:50}}>
        <View style={{flexDirection:'row', justifyContent:'space-between', padding:20}}>
          <Text style={{color:'#fff', fontSize:24, fontWeight:'700'}}>Wedding Albums</Text>
          <TouchableOpacity onPress={() => setAlbumMode(null)}>
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <ScrollView contentContainerStyle={{padding:10}}>
          <View style={{flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between'}}>
            {eventAlbums.map(album => (
              <TouchableOpacity 
                key={album.id}
                style={styles.albumCard}
                onPress={() => {
                  setSelectedAlbum(album);
                  setAlbumMode('cover');
                }}
              >
                <LinearGradient
                  colors={[album.theme.primary, album.theme.secondary]}
                  style={styles.albumCardGradient}
                >
                  {album.coverPhotoUri ? (
                    <Image source={{uri: album.coverPhotoUri}} style={styles.albumCover} />
                  ) : (
                    <Ionicons name="images" size={60} color="rgba(255,255,255,0.5)" />
                  )}
                </LinearGradient>
                <Text style={styles.albumName}>{album.name}</Text>
                <Text style={styles.albumCount}>{album.photoCount} photos</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Create Album Button */}
        <TouchableOpacity 
          style={styles.createAlbumBtn}
          onPress={() => setCreateAlbumModal(true)}
        >
          <Ionicons name="add-circle" size={60} color="#7c26ff" />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  </Modal>
)}

{/* CREATE ALBUM MODAL */}
{createAlbumModal && (
  <Modal visible={true} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.createModal}>
        <Text style={styles.modalTitle}>Create Event Album</Text>
        
        <TextInput
          style={styles.modalInput}
          placeholder="Event Name"
          value={newAlbumName}
          onChangeText={setNewAlbumName}
        />
        
        <Text style={styles.modalLabel}>Quick Suggestions:</Text>
        <View style={{flexDirection:'row', flexWrap:'wrap', marginBottom:20}}>
          {EVENT_SUGGESTIONS.map(suggestion => (
            <TouchableOpacity
              key={suggestion}
              style={styles.suggestionChip}
              onPress={() => setNewAlbumName(suggestion)}
            >
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.modalLabel}>Choose Theme:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ALBUM_THEMES.map((theme, index) => (
            <TouchableOpacity
              key={theme.name}
              style={[
                styles.themeOption,
                selectedTheme === index && styles.themeSelected
              ]}
              onPress={() => setSelectedTheme(index)}
            >
              <LinearGradient
                colors={[theme.primary, theme.secondary]}
                style={styles.themeSwatch}
              />
              <Text style={styles.themeName}>{theme.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={{flexDirection:'row', gap:10, marginTop:20}}>
          <TouchableOpacity
            style={[styles.modalBtn, {backgroundColor:'#7c26ff'}]}
            onPress={async () => {
              if (newAlbumName.trim() && event?.code) {
                await createEventAlbum(event.code, newAlbumName.trim(), selectedTheme);
                await loadAlbums();
                setCreateAlbumModal(false);
                setNewAlbumName('');
                setSelectedTheme(0);
              }
            }}
          >
            <Text style={styles.modalBtnText}>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalBtn, {backgroundColor:'#666'}]}
            onPress={() => {
              setCreateAlbumModal(false);
              setNewAlbumName('');
            }}
          >
            <Text style={styles.modalBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
)}
```

### 6. Add Styles (in StyleSheet.create)
```typescript
luxuryAlbumBtn: {
  marginHorizontal: 10,
  marginVertical: 20,
  borderRadius: 16,
  overflow: 'hidden',
  elevation: 5,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
luxuryAlbumGradient: {
  padding: 20,
  alignItems: 'center',
  gap: 8,
},
luxuryAlbumText: {
  color: '#fff',
  fontSize: 18,
  fontWeight: '700',
},
luxuryAlbumSubtext: {
  color: 'rgba(255,255,255,0.8)',
  fontSize: 14,
},
albumCard: {
  width: (width - 40) / 2,
  marginBottom: 20,
  borderRadius: 12,
  overflow: 'hidden',
  backgroundColor: '#2a2a2a',
},
albumCardGradient: {
  height: 150,
  justifyContent: 'center',
  alignItems: 'center',
},
albumCover: {
  width: '100%',
  height: '100%',
  resizeMode: 'cover',
},
albumName: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
  padding: 10,
},
albumCount: {
  color: '#aaa',
  fontSize: 12,
  paddingHorizontal: 10,
  paddingBottom: 10,
},
createAlbumBtn: {
  position: 'absolute',
  bottom: 30,
  right: 30,
  backgroundColor: '#fff',
  borderRadius: 30,
  elevation: 8,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.8)',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
createModal: {
  backgroundColor: '#fff',
  borderRadius: 20,
  padding: 24,
  width: '100%',
  maxWidth: 400,
},
modalTitle: {
  fontSize: 22,
  fontWeight: '700',
  marginBottom: 20,
  color: '#333',
},
modalInput: {
  borderWidth: 1,
  borderColor: '#ddd',
  borderRadius: 12,
  padding: 14,
  fontSize: 16,
  marginBottom: 20,
},
modalLabel: {
  fontSize: 14,
  fontWeight: '600',
  color: '#666',
  marginBottom: 10,
},
suggestionChip: {
  backgroundColor: '#f0f0f0',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16,
  marginRight: 8,
  marginBottom: 8,
},
suggestionText: {
  color: '#333',
  fontSize: 12,
},
themeOption: {
  alignItems: 'center',
  marginRight: 12,
  padding: 8,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: 'transparent',
},
themeSelected: {
  borderColor: '#7c26ff',
},
themeSwatch: {
  width: 60,
  height: 60,
  borderRadius: 30,
  marginBottom: 4,
},
themeName: {
  fontSize: 10,
  color: '#666',
},
modalBtn: {
  flex: 1,
  padding: 14,
  borderRadius: 12,
  alignItems: 'center',
},
modalBtnText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
```

## Testing Steps

1. Open event overview
2. Click "Open Wedding Album" button
3. See Event Selection Screen
4. Click "+" to create new album
5. Enter name, select theme, create
6. See new album card
7. Click album to open (cover page - to be implemented next)

## Next Phase

After this works, we'll add:
- Cover Page view
- Page-flip album view
- Photo upload to specific albums
- Page-turn animations
- Audio system

---

**Current Status**: Ready to integrate into event.tsx
**Estimated Time**: 15-20 minutes to add and test
**Files Modified**: Only `app/(tabs)/event.tsx`
