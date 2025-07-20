import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

export default function PodcastInputScreen() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSaveTopic = async () => {
    if (!topic.trim()) {
      Alert.alert('Hata', 'Lütfen bir konu yazınız.');
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, 'topics'), {
        topic: topic.trim(),
        createdAt: new Date(),
        userId: auth.currentUser?.uid || null,
      });
      Alert.alert('Başarılı', 'Konunuz kaydedildi!');
      setTopic(''); // inputu temizle
    } catch (error) {
      Alert.alert('Hata', 'Konunuz kaydedilirken hata oluştu.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Podcast Konu Seçimi</Text>
      <TextInput
        placeholder="Migren nedir gibi..."
        value={topic}
        onChangeText={setTopic}
        style={styles.input}
      />
      <TouchableOpacity style={styles.button} onPress={handleSaveTopic} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kaydet ve Başlat</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    justifyContent:'center',
    paddingHorizontal: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize:24,
    fontWeight:'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    paddingHorizontal:15,
    paddingVertical:12,
    fontSize:16,
    marginBottom: 20,
  },
  button: {
    backgroundColor:'#1e90ff',
    paddingVertical:15,
    borderRadius:8,
    alignItems:'center',
  },
  buttonText: {
    color:'#fff',
    fontSize:18,
    fontWeight:'600',
  },
});
