const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

    const authHeader = req.header("Authorization");

    // ✅ ADD HERE
    console.log("AUTH HEADER:", authHeader);

    if (!authHeader) {
        return res.status(401).json({ message: "No token, access denied" });
    }

    // ✅ REMOVE "Bearer "
    const token = authHeader.split(" ")[1];

    // ✅ ADD HERE
    console.log("TOKEN AFTER SPLIT:", token);

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ ADD HERE
        console.log("DECODED TOKEN:", decoded);

        req.userId = decoded.id;

        next();

    } catch (error) {

        // ✅ ADD HERE
        console.log("JWT ERROR:", error.message);

        res.status(401).json({ message: "Invalid token" });
    }
};
