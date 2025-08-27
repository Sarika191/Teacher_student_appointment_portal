import { db } from './firebase-config.js';
import {
  collection, query, where, getDocs, getDoc,
  updateDoc, deleteDoc, doc, setDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/* ------------------- CUSTOM ALERT ------------------- */
function showCustomAlert(message) {
  const alertBox = document.getElementById('custom-alert');
  const alertMsg = document.getElementById('custom-alert-msg');
  alertMsg.textContent = message;
  alertBox.classList.remove('hidden');
  setTimeout(() => alertBox.classList.add('hidden'), 7000);
}
window.closeCustomAlert = () => {
  document.getElementById('custom-alert').classList.add('hidden');
};
/* --------------------------------------------- */

async function loadPendingTeachers() {
  const tableBody = document.getElementById("pendingTeacherList");
  tableBody.innerHTML = "";

  const q = query(
    collection(db, "users"),
    where("role", "==", "teacher"),
    where("status", "==", "pending")
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    tableBody.innerHTML = `<tr><td colspan="3">No pending teachers found.</td></tr>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.email}</td>
      <td class="action-buttons">
        <button class="approveBtn" data-id="${docSnap.id}">Approve</button>
        <button class="rejectBtn" data-id="${docSnap.id}">Reject</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  attachActionHandlers();
}

function attachActionHandlers() {
  // Approve teacher
  document.querySelectorAll(".approveBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          showCustomAlert("Teacher not found.");
          return;
        }

        const data = userSnap.data();

        // ✅ Update status for teacher ONLY
        await updateDoc(userRef, { status: "approved" });

        // ✅ Add/update teachers collection
        await setDoc(doc(db, "teachers", uid), {
          name: data.name || "",
          email: data.email || "",
          department: data.department || "",
          subject: data.subject || "",
          uid: uid,
          status: "approved"
        });

        showCustomAlert(`Teacher ${data.name} approved successfully!`);
        loadPendingTeachers();

      } catch (err) {
        console.error("Approval error:", err);
        showCustomAlert("Failed to approve teacher.");
      }
    });
  });

  // Reject teacher
  document.querySelectorAll(".rejectBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");
      const confirmDelete = confirm("Are you sure you want to reject and delete this teacher?");
      if (!confirmDelete) return;

      try {
        await deleteDoc(doc(db, "users", uid));
        await deleteDoc(doc(db, "teachers", uid)).catch(() => {});
        showCustomAlert("Teacher rejected and removed.");
        loadPendingTeachers();
      } catch (err) {
        console.error("Deletion error:", err);
        showCustomAlert("Failed to reject teacher.");
      }
    });
  });
}

// Initial load
loadPendingTeachers();
