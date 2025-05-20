// /js/monetize.js
import {
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from './firebase.js';

// Load follower count and monetization status
async function loadMonetizationData() {
  if (!auth.currentUser) return;
  
  // Get follower count
  const followersQuery = query(collection(db, "follows"), where("followingId", "==", auth.currentUser.uid));
  const followersSnapshot = await getDocs(followersQuery);
  const followerCount = followersSnapshot.size;
  
  document.getElementById('followerCount').textContent = followerCount;
  
  // Check if already applied
  const monetizationQuery = query(collection(db, "monetizationRequests"), where("userId", "==", auth.currentUser.uid));
  const monetizationSnapshot = await getDocs(monetizationQuery);
  
  const applyBtn = document.getElementById('applyMonetizationBtn');
  if (monetizationSnapshot.size > 0) {
    applyBtn.disabled = true;
    applyBtn.textContent = 'Application Pending';
  } else if (followerCount < 10000) {
    applyBtn.disabled = true;
    applyBtn.textContent = 'Need 10,000 Followers';
  } else {
    applyBtn.disabled = false;
    applyBtn.textContent = 'Apply for Monetization';
  }
}

// Apply for monetization
document.getElementById('applyMonetizationBtn')?.addEventListener('click', async () => {
  try {
    await addDoc(collection(db, "monetizationRequests"), {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'User',
      userEmail: auth.currentUser.email,
      timestamp: new Date(),
      status: 'pending',
      reviewedBy: null
    });
    alert('Application submitted successfully!');
    loadMonetizationData();
  } catch (error) {
    console.error("Error applying for monetization:", error);
    alert('Failed to submit application.');
  }
});

// Initialize monetization page
if (document.getElementById('followerCount')) {
  loadMonetizationData();
}