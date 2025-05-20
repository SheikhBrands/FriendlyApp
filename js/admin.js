// /js/admin.js
import {
  auth,
  db,
  collection,
  getDocs,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc
} from './firebase.js';

const ADMIN_UID = "YOUR_ADMIN_UID"; // Set this in Firebase

// Check if current user is admin
function checkAdmin() {
  if (auth.currentUser?.uid !== ADMIN_UID) {
    window.location.href = 'index.html';
  }
}

// Load all users
async function loadUsers() {
  const usersTable = document.getElementById('usersTable');
  const querySnapshot = await getDocs(collection(db, "users"));
  
  usersTable.innerHTML = `
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  `;
  
  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${user.displayName || 'No Name'}</td>
      <td>${user.email || 'No Email'}</td>
      <td>${user.banned ? 'Banned' : 'Active'}</td>
      <td>
        <button class="ban-btn" data-id="${user.uid}" data-status="${user.banned ? 'unban' : 'ban'}">
          ${user.banned ? 'Unban' : 'Ban'}
        </button>
      </td>
    `;
    usersTable.appendChild(row);
  });
}

// Load monetization requests
async function loadMonetizationRequests() {
  const requestsTable = document.getElementById('requestsTable');
  const q = query(collection(db, "monetizationRequests"), where("status", "==", "pending"));
  const querySnapshot = await getDocs(q);
  
  requestsTable.innerHTML = `
    <tr>
      <th>User</th>
      <th>Email</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  `;
  
  querySnapshot.forEach((doc) => {
    const request = doc.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${request.userName}</td>
      <td>${request.userEmail}</td>
      <td>${new Date(request.timestamp).toLocaleDateString()}</td>
      <td>
        <button class="approve-btn" data-id="${doc.id}">Approve</button>
        <button class="reject-btn" data-id="${doc.id}">Reject</button>
      </td>
    `;
    requestsTable.appendChild(row);
  });
}

// Handle admin actions
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('ban-btn')) {
    const userId = e.target.getAttribute('data-id');
    const action = e.target.getAttribute('data-status');
    
    await updateDoc(doc(db, "users", userId), {
      banned: action === 'ban'
    });
    
    loadUsers();
  }
  
  if (e.target.classList.contains('approve-btn')) {
    const requestId = e.target.getAttribute('data-id');
    const requestRef = doc(db, "monetizationRequests", requestId);
    const request = (await getDoc(requestRef)).data();
    
    await updateDoc(requestRef, {
      status: 'approved',
      reviewedBy: auth.currentUser.uid,
      reviewedAt: new Date()
    });
    
    await updateDoc(doc(db, "users", request.userId), {
      monetized: true
    });
    
    loadMonetizationRequests();
  }
  
  if (e.target.classList.contains('reject-btn')) {
    const requestId = e.target.getAttribute('data-id');
    const requestRef = doc(db, "monetizationRequests", requestId);
    
    await updateDoc(requestRef, {
      status: 'rejected',
      reviewedBy: auth.currentUser.uid,
      reviewedAt: new Date()
    });
    
    loadMonetizationRequests();
  }
});

// Initialize admin page
if (document.getElementById('usersTable')) {
  checkAdmin();
  loadUsers();
  loadMonetizationRequests();
}