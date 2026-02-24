const API_URL = "https://tasksphere-backend-zrls.onrender.com/api/tasks/dashboard";

const token = localStorage.getItem("token");

console.log("TOKEN IN DASHBOARD:", token);

if (!token) {
    alert("No token found. Please login.");
    window.location.href = "index.html";
}

async function loadDashboard() {

    try {

        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        document.getElementById("totalTasks").innerText = data.total;
        document.getElementById("completedTasks").innerText = data.completed;
        document.getElementById("pendingTasks").innerText = data.pending;
        document.getElementById("todayTasks").innerText = data.today;

        const recentContainer = document.getElementById("recentList");

        if (recentContainer) {
            recentContainer.innerHTML = "";

            data.recent.forEach(task => {
                const div = document.createElement("div");
                div.classList.add("recent-item");

                div.innerHTML = `
                    <span>${task.title}</span>
                    <span>${new Date(task.created_at).toLocaleDateString()}</span>
                `;

                recentContainer.appendChild(div);
            });
        }

    } catch (error) {
        console.log("Full Error:- ", error);
        alert("Something went wrong");
    }
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    });
}

document.addEventListener("DOMContentLoaded", function () {

    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

});

loadDashboard();