const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const profileController = require("../controllers/profileController");

router.get("/", authMiddleware, profileController.getProfile);
router.put("/", authMiddleware, profileController.updateProfile);
router.put("/password", authMiddleware, profileController.changePassword);
router.put("/notifications", authMiddleware, profileController.toggleNotifications);
router.delete("/", authMiddleware, profileController.deleteAccount);



module.exports = router;