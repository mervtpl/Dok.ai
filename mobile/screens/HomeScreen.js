import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.jpeg')} // Logonun yolunu kontrol et
        style={styles.logo}
        resizeMode="contain"
      />

      <TouchableOpacity 
        style={styles.loginButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.loginButtonText}>Giriş Yap</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.signupText}>
          Hesabın yok mu? <Text style={styles.signupLink}>Kayıt Ol</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex:1,
    backgroundColor: '#fff',
    justifyContent:'center',
    alignItems:'center',
    paddingHorizontal: 30,
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 50,
  },
  loginButton: {
    backgroundColor: '#1e90ff',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 20,
    elevation: 3,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  signupText: {
    fontSize: 16,
    color: '#555',
  },
  signupLink: {
    color: '#1e90ff',
    fontWeight: '600',
  },
});
