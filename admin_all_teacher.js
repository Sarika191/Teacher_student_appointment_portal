import { db, auth } from './firebase-config.js';
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, updateDoc, getDoc, setDoc, query, where
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

import {
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';

/* ------------------- CUSTOM CENTER ALERT ------------------- */
function showCustomAlert(message) {
  document.getElementById('custom-alert-msg').textContent = message;
  document.getElementById('custom-alert').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('custom-alert').classList.add('hidden');
  }, 7000);
}

function closeCustomAlert() {
  document.getElementById('custom-alert').classList.add('hidden');
}
window.closeCustomAlert = closeCustomAlert;
/* ------------------------------------------------------------ */

const teacherForm = document.getElementById('addTeacherForm');
const teacherList = document.getElementById('teacherList');

teacherForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('teacherName').value.trim();
  const department = document.getElementById('department').value.trim();
  const subject = document.getElementById('subject').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!name || !department || !subject || !email || !password) {
    showCustomAlert("Please fill all fields.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      role: "teacher",
      department,
      subject,
      status: "approved"
    });

    await setDoc(doc(db, 'teachers', user.uid), {
      name,
      department,
      subject,
      email,
      uid: user.uid
    });

    showCustomAlert("Teacher added and account created.");
    teacherForm.reset();
    loadTeachers();

  } catch (err) {
    console.error("Error:", err);
    showCustomAlert("Failed to add teacher: " + err.message);
  }
});

async function loadTeachers() {
  teacherList.innerHTML = "";

  const usersRef = collection(db, 'users');
  const q = query(usersRef, where("role", "==", "teacher"), where("status", "==", "approved"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    teacherList.innerHTML = `<tr><td colspan="4">No approved teacher found.</td></tr>`;
    return;
  }

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><div class="cell-content">${data.name}</div></td>
      <td><div class="cell-content">${data.department}</div></td>
      <td><div class="cell-content">${data.subject}</div></td>
      <td>
        <div class="action-buttons">
          <button class="deleteBtn" data-uid="${docSnap.id}">Delete</button>
          <button class="updateBtn" data-uid="${docSnap.id}">Update</button>
        </div>
      </td>
    `;
    teacherList.appendChild(row);
  });

  addTeacherEventListeners();
}

function addTeacherEventListeners() {
  document.querySelectorAll('.deleteBtn').forEach(button => {
    button.addEventListener('click', async () => {
      const uid = button.dataset.uid;
      if (confirm("Are you sure you want to delete this teacher?")) {
        try {
          await deleteDoc(doc(db, 'users', uid));
          await deleteDoc(doc(db, 'teachers', uid));
          showCustomAlert("Teacher deleted.");
          loadTeachers();
        } catch (err) {
          console.error("Delete error:", err);
          showCustomAlert("Failed to delete teacher.");
        }
      }
    });
  });

  document.querySelectorAll('.updateBtn').forEach(button => {
    button.addEventListener('click', async () => {
      const uid = button.dataset.uid;
      const field = prompt("Which field you want to update? (name/department/subject)").toLowerCase();
      if (!['name', 'department', 'subject'].includes(field)) {
        showCustomAlert("Invalid field.");
        return;
      }
      const newValue = prompt(`Enter new ${field}:`);
      if (!newValue) {
        showCustomAlert("Value cannot be empty.");
        return;
      }

      try {
        await updateDoc(doc(db, 'users', uid), { [field]: newValue });
        await updateDoc(doc(db, 'teachers', uid), { [field]: newValue });

        const q = query(collection(db, 'appointments'), where('teacherUid', '==', uid));
        const snap = await getDocs(q);

        const updateTasks = [];
        snap.forEach(docSnap => {
          updateTasks.push(updateDoc(doc(db, 'appointments', docSnap.id), {
            [field === 'name' ? 'teacher' : 'department']: newValue
          }));
        });

        await Promise.all(updateTasks);

        showCustomAlert("Updated successfully and reflected in appointments.");
        loadTeachers();
      } catch (err) {
        console.error("Update error:", err);
        showCustomAlert("Failed to update teacher.");
      }
    });
  });
}

loadTeachers();
