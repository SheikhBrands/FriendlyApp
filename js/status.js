// /js/status.js
import {
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from './firebase.js';

// Initialize Cloudinary
const cloudinaryWidget = cloudinary.createUploadWidget({
  cloudName: 'dtk3be8md',
  uploadPreset: 'FriendlyAppStorage',
  sources: ['local', 'url', 'camera'],
  multiple: false,
  maxFileSize: 5000000, // 5MB
  resourceType: 'auto'
}, (error, result) => {
  if (!error && result && result.event === "success") {
    postStatus(result.info.secure_url, result.info.resource_type);
  }
});

// Open Cloudinary widget
document.getElementById('uploadStatusBtn').addEventListener('click', () => {
  cloudinaryWidget.open();
});

// Post a new status
async function postStatus(mediaUrl, mediaType) {
  try {
    await addDoc(collection(db, "statuses"), {
      userId: auth.currentUser.uid,
      userPhoto: auth.currentUser.photoURL || 'assets/default-profile.png',
      userName: auth.currentUser.displayName || 'User',
      mediaUrl,
      mediaType,
      timestamp: serverTimestamp(),
      likes: [],
      dislikes: [],
      views: []
    });
  } catch (error) {
    console.error("Error posting status:", error);
  }
}

// Load all statuses
function loadStatuses() {
  const statusesContainer = document.getElementById('statusesContainer');
  const q = query(collection(db, "statuses"), orderBy("timestamp", "desc"));
  
  onSnapshot(q, (snapshot) => {
    statusesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const status = doc.data();
      displayStatus(status, doc.id);
    });
  });
}

// Display a status
function displayStatus(status, statusId) {
  const statusesContainer = document.getElementById('statusesContainer');
  const statusElement = document.createElement('div');
  statusElement.className = 'status-item';
  
  let mediaContent = '';
  if (status.mediaType === 'image') {
    mediaContent = `<img src="${status.mediaUrl}" alt="Status Image">`;
  } else if (status.mediaType === 'video') {
    mediaContent = `<video controls><source src="${status.mediaUrl}" type="video/mp4"></video>`;
  } else {
    mediaContent = `<div class="text-status">${status.mediaUrl}</div>`;
  }
  
  const isLiked = status.likes.includes(auth.currentUser.uid);
  const isDisliked = status.dislikes.includes(auth.currentUser.uid);
  
  statusElement.innerHTML = `
    <div class="status-header">
      <img src="${status.userPhoto}" alt="${status.userName}">
      <span>${status.userName}</span>
    </div>
    <div class="status-content">${mediaContent}</div>
    <div class="status-actions">
      <button class="like-btn ${isLiked ? 'active' : ''}" data-id="${statusId}">
        Like (${status.likes.length})
      </button>
      <button class="dislike-btn ${isDisliked ? 'active' : ''}" data-id="${statusId}">
        Dislike (${status.dislikes.length})
      </button>
      <span class="views">Views: ${status.views.length}</span>
    </div>
  `;
  
  statusesContainer.appendChild(statusElement);
  
  // Track view if not already viewed
  if (!status.views.includes(auth.currentUser.uid)) {
    updateDoc(doc(db, "statuses", statusId), {
      views: arrayUnion(auth.currentUser.uid)
    });
  }
}

// Handle like/dislike
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('like-btn')) {
    const statusId = e.target.getAttribute('data-id');
    const statusRef = doc(db, "statuses", statusId);
    const status = (await getDoc(statusRef)).data();
    
    if (status.likes.includes(auth.currentUser.uid)) {
      await updateDoc(statusRef, {
        likes: arrayRemove(auth.currentUser.uid)
      });
    } else {
      await updateDoc(statusRef, {
        likes: arrayUnion(auth.currentUser.uid),
        dislikes: arrayRemove(auth.currentUser.uid)
      });
    }
  }
  
  if (e.target.classList.contains('dislike-btn')) {
    const statusId = e.target.getAttribute('data-id');
    const statusRef = doc(db, "statuses", statusId);
    const status = (await getDoc(statusRef)).data();
    
    if (status.dislikes.includes(auth.currentUser.uid)) {
      await updateDoc(statusRef, {
        dislikes: arrayRemove(auth.currentUser.uid)
      });
    } else {
      await updateDoc(statusRef, {
        dislikes: arrayUnion(auth.currentUser.uid),
        likes: arrayRemove(auth.currentUser.uid)
      });
    }
  }
});

// Initialize status page
if (document.getElementById('statusesContainer')) {
  loadStatuses();
}