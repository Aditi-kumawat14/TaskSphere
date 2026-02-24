const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
     ssl: {
        ca: fs.readFileSync(__dirname + "/ca.pem")
    }
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("Connected to Aiven MySQL ✅");
});

module.exports = db;