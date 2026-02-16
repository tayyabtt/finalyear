import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import YoutubeIframe from 'react-native-youtube-iframe';

interface YouTubePlayerProps {
  videoId: string;
  autoplay?: boolean;
}

export default function YouTubePlayer({ videoId, autoplay = false }: YouTubePlayerProps) {
  const { width, height } = Dimensions.get('window');

  // Calculate dimensions to fill screen while maintaining aspect ratio
  const videoHeight = height;
  const videoWidth = width;

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        <YoutubeIframe
          videoId={videoId}
          height={videoHeight}
          width={videoWidth}
          play={autoplay}
          webViewProps={{
            allowsInlineMediaPlayback: true,
            mediaPlaybackRequiresUserAction: false,
            style: { backgroundColor: 'transparent' },
          }}
          webViewStyle={{
            opacity: 0.99,
            backgroundColor: '#000',
          }}
          initialPlayerParams={{
            controls: true,
            modestbranding: true,
            rel: false,
            preventFullScreen: false,
            cc_lang_pref: 'en',
            iv_load_policy: 3,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  videoWrapper: {
    flex: 1,
    backgroundColor: '#000',
  },
});
