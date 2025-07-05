import { auth, db } from './firebase-config.js';
import {
  doc, setDoc
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

let currentUID = null;

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUID = user.uid;
    document.getElementById('email').value = user.email;
    document.getElementById('email').disabled = true;
  } else {
    alert("Please sign in first to recover your account.");
    window.location.href = "login.html";
  }
});

function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  alertMsg.textContent = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 5000);
}
window.closeCustomAlert = () => {
  document.getElementById('custom-alert').classList.add('hidden');
};

document.getElementById("recoverTeacherForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("teacherName").value.trim();
  const department = document.getElementById("department").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!name || !department || !subject || !email) {
    showCustomAlert("Please fill all fields.");
    return;
  }

  if (!currentUID) {
    showCustomAlert("No user signed in. Please login first.");
    return;
  }

  try {
    // Save recovery request as pending
    await setDoc(doc(db, "users", currentUID), {
      name,
      email,
      department,
      subject,
      role: "teacher",
      status: "pending"
    });
   

    showCustomAlert("Recovery request sent. Wait for admin approval.");
    document.getElementById("recoverTeacherForm").reset();
  } catch (err) {
    console.error("Recovery error:", err);
    showCustomAlert("Error during recovery.");
  }
});
