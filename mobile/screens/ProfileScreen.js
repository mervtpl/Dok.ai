import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { getAuth, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert('Hata', 'Kullanıcı bulunamadı.');
          navigation.goBack();
          return;
        }
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          Alert.alert('Hata', 'Kullanıcı verisi bulunamadı.');
          navigation.goBack();
        }
      } catch (e) {
        Alert.alert('Hata', 'Veri yüklenirken hata oluştu.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigation.replace('Login'); // Login ekranına geri gönder
      })
      .catch(() => {
        Alert.alert('Hata', 'Çıkış yaparken hata oluştu.');
      });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Profil Bilgilerim</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>E-posta:</Text>
        <Text style={styles.value}>{auth.currentUser.email}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Kayıtlı Hastalıklar:</Text>
        {userData?.hastalik?.length > 0 ? (
          userData.hastalik.map((h, i) => (
            <Text key={i} style={styles.value}>
              • {h.charAt(0).toUpperCase() + h.slice(1)}
            </Text>
          ))
        ) : (
          <Text style={styles.value}>Henüz hastalık eklenmedi.</Text>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f6fb',
    padding: 20,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e90ff',
    marginBottom: 30,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#d6e4ff',
    padding: 15,
    borderRadius: 16,
    marginBottom: 18,
    shadowColor: '#1e90ff',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#104e8b',
    marginBottom: 6,
  },
  value: {
    fontSize: 16,
    color: '#1a1a1a',
  },
  logoutButton: {
    marginTop: 30,
    backgroundColor: '#ff5555',
    paddingVertical: 14,
    borderRadius: 40,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
