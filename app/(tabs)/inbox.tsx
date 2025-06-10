// app/(tabs)/inbox.tsx  – Conversation list ➜ Chat view toggle
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

/* ───────── types ───────── */
interface Conversation {
  id: string;
  title: string;
  preview: string;
  unread?: boolean;
}
interface ChatMsg {
  id: string;
  text: string;
  from: 'me' | 'other';
  time: string;
}

/* ───────── seed data ───────── */
const conversations: Conversation[] = [
  { id: 'venue',   title: 'VenueX',    preview: 'Hi! Venue is available on…', unread: true },
  { id: 'makeup',  title: 'MakeupPro', preview: 'Trial makeup slot on 12th' },
  { id: 'planner', title: 'PlannerCo', preview: 'Meeting tomorrow at 3 PM' },
];

const seedMsgs: Record<string, ChatMsg[]> = {
  venue: [
    { id: '1', text: 'Hi! Thanks for reaching out – venue is available on your date.', from: 'other', time: '10:00' },
    { id: '2', text: 'Great! Could you send me the pricing details?',                  from: 'me',    time: '10:02' },
    { id: '3', text: 'Sure, attaching our latest package now. ✨',                     from: 'other', time: '10:03' },
  ],
  makeup: [],
  planner: [],
};

/* ───────── component ───────── */
export default function InboxScreen() {
  const router = useRouter();

  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages,   setMessages]   = useState<ChatMsg[]>([]);
  const [input,      setInput]      = useState('');
  const listRef = useRef<FlatList>(null);

  /* load messages when a conversation opens */
  const openChat = (conv: Conversation) => {
    setActiveConv(conv);
    setMessages(seedMsgs[conv.id] || []);
  };

  /* auto-scroll on new messages */
  useEffect(() => { listRef.current?.scrollToEnd({ animated: true }); }, [messages]);

  /* demo auto-reply */
  const fakeReply = () => {
    setTimeout(() => {
      const reply: ChatMsg = {
        id: Date.now() + '-r',
        text: 'Got it! Let me know if you have more questions. 😊',
        from: 'other',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: ChatMsg = {
      id: Date.now().toString(),
      text: input.trim(),
      from: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    fakeReply();
  };

  /* ── renderers ── */
  const renderConv = ({ item }: { item: Conversation }) => (
    <TouchableOpacity style={styles.convRow} activeOpacity={0.8} onPress={() => openChat(item)}>
      <View style={styles.avatarSmall} />
      <View style={{ flex: 1 }}>
        <Text style={styles.convTitle}>{item.title}</Text>
        <Text style={styles.convPreview}>{item.preview}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderBubble = ({ item }: { item: ChatMsg }) => {
    const isMe = item.from === 'me';
    return (
      <View style={[styles.bubbleRow, isMe && { justifyContent: 'flex-end' }]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={[styles.bubbleTxt, isMe && { color: '#fff' }]}>{item.text}</Text>
          <Text style={[styles.time, isMe && { color: '#eee' }]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  /* ───────── UI ───────── */
  if (!activeConv) {
    /* Conversation LIST view */
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.headerList}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={28} color="#e22f2f" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Inbox</Text>
          <View style={{ width: 28 }} />
        </View>

        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderConv}
          contentContainerStyle={{ padding: 16 }}
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        />
      </View>
    );
  }

  /* Chat view */
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.headerChat}>
        <TouchableOpacity onPress={() => setActiveConv(null)}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{activeConv.title}</Text>
        <View style={{ width: 28 }} />
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderBubble}
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
      />

      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message"
          style={styles.input}
          multiline
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  /* headers */
  headerList: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  headerChat: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#333' },

  /* conversation row */
  convRow: { flexDirection: 'row', alignItems: 'center' },
  avatarSmall: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ccc', marginRight: 12 },
  convTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  convPreview: { fontSize: 13, color: '#777', marginTop: 2 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#e22f2f' },

  /* chat bubbles */
  bubbleRow: { flexDirection: 'row', marginBottom: 12 },
  bubble: {
    maxWidth: '75%', padding: 12, borderRadius: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, shadowOffset: { width: 0, height: 2 },
  },
  bubbleMe:     { backgroundColor: '#e22f2f', borderBottomRightRadius: 0 },
  bubbleOther:  { backgroundColor: '#f1f1f1', borderBottomLeftRadius: 0 },
  bubbleTxt:    { fontSize: 15, color: '#333' },
  time:         { fontSize: 11, color: '#888', marginTop: 4, alignSelf: 'flex-end' },

  /* input bar */
  inputBar: {
    flexDirection: 'row', alignItems: 'center', padding: 10,
    borderTopWidth: 1, borderTopColor: '#ddd', backgroundColor: '#fff',
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  input: { flex: 1, fontSize: 15, maxHeight: 120 },
  sendBtn: {
    backgroundColor: '#e22f2f', padding: 10, borderRadius: 24,
    marginLeft: 8, justifyContent: 'center', alignItems: 'center',
  },
});
