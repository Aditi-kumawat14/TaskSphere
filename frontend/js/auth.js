// ==============================
// SELECT ELEMENTS
// ==============================

const container = document.getElementById("container");
const switches = document.querySelectorAll(".switch");

const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const registerName = document.getElementById("registerName");
const registerEmail = document.getElementById("registerEmail");
const registerPassword = document.getElementById("registerPassword");

// ✅ Backend API
const API_URL = "https://tasksphere-backend-zrls.onrender.com";


// ==============================
// SWITCH LOGIN / REGISTER UI
// ==============================

switches.forEach(btn => {
    btn.addEventListener("click", () => {
        container.classList.toggle("active");
    });
});


// ==============================
// REGISTER
// ==============================

if (registerBtn) {
    registerBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const full_name = registerName.value.trim();
        const email = registerEmail.value.trim();
        const password = registerPassword.value.trim();

        if (!full_name || !email || !password) {
            alert("All fields are required!");
            return;
        }

        try {

            // ✅ FIXED ROUTE
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ full_name, email, password })
            });

            const data = await response.json();

            console.log("REGISTER RESPONSE:", data);

            if (!response.ok) {
                alert(data.message || "Registration failed");
                return;
            }

            alert("Registration successful! Please login.");

            // Switch to login
            container.classList.remove("active");

            // Clear fields
            registerName.value = "";
            registerEmail.value = "";
            registerPassword.value = "";

        } catch (error) {
            alert("Server error. Please try again.");
            console.error(error);
        }
    });
}


// ==============================
// LOGIN
// ==============================

if (loginBtn) {
    loginBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        const email = loginEmail.value.trim();
        const password = loginPassword.value.trim();

        if (!email || !password) {
            alert("Email and Password required!");
            return;
        }

        try {

            // ✅ FIXED ROUTE
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            console.log("LOGIN RESPONSE:", data);

            if (!response.ok) {
                alert(data.message || "Login failed");
                return;
            }

            // ✅ Save token
            localStorage.setItem("token", data.token);

            console.log("TOKEN SAVED:", localStorage.getItem("token"));

            alert("Login successful!");

            // Redirect
            window.location.href = "dashboard.html";

        } catch (error) {
            alert("Server error. Please try again.");
            console.error(error);
        }
    });
}


// ==============================
// REMOVE AUTO REDIRECT (IMPORTANT)
// ==============================

// ❌ DO NOT auto redirect here
// const token = localStorage.getItem("token");
// if (token) {
//     window.location.href = "dashboard.html";
// }