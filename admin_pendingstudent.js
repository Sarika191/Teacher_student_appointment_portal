import { db } from './firebase-config.js';
import {
  collection,
  getDocs,
  updateDoc,
  setDoc,
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

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

const pendingStudentList = document.getElementById("pendingStudentList");

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
          <td>
            <button class="updateBtn approveBtn" data-id="${id}">Approve</button>
          </td>
        `;

        pendingStudentList.appendChild(row);
      }
    });

    document.querySelectorAll(".approveBtn").forEach(button => {
      button.addEventListener("click", async () => {
        const userId = button.dataset.id;

        try {
          const userRef = doc(db, "users", userId);
          const userSnap = await getDoc(userRef);

          if (!userSnap.exists()) {
            showCustomAlert("Student not found.");
            return;
          }

          const studentData = userSnap.data();

          await updateDoc(userRef, { status: "approved" });

          await setDoc(doc(db, "students", userId), {
            name: studentData.name || "",
            email: studentData.email || "",
            role: "student",
            status: "approved"
          });

          showCustomAlert(`${studentData.name} approved successfully!`);
          fetchPendingStudents();
        } catch (err) {
          console.error("Approval error:", err);
          showCustomAlert("Failed to approve student.");
        }
      });
    });

    if (pendingStudentList.innerHTML.trim() === "") {
      pendingStudentList.innerHTML = `<tr><td colspan="3">No pending students found.</td></tr>`;
    }

  } catch (err) {
    console.error("Error fetching pending students:", err);
    showCustomAlert("Error loading students.");
  }
}

fetchPendingStudents();
