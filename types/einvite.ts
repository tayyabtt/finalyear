// E-Invite Types
export interface InviteTemplate {
  id: string;
  title: string;
  category: 'Classic Floral' | 'Luxury Gold' | 'Minimal Elegant' | 'Festive Mehndi' | 'Nikkah Theme';
  thumbnail: string;
  backgroundImage: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: 'Playfair Display' | 'Great Vibes' | 'Alex Brush' | 'Cormorant Garamond';
  animation?: 'petals' | 'sparkles' | 'shimmer' | 'none';
}

export interface InviteData {
  // Names
  brideName: string;
  groomName: string;
  brideFamily?: string;
  groomFamily?: string;
  
  // Event Details
  eventType: 'Nikkah' | 'Mehndi' | 'Barat' | 'Walima' | 'Reception';
  eventDate: string;
  eventTime: string;
  venue: string;
  venueAddress: string;
  
  // Optional
  quote?: string;
  verse?: string;
  couplePhoto?: string;
  
  // RSVP
  rsvpPhone?: string;
  rsvpEmail?: string;
  rsvpDeadline?: string;
  
  // Template
  templateId: string;
}

export interface InviteCard extends InviteData {
  id: string;
  createdAt: string;
  updatedAt: string;
}
