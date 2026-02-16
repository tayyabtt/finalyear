/* eslint-disable react-native/no-inline-styles */
// app/(vendor)/dashboard.tsx - Full Featured Vendor Dashboard

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Booking, getVendorBookings } from '../../utils/bookings';
import { getVendorData } from '../../utils/storage';

const { width } = Dimensions.get('window');

export default function VendorDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [vendorData, setVendorData] = useState<any>(null);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, messages: 0, rating: 0, reviews: 0, views: 0, responseRate: 0 });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Booking[]>([]);
  const [earnings, setEarnings] = useState({ total: 0, thisMonth: 0, pending: 0 });

  useFocusEffect(useCallback(() => { loadDashboardData(); }, [user]));

  const loadDashboardData = async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      const data = await getVendorData();
      setVendorData(data);
      const bookings = await getVendorBookings(user.uid);
      const pending = bookings.filter(b => b.status === 'pending');
      const accepted = bookings.filter(b => b.status === 'accepted');
      // Count past accepted bookings as completed
      const now = new Date();
      const completedCount = accepted.filter(b => new Date(b.eventDate) < now).length;
      const upcoming = accepted.filter(b => new Date(b.eventDate) >= now).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()).slice(0, 3);
      
      setStats({
        pending: pending.length,
        active: accepted.length,
        completed: completedCount,
        messages: bookings.length,
        rating: data?.rating || 0,
        reviews: data?.reviewCount || 0,
        views: data?.profileViews || 0,
        responseRate: bookings.length > 0 ? Math.round(((accepted.length) / bookings.length) * 100) : 0,
      });
      setUpcomingEvents(upcoming);
      setEarnings({ total: (accepted.length + completedCount) * 25000, thisMonth: accepted.length * 25000, pending: pending.length * 25000 });
      
      // Build recent activity
      const activity: any[] = [];
      pending.slice(0, 2).forEach(b => activity.push({ type: 'request', title: `New request from ${b.userName}`, time: b.createdAt, icon: 'mail', color: '#ef4444' }));
      accepted.slice(0, 2).forEach(b => activity.push({ type: 'booking', title: `Booking confirmed: ${b.userName}`, time: b.createdAt, icon: 'checkmark-circle', color: '#10b981' }));
      setRecentActivity(activity.slice(0, 4));
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  const timeAgo = (d: string) => { const diff = Date.now() - new Date(d).getTime(); const mins = Math.floor(diff / 60000); if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#7c26ff', '#5a17d6', '#3d0f99']} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome back 👋</Text>
            <Text style={styles.businessName}>{vendorData?.businessName || 'Your Business'}</Text>
            <View style={styles.serviceTag}>
              <Ionicons name="briefcase" size={12} color="#fff" />
              <Text style={styles.serviceType}>{vendorData?.serviceType || 'Service Provider'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Ionicons name="notifications" size={24} color="#fff" />
            {stats.pending > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{stats.pending}</Text></View>}
          </TouchableOpacity>
        </View>
        <View style={styles.headerStats}>
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{stats.rating > 0 ? stats.rating.toFixed(1) : '-'}</Text>
            <View style={styles.stars}>{[1,2,3,4,5].map(i => <Ionicons key={i} name={i <= Math.floor(stats.rating) ? 'star' : 'star-outline'} size={12} color="#fbbf24" />)}</View>
            <Text style={styles.headerStatLabel}>Rating</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{stats.reviews}</Text>
            <Text style={styles.headerStatLabel}>Reviews</Text>
          </View>
          <View style={styles.headerStatDivider} />
          <View style={styles.headerStat}>
            <Text style={styles.headerStatValue}>{stats.responseRate}%</Text>
            <Text style={styles.headerStatLabel}>Response</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadDashboardData} tintColor="#7c26ff" />}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: '#fef2f2' }]} onPress={() => router.push('/(vendor)/requests')}>
            <View style={[styles.statIcon, { backgroundColor: '#fee2e2' }]}><Ionicons name="mail" size={20} color="#ef4444" /></View>
            <Text style={styles.statValue}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#dcfce7' }]}><Ionicons name="calendar" size={20} color="#10b981" /></View>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <TouchableOpacity style={[styles.statCard, { backgroundColor: '#f5f3ff' }]} onPress={() => router.push('/(vendor)/inbox')}>
            <View style={[styles.statIcon, { backgroundColor: '#ede9fe' }]}><Ionicons name="chatbubbles" size={20} color="#7c26ff" /></View>
            <Text style={styles.statValue}>{stats.messages}</Text>
            <Text style={styles.statLabel}>Messages</Text>
          </TouchableOpacity>
          <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
            <View style={[styles.statIcon, { backgroundColor: '#dbeafe' }]}><Ionicons name="eye" size={20} color="#3b82f6" /></View>
            <Text style={styles.statValue}>{stats.views}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </View>
        </View>

        {/* Earnings Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earnings Overview</Text>
          <LinearGradient colors={['#1e1b4b', '#312e81']} style={styles.earningsCard}>
            <View style={styles.earningsRow}>
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Total Earned</Text>
                <Text style={styles.earningsValue}>₨{(earnings.total / 1000).toFixed(0)}K</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>This Month</Text>
                <Text style={[styles.earningsValue, { color: '#34d399' }]}>₨{(earnings.thisMonth / 1000).toFixed(0)}K</Text>
              </View>
              <View style={styles.earningsDivider} />
              <View style={styles.earningsItem}>
                <Text style={styles.earningsLabel}>Pending</Text>
                <Text style={[styles.earningsValue, { color: '#fbbf24' }]}>₨{(earnings.pending / 1000).toFixed(0)}K</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {[
              { icon: 'mail-open', label: 'Requests', color: '#ef4444', route: '/(vendor)/requests' },
              { icon: 'chatbubble-ellipses', label: 'Messages', color: '#7c26ff', route: '/(vendor)/inbox' },
              { icon: 'briefcase', label: 'Services', color: '#10b981', route: '/(vendor)/my-services' },
              { icon: 'person', label: 'Profile', color: '#3b82f6', route: '/(vendor)/profile' },
            ].map((action, i) => (
              <TouchableOpacity key={i} style={styles.actionBtn} onPress={() => router.push(action.route as any)}>
                <LinearGradient colors={[action.color, action.color + 'cc']} style={styles.actionIcon}>
                  <Ionicons name={action.icon as any} size={22} color="#fff" />
                </LinearGradient>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            {upcomingEvents.map((event, i) => (
              <View key={i} style={styles.eventCard}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDay}>{new Date(event.eventDate).getDate()}</Text>
                  <Text style={styles.eventMonth}>{new Date(event.eventDate).toLocaleDateString('en-PK', { month: 'short' })}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventName}>{event.userName}</Text>
                  <Text style={styles.eventService}>{event.serviceType}</Text>
                </View>
                <TouchableOpacity style={styles.eventChat}><Ionicons name="chatbubble" size={18} color="#7c26ff" /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityCard}>
              {recentActivity.map((item, i) => (
                <View key={i} style={[styles.activityItem, i === recentActivity.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.activityIcon, { backgroundColor: item.color + '20' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle}>{item.title}</Text>
                    <Text style={styles.activityTime}>{timeAgo(item.time)}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tips */}
        {stats.pending > 0 && (
          <View style={styles.tipCard}>
            <Ionicons name="bulb" size={24} color="#f59e0b" />
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Respond Quickly!</Text>
              <Text style={styles.tipText}>You have {stats.pending} pending requests. Quick responses increase bookings by 40%!</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingTop: 50, paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  businessName: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  serviceTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 8, alignSelf: 'flex-start' },
  serviceType: { color: '#fff', fontSize: 12, marginLeft: 4, fontWeight: '600' },
  notificationBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  notifBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#ef4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#7c26ff' },
  notifBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  headerStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: 16 },
  headerStat: { flex: 1, alignItems: 'center' },
  headerStatValue: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerStatLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
  headerStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)' },
  stars: { flexDirection: 'row', marginTop: 2 },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: (width - 42) / 2, padding: 14, borderRadius: 16 },
  statIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 2 },
  section: { marginTop: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  earningsCard: { borderRadius: 18, padding: 18 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  earningsItem: { alignItems: 'center' },
  earningsLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  earningsValue: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  earningsDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { alignItems: 'center', width: (width - 64) / 4 },
  actionIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  eventCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  eventDate: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  eventDay: { fontSize: 20, fontWeight: '800', color: '#7c26ff' },
  eventMonth: { fontSize: 11, color: '#7c26ff', fontWeight: '600' },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 15, fontWeight: '700', color: '#1e293b' },
  eventService: { fontSize: 13, color: '#64748b', marginTop: 2 },
  eventChat: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3e8ff', justifyContent: 'center', alignItems: 'center' },
  activityCard: { backgroundColor: '#fff', borderRadius: 14, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  activityItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  activityIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
  activityTime: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  tipCard: { flexDirection: 'row', backgroundColor: '#fef3c7', borderRadius: 14, padding: 14, marginTop: 20, alignItems: 'center' },
  tipContent: { flex: 1, marginLeft: 12 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#92400e' },
  tipText: { fontSize: 12, color: '#a16207', marginTop: 2, lineHeight: 18 },
});
