const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const requireAdminRole = require("../middleware/requireAdminRole");
const admin = require("../controllers/adminController");

router.get("/users", authenticateToken, requireAdminRole, admin.getAllUsers);
router.put("/lock/:id", authenticateToken, requireAdminRole, admin.lockUser);
router.put("/unlock/:id", authenticateToken, requireAdminRole, admin.unlockUser);
router.put("/force-reset/:id", authenticateToken, requireAdminRole, admin.forcePasswordReset);

module.exports = router;
