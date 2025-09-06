import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAJmIeTJCgdoSTGgy3ZXERBPZZdvm08pWc",
  authDomain: "kitsu-school.firebaseapp.com",
  projectId: "kitsu-school",
  storageBucket: "kitsu-school.firebasestorage.app",
  messagingSenderId: "746054368423",
  appId: "1:746054368423:web:ca67e717b8c84ca678af82"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
