// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY || '';
const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY || '';

// Wedding search queries focused on Pakistani & South Asian weddings
const WEDDING_SEARCH_QUERIES = [
  // Pakistani Wedding Focus (40%)
  'pakistani wedding shorts',
  'pakistani bride mehndi',
  'pakistani wedding dance',
  'nikah ceremony pakistan',
  'walima reception pakistan',
  'pakistani bridal entry',
  'lahore wedding',
  'karachi wedding',
  'pakistani wedding highlights',
  'desi wedding pakistan',

  // South Asian Wedding Focus (40%)
  'indian wedding shorts',
  'desi wedding ceremony',
  'south asian bride',
  'indian wedding dance',
  'sangeet ceremony',
  'mehendi function',
  'baraat entry',
  'indian wedding highlights',
  'bollywood wedding',
  'punjabi wedding',

  // General Wedding (20%)
  'wedding ceremony shorts',
  'bridal entry',
  'wedding highlights',
  'wedding dance',
  'romantic wedding'
];

// Hashtags for better search results
const WEDDING_HASHTAGS = [
  '#pakistaniwedding',
  '#desiwedding',
  '#indianwedding',
  '#southasianwedding',
  '#weddingshorts',
  '#bridalentry',
  '#mehndi',
  '#nikah',
  '#walima',
  '#sangeet'
];

// Get random search query
const getRandomWeddingQuery = (): string => {
  return WEDDING_SEARCH_QUERIES[Math.floor(Math.random() * WEDDING_SEARCH_QUERIES.length)];
};

// Map category titles to specific search queries
const getCategoryQuery = (category: string): string => {
  const queryMap: { [key: string]: string } = {
    'Bridal Necklace': 'bridal necklace jewelry wedding',
    'Bridal Makeup Look': 'bridal makeup wedding bride beauty',
    'Bride Trending Looks': 'bride wedding dress fashion',
    'Jewelry': 'wedding jewelry gold diamond',
  };

  return queryMap[category] || category;
};

export const fetchTrendingImages = async (category: string): Promise<any[]> => {
  try {
    const searchQuery = getCategoryQuery(category);
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=20&orientation=portrait`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = await response.json();
    console.log(`Fetched ${data.photos?.length || 0} images for ${category}`);
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching trending images:', error);
    return [];
  }
};

// Fetch wedding shorts from YouTube
export const fetchWeddingVideos = async (page: number = 1): Promise<any[]> => {
  try {
    // Use random search query for variety
    const searchQuery = getRandomWeddingQuery();
    const maxResults = 50; // YouTube allows max 50 per request

    // Calculate pageToken for pagination
    let pageToken = '';
    if (page > 1) {
      // For subsequent pages, we'll need to store the nextPageToken
      // For now, we'll use different search queries to get variety
      const queryIndex = (page - 1) % WEDDING_SEARCH_QUERIES.length;
      const query = WEDDING_SEARCH_QUERIES[queryIndex];

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&` +
        `q=${encodeURIComponent(query)}&` +
        `type=video&` +
        `videoDuration=short&` +
        `maxResults=${maxResults}&` +
        `key=${YOUTUBE_API_KEY}&` +
        `relevanceLanguage=en&` +
        `safeSearch=strict`
      );

      const data = await response.json();

      if (data.error) {
        console.error('YouTube API Error:', data.error);
        return [];
      }

      // Transform YouTube data to match our video format
      const videos = data.items?.filter((item: any) => item.id?.videoId).map((item: any) => {
        const videoId = item.id.videoId || item.id;
        return {
          id: videoId,
          videoId: videoId,
          title: item.snippet?.title || 'Wedding Video',
          description: item.snippet?.description || '',
          thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
          channelTitle: item.snippet?.channelTitle || 'Wedding Channel',
          publishedAt: item.snippet?.publishedAt || '',
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`,
        };
      }) || [];

      console.log(`Fetched ${videos.length} YouTube shorts for: ${query}`);
      return videos;
    }

    // First page - mix of Pakistani and South Asian wedding queries
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `type=video&` +
      `videoDuration=short&` +
      `maxResults=${maxResults}&` +
      `key=${YOUTUBE_API_KEY}&` +
      `relevanceLanguage=en&` +
      `safeSearch=strict`
    );

    const data = await response.json();

    if (data.error) {
      console.error('YouTube API Error:', data.error);
      return [];
    }

    const videos = data.items?.filter((item: any) => item.id?.videoId).map((item: any) => {
      const videoId = item.id.videoId || item.id;
      return {
        id: videoId,
        videoId: videoId,
        title: item.snippet?.title || 'Wedding Video',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || '',
        channelTitle: item.snippet?.channelTitle || 'Wedding Channel',
        publishedAt: item.snippet?.publishedAt || '',
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      };
    }) || [];

    console.log(`Fetched ${videos.length} YouTube shorts for: ${searchQuery}`);
    return videos;
  } catch (error) {
    console.error('Error fetching YouTube wedding videos:', error);
    return [];
  }
};

// Fetch Real Wedding Gallery Images by City
export const fetchRealWeddingImages = async (city: string, page: number = 1): Promise<any[]> => {
  try {
    const searchQuery = `Pakistani wedding ${city} ceremony bride`;
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=20&page=${page}&orientation=portrait`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = await response.json();
    console.log(`Fetched ${data.photos?.length || 0} real wedding images for ${city}`);
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching real wedding images:', error);
    return [];
  }
};

// Fetch Wedding Destination/Venue Images by City
export const fetchDestinationImages = async (city: string, filter: string = 'all', page: number = 1): Promise<any[]> => {
  try {
    let searchQuery = `wedding venue ${city} Pakistan`;
    
    if (filter === 'indoor') {
      searchQuery = `indoor wedding hall banquet ${city}`;
    } else if (filter === 'outdoor') {
      searchQuery = `outdoor garden wedding venue ${city}`;
    } else if (filter === 'luxury') {
      searchQuery = `luxury wedding venue hotel ${city}`;
    } else if (filter === 'budget') {
      searchQuery = `simple wedding venue ${city}`;
    } else if (filter === 'large') {
      searchQuery = `large wedding hall banquet capacity ${city}`;
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(searchQuery)}&per_page=20&page=${page}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY,
        },
      }
    );

    const data = await response.json();
    console.log(`Fetched ${data.photos?.length || 0} destination images for ${city} (${filter})`);
    return data.photos || [];
  } catch (error) {
    console.error('Error fetching destination images:', error);
    return [];
  }
};

// Fallback: Use local curated images if API fails
export const getFallbackImages = (category: string) => {
  const fallbackImages = {
    'Bridal Necklace': [
      require('../assets/images/necklace.jpg'),
      require('../assets/images/jewelry.jpg'),
    ],
    'Bridal Makeup Look': [
      require('../assets/images/bridal.jpg'),
      require('../assets/images/makeup.jpg'),
    ],
    'Bride Trending Looks': [
      require('../assets/images/bride1.jpg'),
      require('../assets/images/bridal.jpg'),
    ],
    'Jewelry': [
      require('../assets/images/jewelry.jpg'),
      require('../assets/images/necklace.jpg'),
    ],
  };

  return fallbackImages[category as keyof typeof fallbackImages] || [];
};
