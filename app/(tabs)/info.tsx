import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

const InfoScreen: React.FC = () => {
  return (
    <LinearGradient
      colors={['#ffecd2', '#fcb69f', '#ff9a9e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={styles.heroCard}>
          <Text style={styles.title}>ShaadiSet</Text>
          <Text style={styles.subtitle}>Where dream weddings turn into reality</Text>
        </View>

        {/* Origin Story */}
        <View style={styles.card}>
          <Ionicons name="school" size={24} color="#ff8177" style={styles.icon} />
          <Text style={styles.cardTitle}>Born as a Final‑Year Project</Text>
          <Text style={styles.paragraph}>
            ShaadiSet started in 2024 as a capstone project at Riphah International University.
            What began as a simple event‑planner prototype soon captured mentors’ attention for its
            bold vision: create a one‑stop wedding ecosystem embracing South‑Asian culture, modern
            tech, and the chaos of real shaadis!
          </Text>
        </View>

        {/* Evolution */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="rocket-launch"
            size={24}
            color="#ff8177"
            style={styles.icon}
          />
          <Text style={styles.cardTitle}>Level‑Up to a Startup</Text>
          <Text style={styles.paragraph}>
            Co‑founders <Text style={styles.bold}>Tayyab Tahir</Text> &amp;{' '}
            <Text style={styles.bold}>Faizan Arshad</Text> couldn’t ignore the market pull. They
            registered ShaadiSet Pvt Ltd, onboarded seasoned advisors, and relaunched the app with a
            SaaS backbone—ready for nationwide vendor onboarding, AI‑powered planning, and instant
            booking payments.
          </Text>
        </View>

        {/* Mission & Vision */}
        <View style={styles.cardRow}>
          <View style={styles.miniCard}>
            <Ionicons name="flag" size={20} color="#fff" />
            <Text style={styles.miniTitle}>Mission</Text>
            <Text style={styles.miniText}>
              Empower couples &amp; families to plan dreamy, stress‑free weddings through intuitive
              tech and hyper‑local services.
            </Text>
          </View>
          <View style={styles.miniCard}>
            <Ionicons name="eye" size={20} color="#fff" />
            <Text style={styles.miniTitle}>Vision</Text>
            <Text style={styles.miniText}>
              Become South Asia’s #1 wedding super‑app—bridging tradition, creativity, and
              next‑gen automation.
            </Text>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Ionicons name="time" size={24} color="#ff8177" style={styles.icon} />
          <Text style={styles.cardTitle}>Milestones</Text>
          <View style={styles.timelineItem}>
            <View style={styles.bullet} />
            <Text style={styles.timelineText}>
              <Text style={styles.bold}>Apr 2024:</Text> Prototype wins departmental showcase.
            </Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.bullet} />
            <Text style={styles.timelineText}>
              <Text style={styles.bold}>Nov 2024:</Text> Beta app crosses 1 000 user sign‑ups.
            </Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.bullet} />
            <Text style={styles.timelineText}>
              <Text style={styles.bold}>Mar 2025:</Text> Seed funding secured, team expands to 12.
            </Text>
          </View>
          <View style={styles.timelineItem}>
            <View style={styles.bullet} />
            <Text style={styles.timelineText}>
              <Text style={styles.bold}>June 2025:</Text> Public launch with multi‑city vendor
              marketplace.
            </Text>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>© 2025 ShaadiSet Pvt Ltd. All rights reserved.</Text>
      </ScrollView>
    </LinearGradient>
  );
};

export default InfoScreen;

const baseRadius = 24;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 24,
    paddingBottom: 40,
  },
  heroCard: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#0006',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffeeee',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#ffffffcc',
    borderRadius: baseRadius,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  icon: {
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ff5f6d',
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4f4f4f',
  },
  bold: {
    fontWeight: 'bold',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  miniCard: {
    width: (width - 24 * 2 - 12) / 2,
    backgroundColor: '#ff8177',
    borderRadius: baseRadius,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 6,
  },
  miniText: {
    fontSize: 12,
    color: '#fff',
    marginTop: 4,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff5f6d',
    marginRight: 10,
  },
  timelineText: {
    fontSize: 13,
    color: '#555',
    flexShrink: 1,
  },
  footer: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
});
