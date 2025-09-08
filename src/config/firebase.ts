import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "demo-api-key",
  authDomain: "gold-bar-tally.firebaseapp.com",
  projectId: "gold-bar-tally",
  storageBucket: "gold-bar-tally.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);