import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig'; // firebaseConfig.js dosyanın doğru yolu

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Email ve şifre giriniz!');
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert('Başarılı', 'Kayıt işlemi tamamlandı!');
      navigation.replace('Podcast'); // Kayıttan sonra Podcast ekranına yönlendir
    } catch (error) {
      Alert.alert('Hata', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Kayıt Ol</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.loginText}>Zaten hesabın var mı? Giriş Yap</Text>
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
    fontSize:28,
    fontWeight:'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth:1,
    borderColor:'#ccc',
    borderRadius:8,
    paddingHorizontal:15,
    paddingVertical:12,
    fontSize:16,
    marginBottom:20,
  },
  button: {
    backgroundColor:'#1e90ff',
    paddingVertical:15,
    borderRadius:8,
    alignItems:'center',
    marginBottom: 20,
  },
  buttonText: {
    color:'#fff',
    fontSize:18,
    fontWeight:'600',
  },
  loginText: {
    color:'#555',
    fontSize:16,
    textAlign:'center',
  }
});
