import { auth, db } from './firebase-config.js';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

const welcomeHeading = document.getElementById("studentWelcome");

function setWelcomeMessage(name) {
  if (welcomeHeading) {
    welcomeHeading.innerHTML = `Welcome, <span>${name}</span>`;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const studentName = userData.name || "Teacher";
        setWelcomeMessage(studentName);
      } else {
        setWelcomeMessage("Teacher");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setWelcomeMessage("Teacher");
    }
  } else {
    window.location.href = "login.html";
  }
});
