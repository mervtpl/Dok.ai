import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';

const kronikHastaliklarListesi = [
  'Diyabet',
  'Tansiyon',
  'Kalp Krizi',
  'Kemik Erimesi',
  'Astım',
  'Alerji',
  'Kanser',
  'Diğer',
];

const ilgiAlanlariListesi = [
  'Beslenme',
  'Psikoloji',
  'Egzersiz',
  'Meditasyon',
  'Uyku',
  'Diğer',
];

const saglikSeviyeleri = ['Yeni Başlayan', 'Orta', 'İleri'];

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [yas, setYas] = useState('');
  const [cinsiyet, setCinsiyet] = useState('');
  const [kronikHastaliklar, setKronikHastaliklar] = useState([]);
  const [ilgiAlanlari, setIlgiAlanlari] = useState([]);
  const [gunlukHedefler, setGunlukHedefler] = useState('');
  const [saglikSeviyesi, setSaglikSeviyesi] = useState(saglikSeviyeleri[0]);

  const toggleSelect = (item, list, setList) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

const register = async () => {
  if (!email || !password) {
    Alert.alert('Hata', 'Email ve şifre gerekli');
    return;
  }
  if (!yas || !cinsiyet) {
    Alert.alert('Hata', 'Yaş ve cinsiyet bilgileri zorunlu');
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    await setDoc(doc(db, 'users', uid), {
      profile: {
        yas: Number(yas),
        cinsiyet,
        kronikHastaliklar,
        ilgiAlanlari,
        gunlukHedefler,
        saglikSeviyesi,
      },
      hastalik: kronikHastaliklar.map(h => h.toLowerCase()),
      favoriler: [],  // <-- boş favoriler dizisi başlatıldı
    });

    Alert.alert('Başarılı', 'Kayıt tamamlandı');
    navigation.replace('MainApp');

  } catch (error) {
    Alert.alert('Hata', error.message);
    console.error(error);
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.flexOne}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Kayıt Ol</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          maxLength={40}
        />

        <TextInput
          placeholder="Şifre"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          maxLength={30}
        />

        <TextInput
          placeholder="Yaş"
          value={yas}
          onChangeText={setYas}
          keyboardType="numeric"
          style={styles.input}
          maxLength={3}
        />

        <Text style={styles.label}>Cinsiyet</Text>
        <View style={styles.row}>
          {['Erkek', 'Kadın', 'Diğer'].map(gender => (
            <TouchableOpacity
              key={gender}
              style={[
                styles.optionButton,
                cinsiyet === gender && styles.optionButtonSelected,
              ]}
              onPress={() => setCinsiyet(gender)}
            >
              <Text
                style={[
                  styles.optionText,
                  cinsiyet === gender && styles.optionTextSelected,
                ]}
              >
                {gender}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Kronik Hastalıklar (İsteğe bağlı)</Text>
        <View style={styles.rowWrap}>
          {kronikHastaliklarListesi.map(h => (
            <TouchableOpacity
              key={h}
              style={[
                styles.optionButton,
                kronikHastaliklar.includes(h) && styles.optionButtonSelected,
              ]}
              onPress={() => toggleSelect(h, kronikHastaliklar, setKronikHastaliklar)}
            >
              <Text
                style={[
                  styles.optionText,
                  kronikHastaliklar.includes(h) && styles.optionTextSelected,
                ]}
              >
                {h}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>İlgi Alanları (İsteğe bağlı)</Text>
        <View style={styles.rowWrap}>
          {ilgiAlanlariListesi.map(i => (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionButton,
                ilgiAlanlari.includes(i) && styles.optionButtonSelected,
              ]}
              onPress={() => toggleSelect(i, ilgiAlanlari, setIlgiAlanlari)}
            >
              <Text
                style={[
                  styles.optionText,
                  ilgiAlanlari.includes(i) && styles.optionTextSelected,
                ]}
              >
                {i}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Günlük Sağlık Hedefleri (İsteğe bağlı)</Text>
        <TextInput
          placeholder="Kısa hedefinizi yazın"
          value={gunlukHedefler}
          onChangeText={setGunlukHedefler}
          style={[styles.input, { height: 50 }]}
          multiline={false}
          maxLength={100}
        />

        <Text style={styles.label}>Sağlık Bilgi Seviyesi</Text>
        <View style={styles.row}>
          {saglikSeviyeleri.map(level => (
            <TouchableOpacity
              key={level}
              style={[
                styles.optionButton,
                saglikSeviyesi === level && styles.optionButtonSelected,
              ]}
              onPress={() => setSaglikSeviyesi(level)}
            >
              <Text
                style={[
                  styles.optionText,
                  saglikSeviyesi === level && styles.optionTextSelected,
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.registerButton} onPress={register}>
          <Text style={styles.registerButtonText}>Kayıt Ol</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
    backgroundColor: '#f1f6fb',
  },
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e90ff',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#e4e9f7',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#c2c9f3',
    minWidth: 70,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#1e90ff',
    borderColor: '#1e90ff',
  },
  optionText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 12,
  },
  optionTextSelected: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 20,
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
});
