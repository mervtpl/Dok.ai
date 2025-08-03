// En üstte importlar
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

// Sabit listeler
const ALL_PODCASTS = [
  { hastalik: 'tansiyon', url: 'https://yourstorage.com/tansiyon.mp3' },
  { hastalik: 'diyabet', url: 'https://yourstorage.com/diyabet.mp3' },
  { hastalik: 'kalp krizi', url: 'https://yourstorage.com/kalpkrizi.mp3' },
  { hastalik: 'kemik erimesi', url: 'https://yourstorage.com/kemikerimesi.mp3' },
];

const ALL_CATEGORIES = [
  'tansiyon', 'diyabet', 'kalp krizi', 'kemik erimesi', 'astım', 'migren', 'anemi',
  'bronşit', 'gut', 'uyku apnesi', 'alerji', 'psikoloji', 'beslenme', 'egzersiz',
  'kanser', 'stres', 'karaciğer hastalığı', 'böbrek hastalığı',
];

export default function PodcastScreen() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [hastaliklar, setHastaliklar] = useState([]);
  const [newHastalik, setNewHastalik] = useState('');
  const [podcastList, setPodcastList] = useState([]);
  const [selectedHastalik, setSelectedHastalik] = useState(null);
  const [favorites, setFavorites] = useState([]);

  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingSound, setIsLoadingSound] = useState(false);

  const [gununPodcast] = useState(() => {
    const randomIndex = Math.floor(Math.random() * ALL_PODCASTS.length);
    return ALL_PODCASTS[randomIndex];
  });
  const [gununSound, setGununSound] = useState(null);
  const [gununPlaying, setGununPlaying] = useState(false);
  const [gununLoading, setGununLoading] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          const userHastaliklar = data.hastalik || [];
          const userFavorites = data.favorites || [];

          setHastaliklar(userHastaliklar);
          setFavorites(userFavorites);

          const list = [];
          for (const h of userHastaliklar) {
            const podcastDoc = await getDoc(doc(db, 'podcasts', h.toLowerCase()));
            if (podcastDoc.exists()) {
              list.push({ hastalik: h, url: podcastDoc.data().url });
            }
          }
          setPodcastList(list);
          if (list.length > 0) setSelectedHastalik(list[0].hastalik);
        } else {
          Alert.alert('Hata', 'Kullanıcı verisi bulunamadı!');
        }
      } catch (e) {
        Alert.alert('Hata', 'Veriler yüklenirken hata oluştu.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      if (sound) sound.unloadAsync();
      if (gununSound) gununSound.unloadAsync();
    };
  }, []);

  const toggleGununPodcast = async () => {
    try {
      setGununLoading(true);
      if (gununSound && gununPlaying) {
        await gununSound.pauseAsync();
        setGununPlaying(false);
        setGununLoading(false);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      if (!gununSound) {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: gununPodcast.url },
          { shouldPlay: true }
        );
        setGununSound(newSound);
        setGununPlaying(true);
        newSound.setOnPlaybackStatusUpdate(status => {
          if (!status.isPlaying) setGununPlaying(false);
        });
      } else {
        await gununSound.playAsync();
        setGununPlaying(true);
      }
      setGununLoading(false);
    } catch (e) {
      Alert.alert('Hata', 'Günün podcasti oynatılamadı.');
      console.error(e);
      setGununLoading(false);
    }
  };

  const toggleHastalikPlayback = async (hastalik) => {
    try {
      setIsLoadingSound(true);

      if (gununSound) {
        await gununSound.pauseAsync();
        setGununPlaying(false);
      }

      if (sound && selectedHastalik !== hastalik) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      if (sound && selectedHastalik === hastalik) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
        setIsLoadingSound(false);
        return;
      }

      const podcast = podcastList.find(p => p.hastalik === hastalik);
      if (!podcast) {
        Alert.alert('Uyarı', 'Seçilen hastalığa ait podcast bulunamadı.');
        setIsLoadingSound(false);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: podcast.url },
        { shouldPlay: true }
      );
      setSound(newSound);
      setIsPlaying(true);
      setSelectedHastalik(hastalik);
      newSound.setOnPlaybackStatusUpdate(status => {
        if (!status.isPlaying) setIsPlaying(false);
      });
      setIsLoadingSound(false);
    } catch (e) {
      Alert.alert('Hata', 'Podcast oynatılamadı.');
      console.error(e);
      setIsLoadingSound(false);
    }
  };

  const addHastalik = async () => {
    const trimmed = newHastalik.trim().toLowerCase();
    if (!trimmed) {
      Alert.alert('Uyarı', 'Lütfen geçerli bir hastalık adı girin.');
      return;
    }
    if (hastaliklar.includes(trimmed)) {
      Alert.alert('Uyarı', 'Bu hastalık zaten mevcut.');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        hastalik: arrayUnion(trimmed),
      });

      setHastaliklar([...hastaliklar, trimmed]);

      const podcastDoc = await getDoc(doc(db, 'podcasts', trimmed));
      if (podcastDoc.exists()) {
        setPodcastList([...podcastList, { hastalik: trimmed, url: podcastDoc.data().url }]);
      }

      setNewHastalik('');
    } catch (e) {
      Alert.alert('Hata', 'Hastalık eklenirken sorun oluştu.');
      console.error(e);
    }
  };

  const removeHastalik = (hastalik) => {
    Alert.alert(
      'Hastalık Sil',
      `${hastalik.charAt(0).toUpperCase() + hastalik.slice(1)} hastalığını silmek istediğine emin misin?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                hastalik: arrayRemove(hastalik),
              });
              setHastaliklar(hastaliklar.filter(h => h !== hastalik));
              setPodcastList(podcastList.filter(p => p.hastalik !== hastalik));

              if (selectedHastalik === hastalik) {
                const kalan = hastaliklar.filter(h => h !== hastalik);
                setSelectedHastalik(kalan.length > 0 ? kalan[0] : null);

                if (sound) {
                  await sound.unloadAsync();
                  setSound(null);
                  setIsPlaying(false);
                }
              }
            } catch (e) {
              Alert.alert('Hata', 'Hastalık silinirken hata oluştu.');
              console.error(e);
            }
          },
        },
      ]
    );
  };

  const toggleFavorite = async (hastalik) => {
    try {
      const userRef = doc(db, 'users', user.uid);

      if (favorites.includes(hastalik)) {
        await updateDoc(userRef, {
          favorites: arrayRemove(hastalik),
        });
        setFavorites(favorites.filter(f => f !== hastalik));
      } else {
        await updateDoc(userRef, {
          favorites: arrayUnion(hastalik),
        });
        setFavorites([...favorites, hastalik]);
      }
    } catch (e) {
      Alert.alert('Hata', 'Favori güncellenirken bir hata oluştu.');
      console.error(e);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  const renderHastalikItem = ({ item }) => {
    const isSelected = item === selectedHastalik;
    const isFavorite = favorites.includes(item);

    return (
      <View style={[styles.hastalikCard, isSelected && styles.hastalikCardSelected]}>
        <Text style={[styles.hastalikText, isSelected && { color: '#fff' }]}>
          {item.charAt(0).toUpperCase() + item.slice(1)}
        </Text>
        <View style={styles.cardButtons}>
          <TouchableOpacity
            onPress={() => toggleFavorite(item)}
            style={[styles.favoriteButton, isFavorite ? styles.favoriteActive : null]}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isSelected ? '#fff' : (isFavorite ? '#fff' : '#1e90ff')}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => toggleHastalikPlayback(item)}
            style={styles.playPauseButton}
          >
            {isSelected && isLoadingSound ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons
                name={isSelected && isPlaying ? 'pause-circle' : 'play-circle'}
                size={32}
                color={isSelected ? '#fff' : '#1e90ff'}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => removeHastalik(item)} style={styles.deleteButton}>
            <MaterialIcons name="delete" size={24} color={isSelected ? '#fff' : '#ff5555'} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderCategoryItem = ({ item }) => (
    <View style={styles.categoryCard}>
      <Text style={styles.categoryText}>{item.charAt(0).toUpperCase() + item.slice(1)}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.header}>🎧 Günün Podcasti</Text>
      <View style={styles.playerBox}>
        <Ionicons name="ios-podcast" size={60} color="#1e90ff" />
        <View style={{ flex: 1, marginLeft: 20 }}>
          <Text style={styles.selectedTitle}>
            {gununPodcast.hastalik.charAt(0).toUpperCase() + gununPodcast.hastalik.slice(1)}
          </Text>
          <TouchableOpacity
            style={[styles.playButton, gununPlaying ? styles.pauseButton : null]}
            onPress={toggleGununPodcast}
          >
            {gununLoading ? (
              <ActivityIndicator color="#fff" style={{ marginRight: 6 }} />
            ) : (
              <>
                <Ionicons
                  name={gununPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#fff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.playButtonText}>{gununPlaying ? 'Durdur' : 'Oynat'}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Kategoriler</Text>
      <FlatList
        data={ALL_CATEGORIES}
        keyExtractor={(item) => item}
        renderItem={renderCategoryItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 15, paddingLeft: 5 }}
        style={{ maxHeight: 60, marginBottom: 20 }}
      />

      <Text style={styles.sectionTitle}>Hastalıklarım</Text>
      <FlatList
        data={hastaliklar}
        keyExtractor={(item) => item}
        renderItem={renderHastalikItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Henüz hastalık eklenmedi.</Text>}
        contentContainerStyle={{ paddingBottom: 10 }}
        style={{ maxHeight: 280 }}
      />

      <View style={styles.addContainer}>
        <TextInput
          placeholder="Yeni hastalık ekle"
          value={newHastalik}
          onChangeText={setNewHastalik}
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="done"
          onSubmitEditing={addHastalik}
        />
        <TouchableOpacity style={styles.addButton} onPress={addHastalik}>
          <Ionicons name="add-circle" size={40} color="#1e90ff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f6fb', paddingHorizontal: 20, paddingTop: 70 },
  header: { fontSize: 34, fontWeight: 'bold', color: '#1e90ff', marginBottom: 20, textAlign: 'center' },
  playerBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d6e4ff', borderRadius: 20, padding: 25, marginBottom: 20, shadowColor: '#1e90ff', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  selectedTitle: { fontSize: 24, fontWeight: '700', marginBottom: 14, color: '#1a1a1a' },
  playButton: { flexDirection: 'row', backgroundColor: '#1e90ff', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 40, alignItems: 'center', justifyContent: 'center', width: 130 },
  pauseButton: { backgroundColor: '#104e8b' },
  playButtonText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  sectionTitle: { fontSize: 22, fontWeight: '700', color: '#1e90ff', marginBottom: 12 },
  hastalikCard: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 14, borderRadius: 16, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#aaa', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  hastalikCardSelected: { backgroundColor: '#1e90ff' },
  hastalikText: { fontSize: 18, fontWeight: '600', color: '#333' },
  cardButtons: { flexDirection: 'row', alignItems: 'center' },
  favoriteButton: { marginRight: 16 },
  favoriteActive: {},
  playPauseButton: { marginRight: 16 },
  deleteButton: {},
  categoryCard: { backgroundColor: '#e6f0ff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, marginRight: 10, justifyContent: 'center', alignItems: 'center', minWidth: 100 },
  categoryText: { color: '#1e90ff', fontWeight: '700', fontSize: 16 },
  addContainer: { marginTop: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { backgroundColor: '#fff', flex: 1, height: 50, paddingHorizontal: 20, fontSize: 18, borderRadius: 15, marginRight: 15, borderColor: '#1e90ff', borderWidth: 1 },
  emptyText: { color: '#999', fontSize: 16, fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
});
