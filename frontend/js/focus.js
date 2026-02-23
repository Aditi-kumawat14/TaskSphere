const API_URL = "http://localhost:5000/api";
const token = localStorage.getItem("token");

if (!token) {
    alert("Please login first");
    window.location.href = "index.html";
}

/* ================= ELEMENTS ================= */

const calendarContainer = document.getElementById("focusCalendarDates");
const monthYear = document.getElementById("focusMonthYear");
const prevBtn = document.getElementById("prevMonthBtn");
const nextBtn = document.getElementById("nextMonthBtn");

const mainFocusContainer = document.getElementById("mainFocusTask");
const secondaryContainer = document.getElementById("secondaryTasksList");

const noteInput = document.getElementById("dailyNoteInput");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notePreview = document.querySelector(".saved-note-preview");

let currentDate = new Date();
let selectedDate = formatDate(new Date());

/* ================= DATE FORMAT ================= */

function formatDate(dateObj) {
    return `${dateObj.getFullYear()}-${String(dateObj.getMonth()+1).padStart(2,'0')}-${String(dateObj.getDate()).padStart(2,'0')}`;
}

/* ================= CALENDAR ================= */

function renderCalendar() {

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January","February","March","April","May","June",
        "July","August","September","October","November","December"
    ];

    monthYear.innerText = `${monthNames[month]} ${year}`;
    calendarContainer.innerHTML = "";

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        calendarContainer.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= totalDays; day++) {

        const dateDiv = document.createElement("div");
        const dateObj = new Date(year, month, day);
        const formatted = formatDate(dateObj);

        dateDiv.innerText = day;

        if (formatted === selectedDate) {
            dateDiv.classList.add("active");
        }

        dateDiv.addEventListener("click", () => {
            selectedDate = formatted;
            renderCalendar();
            loadFocusData();
        });

        calendarContainer.appendChild(dateDiv);
    }
}

/* ================= LOAD DATA ================= */

async function loadFocusData() {
    await loadTasksByDate(selectedDate);
    await loadDailyNote(selectedDate);
}

/* ================= LOAD TASKS ================= */

async function loadTasksByDate(date) {

    try {
        const response = await fetch(`${API_URL}/tasks/by-date?date=${date}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const tasks = await response.json();
        renderTasks(tasks);

    } catch (err) {
        console.log(err);
    }
}

/* ================= RENDER TASKS ================= */

function renderTasks(tasks) {

    mainFocusContainer.innerHTML = "";
    secondaryContainer.innerHTML = "";

    const mainTask = tasks.find(t => t.is_focus === 1);
    const secondaryTasks = tasks.filter(t => t.is_focus !== 1);

    if (mainTask) {
        mainFocusContainer.innerHTML = `
            <div class="focus-task-item">
                <span>${mainTask.title}</span>
                <button class="remove-btn" onclick="removeFocus(${mainTask.id})">
                    Remove
                </button>
            </div>
        `;
    } else {
        mainFocusContainer.innerHTML = "<p>No main focus selected</p>";
    }

    if (!secondaryTasks.length) {
        secondaryContainer.innerHTML = "<p>No secondary tasks</p>";
        return;
    }

    secondaryTasks.forEach(task => {

        const div = document.createElement("div");
        div.classList.add("focus-task-item");

        div.innerHTML = `
            <span>${task.title}</span>
            <button class="focus-btn" onclick="setAsFocus(${task.id})">
                Set Focus
            </button>
        `;

        secondaryContainer.appendChild(div);
    });
}

/* ================= SET FOCUS ================= */

async function setAsFocus(taskId) {

    await fetch(`${API_URL}/tasks/${taskId}/set-focus`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
    });

    loadFocusData();
}

/* ================= REMOVE FOCUS ================= */

async function removeFocus(taskId) {

    await fetch(`${API_URL}/tasks/${taskId}/remove-focus`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
    });

    loadFocusData();
}

/* ================= DAILY NOTES ================= */

async function loadDailyNote(date) {

    try {

        const response = await fetch(`${API_URL}/tasks/notes?date=${date}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const notes = await response.json();

        notePreview.innerHTML = "";

        if (!notes.length) return;

        notes.forEach(note => {

            const div = document.createElement("div");
            div.classList.add("note-box");
            div.innerText = note.note_text;

            notePreview.appendChild(div);
        });

    } catch (err) {
        console.log(err);
    }
}

saveNoteBtn.addEventListener("click", async () => {

    const noteText = noteInput.value.trim();

    if (!noteText) return;

    await fetch(`${API_URL}/tasks/notes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            date: selectedDate,
            note: noteText
        })
    });

    const newNote = document.createElement("div");
    newNote.classList.add("note-box");
    newNote.innerText = noteText;

    notePreview.prepend(newNote);
    noteInput.value = "";
});

/* ================= MONTH NAVIGATION ================= */

prevBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// ================= DARK MODE LOAD =================
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});

/* ================= INIT ================= */

function init() {
    renderCalendar();
    loadFocusData();
}

init();