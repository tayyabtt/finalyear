// Luxury Wedding Album Type Definitions

export type AlbumTheme = {
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  pattern: 'henna' | 'floral' | 'geometric' | 'elegant' | 'traditional';
};

export type EventAlbum = {
  id: string;
  name: string;
  theme: AlbumTheme;
  coverPhotoUri?: string;
  createdAt: number;
  photoCount: number;
};

export type VoiceNote = {
  uri: string;
  duration: number;
  userId: string;
  userName?: string;
};

export type EventPhoto = {
  uri: string;
  eventId: string;
  caption?: string;
  favorite?: boolean;
  timestamp: number;
  filter?: string;
  voiceNotes?: VoiceNote[];
  uploadedBy: string;
};

// Predefined album themes
export const ALBUM_THEMES: AlbumTheme[] = [
  {
    name: 'Mehndi',
    primary: '#FFD700',
    secondary: '#FF8C00',
    accent: '#FFA500',
    pattern: 'henna',
  },
  {
    name: 'Barat',
    primary: '#DC143C',
    secondary: '#FFD700',
    accent: '#8B0000',
    pattern: 'traditional',
  },
  {
    name: 'Walima',
    primary: '#C0C0C0',
    secondary: '#FFFFFF',
    accent: '#E8E8E8',
    pattern: 'elegant',
  },
  {
    name: 'Pink Rose',
    primary: '#FF69B4',
    secondary: '#FFB6C1',
    accent: '#FF1493',
    pattern: 'floral',
  },
  {
    name: 'Royal Blue',
    primary: '#4169E1',
    secondary: '#87CEEB',
    accent: '#000080',
    pattern: 'geometric',
  },
  {
    name: 'Purple Dream',
    primary: '#9370DB',
    secondary: '#DDA0DD',
    accent: '#8B008B',
    pattern: 'elegant',
  },
  {
    name: 'Emerald',
    primary: '#50C878',
    secondary: '#98FB98',
    accent: '#2E8B57',
    pattern: 'floral',
  },
];

// Quick event suggestions
export const EVENT_SUGGESTIONS = [
  'Mehndi',
  'Barat',
  'Walima',
  'Sangeet',
  'Haldi',
  'Reception',
  'Engagement',
  'Nikah',
];
