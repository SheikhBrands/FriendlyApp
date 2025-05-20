// /js/auth.js
import {
  auth,
  googleProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  db,
  doc,
  setDoc
} from './firebase.js';

// Email/Password Login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'chat.html';
  } catch (error) {
    console.error("Login Error:", error);
    alert(error.message);
  }
});

// Email/Password Registration
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirmPassword = document.getElementById('regConfirmPassword').value;

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: name,
      email: user.email,
      photoURL: user.photoURL || 'assets/default-profile.png',
      createdAt: new Date(),
      online: true
    });
    
    window.location.href = 'chat.html';
  } catch (error) {
    console.error("Registration Error:", error);
    alert(error.message);
  }
});

// Google Sign-In
const googleSignInBtn = document.getElementById('googleSignIn') || document.getElementById('googleSignUp');
googleSignInBtn?.addEventListener('click', async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save Google user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL || 'assets/default-profile.png',
      createdAt: new Date(),
      online: true
    });
    
    window.location.href = 'chat.html';
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    alert(error.message);
  }
});

// Sign Out
document.getElementById('signOutBtn')?.addEventListener('click', async () => {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error("Sign Out Error:", error);
  }
});

// Auth State Observer
onAuthStateChanged(auth, (user) => {
  const authButtons = document.getElementById('authButtons');
  const userProfile = document.getElementById('userProfile');
  
  if (user) {
    // User is signed in
    if (authButtons) authButtons.style.display = 'none';
    if (userProfile) userProfile.style.display = 'flex';
    
    // Update profile info
    const userProfilePic = document.getElementById('userProfilePic');
    const userName = document.getElementById('userName');
    
    if (userProfilePic) userProfilePic.src = user.photoURL || 'assets/default-profile.png';
    if (userName) userName.textContent = user.displayName || 'User';
    
    // Redirect away from auth pages if logged in
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('index.html')) {
      window.location.href = 'chat.html';
    }
  } else {
    // User is signed out
    if (authButtons) authButtons.style.display = 'flex';
    if (userProfile) userProfile.style.display = 'none';
    
    // Redirect to login if on protected page
    if (!window.location.pathname.includes('index.html') && 
        !window.location.pathname.includes('login.html')) {
      window.location.href = 'index.html';
    }
  }
});