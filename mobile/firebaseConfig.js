import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // ← burası eklendi

const firebaseConfig = {
  apiKey: "AIzaSyBZDzMWxLQp74uAPkDAM8Ah1xXPIDlPtn0",
  authDomain: "dokai-8b7f8.firebaseapp.com",
  projectId: "dokai-8b7f8",
  storageBucket: "dokai-8b7f8.appspot.com", // ← düzeltildi
  messagingSenderId: "714102904963",
  appId: "1:714102904963:web:036492be33121e6ea7e3b6",
};

const app = initializeApp(firebaseConfig);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
const storage = getStorage(app); // ← burası eklendi

export { auth, db, storage }; // ← storage dışa aktarıldı
