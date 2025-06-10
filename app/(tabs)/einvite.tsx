import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    Image,
    ImageBackground,
    Share,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Modal from 'react-native-modal';
import ViewShot from 'react-native-view-shot';

const { width } = Dimensions.get('window');
const CARD_W = width * 0.7;

type Template = {
  id: string;
  title: string;
  type: 'image' | 'video';
  src: any;
};

const templates: Template[] = [
  { id: '1', title: 'Classic Floral',  type: 'image', src: { uri: 'https://picsum.photos/800/1200?random=101' } },
  { id: '2', title: 'Elegant Minimal', type: 'image', src: { uri: 'https://picsum.photos/800/1200?random=102' } },
  { id: '3', title: 'Golden Motion',   type: 'video', src: { uri: 'https://static.videezy.com/system/resources/previews/000/027/741/original/Gold_Particles_Confetti_4K_Motion_Background_Loop.mp4' } },
];

export default function EInviteScreen() {
  const router = useRouter();
  const [editorVisible, setEditorVisible] = useState(false);
  const [selected, setSelected] = useState<Template | null>(null);
  const [brideName, setBrideName] = useState('Ayesha');
  const [groomName, setGroomName] = useState('Ali');
  const [eventDate, setEventDate] = useState('21 • 12 • 2025');
  const shotRef = useRef<ViewShot>(null);

  /* helpers */
  const openEditor = (tpl: Template) => { setSelected(tpl); setEditorVisible(true); };

  const exportInvite = async () => {
    if (!shotRef.current?.capture) return;
    const uri = await shotRef.current.capture();
    if (!uri) return;
    const dest = `${FileSystem.cacheDirectory}invite-${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: dest });
    await Share.share({ url: dest, title: 'My Digital E‑Invite' });
  };

  /* render */
  const renderCard = ({ item }: { item: Template }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => openEditor(item)}>
      {item.type === 'image' ? (
        <Image source={item.src} style={styles.cardImg} />
      ) : (
        <Video
          source={item.src}
          style={styles.cardImg}
          isLooping
          shouldPlay
          resizeMode={ResizeMode.COVER}
          isMuted
        />
      )}
      <View style={styles.cardOverlay} />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={28} color="#e22f2f" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>E‑Invite Templates</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* template list */}
      <FlatList
        data={templates}
        keyExtractor={(i) => i.id}
        renderItem={renderCard}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24 }}
      />

      {/* editor modal */}
      <Modal isVisible={editorVisible} onBackdropPress={() => setEditorVisible(false)} style={{ margin: 0, justifyContent: 'flex-end' }} backdropOpacity={0.4}>
        <View style={styles.sheet}>
          <ViewShot ref={shotRef} style={styles.previewWrap} options={{ format: 'png', quality: 1 }}>
            {selected?.type === 'image' ? (
              <ImageBackground source={selected.src} style={styles.previewImg}>
                <Text style={styles.names}>{groomName} & {brideName}</Text>
                <Text style={styles.date}>{eventDate}</Text>
              </ImageBackground>
            ) : selected?.type === 'video' ? (
              <Video source={selected.src} style={styles.previewImg} isLooping shouldPlay resizeMode={ResizeMode.COVER} isMuted />
            ) : null}
          </ViewShot>

          <View style={styles.inputsRow}>
            <TextInput value={groomName} onChangeText={setGroomName} placeholder="Groom Name" style={styles.input} />
            <TextInput value={brideName} onChangeText={setBrideName} placeholder="Bride Name" style={styles.input} />
          </View>
          <TextInput value={eventDate} onChangeText={setEventDate} placeholder="Date (DD • MM • YYYY)" style={[styles.input, { marginVertical: 8 }]} />

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportInvite}>
              <Ionicons name="share-social" size={20} color="#fff" />
              <Text style={styles.exportTxt}>Share</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setEditorVisible(false)}>
              <Ionicons name="close" size={20} color="#e22f2f" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#e22f2f' },
  card: { width: CARD_W, height: CARD_W * 1.4, marginRight: 20, borderRadius: 16, overflow: 'hidden' },
  cardImg: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  cardTitle: { position: 'absolute', bottom: 12, alignSelf: 'center', color: '#fff', fontWeight: '700', fontSize: 16 },
  sheet: { backgroundColor: '#fff', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  previewWrap: { borderRadius: 16, overflow: 'hidden' },
  previewImg: { width: '100%', height: 240, justifyContent: 'center', alignItems: 'center' },
  names: { fontSize: 26, fontWeight: '700', color: '#fff', textShadowColor: '#000', textShadowRadius: 4 },
  date: { fontSize: 18, fontWeight: '600', color: '#fff', marginTop: 6, textShadowColor: '#000', textShadowRadius: 4 },
  inputsRow: { flexDirection: 'row', marginTop: 16 },
  input: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 4 },
  actionRow: { flexDirection: 'row', marginTop: 16, alignItems: 'center', justifyContent: 'space-between' },
  exportBtn: { flexDirection: 'row', backgroundColor: '#e22f2f', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flex: 1 },
  exportTxt: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  closeBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', marginLeft: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#e22f2f' },
});