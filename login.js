import { auth, db } from './firebase-config.js';
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";
import { logAction } from './log.js';

document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginButton = event.target.querySelector('button[type="submit"]');
    loginButton.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role?.trim().toLowerCase();
            const status = userData.status?.trim().toLowerCase();

            if (!role) {
                alert("Role not set for this user.");
                logAction("ROLE_NOT_SET", `User ${email} logged in but role missing.`);
                return;
            }

            if (role === 'teacher' && status === 'pending') {
                alert("Your account is not yet approved by Admin.");
                logAction("TEACHER_NOT_APPROVED", `Pending teacher ${email} tried to login.`);
                return;
            }

            logAction("LOGIN_SUCCESS", `User ${email} logged in successfully as ${role}.`);
            alert(`Login successful! Redirecting as ${role}...`);

            setTimeout(() => {
                if (role === 'student') window.location.href = 'student.html';
                else if (role === 'teacher') window.location.href = 'teacher.html';
                else if (role === 'admin') window.location.href = 'admin.html';
                else {
                    alert("Unknown role. Please contact support.");
                    logAction("UNKNOWN_ROLE", `Unknown role '${role}' for ${email}`);
                }
            }, 1000);

        } else {
            logAction("ROLE_NOT_FOUND", `User document not found for ${email}.`);
            const proceed = confirm("Your account is removed by Admin.\nDo you want to request recovery?");
            if (proceed) {
                window.location.href = "teacher_recover.html";
            }
        }

    } catch (error) {
        logAction("LOGIN_FAILED", `Login failed for ${email}: ${error.message}`);
        alert("Not Registered!! ");
    } finally {
        loginButton.disabled = false;
    }
});
