const db = require("../config/db");

exports.getDashboardStats = async (req, res) => {

    const userId = req.userId;
    console.log("USER ID:", req.userId);


    try {

        // Total Tasks
        const [total] = await db.promise().query(
            "SELECT COUNT(*) as total FROM tasks WHERE user_id = ?",
            [userId]
        );

        // Completed
        const [completed] = await db.promise().query(
            "SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND status = 'completed'",
            [userId]
        );

        // Pending
        const [pending] = await db.promise().query(
            "SELECT COUNT(*) as pending FROM tasks WHERE user_id = ? AND status = 'pending'",
            [userId]
        );

        // Today's Tasks
        const [today] = await db.promise().query(
            "SELECT COUNT(*) as today FROM tasks WHERE user_id = ? AND DATE(created_at) = CURDATE()",
            [userId]
        );

        // Recent 5 Tasks
        const [recent] = await db.promise().query(
            "SELECT title, created_at FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT 5",
            [userId]
        );

        res.json({
            total: total[0].total,
            completed: completed[0].completed,
            pending: pending[0].pending,
            today: today[0].today,
            recent
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

// ================= UPDATE TASK =================
exports.updateTask = async (req, res) => {

    const { id } = req.params;
    const { title, description, category, due_date, status } = req.body;
    const userId = req.userId;

    try {

        await db.promise().query(
            `UPDATE tasks 
             SET title=?, description=?, category=?, due_date=?, status=? 
             WHERE id=? AND user_id=?`,
            [title, description, category, due_date, status, id, userId]
        );

        res.json({ message: "Task updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Update failed" });
    }
};

// ================= GET TASKS =================
exports.getTasks = async (req, res) => {

    const userId = req.userId;

    try {
        const [tasks] = await db.promise().query(
            "SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
            [userId]
        );

        res.json(tasks);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
};

// ================= CREATE TASK =================
exports.createTask = async (req, res) => {

    const { title, description, category, due_date } = req.body;
    const userId = req.userId;

    if (!title) {
        return res.status(400).json({ message: "Title required" });
    }

    try {

        await db.promise().query(
            "INSERT INTO tasks (title, description, category, due_date, user_id, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            [title, description, category, due_date, userId]
        );

        res.json({ message: "Task created" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating task" });
    }
};

// ================= DELETE TASK =================
exports.deleteTask = async (req, res) => {

    const { id } = req.params;
    const userId = req.userId;

    try {

        await db.promise().query(
            "DELETE FROM tasks WHERE id = ? AND user_id = ?",
            [id, userId]
        );

        res.json({ message: "Task deleted" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting task" });
    }
};

// ================= TOGGLE STATUS =================
exports.toggleStatus = async (req, res) => {

    const { id } = req.params;
    const userId = req.userId;

    try {

        await db.promise().query(
            `UPDATE tasks 
             SET status = IF(status='pending','completed','pending'),
                 completed_at = IF(status='pending', NOW(), NULL)
             WHERE id=? AND user_id=?`,
            [id, userId]
        );

        res.json({ message: "Status updated" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Status update failed" });
    }
};

// ================= GET TASKS BY DATE =================
exports.getTasksByDate = async (req, res) => {

    const { date } = req.query;
    const userId = req.userId;

    try {

        const [tasks] = await db.promise().query(
            "SELECT * FROM tasks WHERE user_id = ? AND due_date = ?",
            [userId, date]
        );

        res.json(tasks);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error fetching tasks" });
    }
};


//=======================Set Main Focus===========

exports.setFocus = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {

        // Remove previous focus for that date
        await db.promise().query(
            `UPDATE tasks 
             SET is_focus = 0 
             WHERE user_id = ?`,
            [userId]
        );

        // Set new focus
        await db.promise().query(
            `UPDATE tasks 
             SET is_focus = 1 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ message: "Main focus updated" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to set focus" });
    }
};

//============================Remove Focus=============
exports.removeFocus = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    try {

        await db.promise().query(
            `UPDATE tasks 
             SET is_focus = 0 
             WHERE id = ? AND user_id = ?`,
            [id, userId]
        );

        res.json({ message: "Focus removed" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to remove focus" });
    }
};

//=============Moved From Yesterday===============

exports.getMovedFromYesterday = async (req, res) => {

    const { date } = req.query;
    const userId = req.userId;

    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);

    const formattedYesterday = yesterday.toISOString().split("T")[0];

    try {

        const [tasks] = await db.promise().query(
            `SELECT * FROM tasks 
             WHERE user_id = ? 
             AND due_date = ? 
             AND status = 'pending'`,
            [userId, formattedYesterday]
        );

        res.json(tasks);

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to load moved tasks" });
    }
};

//===============Save Notes =================

exports.saveNote = async (req, res) => {

    const { date, note } = req.body;
    const userId = req.userId;

    try {

        await db.promise().query(
            `INSERT INTO notes (user_id, note_date, note_text)
             VALUES (?, ?, ?)`,
            [userId, date, note]
        );

        res.json({ message: "Note saved" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Note save failed" });
    }
};

//============= Get Note===============

exports.getNote = async (req, res) => {

    const { date } = req.query;
    const userId = req.userId;

    try {

        const [rows] = await db.promise().query(
            `SELECT id, note_text 
             FROM notes 
             WHERE user_id=? AND note_date=? 
             ORDER BY id DESC`,
            [userId, date]
        );

        res.json(rows);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to fetch notes" });
    }
};

// ================= GET INSIGHTS =================
exports.getInsights = async (req, res) => {

    const userId = req.userId;

    try {

        // 🔹 TOTAL TASKS
        const [totalTasksResult] = await db.promise().query(
            "SELECT COUNT(*) as total FROM tasks WHERE user_id = ?",
            [userId]
        );

        const totalTasks = totalTasksResult[0].total;

        // 🔹 COMPLETED TASKS
        const [completedResult] = await db.promise().query(
            "SELECT COUNT(*) as completed FROM tasks WHERE user_id = ? AND status = 'completed'",
            [userId]
        );

        const totalCompleted = completedResult[0].completed;

        // 🔹 COMPLETION RATE
        const completionRate = totalTasks === 0
            ? 0
            : Math.round((totalCompleted / totalTasks) * 100);

        // 🔹 WEEKLY DATA (last 7 days)
        const [weeklyDataResult] = await db.promise().query(
            `SELECT DAYOFWEEK(completed_at) as day, COUNT(*) as count
             FROM tasks
             WHERE user_id = ?
             AND status = 'completed'
             AND completed_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY DAYOFWEEK(completed_at)`,
            [userId]
        );

        let weeklyData = [0,0,0,0,0,0,0]; // Sun-Sat

        weeklyDataResult.forEach(row => {
            weeklyData[row.day - 1] = row.count;
        });

        // 🔹 MONTHLY DATA (current month)
        const [monthlyDataResult] = await db.promise().query(
            `SELECT WEEK(completed_at) as week, COUNT(*) as count
             FROM tasks
             WHERE user_id = ?
             AND status = 'completed'
             AND MONTH(completed_at) = MONTH(CURDATE())
             AND YEAR(completed_at) = YEAR(CURDATE())
             GROUP BY WEEK(completed_at)`,
            [userId]
        );

        let monthlyLabels = [];
        let monthlyValues = [];

        monthlyDataResult.forEach((row, index) => {
            monthlyLabels.push("Week " + (index + 1));
            monthlyValues.push(row.count);
        });

        // 🔹 MOST PRODUCTIVE DAY
        
        const [bestDayResult] = await db.promise().query(
            `SELECT DAYNAME(completed_at) as day, COUNT(*) as count
            FROM tasks
            WHERE user_id = ?
            AND status = 'completed'
            AND completed_at IS NOT NULL
            GROUP BY DAYNAME(completed_at)
            ORDER BY count DESC
            LIMIT 1`,
            [userId]
        );

        const bestDay = bestDayResult.length > 0
            ? bestDayResult[0].day
            : "-";

        // 🔹 CURRENT STREAK
        

        const [streakResult] = await db.promise().query(
            `SELECT DISTINCT DATE(completed_at) as date
            FROM tasks
            WHERE user_id = ?
            AND status = 'completed'
            AND completed_at IS NOT NULL
            ORDER BY date DESC`,
            [userId]
        );

        let currentStreak = 0;

        if (streakResult.length > 0) {

            let today = new Date();
            today.setHours(0,0,0,0);

            let compareDate = new Date(today);

            for (let i = 0; i < streakResult.length; i++) {

                const completedDate = new Date(streakResult[i].date);
                completedDate.setHours(0,0,0,0);

                const diff = (compareDate - completedDate) / (1000 * 60 * 60 * 24);

                if (diff === 0) {
                    currentStreak++;
                    compareDate.setDate(compareDate.getDate() - 1);
                } 
                else if (diff === 1 && currentStreak === 0) {
                    // If no completion today, start from yesterday
                    currentStreak++;
                    compareDate.setDate(compareDate.getDate() - 2);
                } 
                else {
                    break;
                }
            }
        }

        // 🔹 RESPONSE
        res.json({
            totalCompleted,
            completionRate,
            currentStreak,
            bestDay,
            weeklyData,
            monthlyData: {
                labels: monthlyLabels,
                values: monthlyValues
            }
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Insights fetch failed" });
    }
};