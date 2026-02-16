# Luxury Wedding Album - Design Document

## Overview

The Luxury Wedding Album feature transforms the digital photo experience into a realistic, premium wedding album with multiple event-based collections, realistic page-flip animations, and immersive audio-visual elements. This design focuses on creating an emotional, high-end experience that replicates holding and browsing a physical luxury wedding album.

## Architecture

### Component Structure

```
LuxuryAlbumSystem/
├── EventSelectionScreen (Landing)
├── CreateEventModal
├── EventCoverPage
├── PageFlipAlbumView
│   ├── AlbumPage (1-2 photos)
│   ├── PageFlipAnimation
│   └── NavigationControls
├── PhotoUploadModal (with event selection)
└── AudioManager (sounds & music)
```

### Data Flow

1. User opens album → Load all event albums from storage
2. Display Event Selection Screen with cards
3. User selects event → Load event data & photos
4. Display Cover Page with theme
5. User taps "Open Album" → Enter Page-Flip View
6. Photos organized into pages (1-2 per page)
7. User swipes → Trigger page-flip animation + sound
8. Photos persist per event code + event ID

## Components and Interfaces

### 1. Event Album Data Structure

```typescript
type EventAlbum = {
  id: string;                    // Unique identifier
  name: string;                  // Custom event name
  theme: AlbumTheme;            // Color scheme
  coverPhotoUri?: string;       // Cover image
  createdAt: number;            // Timestamp
  photoCount: number;           // Total photos
};

type AlbumTheme = {
  name: string;                 // Theme name
  primary: string;              // Primary color
  secondary: string;            // Secondary color
  accent: string;               // Accent color
  pattern: 'henna' | 'floral' | 'geometric' | 'elegant' | 'traditional';
};

type EventPhoto = {
  uri: string;
  eventId: string;              // Which event album
  caption?: string;
  favorite?: boolean;
  timestamp: number;
  filter?: string;
  voiceNotes?: VoiceNote[];
  uploadedBy: string;           // User ID
};

// Predefined themes
const ALBUM_THEMES: AlbumTheme[] = [
  { name: 'Mehndi', primary: '#FFD700', secondary: '#FF8C00', accent: '#FFA500', pattern: 'henna' },
  { name: 'Barat', primary: '#DC143C', secondary: '#FFD700', accent: '#8B0000', pattern: 'traditional' },
  { name: 'Walima', primary: '#C0C0C0', secondary: '#FFFFFF', accent: '#E8E8E8', pattern: 'elegant' },
  { name: 'Pink Rose', primary: '#FF69B4', secondary: '#FFB6C1', accent: '#FF1493', pattern: 'floral' },
  { name: 'Royal Blue', primary: '#4169E1', secondary: '#87CEEB', accent: '#000080', pattern: 'geometric' },
  { name: 'Purple Dream', primary: '#9370DB', secondary: '#DDA0DD', accent: '#8B008B', pattern: 'elegant' },
  { name: 'Emerald', primary: '#50C878', secondary: '#98FB98', accent: '#2E8B57', pattern: 'floral' },
];
```

### 2. Event Selection Screen

**Purpose**: Display all event albums as elegant cards

**Layout**:
- Grid of event cards (2 columns on mobile)
- Each card shows: Cover photo, event name, photo count, theme color accent
- Floating "+" button to create new event
- Smooth card animations on load

**Styling**:
- Card shadows with elevation
- Gradient overlays on cover photos
- Theme color borders
- Tap animation with scale effect

### 3. Create Event Modal

**Purpose**: Allow owner to create new event albums

**Fields**:
- Event name (text input)
- Quick suggestions (chips): Mehndi, Barat, Walima, Sangeet, Haldi, Reception, Engagement
- Theme selector (color swatches)
- Optional cover photo upload

**Validation**:
- Event name required (min 2 characters)
- Theme selection required
- Duplicate names allowed (different IDs)

### 4. Event Cover Page

**Purpose**: Beautiful opening page for each event album

**Layout**:
```
┌─────────────────────────────┐
│   [Decorative Border Top]   │
│                             │
│      [Event Name]           │
│   "Mehndi Ceremony"         │
│                             │
│   [Couple Names]            │
│   "Sarah & Ahmed"           │
│                             │
│   [Date]                    │
│   "December 15, 2024"       │
│                             │
│   [Decorative Pattern]      │
│                             │
│   [Open Album Button]       │
│                             │
│   [Decorative Border Bottom]│
└─────────────────────────────┘
```

**Styling**:
- Full-screen gradient background (theme colors)
- Elegant typography (serif fonts for names)
- Decorative SVG patterns based on theme
- Animated entrance (fade + scale)
- Soft shadow on button

### 5. Page-Flip Album View

**Purpose**: Realistic book-like photo browsing experience

**Layout Options**:

**Single Photo Page**:
```
┌─────────────────────────────┐
│                             │
│     ┌─────────────────┐     │
│     │                 │     │
│     │     Photo       │     │
│     │                 │     │
│     └─────────────────┘     │
│     Caption text here       │
│     [🎤 voice note icon]    │
│                             │
│         Page 1 of 24        │
└─────────────────────────────┘
```

**Double Photo Page**:
```
┌─────────────────────────────┐
│  ┌──────────┐  ┌──────────┐ │
│  │  Photo 1 │  │  Photo 2 │ │
│  └──────────┘  └──────────┘ │
│   Caption 1      Caption 2  │
│                             │
│         Page 2 of 24        │
└─────────────────────────────┘
```

**Page-Flip Animation**:
- 3D perspective transformation
- Curved page edge during flip
- Shadow on turning page
- Smooth 400ms duration
- Easing: ease-in-out

**Implementation**:
```typescript
// Using Animated API
const pageRotation = useRef(new Animated.Value(0)).current;

const flipPage = (direction: 'next' | 'prev') => {
  Animated.sequence([
    Animated.timing(pageRotation, {
      toValue: direction === 'next' ? 180 : -180,
      duration: 400,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(pageRotation, {
      toValue: 0,
      duration: 0,
      useNativeDriver: true,
    }),
  ]).start();
  
  playPageTurnSound();
  updateCurrentPage(direction);
};
```

### 6. Photo Page Styling

**Paper Texture**:
- Subtle noise overlay
- Cream/off-white background (#FFFEF0)
- Soft inner shadow for depth

**Photo Cards**:
- White border (10-15px)
- Drop shadow: `0px 4px 12px rgba(0,0,0,0.15)`
- Rounded corners: 8px
- Slight rotation for natural look (-2° to 2°)

**Typography**:
- Caption: Elegant script or serif font
- Size: 14px
- Color: #333
- Centered below photo

### 7. Navigation Controls

**Swipe Gestures**:
- PanResponder for touch handling
- Threshold: 50px horizontal movement
- Velocity consideration for quick flips

**Arrow Buttons**:
- Left/Right arrows on page edges
- Semi-transparent background
- Fade in on hover/touch
- Disabled state when at boundaries

**Page Indicator**:
- Bottom center
- Format: "Page X of Y"
- Small, elegant font
- Theme color

**Close Button**:
- Top-left corner
- "X" or back arrow
- Returns to Event Selection

### 8. Photo Upload with Event Selection

**Modal Flow**:
1. User taps "Add Photos"
2. Modal shows all event albums as chips
3. User selects target event
4. Image picker opens
5. Photos uploaded to selected event
6. Success feedback

**UI**:
- Event chips with theme colors
- Photo count displayed
- Selected state highlight
- Confirm button

### 9. Audio System

**Sound Effects**:
- Page turn: Soft paper rustle (200ms)
- Button tap: Subtle click
- Album open: Gentle whoosh

**Background Music**:
- Optional instrumental tracks
- Soft volume (20-30%)
- Fade in/out on start/stop
- Pause when voice notes play

**Implementation**:
```typescript
import { Audio } from 'expo-av';

const playPageTurnSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('./assets/sounds/page-turn.mp3')
  );
  await sound.playAsync();
};

const startBackgroundMusic = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('./assets/sounds/wedding-music.mp3'),
    { isLooping: true, volume: 0.25 }
  );
  await sound.playAsync();
};
```

## Data Models

### Storage Structure

```typescript
// AsyncStorage keys
`event_albums_${eventCode}` → EventAlbum[]
`event_photos_${eventCode}_${eventId}` → EventPhoto[]

// Example:
event_albums_123456 → [
  { id: 'evt1', name: 'Mehndi', theme: {...}, photoCount: 45 },
  { id: 'evt2', name: 'Barat', theme: {...}, photoCount: 120 },
]

event_photos_123456_evt1 → [
  { uri: '...', eventId: 'evt1', caption: '...', ... },
  ...
]
```

### Migration Strategy

Existing photos without eventId:
- Create default "All Photos" event album
- Migrate existing photos to this album
- Preserve all metadata (captions, voice notes, filters)

## Error Handling

1. **No Photos in Event**: Display elegant empty state with "Add Photos" prompt
2. **Failed Image Load**: Show placeholder with retry option
3. **Audio Playback Error**: Silently fail, continue without sound
4. **Storage Full**: Alert user, suggest deleting old photos
5. **Invalid Event Data**: Skip corrupted albums, log error

## Testing Strategy

### Unit Tests
- Event album CRUD operations
- Photo organization by event
- Theme application logic
- Page calculation (photos → pages)

### Integration Tests
- Photo upload to specific event
- Event switching
- Page navigation
- Audio playback coordination

### UI Tests
- Page-flip animation smoothness
- Touch gesture recognition
- Theme color application
- Responsive layout on different screens

### Performance Tests
- Load time with 100+ photos per event
- Animation frame rate (target: 60fps)
- Memory usage with multiple events
- Image caching effectiveness

## Accessibility

- VoiceOver support for navigation
- High contrast mode for text
- Haptic feedback on page turns
- Alternative navigation (buttons) for swipe gestures
- Adjustable text sizes for captions

## Future Enhancements

1. **Collaborative Editing**: Multiple users editing same album
2. **Video Support**: Short video clips in album pages
3. **AR View**: View album in 3D space
4. **Print Service**: Export to physical album
5. **AI Captions**: Auto-generate photo captions
6. **Face Recognition**: Auto-tag people in photos
7. **Timeline View**: Chronological photo organization
8. **Sharing**: Generate shareable album links
