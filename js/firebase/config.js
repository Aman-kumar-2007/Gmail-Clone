import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8bV1DAOR0wpeQoAZ2LfwcjrXHkAcUkLw",
  authDomain: "clone-1c862.firebaseapp.com",
  projectId: "clone-1c862",
  storageBucket: "clone-1c862.firebasestorage.app",
  messagingSenderId: "302393459063",
  appId: "1:302393459063:web:43719ebe1dd1be30d62172",
  measurementId: "G-MP5EYQZY8W"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
