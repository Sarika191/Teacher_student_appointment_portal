import { auth, db } from './firebase-config.js';
import {
  collection, getDocs, doc, getDoc, deleteDoc, addDoc, serverTimestamp, query, where
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';


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
        const studentName = userData.name || "Student";
        setWelcomeMessage(studentName);
      } else {
        setWelcomeMessage("Student");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setWelcomeMessage("Student");
    }
  } else {
    window.location.href = "login.html";
  }
});

let studentEmail = "";
let studentName = "";

const departmentSelect = document.getElementById("departmentSelect");
const teacherSelect = document.getElementById("selectedTeacher");
const appointmentTimeInput = document.getElementById("appointmentTime");
const purposeInput = document.getElementById("purpose");
const form = document.getElementById("appointmentForm");
const appointmentList = document.getElementById("appointmentList");

// ✅ Set min datetime for calendar input
function setMinAppointmentDateTime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // adjust to local timezone
  const localNow = now.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:MM"
  appointmentTimeInput.min = localNow;
}
window.addEventListener("DOMContentLoaded", setMinAppointmentDateTime);

// ✨ Custom Alert
function showCustomAlert(message) {
  const alertBox = document.getElementById("custom-alert");
  const alertMsg = document.getElementById("custom-alert-msg");
  alertMsg.textContent = message;
  alertBox.classList.remove("hidden");
}
window.closeCustomAlert = function () {
  document.getElementById("custom-alert").classList.add("hidden");
};

// 🔒 Auth Check & Load
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      alert("User data not found.");
      signOut(auth);
      window.location.href = "login.html";
      return;
    }

    const data = userDoc.data();
    if (data.role !== "student") {
      alert("Only students are allowed here.");
      signOut(auth);
      window.location.href = "login.html";
      return;
    }

    if (data.status !== "done") {
      alert("Your account is not approved yet.");
      signOut(auth);
      window.location.href = "login.html";
      return;
    }

    studentEmail = data.email;
    studentName = data.name;

    loadDepartmentsAndTeachers();
    loadAppointments();
  } else {
    window.location.href = "login.html";
  }
});

// 🔥 Load Departments & Teachers
async function loadDepartmentsAndTeachers() {
  const snapshot = await getDocs(collection(db, "teachers"));
  const departments = new Set();
  const teachersByDept = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    departments.add(data.department);
    if (!teachersByDept[data.department]) {
      teachersByDept[data.department] = [];
    }
    teachersByDept[data.department].push(data.name);
  });

  departments.forEach(dep => {
    const option = document.createElement("option");
    option.value = dep;
    option.textContent = dep;
    departmentSelect.appendChild(option);
  });

  departmentSelect.addEventListener("change", () => {
    teacherSelect.innerHTML = `<option value="" disabled selected>Select Teacher</option>`;
    const selectedDep = departmentSelect.value;
    if (teachersByDept[selectedDep]) {
      teacherSelect.disabled = false;
      teachersByDept[selectedDep].forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        teacherSelect.appendChild(option);
      });
    }
  });
}

// ✨ Book Appointment
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const department = departmentSelect.value;
  const teacherName = teacherSelect.value;
  const appointmentTime = appointmentTimeInput.value;
  const purpose = purposeInput.value;

  if (!department || !teacherName || !appointmentTime || !purpose) {
    showCustomAlert("Please fill in all the fields.");
    return;
  }

  try {
    const teachersSnapshot = await getDocs(collection(db, "teachers"));
    const matchedTeacher = teachersSnapshot.docs.find(doc =>
      doc.data().name === teacherName && doc.data().department === department
    );

    if (!matchedTeacher) {
      showCustomAlert("Selected teacher not found.");
      return;
    }

    const teacherData = matchedTeacher.data();

    await addDoc(collection(db, "appointments"), {
      department,
      teacher: teacherData.name,
      teacherEmail: teacherData.email,
      studentName,
      studentEmail,
      appointmentTime,
      purpose,
      createdAt: serverTimestamp(),
      createdBy: "student",
      status: "pending"
    });

    showCustomAlert("Appointment booked successfully!");
    form.reset();
    teacherSelect.disabled = true;
    loadAppointments();

  } catch (err) {
    console.error("Error booking appointment:", err);
    showCustomAlert("Failed to book appointment. Please try again.");
  }
});

// ✨ Load Appointments for logged-in student
async function loadAppointments() {
  appointmentList.innerHTML = "";

  try {
    const q = query(
      collection(db, "appointments"),
      where("studentEmail", "==", studentEmail)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      appointmentList.innerHTML = `<tr><td colspan="5">No appointments found.</td></tr>`;
      return;
    }

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const appointmentId = docSnap.id;

      let teacherAvailable = false;

      try {
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        const matchedTeacher = teachersSnapshot.docs.find(
          (doc) =>
            doc.data().email === data.teacherEmail &&
            doc.data().name === data.teacher
        );

        if (matchedTeacher && matchedTeacher.data().status === "approved") {
          teacherAvailable = true;
        }
      } catch (err) {
        console.error("Error checking teacher availability:", err);
      }

      if (data.status !== "Completed") {
        const row = document.createElement("tr");

        let actionColumn = "";

        if (data.status === "pending" && data.createdBy === "student") {
          actionColumn = `
            ${!teacherAvailable ? `<span style="color:red; font-size: 13px;">Faculty Not Available</span><br>` : ""}
            <button class="deleteBtn" data-id="${appointmentId}">Delete</button>
          `;
        } else {
          if (!teacherAvailable) {
            actionColumn = `
              <span style="color:red; font-size: 14px;">Faculty Not Available</span><br><br>
              <button class="deleteBtn" data-id="${appointmentId}">Delete</button>
            `;
          } else {
            actionColumn = `<span style="color:gray;">${data.status === "approved" ? "Approved" : "Pending"}</span>`;
          }
        }

        row.innerHTML = `
          <td>${data.department}</td>
          <td>${data.teacher}</td>
          <td>${new Date(data.appointmentTime).toLocaleString([], {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}</td>
          <td>${data.purpose}</td>
          <td>${actionColumn}</td>
        `;

        appointmentList.appendChild(row);
      }
    }

    document.querySelectorAll(".deleteBtn").forEach(button => {
      button.addEventListener("click", async () => {
        const id = button.getAttribute("data-id");
        if (confirm("Are you sure you want to delete this appointment?")) {
          try {
            await deleteDoc(doc(db, "appointments", id));
            showCustomAlert("Appointment deleted.");
            loadAppointments();
          } catch (err) {
            console.error("Error deleting appointment:", err);
            showCustomAlert("Error deleting appointment.");
          }
        }
      });
    });

  } catch (err) {
    console.error("Failed to load appointments:", err);
    appointmentList.innerHTML = `<tr><td colspan="5">Error loading appointments.</td></tr>`;
  }
}
