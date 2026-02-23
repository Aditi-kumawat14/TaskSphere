document.addEventListener("DOMContentLoaded", function(){

    const darkToggle = document.getElementById("darkModeToggle");

    // Load saved theme
    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
        darkToggle.checked = true;
    }

    darkToggle.addEventListener("change", function(){
        if(this.checked){
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme","dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme","light");
        }
    });

});

const notificationToggle = document.getElementById("emailNotificationToggle");

notificationToggle.addEventListener("change", async function(){

    const token = localStorage.getItem("token");

    await fetch("http://localhost:5000/api/profile/notifications", {
        method: "PUT",
        headers: {
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify({
            enabled: this.checked
        })
    });

});

document.addEventListener("DOMContentLoaded", async function(){

    const token = localStorage.getItem("token");

    if(!token){
        window.location.href = "index.html";
        return;
    }

    /* ================= LOAD PROFILE ================= */

    try {

        const profileRes = await fetch("http://localhost:5000/api/profile", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const profileData = await profileRes.json();

        document.getElementById("profileName").innerText = profileData.full_name;
        document.getElementById("profileEmail").innerText = profileData.email;
        document.getElementById("topProfileName").innerText = profileData.full_name;

        document.getElementById("emailNotificationToggle").checked =
        profileData.email_notifications === 1;

        // Avatar initials
        const initials = profileData.full_name
            .split(" ")
            .map(n => n[0])
            .join("");
        document.getElementById("profileAvatar").innerText = initials;

        // Joined Date
        if(profileData.created_at){
            const joined = new Date(profileData.created_at);
            document.getElementById("joinedDate").innerText =
                joined.toLocaleString("default", { month: "short", year: "numeric" });
        }
        if(profileData.last_login){
            const loginDate = new Date(profileData.last_login);
            document.getElementById("lastLogin").innerText =
                loginDate.toLocaleDateString();
        }

        if(profileData.password_changed_at){
            const passDate = new Date(profileData.password_changed_at);
            document.getElementById("passwordChanged").innerText =
                passDate.toLocaleDateString();
        }

    } catch(err){
        console.log("Profile load error:", err);
    }


    /* ================= LOAD TASKS ================= */

    try {

        const taskRes = await fetch("http://localhost:5000/api/tasks", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const tasks = await taskRes.json();

        document.getElementById("tasksCreated").innerText = tasks.length;

        const completed = tasks.filter(t => t.status === "completed").length;
        document.getElementById("tasksCompleted").innerText = completed;

    } catch(err){
        console.log("Tasks load error:", err);
    }


    /* ================= LOAD STREAK ================= */

    try {

        const insightRes = await fetch("http://localhost:5000/api/tasks/insights", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const insightData = await insightRes.json();

        document.getElementById("currentStreak").innerText =
            insightData.currentStreak + " Days";

    } catch(err){
        console.log("Insights load error:", err);
    }


    /* ================= DARK MODE ================= */

    const darkToggle = document.getElementById("darkModeToggle");

    if(localStorage.getItem("theme") === "dark"){
        document.body.classList.add("dark-mode");
        darkToggle.checked = true;
    }

    darkToggle.addEventListener("change", function(){
        if(this.checked){
            document.body.classList.add("dark-mode");
            localStorage.setItem("theme","dark");
        } else {
            document.body.classList.remove("dark-mode");
            localStorage.setItem("theme","light");
        }
    });


    /* ================= EMAIL NOTIFICATION ================= */

    const notificationToggle = document.getElementById("emailNotificationToggle");

    notificationToggle.addEventListener("change", async function(){

        await fetch("http://localhost:5000/api/profile/notifications", {
            method: "PUT",
            headers: {
                "Content-Type":"application/json",
                "Authorization":`Bearer ${token}`
            },
            body: JSON.stringify({
                enabled: this.checked
            })
        });

    });

});



const editModal = document.getElementById("editModal");
const passwordModal = document.getElementById("passwordModal");

document.getElementById("editProfileBtn").addEventListener("click", () => {
    editModal.style.display = "flex";
});

document.getElementById("changePasswordBtn").addEventListener("click", () => {
    passwordModal.style.display = "flex";
});

document.getElementById("cancelEdit").addEventListener("click", () => {
    editModal.style.display = "none";
});

document.getElementById("cancelPassword").addEventListener("click", () => {
    passwordModal.style.display = "none";
});

document.getElementById("saveEdit").addEventListener("click", async () => {

    const newName = document.getElementById("editNameInput").value;
    const token = localStorage.getItem("token");

    if(!newName) return;

    await fetch("http://localhost:5000/api/profile", {
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify({ full_name:newName })
    });

    editModal.style.display = "none";
    location.reload();
});

document.getElementById("savePassword").addEventListener("click", async () => {

    const oldPassword = document.getElementById("oldPasswordInput").value;
    const newPassword = document.getElementById("newPasswordInput").value;
    const token = localStorage.getItem("token");

    if(!oldPassword || !newPassword) return;

    const res = await fetch("http://localhost:5000/api/profile/password", {
        method:"PUT",
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${token}`
        },
        body: JSON.stringify({ oldPassword, newPassword })
    });

    const data = await res.json();
    alert(data.message);

    passwordModal.style.display = "none";
});

document.getElementById("profileLogoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "index.html";
});

const deleteBtn = document.querySelector(".btn-del");
const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

deleteBtn.addEventListener("click", () => {
    deleteModal.classList.remove("hidden");
});

cancelDelete.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
});

confirmDelete.addEventListener("click", async () => {

    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/profile", {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if(res.ok){
        localStorage.removeItem("token");
        window.location.href = "index.html";
    } else {
        alert("Failed to delete account");
    }
});
