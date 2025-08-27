import { auth } from './firebase-config.js';
import { sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();

  const actionCodeSettings = {
    url: 'https://student-teacher-appointm-1f44f.firebaseapp.com/reset.html',
    handleCodeInApp: true
  };

  try {
    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    alert("Reset link sent! Check your email.");
  } catch (error) {
    alert("Error: " + error.message);
  }
});
