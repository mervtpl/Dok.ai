import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { getDoc, doc, updateDoc } from 'firebase/firestore';
import { Audio } from 'expo-av';
import { db } from '../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaying, setCurrentPlaying] = useState(null);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const user = getAuth().currentUser;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const favList = userSnap.data()?.favorites || [];

      const fetchedFavorites = [];
      for (const h of favList) {
        const podcastDoc = await getDoc(doc(db, 'podcasts', h.toLowerCase()));
        if (podcastDoc.exists()) {
          fetchedFavorites.push({ hastalik: h, url: podcastDoc.data().url });
        }
      }

      setFavorites(fetchedFavorites);
    } catch (error) {
      console.error('Favoriler yüklenirken hata:', error);
      Alert.alert('Hata', 'Favoriler yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchFavorites();
      // Ekran kapanırken ses varsa kapat
      return () => {
        if (sound) {
          sound.unloadAsync();
          setSound(null);
          setIsPlaying(false);
          setCurrentPlaying(null);
        }
      };
    }, [])
  );

  const playOrPause = async (item) => {
    try {
      if (currentPlaying === item.hastalik && isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: item.url });
        setSound(newSound);
        setCurrentPlaying(item.hastalik);
        setIsPlaying(true);
        await newSound.playAsync();
      }
    } catch (e) {
      Alert.alert('Hata', 'Podcast oynatılırken hata oluştu.');
      console.error(e);
    }
  };

  const removeFavorite = async (hastalik) => {
    try {
      const user = getAuth().currentUser;
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const currentFavorites = userSnap.data()?.favorites || [];

      const updatedFavorites = currentFavorites.filter((h) => h !== hastalik);
      await updateDoc(userRef, { favorites: updatedFavorites });

      setFavorites((prev) => prev.filter((f) => f.hastalik !== hastalik));

      // Eğer silinen oynatılıyorsa durdur
      if (currentPlaying === hastalik && sound) {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentPlaying(null);
      }
    } catch (error) {
      Alert.alert('Hata', 'Favori silinirken bir hata oluştu.');
      console.error(error);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>❤️ Favori Podcastlerin</Text>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.hastalik}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.hastalik}>
              {item.hastalik.charAt(0).toUpperCase() + item.hastalik.slice(1)}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => playOrPause(item)}
                style={[styles.button, styles.playButton]}
              >
                <Text style={styles.buttonText}>
                  {currentPlaying === item.hastalik && isPlaying ? 'Durdur' : 'Oynat'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeFavorite(item.hastalik)}
                style={[styles.button, styles.deleteButton]}
              >
                <Text style={styles.buttonText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ marginTop: 20, textAlign: 'center', fontSize: 16, color: '#666' }}>
            Henüz favori podcast yok.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f1f6fb' },
  title: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e90ff',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#d6e4ff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#1e90ff',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  hastalik: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 40,
    marginHorizontal: 6,
  },
  playButton: {
    backgroundColor: '#1e90ff',
  },
  deleteButton: {
    backgroundColor: '#ff5555',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});
