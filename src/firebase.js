import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// ─────────────────────────────────────────────
// PASTE YOUR FIREBASE CONFIG HERE
// 1. Go to https://console.firebase.google.com
// 2. Create a project → Add web app
// 3. Copy the firebaseConfig object below
// ─────────────────────────────────────────────
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
