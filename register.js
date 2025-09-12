import { auth, db } from './firebase-config.js';
import { createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { doc, setDoc, Timestamp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { logAction } from './log.js';

document.getElementById('registerForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value.trim().toLowerCase();

  let department = "";
  let subject = "";

  if (role === 'teacher') {
    department = document.getElementById('department').value.trim();
    subject = document.getElementById('subject').value.trim();

    if (!department || !subject) {
      alert("Please fill department and subject for teacher.");
      return;
    }
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userData = {
      name,
      email,
      role,
      createdAt: Timestamp.now()
    };

    if (role === 'teacher') {
      userData.department = department;
      userData.subject = subject;
      userData.status = 'approved';
    }

    if (role === 'student') {
      userData.status = 'pending';
    }

    // Save to /users
    await setDoc(doc(db, 'users', user.uid), userData);

    // Save to /teachers if teacher
    if (role === 'teacher') {
      try {
        await setDoc(doc(db, 'teachers', user.uid), {
          name,
          department,
          subject,
          email,
          uid: user.uid,
          createdAt: Timestamp.now(),
          status: 'approved'
        });
      } catch (e) {
        alert("Teacher registered in users, but failed in /teachers: " + e.message);
        logAction("TEACHER_DOC_FAILED", `Teacher doc error for ${email}: ${e.message}`);
        return;
      }
    }

    alert(`Registration successful! Redirecting as ${role}...`);
    setTimeout(() => {
      if (role === 'student') window.location.href = 'student.html';
      else if (role === 'teacher') window.location.href = 'teacher.html';
      else if (role === 'admin') window.location.href = 'admin.html';
    }, 1000);

  } catch (error) {
    let errorMessage = "Registration failed!";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "This email is already in use.";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password is too weak.";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Invalid email address.";
    }

    logAction("REGISTER_FAILED", `Failed to register ${email}: ${error.message}`);
    alert(errorMessage);
  }
});



