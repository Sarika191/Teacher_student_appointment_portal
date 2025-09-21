# 🧑‍🏫 Teacher-Student Appointment System

A secure and user-friendly web application that allows students to book appointments with teachers in real-time. Built with **Firebase** for authentication and database management, this project streamlines the communication process in an academic setting.
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
📦 Student-Teacher Appointment System
├── index.html # Homepage / Entry point
├── login.html # User login page
├── register.html # New user registration
├── forgot-password.html # Password reset
├── student.html # Student dashboard
├── teacher.html # Teacher dashboard
├── student_recover.html # Student account recovery
├── teacher_recover.html # Teacher account recovery
├── admin.html # Admin dashboard

📂 css/
├── base.css # Global styles
├── login.css # Login & auth styling

📂 js/
├── firebase-config.js # Firebase configuration
├── login.js # Login functionality
├── register.js # User registration
├── forgot-password.js # Password reset logic
├── student.js # Student dashboard logic
├── student_recover.js # Student recovery flow
├── teacher.js # Teacher dashboard logic
├── teacher_recover.js # Teacher recovery flow
├── admin.js # Admin dashboard logic
├── all_teacher.js # Admin view: all teachers
├── pending_teacher.js # Admin view: pending teachers
├── pending_student.js # Admin view: pending students
├── nointernet.js # No internet handling
└── log.js # Logging utility

---
Live👉 https://teacher-student-portal.netlify.app/

## 🚀 How to Run Locally

1. Clone the repository:
```bash
git clone https://github.com/Sarika191/Teacher_student_appointment_portal.git

