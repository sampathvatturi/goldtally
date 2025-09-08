import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// const firebaseConfig = {
  // Replace with your Firebase config
  // apiKey: "demo-api-key",
  // authDomain: "gold-bar-tally.firebaseapp.com",
  // projectId: "gold-bar-tally",
  // storageBucket: "gold-bar-tally.appspot.com",
  // messagingSenderId: "123456789",
  // appId: "1:123456789:web:abcdef123456"
// };

const firebaseConfig = {
  apiKey: "AIzaSyAYUZLX0hQQZR7crsyUfyqvRpLlG3BLkyI",
  authDomain: "gold-tally.firebaseapp.com",
  projectId: "gold-tally",
  storageBucket: "gold-tally.firebasestorage.app",
  messagingSenderId: "381315655370",
  appId: "1:381315655370:web:35b58ecd7928140c823633",
  measurementId: "G-FVJ3KB94HH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);