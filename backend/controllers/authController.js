const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ================= REGISTER =================

exports.registerUser = async (req, res) => {

    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
        return res.status(400).json({ message: "All fields required" });
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {

        if (results.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)",
            [full_name, email, hashedPassword],
            (err) => {

                if (err) {
                    return res.status(500).json({ message: "Server error" });
                }

                res.status(201).json({ message: "User registered successfully" });
            }
        );
    });
};


// ================= LOGIN =================

exports.loginUser = (req, res) => {

    const { email, password } = req.body;

    db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {

        if (results.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        await db.promise().query(
            "UPDATE users SET last_login = NOW() WHERE id = ?",
            [user.id]
        );

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token });
    });
};


