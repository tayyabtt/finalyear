// app/(tabs)/inbox.tsx – Real chat list from Firestore
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { Chat, getUserChats } from '../../utils/bookings';

export default function InboxScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    
    loadChats();
    // Refresh chats every 5 seconds
    const interval = setInterval(loadChats, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const loadChats = async () => {
    if (!user) {
      setChats([]);
      setLoading(false);
      return;
    }
    
    try {
      const userChats = await getUserChats(user.uid, false);
      setChats(userChats.sort((a, b) => 
        new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      ));
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const openChat = (chat: Chat) => {
    router.push(`/chat?chatId=${chat.id}&vendorName=${chat.vendorName}`);
  };

  const renderChat = ({ item }: { item: Chat }) => (
    <TouchableOpacity 
      style={styles.convRow} 
      activeOpacity={0.8} 
      onPress={() => openChat(item)}
    >
      <View style={styles.avatarSmall}>
        <Ionicons name="business" size={24} color="#e22f2f" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.convTitle}>{item.vendorName}</Text>
        <Text style={styles.convPreview} numberOfLines={1}>
          {item.lastMessage || 'Start a conversation'}
        </Text>
      </View>
      {item.unreadCount > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <View style={styles.headerList}>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity onPress={loadChats}>
          <Ionicons name="refresh" size={24} color="#e22f2f" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Start chatting with vendors from their profile
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  convRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffe4e6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  convPreview: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#e22f2f',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 8,
    textAlign: 'center',
  },
});
