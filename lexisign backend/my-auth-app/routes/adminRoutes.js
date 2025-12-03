const express = require("express");
const authRoutes = require("./authRoutes");
const authenticateToken = authRoutes.authenticateToken;

const router = express.Router();

// Protected Admin Route (example)
router.get("/dashboard", authenticateToken, (req, res) => {
  res.json({ 
    message: "Admin dashboard",
    user: req.user.username
  });
});

module.exports = router;
