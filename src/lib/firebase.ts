// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAoWIcFqNHg-ov-kxsb_5GITOwZxmSnKG4",
  authDomain: "absensi-sekolah-c8dc6.firebaseapp.com",
  projectId: "absensi-sekolah-c8dc6",
  storageBucket: "absensi-sekolah-c8dc6.firebasestorage.app",
  messagingSenderId: "720032907835",
  appId: "1:720032907835:web:09973640336f21f34cd21e",
  measurementId: "G-KDE9HZY3DG",
};

// Initialize Firebase
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
