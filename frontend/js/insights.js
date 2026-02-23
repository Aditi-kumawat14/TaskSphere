const API_URL = "http://localhost:5000/api/tasks";
const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "index.html";
}

/* ================= LOAD INSIGHTS ================= */

async function loadInsights() {

    try {

        const response = await fetch(`${API_URL}/insights`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();

        // TOP CARDS
        document.getElementById("insightsTotalCompleted").innerText = data.totalCompleted;
        document.getElementById("insightsCompletionRate").innerText = data.completionRate + "%";
        document.getElementById("insightsCurrentStreak").innerText = data.currentStreak;
        document.getElementById("insightsBestDay").innerText = data.bestDay;

        renderWeeklyChart(data.weeklyData);
        renderMonthlyChart(data.monthlyData);

    } catch (err) {
        console.log(err);
    }
}

/* ================= WEEKLY CHART ================= */

function renderWeeklyChart(weeklyData) {

    const isDark = document.body.classList.contains("dark-mode");

    new Chart(document.getElementById("weeklyChart"), {
        type: "bar",
        data: {
            labels: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
            datasets: [{
                label: "Completed Tasks",
                data: weeklyData,
                backgroundColor: "#8475BD"
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: isDark ? "#ffffff" : "#000000"
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: isDark ? "#ffffff" : "#000000" },
                    grid: { color: isDark ? "#3a3d55" : "#eee" }
                },
                y: {
                    ticks: { color: isDark ? "#ffffff" : "#000000" },
                    grid: { color: isDark ? "#3a3d55" : "#eee" }
                }
            }
        }
    });
}

/* ================= MONTHLY CHART ================= */

function renderMonthlyChart(monthlyData) {

    const isDark = document.body.classList.contains("dark-mode");

    new Chart(document.getElementById("monthlyChart"), {
        type: "line",
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: "Tasks Completed",
                data: monthlyData.values,
                borderColor: "#8475BD",
                backgroundColor: "rgba(132,117,189,0.2)",
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: {
                    labels: {
                        color: isDark ? "#ffffff" : "#000000"
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: isDark ? "#ffffff" : "#000000"
                    },
                    grid: {
                        color: isDark ? "#3a3d55" : "#eee"
                    }
                },
                y: {
                    ticks: {
                        color: isDark ? "#ffffff" : "#000000"
                    },
                    grid: {
                        color: isDark ? "#3a3d55" : "#eee"
                    }
                }
            }
        }
    });
}

// ================= DARK MODE LOAD =================
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
});

loadInsights();