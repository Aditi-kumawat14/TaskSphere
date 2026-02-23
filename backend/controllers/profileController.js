const db = require("../config/db");
const bcrypt = require("bcryptjs");
const transporter = require("../config/mailer");

/* ================= GET PROFILE ================= */
exports.getProfile = async (req, res) => {

    const userId = req.userId;

    try {

        const [rows] = await db.promise().query(
            "SELECT id, full_name, email, email_notifications, theme, created_at, last_login, password_changed_at FROM users WHERE id=?",
            [userId]
        );

        res.json(rows[0]);

    } catch (err) {
        res.status(500).json({ message: "Failed to load profile" });
    }
};


/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {

    const userId = req.userId;
    const { full_name } = req.body;

    try {

        await db.promise().query(
            "UPDATE users SET full_name=? WHERE id=?",
            [full_name, userId]
        );

        res.json({ message: "Profile updated" });

    } catch (err) {
        res.status(500).json({ message: "Update failed" });
    }
};


/* ================= CHANGE PASSWORD ================= */

exports.changePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { oldPassword, newPassword } = req.body;

        // 1️⃣ Get current password
        const [rows] = await db.promise().query(
            "SELECT password FROM users WHERE id = ?",
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const user = rows[0];

        // 2️⃣ Compare old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Old password is incorrect" });
        }

        // 3️⃣ Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 4️⃣ Update password + password_changed_at
        await db.promise().query(
            "UPDATE users SET password=?, password_changed_at=NOW() WHERE id=?",
            [hashedPassword, userId]
        );

        res.json({ message: "Password updated successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Password change failed" });
    }
};


/* ================= TOGGLE EMAIL NOTIFICATIONS ================= */
exports.toggleNotifications = async (req, res) => {

    const userId = req.userId;
    const { enabled } = req.body;

    try {

        await db.promise().query(
            "UPDATE users SET email_notifications=? WHERE id=?",
            [enabled, userId]
        );

        if (enabled) {

            const [rows] = await db.promise().query(
                "SELECT full_name,email FROM users WHERE id=?",
                [userId]
            );

            const user = rows[0];

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Notifications Enabled - TaskFlow",
                html: `
                    <h2>Hello ${user.full_name}</h2>
                    <p>Email notifications are now enabled.</p>
                `
            });
        }

        res.json({ message: "Notification updated" });

    } catch (err) {
        res.status(500).json({ message: "Notification update failed" });
    }
};


/* ================= DELETE ACCOUNT ================= */


exports.deleteAccount = async (req, res) => {
    try {
        const userId = req.userId; // or req.user.id (depending on your middleware)

        await db.promise().query(
            "DELETE FROM users WHERE id = ?",
            [userId]
        );

        res.json({ message: "Account deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to delete account" });
    }
};