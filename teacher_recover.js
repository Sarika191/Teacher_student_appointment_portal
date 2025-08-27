import { auth, db } from './firebase-config.js';
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

let currentUID = null;

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUID = user.uid;
    const emailField = document.getElementById('email');
    if (emailField) {
      emailField.value = user.email;
      emailField.disabled = true;
    }
  } else {
    alert("Please sign in first to recover your account.");
    window.location.href = "login.html";
  }
});

// Custom alert
function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  if (!alertBox || !alertMsg) {
    alert(message); // fallback
    return;
  }
  alertMsg.textContent = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 5000);
}
window.closeCustomAlert = () => {
  const alertBox = document.getElementById('custom-alert');
  if (alertBox) alertBox.classList.add('hidden');
};

// Handle teacher recovery form
const form = document.getElementById("recoverTeacherForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("teacherName")?.value.trim();
    const department = document.getElementById("department")?.value.trim();
    const subject = document.getElementById("subject")?.value.trim();
    const email = document.getElementById("email")?.value.trim();

    if (!name || !department || !subject || !email) {
      showCustomAlert("Please fill all fields.");
      return;
    }

    if (!currentUID) {
      showCustomAlert("No user signed in. Please login first.");
      return;
    }

    try {
      const userRef = doc(db, "users", currentUID);
      const existingUserSnap = await getDoc(userRef);

      // If user exists in users collection, only update to pending for recovery
      if (existingUserSnap.exists()) {
        await setDoc(userRef, {
          name,
          email,
          department,
          subject,
          role: "teacher",
          status: "pending"
        }, { merge: true });
      } else {
        // Otherwise create new user doc
        await setDoc(userRef, {
          name,
          email,
          department,
          subject,
          role: "teacher",
          status: "pending"
        });
      }

      showCustomAlert("Recovery request sent. Wait for admin approval.");
      form.reset();
    } catch (err) {
      console.error("Recovery error:", err);
      showCustomAlert("Error during recovery.");
    }
  });
}

