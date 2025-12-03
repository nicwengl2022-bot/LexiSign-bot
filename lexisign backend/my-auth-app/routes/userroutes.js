const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/authenticateToken");
const { getProfile } = require("../controllers/userController");

router.get("/profile", authenticateToken, getProfile);

module.exports = router;
