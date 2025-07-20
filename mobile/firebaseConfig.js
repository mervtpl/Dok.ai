import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyBZDzMWxLQp74uAPkDAM8Ah1xXPIDlPtn0",
  authDomain: "dokai-8b7f8.firebaseapp.com",
  projectId: "dokai-8b7f8",
  storageBucket: "dokai-8b7f8.firebasestorage.app",
  messagingSenderId: "714102904963",
  appId: "1:714102904963:web:036492be33121e6ea7e3b6",
  measurementId: "G-5F55CC1QJT"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
const db = getFirestore(app);

export { auth, db };
