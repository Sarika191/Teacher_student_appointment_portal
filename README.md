# 🧑‍🏫 Teacher-Student Appointment System

A secure and user-friendly web application that allows students to book appointments with teachers in real-time. Built with **Firebase** for authentication and database management, this project streamlines the communication process in an academic setting.
Live👉 https://teacher-student-portal.netlify.app/
---

## 📌 Features

- 🔐 **Secure Firebase Authentication**  
- 👨‍🎓 **Separate user roles** (Teacher & Student)  
- 📅 **Appointment booking and management**  
- 📊 **Real-time updates** with Firestore  
- 📱 **Responsive UI** for all devices  
- 🚫 **Restricted access** to non-authenticated users  

---

## 🛠️ Tech Stack

| Technology        | Purpose                               |
|------------------|---------------------------------------|
| HTML, CSS        | Frontend structure & styling           |
| JavaScript       | Interactivity & application logic     |
| Firebase         | Authentication & Firestore backend    |
| Netlify          | Hosting                               |

---

## 🔒 Firebase Security & API Safety

This project uses **public Firebase configuration** as required for frontend apps. All operations are protected through:

- ✅ **Authenticated access only**  
- 🔐 **Firestore security rules** (`request.auth != null`)  
- 🌐 **API key domain restrictions** (localhost & deployed domains only)  
- 💡 No private credentials are stored; Firebase keys are safe for frontend use when rules are properly implemented.

---

## 📂 Folder Structure
│
├── index.html
├── login.html
├── register.html
├── forgot-password.html
├── student.html
├── teacher.html
├── student_recover.html
├── teacher_recover.html
├── admin.html
│
├── css/
│ ├── base.css
│ ├── login.css
│
├── js/
│ ├── firebase-config.js
│ ├── login.js
│ ├── register.js
│ ├── forgot-password.js
│ ├── student.js
│ ├── student_recover.js
│ ├── teacher.js
│ ├── teacher_recover.js
│ ├── admin.js
│ ├── all_teacher.js
│ ├── pending_teacher.js
│ ├── pending_student.js
│ ├── nointernet.js
│ └── log.js

---

## 🚀 How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/Sarika191/Teacher_student_appointment_portal.git

