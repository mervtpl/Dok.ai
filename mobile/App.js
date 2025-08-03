import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import PodcastScreen from './screens/PodcastsScreen';
import ProfileScreen from './screens/ProfileScreen';
import FavoritesScreen from './screens/FavoriteScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, justifyContent: 'space-between' }}>
      <View>
        <TouchableOpacity
          style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
          onPress={() => props.navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle-outline" size={28} color="#1e90ff" />
          <Text style={{ marginLeft: 10, fontSize: 18, color: '#1e90ff' }}>Profil</Text>
        </TouchableOpacity>

        <DrawerItem
          label="Podcastlar"
          onPress={() => props.navigation.navigate('Podcast')}
          icon={({ color, size }) => <Ionicons name="ios-podcast-outline" size={size} color={color} />}
        />

        <DrawerItem
          label="Favorilerim"
          onPress={() => props.navigation.navigate('Favorites')}
          icon={({ color, size }) => <Ionicons name="heart-outline" size={size} color={color} />}
        />
      </View>

      <DrawerItem
        label="Çıkış Yap"
        onPress={() => {
          // Burada auth.signOut() vs yapılabilir
          props.navigation.replace('Login');
        }}
        icon={({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />}
      />
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerActiveTintColor: '#1e90ff',
        drawerLabelStyle: { fontWeight: '700' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Podcast" component={PodcastScreen} options={{ title: 'Podcastlar' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profilim' }} />
      <Drawer.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorilerim' }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        {/* Ana sayfa giriş / kayıt */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />

        {/* Drawer içeriği */}
        <Stack.Screen name="MainApp" component={DrawerNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
