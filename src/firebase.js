import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBIgD5mNjlKEsw8n_Kg48WasJ1grvzSp44",
  authDomain: "day-by-day-71e88.firebaseapp.com",
  projectId: "day-by-day-71e88",
  storageBucket: "day-by-day-71e88.firebasestorage.app",
  messagingSenderId: "19821920879",
  appId: "1:19821920879:web:b0e581768770c41489839a"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Persist auth session in localStorage so it survives page reloads and redirects
setPersistence(auth, browserLocalPersistence).catch(() => {});
