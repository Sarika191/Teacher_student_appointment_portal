// teacher.js

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

/* ------------------- CUSTOM CENTER ALERT ------------------- */
function showCustomAlert(message) {
  document.getElementById('custom-alert-msg').textContent = message;
  document.getElementById('custom-alert').classList.remove('hidden');

  // Optional auto-hide after 3 seconds
  setTimeout(() => {
    document.getElementById('custom-alert').classList.add('hidden');
  }, 7000);
}

function closeCustomAlert() {
  document.getElementById('custom-alert').classList.add('hidden');
}
window.closeCustomAlert = closeCustomAlert;
// ----------------------------------------------------------------

const studentSelect = document.getElementById("studentSelect");
const scheduleForm = document.getElementById("scheduleForm");
const pendingList = document.getElementById("pendingAppointments");
const allList = document.getElementById("allAppointments");

let currentTeacher = null;

// Auth
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const docRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      currentTeacher = docSnap.data();
      loadApprovedStudents();
      loadAppointmentsForTeacher();
    } else {
      showCustomAlert("Teacher profile not found.");
    }
  } else {
    window.location.href = "index.html";
  }
});

// Load students
async function loadApprovedStudents() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "student"),
    where("status", "==", "done")
  );

  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const data = doc.data();
    const option = document.createElement("option");
    option.value = data.email;
    option.textContent = `${data.name} (${data.email})`;
    option.setAttribute("data-name", data.name);
    studentSelect.appendChild(option);
  });
}

// Schedule appointment
scheduleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!currentTeacher) {
    showCustomAlert("Please wait, teacher info is loading.");
    return;
  }

  const appointmentTime = document.getElementById("appointmentTime").value;
  const purpose = document.getElementById("purpose").value;
  const studentEmail = studentSelect.value;
  const studentName = studentSelect.options[studentSelect.selectedIndex].getAttribute("data-name");

  try {
    await addDoc(collection(db, "appointments"), {
      appointmentTime,
      createdAt: Timestamp.now(),
      department: currentTeacher.department,
      purpose,
      studentEmail,
      studentName,
      teacher: currentTeacher.name,
      teacherEmail: currentTeacher.email,
      status: "pending",
      createdBy: "teacher"
    });

    showCustomAlert("Appointment scheduled successfully!");
    scheduleForm.reset();
    loadAppointmentsForTeacher();
  } catch (err) {
    console.error("Error adding appointment:", err);
    showCustomAlert("Something went wrong.");
  }
});

// Load appointments
async function loadAppointmentsForTeacher() {
  const q = query(
    collection(db, "appointments"),
    where("teacherEmail", "==", currentTeacher.email)
  );

  const snapshot = await getDocs(q);

  pendingList.innerHTML = "";
  allList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;

    if (data.status === "pending" || data.status === "approved") {
      const row = createAppointmentRow(data, id, true);
      pendingList.appendChild(row);
    }

    const allRow = createAppointmentRow(data, id, false);
    allList.appendChild(allRow);
  });
}

// Create row
function createAppointmentRow(data, id, withAction) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${data.studentName}</td>
    <td>${data.studentEmail}</td>
    <td>${data.purpose}</td>
    <td>${new Date(data.appointmentTime).toLocaleString([], {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })}</td>
    <td><span class="cell-content">${data.status}</span></td>
  `;

  const actionTd = document.createElement("td");
  const buttonWrapper = document.createElement("div");
  buttonWrapper.className = "action-buttons";

  // Show approve button only if createdBy is not teacher
  if (withAction && data.status === "pending" && data.createdBy !== "teacher") {
    const approveBtn = document.createElement("button");
    approveBtn.textContent = "Approve";
    approveBtn.className = "action-btn updateBtn";
    approveBtn.onclick = () => updateAppointmentStatus(id, "approved");
    buttonWrapper.appendChild(approveBtn);
  }

  // Show complete button in all pending/approved cases
  if (withAction && data.status !== "Completed") {
    const completeBtn = document.createElement("button");
    completeBtn.textContent = "Complete";
    completeBtn.className = "action-btn updateBtn";
    completeBtn.onclick = () => updateAppointmentStatus(id, "Completed");
    buttonWrapper.appendChild(completeBtn);
  }

  actionTd.appendChild(buttonWrapper);

  if (!withAction) {
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "action-btn deleteBtn";
    deleteBtn.onclick = () => deleteAppointment(id);
    actionTd.appendChild(deleteBtn);
  }

  row.appendChild(actionTd);
  return row;
}

// Update status
async function updateAppointmentStatus(appointmentId, status) {
  try {
    const ref = doc(db, "appointments", appointmentId);
    await updateDoc(ref, { status });
    showCustomAlert(`Appointment marked as ${status}.`);
    loadAppointmentsForTeacher();
  } catch (err) {
    console.error("Error updating appointment:", err);
    showCustomAlert("Failed to update appointment.");
  }
}

// Delete
async function deleteAppointment(appointmentId) {
  if (confirm("Are you sure you want to delete this appointment?")) {
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      showCustomAlert("Appointment deleted successfully.");
      loadAppointmentsForTeacher();
    } catch (err) {
      console.error("Error deleting appointment:", err);
      showCustomAlert("Failed to delete appointment.");
    }
  }
}

// Prevent past time
function setMinAppointmentTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const localNow = now.toISOString().slice(0, 16);
  const appointmentInput = document.getElementById("appointmentTime");
  if (appointmentInput) {
    appointmentInput.min = localNow;
  }
}

window.addEventListener("DOMContentLoaded", setMinAppointmentTime);

// Logout
window.logout = function () {
  signOut(auth)
    .then(() => {
      window.location.href = "index.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
      showCustomAlert("Could not logout.");
    });
};
