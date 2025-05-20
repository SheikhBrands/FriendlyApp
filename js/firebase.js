// /js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

 const firebaseConfig = {
    apiKey: "AIzaSyAKZ6QMgNM6KRb6o9FDBpFuFfhLkQsLwOA",
    authDomain: "friendlyapp-8a129.firebaseapp.com",
    projectId: "friendlyapp-8a129",
    storageBucket: "friendlyapp-8a129.firebasestorage.app",
    messagingSenderId: "1091385734679",
    appId: "1:1091385734679:web:b53bb19efa059203fb8e52",
    measurementId: "G-D5SNQ5PHSD"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { 
  auth,
  db,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc
};