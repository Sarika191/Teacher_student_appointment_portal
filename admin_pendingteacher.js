// admin_pendingteacher.js

import { db } from './firebase-config.js';
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/* ------------------- ALERT ------------------- */
function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  alertMsg.textContent = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => {
    alertBox.classList.add('hidden');
  }, 7000);
}
window.closeCustomAlert = () => {
  document.getElementById('custom-alert').classList.add('hidden');
};
/* --------------------------------------------- */

async function loadPendingTeachers() {
  const tableBody = document.getElementById("pendingTeacherList");
  tableBody.innerHTML = "";

  const q = query(collection(db, "users"), where("role", "==", "teacher"), where("status", "==", "pending"));
  const snapshot = await getDocs(q);

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.email}</td>
      <td class="action-buttons">
        <button class="updateBtn" data-id="${docSnap.id}">Approve</button>
        <button class="rejectBtn" data-id="${docSnap.id}">Reject</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachActionHandlers();
}

function attachActionHandlers() {
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          showCustomAlert("User not found.");
          return;
        }

        const data = userSnap.data();

 
        await updateDoc(userRef, { status: "approved" });


        await setDoc(doc(db, "teachers", uid), {
          name: data.name,
          department: data.department,
          subject: data.subject,
          email: data.email,
          uid: uid,
          status:'approved'
        });

        showCustomAlert("Teacher approved!!\nReload to see update");
        loadPendingTeachers();

      } catch (err) {
        console.error("Approval error:", err);
        showCustomAlert("Failed to approve teacher.");
      }
    });
  });

  document.querySelectorAll(".rejectBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");
      const confirmDelete = confirm("Are you sure you want to reject and delete this teacher?");
      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, "users", uid));
          showCustomAlert("Teacher rejected and removed.");
          loadPendingTeachers();
        } catch (err) {
          console.error("Deletion error:", err);
          showCustomAlert("Failed to reject teacher.");
        }
      }
    });
  });
}

loadPendingTeachers();
