require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const corsOptions = {
    origin: [
        "https://tasksphereproject.netlify.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const profileRoutes = require("./routes/profileRoutes");

app.use("/api/profile", profileRoutes);