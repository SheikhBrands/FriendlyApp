// /js/chat.js
import {
  auth,
  db,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  serverTimestamp
} from './firebase.js';

let currentChatUserId = null;

// Load all users except current user
async function loadUsers() {
  const usersList = document.getElementById('usersList');
  usersList.innerHTML = '';
  
  const q = query(collection(db, "users"), where("uid", "!=", auth.currentUser.uid));
  const querySnapshot = await getDocs(q);
  
  querySnapshot.forEach((doc) => {
    const user = doc.data();
    const userElement = document.createElement('div');
    userElement.className = 'user-item';
    userElement.innerHTML = `
      <img src="${user.photoURL || 'assets/default-profile.png'}" alt="${user.displayName}">
      <span>${user.displayName}</span>
      <span class="online-status ${user.online ? 'online' : 'offline'}"></span>
    `;
    userElement.addEventListener('click', () => openChat(user.uid, user.displayName, user.photoURL));
    usersList.appendChild(userElement);
  });
}

// Open chat with selected user
function openChat(userId, userName, userPhoto) {
  currentChatUserId = userId;
  document.getElementById('chatHeader').innerHTML = `
    <img src="${userPhoto || 'assets/default-profile.png'}" alt="${userName}">
    <span>${userName}</span>
  `;
  loadMessages(userId);
}

// Load messages between current user and selected user
function loadMessages(otherUserId) {
  const messagesContainer = document.getElementById('messagesContainer');
  messagesContainer.innerHTML = '';
  
  const currentUserId = auth.currentUser.uid;
  const chatId = [currentUserId, otherUserId].sort().join('_');
  
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "asc"));
  
  onSnapshot(q, (snapshot) => {
    messagesContainer.innerHTML = '';
    snapshot.forEach((doc) => {
      const message = doc.data();
      displayMessage(message);
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  });
}

// Display a message in the chat
function displayMessage(message) {
  const messagesContainer = document.getElementById('messagesContainer');
  const messageElement = document.createElement('div');
  messageElement.className = `message ${message.senderId === auth.currentUser.uid ? 'sent' : 'received'}`;
  messageElement.innerHTML = `
    <div class="message-content">${message.text}</div>
    <div class="message-time">${new Date(message.timestamp?.toDate()).toLocaleTimeString()}</div>
  `;
  messagesContainer.appendChild(messageElement);
}

// Send a new message
document.getElementById('messageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const messageInput = document.getElementById('messageInput');
  const messageText = messageInput.value.trim();
  
  if (messageText && currentChatUserId) {
    const currentUserId = auth.currentUser.uid;
    const chatId = [currentUserId, currentChatUserId].sort().join('_');
    
    await addDoc(collection(db, "chats", chatId, "messages"), {
      text: messageText,
      senderId: currentUserId,
      receiverId: currentChatUserId,
      timestamp: serverTimestamp(),
      read: false
    });
    
    messageInput.value = '';
  }
});

// Initialize chat page
if (document.getElementById('messagesContainer')) {
  loadUsers();
}