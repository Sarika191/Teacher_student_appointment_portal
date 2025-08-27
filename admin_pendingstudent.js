import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  getDoc,
  deleteDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

/* ------------------- CUSTOM ALERT ------------------- */
function showCustomAlert(message) {
  document.getElementById('custom-alert-msg').textContent = message;
  document.getElementById('custom-alert').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('custom-alert').classList.add('hidden');
  }, 7000);
}
window.closeCustomAlert = () => {
  document.getElementById('custom-alert').classList.add('hidden');
};
/* ---------------------------------------------------- */

const pendingStudentList = document.getElementById("pendingStudentList");

/* ------------------- FETCH PENDING STUDENTS ------------------- */
async function fetchPendingStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    pendingStudentList.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const student = docSnap.data();
      const id = docSnap.id;

      if (student.role === "student" && student.status === "pending") {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td class="action-buttons">
            <button class="updateBtn" data-id="${id}">Approve</button>
            <button class="rejectBtn" data-id="${id}">Reject</button>
          </td>
        `;

        pendingStudentList.appendChild(row);
      }
    });

    attachActionHandlers();

    if (pendingStudentList.innerHTML.trim() === "") {
      pendingStudentList.innerHTML = `<tr><td colspan="3">No pending students found.</td></tr>`;
    }

  } catch (err) {
    console.error("Error fetching pending students:", err);
    showCustomAlert("Error loading students.");
  }
}

/* ------------------- ACTION HANDLERS ------------------- */
function attachActionHandlers() {
  // Approve Student
  document.querySelectorAll(".updateBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");

      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          showCustomAlert("Student not found.");
          return;
        }

        const studentData = userSnap.data();

        // Update status in "users" → done
        await updateDoc(userRef, { status: "done" });

        // Add to "students" collection
        await setDoc(doc(db, "students", uid), {
          name: studentData.name || "",
          email: studentData.email || "",
          role: "student",
          status: "done"
        });

        showCustomAlert(`${studentData.name} done successfully!`);
        fetchPendingStudents();

      } catch (err) {
        console.error("Approval error:", err);
        showCustomAlert("Failed to approve student.");
      }
    });
  });

  // Reject Student (Delete from users)
  document.querySelectorAll(".rejectBtn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const uid = btn.getAttribute("data-id");
      const confirmDelete = confirm("Are you sure you want to reject and delete this student?");
      if (confirmDelete) {
        try {
          await deleteDoc(doc(db, "users", uid));
          showCustomAlert("Student rejected and removed.");
          fetchPendingStudents();
        } catch (err) {
          console.error("Deletion error:", err);
          showCustomAlert("Failed to reject student.");
        }
      }
    });
  });
}

/* ------------------- INIT ------------------- */
fetchPendingStudents();
