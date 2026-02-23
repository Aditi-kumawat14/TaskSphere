const API_URL = "https://tasksphere-backend-zrls.onrender.com";
const token = localStorage.getItem("token");

console.log("TOKEN IN TASKS:", token);

if (!token) {
    alert("Please login first");
    window.location.href = "index.html";
}

// ================= ELEMENTS =================

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter");
const addTaskBtn = document.getElementById("addTaskBtn");

const modal = document.getElementById("taskModal");
const saveTaskBtn = document.getElementById("saveTaskBtn");

let tasks = [];
let currentFilter = "all";
let editId = null;

// ================= LOAD TASKS =================

async function loadTasks() {
    try {
        const response = await fetch(API_URL, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.status === 401) {
            alert("Session expired");
            localStorage.removeItem("token");
            window.location.href = "index.html";
            return;
        }

        const data = await response.json();
        tasks = data;
        renderTasks();

    } catch (error) {
        console.log(error);
        alert("Error loading tasks");
    }
}

// ================= RENDER =================

function renderTasks() {

    let filtered = [...tasks];

    // FILTER
    if (currentFilter !== "all") {
        filtered = filtered.filter(t => t.status === currentFilter);
    }

    // ✅ SEARCH (FIXED)
    const search = searchInput.value.toLowerCase();
    if (search) {
        filtered = filtered.filter(t =>
            (t.title && t.title.toLowerCase().includes(search)) ||
            (t.description && t.description.toLowerCase().includes(search)) ||
            (t.category && t.category.toLowerCase().includes(search))
        );
    }

    taskList.innerHTML = "";

    filtered.forEach(task => {

        const row = document.createElement("div");
        row.classList.add("table-row");

        row.innerHTML = `
            <span>
                <input type="checkbox" 
                    ${task.status === "completed" ? "checked" : ""} 
                    onchange="toggleStatus(${task.id})">
            </span>

            <span>
                <strong style="${task.status === 'completed' ? 'text-decoration: line-through;' : ''}">
                    ${task.title}
                </strong><br>
                <small>${task.description || ""}</small>
            </span>

            <span>
                <span class="badge ${task.status}">
                    ${task.category || "Work"}
                </span>
            </span>

            <span>
                ${task.due_date 
                    ? new Date(task.due_date).toLocaleDateString() 
                    : "-"}
            </span>

            <span>
                <button onclick="editTask(${task.id})">✏️</button>
                <button onclick="deleteTask(${task.id})">🗑️</button>
            </span>
        `;

        taskList.appendChild(row);
    });
}

// ================= FILTER =================

filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// ================= SEARCH =================

searchInput.addEventListener("input", renderTasks);

// ================= DELETE =================

async function deleteTask(id) {
    if (!confirm("Delete this task?")) return;

    try {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        loadTasks();

    } catch (error) {
        console.log(error);
        alert("Delete failed");
    }
}

// ================= EDIT =================

window.editTask = function (id) {

    const task = tasks.find(t => t.id === id);
    if (!task) return;

    editId = id;

    document.getElementById("taskTitle").value = task.title;
    document.getElementById("taskDesc").value = task.description || "";
    document.getElementById("taskCategory").value = task.category || "";
    document.getElementById("taskDate").value =
        task.due_date ? task.due_date.split("T")[0] : "";

    document.querySelector(".modal-content h2").innerText = "Edit Task";

    openModal();
};

// ================= MODAL =================

window.openModal = function () {
    modal.style.display = "flex";
};

window.closeModal = function () {
    modal.style.display = "none";

    editId = null;

    document.querySelector(".modal-content h2").innerText = "Add Task";

    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDesc").value = "";
    document.getElementById("taskCategory").value = "";
    document.getElementById("taskDate").value = "";
};

// OPEN MODAL
addTaskBtn.addEventListener("click", () => {
    editId = null;
    document.querySelector(".modal-content h2").innerText = "Add Task";
    openModal();
});

// ================= SAVE =================

saveTaskBtn.addEventListener("click", async () => {

    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDesc").value;
    const category = document.getElementById("taskCategory").value;
    const due_date = document.getElementById("taskDate").value;

    if (!title) {
        alert("Title required");
        return;
    }

    try {

        let url = API_URL;
        let method = "POST";

        if (editId) {
            url = `${API_URL}/${editId}`;
            method = "PUT";
        }

        await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                title,
                description,
                category,
                due_date,
                status: "pending"
            })
        });

        closeModal();
        loadTasks();

    } catch (error) {
        console.log(error);
        alert("Save failed");
    }
});

// ================= TOGGLE STATUS =================

async function toggleStatus(id) {

    try {
        await fetch(`${API_URL}/${id}/status`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        loadTasks();

    } catch (error) {
        console.log(error);
        alert("Status update failed");
    }
}

// ================= DARK MODE LOAD =================
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});
// ================= INIT =================

loadTasks();
