const express = require("express");
const router = express.Router();

const {
    getTasks,
    createTask,
    deleteTask,
    updateTask,
    toggleStatus,
    getDashboardStats,
    getInsights   // ✅ ADD THIS
} = require("../controllers/taskController");

const {
    setFocus,
    removeFocus,
    getTasksByDate,
    getMovedFromYesterday,
    saveNote,
    getNote
} = require("../controllers/taskController");

const verifyToken = require("../middleware/authMiddleware");

// Dashboard
router.get("/dashboard", verifyToken, getDashboardStats);

// Get all tasks
router.get("/", verifyToken, getTasks);

// Create
router.post("/", verifyToken, createTask);

// Delete
router.delete("/:id", verifyToken, deleteTask);

// Update
router.put("/:id", verifyToken, updateTask);

// Toggle status
router.patch("/:id/status", verifyToken, toggleStatus);

router.get("/by-date", verifyToken, getTasksByDate);

router.patch("/:id/set-focus", verifyToken, setFocus);
router.patch("/:id/remove-focus", verifyToken, removeFocus);
router.get("/by-date", verifyToken, getTasksByDate);
router.get("/moved-from-yesterday", verifyToken, getMovedFromYesterday);
router.post("/notes", verifyToken, saveNote);
router.get("/notes", verifyToken, getNote);

router.get("/insights", verifyToken, getInsights);

module.exports = router;