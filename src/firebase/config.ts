import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { type Firestore, initializeFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function assertConfigured() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Firebase غير مُهيّأ: القيم التالية مفقودة من ملف .env — ${missing.join(', ')}. راجع docs/FIREBASE_STRUCTURE.md`
    );
  }
}

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    assertConfigured();
    app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth =
      Platform.OS === 'web'
        ? getAuth(getFirebaseApp())
        : initializeAuth(getFirebaseApp(), {
            persistence: getReactNativePersistence(AsyncStorage),
          });
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    db = initializeFirestore(getFirebaseApp(), {});
  }
  return db;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(getFirebaseApp());
  }
  return storage;
}
