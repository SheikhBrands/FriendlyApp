// /js/profile.js
import {
  auth,
  db,
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot
} from './firebase.js';

// DOM Elements
const profilePicture = document.getElementById('profilePicture');
const profileName = document.getElementById('profileName');
const profileEmail = document.getElementById('profileEmail');
const postCount = document.getElementById('postCount');
const followerCount = document.getElementById('followerCount');
const followingCount = document.getElementById('followingCount');
const editProfileBtn = document.getElementById('editProfileBtn');
const editProfilePicBtn = document.getElementById('editProfilePicBtn');
const editCoverBtn = document.getElementById('editCoverBtn');
const editProfileModal = document.getElementById('editProfileModal');
const closeModalBtn = document.querySelector('.close-modal');
const editProfileForm = document.getElementById('editProfileForm');
const editName = document.getElementById('editName');
const editBio = document.getElementById('editBio');
const editLocation = document.getElementById('editLocation');
const editOccupation = document.getElementById('editOccupation');
const editBirthday = document.getElementById('editBirthday');
const birthdayInfo = document.getElementById('birthdayInfo');
const locationInfo = document.getElementById('locationInfo');
const occupationInfo = document.getElementById('occupationInfo');
const bioInfo = document.getElementById('bioInfo');
const userPostsGrid = document.getElementById('userPostsGrid');
const userStatusesList = document.getElementById('userStatusesList');
const friendsGrid = document.getElementById('friendsGrid');
const navBtns = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');

// Cloudinary Widget for Profile Picture
const profilePicWidget = cloudinary.createUploadWidget({
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UPLOAD_PRESET',
  cropping: true,
  croppingAspectRatio: 1,
  croppingShowDimensions: true,
  sources: ['local', 'camera'],
  multiple: false,
  maxFileSize: 5000000, // 5MB
  resourceType: 'image'
}, (error, result) => {
  if (!error && result && result.event === "success") {
    updateProfilePicture(result.info.secure_url);
  }
});

// Cloudinary Widget for Cover Photo
const coverPhotoWidget = cloudinary.createUploadWidget({
  cloudName: 'YOUR_CLOUD_NAME',
  uploadPreset: 'YOUR_UPLOAD_PRESET',
  cropping: true,
  croppingAspectRatio: 2.5,
  croppingShowDimensions: true,
  sources: ['local'],
  multiple: false,
  maxFileSize: 5000000, // 5MB
  resourceType: 'image'
}, (error, result) => {
  if (!error && result && result.event === "success") {
    updateCoverPhoto(result.info.secure_url);
  }
});

// Load User Profile Data
async function loadProfileData() {
  const user = auth.currentUser;
  if (!user) return;

  // Load basic user info
  profilePicture.src = user.photoURL || 'assets/default-profile.png';
  profileName.textContent = user.displayName || 'User';
  profileEmail.textContent = user.email;

  // Load additional profile data from Firestore
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    
    // Update profile info
    if (userData.photoURL) {
      profilePicture.src = userData.photoURL;
    }
    if (userData.displayName) {
      profileName.textContent = userData.displayName;
    }
    if (userData.coverPhoto) {
      document.querySelector('.cover-photo').style.backgroundImage = `url(${userData.coverPhoto})`;
    }
    
    // Update about section
    if (userData.bio) bioInfo.textContent = userData.bio;
    if (userData.location) locationInfo.textContent = userData.location;
    if (userData.occupation) occupationInfo.textContent = userData.occupation;
    if (userData.birthday) {
      birthdayInfo.textContent = new Date(userData.birthday).toLocaleDateString();
    }
    
    // Populate edit form
    editName.value = userData.displayName || '';
    editBio.value = userData.bio || '';
    editLocation.value = userData.location || '';
    editOccupation.value = userData.occupation || '';
    editBirthday.value = userData.birthday || '';
  }

  // Load user posts
  loadUserPosts(user.uid);
  
  // Load user statuses
  loadUserStatuses(user.uid);
  
  // Load friends/followers
  loadFollowers(user.uid);
  loadFollowing(user.uid);
}

// Load User Posts
async function loadUserPosts(userId) {
  const postsQuery = query(collection(db, "posts"), where("userId", "==", userId));
  const querySnapshot = await getDocs(postsQuery);
  
  if (querySnapshot.empty) {
    userPostsGrid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-newspaper"></i>
        <p>No posts yet. Create your first post!</p>
      </div>
    `;
    postCount.textContent = "0";
    return;
  }
  
  postCount.textContent = querySnapshot.size.toString();
  userPostsGrid.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const post = doc.data();
    const postElement = createPostElement(post);
    userPostsGrid.appendChild(postElement);
  });
}

// Load User Statuses
async function loadUserStatuses(userId) {
  const statusesQuery = query(collection(db, "statuses"), where("userId", "==", userId));
  const querySnapshot = await getDocs(statusesQuery);
  
  if (querySnapshot.empty) {
    userStatusesList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-images"></i>
        <p>No status updates yet. Share your first status!</p>
      </div>
    `;
    return;
  }
  
  userStatusesList.innerHTML = '';
  
  querySnapshot.forEach((doc) => {
    const status = doc.data();
    const statusElement = createStatusElement(status);
    userStatusesList.appendChild(statusElement);
  });
}

// Load Followers
async function loadFollowers(userId) {
  const followersQuery = query(collection(db, "follows"), where("followingId", "==", userId));
  const querySnapshot = await getDocs(followersQuery);
  
  followerCount.textContent = querySnapshot.size.toString();
  
  if (querySnapshot.empty) return;
  
  // You could display followers here if needed
}

// Load Following
async function loadFollowing(userId) {
  const followingQuery = query(collection(db, "follows"), where("followerId", "==", userId));
  const querySnapshot = await getDocs(followingQuery);
  
  followingCount.textContent = querySnapshot.size.toString();
  
  if (querySnapshot.empty) return;
  
  // You could display following users here if needed
}

// Create Post Element
function createPostElement(post) {
  const postElement = document.createElement('div');
  postElement.className = 'post-item';
  
  let content = '';
  if (post.mediaType === 'image') {
    content = `<img src="${post.mediaUrl}" alt="Post Image">`;
  } else if (post.mediaType === 'video') {
    content = `<video controls><source src="${post.mediaUrl}" type="video/mp4"></video>`;
  } else {
    content = `<div class="post-text">${post.text}</div>`;
  }
  
  postElement.innerHTML = `
    <div class="post-content">${content}</div>
    <div class="post-meta">
      <span class="post-time">${new Date(post.timestamp?.toDate()).toLocaleString()}</span>
      <span class="post-likes">${post.likes?.length || 0} likes</span>
    </div>
  `;
  
  return postElement;
}

// Create Status Element
function createStatusElement(status) {
  const statusElement = document.createElement('div');
  statusElement.className = 'status-item';
  
  let content = '';
  if (status.mediaType === 'image') {
    content = `<img src="${status.mediaUrl}" alt="Status Image">`;
  } else if (status.mediaType === 'video') {
    content = `<video controls><source src="${status.mediaUrl}" type="video/mp4"></video>`;
  } else {
    content = `<div class="status-text">${status.mediaUrl}</div>`;
  }
  
  statusElement.innerHTML = `
    <div class="status-content">${content}</div>
    <div class="status-meta">
      <span class="status-time">${new Date(status.timestamp?.toDate()).toLocaleString()}</span>
      <span class="status-views">${status.views?.length || 0} views</span>
    </div>
  `;
  
  return statusElement;
}

// Update Profile Picture
async function updateProfilePicture(imageUrl) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    // Update in Firestore
    await updateDoc(doc(db, "users", user.uid), {
      photoURL: imageUrl
    });
    
    // Update in Auth (if needed)
    // Note: To update auth profile, you'd need to use updateProfile()
    
    // Update UI
    profilePicture.src = imageUrl;
    document.getElementById('userProfilePic').src = imageUrl;
    
    alert('Profile picture updated successfully!');
  } catch (error) {
    console.error("Error updating profile picture:", error);
    alert('Failed to update profile picture.');
  }
}

// Update Cover Photo
async function updateCoverPhoto(imageUrl) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid), {
      coverPhoto: imageUrl
    });
    
    document.querySelector('.cover-photo').style.backgroundImage = `url(${imageUrl})`;
    alert('Cover photo updated successfully!');
  } catch (error) {
    console.error("Error updating cover photo:", error);
    alert('Failed to update cover photo.');
  }
}

// Update Profile Info
async function updateProfileInfo(e) {
  e.preventDefault();
  const user = auth.currentUser;
  if (!user) return;

  try {
    await updateDoc(doc(db, "users", user.uid), {
      displayName: editName.value,
      bio: editBio.value,
      location: editLocation.value,
      occupation: editOccupation.value,
      birthday: editBirthday.value
    });
    
    // Update UI
    profileName.textContent = editName.value;
    if (editBio.value) bioInfo.textContent = editBio.value;
    if (editLocation.value) locationInfo.textContent = editLocation.value;
    if (editOccupation.value) occupationInfo.textContent = editOccupation.value;
    if (editBirthday.value) {
      birthdayInfo.textContent = new Date(editBirthday.value).toLocaleDateString();
    }
    
    editProfileModal.style.display = 'none';
    alert('Profile updated successfully!');
  } catch (error) {
    console.error("Error updating profile:", error);
    alert('Failed to update profile.');
  }
}

// Event Listeners
editProfilePicBtn.addEventListener('click', () => {
  profilePicWidget.open();
});

editCoverBtn.addEventListener('click', () => {
  coverPhotoWidget.open();
});

editProfileBtn.addEventListener('click', () => {
  editProfileModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
  editProfileModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === editProfileModal) {
    editProfileModal.style.display = 'none';
  }
});

editProfileForm.addEventListener('submit', updateProfileInfo);

// Tab Navigation
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons and sections
    navBtns.forEach(b => b.classList.remove('active'));
    contentSections.forEach(section => section.classList.remove('active'));
    
    // Add active class to clicked button and corresponding section
    btn.classList.add('active');
    const sectionId = btn.getAttribute('data-section') + 'Section';
    document.getElementById(sectionId).classList.add('active');
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadProfileData();
});